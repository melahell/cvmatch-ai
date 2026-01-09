# 📋 PRINCIPE DE CRÉATION ET MISE À JOUR DU RAG - CVMatch AI

## 🎯 Vue d'Ensemble

Le système RAG doit gérer **3 scénarios distincts** avec des logiques différentes :

```
┌─────────────────────────────────────────────────────────────┐
│  SCÉNARIO 1 : CRÉATION INITIALE                             │
│  • Aucun RAG existant                                        │
│  • Génération complète depuis zéro                           │
│  • Application de toutes les règles d'enrichissement         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  SCÉNARIO 2 : COMPLÉTION / MISE À JOUR                      │
│  • RAG existant présent                                      │
│  • Nouveaux documents ajoutés                                │
│  • FUSION intelligente : enrichir sans dupliquer             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  SCÉNARIO 3 : RÉGÉNÉRATION COMPLÈTE                         │
│  • RAG existant présent                                      │
│  • User demande "régénérer depuis zéro"                      │
│  • ÉCRASE tout et repart à zéro                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 ARCHITECTURE DU RAG ENRICHI

### Structure Globale

```typescript
interface RAGData {
  // ========== DONNÉES EXPLICITES (depuis documents) ==========
  profil: {
    identite: { ... },
    contact: { ... },
    elevator_pitch: string,
    // ...
  },
  experiences: Experience[],
  competences: {
    explicit: { ... },
    inferred: { ... }
  },
  formations: Formation[],
  certifications: string[],
  langues: Record<string, string>,
  projets: Projet[],
  references: References,
  
  // ========== ENRICHISSEMENT CONTEXTUEL (déduit par IA) ==========
  contexte_enrichi: {
    responsabilites_implicites: ResponsabiliteImplicite[],
    competences_tacites: CompetenceTacite[],
    soft_skills_deduites: string[],
    environnement_travail: EnvironnementTravail
  },
  
  // ========== MÉTADONNÉES SYSTÈME ==========
  metadata: {
    version: string,                    // "1.0", "1.1", "2.0"
    creation_date: string,
    last_update: string,
    update_mode: "creation" | "completion" | "regeneration",
    documents_sources: DocumentSource[],
    gemini_model_used: "pro" | "flash",
    merge_stats?: MergeStats            // Si fusion effectuée
  },
  
  // ========== QUALITÉ ==========
  quality_metrics: QualityMetrics,
  extraction_metadata: ExtractionMetadata,
  validation_warnings: ValidationWarning[]
}
```

### Nouvelles Structures pour l'Enrichissement

```typescript
interface ResponsabiliteImplicite {
  categorie: "Gouvernance" | "Budget" | "Stakeholders" | "Qualité" | 
             "Conformité" | "Gestion_Crise" | "Reporting" | "Change_Management",
  actions: string[],
  niveau_certitude: "Très probable" | "Probable" | "Possible",
  justification: string,
  source_experience_id?: string   // Lien vers l'expérience concernée
}

interface CompetenceTacite {
  competence: string,
  niveau_deduit: "Expert" | "Avancé" | "Intermédiaire",
  contexte: string,               // Pourquoi on déduit ce niveau
  source_experience_ids: string[] // Quelles expériences justifient
}

interface EnvironnementTravail {
  complexite_organisationnelle: "Très élevée" | "Élevée" | "Moyenne" | "Faible",
  niveau_autonomie: "Très élevé" | "Élevé" | "Moyen" | "Faible",
  exposition_direction: "Très élevée" | "Élevée" | "Moyenne" | "Faible",
  criticite_missions: "Très élevée" | "Élevée" | "Moyenne" | "Faible",
  environnement_multiculturel: boolean,
  langues_travail: string[]
}

interface DocumentSource {
  filename: string,
  upload_date: string,
  extraction_status: "processed" | "partial" | "failed",
  sections_extracted: string[]    // ["profil", "experiences", "competences"]
}

