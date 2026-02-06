const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function inspect() {
    // Récupérer le dernier print job
    const { data: job, error } = await supabase
        .from('print_jobs')
        .select('token, created_at, payload')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error) {
        console.log('Erreur:', error.message);
        return;
    }

    console.log('=== STRUCTURE DU PAYLOAD ===\n');
    console.log('Token:', job.token.substring(0, 10) + '...');
    console.log('Créé:', job.created_at);

    console.log('\n--- Top level keys:');
    console.log(Object.keys(job.payload));

    console.log('\n--- payload.includePhoto:', job.payload.includePhoto);

    console.log('\n--- payload.data exists:', !!job.payload.data);
    if (job.payload.data) {
        console.log('--- payload.data keys:', Object.keys(job.payload.data));
        console.log('--- payload.data.profil exists:', !!job.payload.data.profil);

        if (job.payload.data.profil) {
            console.log('--- payload.data.profil keys:', Object.keys(job.payload.data.profil));
            console.log('--- payload.data.profil.photo_url:', job.payload.data.profil.photo_url?.substring(0, 80));
        }
    }

    // Vérifier aussi si cvData est utilisé à la place de data
    if (job.payload.cvData) {
        console.log('\n--- payload.cvData exists:', true);
        console.log('--- payload.cvData keys:', Object.keys(job.payload.cvData));
        console.log('--- payload.cvData.profil exists:', !!job.payload.cvData.profil);
        if (job.payload.cvData.profil) {
            console.log('--- payload.cvData.profil.photo_url:', job.payload.cvData.profil.photo_url?.substring(0, 80));
        }
    }
}

inspect().catch(e => console.log('Exception:', e.message));
