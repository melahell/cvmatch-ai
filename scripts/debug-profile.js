const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function debugProfile() {
    console.log('🔍 Debugging profile data...\n');

    const userId = 'd3573a39-f875-4405-9566-e440f1c7366d';

    const { data: ragData, error: ragError } = await supabase
        .from('rag_metadata')
        .select('completeness_details,top_10_jobs,completeness_score,custom_notes')
        .eq('user_id', userId)
        .single();

    if (ragError) {
        console.error('❌ Error:', ragError);
        return;
    }

    console.log('✅ RAG Data retrieved');
    console.log('\n📊 completeness_score:', ragData.completeness_score);
    console.log('\n👤 Profile data (completeness_details.profil):');

    if (ragData.completeness_details?.profil) {
        const profil = ragData.completeness_details.profil;
        console.log('  - Prénom:', profil.prenom);
        console.log('  - Nom:', profil.nom);
        console.log('  - Titre:', profil.titre_principal);
        console.log('  - Localisation:', profil.localisation);
        console.log('  - Email:', profil.contact?.email);
    } else {
        console.log('  ❌ profil is NULL or undefined');
        console.log('  Structure:', JSON.stringify(ragData.completeness_details, null, 2).substring(0, 500));
    }

    console.log('\n💼 Top 10 Jobs count:', ragData.top_10_jobs?.length || 0);
}

debugProfile().catch(console.error);