interface MergeStats {
  experiences: { added: number, updated: number, kept: number },
  competences: { added: number, kept: number },
  clients: { added: number, kept: number },
  total_changes: number
}
```

---

## 🔄 LOGIQUE DE FUSION INTELLIGENTE

### Principe Fondamental

> **"Enrichir sans dupliquer, Préserver l'intention utilisateur"**

### Règles de Fusion par Section

#### 1. PROFIL (Identité, Contact, Elevator Pitch)

```yaml
Stratégie: PRÉFÉRENCE À LA PLUS RÉCENTE ET COMPLÈTE

Règles:
  - Nom/Prénom: Garder non-vide le plus récent
  - Titre: Garder le plus long/descriptif
  - Elevator Pitch: 
      • Si nouveau > 200 chars ET ancien < 200 chars → prendre nouveau
      • Si les deux > 200 chars → prendre le plus récent
      • Si le nouveau est vide → garder ancien
  - Contact (email, téléphone, LinkedIn):
      • Union des champs non-vides
      • Si conflit → préférence au plus récent
  - Photo: Prendre la plus récente si présente
```

**Exemple de fusion :**

```
ANCIEN:
  nom: "Gozlan"
  prenom: "Gilles"
  titre: "PMO"
  elevator_pitch: "PMO expérimenté" (18 chars)
  
NOUVEAU:
  nom: "GOZLAN"
  prenom: "Gilles"
  titre: "PMO & Quality Manager"
  elevator_pitch: "PMO & Quality Manager avec 10+ ans..." (250 chars)
  
RÉSULTAT FUSION:
  nom: "GOZLAN"                           ← Plus récent
  prenom: "Gilles"                        ← Identique
  titre: "PMO & Quality Manager"          ← Plus complet
  elevator_pitch: "PMO & Quality Mana..." ← Plus long + récent
```

#### 2. EXPÉRIENCES (Section Critique)

```yaml
Stratégie: FUSION PAR SIMILARITÉ INTELLIGENTE

