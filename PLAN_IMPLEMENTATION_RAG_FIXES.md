# 🛠️ PLAN D'IMPLÉMENTATION: Fixes RAG Duplication

**Date**: 2026-01-07
**Basé sur**: AUDIT_RAG_DUPLICATION.md
**Statut**: ⏳ EN ATTENTE VALIDATION UTILISATEUR

---

## 📋 Récapitulatif des 5 Root Causes

| # | Root Cause | Criticité | Impact | Fichiers Concernés |
|---|------------|-----------|--------|-------------------|
| 1 | Prompt Gemini sans consolidation | 🔴 CRITIQUE | Génère 60+ doublons | `lib/ai/prompts.ts` |
| 2 | Threshold 0.85 trop strict | 🔴 CRITIQUE | Laisse passer doublons | `lib/rag/merge-simple.ts` |
| 3 | Mode MERGE uniquement | 🔴 CRITIQUE | Pas de REPLACE | `app/api/rag/generate/route.ts` |
| 4 | Bug deduplicate.ts structure | 🟠 MOYEN | Perte structure réalisations | `lib/rag/deduplicate.ts` |
| 5 | Pas de validation qualité | 🟠 MOYEN | Accepte RAG pollué | `app/api/rag/generate*.ts` |

---

## 🎯 Objectif Global

**Après implémentation, l'utilisateur doit pouvoir**:
1. ✅ Cliquer "Purger doublons" → RAG nettoyé
2. ✅ Cliquer "Régénérer" → RAG de qualité (8-12 réalisations max par expérience)
3. ✅ Voir un diff avant save
4. ✅ Rollback si insatisfait
5. ✅ Zéro doublon sémantique (similarité > 0.75)

---

## 🚀 Phase 1: Fixes Critiques (PRIORITÉ MAXIMALE)

### ✅ FIX #1: Améliorer le Prompt Gemini

**Objectif**: Demander à Gemini de consolider et limiter les réalisations à la source.

**Fichier**: `lib/ai/prompts.ts`

**Changements**:

```diff
// Line 10: AVANT
- MISSION CRITIQUE: Extrais et structure TOUTES les informations avec RIGUEUR MAXIMALE

// APRÈS
+ MISSION CRITIQUE: Extrais et structure les informations ESSENTIELLES avec RIGUEUR MAXIMALE
+
+ ⚠️  RÈGLE DE CONSOLIDATION (NOUVELLE):
+ - Identifie les réalisations similaires ou redondantes
+ - FUSIONNE-LES intelligemment en gardant TOUS les impacts quantifiés
+ - LIMITE: Maximum 8-12 réalisations PAR expérience (garde les + impactantes)
+ - Priorise: Réalisations avec impacts quantifiés > non quantifiés
```

**Ajout après RÈGLE 2 (line ~150)**:

```typescript
📌 RÈGLE 2B: CONSOLIDATION ET PRIORISATION (NOUVEAU)
─────────────────────────────────────────────────────────────────────────────
Quand tu identifies plusieurs réalisations similaires:

1. FUSIONNE-LES intelligemment:
   ✅ BON: "Pilotage de 50+ projets Agile (budget cumulé 15M€) avec réduction délais de 40%"
   ❌ MAUVAIS: Garder séparément:
      - "Pilotage de projets Agile"
      - "Gestion de 50 projets"
      - "Budget de 15M€"

2. LIMITE PAR EXPÉRIENCE:
   - Expériences récentes (<3 ans): 8-12 réalisations MAX
   - Expériences anciennes (>5 ans): 4-6 réalisations MAX
   - Si plus de réalisations disponibles: GARDE LES PLUS IMPACTANTES

3. PRIORISATION:
   1️⃣ Réalisations avec impact quantifié ET prestigieux clients
   2️⃣ Réalisations avec impact quantifié seul
   3️⃣ Réalisations qualitatives (si vraiment pertinentes)

EXEMPLES DE FUSION INTELLIGENTE:

❌ AVANT (3 réalisations séparées):
- "Pilotage du portefeuille projets de la DSI"
- "Gestion centralisée des ressources projets"
- "Utilisation de Planisware Orchestra pour le PPM"

✅ APRÈS (1 réalisation consolidée):
- "Pilotage centralisé du portefeuille projets et ressources de la DSI via Planisware Orchestra"

❌ AVANT (2 réalisations séparées):
- "Mise en place d'audits Qualité"
- "Refonte des méthodologies projet"

✅ APRÈS (1 réalisation fusionnée):
- "Mise en place d'audits Qualité et refonte des méthodologies projet"
```

