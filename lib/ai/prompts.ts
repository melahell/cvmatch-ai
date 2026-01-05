
import { UserProfile, JobAnalysis } from "@/types";

export const getRAGExtractionPrompt = (extractedText: string) => `
Tu es un expert en extraction et structuration de données professionnelles.

DOCUMENTS FOURNIS:
${extractedText}

MISSION CRITIQUE:
Extrais et structure les informations en SÉPARANT strictement :
1. Ce qui est EXPLICITEMENT écrit (compétences mentionnées textuellement)
2. Ce qui est INFÉRÉ du contexte (compétences déduites mais non écrites)

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
    "explicit": {
      "techniques": ["string"],
      "soft_skills": ["string"]
    },
    "inferred": {
      "techniques": [
        {
          "name": "string",
          "confidence": 0-100,
          "reasoning": "string (pourquoi tu l'infères)",
          "sources": ["citations exactes du CV"]
        }
      ],
      "tools": [
        {
          "name": "string",
          "confidence": 0-100,
          "reasoning": "string",
          "sources": ["citations"]
        }
      ],
      "soft_skills": [
        {
          "name": "string",
          "confidence": 0-100,
          "reasoning": "string",
          "sources": ["citations"]
        }
      ]
    }
  },
  "formations": [
    { "diplome": "string", "ecole": "string", "annee": "YYYY" }
  ],
  "langues": { "langue": "niveau" }
}

RÈGLES STRICTES pour COMPÉTENCES :

1. **EXPLICIT** = Compétences mentionnées TEXTUELLEMENT
   - "JavaScript", "React", "Python" → EXPLICIT si écrits
   - "Communication" → EXPLICIT si le mot est dans le CV

2. **INFERRED** = Compétences DÉDUITES du contexte
   ✅ Exemples VALID pour inférence :
   - "Git" si GitHub mentionné mais jamais "Git"
   - "Docker" si "containerisation" ou "déploiement" contextuel
   - "Agile/Scrum" si "gestion sprints" mais jamais "Agile"
   - "Leadership" si "management équipe de 5"
   
   Pour chaque inférence :
   - **confidence** : 60-100% (min 60%, sinon ne pas suggérer)
   - **reasoning** : Explication claire et concise
   - **sources** : Citations EXACTES du CV prouvant l'inférence

3. **OUTILS INTERMÉDIAIRES** (tools dans inferred)
   - Outils probablement utilisés mais non listés
   - Ex: "Jira" pour un PMO même si non mentionné explicitement
   - Ex: "Nginx" pour déploiement web apps

EXEMPLES :

❌ MAUVAIS :
"competences": {
  "techniques": ["JavaScript", "Git", "Docker"]  // Tout mélangé
}

✅ BON :
"competences": {
  "explicit": {
    "techniques": ["JavaScript", "React", "PostgreSQL"],
    "soft_skills": ["Communication"]
  },
  "inferred": {
    "techniques": [
      {
        "name": "Git",
        "confidence": 95,
        "reasoning": "5 projets mentionnent GitHub et collaboration sur code",
        "sources": ["Projet X: 'Collaboration sur GitHub'", "Projet Y: 'Gestion versions'"]
      }
    ],
    "tools": [
      {
        "name": "Docker",
        "confidence": 80,
        "reasoning": "Déploiement applications mentionné, containerisation probable",
        "sources": ["Experience PMO: 'déploiement automatisé applications'"]
      }
    ],
    "soft_skills": [
      {
        "name": "Leadership",
        "confidence": 90,
        "reasoning": "Management d'équipe et prise de décisions stratégiques",
        "sources": ["Chef de projet: 'management équipe de 5 développeurs'"]
      }
    ]
  }
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

⚠️ CONTRAINTES DE CONTENU (UNE PAGE A4):

📝 ELEVATOR PITCH:
- Maximum 300 caractères (3-4 phrases impactantes)
- Accroche incluant les mots-clés de l'offre

💼 EXPÉRIENCES:
- Maximum 5 expériences (les PLUS pertinentes pour cette offre)
- Maximum 4 bullets par expérience
- Chaque bullet: 150-200 caractères (2 lignes max)
- Format: "Action détaillée + Résultat chiffré"

🛠️ COMPÉTENCES:
- Maximum 12 compétences techniques
- Maximum 8 soft skills

🎓 FORMATIONS:
- Maximum 2 formations
- Format: "Diplôme - École (Année)"

🌐 LANGUES:
- Maximum 4 langues

RÈGLES DE SÉLECTION:
- Sélectionne les expériences et réalisations les PLUS pertinentes pour l'offre
- Garde suffisamment de détails pour montrer l'impact
- PRIORISE la PERTINENCE mais garde du contenu substantiel

ACTIONS:
1. Réécris le "profil.elevator_pitch" (max 300 caractères)
2. Pour chaque expérience, sélectionne les 4 meilleurs bullets et réécris-les avec détails
3. Mets en avant les compétences techniques citées dans l'offre
4. Si des notes personnelles sont fournies, intègre les informations pertinentes

OUTPUT (JSON uniquement, structure identique au CANDIDAT, mais contenu optimisé) :
{
  "profil": { ... },
  "experiences": [... (4 bullets max par exp, détaillés)],
  "competences": { "techniques": [...max 12], "soft_skills": [...max 8] },
  "formations": [... max 2],
  "langues": { ... max 4 },
  "optimizations_applied": ["string"] // Liste ce que tu as changé
}
`;
