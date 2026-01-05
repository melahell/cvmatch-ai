
import { UserProfile, JobAnalysis } from "@/types";

export const getRAGExtractionPrompt = (extractedText: string) => `
Tu es un expert en extraction et structuration de données professionnelles.
Ton objectif : EXTRAIRE 100% DES INFORMATIONS sans rien perdre.

DOCUMENTS FOURNIS:
${extractedText}

═══════════════════════════════════════════════════════════════════════════════
MISSION : EXTRACTION COMPLÈTE - ZÉRO PERTE DE DONNÉES
═══════════════════════════════════════════════════════════════════════════════

RÈGLE ABSOLUE : Extrait TOUT ce qui est mentionné. Ne filtre rien. Ne résume pas.

SCHÉMA CIBLE (JSON) :
{
  "profil": {
    "nom": "string",
    "prenom": "string",
    "titre_principal": "string",
    "titres_alternatifs": ["autres titres/postes mentionnés"],
    "localisation": "string",
    "disponibilite": "string|null",
    "mobilite": ["villes/régions acceptées"],
    "teletravail": "string|null",
    "tjm": number|null,
    "contact": {
      "email": "string",
      "telephone": "string",
      "linkedin": "string",
      "portfolio": "string|null",
      "github": "string|null"
    },
    "elevator_pitch": "string (3-4 phrases résumant le profil)"
  },

  "experiences": [
    {
      "poste": "string",
      "entreprise": "string",
      "type_entreprise": "esn|client_final|startup|pme|grand_groupe|public|null",
      "secteur": "string (Finance, Pharma, Tech, Luxe, etc.)",
      "lieu": "string",
      "type_contrat": "cdi|cdd|freelance|mission|stage|alternance|null",
      "debut": "YYYY-MM",
      "fin": "YYYY-MM|null",
      "actuel": boolean,
      "contexte": "1-2 phrases de contexte",
      "equipe_size": number|null,
      "budget_gere": "string|null",
      "realisations": [
        {
          "description": "string COMPLET - ne pas tronquer",
          "impact": "string (résultat quantifié si présent)"
        }
      ],
      "technologies": ["string"],
      "outils": ["string (Jira, Confluence, etc.)"],
      "methodologies": ["Agile", "Scrum", "SAFe", "etc."],
      "clients_references": ["noms des clients mentionnés pour cette XP"]
    }
  ],

  "competences": {
    "explicit": {
      "techniques": [
        {
          "nom": "string",
          "niveau": "debutant|intermediaire|avance|expert|null",
          "annees_experience": number|null
        }
      ],
      "soft_skills": ["string"],
      "methodologies": ["string"],
      "langages_programmation": ["string"],
      "frameworks": ["string"],
      "outils": ["string"],
      "cloud_devops": ["string"]
    },
    "inferred": {
      "techniques": [
        {
          "name": "string",
          "confidence": 60-100,
          "reasoning": "pourquoi cette inférence",
          "sources": ["citations exactes"]
        }
      ],
      "tools": [{ "name": "", "confidence": 0, "reasoning": "", "sources": [] }],
      "soft_skills": [{ "name": "", "confidence": 0, "reasoning": "", "sources": [] }]
    },
    "par_domaine": {
      "Cloud": ["AWS", "Azure"],
      "Gestion Projet": ["Planisware", "MS Project"]
    }
  },

  "formations": [
    {
      "type": "diplome|certification|formation|mooc",
      "titre": "string",
      "organisme": "string",
      "annee": "YYYY",
      "en_cours": boolean,
      "specialite": "string|null",
      "mention": "string|null"
    }
  ],

  "certifications": [
    {
      "nom": "string",
      "organisme": "string",
      "date_obtention": "YYYY-MM|YYYY",
      "date_expiration": "YYYY-MM|null",
      "niveau": "string|null (Associate, Professional, etc.)",
      "domaine": "string (Cloud, Sécurité, PM, etc.)"
    }
  ],

  "langues": [
    {
      "langue": "string",
      "niveau": "Natif|Courant|Professionnel|Intermédiaire|Débutant",
      "niveau_cecrl": "A1|A2|B1|B2|C1|C2|null"
    }
  ],

  "references": {
    "clients": [
      {
        "nom": "string (Cartier, SNCF, etc.)",
        "secteur": "string (Luxe, Transport, Finance, etc.)",
        "type": "grand_compte|pme|startup|public",
        "via_entreprise": "string|null (via quelle ESN/employeur)"
      }
    ],
    "projets_marquants": [
      {
        "nom": "string",
        "description": "string",
        "client": "string|null",
        "annee": "YYYY",
        "technologies": ["string"],
        "resultats": "string"
      }
    ]
  }
}

═══════════════════════════════════════════════════════════════════════════════
RÈGLES D'EXTRACTION
═══════════════════════════════════════════════════════════════════════════════

1. **EXPÉRIENCES** :
   - Extrais TOUTES les expériences, même anciennes
   - Cherche les clients mentionnés dans chaque expérience
   - Note le secteur d'activité (Finance, Pharma, Tech, Luxe, Industrie...)
   - Extrait les méthodologies (Agile, Scrum, SAFe, Waterfall...)

2. **CLIENTS/RÉFÉRENCES** :
   - Identifie TOUS les noms de grandes entreprises
   - Classe par secteur (Luxe: Cartier, Chanel / Finance: BNP, SG / etc.)
   - Note si le client était via une ESN

3. **CERTIFICATIONS** (séparé des formations) :
   - TOUTES les certifications mentionnées
   - Date d'obtention si mentionnée
   - Organisme certificateur

4. **COMPÉTENCES** :
   - **explicit** = écrit textuellement
   - **inferred** = déduit du contexte (confidence min 60%)
   - Catégoriser par domaine dans 'par_domaine'

5. **RÈGLE QUANTIFICATION** :
   - Préserve TOUS les chiffres mentionnés
   - "150 projets", "équipe de 8", "budget 2M€" → dans impact

OUTPUT :
JSON valide uniquement. Pas de markdown, pas de \`\`\`json.
Pas de commentaires. Pas de "...".
TOUT doit être extrait, RIEN ignoré.
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
Tu es un expert RH / Career Coach.

PROFIL DU CANDIDAT :
${JSON.stringify(userProfile)}

OFFRE D'EMPLOI :
${jobText}

MISSION:
Analyse le match entre ce profil et cette offre.

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
    { "point": "string", "severity": "Bloquant|Important", "suggestion": "string" }
  ],
  "missing_keywords": ["string"],
  "key_insight": "string (1 phrase synthèse)"
}
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

2. EXPÉRIENCES :
   - CONSERVER TOUTES les expériences du profil source (${rules.maxExperiences} max)
   - Maximum ${rules.maxBulletsPerExperience} bullets par expérience
   - Maximum ${rules.maxBulletChars} caractères par bullet
   - Afficher références clients : ${rules.showClientReferences ? 'OUI - OBLIGATOIRE' : 'NON'}
   ⚠️ NE PAS SUPPRIMER d'expériences sauf si elles sont vraiment hors sujet

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
   
   RÈGLE : Masquer (display: false) les expériences avec score < 30 UNIQUEMENT

6. KEYWORDS ATS CRITIQUES pour secteur ${context.sectorProfile.toUpperCase()} :
   ${JSON.stringify(sectorConfig.keywords_critical)}
   → Ces mots-clés DOIVENT apparaître naturellement dans le CV

7. COMPÉTENCES :
   - CONSERVER TOUTES les compétences du profil source
   - Les organiser par catégories logiques
   - NE PAS réduire à moins de 12 compétences techniques

8. FORMATIONS :
   - CONSERVER TOUTES les formations et certifications du profil source
   - NE PAS supprimer de formations

9. TONALITÉ "${sectorConfig.tone.toUpperCase()}" :
   ${sectorConfig.tone === 'formal' ? '- Vocabulaire professionnel strict\n   - Phrases factuelles\n   - Pas de superlatifs' : ''}
   ${sectorConfig.tone === 'dynamic' ? '- Vocabulaire dynamique et moderne\n   - Orienté résultats et innovation\n   - Action verbs forts' : ''}
   ${sectorConfig.tone === 'executive' ? '- Vision stratégique mise en avant\n   - Leadership et impact organisationnel\n   - Références C-level si possible' : ''}
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
✅ Le contenu DOIT être VÉRIDIQUE (pas d'invention)
✅ Le JSON DOIT être valide et parsable

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
export const getCVOptimizationPrompt = (profile: any, jobDescription: string, customNotes?: string) => {
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
    seniorityLevel,
    sectorProfile,
    totalYearsExperience: totalYears
  };

  return getCVOptimizationPromptV2(context);
};