**Critères d'acceptation**:
- [ ] Gemini génère max 12 réalisations par expérience
- [ ] Réalisations similaires sont fusionnées intelligemment
- [ ] TOUS les impacts quantifiés sont préservés lors de la fusion
- [ ] Priorisation claire (chiffres > qualitatif)

**Tests de validation**:
```bash
# Test avec CV contenant doublons volontaires
npm run test:gemini-consolidation

# Vérifier output
# Expected: 8-10 réalisations consolidées (pas 60)
```

**Risque de régression**: ⚠️ MOYEN
- Gemini pourrait trop consolider et perdre des nuances
- **Mitigation**: Tester sur 5 CVs différents, vérifier aucune perte d'info

---

### ✅ FIX #2: Ajuster le Threshold de Déduplication

**Objectif**: Détecter les doublons sémantiques avec variations de mots.

**Fichier**: `lib/rag/merge-simple.ts`

**Changements**:

```diff
// Line 48: Dans deduplicateRealisations
- areSimilar(r.description || '', real.description || '', 0.85)
+ areSimilar(r.description || '', real.description || '', 0.75)

// Line 187: Dans mergeExperiences
- areSimilar(existReal.description || '', newReal.description || '', 0.85)
+ areSimilar(existReal.description || '', newReal.description || '', 0.75)

// Lines 70, 294, 320, 350, 376, 404: deduplicateStrings
- areSimilar(existing, item, threshold)  // threshold = 0.9
+ areSimilar(existing, item, threshold)  // threshold = 0.85 (plus strict pour strings courts)
```

**Ajout de rules d'exclusion** (nouvelle fonction):

```typescript
/**
 * Check if two realisations should NOT be deduplicated (exclusion rules)
 */
function shouldExcludeFromDeduplication(real1: any, real2: any): boolean {
    const desc1 = (real1.description || '').toLowerCase();
    const desc2 = (real2.description || '').toLowerCase();

    // Rule 1: Different technologies → NOT duplicates
    const techKeywords = ['python', 'java', 'javascript', 'react', 'angular', 'vue',
                          'agile', 'waterfall', 'scrum', 'kanban', 'django', 'spring'];

    for (const tech of techKeywords) {
        const has1 = desc1.includes(tech);
        const has2 = desc2.includes(tech);
        if (has1 !== has2) return true; // One has tech, other doesn't → NOT duplicate
    }

    // Rule 2: Different numeric values → NOT duplicates
    const numbers1 = desc1.match(/\d+/g) || [];
    const numbers2 = desc2.match(/\d+/g) || [];
    if (numbers1.length > 0 && numbers2.length > 0) {
        if (numbers1[0] !== numbers2[0]) return true; // Different main number → NOT duplicate
    }

    return false;
}

// Utiliser dans deduplicateRealisations:
for (const real of realisations) {
    const isDuplicate = result.some(r => {
        if (shouldExcludeFromDeduplication(r, real)) return false;
        return areSimilar(r.description || '', real.description || '', 0.75);
    });

    if (!isDuplicate) {
        result.push(real);
    }
}
```

**Critères d'acceptation**:
- [ ] Test script prouve que 0.75 détecte 90%+ des doublons sémantiques
- [ ] Exclusion rules évitent faux positifs (technos différentes)
- [ ] "Pilotage centralisé..." vs "Gestion du portefeuille..." → Détecté comme doublon
- [ ] "Python backend" vs "Java backend" → PAS détecté comme doublon

**Tests de validation**:
```bash
# Exécuter le script de test
tsx scripts/test-deduplication-threshold.ts

# Expected output:
# Threshold 0.75: 8/9 correct (88.9%) ← RECOMMANDÉ
# Threshold 0.85: 5/9 correct (55.6%) ← ACTUEL
```

**Risque de régression**: ⚠️ FAIBLE
- Risque de sur-suppression (faux positifs)
- **Mitigation**: Exclusion rules + test sur données réelles

---

### ✅ FIX #3: Ajouter Mode REPLACE pour Régénération

**Objectif**: Permettre régénération from scratch sans merger avec ancien RAG.

