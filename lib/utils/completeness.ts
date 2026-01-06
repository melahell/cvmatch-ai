/**
 * Legacy completeness calculation (kept for backward compatibility)
 * NEW: Use calculateQualityScore from @/lib/rag/quality-scoring for better metrics
 */
export const calculateCompletenessWithBreakdown = (data: any) => {
    const breakdown: { category: string; score: number; max: number; missing?: string }[] = [];
    let total = 0;

    // Profil (20 points)
    const hasProfile = data?.profil?.nom && data?.profil?.prenom && data?.profil?.titre_principal;
    const profileScore = hasProfile ? 20 : (data?.profil?.nom || data?.profil?.prenom) ? 10 : 0;
    breakdown.push({
        category: "Identité",
        score: profileScore,
        max: 20,
        missing: !hasProfile ? "Ajoutez nom, prénom et titre principal" : undefined
    });
    total += profileScore;

    // Expériences (30 points)
    const expCount = data?.experiences?.length || 0;
    const expScore = Math.min(30, expCount * 10);
    breakdown.push({
        category: "Expériences",
        score: expScore,
        max: 30,
        missing: expCount < 3 ? `${3 - expCount} expérience(s) recommandée(s) en plus` : undefined
    });
    total += expScore;

    // Compétences (25 points)
    const techCount = data?.competences?.techniques?.length || 0;
    const techScore = Math.min(25, techCount * 5);
    breakdown.push({
        category: "Compétences techniques",
        score: techScore,
        max: 25,
        missing: techCount < 5 ? `Ajoutez ${5 - techCount} compétence(s) technique(s)` : undefined
    });
    total += techScore;

    // Formations (15 points)
    const formCount = data?.formations?.length || 0;
    const formScore = Math.min(15, formCount * 7);
    breakdown.push({
        category: "Formations",
        score: formScore,
        max: 15,
        missing: formCount === 0 ? "Ajoutez au moins une formation" : undefined
    });
    total += formScore;

    // Projets/Langues (10 points)
    const hasLangOrProj = (data?.langues && Object.keys(data.langues).length > 0) || data?.projets?.length > 0;
    const extraScore = hasLangOrProj ? 10 : 0;
    breakdown.push({
        category: "Langues/Projets",
        score: extraScore,
        max: 10,
        missing: !hasLangOrProj ? "Ajoutez des langues ou projets personnels" : undefined
    });
    total += extraScore;

    return { score: Math.min(100, total), breakdown };
};
