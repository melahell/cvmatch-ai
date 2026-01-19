/**
 * Convertir les données RAGComplete en CVData pour le rendu des templates
 */

import { RAGComplete } from "@/types/rag-complete";
import { CVData } from "@/components/cv/templates";

/**
 * Convertit un profil RAGComplete vers le format CVData attendu par les templates
 */
export function ragToCVData(rag: RAGComplete): CVData {
    const profil = rag.profil || {};

    return {
        profil: {
            prenom: profil.prenom || "",
            nom: profil.nom || "",
            titre_principal: profil.titre_principal || "",
            email: profil.contact?.email,
            telephone: profil.contact?.telephone,
            localisation: profil.localisation || "",
            linkedin: profil.contact?.linkedin,
            elevator_pitch: profil.elevator_pitch || "",
            photo_url: profil.photo_url,
        },
        experiences: (rag.experiences || []).map(exp => ({
            poste: exp.poste || "",
            entreprise: exp.entreprise || "",
            date_debut: exp.debut || "",
            date_fin: exp.fin || undefined,
            lieu: exp.lieu || undefined,
            realisations: (exp.realisations || []).map(r => {
                if (typeof r === "string") return r;
                if (r.description) return r.description;
                if (r.impact) return r.impact;
                return "";
            }).filter(Boolean),
        })),
        competences: {
            techniques: extractTechnicalSkills(rag.competences),
            soft_skills: extractSoftSkills(rag.competences),
        },
        formations: (rag.formations || []).map(f => ({
            diplome: f.titre || "",
            etablissement: f.organisme || "",
            annee: f.annee || f.date_fin || undefined,
        })),
        langues: (rag.langues || []).map(l => ({
            langue: l.langue || "",
            niveau: l.niveau || "",
        })),
        certifications: (rag.certifications || []).map(c =>
            typeof c === "string" ? c : c.nom || ""
        ),
        clients_references: rag.references?.clients ? {
            clients: rag.references.clients.map(c =>
                typeof c === "string" ? c : c.nom || ""
            ),
        } : undefined,
    };
}

/**
 * Extrait les compétences techniques du format RAG
 */
function extractTechnicalSkills(competences: any): string[] {
    if (!competences) return [];

    // Format avec explicit.techniques
    if (competences.explicit?.techniques) {
        return competences.explicit.techniques.map((t: any) =>
            typeof t === "string" ? t : t.nom || ""
        ).filter(Boolean);
    }

    // Format simple avec techniques directement
    if (Array.isArray(competences.techniques)) {
        return competences.techniques.map((t: any) =>
            typeof t === "string" ? t : t.nom || ""
        ).filter(Boolean);
    }

    return [];
}

/**
 * Extrait les soft skills du format RAG
 */
function extractSoftSkills(competences: any): string[] {
    if (!competences) return [];

    // Format avec explicit.soft_skills
    if (competences.explicit?.soft_skills) {
        return competences.explicit.soft_skills.map((s: any) =>
            typeof s === "string" ? s : s.nom || ""
        ).filter(Boolean);
    }

    // Format simple
    if (Array.isArray(competences.soft_skills)) {
        return competences.soft_skills.map((s: any) =>
            typeof s === "string" ? s : s.nom || ""
        ).filter(Boolean);
    }

    return [];
}
