
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Missing env: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const REQUIRED_TABLES = [
    'users',
    'rag_metadata',
    'job_analyses',
    'cv_generations',
    'lm_generations',
    'uploaded_documents',
    'analytics_events'
];

async function checkTables() {
    console.log('Checking for tables...');
    let allExist = true;

    // We can't query information_schema easily with Anon key usually, 
    // but we can try to select from each table with limit 0

    for (const table of REQUIRED_TABLES) {
        const { error } = await supabase.from(table).select('*', { count: 'exact', head: true });

        if (error) {
            // 404 or 42P01 means table might not exist or RLS issue
            if (error.code === '42P01') { // undefined_table
                console.error(`❌ Table '${table}' DOES NOT exist.`);
                allExist = false;
            } else {
                // Could be RLS or other error, but table likely exists if code is not 42P01
                // E.g. 401 Unauthorized or 403 Forbidden means it exists but we can't read
                console.log(`⚠️ Table '${table}' check result: ${error.message} (Code: ${error.code})`);
                if (error.code === 'PGRST301') {
                    console.log(`   -> Table '${table}' likely exists but RLS prevents reading.`);
                }
            }
        } else {
            console.log(`✅ Table '${table}' exists.`);
        }
    }

    if (allExist) {
        console.log('\nAll required tables seem to exist (or are protected by RLS).');
    } else {
        console.log('\n❌ Some tables are missing. Please run 01_tables.sql.');
    }
}

checkTables();
