
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

export const getCVOptimizationPrompt = (profile: any, jobDescription: string) => `
Tu es un expert en rédaction de CV (CV Writer) spécialisé dans l'optimisation ATS.

CANDIDAT (JSON) :
${JSON.stringify(profile)}

OFFRE D'EMPLOI :
${jobDescription}

MISSION:
Réécris le contenu du CV pour qu'il corresponde PARFAITEMENT à l'offre d'emploi, tout en restant VERIDIQUE.

⚠️ CONTRAINTE ABSOLUE - UNE PAGE A4 MAXIMUM:
Le CV DOIT tenir sur UNE SEULE page A4 (210mm × 297mm). Respecte ces limites:

LIMITES DE CONTENU:
- Expériences: 3 maximum (sélectionne les plus pertinentes pour l'offre)
- Bullets par expérience: 3-4 maximum
- Longueur bullet: 1 ligne (max 80 caractères)
- Elevator pitch: 2-3 lignes (max 250 caractères)
- Compétences techniques: 10-12 maximum
- Soft skills: 5-6 maximum
- Formations: 2 maximum (les plus récentes/pertinentes)
- Langues: toutes (concis)

STRATÉGIE DE SÉLECTION:
1. Si profil a >3 expériences → Garde les 3 PLUS pertinentes pour l'offre
2. Si expérience a >4 réalisations → Garde les 4 PLUS impactantes (résultats quantifiés prioritaires)
3. Privilégie expériences récentes (5 dernières années) sauf si ancienne expérience ultra-pertinente
4. Élimine expériences non pertinentes pour le poste visé

ACTIONS:
1. Réécris le "profil.elevator_pitch" pour qu'il résonne avec la mission (250 char max).
2. Sélectionne et optimise les 3 expériences les plus pertinentes avec 3-4 bullets chacune.
3. Mets en avant les compétences techniques citées dans l'offre (max 12).
4. Réduis soft_skills aux 5-6 plus pertinentes pour le poste.
5. Garde max 2 formations (les plus récentes/prestigieuses).

QUALITÉ DES BULLETS:
- Commence par verbe d'action (Développé, Optimisé, Piloté, Implémenté...)
- Inclus résultat quantifié si possible (+30% performance, 50k€ économisés...)
- Max 80 caractères pour tenir sur 1 ligne
- Mots-clés de l'offre intégrés naturellement

OUTPUT (JSON uniquement, structure identique au CANDIDAT, mais contenu optimisé et COMPRESSÉ) :
{
  "profil": {
    "elevator_pitch": "string (MAX 250 caractères)"
  },
  "experiences": [
    // MAX 3 expériences
    {
      "realisations": [
        // MAX 4 bullets de 80 caractères chacun
      ]
    }
  ],
  "competences": {
    "techniques": [/* MAX 12 */],
    "soft_skills": [/* MAX 6 */]
  },
  "formations": [/* MAX 2 */],
  "langues": { ... },
  "optimizations_applied": ["string"] // Liste ce que tu as changé
}
`;
