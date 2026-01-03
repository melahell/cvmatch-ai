export const POPULAR_SKILLS = {
    tech: [
        "JavaScript", "TypeScript", "React", "Vue.js", "Angular",
        "Node.js", "Python", "Java", "C#", "PHP",
        "SQL", "MongoDB", "PostgreSQL", "Redis",
        "Docker", "Kubernetes", "AWS", "Azure", "GCP",
        "Git", "CI/CD", "Agile", "Scrum"
    ],

    design: [
        "Figma", "Adobe XD", "Sketch", "Photoshop", "Illustrator",
        "InVision", "Miro", "UI Design", "UX Research", "Wireframing",
        "Prototyping", "Design Systems", "Responsive Design"
    ],

    marketing: [
        "SEO", "SEA", "Google Analytics", "Facebook Ads", "Google Ads",
        "Content Marketing", "Email Marketing", "Social Media",
        "CRM", "HubSpot", "Mailchimp", "Copywriting"
    ],

    softSkills: [
        "Communication", "Travail d'équipe", "Leadership", "Gestion de projet",
        "Résolution de problèmes", "Pensée critique", "Créativité",
        "Adaptabilité", "Gestion du temps", "Autonomie"
    ]
};

export function getSkillSuggestions(query: string, category?: string): string[] {
    const allSkills = category && POPULAR_SKILLS[category as keyof typeof POPULAR_SKILLS]
        ? POPULAR_SKILLS[category as keyof typeof POPULAR_SKILLS]
        : Object.values(POPULAR_SKILLS).flat();

    return allSkills
        .filter(skill => skill.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 10);
}
