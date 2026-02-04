import type { CVData } from "@/components/cv/templates";

export const SAMPLE_CV_DATA: CVData = {
    profil: {
        prenom: "Alex",
        nom: "Martin",
        titre_principal: "Product Engineer",
        email: "alex.martin@example.com",
        telephone: "+33 6 00 00 00 00",
        localisation: "Paris, FR",
        linkedin: "linkedin.com/in/alex-martin",
        github: "github.com/alexmartin",
        elevator_pitch: "Ingénieur produit orienté impact, spécialisé web et data.",
    },
    experiences: [
        {
            poste: "Senior Product Engineer",
            entreprise: "Acme",
            date_debut: "2022",
            date_fin: "2025",
            lieu: "Paris",
            realisations: [
                "Refonte d’un parcours d’onboarding (−18% churn à J7).",
                "Mise en place d’un design system (−35% temps de dev UI).",
                "Optimisation perf (LCP 3.2s → 1.8s).",
            ],
            clients: ["Retail", "SaaS"],
        },
        {
            poste: "Fullstack Engineer",
            entreprise: "BetaLabs",
            date_debut: "2020",
            date_fin: "2022",
            lieu: "Remote",
            realisations: [
                "API Node/TS + Postgres, CI/CD, monitoring.",
                "Automatisation reporting et export PDF.",
            ],
        },
    ],
    competences: {
        techniques: ["TypeScript", "React", "Next.js", "Node.js", "Postgres", "Tailwind", "Supabase"],
        soft_skills: ["Communication", "Priorisation", "Autonomie"],
    },
    formations: [
        { diplome: "Master Informatique", etablissement: "Université", annee: "2020" },
    ],
    langues: [
        { langue: "Français", niveau: "Natif" },
        { langue: "Anglais", niveau: "Courant" },
    ],
    certifications: ["AWS Cloud Practitioner"],
    clients_references: {
        clients: ["Acme", "BetaLabs", "Gamma"],
    },
    projects: [
        {
            nom: "CV-Crush",
            description: "Génération de CV optimisés + templates.",
            technologies: ["Next.js", "Supabase"],
        },
    ],
};