Critères de similarité (dans l'ordre):
  1. Même entreprise (normalisation: "bnp" = "BNP Paribas")
  2. Chevauchement de dates (±6 mois de tolérance)
  3. Même poste (ou postes très similaires)

Algorithme de fusion:
  POUR chaque nouvelle expérience:
    SI existe expérience similaire dans ancien RAG:
      → FUSIONNER:
          • Dates: Prendre la plage la plus large
          • Poste: Garder le titre le plus détaillé
          • Réalisations: UNION (dédupliquer par contenu similaire)
          • Technologies: UNION (dédupliquer)
          • Clients: UNION (dédupliquer)
          • Marquer: merged_from: [ancien_id, nouveau_id]
    SINON:
      → AJOUTER comme nouvelle expérience
```

**Fonction de similarité d'expériences :**

```typescript
function areExperiencesSimilar(exp1: Experience, exp2: Experience): boolean {
  // 1. Normaliser les noms d'entreprises
  const company1 = normalizeCompanyName(exp1.entreprise);
  const company2 = normalizeCompanyName(exp2.entreprise);
  
  if (company1 !== company2) return false;
  
  // 2. Vérifier chevauchement de dates (±6 mois)
  const start1 = parseDate(exp1.debut);
  const start2 = parseDate(exp2.debut);
  const end1 = exp1.fin ? parseDate(exp1.fin) : new Date();
  const end2 = exp2.fin ? parseDate(exp2.fin) : new Date();
  
  const monthsDiff = Math.abs(differenceInMonths(start1, start2));
  if (monthsDiff > 6) return false;
  
  // 3. Vérifier similarité des postes (Levenshtein distance)
  const positionSimilarity = stringSimilarity(exp1.poste, exp2.poste);
  if (positionSimilarity < 0.6) return false;  // 60% de similarité min
  
  return true;
}
```

**Exemple de fusion d'expériences :**

```
ANCIEN:
  {
    id: "exp1",
    entreprise: "VW FS",
    poste: "PMO",
    debut: "2023-04",
    fin: null,
    realisations: [
      { description: "Gestion portefeuille 150 projets" },
      { description: "Déploiement Orchestra" }
    ],
    technologies: ["Planisware", "Orchestra"]
  }

NOUVEAU:
  {
    entreprise: "Volkswagen Financial Services",
    poste: "PMO & Quality Manager",
    debut: "2023-04",
    fin: null,
    realisations: [
      { description: "Supervision portfolio DSI" },
      { description: "Audits qualité ISO 9001" }
    ],
    technologies: ["Planisware", "Orchestra", "ISO 9001"]
  }

RÉSULTAT FUSION:
  {
    id: "exp1",
    entreprise: "Volkswagen Financial Services",  ← Plus complet
    poste: "PMO & Quality Manager",               ← Plus précis
    debut: "2023-04",
    fin: null,
    realisations: [
      { description: "Gestion portefeuille 150 projets" },    ← Gardé
      { description: "Déploiement Orchestra" },                ← Gardé
      { description: "Supervision portfolio DSI" },            ← Ajouté (similaire mais différent)
      { description: "Audits qualité ISO 9001" }               ← Ajouté (nouveau)
    ],
    technologies: ["Planisware", "Orchestra", "ISO 9001"],     ← Union
    metadata: {
      merged_from: ["exp1_ancien", "exp_nouveau"],
      last_update: "2025-01-09"
    }
  }
```

**Déduplication intelligente des réalisations :**

```typescript
function deduplicateRealisations(
  anciennesRealisations: Realisation[], 
  nouvellesRealisations: Realisation[]
): Realisation[] {
  
  const merged: Realisation[] = [...anciennesRealisations];
  
  for (const nouvelle of nouvellesRealisations) {
    // Vérifier si une réalisation similaire existe déjà
    const existe = merged.some(ancienne => {
      const similarity = stringSimilarity(
        ancienne.description, 
        nouvelle.description
      );
      return similarity > 0.75; // 75% de similarité = doublon
    });
    
    if (!existe) {
      merged.push(nouvelle);  // Ajouter uniquement si vraiment nouvelle
    }
  }
  
  return merged;
}
```

#### 3. COMPÉTENCES

```yaml
Stratégie: ACCUMULATION INTELLIGENTE

Compétences EXPLICITES:
  - Union simple (dédupliquer par nom normalisé)
  - Préférence aux noms les plus complets
  - Exemple: "React" + "React.js" → "React.js"

Compétences INFÉRÉES:
  - JAMAIS écraser
  - Ajouter seulement si nouvelle compétence
  - Si même compétence mais confidence différente:
      → Garder celle avec confidence la plus élevée
      → Merger les sources et reasonings
  - Respecter les rejected_inferred (l'utilisateur les a refusées)

Règles spéciales:
  - Si utilisateur a rejeté une compétence inférée → ne JAMAIS la réinjecter
  - Tracked dans: rag_data.rejected_inferred = ["Compétence X"]
```

**Exemple de fusion compétences :**

```
ANCIEN:
  explicit:
    techniques: ["Python", "React", "AWS"]
  inferred:
    techniques: [
      { name: "Docker", confidence: 75, reasoning: "..." }
    ]
  rejected_inferred: ["Kubernetes"]  // User a dit NON

NOUVEAU:
  explicit:
    techniques: ["Python", "React.js", "PostgreSQL"]
  inferred:
    techniques: [
      { name: "Docker", confidence: 82, reasoning: "...meilleur contexte" },
      { name: "Kubernetes", confidence: 78, reasoning: "..." }
    ]

RÉSULTAT FUSION:
  explicit:
    techniques: ["Python", "React.js", "AWS", "PostgreSQL"]  ← Union
  inferred:
    techniques: [
      { 
        name: "Docker", 
        confidence: 82,                    ← Plus élevé gardé
        reasoning: "...meilleur contexte", ← Plus récent
        sources: [...ancien, ...nouveau]   ← Merged
      }
      // Kubernetes EXCLU car dans rejected_inferred
    ]
  rejected_inferred: ["Kubernetes"]
```

#### 4. CLIENTS & RÉFÉRENCES

```yaml
Stratégie: CONSOLIDATION PAR SECTEUR + TRACKING SOURCE

Processus:
  1. Extraire tous les clients (ancien + nouveau)
  2. Normaliser les noms (BNP → BNP Paribas)
  3. Mapper les secteurs automatiquement
  4. Dédupliquer par nom normalisé
  5. Merger les sources de mention
  6. Trier par fréquence de mention

Tracking:
  - Chaque client garde: sources: [{ exp_id, date }]
  - Permet de savoir d'où vient l'info
```

**Exemple :**

```
ANCIEN:
  clients: [
    { 
      nom: "BNP", 
      secteur: "Finance",
      sources: [{ exp_id: "exp1", date: "2023-04" }]
    }
  ]

NOUVEAU:
  clients: [
    { 
      nom: "BNP Paribas", 
      secteur: "Finance",
      sources: [{ exp_id: "exp2", date: "2025-01" }]
    }
  ]

RÉSULTAT FUSION:
  clients: [
    {
      nom: "BNP Paribas",                           ← Nom normalisé
      secteur: "Finance",
      sources: [
        { exp_id: "exp1", date: "2023-04" },       ← Ancien
        { exp_id: "exp2", date: "2025-01" }        ← Nouveau
      ],
      frequence_mention: 2                          ← Comptabilisé
    }
  ]
```

#### 5. FORMATIONS & CERTIFICATIONS

```yaml
Stratégie: DÉDUPLICATION STRICTE PAR IDENTITÉ

Formations:
  - Même diplôme + même école + année ±1 → DUPLIQUER
  - Sinon → AJOUTER
  - Garder la version avec le plus de détails

Certifications:
  - Déduplication par nom exact (case insensitive)
  - Si dates différentes → garder la plus récente
```

#### 6. CONTEXTE ENRICHI (Nouveau)

```yaml
Stratégie: RÉGÉNÉRATION À CHAQUE FOIS

Pourquoi?
  - Le contexte enrichi dépend de TOUTES les expériences
  - Si on fusionne des expériences, le contexte change
  - Pas de sens à fusionner des déductions

Processus:
  - Après fusion des données explicites
  - Régénérer COMPLÈTEMENT le contexte_enrichi
  - Basé sur le RAG fusionné final
```

---

## 🔧 WORKFLOW DE GÉNÉRATION/MISE À JOUR

### Détection du Mode

```typescript
async function detectUpdateMode(userId: string): Promise<UpdateMode> {
  const { data: existingRag } = await supabase
    .from("rag_metadata")
    .select("completeness_details, created_at")
    .eq("user_id", userId)
    .single();
  
  if (!existingRag) {
    return "creation";  // Aucun RAG → création initiale
  }
  
  // Vérifier l'intention utilisateur via un flag
  const userIntent = await getUserIntent(userId);  // "complete" | "regenerate"
  
  if (userIntent === "regenerate") {
    return "regeneration";
  }
  
  return "completion";  // Par défaut, on complète
}
```

### Pipeline Unifié avec Branchements

```typescript
async function generateOrUpdateRAG(
  userId: string, 
  documents: Document[],
  mode?: "creation" | "completion" | "regeneration"
) {
  
  // ========== PHASE 1 : DÉTECTION MODE ==========
  const updateMode = mode || await detectUpdateMode(userId);
  
  logger.info(`RAG update mode: ${updateMode}`);
  
  // ========== PHASE 2 : EXTRACTION TEXTE ==========
  const extractedText = await extractTextFromDocuments(documents);
  
  // ========== PHASE 3 : GÉNÉRATION RAG PAR IA ==========
  const newRAG = await generateRAGFromText(extractedText);
  
  // Ajouter metadata
  newRAG.metadata = {
    update_mode: updateMode,
    creation_date: new Date().toISOString(),
    documents_sources: documents.map(d => ({
      filename: d.name,
      upload_date: d.uploadedAt,
      extraction_status: "processed"
    }))
  };
  
  // ========== PHASE 4 : ENRICHISSEMENT CONTEXTUEL (NOUVEAU) ==========
  newRAG.contexte_enrichi = await generateContexteEnrichi(newRAG);
  
  // ========== PHASE 5 : VALIDATION ==========
  const validation = validateRAGData(newRAG);
  newRAG.validation_warnings = validation.warnings;
  
  // ========== PHASE 6 : FUSION (si mode completion) ==========
  let finalRAG = newRAG;
  
  if (updateMode === "completion") {
    const { data: existingRag } = await supabase
      .from("rag_metadata")
      .select("completeness_details")
      .eq("user_id", userId)
      .single();
    
    if (existingRag?.completeness_details) {
      const mergeResult = mergeRAGIntelligent(
        existingRag.completeness_details,  // Ancien
        newRAG                             // Nouveau
      );
      
      finalRAG = mergeResult.merged;
      finalRAG.metadata.merge_stats = mergeResult.stats;
      
      logger.info("RAG merged", mergeResult.stats);
    }
  }
  
  if (updateMode === "regeneration") {
    // Écraser complètement
    finalRAG.metadata.version = incrementVersion(existingRag.metadata.version);
    logger.info("RAG regenerated from scratch");
  }
  
  // ========== PHASE 7 : SCORING QUALITÉ ==========
  finalRAG.quality_metrics = calculateQualityScore(finalRAG);
  
  // ========== PHASE 8 : SAUVEGARDE ==========
  await supabase.from("rag_metadata").upsert({
    user_id: userId,
    completeness_details: finalRAG,
    completeness_score: finalRAG.quality_metrics.overall_score,
    last_updated: new Date().toISOString()
  });
  
  return finalRAG;
}
```

---

## 🧠 GÉNÉRATION DU CONTEXTE ENRICHI

### Nouveau Prompt Gemini (Phase 4)

```typescript
const PROMPT_CONTEXTE_ENRICHI = `
Tu es un expert RH / Recruteur senior.

PROFIL RAG (données explicites) :
${JSON.stringify(ragData)}

MISSION :
Déduis les RESPONSABILITÉS IMPLICITES et COMPÉTENCES TACITES basées sur :
- Type de poste + séniorité
- Secteur d'activité
- Taille & type d'entreprise
- Contexte des missions
- Années d'expérience

RÈGLES CRITIQUES :
- Niveau certitude : "Très probable" (90%+), "Probable" (70-90%), "Possible" (50-70%)
- Justification OBLIGATOIRE pour chaque déduction
- Reste CONSERVATEUR : mieux sous-estimer que sur-interpréter
- Lie chaque déduction à une expérience spécifique (via exp_id)

OUTPUT (JSON uniquement) :
{
  "responsabilites_implicites": [
    {
      "categorie": "Gouvernance|Budget|Stakeholders|...",
      "actions": ["action1", "action2"],
      "niveau_certitude": "Très probable|Probable|Possible",
      "justification": "Pourquoi cette déduction",
      "source_experience_id": "exp1"
    }
  ],
  "competences_tacites": [
    {
      "competence": "Gestion conflits & arbitrages",
      "niveau_deduit": "Expert|Avancé|Intermédiaire",
      "contexte": "Justification contextuelle",
      "source_experience_ids": ["exp1", "exp2"]
    }
  ],
  "soft_skills_deduites": [
    "Leadership transversal",
    "Diplomatie corporate",
    ...
  ],
  "environnement_travail": {
    "complexite_organisationnelle": "Très élevée",
    "niveau_autonomie": "Élevé",
    "exposition_direction": "Très élevée",
    "criticite_missions": "Élevée",
    "environnement_multiculturel": true,
    "langues_travail": ["Français", "Anglais"]
  }
}

EXEMPLES DE DÉDUCTIONS :

ENTRÉE :
Poste: "PMO chez Volkswagen Financial Services"
Expérience: 7 ans Finance
Gestion: "150+ projets/an"

SORTIE ATTENDUE :
{
  "responsabilites_implicites": [
    {
      "categorie": "Gouvernance",
      "actions": [
        "Animation de COPIL/CODIR projets stratégiques",
        "Comités de portefeuille mensuels",
        "Points synchronisation avec HQ Allemagne"
      ],
      "niveau_certitude": "Très probable",
      "justification": "PMO dans grande structure internationale (VW) + interface siège = gouvernance lourde obligatoire",
      "source_experience_id": "exp_vw_fs"
    },
    {
      "categorie": "Budget",
      "actions": [
        "Consolidation budgétaire portefeuille DSI",
        "Forecast mensuel/trimestriel",
        "Analyse écarts budget vs réalisé"
      ],
      "niveau_certitude": "Très probable",
      "justification": "Gestion de 150+ projets/an en secteur finance = pilotage budgétaire multi-millions € certain",
      "source_experience_id": "exp_vw_fs"
    }
  ],
  "competences_tacites": [
    {
      "competence": "Gestion conflits & arbitrages ressources",
      "niveau_deduit": "Expert",
      "contexte": "7 ans dans structure complexe + gestion portfolio large = arbitrages quotidiens",
      "source_experience_ids": ["exp_vw_fs", "exp_assystem"]
    }
  ],
  "soft_skills_deduites": [
    "Leadership transversal",
    "Diplomatie corporate",
    "Résilience sous pression"
  ],
  "environnement_travail": {
    "complexite_organisationnelle": "Très élevée",
    "niveau_autonomie": "Élevé",
    "exposition_direction": "Très élevée",
    "criticite_missions": "Élevée",
    "environnement_multiculturel": true,
    "langues_travail": ["Français", "Anglais"]
  }
}
`;
```

---

## 📈 IMPACT SUR LE MATCHING

### Avant (RAG actuel)

```
Offre demande: "Expérience animation COPIL et gestion budgets"

RAG actuel:
  experiences: [
    { poste: "PMO", realisations: ["Gestion portefeuille"] }
  ]

Match: 65%
Gaps: 
  - ❌ Pas de mention "COPIL"
  - ❌ Pas de mention "budgets"
```

### Après (RAG enrichi)

```
Offre demande: "Expérience animation COPIL et gestion budgets"

RAG enrichi:
  experiences: [
    { poste: "PMO", realisations: ["Gestion portefeuille"] }
  ]
  contexte_enrichi:
    responsabilites_implicites: [
      { categorie: "Gouvernance", actions: ["Animation COPIL"], certitude: "Très probable" },
      { categorie: "Budget", actions: ["Consolidation budgétaire"], certitude: "Très probable" }
    ]

Match: 92%
Forces:
  - ✅ Animation COPIL déduite (très probable)
  - ✅ Gestion budgets déduite (très probable)
```

---

## ⚠️ CORRECTIFS NÉCESSAIRES

### 1. Bug Actuel : Duplication lors de Régénération

**Cause :**
```typescript
// Code actuel (lib/rag/merge-simple.ts)
if (existingRag?.completeness_details) {
  const mergeResult = mergeRAGData(existingRag.completeness_details, ragData);
  finalRAGData = mergeResult.merged;
}
```

**Problème :** Cette fusion s'exécute TOUJOURS, même en mode "régénération".

**Solution :**
```typescript
// Vérifier l'intention utilisateur
const userIntent = await getUserIntent(userId);

if (userIntent === "complete" && existingRag?.completeness_details) {
  // Fusion intelligente
  finalRAGData = mergeRAGIntelligent(existingRag.completeness_details, ragData);
} else if (userIntent === "regenerate") {
  // Écraser complètement
  finalRAGData = ragData;
  finalRAGData.metadata.regenerated_from_version = existingRag.metadata.version;
} else {
  // Création initiale
  finalRAGData = ragData;
}
```

### 2. Amélioration Fonction de Similarité

**Actuel (trop strict) :**
```typescript
function areExperiencesSimilar(exp1: any, exp2: any): boolean {
    if (exp1.entreprise !== exp2.entreprise) return false;  // ❌ Trop strict
    
    const yearDiff = Math.abs(
        new Date(exp1.debut).getFullYear() - 
        new Date(exp2.debut).getFullYear()
    );
    
    return yearDiff <= 1;  // ❌ Trop strict
}
```

**Amélioré :**
```typescript
function areExperiencesSimilar(exp1: any, exp2: any): boolean {
    // 1. Normaliser entreprises (BNP = BNP Paribas)
    const company1 = normalizeCompanyName(exp1.entreprise);
    const company2 = normalizeCompanyName(exp2.entreprise);
    
    if (company1 !== company2) return false;
    
    // 2. Vérifier chevauchement dates (±6 mois de tolérance)
    const start1 = parseDate(exp1.debut);
    const start2 = parseDate(exp2.debut);
    
    const monthsDiff = Math.abs(differenceInMonths(start1, start2));
    if (monthsDiff > 6) return false;  // 6 mois au lieu de 1 an
    
    // 3. Vérifier similarité postes (fuzzy matching)
    const positionSimilarity = stringSimilarity(exp1.poste, exp2.poste);
    if (positionSimilarity < 0.6) return false;  // 60% de similarité
    
    return true;
}
```

### 3. Ajout Interface Utilisateur

**Dans le frontend, ajouter un choix explicite :**

```typescript
// Lors de l'upload de nouveaux documents

<Button onClick={() => handleUpload("complete")}>
  Compléter mon profil
  <span className="text-xs">Enrichir sans supprimer</span>
</Button>

<Button onClick={() => handleUpload("regenerate")} variant="outline">
  Régénérer depuis zéro
  <span className="text-xs text-red-600">⚠️ Écrase l'existant</span>
</Button>
```

---

## 📋 CHECKLIST D'IMPLÉMENTATION

### Phase 1 : Correction du Bug de Duplication
- [ ] Ajouter paramètre `mode` à l'API `/api/rag/generate`
- [ ] Implémenter `detectUpdateMode()` ou accepter le mode depuis le frontend
- [ ] Ajouter condition `if (mode === "regeneration")` pour bypass merge
- [ ] Tester : régénération ne duplique plus
- [ ] Tester : complétion fusionne correctement

### Phase 2 : Amélioration de la Fusion
- [ ] Implémenter `normalizeCompanyName()` (BNP → BNP Paribas)
- [ ] Améliorer `areExperiencesSimilar()` avec fuzzy matching
- [ ] Implémenter `deduplicateRealisations()` par similarité de texte
- [ ] Implémenter fusion intelligente des compétences (respecter `rejected_inferred`)
- [ ] Tester : fusion ne crée plus de doublons

### Phase 3 : Enrichissement Contextuel
- [ ] Créer `types/contexte-enrichi.ts` avec nouvelles interfaces
- [ ] Implémenter prompt `PROMPT_CONTEXTE_ENRICHI` dans `lib/ai/prompts.ts`
- [ ] Créer fonction `generateContexteEnrichi()` dans `lib/rag/contexte.ts`
- [ ] Intégrer dans le pipeline après génération RAG initial
- [ ] Tester : contexte généré avec justifications pertinentes

### Phase 4 : Mise à Jour du Matching
- [ ] Modifier `getMatchAnalysisPrompt()` pour inclure `contexte_enrichi`
- [ ] Tester : match scores augmentent avec le contexte enrichi
- [ ] Vérifier : les responsabilités implicites sont bien utilisées dans le matching

### Phase 5 : Interface Utilisateur
- [ ] Ajouter boutons "Compléter" vs "Régénérer" dans l'upload
- [ ] Afficher stats de merge après fusion (items added/updated/kept)
- [ ] Afficher section "Contexte Enrichi" dans le profil RAG
- [ ] Permettre à l'utilisateur de valider/rejeter les déductions

---

## 🎯 RÉSUMÉ EXÉCUTIF

### Problèmes Identifiés

1. **Bug critique** : Régénération duplique au lieu d'écraser
2. **Manque d'enrichissement** : Le RAG capture uniquement l'explicite, rate l'implicite
3. **Fusion trop stricte** : Ne reconnaît pas les variations de noms d'entreprises
4. **Pas de choix utilisateur** : Pas de distinction complétation vs régénération

### Solutions Proposées

1. **3 modes distincts** : Création, Complétion, Régénération
2. **Enrichissement contextuel** : Nouvelle section `contexte_enrichi` avec responsabilités implicites
3. **Fusion intelligente** : Normalisation, fuzzy matching, déduplication par similarité
4. **Interface explicite** : Boutons distincts pour choisir le mode

### Bénéfices Attendus

- **Match scores +15-25%** grâce à l'enrichissement contextuel
- **Zéro duplication** en régénération
- **Fusion sans perte** en complétion
- **Découverte d'opportunités** via les responsabilités implicites

### Prochaine Étape

Tu veux que je génère :
1. Le **prompt complet** pour l'enrichissement contextuel ?
2. Le **code de la fonction de fusion intelligente** ?
3. Les **modifications API** pour gérer les 3 modes ?

Dis-moi par quoi commencer ! 🚀