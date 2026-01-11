const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const serviceKey = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
const key = serviceKey ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL and no usable Supabase key found');
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    key
);

async function auditUserData() {
    const userId = 'd3573a39-f875-4405-9566-e440f1c7366d';
    
    console.log('=== AUDIT CV DATA ===\n');
    
    // 1. Check RAG metadata
    console.log('1. RAG METADATA:');
    const { data: rag, error: ragErr } = await supabase
        .from('rag_metadata')
        .select('*')
        .eq('user_id', userId)
        .single();
    
    if (ragErr) {
        console.error('RAG Error:', ragErr);
        return;
    }
    
    const details = rag.completeness_details || {};
    console.log('   - Has completeness_details:', !!rag.completeness_details);
    console.log('   - Profil:', details.profil ? JSON.stringify(details.profil).substring(0, 200) : 'MISSING');
    console.log('   - Experiences count:', (details.experiences || []).length);
    console.log('   - Competences techniques:', (details.competences?.techniques || []).length);
    console.log('   - Formations count:', (details.formations || []).length);
    console.log('   - Langues:', JSON.stringify(details.langues));
    console.log('');
    
    // 2. Check latest CV generation
    console.log('2. LATEST CV GENERATION:');
    const { data: cvGen, error: cvErr } = await supabase
        .from('cv_generations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
    
    if (cvErr) {
        console.error('CV Gen Error:', cvErr);
    } else {
        const cvData = cvGen.cv_data || {};
        console.log('   - CV ID:', cvGen.id);
        console.log('   - Created:', cvGen.created_at);
        console.log('   - Has cv_metadata:', !!cvData.cv_metadata);
        console.log('   - Profil nom:', cvData.profil?.nom || 'MISSING');
        console.log('   - Profil prenom:', cvData.profil?.prenom || 'MISSING');
        console.log('   - Profil email:', cvData.profil?.email || 'MISSING');
        console.log('   - Experiences count:', (cvData.experiences || []).length);
        console.log('   - First exp:', cvData.experiences?.[0] ? JSON.stringify(cvData.experiences[0]).substring(0, 300) : 'NONE');
        console.log('   - Competences:', JSON.stringify(cvData.competences).substring(0, 200));
        console.log('   - Formations:', JSON.stringify(cvData.formations).substring(0, 200));
    }
    
    // 3. Full RAG profile structure
    console.log('\n3. FULL RAG PROFILE KEYS:');
    console.log('   Top-level keys:', Object.keys(details));
    if (details.profil) {
        console.log('   Profil keys:', Object.keys(details.profil));
    }
}

auditUserData().catch(console.error);
