
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { models } from "@/lib/ai/gemini";

// Helper for tokens (stub)
export const runtime = "nodejs";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
    try {
        const { userId, analysisId, template } = await req.json();

        if (!userId || !analysisId) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        // 1. Fetch Job Analysis & User Profile
        const { data: analysisData, error: analysisError } = await supabase
            .from("job_analyses")
            .select("*")
            .eq("id", analysisId)
            .single();

        if (analysisError || !analysisData) {
            return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
        }

        const { data: ragData, error: ragError } = await supabase
            .from("rag_metadata")
            .select("completeness_details")
            .eq("user_id", userId)
            .single();

        if (ragError || !ragData) {
            return NextResponse.json({ error: "RAG Profile not found" }, { status: 404 });
        }

        const profile = ragData.completeness_details;
        const jobDescription = analysisData.job_description;

        // 2. Optimization Prompt
        // We ask Gemini to rewrite the profile summary and experience bullets.
        const prompt = `
      Tu es un expert en rédaction de CV (CV Writer) spécialisé dans l'optimisation ATS.

      CANDIDAT (JSON) :
      ${JSON.stringify(profile)}

      OFFRE D'EMPLOI :
      ${jobDescription}

      MISSION :
      Réécris le contenu du CV pour qu'il corresponde PARFAITEMENT à l'offre d'emploi, tout en restant VERIDIQUE.
      
      ACTIONS :
      1. Réécris le "profil.elevator_pitch" pour qu'il résonne avec la mission.
      2. Pour chaque expérience, sélectionne les 3-4 bullets les plus pertinents et réécris-les avec des mots-clés de l'offre.
      3. Mets en avant les compétences techniques citées dans l'offre.

      OUTPUT (JSON uniquement, structure identique au CANDIDAT, mais contenu optimisé) :
      {
        "profil": { ... },
        "experiences": [ ... (rework descriptions) ],
        "competences": { ... },
        "formations": [ ... ],
        "langues": { ... },
        "optimizations_applied": ["string"] // Ajoute ce champ pour lister ce que tu as changé (ex: "Mis en avant expérience Agile")
      }
    `;

        const result = await models.flash.generateContent(prompt);
        const responseText = result.response.text();
        const jsonString = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

        let optimizedCV;
        try {
            optimizedCV = JSON.parse(jsonString);
        } catch (e) {
            console.error("CV Parse Error", responseText);
            return NextResponse.json({ error: "AI Parse Error" }, { status: 500 });
        }

        // 3. Save Generated CV
        const { data: cvGen, error: cvError } = await supabase
            .from("cv_generations")
            .insert({
                user_id: userId,
                job_analysis_id: analysisId,
                template_name: template || "standard",
                cv_data: optimizedCV,
                optimizations_applied: optimizedCV.optimizations_applied || []
            })
            .select("id")
            .single();

        return NextResponse.json({ success: true, cvId: cvGen?.id, cvData: optimizedCV });

    } catch (error: any) {
        console.error("CV Generation Error", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
