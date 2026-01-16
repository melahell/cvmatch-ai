/**
 * Contextual Enrichment Module
 * Deduces implicit responsibilities and tacit competencies from RAG data
 */

import {
    ContexteEnrichi,
    ResponsabiliteImplicite,
    CompetenceTacite,
    EnvironnementTravail
} from '@/types/rag-enhanced';

/**
 * Prompt for generating contextual enrichment
 */
export function getContexteEnrichiPrompt(ragData: any): string {
    // Extract key info for the prompt
    const experiences = ragData.experiences || [];
    const currentExp = experiences.find((e: any) => e.actuel || !e.fin) || experiences[0];
    const yearsExp = experiences.length > 0 ?
        Math.max(...experiences.map((e: any) => {
            const start = new Date(e.debut || "2020-01");
            const end = e.fin ? new Date(e.fin) : new Date();
            return Math.floor((end.getTime() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        })) : 0;

    const totalYearsExp = experiences.reduce((acc: number, exp: any) => {
        const start = new Date(exp.debut || "2020-01");
        const end = exp.fin ? new Date(exp.fin) : new Date();
        return acc + ((end.getTime() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    }, 0);

    return `
Tu es un expert RH / Recruteur senior avec 20 ans d'expérience.

══════════════════════════════════════════════════════════════════════════════
PROFIL RAG (données explicites extraites) :
══════════════════════════════════════════════════════════════════════════════

POSTE ACTUEL: ${currentExp?.poste || "Non spécifié"} chez ${currentExp?.entreprise || "Non spécifié"}

EXPÉRIENCE TOTALE: ${Math.round(totalYearsExp)} ans

EXPÉRIENCES:
${experiences.map((exp: any, i: number) => `
  ${i + 1}. ${exp.poste} @ ${exp.entreprise} (${exp.debut} - ${exp.fin || "Présent"})
     Réalisations: ${(exp.realisations || []).map((r: any) => r.description).join(" | ") || "Non détaillées"}
     Technologies: ${(exp.technologies || []).join(", ") || "Non spécifiées"}
     Clients: ${(exp.clients_references || []).join(", ") || "Non mentionnés"}
`).join("")}

COMPÉTENCES EXPLICITES:
  Techniques: ${ragData.competences?.explicit?.techniques?.join(", ") || "Non spécifiées"}
  Soft Skills: ${ragData.competences?.explicit?.soft_skills?.join(", ") || "Non spécifiés"}

FORMATIONS: ${(ragData.formations || []).map((f: any) => f.diplome).join(", ") || "Non spécifiées"}

LANGUES: ${Object.entries(ragData.langues || {}).map(([l, n]) => `${l}: ${n}`).join(", ") || "Non spécifiées"}

══════════════════════════════════════════════════════════════════════════════
MISSION : Enrichissement Contextuel
══════════════════════════════════════════════════════════════════════════════

Déduis les RESPONSABILITÉS IMPLICITES et COMPÉTENCES TACITES basées sur :
- Type de poste + séniorité
- Secteur d'activité (Finance, IT, Industrie, etc.)
- Taille & type d'entreprise
- Contexte des missions décrites
- Années d'expérience

══════════════════════════════════════════════════════════════════════════════
RÈGLES CRITIQUES :
══════════════════════════════════════════════════════════════════════════════

1. NIVEAU DE CERTITUDE :
   - "Très probable" (90%+) : Quasi certain basé sur poste + contexte
   - "Probable" (70-90%) : Fortement suggéré par le contexte
   - "Possible" (50-70%) : Plausible mais manque d'indices directs

2. JUSTIFICATION OBLIGATOIRE : Chaque déduction doit être justifiée.

3. CONSERVATEUR : Mieux vaut sous-estimer que sur-interpréter.

4. CATÉGORIES DE RESPONSABILITÉS :
   - Gouvernance : Animation COPIL/CODIR, comités, instances décisionnelles
   - Budget : Gestion budgétaire, forecasts, analyse écarts
   - Stakeholders : Gestion des parties prenantes, négociation
   - Qualité : Audits, ISO, assurance qualité
   - Conformité : Réglementation, compliance
   - Gestion_Crise : Incidents critiques, plans de continuité
   - Reporting : Tableaux de bord, KPIs, communication
   - Change_Management : Conduite du changement, transformation

══════════════════════════════════════════════════════════════════════════════
OUTPUT FORMAT (JSON uniquement, pas de texte avant ou après) :
══════════════════════════════════════════════════════════════════════════════

{
  "responsabilites_implicites": [
    {
      "categorie": "Gouvernance|Budget|Stakeholders|Qualité|Conformité|Gestion_Crise|Reporting|Change_Management",
      "actions": ["action1", "action2", "action3"],
      "niveau_certitude": "Très probable|Probable|Possible",
      "justification": "Raison de cette déduction basée sur le contexte"
    }
  ],
  "competences_tacites": [
    {
      "competence": "Nom de la compétence tacite",
      "niveau_deduit": "Expert|Avancé|Intermédiaire",
      "contexte": "Justification du niveau déduit"
    }
  ],
  "soft_skills_deduites": [
    "Soft skill 1",
    "Soft skill 2"
  ],
  "environnement_travail": {
    "complexite_organisationnelle": "Très élevée|Élevée|Moyenne|Faible",
    "niveau_autonomie": "Très élevé|Élevé|Moyen|Faible",
    "exposition_direction": "Très élevée|Élevée|Moyenne|Faible",
    "criticite_missions": "Très élevée|Élevée|Moyenne|Faible",
    "environnement_multiculturel": true|false,
    "langues_travail": ["Français", "Anglais"]
  }
}

IMPORTANT: Retourne UNIQUEMENT le JSON, sans aucun texte explicatif avant ou après.
`;
}

/**
 * Generate contextual enrichment from RAG data using Gemini
 * 
 * @param ragData - The explicit RAG data extracted from documents
 * @param generateFn - The Gemini generate function (with fallback)
 * @returns Contextual enrichment or null if generation fails
 */
export async function generateContexteEnrichi(
    ragData: any,
    generateFn: (prompt: string) => Promise<any>
): Promise<ContexteEnrichi | null> {
    try {
        const prompt = getContexteEnrichiPrompt(ragData);
        const result = await generateFn(prompt);
        const responseText = result.response.text();

        // Parse JSON
        const jsonString = responseText
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const enrichi = JSON.parse(jsonString);

        console.log('[ENRICHISSEMENT] Generated:', {
            responsabilites: enrichi.responsabilites_implicites?.length || 0,
            competences: enrichi.competences_tacites?.length || 0,
            softSkills: enrichi.soft_skills_deduites?.length || 0
        });

        return enrichi as ContexteEnrichi;

    } catch (error: any) {
        console.error('[ENRICHISSEMENT] Failed:', error.message);
        // Return empty structure on error (non-blocking)
        return {
            responsabilites_implicites: [],
            competences_tacites: [],
            soft_skills_deduites: [],
            environnement_travail: {
                complexite_organisationnelle: "Moyenne",
                niveau_autonomie: "Moyen",
                exposition_direction: "Moyenne",
                criticite_missions: "Moyenne",
                environnement_multiculturel: false,
                langues_travail: ["Français"]
            }
        };
    }
}

export default generateContexteEnrichi;
