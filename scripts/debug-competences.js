const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function debugCompetences() {
    console.log('🔍 Debugging competences...\n');

    const userId = 'd3573a39-f875-4405-9566-e440f1c7366d';

    const { data: ragData } = await supabase
        .from('rag_metadata')
        .select('completeness_details')
        .eq('user_id', userId)
        .single();

    console.log('📋 Structure de completeness_details:');
    console.log(JSON.stringify(Object.keys(ragData.completeness_details), null, 2));

    console.log('\n🔑 Compétences dans les données:');

    // Test différentes structures possibles
    const tests = [
        { path: 'completeness_details.competences', label: 'Directement dans completeness_details' },
        { path: 'completeness_details.profil.competences', label: 'Sous profil (ancienne structure)' },
    ];

    for (const test of tests) {
        const parts = test.path.split('.');
        let value = ragData;
        for (const part of parts) {
            value = value?.[part];
        }

        if (value) {
            console.log(`\n✅ ${test.label}:`);
            console.log('  - Techniques:', value.techniques?.slice(0, 5) || 'N/A');
            console.log('  - Soft skills:', value.soft_skills?.slice(0, 3) || 'N/A');
        } else {
            console.log(`\n❌ ${test.label}: NOT FOUND`);
        }
    }

    // Afficher toute la structure pour debug
    console.log('\n📊 Clés de premier niveau dans completeness_details:');
    console.log(Object.keys(ragData.completeness_details));
}

debugCompetences().catch(console.error);