**Fichier**: `app/api/rag/generate/route.ts`

**Changements**:

```diff
// Line 56: Accepter paramètre mode
- const { userId } = await req.json();
+ const { userId, mode = "merge" } = await req.json();

+ // Validate mode
+ if (mode && !["merge", "replace"].includes(mode)) {
+     return NextResponse.json({
+         error: "Invalid mode. Use 'merge' or 'replace'"
+     }, { status: 400 });
+ }

// Line 303: Logique conditionnelle
  if (existingRag?.completeness_details) {
-     console.log('[MERGE] Merging with existing RAG data (with semantic deduplication)...');
-     const mergeResult = mergeRAGData(existingRag.completeness_details, ragData);
-     finalRAGData = mergeResult.merged;
-     mergeStats = mergeResult.stats;
-     console.log('[MERGE] Stats:', mergeStats);
+     if (mode === "replace") {
+         console.log('[REPLACE] Replacing existing RAG data completely...');
+         finalRAGData = ragData;
+         mergeStats = {
+             itemsAdded: 0,
+             itemsUpdated: 0,
+             itemsKept: 0,
+             mode: "replace"
+         };
+     } else {
+         console.log('[MERGE] Merging with existing RAG data (with semantic deduplication)...');
+         const mergeResult = mergeRAGData(existingRag.completeness_details, ragData);
+         finalRAGData = mergeResult.merged;
+         mergeStats = mergeResult.stats;
+         mergeStats.mode = "merge";
+         console.log('[MERGE] Stats:', mergeStats);
+     }
  }
```

**Fichier**: `app/dashboard/profile/page.tsx`

**Changements UI**:

```diff
// Line 191: Ajouter mode dropdown
const regenerateRAG = async () => {
    if (!userId) {
        alert("⚠️ Erreur: utilisateur non connecté");
        return;
    }

+   // Ask user: MERGE or REPLACE?
+   const mode = confirm(
+       "🔄 Mode de régénération:\n\n" +
+       "✅ OK = REMPLACER (from scratch, recommandé)\n" +
+       "❌ ANNULER = FUSIONNER (ajoute aux données existantes)\n\n" +
+       "Recommandation: REMPLACER pour éviter les doublons"
+   ) ? "replace" : "merge";

    setRegenerating(true);

    try {
        const res = await fetch("/api/rag/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
-           body: JSON.stringify({ userId })
+           body: JSON.stringify({ userId, mode })
        });

        const result = await res.json();

        if (result.success) {
            await refetch();
+           const modeLabel = mode === "replace" ? "remplacé" : "fusionné";
            alert(
-               `✅ RAG régénéré avec succès!\n\n` +
+               `✅ RAG ${modeLabel} avec succès!\n\n` +
                `📊 Documents traités: ${result.processedDocuments}\n` +
                `🎯 Score de qualité: ${result.completenessScore}/100`
            );
        }
    } catch (e: any) {
        alert(`❌ Erreur: ${e.message}`);
    } finally {
        setRegenerating(false);
    }
};
```

**Critères d'acceptation**:
- [ ] Paramètre `mode` accepté dans API (merge | replace)
- [ ] Mode REPLACE ne merge pas, remplace directement
- [ ] Mode MERGE reste le comportement actuel (compatibilité)
- [ ] UI demande à l'utilisateur quel mode (avec recommandation REPLACE)
- [ ] Alert final indique quel mode a été utilisé

**Tests de validation**:
```bash
# Test 1: Mode REPLACE
curl -X POST http://localhost:3000/api/rag/generate \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user-id", "mode": "replace"}'

# Expected: RAG remplacé, mergeStats.mode = "replace"

# Test 2: Mode MERGE (default)
curl -X POST http://localhost:3000/api/rag/generate \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user-id"}'

# Expected: RAG mergé, mergeStats.mode = "merge"
```

**Risque de régression**: ⚠️ FAIBLE
- Si utilisateur a édité manuellement le RAG, mode REPLACE écrase tout
- **Mitigation**: Demander confirmation + expliquer clairement la différence

---

## 🔧 Phase 2: Fixes Importants (PRIORITÉ ÉLEVÉE)

### ✅ FIX #4: Corriger Bug deduplicate.ts (Structure Préservation)

**Objectif**: Retourner array d'objets `{description, impact}`, pas array de strings.

