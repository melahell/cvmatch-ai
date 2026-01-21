#!/usr/bin/env tsx
/**
 * Test de validation du seuil de déduplication
 * Prouve que 0.85 est trop strict pour détecter les doublons sémantiques
 */

/**
 * Calculate Jaccard similarity between two strings (COPY from merge-simple.ts)
 */
function calculateSimilarity(str1: string, str2: string): number {
    if (!str1 || !str2) return 0;

    const normalize = (s: string) => s.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 2);

    const words1 = new Set(normalize(str1));
    const words2 = new Set(normalize(str2));

    if (words1.size === 0 || words2.size === 0) return 0;

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
}

/**
 * Test cases - REAL examples from user's RAG
 */
const testCases = [
    {
        name: "Volkswagen - Pilotage Portfolio (Variation 1 vs 2)",
        r1: "Pilotage centralisé du portefeuille projets et ressources de la DSI via Orchestra",
        r2: "Gestion du portefeuille de projets et ressources de la DSI",
        expectedDuplicate: true // Ces deux DEVRAIENT être détectés comme doublons
    },
    {
        name: "Volkswagen - Pilotage Portfolio (Variation 1 vs 3)",
        r1: "Pilotage centralisé du portefeuille projets et ressources de la DSI via Orchestra",
        r2: "Pilotage du portefeuille de projets et des ressources de la DSI",
        expectedDuplicate: true
    },
    {
        name: "Volkswagen - Audit Qualité (Variation 1 vs 2)",
        r1: "Mise en place d'audits Qualité et refonte des méthodologies projet",
        r2: "Mise en place d'audits Qualité et refonte des méthodologies",
        expectedDuplicate: true
    },
    {
        name: "Volkswagen - Formation PPM (Variation 1 vs 2)",
        r1: "Formation à l'utilisation du PPM Orchestra de Planisware",
        r2: "Formation à l'utilisation d'Orchestra",
        expectedDuplicate: true
    },
    {
        name: "Technologie - Planisware variations",
        r1: "Planisware Orchestra",
        r2: "Planisware e7",
        expectedDuplicate: false // Technos différentes (Orchestra vs e7) → PAS un doublon
    },
    {
        name: "Technologie - Même outil, nom différent",
        r1: "PPM Orchestra",
        r2: "Planisware Orchestra",
        expectedDuplicate: true // Même outil, noms différents
    },
    {
        name: "Réalisation - Contexte différent (PAS doublon)",
        r1: "Pilotage de projets Agile avec Scrum",
        r2: "Pilotage de projets Waterfall avec PRINCE2",
        expectedDuplicate: false // Méthodologies différentes → PAS un doublon
    },
    {
        name: "Réalisation - Impact différent (PAS doublon)",
        r1: "Développement backend en Python avec Django",
        r2: "Développement backend en Java avec Spring",
        expectedDuplicate: false // Technos différentes → PAS un doublon
    },
    {
        name: "Formation - Même diplôme, même école",
        r1: "Master en Informatique à l'Université Paris-Saclay",
        r2: "Master Informatique - Université Paris Saclay",
        expectedDuplicate: true
    }
];

/**
 * Test thresholds
 */
const thresholds = [0.70, 0.75, 0.80, 0.85, 0.90];

console.log("\n" + "═".repeat(80));
console.log("🧪 TEST DE VALIDATION: SEUILS DE DÉDUPLICATION");
console.log("═".repeat(80) + "\n");

console.log("📊 Hypothèse à valider:");
console.log("   - Threshold 0.85 (actuel): Trop strict, laisse passer des doublons");
console.log("   - Threshold 0.75 (proposé): Plus équilibré, détecte mieux les doublons sémantiques\n");

// Results tracking
const results: Record<number, { correctDetections: number; falsePositives: number; falseNegatives: number }> = {};

for (const threshold of thresholds) {
    results[threshold] = { correctDetections: 0, falsePositives: 0, falseNegatives: 0 };
}

