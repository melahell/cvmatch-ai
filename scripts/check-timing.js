const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function checkTiming() {
    const { data: jobs } = await supabase
        .from('print_jobs')
        .select('token, created_at, payload')
        .order('created_at', { ascending: false })
        .limit(5);

    console.log('=== DERNIERS PRINT JOBS ===\n');
    for (const job of jobs) {
        const exp = job.payload?.data?.experiences?.[0];
        console.log(`Token: ${job.token?.substring(0, 20)}...`);
        console.log(`  Created: ${job.created_at}`);
        console.log(`  First exp date_debut: "${exp?.date_debut || 'VIDE'}"`);
        console.log('');
    }

    console.log('\nLe fix a été déployé autour de 23:15 UTC+1 (22:15 UTC)');
    console.log('Si les jobs récents ont toujours date_debut vide, le fix ne marche pas sur Vercel');
}

checkTiming().catch(e => console.log('Exception:', e.message));
