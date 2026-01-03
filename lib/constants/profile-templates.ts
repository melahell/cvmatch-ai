export const PROFILE_TEMPLATES = {
    developer: {
        name: "Développeur Full-Stack",
        profil: {
            titre_principal: "Développeur Full-Stack",
            bio: "Développeur passionné avec X années d'expérience en développement web moderne."
        },
        competences: {
            techniques: [
                "JavaScript", "TypeScript", "React", "Node.js",
                "Python", "SQL", "Git", "Docker"
            ],
            outils: ["VS Code", "GitHub", "Postman", "Figma"],
            soft_skills: ["Travail d'équipe", "Communication", "Autonomie"],
            linguistiques: [
                { langue: "Français", niveau: "Natif" },
                { langue: "Anglais", niveau: "Professionnel" }
            ]
        }
    },

    designer: {
        name: "UI/UX Designer",
        profil: {
            titre_principal: "UI/UX Designer",
            bio: "Designer créatif spécialisé en expérience utilisateur et interfaces web/mobile."
        },
        competences: {
            techniques: ["Figma", "Adobe XD", "Sketch", "Photoshop"],
            outils: ["InVision", "Miro", "Notion"],
            soft_skills: ["Créativité", "Empathie utilisateur", "Communication visuelle"],
            linguistiques: [
                { langue: "Français", niveau: "Natif" },
                { langue: "Anglais", niveau: "Professionnel" }
            ]
        }
    },

    marketing: {
        name: "Marketing Digital",
        profil: {
            titre_principal: "Responsable Marketing Digital",
            bio: "Expert en stratégie digitale et acquisition de leads."
        },
        competences: {
            techniques: ["SEO", "SEA", "Analytics", "Social Media"],
            outils: ["Google Analytics", "HubSpot", "Mailchimp"],
            soft_skills: ["Analyse", "Stratégie", "Créativité"],
            linguistiques: [
                { langue: "Français", niveau: "Natif" },
                { langue: "Anglais", niveau: "Professionnel" }
            ]
        }
    }
};
