/**
 * INSPECTION DES DONNÉES RÉELLES
 * Récupère le dernier job d'impression pour voir le payload exact
 * et comprendre pourquoi les dates sont vides.
 */
const { createClient } = require('@supabase/supabase-js');

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Charger .env.local
const envPath = path.resolve(__dirname, '../.env.local');
console.log("Loading env from:", envPath);
try {
    const envContent = fs.readFileSync(envPath);
    const envConfig = dotenv.parse(envContent);
    console.log("Keys found in .env.local:", Object.keys(envConfig));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
} catch (e) {
    console.error("Error reading .env.local:", e.message);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing env vars (SUPABASE_URL or SERVICE_KEY)");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectLatestJob() {
    console.log("Fetching latest print job...");

    // Récupérer le dernier job créé
    const { data: jobs, error } = await supabase
        .from('print_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

    if (error) {
        console.error("Error fetching jobs:", error);
        return;
    }

    if (!jobs || jobs.length === 0) {
        console.log("No jobs found.");
        return;
    }

    const job = jobs[0];
    console.log(`\nJob ID: ${job.id}`);
    console.log(`Created: ${job.created_at}`);

    const payload = job.payload;
    if (!payload) {
        console.log("Payload is empty.");
        return;
    }

    console.log("\n=== PAYLOAD EXPERIENCES ===");
    if (payload.experiences && Array.isArray(payload.experiences)) {
        payload.experiences.forEach((exp, i) => {
            console.log(`Exp #${i}:`);
            console.log(`  Poste: "${exp.poste}"`);
            console.log(`  Entreprise: "${exp.entreprise}"`);
            console.log(`  Dates: Start="${exp.date_debut}", End="${exp.date_fin}"`);
            console.log(`  ID RAG: "${exp._rag_experience_id}"`);
            console.log(`  Score: ${exp._relevance_score}`);
        });
    } else {
        console.log("No experiences in payload.");
    }

    // Essayer de trouver les widgets source dans generated_cvs si possible
    console.log("\nFetching associated CV Analysis source (if available)...");
    // On suppose que l'utilisateur a un ID. On va chercher le dernier generated_cvs de l'utilisateur
    // User ID connu: d3573a39-f875-4405-9566-e440f1c7366d
    const userId = "d3573a39-f875-4405-9566-e440f1c7366d";

    const { data: cvs, error: cvError } = await supabase
        .from('generated_cvs')
        .select('cv_data')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

    if (cvs && cvs.length > 0) {
        const widgets = cvs[0].cv_data.widgets;
        console.log("\n=== WIDGETS SOURCE (Last Generated CV) ===");
        if (widgets && Array.isArray(widgets)) {
            const expWidgets = widgets.filter(w => w.section === 'experiences');
            expWidgets.forEach((w, i) => {
                console.log(`Widget #${i} (${w.type}):`);
                console.log(`  ID: ${w.id}`);
                console.log(`  RAG ID: ${w.sources?.rag_experience_id}`);
                console.log(`  Text: "${w.text?.substring(0, 50)}..."`);
            });
        }
    }
}

inspectLatestJob();
