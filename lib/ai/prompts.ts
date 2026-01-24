
import { UserProfile, JobAnalysis } from "@/types";

export const getRAGExtractionPrompt = (extractedText: string, existingRAGContext?: string) => `
Tu es un expert en extraction et structuration de données professionnelles.

${existingRAGContext ? `${existingRAGContext}\n\n` : ""}NOUVEAU DOCUMENT À TRAITER:
${extractedText}

══════════════════════════════════════════════════════════════════════════════
MISSION CRITIQUE: Extrais et structure les informations ESSENTIELLES avec RIGUEUR MAXIMALE.
══════════════════════════════════════════════════════════════════════════════

⚠️  RÈGLE DE CONSOLIDATION (CRITIQUE):
- Identifie les réalisations similaires ou redondantes
- FUSIONNE-LES intelligemment en gardant TOUS les impacts quantifiés
- LIMITE: Maximum 8-12 réalisations PAR expérience (garde les + impactantes)
- Priorise: Réalisations avec impacts quantifiés > non quantifiés

${existingRAGContext ? `⚠️ CONTEXTE ACCUMULÉ: Tu as déjà un RAG avec des expériences, compétences, formations, etc.
⚠️ TA MISSION: Enrichis ce RAG existant avec les nouvelles informations du document ci-dessus.
⚠️ RÈGLES D'ENRICHISSEMENT:
  * Si le nouveau document parle d'une expérience DÉJÀ dans le RAG → ENRICHIS cette expérience (ajoute les réalisations manquantes, combine les détails)
  * Si le nouveau document mentionne une réalisation similaire à une existante → COMBINE-LES (union, ne perds rien)
  * Si le nouveau document liste 11 responsabilités et le RAG existant en a 7 → PRENDS TOUTES (11 au total)
  * Si le nouveau document mentionne "reporting" et le RAG existant mentionne "Excel" → ASSOCIE-LES dans la même réalisation
  * Si le nouveau document ajoute des compétences non présentes → AJOUTE-LES
  * Si plusieurs documents parlent de la même expérience → AGRÈGE TOUS les détails (union complète)
  * Si le nouveau document contredit le RAG existant → PRIORITÉ au document le plus détaillé et récent
  * Si un document est plus riche qu'un autre → Utilise le document riche pour enrichir le document pauvre
