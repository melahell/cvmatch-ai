
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://tyaoacdfxigxffdbhqja.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_jfSZuKZ5ZzCwdJvNV7nGJQ_t3f79x70";

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
