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

    console.log('=== VALEURS debut/fin DANS LE RAG ===\n');

    const experiences = rag.completeness_details?.experiences || [];

    experiences.slice(0, 3).forEach((exp, i) => {
        console.log(`Experience ${i + 1}:`);
        console.log(`  Poste: ${exp.poste}`);
        console.log(`  debut (valeur réelle): "${exp.debut}"`);
        console.log(`  fin (valeur réelle): "${exp.fin}"`);
        console.log(`  actuel: ${exp.actuel}`);
        console.log('');
    });
}

checkRAG().catch(e => console.log('Exception:', e.message));
