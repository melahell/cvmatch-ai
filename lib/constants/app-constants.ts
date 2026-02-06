// CV_TEMPLATES : source unique dans components/cv/templates (dérivé de TEMPLATES)

export const STATUS_BADGES: Record<string, { label: string; color: string }> = {
    pending: { label: "À faire", color: "slate" },
    applied: { label: "Postulé", color: "blue" },
    interviewing: { label: "Entretien", color: "purple" },
    rejected: { label: "Refusé", color: "red" },
    offer: { label: "Offre reçue", color: "green" }
};
