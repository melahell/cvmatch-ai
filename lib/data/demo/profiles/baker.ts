/**
 * Profil Démo : Joséphine Baker
 * 
 * Artiste, résistante et militante des droits civiques.
 * 1906-1975
 */

import { DemoProfile } from "../types";
import { RAGComplete } from "@/types/rag-complete";

const bakerRAG: RAGComplete = {
    profil: {
        nom: "Baker",
        prenom: "Joséphine",
        titre_principal: "Artiste Internationale & Militante des Droits Civiques",
        titres_alternatifs: ["Chanteuse", "Danseuse", "Actrice", "Résistante", "Militante"],
        localisation: "Paris, France",
        contact: { email: "josephine@baker.art" },
        elevator_pitch: "Artiste internationale ayant conquis Paris et le monde par son talent exceptionnel de danseuse et chanteuse. Première femme noire à devenir une star mondiale du divertissement. Résistante française pendant la Seconde Guerre mondiale, décorée de la Légion d'honneur et de la Croix de guerre. Militante infatigable pour les droits civiques aux côtés de Martin Luther King Jr."
    },
    experiences: [
        {
            id: "exp_folies",
            poste: "Vedette Principale",
            entreprise: "Folies Bergère",
            type_entreprise: "client_final",
            secteur: "Spectacle",
            lieu: "Paris, France",
            type_contrat: "cdi",
            debut: "1926-01",
            fin: "1935-12",
            actuel: false,
            duree_mois: 120,
            realisations: [
                { id: "real_revue", description: "Vedette de La Revue Nègre et des Folies Bergère, spectacles vus par des millions", impact: "Première star noire internationale, icône des Années Folles", keywords_ats: ["performance", "star internationale", "entertainment"], sources: ["archives_folies"] },
                { id: "real_cheetah", description: "Performances iconiques avec Chiquita le guépard, révolutionnant le spectacle vivant", impact: "Création d'une image de marque unique et mémorable", keywords_ats: ["branding personnel", "innovation scénique"], sources: ["archives_folies"] }
            ],
            technologies: [],
            outils: [],
            methodologies: [],
            clients_references: ["Folies Bergère", "Casino de Paris"],
            sources: ["archives_folies"],
            last_updated: "2026-01-19",
            merge_count: 1
        },
        {
            id: "exp_resistance",
            poste: "Agent de Renseignement",
            entreprise: "Résistance Française / Deuxième Bureau",
            type_entreprise: "public",
            secteur: "Défense / Renseignement",
            lieu: "France / Afrique du Nord",
            type_contrat: "mission",
            debut: "1940-06",
            fin: "1944-08",
            actuel: false,
            duree_mois: 51,
            contexte: "Engagement volontaire dans la Résistance française pendant l'Occupation.",
            realisations: [
                { id: "real_espionnage", description: "Transport de messages secrets cachés dans ses partitions et sous-vêtements", impact: "Renseignements cruciaux transmis aux Alliés", keywords_ats: ["renseignement", "discrétion", "courage"], sources: ["archives_militaires"] },
                { id: "real_decorations", description: "Décorée de la Légion d'honneur, Croix de guerre et Médaille de la Résistance", impact: "Reconnaissance nationale pour services exceptionnels", keywords_ats: ["distinctions", "héroïsme"], sources: ["archives_militaires"] }
            ],
            technologies: [],
            outils: [],
            methodologies: [],
            clients_references: ["Général de Gaulle"],
            sources: ["archives_militaires"],
            last_updated: "2026-01-19",
            merge_count: 1
        }
    ],
    competences: {
        explicit: {
            techniques: [
                { nom: "Danse", niveau: "expert", annees_experience: 40 },
                { nom: "Chant", niveau: "expert", annees_experience: 40 },
                { nom: "Comédie/Acting", niveau: "avance", annees_experience: 30 },
                { nom: "Communication publique", niveau: "expert", annees_experience: 35 }
            ],
            soft_skills: ["Charisme exceptionnel", "Courage", "Résilience", "Leadership", "Empathie", "Multilinguisme"],
            methodologies: []
        },
        inferred: { techniques: [], tools: [], soft_skills: [] },
        par_domaine: { "Spectacle": ["Danse", "Chant", "Comédie"], "Militantisme": ["Discours", "Mobilisation", "Plaidoyer"] }
    },
    formations: [],
    certifications: [],
    langues: [
        { langue: "Anglais", niveau: "Natif", niveau_cecrl: "C2" },
        { langue: "Français", niveau: "Courant", niveau_cecrl: "C2" },
        { langue: "Espagnol", niveau: "Intermédiaire", niveau_cecrl: "B1" }
    ],
    references: {
        clients: [
            { nom: "Folies Bergère", secteur: "Spectacle", type: "prive", annees: ["1926", "1975"], confidentiel: false },
            { nom: "Gouvernement Français", secteur: "État", type: "public", annees: ["1940", "1944"], confidentiel: false }
        ],
        projets_marquants: [{ id: "proj_march", nom: "Marche sur Washington 1963", description: "Seule femme à prendre la parole lors de la Marche sur Washington avec MLK", annee: "1963", technologies: [], resultats: "Discours historique devant 250 000 personnes", sources: ["archives_mlk"] }]
    },
    metadata: { version: "2.0.0", created_at: "2026-01-19T00:00:00Z", last_updated: "2026-01-19T00:00:00Z", last_merge_at: "2026-01-19T00:00:00Z", sources_count: 3, documents_sources: ["archives_folies", "archives_militaires", "archives_mlk"], completeness_score: 90, merge_history: [] }
};

