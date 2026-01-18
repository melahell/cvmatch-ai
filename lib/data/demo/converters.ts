/**
 * Convertisseurs de données pour le module démo
 * 
 * Permet de convertir les types RAGComplete vers CVData
 * utilisé par les templates de CV.
 */

import { RAGComplete } from "@/types/rag-complete";
import { CVData } from "@/components/cv/templates";

/**
 * Convertit un profil RAGComplete vers le format CVData
 * utilisé par les templates de CV.
 */
export function ragToCVData(rag: RAGComplete): CVData {
    return {
        profil: {
            prenom: rag.profil.prenom,
            nom: rag.profil.nom,
            titre_principal: rag.profil.titre_principal,
            email: rag.profil.contact.email,
            telephone: rag.profil.contact.telephone,
            localisation: rag.profil.localisation,
            linkedin: rag.profil.contact.linkedin,
            elevator_pitch: rag.profil.elevator_pitch,
            photo_url: rag.profil.photo_url,
        },
        experiences: rag.experiences.map(exp => ({
            poste: exp.poste,
            entreprise: exp.entreprise,
            date_debut: exp.debut,
            date_fin: exp.fin || undefined,
            lieu: exp.lieu,
            realisations: exp.realisations.map(r => r.description),
        })),
        competences: {
            techniques: rag.competences.explicit.techniques.map(s =>
                typeof s === 'string' ? s : s.nom
            ),
            soft_skills: rag.competences.explicit.soft_skills,
        },
        formations: rag.formations.map(f => ({
            diplome: f.titre,
            etablissement: f.organisme,
            annee: f.annee,
        })),
        langues: rag.langues.map(l => ({
            langue: l.langue,
            niveau: l.niveau,
        })),
        certifications: rag.certifications.map(c => c.nom),
        clients_references: {
            clients: rag.references.clients
                .filter(c => !c.confidentiel)
                .map(c => c.nom),
        },
    };
}

/**
 * Formate une date pour l'affichage (YYYY-MM → Mois YYYY)
 */
export function formatDateDisplay(date: string): string {
    const [year, month] = date.split('-');
    if (!month) return year;

    const months = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    const monthIndex = parseInt(month, 10) - 1;
    return `${months[monthIndex]} ${year}`;
}

/**
 * Calcule la durée entre deux dates en mois
 */
export function calculateDurationMonths(start: string, end: string | null): number {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();

    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12
        + (endDate.getMonth() - startDate.getMonth());

    return Math.max(1, months);
}

/**
 * Formate une durée en texte lisible
 */
export function formatDuration(months: number): string {
    if (months < 12) {
        return `${months} mois`;
    }

    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (remainingMonths === 0) {
        return `${years} an${years > 1 ? 's' : ''}`;
    }

    return `${years} an${years > 1 ? 's' : ''} et ${remainingMonths} mois`;
}
