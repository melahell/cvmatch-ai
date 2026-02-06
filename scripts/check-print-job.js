const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function check() {
    const { data: jobs, error } = await supabase
        .from('print_jobs')
        .select('payload, created_at')
        .order('created_at', { ascending: false })
        .limit(1);

    if (error) {
        console.log('Erreur:', error.message);
        return;
    }

    if (!jobs || jobs.length === 0) {
        console.log('Aucun print job trouvé');
        return;
    }

    const job = jobs[0];
    console.log('=== DERNIER PRINT JOB ===');
    console.log('Créé:', job.created_at);
    console.log('includePhoto:', job.payload?.includePhoto);

    const photoUrl = job.payload?.data?.profil?.photo_url;
    console.log('photo_url present:', !!photoUrl);

    if (photoUrl) {
        console.log('photo_url type:', typeof photoUrl);
        console.log('photo_url début:', photoUrl.substring(0, 100));
        console.log('photo_url contient "token":', photoUrl.includes('token'));
        console.log('photo_url contient "storage/v1":', photoUrl.includes('storage/v1'));
    } else {
        console.log('AUCUNE PHOTO DANS LE PAYLOAD !');
        console.log('Keys dans profil:', Object.keys(job.payload?.data?.profil || {}));
    }
}

check().catch(e => console.log('Exception:', e.message));
