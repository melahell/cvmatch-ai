/**
 * Dashboard helper functions for conditional UI logic
 */

export function shouldShowOnboardingCTA(
    score: number,
    docsCount: number
): boolean {
    return score === 0 && docsCount === 0;
}

export function shouldShowCompletionTips(
    score: number,
    breakdown: any[]
): boolean {
    return score > 0 && score < 100 && breakdown && breakdown.length > 0;
}

export function getWelcomeMessage(score: number): string {
    if (score < 50) return "Améliorons votre profil ensemble";
    if (score < 80) return "Vous êtes sur la bonne voie !";
    return "Prêt à décrocher le job de vos rêves !";
}

export function getScoreDescription(score: number): string {
    if (score === 0) return "Commencez par créer votre profil";
    if (score < 30) return "Profil très incomplet";
    if (score < 50) return "Profil à améliorer";
    if (score < 70) return "Profil en progression";
    if (score < 85) return "Bon profil";
    if (score < 95) return "Excellent profil";
    return "Profil optimal !";
}
