
import { UserProfile, JobAnalysis } from "@/types";

export const getRAGExtractionPrompt = (extractedText: string) => `
Tu es un expert en extraction et structuration de données professionnelles de haut niveau.

DOCUMENTS FOURNIS:
${extractedText}

══════════════════════════════════════════════════════════════════════════════
MISSION CRITIQUE: Extrais et structure TOUTES les informations avec RIGUEUR MAXIMALE
══════════════════════════════════════════════════════════════════════════════

SCHÉMA CIBLE (JSON uniquement) :
{
  "profil": {
    "nom": "string",
    "prenom": "string",
    "titre_principal": "string (titre professionnel précis, pas générique)",
    "localisation": "string",
    "contact": { "email": "string", "telephone": "string", "linkedin": "string" },
    "elevator_pitch": "string (OBLIGATOIRE - voir règles ci-dessous)"
  },
  "experiences": [
    {
      "poste": "string",
      "entreprise": "string",
      "debut": "YYYY-MM",
      "fin": "YYYY-MM|null",
      "actuel": boolean,
      "realisations": [
        {
          "description": "string (ACTION + CONTEXTE)",
          "impact": "string (QUANTIFIÉ OBLIGATOIRE - voir règles)"
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
          "reasoning": "string (min 50 caractères)",
          "sources": ["citation exacte du document"]
        }
      ],
      "tools": [
        {
          "name": "string",
          "confidence": 60-100,
          "reasoning": "string (min 50 caractères)",
          "sources": ["citation exacte du document"]
        }
      ],
      "soft_skills": [
        {
          "name": "string",
          "confidence": 60-100,
          "reasoning": "string (min 50 caractères)",
          "sources": ["citation exacte du document"]
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
  ]
}

══════════════════════════════════════════════════════════════════════════════
RÈGLES DE VALIDATION STRICTES - RESPECT OBLIGATOIRE
══════════════════════════════════════════════════════════════════════════════

📌 RÈGLE 1: ELEVATOR PITCH (OBLIGATOIRE - 3 PHRASES STRUCTURÉES)
─────────────────────────────────────────────────────────────────────────────
Format OBLIGATOIRE en exactement 3 phrases:

1️⃣ Phrase 1: "[Titre/Expertise] avec [X années] d'expérience dans [secteur(s)]"
2️⃣ Phrase 2: "A [réalisation quantifiée] pour [clients prestigieux si disponibles]"
3️⃣ Phrase 3: "Expert en [domaine spécifique] avec [valeur unique quantifiée]"

✅ EXEMPLE VALIDE:
"Chef de Projet Digital avec 12 ans d'expérience dans le luxe et la finance. A piloté +50 projets Agile (budget cumulé 15M€) pour Cartier, Chanel et BNP Paribas. Expert en transformation digitale avec taux de succès projet de 95%."

❌ EXEMPLES REJETÉS:
- "Professionnel expérimenté dans le digital" (trop générique, pas quantifié)
- "Chef de projet passionné par l'innovation" (pas de chiffres, pas de clients)
- Pitch de moins de 200 caractères
- Pitch sans aucun chiffre ou pourcentage

LONGUEUR: Entre 200 et 400 caractères
EXIGENCE: Au moins 3 chiffres/pourcentages dans le pitch total


📌 RÈGLE 2: QUANTIFICATION DES IMPACTS (MINIMUM 60%)
─────────────────────────────────────────────────────────────────────────────
CHAQUE réalisation DOIT avoir un "impact" quantifié dans AU MOINS 60% des cas.

Formats acceptés pour la quantification:
✅ Volume: "150+ projets", "équipe de 8 personnes", "500 utilisateurs"
✅ Budget: "budget 2M€", "économies de 500K€", "CA de 15M€"
✅ Impact: "amélioration de 45%", "+40% de performance", "réduction de 30%"
✅ Temps: "réduction délais de 3 mois", "time-to-market -40%"
✅ Portée: "déploiement 12 pays", "15 sites", "réseau de 200 magasins"

✅ EXEMPLES VALIDES:
{
  "description": "Pilotage de projets e-commerce pour clients luxe",
  "impact": "Augmentation CA en ligne de 45% (15M€ → 22M€) sur 18 mois"
}
{
  "description": "Mise en place méthodologie Agile SAFe",
  "impact": "Réduction time-to-market de 40% (6 mois → 3.5 mois)"
}

❌ EXEMPLES REJETÉS (sauf si vraiment impossible à quantifier):
{
  "description": "Gestion de projets",
  "impact": "Amélioration de la qualité" // Pas assez précis
}

RÈGLE: Si aucun chiffre n'est mentionné dans le document, tu peux mettre un impact qualitatif,
mais essaie d'en trouver au moins 60% qui soient quantifiés.


📌 RÈGLE 3: EXTRACTION DES CLIENTS (CRITIQUE)
─────────────────────────────────────────────────────────────────────────────
Cherche TOUTES les mentions d'entreprises clientes (pas l'employeur, mais les CLIENTS).

Exemples de clients à extraire:
✅ Luxe: Cartier, Chanel, LVMH, Hermès, Dior, Louis Vuitton, L'Oréal
✅ Finance: BNP Paribas, Société Générale, Crédit Agricole, AXA, Natixis
✅ Tech: Google, Microsoft, Amazon, IBM, Oracle, SAP
✅ Industrie: Airbus, Renault, PSA, Total, Schneider Electric, Michelin
✅ Autres: SNCF, Orange, EDF, Carrefour, Auchan, etc.

IMPORTANT:
- Mets chaque client dans "experiences[].clients_references" (array de strings)
- ET aussi dans "references.clients" (avec nom + secteur)
- Déduis le secteur d'activité du client (Luxe, Finance, Tech, Industrie, Santé, Transport, Énergie, Conseil, Retail, Autre)

Si aucun client n'est mentionné, laisse les arrays vides (ne pas inventer).


📌 RÈGLE 4: CERTIFICATIONS VS FORMATIONS (SÉPARATION STRICTE)
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
✅ Elevator pitch = 3 phrases + 200-400 chars + 3+ chiffres
✅ 60%+ des réalisations ont impact quantifié
✅ Tous les clients extraits et classés par secteur
✅ Certifications séparées des formations
✅ Compétences inférées avec confidence >= 60 + reasoning >= 50 chars + sources

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

export const getMatchAnalysisPrompt = (userProfile: any, jobText: string) => `
Tu es un expert RH / Career Coach avec une expertise en négociation salariale et stratégie de candidature.

