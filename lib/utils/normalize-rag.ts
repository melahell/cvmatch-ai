// Helper pour normaliser les données RAG (flat vs nested structure)
export function normalizeRAGData(data: any): any {
    if (!data) return null;

    // Si déjà en structure nested (avec 'profil'), retourne tel quel
    if (data.profil && typeof data.profil === 'object') {
        return data;
    }

    // Si structure flat (nom, prenom, etc. à la racine), convertit en nested
    if (data.nom || data.prenom) {
        return {
            profil: {
                nom: data.nom,
                prenom: data.prenom,
                titre_principal: data.titre_principal,
                localisation: data.localisation,
                elevator_pitch: data.elevator_pitch,
                photo_url: data.photo_url,
                contact: data.contact
            },
            experiences: data.experiences || [],
            competences: data.competences || { techniques: [], soft_skills: [] },
            formations: data.formations || [],
            langues: data.langues || {},
            projets: data.projets || []
        };
    }

    // Si structure inconnue, retourne tel quel
    return data;
}