` : `⚠️ PREMIER DOCUMENT: C'est le premier document, crée le RAG de base.
⚠️ Extrais les informations ESSENTIELLES présentes dans le document.
⚠️ Applique la RÈGLE DE CONSOLIDATION ci-dessus pour limiter à 8-12 réalisations max par expérience.
`}

RÈGLES ANTI-HALLUCINATION (OBLIGATOIRES - CRITIQUES)
1) ⛔ INTERDICTION ABSOLUE d'inventer : poste, entreprise, dates, chiffres, clients, certifications, diplômes, projets.
2) ✅ AUTORISATION D'INFÉRENCE CONTRÔLÉE : Tu es autorisé à déduire les outils standards et étapes logiques implicites liées à un poste (ex: déduire l'usage d'Excel/Office pour du reporting, de Jira pour de l'Agile, de SharePoint pour de la collaboration) TANT QUE :
   - Cela reste cohérent avec le niveau de séniorité et le secteur
   - Tu marques l'élément comme "is_inferred: true"
   - Tu fournis une justification dans "inference_justification" (min 30 caractères)
   - Tu cites la phrase source qui justifie cette déduction
3) ⛔ Si le RAG existant contient une info et le nouveau document ne la mentionne pas → CONSERVE-LA du RAG existant.
4) ⛔ Les CHIFFRES et KPI (%, budgets, volumes, dates précises) ne doivent apparaître QUE s'ils existent textuellement dans les documents. JAMAIS d'invention de chiffres.
5) Pour chaque information importante, ajoute des SOURCES (citations exactes tirées du texte fourni).
   - Une source = un extrait court et exact (copié-collé), pas une paraphrase.
   - Maximum 2 sources par item pour limiter la taille.
6) Ne transforme pas un diplôme/certification en titre professionnel.

OBJECTIF DE RICHESSE (CRITIQUE)
- Le RAG est une base de connaissance COMPLÈTE (pas un CV 1 page).
- Pour CHAQUE expérience, extrais un maximum de détails actionnables (missions, responsabilités, process, outils, livrables).
- Si une phrase contient une responsabilité (“reporting”, “pilotage”, “suivi”, “coordination”, “gouvernance”, “budget”, “qualité”), transforme-la en 4 à 8 réalisations CONCRÈTES.
- Si plusieurs sources mentionnent la même responsabilité, combine TOUS les détails de toutes les sources (union complète, ne perds rien).
- Tu peux ajouter des éléments “logiquement induits” UNIQUEMENT s’ils sont directement supportés par une mention explicite dans le texte :
  - Dans ce cas, marque l’item comme inféré et cite la phrase source explicite.
  - Ne mets JAMAIS de chiffres sur un item inféré (impact = "") si le chiffre n’est pas dans le document.

SCHÉMA CIBLE (JSON uniquement) :
{
  "profil": {
    "nom": "string",
    "prenom": "string",
    "titre_principal": "string (titre professionnel précis, pas générique)",
    "localisation": "string",
    "contact": { "email": "string", "telephone": "string", "linkedin": "string" },
    "elevator_pitch": "string (2-4 phrases, factuel, sans inventer)",
    "sources": ["citations exactes (max 2)"]
  },
  "experiences": [
    {
      "poste": "string",
      "entreprise": "string",
      "debut": "YYYY-MM",
      "fin": "YYYY-MM|null",
      "actuel": boolean,
      "sources": ["citations exactes (max 2)"],
      "realisations": [
        {
          "description": "string (ACTION + CONTEXTE + LIVRABLE/PROCESS, détaillé et factuel)",
          "impact": "string (chiffré uniquement si présent dans le document, sinon vide \"\")",
          "outils": ["string (outils mentionnés explicitement OU outils standards déduits avec is_inferred=true)"],
          "outils_deduits": [
            {
              "nom": "string (ex: Excel, Jira, SharePoint)",
              "is_inferred": true,
              "inference_justification": "string (min 30 caractères, ex: 'Outil standard pour reporting dans contexte PMO')",
              "confidence": 70-85
            }
          ],
          "methodes": ["string (méthodes mentionnées OU méthodes standards déduites)"],
          "contexte_operationnel": "string (description détaillée du contexte, process, étapes - min 50 caractères)",
          "is_inferred": boolean,
          "inference_justification": "string (si is_inferred=true, min 30 caractères, prudente)",
          "confidence": 60-100,
          "sources": ["citations exactes (max 2)"]
        }
      ],
      "technologies": ["string"],
      "clients_references": ["noms exacts des clients mentionnés"]
    }
  ],
  "competences": {
    "explicit": {
      "techniques": ["string (compétences techniques explicitement mentionnées)"],
      "soft_skills": ["string (compétences humaines explicitement mentionnées)"]
    },
    "inferred": {
      "techniques": [
        {
          "name": "string",
          "confidence": 60-100,
          "reasoning": "string (min 50 caractères, prudente)",
          "sources": ["citation exacte du document (obligatoire)"]
        }
      ],
      "tools": [
        {
          "name": "string",
          "confidence": 60-100,
          "reasoning": "string (min 50 caractères, prudente)",
          "sources": ["citation exacte du document (obligatoire)"]
        }
      ],
      "soft_skills": [
        {
          "name": "string",
          "confidence": 60-100,
          "reasoning": "string (min 50 caractères, prudente)",
          "sources": ["citation exacte du document (obligatoire)"]
        }
      ]
    }
  },
  "formations": [
    { "diplome": "string", "ecole": "string", "annee": "YYYY" }
  ],
  "certifications": ["string (nom complet de chaque certification - PMP, AWS Certified, etc.)"],
  "langues": { "langue": "niveau" },
  "references": {
    "clients": [
      {
        "nom": "string (nom exact de l'entreprise cliente)",
        "secteur": "Luxe|Finance|Tech|Industrie|Santé|Transport|Énergie|Conseil|Retail|Autre"
      }
    ]
  },
  "projets": [
    {
      "nom": "string",
      "description": "string",
      "technologies": ["string"],
      "impact": "string (quantifié si possible)",
      "date": "YYYY"
    }
  ],
  "extraction_warnings": [
    "string (ex: \"date de début non trouvée\", \"email absent\", etc.)"
  ]
}

══════════════════════════════════════════════════════════════════════════════
RÈGLES DE QUALITÉ (SANS INVENTION)
══════════════════════════════════════════════════════════════════════════════

📌 EXPÉRIENCES / RÉALISATIONS (RICHESSE) - OBLIGATOIRE
─────────────────────────────────────────────────────────────────────────────
⚠️ CONTRAINTE STRICTE: Minimum 6 réalisations par expérience (si l'info existe dans le document OU peut être logiquement déduite).
⚠️ Maximum 14 réalisations par expérience (éviter les doublons).
⚠️ Si le document mentionne une responsabilité (ex: "reporting", "pilotage", "gouvernance"), 
   tu DOIS déployer cette responsabilité en détails opérationnels en utilisant :
   - Les informations explicites du document
   - Les déductions logiques autorisées (outils standards, méthodes standards du poste) avec is_inferred=true
   - Voir exemples ci-dessous pour le format attendu

RÈGLES DE DÉPLOIEMENT LOGIQUE:
Quand une responsabilité est mentionnée, déploie-la en réalisations concrètes incluant:
- Process: étapes, méthodologie, cadencement (déduits logiquement si cohérents)
- Outils: logiciels, plateformes, technologies utilisées
  * Si mentionnés explicitement → dans "outils" avec is_inferred=false
  * Si déduits logiquement (outils standards du poste) → dans "outils_deduits" avec justification
- Méthodes: RACI, rituels, gouvernance, validation (si mentionnés ou standards du poste)
- Livrables: dashboards, rapports, KPIs, plans (si mentionnés ou logiquement déductibles)
- Contexte opérationnel: description détaillée du contexte, des étapes, du process (OBLIGATOIRE, min 50 caractères)

EXEMPLES DE DÉPLOIEMENT:

Exemple 1: "Reporting des temps des ressources"
→ Déploie en:
  - "Mise en place et suivi du load array (planning de charge des ressources)"
    * contexte_operationnel: "Établissement du planning de charge des ressources sur base hebdomadaire, suivi des allocations et ajustements en fonction des priorités projet"
    * outils_deduits: [{"nom": "Excel", "is_inferred": true, "inference_justification": "Outil standard pour reporting et tableaux de bord dans contexte PMO", "confidence": 80}]
  - "Encadrement du resource manager pour validation et suivi des temps"
  - "Application de la méthodologie de reporting avec cadencement hebdomadaire"
  - "Production de KPIs de capacité et d'utilisation des ressources"
  
⚠️ NOTE IMPORTANTE : Les outils comme "Excel", "PowerBI" dans l'exemple sont des DÉDUCTIONS LOGIQUES (is_inferred=true). 
Si le document mentionne explicitement "Excel", alors is_inferred=false. Si le document ne mentionne aucun outil mais parle de "reporting", 
tu peux déduire des outils standards (Excel, Office) avec justification.

Exemple 2: "Pilotage de projet"
→ Déploie en:
  - "Animation des COPIL et comités de pilotage avec reporting régulier"
  - "Gestion des parties prenantes avec matrice RACI et communication adaptée"
  - "Suivi budgétaire avec analyse d'écarts et prévisions"
  - "Utilisation de Jira/Planisware pour suivi planning et risques"
  - "Production de tableaux de bord projet et reporting direction"

Exemple 3: "Transformation digitale"
→ Déploie en:
  - "Cadrage et structuration des programmes de transformation"
  - "Mise en place de la gouvernance avec instances décisionnelles"
  - "Animation des ateliers de conduite du changement"
  - "Utilisation d'outils collaboratifs (SharePoint, Teams) pour coordination"
  - "Production de plans de transformation et roadmaps"

RÈGLES GÉNÉRALES:
- Chaque réalisation doit être une action concrète, pas un intitulé vague.
- Si le document contient une liste (missions / achievements / responsibilities), éclate-la en plusieurs réalisations.
- Chaque réalisation DOIT avoir un "contexte_operationnel" détaillé (min 50 caractères) décrivant le process, les étapes, le contexte.
- Préfère des réalisations détaillées avec contexte plutôt que des phrases courtes sans contexte.
  - "inference_justification": min 30 caractères expliquant pourquoi cette déduction est logique
- Pour les items inférés:
  - "is_inferred": true, "confidence": 60-85 (rarement 90+)
  - "sources": doit contenir la phrase explicite qui justifie l’inférence
  - "impact": "" si non explicitement chiffré dans le document
  - Utilise un vocabulaire prudent (ex: "Mise en place / cadrage / structuration" plutôt que "Automatisation complète")

📌 CLIENTS / RÉFÉRENCES
─────────────────────────────────────────────────────────────────────────────
- Extrais UNIQUEMENT les clients effectivement mentionnés dans les documents.
- Mets chaque client dans "experiences[].clients_references" (array de strings)
- ET aussi dans "references.clients" (avec nom + secteur)
- Déduis le secteur si possible (sinon "Autre")

Si aucun client n'est mentionné, laisse les arrays vides (ne pas inventer).


📌 CERTIFICATIONS VS FORMATIONS (SÉPARATION STRICTE)
─────────────────────────────────────────────────────────────────────────────
CERTIFICATIONS = Certificats professionnels reconnus
Exemples: PMP, PSM, AWS Certified Solutions Architect, PRINCE2, SAFe Agilist,
          Scrum Master, Google Analytics, etc.

FORMATIONS = Diplômes académiques (Licence, Master, MBA, Ingénieur, etc.)

Ne JAMAIS mélanger les deux.


📌 RÈGLE 5: COMPÉTENCES INFÉRÉES (VALIDATION STRICTE)
─────────────────────────────────────────────────────────────────────────────
Pour CHAQUE compétence inférée, tu DOIS fournir:

✅ "name": Nom de la compétence
✅ "confidence": 60-100 (si < 60, ne pas inclure)
✅ "reasoning": Explication de min 50 caractères sur POURQUOI tu infères cette compétence
✅ "sources": Array avec AU MOINS une citation exacte du document source

EXEMPLE VALIDE:
{
  "name": "Transformation digitale",
  "confidence": 85,
  "reasoning": "Mention explicite de multiples projets de refonte digitale et modernisation des SI, avec leadership sur des programmes de transformation",
  "sources": [
    "Pilotage de la transformation digitale du groupe (15 sites, 3 pays)",
    "Expert en transformation digitale avec taux de succès projet de 95%"
  ]
}

❌ REJETÉ (reasoning trop court):
{
  "name": "Leadership",
  "confidence": 70,
  "reasoning": "Bon leader",  // < 50 caractères
  "sources": []  // Pas de citation
}


📌 RÈGLE 6: TITRE PRINCIPAL (PRÉCISION)
─────────────────────────────────────────────────────────────────────────────
Le titre doit être PRÉCIS et PROFESSIONNEL.

✅ BON: "Chef de Projet Digital Senior", "Développeur Full-Stack", "Consultant SAP Finance"
❌ MAUVAIS: "Professionnel", "Expert", "Manager" (trop générique)


📌 RÈGLE 7: PROJETS PERSONNELS
─────────────────────────────────────────────────────────────────────────────
Si le document mentionne des projets personnels, open-source, ou side-projects:
- Les inclure dans la section "projets"
- Avec technologies utilisées et impact si mentionné


══════════════════════════════════════════════════════════════════════════════
OUTPUT FINAL
══════════════════════════════════════════════════════════════════════════════

Génère UNIQUEMENT le JSON structuré.
❌ PAS de markdown (pas de \`\`\`json)
❌ PAS de commentaires
❌ PAS d'explications

Vérifie avant de répondre:
✅ Aucune information inventée
✅ Les sources sont présentes pour les champs importants
✅ Certifications séparées des formations
✅ Compétences inférées: confidence >= 60 + reasoning >= 50 + sources

JSON uniquement ↓
`;


