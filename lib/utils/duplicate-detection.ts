export function detectDuplicateAnalyses(analyses: any[]): Map<string, string[]> {
    const duplicates = new Map<string, string[]>();

    analyses.forEach((analysis, index) => {
        const url = analysis.job_url?.toLowerCase().trim();
        if (!url) return;

        analyses.slice(index + 1).forEach(other => {
            const otherUrl = other.job_url?.toLowerCase().trim();
            if (url === otherUrl) {
                const key = url;
                if (!duplicates.has(key)) {
                    duplicates.set(key, [analysis.id]);
                }
                duplicates.get(key)!.push(other.id);
            }
        });
    });

    return duplicates;
}

export function detectDuplicateSkills(skills: string[]): string[] {
    const seen = new Set<string>();
    const duplicates = new Set<string>();

    skills.forEach(skill => {
        const normalized = skill.toLowerCase().trim();
        if (seen.has(normalized)) {
            duplicates.add(skill);
        }
        seen.add(normalized);
    });

    return Array.from(duplicates);
}

export function detectDuplicateExperiences(experiences: any[]): any[] {
    const duplicates: any[] = [];

    experiences.forEach((exp, index) => {
        experiences.slice(index + 1).forEach(other => {
            if (
                exp.titre?.toLowerCase() === other.titre?.toLowerCase() &&
                exp.entreprise?.toLowerCase() === other.entreprise?.toLowerCase() &&
                exp.date_debut === other.date_debut
            ) {
                duplicates.push(other);
            }
        });
    });

    return duplicates;
}
