export const CV_TEMPLATES = [
    {
        id: "modern",
        name: "Moderne",
        description: "Design épuré et professionnel",
        preview: "/templates/modern.png"
    },
    {
        id: "classic",
        name: "Classique",
        description: "Format traditionnel et sobre",
        preview: "/templates/classic.png"
    },
    {
        id: "creative",
        name: "Créatif",
        description: "Pour les profils artistiques",
        preview: "/templates/creative.png"
    },
    {
        id: "tech",
        name: "Tech",
        description: "Optimisé pour les développeurs",
        preview: "/templates/tech.png"
    }
];

export const STATUS_BADGES: Record<string, { label: string; color: string }> = {
    pending: { label: "À faire", color: "slate" },
    applied: { label: "Postulé", color: "blue" },
    interviewing: { label: "Entretien", color: "purple" },
    rejected: { label: "Refusé", color: "red" },
    offer: { label: "Offre reçue", color: "green" }
};
