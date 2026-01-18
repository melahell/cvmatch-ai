/**
 * Profil Démo : Cléopâtre VII
 * 
 * Dernière reine d'Égypte, stratège politique.
 * 69-30 av. J.-C.
 */

import { DemoProfile } from "../types";
import { RAGComplete } from "@/types/rag-complete";

const cleopatraRAG: RAGComplete = {
    profil: {
        nom: "Ptolémée",
        prenom: "Cléopâtre VII",
        titre_principal: "Reine d'Égypte & Stratège Diplomatique",
        titres_alternatifs: ["Pharaon", "Diplomate", "Dirigeante"],
        localisation: "Alexandrie, Égypte",
        contact: { email: "cleopatra@ptolemaic.gov" },
        elevator_pitch: "Dernière souveraine de la dynastie ptolémaïque, ayant gouverné l'Égypte pendant 21 ans. Polyglotte maîtrisant 9 langues, je suis la première Ptolémée à avoir appris l'égyptien. Stratège politique exceptionnelle ayant maintenu l'indépendance égyptienne face à l'expansion romaine. Alliances avec Jules César et Marc Antoine démontrant une diplomatie de haut niveau."
    },
    experiences: [
        {
            id: "exp_pharaon",
            poste: "Pharaon d'Égypte",
            entreprise: "Royaume ptolémaïque d'Égypte",
            type_entreprise: "public",
            secteur: "Gouvernement / Monarchie",
            lieu: "Alexandrie, Égypte",
            type_contrat: "cdi",
            debut: "-51",
            fin: "-30",
            actuel: false,
            duree_mois: 252,
            realisations: [
                { id: "real_eco", description: "Redressement économique de l'Égypte avec réforme monétaire et fiscale", impact: "Prospérité retrouvée, financement d'une flotte de 200 navires", keywords_ats: ["économie", "réforme", "leadership"], sources: ["plutarque"] },
                { id: "real_diplo", description: "Négociations diplomatiques avec Rome maintenant l'indépendance égyptienne 20 ans de plus", impact: "Préservation de la souveraineté face à la superpuissance de l'époque", keywords_ats: ["diplomatie", "négociation", "stratégie"], sources: ["plutarque"] }
            ],
            technologies: [],
            outils: [],
            methodologies: ["Diplomatie directe", "Alliances stratégiques"],
            clients_references: ["Jules César", "Marc Antoine"],
            sources: ["plutarque"],
            last_updated: "2026-01-19",
            merge_count: 1
        }
    ],
    competences: {
        explicit: {
            techniques: [
                { nom: "Gouvernance", niveau: "expert", annees_experience: 21 },
                { nom: "Diplomatie internationale", niveau: "expert", annees_experience: 21 },
                { nom: "Économie et finances", niveau: "avance", annees_experience: 21 },
                { nom: "Stratégie militaire", niveau: "avance", annees_experience: 15 }
            ],
            soft_skills: ["Leadership charismatique", "Intelligence politique", "Multilinguisme (9 langues)", "Négociation", "Résilience", "Vision stratégique"],
            methodologies: []
        },
        inferred: { techniques: [], tools: [], soft_skills: [] },
        par_domaine: { "Politique": ["Gouvernance", "Diplomatie"], "Économie": ["Finance", "Commerce"] }
    },
    formations: [
        { id: "form_alexandrie", type: "formation", titre: "Éducation royale à la Bibliothèque d'Alexandrie", organisme: "Bibliothèque d'Alexandrie", lieu: "Alexandrie", annee: "-60", en_cours: false, details: "Éducation d'élite incluant philosophie, sciences, langues et arts", sources: ["plutarque"] }
    ],
    certifications: [],
    langues: [
        { langue: "Grec", niveau: "Natif", niveau_cecrl: "C2" },
        { langue: "Égyptien", niveau: "Courant", niveau_cecrl: "C2" },
        { langue: "Latin", niveau: "Courant", niveau_cecrl: "C1" },
        { langue: "Hébreu", niveau: "Courant", niveau_cecrl: "B2" },
        { langue: "Arabe", niveau: "Courant", niveau_cecrl: "B2" },
        { langue: "Éthiopien", niveau: "Intermédiaire", niveau_cecrl: "B1" }
    ],
    references: {
        clients: [{ nom: "Empire Romain", secteur: "Relations internationales", type: "grand_compte", annees: ["-48", "-30"], confidentiel: false }],
        projets_marquants: []
    },
    metadata: { version: "2.0.0", created_at: "2026-01-19T00:00:00Z", last_updated: "2026-01-19T00:00:00Z", last_merge_at: "2026-01-19T00:00:00Z", sources_count: 1, documents_sources: ["plutarque"], completeness_score: 85, merge_history: [] }
};

