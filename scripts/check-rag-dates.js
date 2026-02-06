const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function checkRAG() {
    // Récupérer le RAG original
    const { data: rag } = await supabase
        .from('rag_metadata')
        .select('completeness_details')
        .eq('user_id', 'd3573a39-f875-4405-9566-e440f1c7366d')
        .single();

    console.log('=== DATES DES EXPÉRIENCES DANS LE RAG ORIGINAL ===\n');

    const details = rag.completeness_details;

    // Vérifier plusieurs structures possibles
    let experiences = details?.experiences || details?.profil?.experiences || [];

    if (experiences.length === 0) {
        console.log('Pas d\'experiences trouvées dans completeness_details');
        console.log('Keys disponibles:', Object.keys(details));
        console.log('\nStructure experiences:', JSON.stringify(details.experiences?.[0], null, 2).substring(0, 500));
        return;
    }

    experiences.slice(0, 3).forEach((exp, i) => {
        console.log(`Experience ${i + 1}:`);
        console.log(`  Poste: ${exp.poste}`);
        console.log(`  Entreprise: ${exp.entreprise}`);
        console.log(`  date_debut: "${exp.date_debut}"`);
        console.log(`  date_fin: "${exp.date_fin}"`);
        console.log(`  dates: "${exp.dates}"`);
        console.log(`  periode: "${exp.periode}"`);
        console.log(`  Toutes les clés:`, Object.keys(exp));
        console.log('');
    });
}

checkRAG().catch(e => console.log('Exception:', e.message));
