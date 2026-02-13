
import { buildExperiencesTest } from './lib/cv/ai-adapter-test-helper'; // We will mock this or use the real function if we can export it
import { convertAndSort } from './lib/cv/ai-adapter';

// Mock data based on user screenshot
const mockWidgets = {
    widgets: [
        {
            id: "w1",
            type: "experience_item",
            section: "experiences",
            relevance_score: 90,
            text: "Chef de projet multimédia / Responsable technique - France\nJanv. 2015 - Présent\nblablabla",
            sources: { rag_experience_id: "exp_unknown_1" }
        },
        {
            id: "w2",
            type: "experience_item",
            section: "experiences",
            relevance_score: 85,
            text: "Chef de projet multimédia / Responsable technique\nALTEN / ACF\nblablabla",
            sources: { rag_experience_id: "exp_unknown_2" }
        },
        {
            id: "w3",
            type: "experience_item",
            section: "experiences",
            relevance_score: 95,
            text: "Project Manager Officer (PMO) & Quality Manager - Volkswagen Financial Services",
            sources: { rag_experience_id: "exp_vw_1" }
        },
        {
            id: "w4",
            type: "experience_item",
            section: "experiences",
            relevance_score: 95,
            text: "Structuration et amélioration continue\nVolkswagen Financial Services",
            sources: { rag_experience_id: "exp_vw_2" }
        }
    ]
};

const mockRAG = {
    experiences: [
        {
            id: "rag_exp_1",
            poste: "Chef de projet multimédia / Responsable technique",
            entreprise: "ALTEN / ACF",
            debut: "2015-01",
            actuel: true
        },
        {
            id: "rag_exp_2",
            poste: "Project Manager Officer",
            entreprise: "Volkswagen Financial Services",
            debut: "2023-04",
            actuel: true
        }
    ]
};

async function runTest() {
    console.log("Running duplication test...");
    try {
        const result = convertAndSort(mockWidgets, { ragProfile: mockRAG });

        console.log("\n--- Generated Experiences ---");
        result.experiences.forEach((exp, i) => {
            console.log(`[${i}] ${exp.poste} @ ${exp.entreprise} (${exp.date_debut})`);
        });

        // Check for "France" as company
        const hasFrance = result.experiences.some(e => e.entreprise === "France");
        if (hasFrance) console.log("\n❌ FAIL: Found 'France' as company!");

        // Check for duplicates
        const altenExps = result.experiences.filter(e => e.poste.includes("multimédia"));
        if (altenExps.length > 1) {
            console.log(`\n❌ FAIL: Duplicate experiences found for 'Chef de projet multimédia' (${altenExps.length})`);
            altenExps.forEach(e => console.log(`   - @ ${e.entreprise}`));
        } else {
            console.log("\n✅ SUCCESS: No duplicates for Alten experience");
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

// We can't run this directly because we can't easily import from the app in a standalone script without ts-node set up for aliases.
// Instead, I will inspect the code logically and apply the fix, as the issue is apparent from reading the code.
// The code parsing " - France" as company is:
// const dashIndex = headerText.indexOf(" - ");
// ... entreprise = headerText.slice(separatorIndex + separatorLen).trim();