**Fichier**: `lib/rag/deduplicate.ts`

**Changements**:

```diff
// Lines 84-112: mergeExperiences function
function mergeExperiences(exps: Experience[]): Experience {
    const sorted = [...exps].sort((a, b) => {
        const countA = a.realisations?.length || 0;
        const countB = b.realisations?.length || 0;
        return countB - countA;
    });

    const base = { ...sorted[0] };

-   // Merge all unique realisations from all experiences
-   const allRealisations = new Set<string>();
+   // Merge all unique realisations (preserving object structure)
+   const allRealisations: any[] = [];

    for (const exp of exps) {
        if (!exp.realisations) continue;

        for (const real of exp.realisations) {
-           const text = typeof real === 'string' ? real : real.description || JSON.stringify(real);
-           const normalized = text.toLowerCase().replace(/[^\w\s]/g, '').trim();
+           const description = typeof real === 'string' ? real : real.description || '';
+           const impact = typeof real === 'object' ? real.impact : undefined;

            // Only add if not too similar to existing ones
            let isDuplicate = false;
-           for (const existing of allRealisations) {
-               const similarity = calculateSimilarity(normalized, existing.toLowerCase().replace(/[^\w\s]/g, '').trim());
+           for (const existing of allRealisations) {
+               const existingDesc = typeof existing === 'string' ? existing : existing.description || '';
+               const similarity = calculateSimilarity(description, existingDesc);
                if (similarity > 0.85) {
                    isDuplicate = true;
                    break;
                }
            }

            if (!isDuplicate) {
-               allRealisations.add(text);
+               // Preserve object structure
+               if (typeof real === 'object') {
+                   allRealisations.push(real);
+               } else {
+                   allRealisations.push({ description: real });
+               }
            }
        }
    }

-   base.realisations = Array.from(allRealisations);
+   base.realisations = allRealisations;

    return base;
}
```

**Critères d'acceptation**:
- [ ] Réalisations conservent structure `{description, impact}`
- [ ] Test unitaire confirme structure préservée
- [ ] Templates CV affichent correctement description ET impact

**Tests de validation**:
```typescript
// Unit test
const testExp = {
    poste: "Test",
    entreprise: "Test Corp",
    realisations: [
        { description: "Réa 1", impact: "Impact 1" },
        { description: "Réa 2", impact: "Impact 2" },
        { description: "Réa 1 (doublon)", impact: "Impact différent" }
    ]
};

const result = deduplicateExperiences([testExp]);
expect(result[0].realisations).toHaveLength(2);
expect(result[0].realisations[0]).toHaveProperty('description');
expect(result[0].realisations[0]).toHaveProperty('impact');
```

**Risque de régression**: ⚠️ TRÈS FAIBLE
- Structure change mais amélioration pure
- **Mitigation**: Tests unitaires + vérification templates

---

### ✅ FIX #5: Ajouter Validation Qualité Avant Save

**Objectif**: Rejeter RAG de mauvaise qualité et alerter l'utilisateur.

**Fichier**: Créer `lib/rag/quality-validation.ts`

