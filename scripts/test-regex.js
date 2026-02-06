const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function testRegexAndDownload() {
    // Récupérer le dernier print job
    const { data: job } = await supabase
        .from('print_jobs')
        .select('payload')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    const currentPhotoUrl = job.payload.data.profil.photo_url;
    console.log('=== URL ORIGINALE ===');
    console.log(currentPhotoUrl);

    console.log('\n=== TEST REGEX ===');
    const urlMatch = currentPhotoUrl.match(/\/storage\/v1\/(?:object\/sign|object\/public)\/([^/?]+)\/(.+?)(?:\?|$)/);
    console.log('Match result:', urlMatch ? 'OUI' : 'NON');

    if (urlMatch) {
        const bucket = urlMatch[1];
        const storagePath = decodeURIComponent(urlMatch[2].split('?')[0]);
        console.log('Bucket:', bucket);
        console.log('StoragePath:', storagePath);

        console.log('\n=== TEST DOWNLOAD ===');
        const { data: fileData, error: downloadError } = await supabase.storage
            .from(bucket)
            .download(storagePath);

        if (downloadError) {
            console.log('❌ Download error:', downloadError.message);
        } else if (fileData) {
            console.log('✅ Download OK!');
            console.log('Type:', fileData.type);
            console.log('Size:', fileData.size, 'bytes');

            const arrayBuffer = await fileData.arrayBuffer();
            const base64 = Buffer.from(arrayBuffer).toString('base64');
            console.log('Base64 length:', base64.length);
            console.log('Data URL:', `data:${fileData.type};base64,${base64.substring(0, 30)}...`);
        }
    } else {
        console.log('❌ REGEX NE MATCHE PAS - c\'est le problème !');
    }
}

testRegexAndDownload().catch(e => console.log('Exception:', e.message));