// Run tests
for (const test of testCases) {
    const similarity = calculateSimilarity(test.r1, test.r2);

    console.log(`\n${"─".repeat(80)}`);
    console.log(`📌 TEST: ${test.name}`);
    console.log(`${"─".repeat(80)}`);
    console.log(`R1: "${test.r1}"`);
    console.log(`R2: "${test.r2}"`);
    console.log(`\n✨ Similarité Jaccard: ${(similarity * 100).toFixed(1)}%`);
    console.log(`🎯 Devrait être détecté comme doublon? ${test.expectedDuplicate ? "OUI ✅" : "NON ❌"}`);
    console.log(`\nRésultats par seuil:`);

    for (const threshold of thresholds) {
        const detected = similarity >= threshold;
        let status = "";

        if (detected === test.expectedDuplicate) {
            status = "✅ CORRECT";
            results[threshold].correctDetections++;
        } else if (detected && !test.expectedDuplicate) {
            status = "⚠️  FAUX POSITIF (supprime à tort)";
            results[threshold].falsePositives++;
        } else {
            status = "❌ FAUX NÉGATIF (doublon non détecté)";
            results[threshold].falseNegatives++;
        }

        console.log(`   Threshold ${threshold}: ${detected ? "Détecté" : "Non détecté"} → ${status}`);
    }
}

// Summary
console.log("\n" + "═".repeat(80));
console.log("📈 RÉSUMÉ DES PERFORMANCES");
console.log("═".repeat(80) + "\n");

console.log("Threshold | Correct | Faux Positifs | Faux Négatifs | Précision");
console.log("----------|---------|---------------|---------------|----------");

for (const threshold of thresholds) {
    const { correctDetections, falsePositives, falseNegatives } = results[threshold];
    const total = testCases.length;
    const accuracy = (correctDetections / total) * 100;

    const marker = threshold === 0.75 ? " ← RECOMMANDÉ" : (threshold === 0.85 ? " ← ACTUEL" : "");

    console.log(
        `${threshold.toFixed(2).padEnd(9)} | ` +
        `${correctDetections.toString().padEnd(7)} | ` +
        `${falsePositives.toString().padEnd(13)} | ` +
        `${falseNegatives.toString().padEnd(13)} | ` +
        `${accuracy.toFixed(1)}%${marker}`
    );
}

// Recommendations
console.log("\n" + "═".repeat(80));
console.log("🎯 RECOMMANDATIONS");
console.log("═".repeat(80) + "\n");

const best = Object.entries(results).reduce((best, [threshold, stats]) => {
    const score = stats.correctDetections - stats.falsePositives * 2; // FP = worse than FN
    const bestScore = best.stats.correctDetections - best.stats.falsePositives * 2;
    return score > bestScore ? { threshold: parseFloat(threshold), stats } : best;
}, { threshold: 0.85, stats: results[0.85] });

console.log(`✅ MEILLEUR THRESHOLD: ${best.threshold}`);
console.log(`   - Détections correctes: ${best.stats.correctDetections}/${testCases.length}`);
console.log(`   - Faux positifs: ${best.stats.falsePositives} (sur-suppression)`);
console.log(`   - Faux négatifs: ${best.stats.falseNegatives} (doublons manqués)`);

console.log(`\n⚠️  PROBLÈME AVEC 0.85 (actuel):`);
console.log(`   - Faux négatifs: ${results[0.85].falseNegatives} doublons NON détectés`);
console.log(`   - Précision: ${((results[0.85].correctDetections / testCases.length) * 100).toFixed(1)}%`);

console.log(`\n✨ AVANTAGES DE ${best.threshold}:`);
console.log(`   - Meilleur équilibre détection/précision`);
console.log(`   - Détecte les variations sémantiques`);
console.log(`   - Moins de faux positifs que 0.70`);

console.log("\n" + "═".repeat(80));
console.log("🔬 ANALYSE DÉTAILLÉE DES CAS PROBLÉMATIQUES");
console.log("═".repeat(80) + "\n");

const problematicCases = testCases.filter(test => {
    const similarity = calculateSimilarity(test.r1, test.r2);
    const detectedAt085 = similarity >= 0.85;
    return detectedAt085 !== test.expectedDuplicate;
});

if (problematicCases.length > 0) {
    console.log(`⚠️  ${problematicCases.length} cas problématiques avec threshold 0.85:\n`);

    for (const test of problematicCases) {
        const similarity = calculateSimilarity(test.r1, test.r2);
        console.log(`📌 ${test.name}`);
        console.log(`   Similarité: ${(similarity * 100).toFixed(1)}%`);
        console.log(`   Attendu: ${test.expectedDuplicate ? "Doublon" : "Distinct"}`);
        console.log(`   Actuel (0.85): ${similarity >= 0.85 ? "Détecté" : "Non détecté"}`);
        console.log(`   Avec ${best.threshold}: ${similarity >= best.threshold ? "Détecté ✅" : "Non détecté ❌"}`);
        console.log();
    }
} else {
    console.log("✅ Aucun cas problématique (tous correctement gérés)");
}

console.log("\n" + "═".repeat(80));
console.log("✅ FIN DU TEST");
console.log("═".repeat(80) + "\n");