PROFIL DU CANDIDAT :
${JSON.stringify(userProfile)}

OFFRE D'EMPLOI :
${jobText}

MISSION:
Analyse le match entre ce profil et cette offre, en incluant une estimation salariale et des conseils de prospection personnalisés.

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
   - AFFICHER TOUTES les expériences du profil source par défaut
   - Maximum ${rules.maxExperiences} expériences affichées (les plus pertinentes)
   - Maximum ${rules.maxBulletsPerExperience} bullets par expérience
   - Maximum ${rules.maxBulletChars} caractères par bullet
   - Afficher références clients : ${rules.showClientReferences ? 'OUI - OBLIGATOIRE' : 'NON'}
   - ⚠️ PHILOSOPHIE : "Un CV complet rassure le recruteur. Masquer uniquement si vraiment hors-sujet."

3. QUANTIFICATION OBLIGATOIRE (≥60% des bullets) :
   Formats acceptés :
   - Volume : "150+ projets", "équipe de 8 personnes"
   - Budget : "budget 2M€", "réduction coûts de 30%"
   - Impact : "amélioration de 45%", "réduction délais de 3 mois"
   - Portée : "déploiement 500 utilisateurs", "12 pays"

4. RÉFÉRENCES CLIENTS (si ${rules.showClientReferences ? 'ACTIF' : 'désactivé'}) :
   ${rules.showClientReferences ? `
   OBLIGATOIRE : Ajouter une section clients_references avec les grands noms :
   - Extraire les clients mentionnés dans les expériences (ex: Cartier, Dreamworks, SNCF...)
   - Les grouper par secteur (Luxe, Finance, Industrie...)
   - Ajouter dans le JSON : "clients_references": { "included": true, "groupes": [...] }
   ` : 'Non applicable'}

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
   - AFFICHER TOUTES les compétences du profil source
   - Les organiser par catégories logiques (max 4 catégories)
   - Prioriser les compétences qui matchent l'offre en premier
   - NE PAS limiter artificiellement le nombre de compétences
   - Objectif : montrer l'étendue complète du profil

8. FORMATIONS (COPIE EXACTE OBLIGATOIRE) :
   ⛔ INTERDICTION ABSOLUE D'INVENTER DES FORMATIONS
   - COPIER UNIQUEMENT les formations présentes dans le profil source
   - NE JAMAIS inventer d'école (HEC, ESSEC, Polytechnique, etc.)
   - NE JAMAIS inventer de diplôme ou d'année
   - Si le profil source n'a pas de formations, laisser le tableau VIDE []

9. TONALITÉ "${sectorConfig.tone.toUpperCase()}" :
   ${sectorConfig.tone === 'formal' ? '- Vocabulaire professionnel strict\n   - Phrases factuelles\n   - Pas de superlatifs' : ''}
   ${sectorConfig.tone === 'dynamic' ? '- Vocabulaire dynamique et moderne\n   - Orienté résultats et innovation\n   - Action verbs forts' : ''}
   ${sectorConfig.tone === 'executive' ? '- Vision stratégique mise en avant\n   - Leadership et impact organisationnel\n   - Références C-level si possible' : ''}

10. FORMATAGE STRICT (OBLIGATOIRE) :
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

11. 🚨 RÈGLE ANTI-HALLUCINATION (CRITIQUE) :
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
    "display_mode": "categorized",
    "categories": [
      {
        "nom": "Gestion de Projet",
        "items": [{ "nom": "Planisware", "niveau": "expert", "keywords_ats": ["PPM"] }],
        "display": true
      }
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
  ]
}

RAPPELS CRITIQUES :
✅ Chaque expérience DOIT avoir un pertinence_score calculé
✅ 60%+ des réalisations DOIVENT avoir une quantification
✅ Les keywords ATS DOIVENT être intégrés naturellement
✅ Le JSON DOIT être valide et parsable

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
 * TODO: Migrer progressivement vers getCVOptimizationPromptV2
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
