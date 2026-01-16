// scripts/debug-cv-data.ts
// Run with: npx ts-node scripts/debug-cv-data.ts

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function debugCVData() {
    // Get the latest CV generation
    const { data: cvs, error } = await supabase
        .from("cv_generations")
        .select("id, cv_data, template_name, created_at")
        .order("created_at", { ascending: false })
        .limit(1);

    if (error) {
        console.error("Error fetching CVs:", error);
        return;
    }

    if (!cvs || cvs.length === 0) {
        console.log("No CVs found");
        return;
    }

    const latestCV = cvs[0];
    console.log("=== LATEST CV ===");
    console.log("ID:", latestCV.id);
    console.log("Template:", latestCV.template_name);
    console.log("Created:", latestCV.created_at);

    console.log("\n=== CV METADATA ===");
    const metadata = latestCV.cv_data?.cv_metadata;
    console.log("cv_metadata:", JSON.stringify(metadata, null, 2));

    console.log("\n=== FIRST EXPERIENCE ===");
    const firstExp = latestCV.cv_data?.experiences?.[0];
    if (firstExp) {
        console.log("poste:", firstExp.poste);
        console.log("_format:", firstExp._format);
        console.log("_relevance_score:", firstExp._relevance_score);
    } else {
        console.log("No experiences found");
    }

    console.log("\n=== ALL EXPERIENCE FORMATS ===");
    const experiences = latestCV.cv_data?.experiences || [];
    for (let i = 0; i < experiences.length; i++) {
        const exp = experiences[i];
        console.log(`${i + 1}. ${exp.poste} | _format: ${exp._format} | _relevance_score: ${exp._relevance_score}`);
    }
}

debugCVData().catch(console.error);
