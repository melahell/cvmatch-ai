// Phase 3 Item 7: Predictive score suggestions based on profile improvements

interface ProfileSuggestion {
    skill: string;
    currentScore: number;
    predictedScore: number;
    impact: 'high' | 'medium' | 'low';
    reason: string;
}

export function generateScorePredictions(
    currentProfile: any,
    jobRequirements: string[],
    currentScore: number
): ProfileSuggestion[] {
    const suggestions: ProfileSuggestion[] = [];

    const missingSkills = jobRequirements.filter(req =>
        !currentProfile.skills?.some((s: string) =>
            s.toLowerCase().includes(req.toLowerCase())
        )
    );

    // High impact suggestions
    missingSkills.slice(0, 3).forEach(skill => {
        suggestions.push({
            skill,
            currentScore,
            predictedScore: Math.min(currentScore + 15, 100),
            impact: 'high',
            reason: `Compétence clé recherchée par l'entreprise`
        });
    });

    // Medium impact
    if (currentProfile.experience_years < 5) {
        suggestions.push({
            skill: '+1 an d\'expérience',
            currentScore,
            predictedScore: currentScore + 5,
            impact: 'medium',
            reason: 'Rapproche du niveau d\'expérience demandé'
        });
    }

    // Low impact - soft skills
    const softSkills = ['leadership', 'communication', 'problem-solving'];
    softSkills.slice(0, 2).forEach(skill => {
        suggestions.push({
            skill: `Soft skill: ${skill}`,
            currentScore,
            predictedScore: currentScore + 3,
            impact: 'low',
            reason: 'Améliore le profil global'
        });
    });

    return suggestions.sort((a, b) =>
        (b.predictedScore - b.currentScore) - (a.predictedScore - a.currentScore)
    );
}

// Usage:
// const predictions = generateScorePredictions(userProfile, jobSkills, 65);
// Display top 5 suggestions with impact indicators