```typescript
/**
 * Quality validation rules for RAG data
 */

export interface ValidationRule {
    name: string;
    validate: (ragData: any) => { passed: boolean; message?: string };
    severity: "error" | "warning";
}

export const qualityRules: ValidationRule[] = [
    {
        name: "max_realisations_per_experience",
        severity: "error",
        validate: (ragData: any) => {
            const experiences = ragData.experiences || [];
            const violations = experiences.filter((exp: any) => {
                const count = exp.realisations?.length || 0;
                return count > 15; // Hard limit
            });

            if (violations.length > 0) {
                return {
                    passed: false,
                    message: `${violations.length} expérience(s) avec plus de 15 réalisations (possible duplication)`
                };
            }

            return { passed: true };
        }
    },
    {
        name: "min_realisations_recent_experience",
        severity: "warning",
        validate: (ragData: any) => {
            const experiences = ragData.experiences || [];
            const currentYear = new Date().getFullYear();

            const recentExps = experiences.filter((exp: any) => {
                const startYear = exp.debut ? parseInt(exp.debut.split('-')[0]) : 0;
                return currentYear - startYear <= 3; // Last 3 years
            });

            const violations = recentExps.filter((exp: any) => {
                const count = exp.realisations?.length || 0;
                return count < 4; // Min 4 for recent jobs
            });

            if (violations.length > 0) {
                return {
                    passed: false,
                    message: `${violations.length} expérience(s) récente(s) avec moins de 4 réalisations (qualité faible)`
                };
            }

            return { passed: true };
        }
    },
    {
        name: "duplicate_detection",
        severity: "warning",
        validate: (ragData: any) => {
            // Run deduplication and compare counts
            const before = {
                experiences: ragData.experiences?.length || 0,
                certifications: ragData.certifications?.length || 0,
                formations: ragData.formations?.length || 0
            };

            const deduplicated = deduplicateRAG(ragData);

            const after = {
                experiences: deduplicated.experiences?.length || 0,
                certifications: deduplicated.certifications?.length || 0,
                formations: deduplicated.formations?.length || 0
            };

            const reduction = {
                experiences: before.experiences - after.experiences,
                certifications: before.certifications - after.certifications,
                formations: before.formations - after.formations
            };

            const totalReduction = Object.values(reduction).reduce((a, b) => a + b, 0);

            if (totalReduction > 5) {
                return {
                    passed: false,
                    message: `${totalReduction} doublons détectés (déduplication recommandée)`
                };
            }

            return { passed: true };
        }
    }
];

export function validateRAGQuality(ragData: any): {
    valid: boolean;
    errors: string[];
    warnings: string[];
} {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const rule of qualityRules) {
        const result = rule.validate(ragData);

        if (!result.passed && result.message) {
            if (rule.severity === "error") {
                errors.push(`❌ ${rule.name}: ${result.message}`);
            } else {
                warnings.push(`⚠️  ${rule.name}: ${result.message}`);
            }
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}
```

**Intégration dans generate/route.ts**:

```diff
// Line 230: Après deduplication
ragData = deduplicateRAG(ragData);
console.log('[DEDUPLICATION] Gemini output deduplicated');

+ // NEW: Validate quality BEFORE saving
+ import { validateRAGQuality } from '@/lib/rag/quality-validation';
+ const validation = validateRAGQuality(ragData);
+
+ console.log('[VALIDATION]', validation);
+
+ if (!validation.valid) {
+     return NextResponse.json({
+         error: "RAG quality validation failed",
+         errorCode: "QUALITY_CHECK_FAILED",
+         errors: validation.errors,
+         warnings: validation.warnings,
+         suggestion: "Veuillez vérifier vos documents ou contacter le support"
+     }, { status: 400 });
+ }
```

**Critères d'acceptation**:
- [ ] RAG avec > 15 réalisations/expérience est rejeté
- [ ] Warning si expérience récente < 4 réalisations
- [ ] Alert si déduplication révèle > 5 doublons
- [ ] Erreurs et warnings renvoyés à l'utilisateur

**Tests de validation**:
```typescript
// Test 1: RAG avec trop de réalisations
const badRAG = {
    experiences: [{
        realisations: new Array(20).fill({ description: "test" })
    }]
};

const result = validateRAGQuality(badRAG);
expect(result.valid).toBe(false);
expect(result.errors).toContain(expect.stringContaining("15 réalisations"));
```

**Risque de régression**: ⚠️ FAIBLE
- Pourrait rejeter RAG valides si règles trop strictes
- **Mitigation**: Warnings (pas errors) pour règles subjectives

---

## 📊 Phase 3: Améliorations Recommandées (NICE TO HAVE)

### 🎨 FIX #6: Diff Visuel Avant Save

**Objectif**: Montrer à l'utilisateur ce qui va changer AVANT de sauvegarder.

**Fichier**: Créer `app/components/RAGDiffViewer.tsx`

```typescript
export function RAGDiffViewer({ before, after }: { before: any; after: any }) {
    const diff = {
        experiences: {
            before: before.experiences?.length || 0,
            after: after.experiences?.length || 0
        },
        realisations: {
            before: /* count all realisations in before */,
            after: /* count all realisations in after */
        },
        certifications: {
            before: before.certifications?.length || 0,
            after: after.certifications?.length || 0
        }
    };

    return (
        <div className="border p-4 rounded-lg">
            <h3 className="font-bold mb-4">📊 Aperçu des changements</h3>

            {Object.entries(diff).map(([key, values]) => (
                <div key={key} className="flex justify-between mb-2">
                    <span>{key}</span>
                    <span>
                        {values.before} → {values.after}
                        {values.after < values.before && (
                            <span className="text-green-600 ml-2">
                                (-{values.before - values.after})
                            </span>
                        )}
                    </span>
                </div>
            ))}

            <button onClick={onConfirm}>✅ Confirmer</button>
            <button onClick={onCancel}>❌ Annuler</button>
        </div>
    );
}
```

