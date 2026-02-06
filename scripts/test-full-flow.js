/**
 * Test complet du flow de conversion widgets → cvData
 * Simule ce que fait le CV Builder
 */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function testFullFlow() {
    // 1. Charger le RAG (comme useRAGData)
    const { data: ragResult } = await supabase
        .from('rag_metadata')
        .select('completeness_details')
        .eq('user_id', 'd3573a39-f875-4405-9566-e440f1c7366d')
        .single();

    const ragData = ragResult.completeness_details;

    console.log('=== RAG EXPERIENCES ===');
    ragData.experiences?.forEach((exp, i) => {
        console.log(`  [${i}] "${exp.poste?.substring(0, 40)}..." | debut=${exp.debut}, fin=${exp.fin}`);
    });

    // 2. Charger le dernier print job
    const { data: jobResult } = await supabase
        .from('print_jobs')
        .select('payload, created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    console.log('\n=== PRINT JOB (créé: ' + jobResult.created_at + ') ===');
    const expPayload = jobResult.payload.data?.experiences || [];
    expPayload.forEach((exp, i) => {
        console.log(`  [${i}] "${exp.poste?.substring(0, 40)}..."`);
        console.log(`        _rag_experience_id: ${exp._rag_experience_id}`);
        console.log(`        date_debut: "${exp.date_debut || 'VIDE'}"`);
        console.log(`        date_fin: "${exp.date_fin || 'VIDE'}"`);
    });

    // 3. Vérifier si les IDs correspondent correctement
    console.log('\n=== DIAGNOSTIC ===');
    for (let i = 0; i < expPayload.length; i++) {
        const payloadExp = expPayload[i];
        const ragExpId = payloadExp._rag_experience_id;

        // Simuler findRAGExperience avec index numérique
        const numericMatch = ragExpId?.match(/^exp_(\d+)$/);
        if (numericMatch) {
            const index = parseInt(numericMatch[1], 10);
            const matchingRagExp = ragData.experiences[index];
            console.log(`Payload[${i}] avec _rag_experience_id="${ragExpId}":`);
            console.log(`  → Cherche index ${index} dans RAG...`);
            if (matchingRagExp) {
                console.log(`  → Trouvé: "${matchingRagExp.poste?.substring(0, 30)}..."`);
                console.log(`  → Dates RAG: debut="${matchingRagExp.debut}", fin="${matchingRagExp.fin}"`);
                console.log(`  → MAIS payload a: date_debut="${payloadExp.date_debut || 'VIDE'}"`);
                if (!payloadExp.date_debut && matchingRagExp.debut) {
                    console.log(`  ⚠️ PROBLÈME: Le payload n'a pas été enrichi avec les dates du RAG!`);
                }
            } else {
                console.log(`  ⚠️ Pas trouvé - index ${index} hors limites`);
            }
        }
        console.log('');
    }

    console.log('\n=== CONCLUSION ===');
    console.log('Si les dates RAG existent mais le payload a date_debut=VIDE,');
    console.log('cela signifie que le fix n\'a pas encore été déployé sur Vercel');
    console.log('OU que le payload a été créé avant le déploiement.');
    console.log('\nDernier commit: a12717d6 (fix dates)');
    console.log('Job créé: ' + jobResult.created_at);
}

testFullFlow().catch(e => console.log('Exception:', e));