export const cleopatraProfile: DemoProfile = {
    meta: {
        id: "cleopatra",
        name: "Cléopâtre VII",
        shortName: "Cléopâtre",
        period: "69-30 av. J.-C.",
        icon: "👑",
        title: "Reine d'Égypte",
        nationality: "Égypte",
        quote: "Je ne serai pas exhibée lors d'un triomphe.",
        categories: ["politics", "business"]
    },
    rag: cleopatraRAG,
    completenessScore: 85,
    generationTimeMs: 734,
    cvs: [
        { templateId: "modern", templateName: "Standard", templateDescription: "Format professionnel", pdfUrl: "/demo-cvs/cleopatra-modern.pdf", previewUrl: "", recommended: false },
        { templateId: "classic", templateName: "Classique", templateDescription: "Design sobre", pdfUrl: "/demo-cvs/cleopatra-classic.pdf", previewUrl: "", recommended: true },
        { templateId: "creative", templateName: "Créatif", templateDescription: "Layout coloré", pdfUrl: "/demo-cvs/cleopatra-creative.pdf", previewUrl: "", recommended: false },
        { templateId: "tech", templateName: "ATS Optimisé", templateDescription: "Focus compétences", pdfUrl: "/demo-cvs/cleopatra-tech.pdf", previewUrl: "", recommended: false }
    ],
    jobs: [
        { rank: 1, title: "CEO - Multinationale", matchScore: 96, salaryMin: 500000, salaryMax: 2000000, currency: "EUR", contractType: "CDI", sectors: ["Direction générale"], location: "International", whyMatch: "21 ans à diriger un pays = leadership éprouvé.", keySkills: ["CEO", "Stratégie", "M&A"], jobDescription: "Direction d'un groupe international." },
        { rank: 2, title: "Ambassadrice - ONU", matchScore: 94, salaryMin: 120000, salaryMax: 180000, currency: "EUR", contractType: "CDI", sectors: ["Diplomatie"], location: "New York", whyMatch: "Maître diplomate + 9 langues.", keySkills: ["Diplomatie", "Négociation", "Langues"], jobDescription: "Représentation d'un État membre." },
        { rank: 3, title: "Directrice Générale - Banque Centrale", matchScore: 91, salaryMin: 200000, salaryMax: 350000, currency: "EUR", contractType: "CDI", sectors: ["Finance"], location: "Francfort", whyMatch: "Réforme monétaire réussie.", keySkills: ["Politique monétaire", "Économie"], jobDescription: "Direction d'une banque centrale." },
        { rank: 4, title: "Présidente - Commission Européenne", matchScore: 88, salaryMin: 300000, salaryMax: 400000, currency: "EUR", contractType: "CDD", sectors: ["Politique"], location: "Bruxelles", whyMatch: "Gestion d'alliances complexes.", keySkills: ["Leadership européen", "Diplomatie"], jobDescription: "Présidence de l'exécutif européen." },
        { rank: 5, title: "Partner - Cabinet de Lobbying", matchScore: 85, salaryMin: 250000, salaryMax: 500000, currency: "EUR", contractType: "CDI", sectors: ["Lobbying"], location: "Washington", whyMatch: "Influence + réseau + négociation.", keySkills: ["Lobbying", "Influence"], jobDescription: "Direction d'un cabinet de lobbying international." },
        { rank: 6, title: "Directrice du Patrimoine - Émirats", matchScore: 82, salaryMin: 180000, salaryMax: 280000, currency: "EUR", contractType: "CDI", sectors: ["Culture"], location: "Abu Dhabi", whyMatch: "Héritage Alexandrie + vision culturelle.", keySkills: ["Patrimoine", "Culture"], jobDescription: "Direction du patrimoine des Émirats." },
        { rank: 7, title: "Consultante M&A - Goldman Sachs", matchScore: 79, salaryMin: 200000, salaryMax: 350000, currency: "EUR", contractType: "CDI", sectors: ["Finance"], location: "Londres", whyMatch: "Alliances stratégiques = M&A.", keySkills: ["M&A", "Deal-making"], jobDescription: "Conseil en fusions-acquisitions." },
        { rank: 8, title: "Directrice Relations Internationales", matchScore: 76, salaryMin: 120000, salaryMax: 180000, currency: "EUR", contractType: "CDI", sectors: ["Corporate"], location: "Paris", whyMatch: "Réseau + multilinguisme.", keySkills: ["Relations internationales"], jobDescription: "Direction des relations internationales d'un groupe." },
        { rank: 9, title: "Présidente d'Université", matchScore: 73, salaryMin: 150000, salaryMax: 220000, currency: "EUR", contractType: "CDI", sectors: ["Éducation"], location: "Alexandrie", whyMatch: "Fondatrice de la grande bibliothèque.", keySkills: ["Direction académique"], jobDescription: "Présidence d'une grande université." },
        { rank: 10, title: "Auteure & Conférencière", matchScore: 70, salaryMin: 80000, salaryMax: 150000, currency: "EUR", contractType: "Freelance", sectors: ["Édition"], location: "International", whyMatch: "Histoire exceptionnelle à raconter.", keySkills: ["Écriture", "Conférences"], jobDescription: "Écriture et conférences sur le leadership." }
    ],
    coverLetters: [
        { jobRank: 1, jobTitle: "CEO - Multinationale", tone: "formal", wordCount: 350, content: `Madame, Monsieur le Conseil d'Administration,\n\nGérer une entreprise multinationale et gouverner un royaume millénaire face à la plus grande puissance de l'époque demandent les mêmes qualités : vision stratégique, résilience et capacité à fédérer.\n\nJ'ai dirigé l'Égypte pendant 21 ans, maintenant son indépendance face à Rome par une diplomatie habile et des alliances stratégiques. J'ai redressé une économie en crise et financé une marine de 200 navires.\n\n**Mes atouts :**\n• Leadership éprouvé sur 21 ans\n• Négociation au plus haut niveau (César, Marc Antoine)\n• Vision stratégique long terme\n• Multilinguisme (9 langues)\n\nJe suis prête à mettre cette expérience au service de votre entreprise.\n\nRespecteusement,\n\n**Cléopâtre VII Philopator**` },
        { jobRank: 2, jobTitle: "Ambassadrice - ONU", tone: "formal", wordCount: 300, content: `Excellence,\n\nLa diplomatie a été l'arme principale de mon règne. Face à Rome, j'ai su négocier, séduire et résister pour préserver l'indépendance de mon peuple.\n\n**Mes qualifications :**\n• Maîtrise de 9 langues\n• Expérience de négociation avec les plus grands dirigeants\n• Compréhension des équilibres géopolitiques\n• Représentation d'une civilisation millénaire\n\nL'ONU incarne les idéaux de dialogue entre les nations que j'ai pratiqués toute ma vie.\n\nAvec mes hommages respectueux,\n\n**Cléopâtre VII**` },
        { jobRank: 3, jobTitle: "DG Banque Centrale", tone: "formal", wordCount: 280, content: `Madame, Monsieur,\n\nMa réforme monétaire en Égypte a stabilisé une économie en crise et permis de financer l'indépendance de mon royaume.\n\n**Réalisations économiques :**\n• Réforme fiscale augmentant les revenus de 40%\n• Stabilisation de la monnaie ptolémaïque\n• Développement du commerce méditerranéen\n\nJe souhaite mettre cette expertise au service de la stabilité monétaire européenne.\n\nRespecteusement,\n\n**Cléopâtre VII**` }
    ]
};

export default cleopatraProfile;
