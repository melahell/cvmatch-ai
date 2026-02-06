const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function checkIds() {
    // Récupérer le RAG original et le dernier print job
    const [ragResult, jobResult] = await Promise.all([
        supabase
            .from('rag_metadata')
            .select('completeness_details')
            .eq('user_id', 'd3573a39-f875-4405-9566-e440f1c7366d')
            .single(),
        supabase
            .from('print_jobs')
            .select('payload')
            .order('created_at', { ascending: false })
            .limit(1)
            .single()
    ]);

    console.log('=== IDs DES EXPÉRIENCES ===\n');

    const ragExps = ragResult.data.completeness_details?.experiences || [];
    console.log('RAG experiences:');
    ragExps.forEach((exp, i) => {
        console.log(`  [${i}] id: "${exp.id}", poste: "${exp.poste?.substring(0, 40)}..."`);
    });

    console.log('\nPrint job payload experiences:');
    const payloadExps = jobResult.data.payload.data?.experiences || [];
    payloadExps.forEach((exp, i) => {
        console.log(`  [${i}] poste: "${exp.poste?.substring(0, 40)}..."`);
        console.log(`        date_debut: "${exp.date_debut}"`);
        console.log(`        _rag_experience_id: "${exp._rag_experience_id}"`);
    });
}

checkIds().catch(e => console.log('Exception:', e.message));
