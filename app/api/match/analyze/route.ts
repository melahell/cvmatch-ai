import { createSupabaseClient } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getMatchAnalysisPrompt } from "@/lib/ai/prompts";

export const runtime = "nodejs";
export const maxDuration = 60;

// Retry wrapper with exponential backoff
async function callWithRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 10000
): Promise<T> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error: any) {
            const isRateLimit = error.message?.includes("429") || error.message?.includes("quota") || error.message?.includes("Too Many");
            if (isRateLimit && attempt < maxRetries - 1) {
                const delay = baseDelay * Math.pow(2, attempt);
                console.log(`Rate limited, waiting ${delay / 1000}s before retry ${attempt + 2}/${maxRetries}`);
                await new Promise(r => setTimeout(r, delay));
                continue;
            }
            throw error;
        }
    }
    throw new Error("Max retries exceeded");
}

export async function POST(req: Request) {
    const supabase = createSupabaseClient();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: "Configuration serveur manquante." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const flashModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const fallbackModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    let useFallback = false;

    try {
        const body = await req.json();
        const { userId, jobUrl, jobText, fileData, fileName, fileType } = body;

        if (!userId) {
            return NextResponse.json({ error: "Utilisateur non identifié." }, { status: 400 });
        }

        if (!jobUrl && !jobText && !fileData) {
            return NextResponse.json({ error: "Fournissez une URL, un texte ou un fichier." }, { status: 400 });
        }

        // 1. Get User RAG Profile
        const { data: ragData, error: dbError } = await supabase
            .from("rag_metadata")
            .select("completeness_details")
            .eq("user_id", userId)
            .single();

        if (dbError || !ragData?.completeness_details) {
            return NextResponse.json({
                error: "Profil introuvable. Uploadez vos documents dans 'Gérer mon profil'."
            }, { status: 404 });
        }

        let fullJobText = jobText || "";

        // 2A. Extract text from file using Gemini Vision
        if (fileData && !fullJobText) {
            try {
                const base64Data = fileData.split(",")[1];
                const mimeType = fileType || "image/png";

                const extractionPrompt = [
                    { inlineData: { mimeType, data: base64Data } },
                    "Extrais le texte complet de cette offre d'emploi. Retourne uniquement le texte brut."
                ];

                const model = useFallback ? fallbackModel : flashModel;
                const extractResult = await callWithRetry(() => model.generateContent(extractionPrompt));
                fullJobText = extractResult.response.text();

                if (fullJobText.length < 50) {
                    return NextResponse.json({ error: "Fichier illisible. Essayez un texte copié-collé." }, { status: 400 });
                }
            } catch (err: any) {
                console.error("File extraction error:", err.message);
                if (err.message?.includes("429") || err.message?.includes("quota")) {
                    return NextResponse.json({ error: "Service IA surchargé. Réessayez dans 1 minute." }, { status: 503 });
                }
                return NextResponse.json({ error: "Erreur lecture fichier. Essayez un autre format." }, { status: 400 });
            }
        }

        // 2B. Scrape URL if provided
        if (jobUrl && !fullJobText) {
            try {
                const cheerio = await import("cheerio");
                const response = await fetch(jobUrl, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
                        "Accept": "text/html",
                        "Accept-Language": "fr-FR"
                    },
                    redirect: "follow"
                });

                if (!response.ok) {
                    return NextResponse.json({ error: "Site inaccessible. Utilisez 'Texte' ou 'Fichier'." }, { status: 400 });
                }

                const html = await response.text();
                const $ = cheerio.load(html);
                $('script, style, nav, header, footer, aside').remove();

                let content = "";
                for (const sel of ['[class*="description"]', 'article', 'main', '.content', 'body']) {
                    const found = $(sel).text().replace(/\s+/g, ' ').trim();
                    if (found && found.length > content.length) content = found;
                }
                fullJobText = content;

                if (fullJobText.length < 100) {
                    return NextResponse.json({ error: "Contenu insuffisant. Utilisez 'Texte' ou 'Fichier'." }, { status: 400 });
                }
            } catch {
                return NextResponse.json({ error: "URL illisible. Utilisez 'Texte' ou 'Fichier'." }, { status: 400 });
            }
        }

        // 3. Analyze Match with Gemini + fallback
        const prompt = getMatchAnalysisPrompt(ragData.completeness_details, fullJobText);

        const generateWithFallback = async () => {
            const model = useFallback ? fallbackModel : flashModel;
            try {
                return await model.generateContent(prompt);
            } catch (error: any) {
                if (!useFallback && (error.message?.includes("429") || error.message?.includes("quota"))) {
                    useFallback = true;
                    return await fallbackModel.generateContent(prompt);
                }
                throw error;
            }
        };

        let result;
        try {
            result = await callWithRetry(generateWithFallback);
        } catch {
            return NextResponse.json({ error: "Service IA surchargé. Réessayez dans quelques minutes." }, { status: 503 });
        }

        const responseText = result.response.text();
        const jsonString = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

        let matchData;
        try {
            matchData = JSON.parse(jsonString);
        } catch {
            return NextResponse.json({ error: "Erreur d'analyse. Réessayez avec moins de texte." }, { status: 500 });
        }

        // 4. Save to DB
        const { data: insertData } = await supabase
            .from("job_analyses")
            .insert({
                user_id: userId,
                job_url: jobUrl,
                job_description: fullJobText.substring(0, 10000),
                match_score: matchData.match_score,
                match_level: matchData.match_level,
                match_report: matchData,
                strengths: matchData.strengths,
                gaps: matchData.gaps,
                missing_keywords: matchData.missing_keywords,
                decision: "pending"
            })
            .select("id")
            .single();

        return NextResponse.json({
            success: true,
            analysis_id: insertData?.id,
            match: matchData
        });

    } catch (error: any) {
        console.error("Analyze Error:", error);
        return NextResponse.json({ error: "Erreur inattendue. Réessayez." }, { status: 500 });
    }
}
