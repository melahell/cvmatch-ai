const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function checkDates() {
    // Récupérer le dernier print job
    const { data: job } = await supabase
        .from('print_jobs')
        .select('payload')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    console.log('=== DATES DES EXPÉRIENCES DANS LE PAYLOAD ===\n');

    const experiences = job.payload.data?.experiences || [];
    experiences.slice(0, 3).forEach((exp, i) => {
        console.log(`Experience ${i + 1}:`);
        console.log(`  Poste: ${exp.poste}`);
        console.log(`  Entreprise: ${exp.entreprise}`);
        console.log(`  date_debut: "${exp.date_debut}"`);
        console.log(`  date_fin: "${exp.date_fin}"`);
        console.log('');
    });
}

checkDates().catch(e => console.log('Exception:', e.message));
