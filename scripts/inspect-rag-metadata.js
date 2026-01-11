const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function inspectRAGMetadata() {
    console.log('🔍 Inspecting rag_metadata table structure...\n');

    // Try to fetch a sample row to infer structure
    console.log('Attempting to fetch sample data from rag_metadata...');
    const { data: sampleData, error: sampleError } = await supabase
        .from('rag_metadata')
        .select('*')
        .limit(1)
        .single();

    if (sampleError) {
        console.error('❌ Error fetching sample data:', sampleError.message);
        console.log('Code:', sampleError.code);
        console.log('Details:', sampleError.details);
        console.log('Hint:', sampleError.hint);
    } else if (sampleData) {
        console.log('✅ Sample row retrieved successfully!\n');
        console.log('📋 Columns found in the data:');
        Object.keys(sampleData).forEach(key => {
            const value = sampleData[key];
            const type = Array.isArray(value) ? 'array' : typeof value;
            const preview = JSON.stringify(value).substring(0, 100);
            console.log(`  - ${key}: ${type} = ${preview}${preview.length >= 100 ? '...' : ''}`);
        });
    } else {
        console.log('⚠️ Table is empty, trying to get structure via SELECT *');
        const { data: emptyData, error: emptyError } = await supabase
            .from('rag_metadata')
            .select('*')
            .limit(0);

        if (emptyError) {
            console.error('❌ Error:', emptyError.message);
        } else {
            console.log('✅ Table exists but is empty');
        }
    }

    // Try to check if specific columns exist by attempting to select them
    console.log('\n🔍 Testing specific columns...');

    const columnsToTest = [
        'completeness_details',
        'completeness_score',
        'completeness_breakdown',
        'custom_notes',
        'top_10_jobs'
    ];

    for (const col of columnsToTest) {
        const { error } = await supabase
            .from('rag_metadata')
            .select(col)
            .limit(0);

        if (error) {
            if (error.code === '42703') { // undefined_column
                console.log(`  ❌ ${col}: DOES NOT EXIST (42703)`);
            } else {
                console.log(`  ⚠️ ${col}: Error ${error.code} - ${error.message}`);
            }
        } else {
            console.log(`  ✅ ${col}: EXISTS`);
        }
    }
}

inspectRAGMetadata().catch(console.error);
