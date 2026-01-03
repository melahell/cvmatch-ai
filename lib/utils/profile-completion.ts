export function calculateProfileCompletion(ragData: any): {
    overall: number;
    sections: Record<string, number>;
} {
    if (!ragData) return { overall: 0, sections: {} };

    const sections: Record<string, number> = {};

    // Personal Info (25%)
    const personalFields = ['prenom', 'nom', 'email', 'telephone', 'adresse', 'titre_principal'];
    const personalFilled = personalFields.filter(f => ragData.profil?.[f]).length;
    sections.personal = Math.round((personalFilled / personalFields.length) * 100);

    // Experiences (25%)
    sections.experiences = (ragData.experiences?.length >= 2) ? 100 : (ragData.experiences?.length || 0) * 50;

    // Formations (20%)
    sections.formations = (ragData.formations?.length >= 1) ? 100 : 0;

    // Competences (20%)
    const hasSkills = (ragData.competences?.techniques?.length || 0) >= 3;
    sections.competences = hasSkills ? 100 : Math.min(((ragData.competences?.techniques?.length || 0) / 3) * 100, 100);

    // Languages (10%)
    sections.langues = (ragData.competences?.linguistiques?.length >= 1) ? 100 : 0;

    // Weighted overall
    const overall = Math.round(
        sections.personal * 0.25 +
        sections.experiences * 0.25 +
        sections.formations * 0.20 +
        sections.competences * 0.20 +
        sections.langues * 0.10
    );

    return { overall, sections };
}
