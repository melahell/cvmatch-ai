/**
 * Convertir les données RAGComplete en CVData pour le rendu des templates
 * 
 * Gère les différents formats de données RAG (profils démo et profils utilisateur)
 */

import { RAGComplete } from "@/types/rag-complete";
import { CVData } from "@/components/cv/templates";

/**
 * Convertit un profil RAGComplete vers le format CVData attendu par les templates
 */
export function ragToCVData(rag: RAGComplete): CVData {
    const profil = rag.profil || {} as any;

    return {
        profil: {
            prenom: profil.prenom || "",
            nom: profil.nom || "",
            titre_principal: profil.titre_principal || "",
            email: profil.contact?.email || (profil as any).email || "",
            telephone: profil.contact?.telephone || (profil as any).telephone || "",
            localisation: profil.localisation || "",
            linkedin: profil.contact?.linkedin || (profil as any).linkedin || "",
            elevator_pitch: profil.elevator_pitch || "",
            photo_url: profil.photo_url,
        },
        experiences: (rag.experiences || []).map(exp => {
            const realisations = extractRealisations(exp.realisations);

            return {
                poste: exp.poste || "",
                entreprise: exp.entreprise || "",
                // Support both formats: date_debut/date_fin and debut/fin
                date_debut: (exp as any).date_debut || (exp as any).debut || "",
                date_fin: (exp as any).date_fin || (exp as any).fin || undefined,
                lieu: exp.lieu || undefined,
                realisations,
                // Add relevance score for badges if present
                _relevance_score: (exp as any)._relevance_score,
            } as any;
        }),
        competences: {
            techniques: extractTechnicalSkills(rag.competences),
            soft_skills: extractSoftSkills(rag.competences),
        },
        formations: (rag.formations || []).map(f => ({
            diplome: (f as any).titre || (f as any).diplome || "",
            etablissement: (f as any).organisme || (f as any).etablissement || "",
            annee: (f as any).annee || (f as any).date_fin || undefined,
        })),
        langues: (rag.langues || []).map(l => ({
            langue: l.langue || "",
            niveau: l.niveau || "",
        })),
        certifications: extractCertifications(rag.certifications),
        clients_references: extractClientReferences(rag),
    };
}

/**
 * Extrait les réalisations d'une expérience (gère les différents formats)
 */
function extractRealisations(realisations: any): string[] {
    if (!realisations) return [];
    if (!Array.isArray(realisations)) return [];

    return realisations.map((r: any) => {
        // String simple
        if (typeof r === "string") return r;

        // Objet avec description (format démo)
        if (r && typeof r === "object") {
            const parts = [];
            if (r.description) parts.push(r.description);
            // Enrichissement : ajout de la quantification si présente
            if (r.quantification && r.quantification.display) {
                parts.push(r.quantification.display);
            }
            if (r.impact) parts.push(r.impact);

            if (parts.length > 0) return parts.join(" — ");

            if (r.display) return r.display;
            if (r.text) return r.text;
        }

        return "";
    }).filter(Boolean);
}

/**
 * Extrait les compétences techniques du format RAG
 */
function extractTechnicalSkills(competences: any): string[] {
    if (!competences) return [];

    // Format avec explicit.techniques (démo profiles)
    if (competences.explicit?.techniques) {
        return competences.explicit.techniques.map((t: any) =>
            typeof t === "string" ? t : t.nom || t.name || ""
        ).filter(Boolean);
    }

    // Format simple avec techniques directement
    if (Array.isArray(competences.techniques)) {
        return competences.techniques.map((t: any) =>
            typeof t === "string" ? t : t.nom || t.name || ""
        ).filter(Boolean);
    }

    return [];
}

/**
 * Extrait les soft skills du format RAG
 */
function extractSoftSkills(competences: any): string[] {
    if (!competences) return [];

    // Format avec explicit.soft_skills (démo profiles)
    if (competences.explicit?.soft_skills) {
        return competences.explicit.soft_skills.map((s: any) =>
            typeof s === "string" ? s : s.nom || s.name || ""
        ).filter(Boolean);
    }

    // Format simple
    if (Array.isArray(competences.soft_skills)) {
        return competences.soft_skills.map((s: any) =>
            typeof s === "string" ? s : s.nom || s.name || ""
        ).filter(Boolean);
    }

    return [];
}

/**
 * Extrait les certifications
 */
function extractCertifications(certifications: any): string[] {
    if (!certifications) return [];
    if (!Array.isArray(certifications)) return [];

    return certifications.map((c: any) =>
        typeof c === "string" ? c : c.nom || c.name || c.titre || ""
    ).filter(Boolean);
}

/**
 * Extrait les références clients
 */
function extractClientReferences(rag: RAGComplete): { clients: string[] } | undefined {
    // Format démo avec references.clients
    if ((rag as any).references?.clients) {
        const clients = (rag as any).references.clients;
        return {
            clients: Array.isArray(clients)
                ? clients.map((c: any) => typeof c === "string" ? c : c.nom || c.name || "").filter(Boolean)
                : []
        };
    }

    // Format avec clients_references direct
    if ((rag as any).clients_references?.clients) {
        return (rag as any).clients_references;
    }

    return undefined;
}
