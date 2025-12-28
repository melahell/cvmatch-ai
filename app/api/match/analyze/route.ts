
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { models } from "@/lib/ai/gemini";

// Edge runtime to mock quickly, but scraping usually needs Node 
// Let's use Node runtime for robustness with potential scraping libraries
export const runtime = "nodejs";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
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
            // Mock fetch for POC
            fullJobText = `Poste: Senior Project Manager chez TechCorp.
       Mission: Gérer des projets IT complexes using Agile methodology.
       Requis: 5 ans XP, Anglais courant, Certification PMP.
       Salaire: 60-70k.
       (Note: Ceci est un contenu mocké car le scraping n'est pas encore implémenté)`;
        }

        // 3. Analyze Match with Gemini
        const userProfile = JSON.stringify(ragData.completeness_details);

        const prompt = `
      Tu es un expert RH / Career Coach.

      PROFIL DU CANDIDAT :
      ${userProfile}

      OFFRE D'EMPLOI :
      ${fullJobText}

      MISSION :
      Analyse le match entre ce profil et cette offre.

      OUTPUT (JSON uniquement) :
      {
        "match_score": 0-100,
        "match_level": "Excellent|Très bon|Bon|Moyen|Faible",
        "recommendation": "Oui fortement|Oui|Peut-être|Non recommandé",
        "strengths": [
          { "point": "string", "match_percent": 0-100 }
        ],
        "gaps": [
          { "point": "string", "severity": "Bloquant|Important", "suggestion": "string" }
        ],
        "missing_keywords": ["string"],
        "key_insight": "string (1 phrase synthèse)"
      }
    `;

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
