
import { UserProfile, JobAnalysis } from "@/types";

export const getRAGExtractionPrompt = (extractedText: string) => `
Tu es un expert en extraction et structuration de données professionnelles.

DOCUMENTS FOURNIS:
${extractedText}

MISSION:
Extrais et structure TOUTES les informations selon ce schéma JSON.

SCHÉMA CIBLE (JSON uniquement) :
{
  "profil": {
    "nom": "string",
    "prenom": "string",
    "titre_principal": "string",
    "localisation": "string",
    "contact": { "email": "string", "telephone": "string", "linkedin": "string" },
    "elevator_pitch": "string (2-3 phrases max)"
  },
  "experiences": [
    {
      "poste": "string",
      "entreprise": "string",
      "debut": "YYYY-MM",
      "fin": "YYYY-MM|null",
      "actuel": boolean,
      "realisations": [
        { "description": "string", "impact": "string (quantifié)" }
      ],
      "technologies": ["string"]
    }
  ],
  "competences": {
    "techniques": ["string"],
    "soft_skills": ["string"]
  },
  "formations": [
    { "diplome": "string", "ecole": "string", "annee": "YYYY" }
  ],
  "langues": { "langue": "niveau" }
}

OUTPUT:
JSON valide uniquement. Pas de markdown, pas de \`\`\`json.
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

export const getCVOptimizationPrompt = (profile: any, jobDescription: string, customNotes?: string) => `
Tu es un expert en rédaction de CV (CV Writer) spécialisé dans l'optimisation ATS.

CANDIDAT (JSON) :
${JSON.stringify(profile)}

OFFRE D'EMPLOI :
${jobDescription}

${customNotes ? `
NOTES PERSONNELLES DU CANDIDAT :
${customNotes}

INSTRUCTION IMPORTANTE:
Si les notes personnelles contiennent des informations pertinentes pour ce poste, intègre-les de manière professionnelle dans le CV.
Reformule-les correctement (sans fautes, ton professionnel) et positionne-les stratégiquement là où elles auront le plus d'impact.
` : ''}

MISSION:
Réécris le contenu du CV pour qu'il corresponde PARFAITEMENT à l'offre d'emploi, tout en restant VERIDIQUE.

ACTIONS:
1. Réécris le "profil.elevator_pitch" pour qu'il résonne avec la mission.
2. Pour chaque expérience, sélectionne les 3-4 bullets les plus pertinents et réécris-les avec des mots-clés de l'offre.
3. Mets en avant les compétences techniques citées dans l'offre.
4. Si des notes personnelles sont fournies, intègre les informations pertinentes.

OUTPUT (JSON uniquement, structure identique au CANDIDAT, mais contenu optimisé) :
{
  "profil": { ... },
  "experiences": [... (rework descriptions)],
  "competences": { ... },
  "formations": [... ],
  "langues": { ... },
  "optimizations_applied": ["string"] // Ajoute ce champ pour lister ce que tu as changé (ex: "Mis en avant expérience Agile")
}
`;