export const getTopJobsPrompt = (ragData: any) => `
Analyse ce profil professionnel (JSON) et suggère les 10 postes les PLUS adaptés.

PROFIL :
${JSON.stringify(ragData)}

RÈGLES :
- Mélange postes ÉVIDENTS et CACHÉS (opportunités ignorées)
- Variété de secteurs
- Fourchette salariale réaliste France/Europe 2025 (en k€)

OUTPUT (JSON Array) :
[
  {
    "rang": 1,
    "titre_poste": "string",
    "match_score": 0-100,
    "salaire_min": number,
    "salaire_max": number,
    "raison": "string (court)",
    "secteurs": ["string"]
  }
]
`;

/**
 * Prompt pour générer AI_WIDGETS_SCHEMA (nouveau système V2)
 * Convertit RAG + match analysis en widgets scorés prêts pour le bridge AIAdapter
 */
export const getAIWidgetsGenerationPrompt = (
    ragProfile: any,
    matchAnalysis: any,
    jobDescription: string
) => `
Tu es un expert en génération de contenu CV optimisé pour ATS et recruteurs.

═══════════════════════════════════════════════════════════════
MISSION : Générer des widgets scorés (AI_WIDGETS_SCHEMA)
═══════════════════════════════════════════════════════════════

PROFIL RAG COMPLET :
${JSON.stringify(ragProfile, null, 2)}

ANALYSE DE MATCH AVEC L'OFFRE :
${JSON.stringify(matchAnalysis, null, 2)}

OFFRE D'EMPLOI :
${jobDescription}

═══════════════════════════════════════════════════════════════
RÈGLES CRITIQUES
═══════════════════════════════════════════════════════════════

1. ANTI-HALLUCINATION STRICTE :
   - ⛔ INTERDICTION d'inventer : postes, entreprises, dates, chiffres, clients, certifications
   - ✅ UNIQUEMENT des informations présentes dans le RAG fourni
   - ✅ Pour chaque widget, inclure "sources.rag_experience_id" ou "sources.rag_path" si disponible

2. SCORING DE PERTINENCE (relevance_score 0-100) :
   - 90-100 : Directement aligné avec l'offre (mots-clés match, expérience exacte)
   - 70-89 : Très pertinent (compétences alignées, secteur similaire)
   - 50-69 : Pertinent mais générique (compétences transférables)
   - < 50 : Peu pertinent (ne pas inclure dans le CV final)

3. PRIORISATION SELON MATCH ANALYSIS :
   - Boost les widgets liés aux "strengths" identifiés
   - Boost les widgets contenant les "missing_keywords" (si présents dans le RAG)
   - Boost les widgets alignés avec "key_selling_points"

4. QUANTIFICATION OBLIGATOIRE :
   - Si le RAG contient des chiffres (budgets, volumes, %, délais) → INCLURE dans le widget
   - Si pas de chiffres → widget sans quantification (mais toujours factuel)

5. STRUCTURE DES WIDGETS :
   - Chaque widget = unité atomique (1 bullet, 1 compétence, 1 formation, etc.)
   - Pas de widgets composites (pas de "3 bullets en 1")
   - Chaque widget a un "type" et une "section" claire

═══════════════════════════════════════════════════════════════
SCHÉMA DE SORTIE (JSON uniquement)
═══════════════════════════════════════════════════════════════

{
  "profil_summary": {
    "prenom": "string (depuis RAG.profil.prenom)",
    "nom": "string (depuis RAG.profil.nom)",
    "titre_principal": "string (depuis RAG.profil.titre_principal OU job_title de l'offre si plus pertinent)",
    "localisation": "string (depuis RAG.profil.localisation)",
    "elevator_pitch": "string (depuis RAG.profil.elevator_pitch, max 200 caractères)"
  },
  "job_context": {
    "company": "string (depuis matchAnalysis.company)",
    "job_title": "string (depuis matchAnalysis.job_title)",
    "match_score": number (depuis matchAnalysis.match_score),
    "keywords": ["string"] (depuis matchAnalysis.missing_keywords + keywords de l'offre)
  },
  "widgets": [
    {
      "id": "string (unique, ex: 'w1', 'w2')",
      "type": "summary_block" | "experience_header" | "experience_bullet" | "skill_item" | "skill_group" | "education_item" | "project_item" | "language_item",
      "section": "header" | "summary" | "experiences" | "skills" | "education" | "projects" | "languages" | "references",
      "text": "string (texte brut à afficher, max 300 caractères pour bullets, max 200 pour summary)",
      "relevance_score": number (0-100),
      "sub_type": "string (optionnel, ex: 'lead_bullet', 'secondary_bullet')",
      "tags": ["string"] (optionnel, ex: ["management", "cloud", "kpi"]),
      "offer_keywords": ["string"] (optionnel, mots-clés de l'offre qui ont motivé ce widget),
      "sources": {
        "rag_experience_id": "string (si widget lié à une expérience, ex: 'exp_0')",
        "rag_realisation_id": "string (si widget lié à une réalisation spécifique)",
        "rag_path": "string (ex: 'experiences[2].realisations[1]')",
        "source_ids": ["string"] (IDs de documents sources si disponibles)
      },
      "quality": {
        "has_numbers": boolean (true si le texte contient des chiffres),
        "length": number (longueur en caractères),
        "grounded": boolean (true si toutes les infos sont traçables dans le RAG),
        "issues": ["string"] (optionnel, ex: ["too_generic"] si problème détecté)
      }
    }
  ],
  "meta": {
    "model": "gemini-3.0-pro",
    "created_at": "string (ISO date)",
    "locale": "fr-FR",
    "version": "v1"
  }
}

═══════════════════════════════════════════════════════════════
EXEMPLES DE WIDGETS
═══════════════════════════════════════════════════════════════

WIDGET 1 - Summary Block (score élevé car aligné offre) :
{
  "id": "w1",
  "type": "summary_block",
  "section": "summary",
  "text": "7 ans d'expérience en développement de produits SaaS B2B, spécialisés dans les plateformes de paiement temps réel.",
  "relevance_score": 88,
  "sources": {
    "rag_path": "profil.elevator_pitch"
  },
  "quality": {
    "has_numbers": true,
    "length": 95,
    "grounded": true
  }
}

WIDGET 2 - Experience Header :
{
  "id": "w2",
  "type": "experience_header",
  "section": "experiences",
  "text": "Senior Full-Stack Engineer - ScalePay",
  "relevance_score": 90,
  "sources": {
    "rag_experience_id": "exp_scalepay",
    "rag_path": "experiences[0]"
  },
  "quality": {
    "has_numbers": false,
    "length": 38,
    "grounded": true
  }
}

WIDGET 3 - Experience Bullet (avec quantification) :
{
  "id": "w3",
  "type": "experience_bullet",
  "section": "experiences",
  "text": "Conception et mise en production d'une API de paiement temps réel (99,99% uptime) utilisée par 150+ marchands.",
  "relevance_score": 95,
  "tags": ["api", "fintech", "scalability"],
  "offer_keywords": ["API", "production", "scalabilité"],
  "sources": {
    "rag_experience_id": "exp_scalepay",
    "rag_realisation_id": "real_api_payment",
    "rag_path": "experiences[0].realisations[2]"
  },
  "quality": {
    "has_numbers": true,
    "length": 102,
    "grounded": true
  }
}

WIDGET 4 - Skill Item :
{
  "id": "w4",
  "type": "skill_item",
  "section": "skills",
  "text": "TypeScript",
  "relevance_score": 80,
  "offer_keywords": ["TypeScript"],
  "sources": {
    "rag_path": "competences.explicit.techniques[0]"
  },
  "quality": {
    "has_numbers": false,
    "length": 10,
    "grounded": true
  }
}

═══════════════════════════════════════════════════════════════
STRATÉGIE DE SÉLECTION
═══════════════════════════════════════════════════════════════

1. EXPÉRIENCES :
   - Sélectionner les 3-6 expériences les plus pertinentes (selon match_score)
   - Pour chaque expérience sélectionnée :
     * 1 widget "experience_header" (score = pertinence globale de l'expérience)
     * 3-6 widgets "experience_bullet" (sélectionner les meilleures réalisations, scorer selon alignement offre)

2. COMPÉTENCES :
   - Extraire les compétences techniques ET soft skills du RAG
   - Scorer selon présence dans l'offre / match analysis
   - Inclure les "missing_keywords" si présents dans le RAG comme compétences

3. FORMATIONS / LANGUES :
   - Inclure toutes les formations pertinentes (score selon niveau / secteur)
   - Inclure toutes les langues (score élevé si mentionnées dans l'offre)

4. SUMMARY :
   - 1 seul widget "summary_block" (le meilleur pitch depuis RAG.profil.elevator_pitch)

═══════════════════════════════════════════════════════════════
OUTPUT FINAL
═══════════════════════════════════════════════════════════════

Génère UNIQUEMENT le JSON conforme au schéma AI_WIDGETS_SCHEMA.
❌ PAS de markdown (pas de \`\`\`json)
❌ PAS de commentaires
❌ PAS d'explications

Vérifie avant de répondre :
✅ Tous les widgets ont un relevance_score 0-100
✅ Tous les widgets sont grounded (traçables dans le RAG)
✅ Les widgets d'expérience ont rag_experience_id ou rag_path
✅ Les widgets avec chiffres ont has_numbers: true
✅ Le nombre total de widgets est raisonnable (20-50 widgets max)

JSON uniquement ↓
`;

