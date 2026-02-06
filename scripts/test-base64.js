const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function testBase64() {
    // URL de test depuis le print job
    const testUrl = 'https://tyaoacdfxigxffdbhqja.supabase.co/storage/v1/object/sign/profile-photos/avatars/d3573a39-f875-4405-9566-e440f1c7366d/1769826676347.png?token=xxx';

    // Extraire bucket et path
    const urlMatch = testUrl.match(/\/storage\/v1\/(?:object\/sign|object\/public)\/([^/?]+)\/(.+?)(?:\?|$)/);

    if (!urlMatch) {
        console.log('❌ Regex ne matche pas');
        return;
    }

    const bucket = urlMatch[1];
    const storagePath = decodeURIComponent(urlMatch[2].split('?')[0]);

    console.log('=== EXTRACTION ===');
    console.log('Bucket:', bucket);
    console.log('Path:', storagePath);

    // Télécharger
    console.log('\n=== DOWNLOAD ===');
    const { data: fileData, error: downloadError } = await supabase.storage
        .from(bucket)
        .download(storagePath);

    if (downloadError) {
        console.log('❌ Erreur download:', downloadError.message);
        return;
    }

    console.log('✅ Téléchargé !');
    console.log('Type:', fileData.type);
    console.log('Size:', fileData.size, 'bytes');

    // Convertir en base64
    console.log('\n=== BASE64 ===');
    const arrayBuffer = await fileData.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    const mimeType = fileData.type || 'image/png';
    const dataUrl = `data:${mimeType};base64,${base64.substring(0, 50)}...`;

    console.log('✅ Converti en base64 !');
    console.log('MIME:', mimeType);
    console.log('Base64 length:', base64.length, 'chars');
    console.log('Data URL début:', dataUrl);
}

testBase64().catch(e => console.log('❌ Exception:', e.message));