export const bakerProfile: DemoProfile = {
    meta: {
        id: "baker",
        name: "Joséphine Baker",
        shortName: "Joséphine",
        period: "1906-1975",
        icon: "💃",
        title: "Artiste & Résistante",
        nationality: "USA / France",
        quote: "J'ai deux amours, mon pays et Paris.",
        categories: ["art", "politics"]
    },
    rag: bakerRAG,
    completenessScore: 90,
    generationTimeMs: 812,
    cvs: [
        { templateId: "modern", templateName: "Standard", templateDescription: "Format professionnel", pdfUrl: "/demo-cvs/baker-modern.pdf", previewUrl: "", recommended: false },
        { templateId: "classic", templateName: "Classique", templateDescription: "Design sobre", pdfUrl: "/demo-cvs/baker-classic.pdf", previewUrl: "", recommended: false },
        { templateId: "creative", templateName: "Créatif", templateDescription: "Layout coloré", pdfUrl: "/demo-cvs/baker-creative.pdf", previewUrl: "", recommended: true },
        { templateId: "tech", templateName: "ATS Optimisé", templateDescription: "Focus compétences", pdfUrl: "/demo-cvs/baker-tech.pdf", previewUrl: "", recommended: false }
    ],
    jobs: [
        { rank: 1, title: "Directrice Artistique - Crazy Horse Paris", matchScore: 96, salaryMin: 100000, salaryMax: 150000, currency: "EUR", contractType: "CDI", sectors: ["Spectacle"], location: "Paris", whyMatch: "Légende du cabaret parisien.", keySkills: ["Direction artistique", "Chorégraphie", "Casting"], jobDescription: "Direction artistique d'un cabaret légendaire." },
        { rank: 2, title: "Ambassadrice Diversité & Inclusion", company: "L'Oréal", matchScore: 94, salaryMin: 120000, salaryMax: 180000, currency: "EUR", contractType: "CDI", sectors: ["Beauté", "D&I"], location: "Paris", whyMatch: "Pionnière de la représentation.", keySkills: ["D&I", "Communication", "Influence"], jobDescription: "Promotion de la diversité dans l'industrie de la beauté." },
        { rank: 3, title: "Porte-Parole - UNHCR", matchScore: 92, salaryMin: 90000, salaryMax: 130000, currency: "EUR", contractType: "CDI", sectors: ["Humanitaire"], location: "Genève", whyMatch: "Tribu Arc-en-ciel + engagement humanitaire.", keySkills: ["Plaidoyer", "Communication"], jobDescription: "Représentation médiatique de l'agence des réfugiés." },
        { rank: 4, title: "Directrice de Casting - Netflix", matchScore: 89, salaryMin: 130000, salaryMax: 200000, currency: "EUR", contractType: "CDI", sectors: ["Entertainment"], location: "Los Angeles", whyMatch: "Œil pour le talent + vision inclusive.", keySkills: ["Casting", "Diversité", "Talent"], jobDescription: "Direction du casting pour productions originales." },
        { rank: 5, title: "Consultante Mémoire & Histoire", matchScore: 86, salaryMin: 70000, salaryMax: 100000, currency: "EUR", contractType: "Freelance", sectors: ["Culture", "Mémoire"], location: "Paris", whyMatch: "Témoin de l'histoire + résistante.", keySkills: ["Histoire", "Témoignage"], jobDescription: "Conseil pour projets mémoriels et historiques." },
        { rank: 6, title: "Productrice Exécutive - Broadway", matchScore: 84, salaryMin: 150000, salaryMax: 250000, currency: "EUR", contractType: "Freelance", sectors: ["Théâtre"], location: "New York", whyMatch: "Expérience scénique + vision artistique.", keySkills: ["Production", "Théâtre"], jobDescription: "Production de comédies musicales." },
        { rank: 7, title: "Formatrice Leadership Féminin", matchScore: 81, salaryMin: 80000, salaryMax: 120000, currency: "EUR", contractType: "Freelance", sectors: ["Formation"], location: "International", whyMatch: "Parcours inspirant + charisme.", keySkills: ["Formation", "Leadership"], jobDescription: "Formation au leadership pour femmes dirigeantes." },
        { rank: 8, title: "Directrice Communication - ONG", matchScore: 78, salaryMin: 75000, salaryMax: 100000, currency: "EUR", contractType: "CDI", sectors: ["ONG"], location: "Paris", whyMatch: "Communication + engagement social.", keySkills: ["Communication", "Plaidoyer"], jobDescription: "Direction de la communication d'une grande ONG." },
        { rank: 9, title: "Jury - Concours de Talents", matchScore: 75, salaryMin: 50000, salaryMax: 80000, currency: "EUR", contractType: "CDD", sectors: ["TV"], location: "Paris", whyMatch: "Expérience + bienveillance.", keySkills: ["Évaluation", "Mentorat"], jobDescription: "Jury d'émissions de talents." },
        { rank: 10, title: "Biographe & Conférencière", matchScore: 72, salaryMin: 40000, salaryMax: 70000, currency: "EUR", contractType: "Freelance", sectors: ["Édition"], location: "International", whyMatch: "Histoire extraordinaire à partager.", keySkills: ["Écriture", "Conférences"], jobDescription: "Écriture et conférences sur son parcours." }
    ],
    coverLetters: [
        { jobRank: 1, jobTitle: "Directrice Artistique - Crazy Horse Paris", tone: "professional_warm", wordCount: 320, content: `Cher Directeur,\n\nLe Crazy Horse Paris représente l'excellence du cabaret français, une tradition que j'ai contribué à créer et à porter dans le monde entier.\n\nDepuis mes débuts aux Folies Bergère, j'ai toujours cherché à repousser les limites du spectacle vivant. Mon expérience de vedette internationale m'a appris à captiver un public, à gérer une troupe et à créer des moments de magie sur scène.\n\n**Ce que j'apporte :**\n• Vision artistique audacieuse et innovante\n• Expérience de direction de spectacles à succès\n• Réseau international dans le monde du spectacle\n• Capacité à renouveler tout en respectant la tradition\n\nJe souhaite mettre mon expérience au service de cette institution que j'admire.\n\nAvec passion,\n\n**Joséphine Baker**` },
        { jobRank: 2, jobTitle: "Ambassadrice D&I - L'Oréal", tone: "professional_warm", wordCount: 300, content: `Madame, Monsieur,\n\nToute ma vie, j'ai lutté pour que la beauté soit reconnue dans toute sa diversité.\n\nPremière star noire internationale, j'ai prouvé que le talent et la beauté n'ont pas de couleur. Avec ma "Tribu Arc-en-ciel" - mes 12 enfants adoptés de toutes origines - j'ai montré que la fraternité universelle est possible.\n\n**Mon engagement :**\n• Représentation authentique de toutes les beautés\n• Combat contre les discriminations\n• Promotion de l'inclusion à tous les niveaux\n\nL'Oréal a le pouvoir de changer les normes de beauté.\n\nEnsemble, rendons la beauté universelle.\n\n**Joséphine Baker**` },
        { jobRank: 3, jobTitle: "Porte-Parole - UNHCR", tone: "formal", wordCount: 280, content: `Madame, Monsieur,\n\nAyant moi-même fui la ségrégation américaine pour trouver refuge en France, je comprends intimement ce que signifie chercher un nouveau foyer.\n\nMon engagement pour les réfugiés ne date pas d'hier : j'ai accueilli chez moi, au Château des Milandes, des enfants du monde entier abandonnés par leur pays.\n\n**Mes qualifications :**\n• Expérience personnelle de l'exil et de l'accueil\n• Notoriété internationale pour amplifier les messages\n• Engagement prouvé pour les causes humanitaires\n\nJe serais honorée de porter la voix de ceux qui n'en ont plus.\n\nRespecteusement,\n\n**Joséphine Baker**` }
    ]
};

export default bakerProfile;
