/**
 * Test de la structure du ragData tel que retourné par useRAGData
 * Simule ce que reçoit ai-adapter.ts comme ragProfile
 *
 * Source de vérité pour normalizeRAGData : lib/utils/normalize-rag.ts
 * Ce script utilise une simplification locale pour exécution Node directe (node scripts/test-structure.js).
 * Pour tester avec l'implémentation réelle : utiliser un script TypeScript avec ts-node ou exécuter depuis le contexte Next.
 */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

/** Simplification pour ce script ; ne pas maintenir à la main. Voir lib/utils/normalize-rag.ts */
function normalizeRAGData(data) {
    if (!data) return null;
    let normalized = data;
    if (data.nom || data.prenom) {
        normalized = {
            profil: {
                nom: data.nom,
                prenom: data.prenom,
                titre_principal: data.titre_principal,
                localisation: data.localisation,
                elevator_pitch: data.elevator_pitch,
                photo_url: data.photo_url,
                contact: data.contact
            },
            experiences: data.experiences || []
        };
    }
    return normalized;
}

async function testStructure() {
    const { data: ragResult } = await supabase
        .from('rag_metadata')
        .select('completeness_details')
        .eq('user_id', 'd3573a39-f875-4405-9566-e440f1c7366d')
        .single();

    const rawData = ragResult.completeness_details;

    console.log('=== RAW DATA STRUCTURE ===');
    console.log('Has "nom" at root?', !!rawData.nom);
    console.log('Has "profil" object?', !!rawData.profil);
    console.log('Type of experiences:', Array.isArray(rawData.experiences) ? 'array' : typeof rawData.experiences);

    // Simuler normalizeRAGData
    const normalized = normalizeRAGData(rawData);

    console.log('\n=== AFTER normalizeRAGData ===');
    console.log('Has "experiences"?', !!normalized.experiences);
    console.log('experiences.length:', normalized.experiences?.length);

    if (normalized.experiences?.length > 0) {
        const exp = normalized.experiences[0];
        console.log('\n=== FIRST EXPERIENCE FIELDS ===');
        console.log('Keys:', Object.keys(exp));
        console.log('exp.debut:', exp.debut);
        console.log('exp.fin:', exp.fin);
        console.log('exp.date_debut:', exp.date_debut);
        console.log('exp.date_fin:', exp.date_fin);
    }

    console.log('\n=== WHAT buildExperiences RECEIVES ===');
    console.log('ragProfile = le résultat de useRAGData');
    console.log('ragProfile.experiences = normalized.experiences');
    console.log('  → donc findRAGExperience(expId, ragProfile) cherche dans ragProfile.experiences');

    // Simuler findRAGExperience
    console.log('\n=== SIMULATING findRAGExperience("exp_0", ragProfile) ===');
    const ragProfile = normalized;
    if (ragProfile?.experiences && Array.isArray(ragProfile.experiences)) {
        const ragExp = ragProfile.experiences[0];
        if (ragExp) {
            console.log('✓ Found experience at index 0');
            console.log('  ragExp.debut:', ragExp.debut);
            console.log('  ragExp.fin:', ragExp.fin);
        }
    } else {
        console.log('✗ ragProfile.experiences is not an array!');
        console.log('  ragProfile type:', typeof ragProfile);
        console.log('  ragProfile keys:', Object.keys(ragProfile || {}));
    }
}

testStructure().catch(e => console.log('Exception:', e));
