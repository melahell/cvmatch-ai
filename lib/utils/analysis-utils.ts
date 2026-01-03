export type SortOption = "date" | "score" | "company";
export type SortDirection = "asc" | "desc";

export function sortAnalyses(
    analyses: any[],
    sortBy: SortOption,
    direction: SortDirection
): any[] {
    const sorted = [...analyses].sort((a, b) => {
        switch (sortBy) {
            case "date":
                return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            case "score":
                return (a.match_score || 0) - (b.match_score || 0);
            case "company":
                const companyA = a.match_report?.entreprise || "";
                const companyB = b.match_report?.entreprise || "";
                return companyA.localeCompare(companyB);
            default:
                return 0;
        }
    });

    return direction === "desc" ? sorted.reverse() : sorted;
}

export function filterAnalyses(analyses: any[], query: string): any[] {
    if (!query.trim()) return analyses;

    const lowerQuery = query.toLowerCase();
    return analyses.filter((analysis) => {
        const poste = analysis.match_report?.poste_cible?.toLowerCase() || "";
        const entreprise = analysis.match_report?.entreprise?.toLowerCase() || "";
        const url = analysis.job_url?.toLowerCase() || "";

        return poste.includes(lowerQuery) ||
            entreprise.includes(lowerQuery) ||
            url.includes(lowerQuery);
    });
}