export const getMatchAnalysisPrompt = (userProfile: any, jobText: string) => {
    const contexteEnrichi = userProfile?.contexte_enrichi;
    const contexteSection = contexteEnrichi ? `
═══════════════════════════════════════════════════════════════
CONTEXTE ENRICHI (Responsabilités Implicites & Compétences Tacites)
═══════════════════════════════════════════════════════════════

RESPONSABILITÉS IMPLICITES :
${JSON.stringify(contexteEnrichi.responsabilites_implicites || [], null, 2)}

COMPÉTENCES TACITES :
${JSON.stringify(contexteEnrichi.competences_tacites || [], null, 2)}

SOFT SKILLS DÉDUITES :
${JSON.stringify(contexteEnrichi.soft_skills_deduites || [], null, 2)}

ENVIRONNEMENT DE TRAVAIL :
${JSON.stringify(contexteEnrichi.environnement_travail || {}, null, 2)}

NOTE : Ces éléments sont déduits du contexte et peuvent enrichir l'analyse de match.
Utilise-les pour identifier des atouts supplémentaires non explicitement mentionnés.
` : '';

    return `
Tu es un expert RH / Career Coach avec une expertise en négociation salariale et stratégie de candidature.

PROFIL DU CANDIDAT (DONNÉES EXPLICITES) :
${JSON.stringify(userProfile, null, 2)}
${contexteSection}
OFFRE D'EMPLOI :
${jobText}

MISSION:
Analyse le match entre ce profil et cette offre, en incluant une estimation salariale et des conseils de prospection personnalisés.

IMPORTANT : Utilise le contexte enrichi (responsabilités implicites, compétences tacites) pour identifier des atouts supplémentaires qui ne sont pas explicitement mentionnés mais qui sont logiquement déductibles du profil.

OUTPUT (JSON uniquement) :
{
  "job_title": "Titre exact du poste (ex: Product Manager Senior)",
  "company": "Nom de l'entreprise (ex: BNP Paribas)",
  "location": "Localisation si mentionné (ex: Paris, Remote)",
  "match_score": 0-100,
  "match_level": "Excellent|Très bon|Bon|Moyen|Faible",
  "recommendation": "Oui fortement|Oui|Peut-être|Non recommandé",
  "strengths": [
    { "point": "string", "match_percent": 0-100 }
  ],
  "gaps": [
    { "point": "string", "severity": "Bloquant|Important|Mineur", "suggestion": "string" }
  ],
  "missing_keywords": ["string"],
  "key_insight": "string (1 phrase synthèse)",

  "salary_estimate": {
    "market_range": {
      "min": number,
      "max": number,
      "currency": "EUR",
      "periode": "annuel",
      "context": "string (ex: Fourchette marché France 2025 pour ce poste)"
    },
    "personalized_range": {
      "min": number,
      "max": number,
      "currency": "EUR",
      "periode": "annuel",
      "justification": "string (ex: Basé sur vos 8 ans d'expérience et votre expertise en...)"
    },
    "negotiation_tip": "string (1 conseil court pour négocier)"
  },

  "coaching_tips": {
    "approach_strategy": "string (2-3 phrases : comment aborder cette candidature)",
    "key_selling_points": ["string (3-5 arguments clés à mettre en avant)"],
    "preparation_checklist": ["string (3-4 actions concrètes avant de postuler)"],
    "interview_focus": "string (1-2 phrases : sur quoi insister en entretien)"
  }
}

RÈGLES POUR L'ESTIMATION SALARIALE :
- Basé sur : poste, localisation, secteur, taille entreprise (si mentionnée)
- market_range : fourchette globale du marché pour ce poste en France/Europe 2025
- personalized_range : ajustée selon l'expérience du candidat (années, expertise, niveau de match)
- Si junior (<3 ans) : -15% vs market, si senior (>10 ans) : +20% vs market
- Être réaliste et cohérent avec le marché actuel

RÈGLES POUR LE COACHING :
- approach_strategy : ton personnel (confiant si score >70%, stratégique si 50-70%, préparation intensive si <50%)
- key_selling_points : extraire du profil les 3-5 atouts les plus pertinents pour CETTE offre
- preparation_checklist : actions concrètes (ex: "Préparer un portfolio de 3 projets similaires", "Rechercher l'équipe sur LinkedIn")
- interview_focus : anticiper les questions probables du recruteur selon les gaps identifiés
`;

/**
 * Nouveau système de prompting CV en 4 blocs - CDC CV Parfait
 */

import { SeniorityLevel, SENIORITY_RULES, SectorProfile, SECTOR_PROFILES } from '@/types/cv-optimized';

interface CVPromptContext {
  profile: any;
  jobDescription: string;
  matchReport?: any;
  customNotes?: string;
  seniorityLevel: SeniorityLevel;
  sectorProfile: SectorProfile;
  totalYearsExperience: number;
}

/**
 * BLOC 1: Contexte & Rôle
 */
function getContextBlock(context: CVPromptContext): string {
  const sectorConfig = SECTOR_PROFILES[context.sectorProfile];

  return `
═══════════════════════════════════════════════════════════════
BLOC 1 : CONTEXTE & RÔLE
═══════════════════════════════════════════════════════════════

Tu es un expert RH, CV Designer et ATS Optimizer avec 15 ans d'expérience.
Tu connais parfaitement :
- Les systèmes ATS (Applicant Tracking Systems) et comment les optimiser
- Les attentes des recruteurs et DRH selon les secteurs
- Les standards de présentation par niveau de séniorité
- L'art de la quantification des réalisations

CONTEXTE CANDIDAT :
- Niveau de séniorité détecté : ${context.seniorityLevel.toUpperCase()} (${Math.round(context.totalYearsExperience)} ans d'expérience)
- Secteur cible : ${context.sectorProfile.toUpperCase()}
- Tonalité attendue : ${sectorConfig.tone}
`;
}

/**
 * BLOC 2: Données Source
 */
function getDataBlock(context: CVPromptContext): string {
  return `
═══════════════════════════════════════════════════════════════
BLOC 2 : DONNÉES SOURCE
═══════════════════════════════════════════════════════════════

PROFIL RAG COMPLET DU CANDIDAT :
${JSON.stringify(context.profile, null, 2)}

${context.matchReport ? `
ANALYSE DE MATCH AVEC L'OFFRE :
- Score de correspondance : ${context.matchReport.match_score || 'N/A'}%
- Forces identifiées : ${JSON.stringify(context.matchReport.strengths?.map((s: any) => s.point) || [])}
- Keywords manquants : ${JSON.stringify(context.matchReport.missing_keywords || [])}
${context.matchReport.coaching_tips ? `- Boosters sélectionnés : ${JSON.stringify(context.matchReport.coaching_tips)}` : ''}
` : ''}

OFFRE D'EMPLOI CIBLÉE :
${context.jobDescription}

${context.customNotes ? `
NOTES PERSONNELLES DU CANDIDAT :
${context.customNotes}
(Intègre ces informations de manière professionnelle si pertinentes pour l'offre)
` : ''}
`;
}

/**
 * BLOC 3: Règles d'optimisation basées sur la séniorité
 */
function getRulesBlock(context: CVPromptContext): string {
  const rules = SENIORITY_RULES[context.seniorityLevel];
  const sectorConfig = SECTOR_PROFILES[context.sectorProfile];

  return `
═══════════════════════════════════════════════════════════════
BLOC 3 : RÈGLES D'OPTIMISATION
═══════════════════════════════════════════════════════════════

📊 RÈGLES POUR NIVEAU "${context.seniorityLevel.toUpperCase()}" :

1. STRUCTURE DU CV :
   - Pages max : ${rules.maxPages}
   - Elevator pitch : ${rules.elevatorPitchRequired ? `OBLIGATOIRE (max ${rules.elevatorPitchMaxChars} caractères)` : 'OPTIONNEL'}
   - Formation en premier : ${rules.formationFirstPosition ? 'OUI' : 'NON (expériences d\'abord)'}

2. EXPÉRIENCES (PRIORITÉ : COMPLÉTUDE) :
   - NE PAS afficher toutes les expériences : SÉLECTIONNER les plus pertinentes pour l'offre
   - Maximum ${rules.maxExperiences} expériences affichées (les plus pertinentes et représentatives)
   - Maximum ${rules.maxBulletsPerExperience} bullets par expérience
   - Maximum ${rules.maxBulletChars} caractères par bullet
   - Afficher références clients : ${rules.showClientReferences ? 'OUI - OBLIGATOIRE' : 'NON'}
   - Objectif : 1 page lisible. Mieux vaut 3 expériences excellentes que 10 moyennes.
   - Tu peux SYNTHÉTISER plusieurs éléments du RAG en un seul bullet si nécessaire (sans perdre le sens)
   - Tu peux DÉVELOPPER un élément en 2 bullets UNIQUEMENT si le RAG contient déjà plusieurs détails distincts
   - Tu peux reformuler librement (verbes d’action, style ATS), MAIS sans inventer de faits ou de chiffres

3. QUANTIFICATION OBLIGATOIRE (≥60% des bullets) :
   Formats acceptés :
   - Volume : "150+ projets", "équipe de 8 personnes"
   - Budget : "budget 2M€", "réduction coûts de 30%"
   - Impact : "amélioration de 45%", "réduction délais de 3 mois"
   - Portée : "déploiement 500 utilisateurs", "12 pays"

4. RÉFÉRENCES CLIENTS (COMPLÉTUDE OBLIGATOIRE) :
   ⚠️ IMPORTANT : Si le profil source contient des références clients (dans "references.clients" ou "experiences[].clients_references"), 
   elles DOIVENT TOUTES apparaître dans le CV généré.
   
   ${rules.showClientReferences ? `
   OBLIGATOIRE : Ajouter une section clients_references avec TOUS les clients :
   - Extraire TOUS les clients mentionnés dans les expériences (ex: Cartier, Dreamworks, SNCF, Servier, Ipsen, Engie, Total, Renault, PSA, Safran, Société Générale, BNP Paribas, CNP Assurances, Arval, Logista, McDonalds, Quick, Flunch, Cube Creative, Dreamworks, Naïa Thalassa...)
   - Extraire AUSSI les clients depuis "references.clients" si présent dans le profil source
   - Les grouper par secteur (Luxe, Finance, Industrie, Santé, Énergie, Transport, Retail, Autre...)
   - Format attendu : "clients_references": { "included": true, "groupes": [{ "secteur": "Luxe", "clients": ["Cartier", "Chanel"] }, { "secteur": "Finance", "clients": ["Société Générale", "BNP Paribas"] }] }
   - Ne JAMAIS inventer de clients
   - Si le profil contient 20 clients, le CV doit en afficher 20 (ou au moins les plus pertinents pour l'offre, mais TOUS si possible)
   - Prioriser les clients pertinents pour l'offre, mais ne pas exclure les autres sans raison valide
   ` : 'Non applicable - mais si des références sont présentes dans le profil source, elles doivent être incluses'}

5. PERTINENCE_SCORE PAR EXPÉRIENCE :
   Pour CHAQUE expérience, calcule un score 0-100 basé sur :
   - Correspondance avec le poste visé (+30 si poste similaire)
   - Récence (+20 si < 2 ans, +10 si < 5 ans)
   - Technologies matching avec l'offre (+5 par match, max +30)
   - Impact quantifié visible (+20 si quantifications)

   RÈGLE AFFICHAGE :
   - display: true pour score >= 20 (afficher par défaut)
   - display: false UNIQUEMENT si score < 20 ET totalement hors-sujet
   - En cas de doute, TOUJOURS afficher (display: true)

6. KEYWORDS ATS CRITIQUES pour secteur ${context.sectorProfile.toUpperCase()} :
   ${JSON.stringify(sectorConfig.keywords_critical)}
   → Ces mots-clés DOIVENT apparaître naturellement dans le CV

7. COMPÉTENCES (MAXIMISER LA COMPLÉTUDE) :
   - Le profil contient un "skill_map" qui aplatit TOUTES les compétences (expériences + global + par_domaine)
   - Utilise le skill_map pour voir rapidement où chaque compétence a été utilisée (used_in_experiences)
   - SÉLECTIONNER les compétences utiles pour l'offre (pas une liste catalogue)
   - Prioriser les compétences qui matchent l'offre en premier
   - Limite recommandée : 12-18 compétences techniques + 4-8 soft skills max
   - Éviter les doublons et les variantes (ex: \"McDo\" vs \"McDonalds\")
   - Si le profil contient aussi "competences.explicit" ou "competences.inferred", utilise-les en complément du skill_map

8. FORMATIONS (COPIE EXACTE OBLIGATOIRE - COMPLÉTUDE) :
   ⛔ INTERDICTION ABSOLUE D'INVENTER DES FORMATIONS
   - COPIER TOUTES les formations présentes dans le profil source (tableau "formations")
   - NE JAMAIS inventer d'école (HEC, ESSEC, Polytechnique, etc.)
   - NE JAMAIS inventer de diplôme ou d'année
   - Si le profil source n'a pas de formations, laisser le tableau VIDE []
   - ⚠️ IMPORTANT : Si le profil contient des formations, elles DOIVENT apparaître dans le CV généré

9. CERTIFICATIONS (COPIE EXACTE OBLIGATOIRE - COMPLÉTUDE) :
   ⛔ INTERDICTION ABSOLUE D'INVENTER DES CERTIFICATIONS
   - COPIER TOUTES les certifications présentes dans le profil source (tableau "certifications")
   - Si le profil source n'a pas de certifications, laisser le tableau VIDE []
   - ⚠️ IMPORTANT : Si le profil contient des certifications, elles DOIVENT apparaître dans le CV généré

10. LANGUES (NORMALISATION - COMPLÉTUDE) :
   - 1 seule ligne par langue (PAS de variantes type \"Anglais (Global)\" / \"Anglais (Reading)\")
   - Utiliser un niveau cohérent (CECRL A1-A2-B1-B2-C1-C2 ou \"Natif\") si présent dans la source

11. TONALITÉ "${sectorConfig.tone.toUpperCase()}" :
   ${sectorConfig.tone === 'formal' ? '- Vocabulaire professionnel strict\n   - Phrases factuelles\n   - Pas de superlatifs' : ''}
   ${sectorConfig.tone === 'dynamic' ? '- Vocabulaire dynamique et moderne\n   - Orienté résultats et innovation\n   - Action verbs forts' : ''}
   ${sectorConfig.tone === 'executive' ? '- Vision stratégique mise en avant\n   - Leadership et impact organisationnel\n   - Références C-level si possible' : ''}

12. FORMATAGE STRICT (OBLIGATOIRE) :
   ESPACES OBLIGATOIRES :
   - "5 ans" (PAS "5ans")
   - "150+ projets" (PAS "150+projets" ou "150 +projets")
   - "+ 40%" (PAS "+40%" ou "+ 40 %")
   - "budget 2M€" (PAS "budget2M€")
   - "équipe de 8 personnes" (PAS "équipede8personnes")

   PONCTUATION :
   - Espace APRÈS ponctuation : ". ", ", ", ": ", ") "
   - PAS d'espace AVANT : "test." (PAS "test .")
   - Espaces autour parenthèses : "test (exemple) suite"

   ⚠️ VÉRIFIE le formatage de CHAQUE phrase avant de générer le JSON final.

13. 🚨 RÈGLE ANTI-HALLUCINATION (CRITIQUE) :
   ⛔ TU NE DOIS JAMAIS INVENTER D'INFORMATION
   
   INTERDICTIONS ABSOLUES :
   - ❌ NE JAMAIS inventer de formation (école, diplôme, année)
   - ❌ NE JAMAIS inventer d'entreprise ou d'employeur
   - ❌ NE JAMAIS inventer de réalisation ou projet
   - ❌ NE JAMAIS inventer de client/référence
   - ❌ NE JAMAIS inventer de certification
   - ❌ NE JAMAIS modifier les dates des expériences
   
   RÈGLE D'OR : Si une information n'est pas dans le profil source,
   elle NE DOIT PAS apparaître dans le CV généré.
   
   En cas de doute, OMETS l'information plutôt que de l'inventer.
   
   CAS PARTICULIER : "contexte_enrichi" / éléments inférés présents dans la source
   - Tu peux les utiliser pour enrichir le vocabulaire (process, gouvernance, reporting) UNIQUEMENT si c’est dans le JSON source
   - Tu dois rester prudent (éviter les superlatifs, éviter toute quantification non sourcée)
`;
}

/**
 * BLOC 4: Output attendu
 */
function getOutputBlock(context: CVPromptContext): string {
  const rules = SENIORITY_RULES[context.seniorityLevel];

  return `
═══════════════════════════════════════════════════════════════
BLOC 4 : OUTPUT ATTENDU
═══════════════════════════════════════════════════════════════

GÉNÈRE un JSON structuré avec les sections suivantes :

{
  "cv_metadata": {
    "seniority_level": "${context.seniorityLevel}",
    "optimization_level": "high",
    "compression_level_applied": 0,
    "optimizations_applied": ["liste des modifications effectuées"]
  },
  
  "identity": {
    "nom": "string",
    "prenom": "string",
    "titre_vise": "string ADAPTÉ à l'offre",
    "contact": { "email": "", "telephone": "", "ville": "", "linkedin": "" }
  },
  
  "elevator_pitch": {
    "included": ${rules.elevatorPitchRequired},
    "text": "string (max ${rules.elevatorPitchMaxChars} chars, inclut keywords offre)",
    "keywords_embedded": ["liste des keywords intégrés"]
  },
  
  "experiences": [
    {
      "id": "exp-1",
      "ordre_affichage": 1,
      "pertinence_score": 85,
      "display": true,
      "poste": "string",
      "entreprise": "string",
      "debut": "YYYY-MM",
      "fin": "YYYY-MM|null",
      "actuel": boolean,
      "duree_affichee": "ex: Depuis Mars 2023",
      "realisations": [
        {
          "description": "string (max ${rules.maxBulletChars} chars, QUANTIFIÉ)",
          "quantification": {
            "type": "volume|budget|pourcentage|portee",
            "valeur": "150+",
            "unite": "projets"
          },
          "keywords_ats": ["keyword1", "keyword2"],
          "display": true
        }
      ],
      "technologies": ["tech1", "tech2"]
    }
  ],
  
  "competences": {
    "techniques": ["string", "string", ...],  // Format simple array (PRIORITÉ)
    "soft_skills": ["string", "string", ...],  // Format simple array (PRIORITÉ)
    // Format alternatif (si nécessaire) :
    "display_mode": "categorized",
    "categories": [
      {
        "nom": "Gestion de Projet",
        "items": [{ "nom": "Planisware", "niveau": "expert", "keywords_ats": ["PPM"] }],
        "display": true
      }
    ]
  },
  
  "clients_references": {
    "included": true,
    "groupes": [
      { "secteur": "Luxe", "clients": ["Cartier", "Chanel"] },
      { "secteur": "Finance", "clients": ["Société Générale", "BNP Paribas"] }
    ]
  },
  
  "formations": [
    {
      "type": "diplome|certification",
      "titre": "string",
      "organisme": "string",
      "date": "YYYY",
      "display_format": "Diplôme - École (Année)"
    }
  ],
  
  "langues": [
    { "langue": "Français", "niveau": "Natif", "display": "Français (natif)" }
  ],
  
  "certifications": [
    { "nom": "string", "organisme": "string (optionnel)", "date": "YYYY (optionnel)" }
  ]
}

RAPPELS CRITIQUES :
✅ Chaque expérience DOIT avoir un pertinence_score calculé
✅ 60%+ des réalisations DOIVENT avoir une quantification
✅ Les keywords ATS DOIVENT être intégrés naturellement
✅ Le JSON DOIT être valide et parsable
✅ Ne jamais mettre de placeholders type \"non renseigné\" : utiliser \"\" si absent

🚨 INTERDICTION ABSOLUE D'INVENTER :
⛔ NE JAMAIS inventer de formation, école ou diplôme
⛔ NE JAMAIS inventer d'entreprise ou d'expérience
⛔ Si une info n'est pas dans le profil source → NE PAS L'INCLURE

Génère UNIQUEMENT le JSON, sans markdown, sans commentaire.
`;
}

/**
 * FONCTION PRINCIPALE - Génère le prompt complet 4 blocs
 */
export const getCVOptimizationPromptV2 = (context: CVPromptContext): string => {
  return [
    getContextBlock(context),
    getDataBlock(context),
    getRulesBlock(context),
    getOutputBlock(context)
  ].join('\n');
};

/**
 * WRAPPER pour compatibilité avec l'ancienne API
 * NOTE: Cette fonction est maintenant un simple wrapper vers getCVOptimizationPromptV2
 * Tous les appels utilisent déjà la version V2 en interne
 */
export const getCVOptimizationPrompt = (profile: any, jobDescription: string, customNotes?: string, matchReport?: any) => {
  // Détecter la séniorité depuis les expériences
  const experiences = profile.experiences || [];
  let totalMonths = 0;

  for (const exp of experiences) {
    if (exp.debut) {
      const start = new Date(exp.debut);
      const end = exp.actuel || !exp.fin ? new Date() : new Date(exp.fin);
      totalMonths += Math.max(0, (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()));
    }
  }

  const totalYears = totalMonths / 12;
  let seniorityLevel: SeniorityLevel = 'confirmed';
  if (totalYears < 3) seniorityLevel = 'junior';
  else if (totalYears < 8) seniorityLevel = 'confirmed';
  else if (totalYears < 15) seniorityLevel = 'senior';
  else seniorityLevel = 'expert';

  // Détecter le secteur
  const allText = JSON.stringify(profile).toLowerCase() + jobDescription.toLowerCase();
  let sectorProfile: SectorProfile = 'other';
  if (allText.includes('banque') || allText.includes('finance')) sectorProfile = 'finance';
  else if (allText.includes('pharma') || allText.includes('santé')) sectorProfile = 'pharma';
  else if (allText.includes('conseil') || allText.includes('consulting')) sectorProfile = 'conseil';
  else if (allText.includes('tech') || allText.includes('startup') || allText.includes('développeur')) sectorProfile = 'tech';

  const context: CVPromptContext = {
    profile,
    jobDescription,
    customNotes,
    matchReport,
    seniorityLevel,
    sectorProfile,
    totalYearsExperience: totalYears
  };

  return getCVOptimizationPromptV2(context);
};

/**
 * Prompt pour générer le contexte enrichi (responsabilités implicites, compétences tacites)
 */
export const getContexteEnrichiPrompt = (ragData: any): string => `
Tu es un expert en analyse de profils professionnels et en déduction contextuelle.

Analyse le profil RAG suivant et identifie les éléments implicites qui ne sont pas explicitement mentionnés mais qui sont logiquement induits par les expériences et compétences décrites.

PROFIL RAG À ANALYSER:
${JSON.stringify(ragData, null, 2)}

══════════════════════════════════════════════════════════════════════════════
MISSION: Identifie les éléments implicites avec justifications précises
══════════════════════════════════════════════════════════════════════════════

1. RESPONSABILITÉS IMPLICITES :
   - Pour chaque expérience, déduis les responsabilités logiquement induites par le poste et les réalisations
   - Exemples :
     * PMO → reporting, gouvernance, coordination inter-équipes, suivi budgétaire
     * Dev Lead → code review, mentoring, architecture decisions, gestion technique
     * Product Manager → roadmap, prioritization, stakeholder management, métriques
   - Pour chaque responsabilité implicite :
     * Description claire et concise
     * Justification : phrase source du RAG qui justifie cette déduction (copie exacte)
     * Confidence : 60-100 (60 = faible confiance, 100 = très forte confiance)

2. COMPÉTENCES TACITES :
   - Identifie les compétences non explicitement mentionnées mais logiquement nécessaires
   - Types de compétences :
     * "technique" : outils, technologies, méthodes techniques
     * "soft_skill" : leadership, communication, organisation, etc.
     * "methodologie" : Agile, Scrum, ITIL, etc.
   - Exemples :
     * Gestion équipe → leadership, communication, gestion de conflits
     * Coordination projets → organisation, planification, gestion du temps
     * Reporting → analyse de données, présentation, Excel/BI tools
   - Pour chaque compétence tacite :
     * Nom de la compétence
     * Type (technique/soft_skill/methodologie)
     * Justification : phrase source qui justifie
     * Confidence : 60-100

3. ENVIRONNEMENT TRAVAIL :
   - Dédus la taille d'équipe, contexte projet, outils standards utilisés
   - Exemples :
     * Startup → équipe réduite (2-10 personnes), polyvalence, outils légers
     * Grande entreprise → processus structurés, outils enterprise, équipes importantes
     * PMO → gouvernance multi-projets, reporting hiérarchique, outils PPM
   - Champs à déduire :
     * taille_equipe : estimation (ex: "5-10 personnes", "équipe internationale")
     * contexte_projet : type de projets (ex: "transformation digitale", "projets internationaux")
     * outils_standards : outils typiques du contexte (ex: ["Jira", "Confluence", "SharePoint"])

RÈGLES CRITIQUES :
- ⛔ N'invente JAMAIS de responsabilités ou compétences sans justification claire
- ✅ Chaque déduction DOIT avoir une phrase source du RAG qui la justifie
- ✅ Confidence doit être réaliste : 60-70 = faible, 80-90 = moyen, 95-100 = très fort
- ✅ Sois conservateur : mieux vaut moins de déductions mais plus précises
- ✅ Priorise les déductions avec confidence > 80

FORMAT DE RÉPONSE (JSON uniquement) :
{
  "responsabilites_implicites": [
    {
      "description": "string (responsabilité déduite)",
      "justification": "string (phrase source exacte du RAG)",
      "confidence": number (60-100)
    }
  ],
  "competences_tacites": [
    {
      "nom": "string (nom compétence)",
      "type": "technique" | "soft_skill" | "methodologie",
      "justification": "string (phrase source exacte)",
      "confidence": number (60-100)
    }
  ],
  "environnement_travail": {
    "taille_equipe": "string (optionnel)",
    "contexte_projet": "string (optionnel)",
    "outils_standards": ["string"] (optionnel)
  }
}

Génère UNIQUEMENT le JSON, sans texte avant ou après.
`;
