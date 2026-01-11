const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkFullData() {
    console.log('🔍 Checking for full RAG data...\n');

    const userId = 'd3573a39-f875-4405-9566-e440f1c7366d';

    // Get current data
    const { data: current } = await supabase
        .from('rag_metadata')
        .select('*')
        .eq('user_id', userId)
        .single();

    console.log('📅 Last updated:', current.last_updated);
    console.log('📅 Created at:', current.created_at);

    // Check size of completeness_details
    const jsonSize = JSON.stringify(current.completeness_details).length;
    console.log('\n📊 Size of completeness_details:', jsonSize, 'characters');

    if (jsonSize < 1000) {
        console.log('⚠️  WARNING: Data looks very small! Likely corrupted or incomplete.');
        console.log('\n💡 Suggestion: Need to regenerate RAG profile from documents');
    }

    // Show what we have
    console.log('\n📋 Current keys in completeness_details:');
    console.log(Object.keys(current.completeness_details));

    console.log('\n💼 Expected keys for full profile:');
    console.log(['profil', 'experiences', 'competences', 'formations', 'langues', 'projets']);

    console.log('\n❓ Missing keys:');
    const expected = ['experiences', 'competences', 'formations', 'langues'];
    const missing = expected.filter(key => !current.completeness_details[key]);
    console.log(missing.length > 0 ? missing : 'None - all present!');
}

checkFullData().catch(console.error);
