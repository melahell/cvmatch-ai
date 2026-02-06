const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function check() {
    const { data: jobs, error } = await supabase
        .from('print_jobs')
        .select('token, created_at, payload')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.log('Erreur:', error.message);
        return;
    }

    console.log('=== 5 DERNIERS PRINT JOBS ===\n');

    for (const job of jobs) {
        const date = new Date(job.created_at);
        const photoUrl = job.payload?.data?.profil?.photo_url;
        const isBase64 = photoUrl?.startsWith('data:');

        console.log(`Token: ${job.token.substring(0, 8)}...`);
        console.log(`Créé: ${date.toISOString()}`);
        console.log(`Photo: ${isBase64 ? '✅ BASE64' : photoUrl ? '⚠️ URL' : '❌ AUCUNE'}`);
        if (photoUrl && !isBase64) {
            console.log(`  URL: ${photoUrl.substring(0, 60)}...`);
        }
        console.log('');
    }
}

check().catch(e => console.log('Exception:', e.message));
