/**
 * Test du fix findRAGExperience avec fallback par poste/entreprise
 * Simule exactement ce qui se passe dans ai-adapter.ts
 */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// Copie exacte de findRAGExperience depuis ai-adapter.ts
function findRAGExperience(expId, ragProfile, headerText) {
    if (!ragProfile?.experiences || !Array.isArray(ragProfile.experiences)) {
        console.log(`  [findRAGExperience] No ragProfile.experiences`);
        return null;
    }

    // Format exp_0, exp_1, etc. → index dans le tableau RAG
    const numericMatch = expId.match(/^exp_(\d+)$/);
    if (numericMatch) {
        const index = parseInt(numericMatch[1], 10);
        console.log(`  [findRAGExperience] Trying numeric index ${index}...`);
        if (index >= 0 && index < ragProfile.experiences.length) {
            console.log(`  [findRAGExperience] ✓ Found by numeric index!`);
            return ragProfile.experiences[index];
        }
    }

    // Recherche par ID personnalisé
    for (const exp of ragProfile.experiences) {
        if (exp.id === expId) {
            console.log(`  [findRAGExperience] ✓ Found by exact ID match!`);
            return exp;
        }
    }

    // Fallback par poste/entreprise
    if (headerText) {
        console.log(`  [findRAGExperience] Trying headerText fallback: "${headerText.substring(0, 50)}..."`);
        const normalizeForMatch = (s) =>
            String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

        const headerNorm = normalizeForMatch(headerText);

        for (const exp of ragProfile.experiences) {
            const ragPoste = normalizeForMatch(exp.poste || exp.titre || "");
            const ragEntreprise = normalizeForMatch(exp.entreprise || exp.client || "");

            if (ragPoste && ragEntreprise &&
                headerNorm.includes(ragPoste.substring(0, Math.min(20, ragPoste.length))) &&
                headerNorm.includes(ragEntreprise.substring(0, Math.min(15, ragEntreprise.length)))) {
                console.log(`  [findRAGExperience] ✓ Found by poste+entreprise fallback!`);
                return exp;
            }

            if (ragPoste && ragPoste.length > 10 &&
                headerNorm.includes(ragPoste.substring(0, Math.min(30, ragPoste.length)))) {
                console.log(`  [findRAGExperience] ✓ Found by poste-only fallback!`);
                return exp;
            }
        }
    }

    console.log(`  [findRAGExperience] ✗ Not found`);
    return null;
}

async function testFix() {
    // Récupérer le RAG et le dernier print job
    const [ragResult, jobResult] = await Promise.all([
        supabase
            .from('rag_metadata')
            .select('completeness_details')
            .eq('user_id', 'd3573a39-f875-4405-9566-e440f1c7366d')
            .single(),
        supabase
            .from('print_jobs')
            .select('payload')
            .order('created_at', { ascending: false })
            .limit(1)
            .single()
    ]);

    const ragProfile = ragResult.data.completeness_details;
    const expPayload = jobResult.data.payload.data?.experiences || [];

    console.log('=== TEST DU FIX findRAGExperience ===\n');
    console.log(`RAG contient ${ragProfile.experiences?.length || 0} expériences`);
    console.log(`Payload contient ${expPayload.length} expériences\n`);

    // Simuler ce qui se passe dans buildExperiences
    for (let i = 0; i < Math.min(3, expPayload.length); i++) {
        const exp = expPayload[i];
        const expId = exp._rag_experience_id || `exp_${i}`;
        const headerText = exp.poste; // Dans le vrai code, c'est le widget text

        console.log(`\n--- Experience ${i}: "${exp.poste?.substring(0, 40)}..." ---`);
        console.log(`  _rag_experience_id: "${expId}"`);
        console.log(`  headerText for fallback: "${headerText?.substring(0, 50)}..."`);

        const ragExp = findRAGExperience(expId, ragProfile, headerText);

        if (ragExp) {
            console.log(`  RESULT: Found RAG exp with debut="${ragExp.debut}", fin="${ragExp.fin}"`);
        } else {
            console.log(`  RESULT: NOT FOUND - dates will be empty!`);
        }
    }
}

testFix().catch(e => console.log('Exception:', e.message));
