import { UserProfile, JobAnalysis } from "@/types";

/**
 * Optimized RAG extraction prompt - shorter version for faster processing
 * while maintaining quality standards
 */
export const getRAGExtractionPromptOptimized = (extractedText: string) => `
Expert extraction données pro. Extrais TOUT avec rigueur max.

DOCUMENTS:
${extractedText}

JSON OBLIGATOIRE:
{
  "profil": {"nom":"","prenom":"","titre_principal":"","localisation":"","contact":{"email":"","telephone":"","linkedin":""},"elevator_pitch":"3 phrases: 1)Titre+XP+secteur 2)Réalisations quantifiées+clients 3)Valeur unique (200-400 chars, 3+ chiffres)"},
  "experiences": [{"poste":"","entreprise":"","debut":"YYYY-MM","fin":"YYYY-MM|null","actuel":true/false,"realisations":[{"description":"ACTION+CONTEXTE","impact":"QUANTIFIÉ: volume/budget/%/temps/portée"}],"technologies":[""],"clients_references":["noms clients"]}],
  "competences": {"explicit":{"techniques":[""],"soft_skills":[""]},"inferred":{"techniques":[{"name":"","confidence":60-100,"reasoning":"min 50 chars","sources":["citation"]}],"tools":[...],"soft_skills":[...]}},
  "formations": [{"diplome":"","ecole":"","annee":"YYYY"}],
  "certifications": ["PMP, AWS, etc - PAS formations"],
  "langues": {"Français":"Natif"},
  "references": {"clients": [{"nom":"","secteur":"Luxe|Finance|Tech|Industrie|Santé|Transport|Énergie|Conseil|Retail|Autre"}]},
  "projets": [{"nom":"","description":"","technologies":[""],"impact":"","date":"YYYY"}]
}

RÈGLES CRITIQUES:
1. **Elevator Pitch**: 3 phrases, 200-400 chars, 3+ chiffres minimum
2. **Impacts**: 60%+ réalisations DOIVENT être quantifiées (ex: "+45%", "15M€", "150 projets")
3. **Clients**: Extrais TOUS (Cartier, Chanel, BNP, LVMH, etc.) dans experiences[].clients_references ET references.clients avec secteur
4. **Certifications vs Formations**: SÉPARER (certif=PMP/AWS, formation=diplômes)
5. **Inferred skills**: confidence≥60, reasoning≥50 chars, sources obligatoires
6. **Titre**: Précis (ex: "Chef Projet Digital Senior" PAS "Professionnel")

VALIDATION:
- Elevator pitch générique = REJETÉ
- Impact sans chiffre = REJETÉ
- Compétence inférée sans reasoning/sources = REJETÉ

OUTPUT: JSON pur, pas de markdown, pas de commentaires.
`;

/**
 * Use optimized prompt by default to avoid timeouts
 */
export const getRAGExtractionPrompt = getRAGExtractionPromptOptimized;
