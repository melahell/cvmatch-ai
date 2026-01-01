
import { createSupabaseClient } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { models } from "@/lib/ai/gemini";
import { JobAnalysis } from "@/types";
import { getMatchAnalysisPrompt } from "@/lib/ai/prompts";

// Edge runtime to mock quickly, but scraping usually needs Node 
// Let's use Node runtime for robustness with potential scraping libraries
export const runtime = "nodejs";

export async function POST(req: Request) {
    const supabase = createSupabaseClient();
    try {
        const { userId, jobUrl, jobText } = await req.json();

        if (!userId || (!jobUrl && !jobText)) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Get User RAG Profile
        const { data: ragData, error: dbError } = await supabase
            .from("rag_metadata")
            .select("completeness_details")
            .eq("user_id", userId)
            .single();

        if (dbError || !ragData?.completeness_details) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        // 2. Get Job Content
        let fullJobText = jobText || "";

        // TODO: Implement Real Scraping. 
        // For POC, if URL is provided, we just assume the user pasted text or we fail gracefully if no text.
        // Ideally we would use Puppeteer/Playwright here.
        if (jobUrl && !jobText) {
            try {
                const cheerio = await import("cheerio");
                const response = await fetch(jobUrl, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8"
                    },
                    redirect: "follow"
                });

                if (!response.ok) {
                    console.error(`URL fetch failed: ${response.status} ${response.statusText}`);
                    return NextResponse.json({
                        error: `Le site a refusé l'accès (erreur ${response.status}). Copiez-collez le texte de l'annonce dans l'onglet "Via Texte".`
                    }, { status: 400 });
                }

                const html = await response.text();
                const $ = cheerio.load(html);

                // Remove scripts, styles, navigation
                $('script, style, nav, header, footer, aside').remove();

                // Try to find job content in common patterns
                let content = "";
                const selectors = [
                    '[class*="job-description"]',
                    '[class*="job-content"]',
                    '[class*="description"]',
                    'article',
                    'main',
                    '.content',
                    '#content'
                ];

                for (const sel of selectors) {
                    const found = $(sel).text().trim();
                    if (found && found.length > content.length) {
                        content = found;
                    }
                }

                // Fallback to body
                if (content.length < 100) {
                    content = $('body').text().replace(/\s+/g, ' ').trim();
                }

                fullJobText = content;

                if (fullJobText.length < 50) {
                    console.error("Content too short:", fullJobText.substring(0, 200));
                    return NextResponse.json({
                        error: "Ce site nécessite une connexion ou bloque les robots. Copiez-collez le texte de l'annonce dans l'onglet 'Via Texte'."
                    }, { status: 400 });
                }
            } catch (err: any) {
                console.error("Scraping error:", err.message);
                return NextResponse.json({
                    error: `Impossible de lire cette URL. Utilisez l'onglet "Via Texte" pour coller le contenu de l'offre.`
                }, { status: 400 });
            }
        }

        // 3. Analyze Match with Gemini
        const prompt = getMatchAnalysisPrompt(ragData.completeness_details, fullJobText);

        const result = await models.flash.generateContent(prompt);
        const responseText = result.response.text();
        const jsonString = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

        let matchData;
        try {
            matchData = JSON.parse(jsonString);
        } catch (e) {
            console.error("Match Parse Error", responseText);
            return NextResponse.json({ error: "AI Parse Error" }, { status: 500 });
        }

        // 4. Save to DB
        const { data: insertData, error: insertError } = await supabase
            .from("job_analyses")
            .insert({
                user_id: userId,
                job_url: jobUrl,
                job_description: fullJobText,
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

        if (insertError) {
            console.error("DB Insert Error", insertError);
        }

        return NextResponse.json({
            success: true,
            analysis_id: insertData?.id,
            match: matchData
        });

    } catch (error: any) {
        console.error("Analyze Error", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
