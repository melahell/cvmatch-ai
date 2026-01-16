const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Missing env: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkDocuments() {
    console.log('🔍 Checking documents...\n');

    const userId = 'd3573a39-f875-4405-9566-e440f1c7366d';

    const { data: docs, error } = await supabase
        .from('uploaded_documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('❌ Error:', error);
        return;
    }

    console.log('📄 Documents found:', docs?.length || 0);

    if (docs && docs.length > 0) {
        console.log('\n📋 Document details:');
        for (const doc of docs) {
            console.log(`\n  File: ${doc.filename}`);
            console.log(`  Type: ${doc.file_type}`);
            console.log(`  Created: ${doc.created_at}`);
            console.log(`  Has extracted text: ${!!doc.extracted_text}`);
            console.log(`  Text length: ${doc.extracted_text?.length || 0} chars`);
            if (doc.extracted_text) {
                console.log(`  Text preview: ${doc.extracted_text.substring(0, 200)}...`);
            }
        }
    } else {
        console.log('❌ No documents found in database!');
    }
}

checkDocuments().catch(console.error);