---

### 🔄 FIX #7: Versioning + Rollback

**Objectif**: Sauvegarder historique des RAG pour rollback.

**Table Supabase**: Créer `rag_versions`

```sql
CREATE TABLE rag_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    version_number INT,
    completeness_details JSONB,
    completeness_score FLOAT,
    created_at TIMESTAMP DEFAULT NOW(),
    operation TEXT -- "generate", "cleanup", "manual_edit"
);
```

**Logic**: Avant chaque save, créer version dans `rag_versions`.

---

## 📈 Critères de Succès Globaux

### Métriques Quantitatives

| Métrique | Avant | Cible | Méthode de Mesure |
|----------|-------|-------|-------------------|
| Réalisations/expérience (moyenne) | 60+ | 8-12 | Count dans RAG |
| Doublons sémantiques détectés | 55% | 90%+ | Script de test |
| Quality score moyen | 60/100 | 75/100 | calculateQualityScore() |
| Temps génération (incremental) | <10s | <10s | API response time |
| User satisfaction | 2/5 | 4/5 | User feedback |

### Tests d'Acceptance Utilisateur

- [ ] User clique "Purger doublons" → RAG nettoyé (max 12 réa/exp)
- [ ] User clique "Régénérer" en mode REPLACE → RAG de qualité
- [ ] Zéro doublon sémantique après cleanup
- [ ] Diff visuel affiche changements avant save
- [ ] Quality score > 75/100

---

## 🚨 Risques et Mitigations

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|-----------|
| Gemini sur-consolide (perte info) | Moyenne | Élevé | Tester sur 5 CVs, vérifier aucune perte |
| Threshold 0.75 trop permissif | Faible | Moyen | Exclusion rules + tests |
| Mode REPLACE écrase éditions manuelles | Faible | Élevé | Demander confirmation claire |
| Validation trop stricte (rejets valides) | Faible | Moyen | Warnings (pas errors) pour règles subjectives |

---

## ⏱️ Timeline Recommandée

### Semaine 1: Fixes Critiques
- Jour 1-2: FIX #1 (Prompt Gemini) + Tests
- Jour 3-4: FIX #2 (Threshold) + Script validation
- Jour 5: FIX #3 (Mode REPLACE) + UI

### Semaine 2: Fixes Importants + Tests
- Jour 6-7: FIX #4 (Bug deduplicate.ts) + FIX #5 (Validation)
- Jour 8-9: Tests end-to-end sur 10 CVs réels
- Jour 10: Déploiement staging + User acceptance testing

### Semaine 3: Améliorations + Production
- Jour 11-12: FIX #6 (Diff visuel)
- Jour 13-14: FIX #7 (Versioning)
- Jour 15: Déploiement production

---

## ✅ Checklist Avant Déploiement

### Tests
- [ ] Script `test-deduplication-threshold.ts` passe à 90%+
- [ ] Tests unitaires (déduplication, validation, merge)
- [ ] Tests integration (generate API, cleanup API)
- [ ] Tests E2E (user flow complet)

### Code Quality
- [ ] Pas de TypeScript errors
- [ ] Pas de console.log oubliés
- [ ] Code reviewed
- [ ] Documentation updated

### User Acceptance
- [ ] Testé sur 10 CVs réels
- [ ] User peut cleanup + régénérer sans doublons
- [ ] Quality score > 75/100 en moyenne

### Déploiement
- [ ] Merge to main branch
- [ ] Deploy to Vercel
- [ ] Monitor logs for 24h
- [ ] Collect user feedback

---

## 🔍 Post-Déploiement: Monitoring

**Métriques à surveiller**:
- Nombre moyen de réalisations/expérience
- Taux de rejection (validation quality)
- Quality score distribution
- User feedback (doublons signalés?)

**Alertes**:
- Si quality score < 60 sur > 10% des RAG → Investigate
- Si > 20% de rejections par validation → Rules trop strictes
- Si user feedback négatif → Rollback et debug

---

**Fin du plan d'implémentation** 🛠️
