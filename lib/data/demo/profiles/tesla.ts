/**
 * Profil Démo : Nikola Tesla
 * 
 * Inventeur et ingénieur électricien serbo-américain.
 * 1856-1943
 */

import { DemoProfile } from "../types";
import { RAGComplete } from "@/types/rag-complete";

const teslaRAG: RAGComplete = {
    profil: {
        nom: "Tesla",
        prenom: "Nikola",
        titre_principal: "Inventeur & Ingénieur Électricien Visionnaire",
        titres_alternatifs: ["Père du courant alternatif", "Pionnier de la radio"],
        localisation: "New York, USA",
        contact: { email: "nikola@tesla.tech", github: "github.com/nikola-tesla" },
        elevator_pitch: "Inventeur prolifique détenant plus de 300 brevets. Créateur du système de courant alternatif qui alimente le monde moderne. Pionnier de la transmission sans fil, de la radio et des technologies de l'énergie. Vision futuriste ayant anticipé les smartphones, le WiFi et l'énergie libre avec des décennies d'avance."
    },
    experiences: [
        {
            id: "exp_westinghouse",
            poste: "Consultant Ingénieur Principal",
            entreprise: "Westinghouse Electric",
            type_entreprise: "prive",
            secteur: "Énergie / Électricité",
            lieu: "Pittsburgh, USA",
            type_contrat: "freelance",
            debut: "1888-01",
            fin: "1895-12",
            actuel: false,
            duree_mois: 96,
            realisations: [
                { id: "real_ac", description: "Développement du système de courant alternatif polyphasé adopté mondialement", impact: "Électrification du monde moderne - 90% de l'électricité mondiale en AC", keywords_ats: ["courant alternatif", "électrification", "innovation"], sources: ["brevets_tesla"] },
                { id: "real_niagara", description: "Conception des générateurs de la centrale hydroélectrique de Niagara Falls", impact: "Première centrale AC majeure, modèle pour toutes les suivantes", keywords_ats: ["hydroélectricité", "ingénierie", "énergie renouvelable"], sources: ["brevets_tesla"] }
            ],
            technologies: ["Courant alternatif", "Moteurs à induction", "Transformateurs"],
            outils: [],
            methodologies: ["Visualisation mentale", "Prototypage"],
            clients_references: ["Westinghouse", "General Electric"],
            sources: ["brevets_tesla"],
            last_updated: "2026-01-19",
            merge_count: 1
        },
        {
            id: "exp_lab",
            poste: "Fondateur & Inventeur Principal",
            entreprise: "Tesla Laboratory",
            type_entreprise: "startup",
            secteur: "R&D / Invention",
            lieu: "New York / Colorado Springs",
            type_contrat: "freelance",
            debut: "1895-01",
            fin: "1943-01",
            actuel: false,
            duree_mois: 576,
            realisations: [
                { id: "real_radio", description: "Invention de la radio (brevet antérieur à Marconi, reconnu en 1943)", impact: "Fondation des télécommunications modernes", keywords_ats: ["radio", "télécommunications", "brevet"], sources: ["brevets_tesla"] },
                { id: "real_wireless", description: "Expériences de transmission d'énergie sans fil à Wardenclyffe", impact: "Précurseur du WiFi et de la recharge sans fil", keywords_ats: ["sans fil", "énergie", "innovation"], sources: ["brevets_tesla"] }
            ],
            technologies: ["Haute fréquence", "Transmission sans fil"],
            outils: [],
            methodologies: [],
            clients_references: [],
            sources: ["brevets_tesla"],
            last_updated: "2026-01-19",
            merge_count: 1
        }
    ],
    competences: {
        explicit: {
            techniques: [
                { nom: "Génie électrique", niveau: "expert", annees_experience: 55 },
                { nom: "Invention et brevets", niveau: "expert", annees_experience: 55 },
                { nom: "Électromagnétisme", niveau: "expert", annees_experience: 50 },
                { nom: "Haute fréquence", niveau: "expert", annees_experience: 40 }
            ],
            soft_skills: ["Vision futuriste", "Mémoire photographique", "Concentration extrême", "Indépendance", "Perfectionnisme"],
            methodologies: ["Visualisation mentale complète avant prototypage"]
        },
        inferred: { techniques: [], tools: [], soft_skills: [] },
        par_domaine: { "Électricité": ["AC", "Moteurs", "Transformateurs"], "Télécommunications": ["Radio", "Sans fil"] }
    },
    formations: [
        { id: "form_graz", type: "diplome", titre: "Génie électrique", organisme: "Université technique de Graz", lieu: "Graz, Autriche", annee: "1875-1878", en_cours: false, sources: ["biographie"] }
    ],
    certifications: [],
    langues: [
        { langue: "Serbe", niveau: "Natif", niveau_cecrl: "C2" },
        { langue: "Anglais", niveau: "Courant", niveau_cecrl: "C2" },
        { langue: "Allemand", niveau: "Courant", niveau_cecrl: "C1" },
        { langue: "Français", niveau: "Intermédiaire", niveau_cecrl: "B1" }
    ],
    references: {
        clients: [{ nom: "Westinghouse Electric", secteur: "Énergie", type: "grand_compte", annees: ["1888", "1895"], confidentiel: false }],
        projets_marquants: [{ id: "proj_niagara", nom: "Centrale de Niagara Falls", description: "Première centrale hydroélectrique à courant alternatif majeure", annee: "1895", technologies: ["AC polyphasé"], resultats: "Alimentation de New York, modèle mondial", sources: ["archives_westinghouse"] }]
    },
    metadata: { version: "2.0.0", created_at: "2026-01-19T00:00:00Z", last_updated: "2026-01-19T00:00:00Z", last_merge_at: "2026-01-19T00:00:00Z", sources_count: 2, documents_sources: ["brevets_tesla", "biographie"], completeness_score: 93, merge_history: [] }
};

export const teslaProfile: DemoProfile = {
    meta: {
        id: "tesla",
        name: "Nikola Tesla",
        shortName: "Tesla",
        period: "1856-1943",
        icon: "⚡",
        title: "Inventeur & Ingénieur",
        nationality: "Serbie / USA",
        quote: "Le présent est à eux, mais le futur, pour lequel j'ai vraiment travaillé, est à moi.",
        categories: ["tech", "science"]
    },
    rag: teslaRAG,
    completenessScore: 93,
    generationTimeMs: 845,
    cvs: [
        { templateId: "modern", templateName: "Standard", templateDescription: "Format professionnel", pdfUrl: "/demo-cvs/tesla-modern.pdf", previewUrl: "", recommended: false },
        { templateId: "classic", templateName: "Classique", templateDescription: "Design sobre", pdfUrl: "/demo-cvs/tesla-classic.pdf", previewUrl: "", recommended: false },
        { templateId: "creative", templateName: "Créatif", templateDescription: "Layout coloré", pdfUrl: "/demo-cvs/tesla-creative.pdf", previewUrl: "", recommended: false },
        { templateId: "tech", templateName: "ATS Optimisé", templateDescription: "Focus compétences tech", pdfUrl: "/demo-cvs/tesla-tech.pdf", previewUrl: "", recommended: true }
    ],
    jobs: [
        { rank: 1, title: "VP Engineering - Tesla Inc.", matchScore: 99, salaryMin: 300000, salaryMax: 500000, currency: "EUR", contractType: "CDI", sectors: ["EV", "Énergie"], location: "Austin", whyMatch: "L'entreprise porte mon nom... et mes idées.", keySkills: ["Ingénierie électrique", "Innovation"], jobDescription: "Direction de l'ingénierie chez Tesla Inc." },
        { rank: 2, title: "CTO - Startup Énergie", matchScore: 96, salaryMin: 180000, salaryMax: 280000, currency: "EUR", contractType: "CDI", sectors: ["CleanTech"], location: "San Francisco", whyMatch: "300 brevets + vision énergie propre.", keySkills: ["CTO", "Énergie", "Innovation"], jobDescription: "Direction technique d'une startup cleantech." },
        { rank: 3, title: "Principal Engineer - SpaceX", matchScore: 93, salaryMin: 200000, salaryMax: 350000, currency: "EUR", contractType: "CDI", sectors: ["Spatial"], location: "Los Angeles", whyMatch: "Électrification + haute fréquence = propulsion.", keySkills: ["Propulsion électrique", "Ingénierie"], jobDescription: "Ingénierie de systèmes de propulsion." },
        { rank: 4, title: "Directeur Innovation - EDF", matchScore: 90, salaryMin: 120000, salaryMax: 180000, currency: "EUR", contractType: "CDI", sectors: ["Énergie"], location: "Paris", whyMatch: "Père du réseau électrique moderne.", keySkills: ["Réseau électrique", "Innovation"], jobDescription: "Direction de l'innovation énergétique." },
        { rank: 5, title: "Fellow - MIT Media Lab", matchScore: 87, salaryMin: 150000, salaryMax: 220000, currency: "EUR", contractType: "CDI", sectors: ["Recherche"], location: "Cambridge", whyMatch: "Vision futuriste + prototypage.", keySkills: ["Recherche", "Prototypage"], jobDescription: "Recherche en technologies émergentes." },
        { rank: 6, title: "Inventeur en Résidence - Google X", matchScore: 84, salaryMin: 250000, salaryMax: 400000, currency: "EUR", contractType: "CDI", sectors: ["Moonshots"], location: "Mountain View", whyMatch: "Inventeur + visionnaire = moonshots.", keySkills: ["Invention", "Vision"], jobDescription: "Création de projets moonshot." },
        { rank: 7, title: "Conseiller Technique - Commission UE", matchScore: 81, salaryMin: 100000, salaryMax: 150000, currency: "EUR", contractType: "CDD", sectors: ["Politique"], location: "Bruxelles", whyMatch: "Expertise réseau électrique européen.", keySkills: ["Conseil", "Énergie"], jobDescription: "Conseil sur la politique énergétique européenne." },
        { rank: 8, title: "Lead Engineer - Charge Sans Fil", matchScore: 78, salaryMin: 120000, salaryMax: 180000, currency: "EUR", contractType: "CDI", sectors: ["Tech"], location: "Cupertino", whyMatch: "Pionnier de l'énergie sans fil.", keySkills: ["Wireless power", "R&D"], jobDescription: "R&D en technologies de recharge sans fil." },
        { rank: 9, title: "Auteur Technique & Formateur", matchScore: 75, salaryMin: 80000, salaryMax: 120000, currency: "EUR", contractType: "Freelance", sectors: ["Formation"], location: "Remote", whyMatch: "Expertise + pédagogie.", keySkills: ["Formation", "Écriture technique"], jobDescription: "Formation en génie électrique." },
        { rank: 10, title: "Consultant Brevets", matchScore: 72, salaryMin: 150000, salaryMax: 220000, currency: "EUR", contractType: "Freelance", sectors: ["PI"], location: "New York", whyMatch: "300+ brevets = expertise unique.", keySkills: ["Brevets", "Innovation"], jobDescription: "Conseil en propriété intellectuelle." }
    ],
    coverLetters: [
        { jobRank: 1, jobTitle: "VP Engineering - Tesla Inc.", tone: "professional_warm", wordCount: 340, content: `Dear Elon and the Tesla Team,\n\nIt would be poetic to work for the company that carries my name and my legacy.\n\nMy entire career has been dedicated to making electricity accessible and transforming how humanity uses energy. The Tesla Model S carries the vision I had over a century ago: clean, efficient, electric power for all.\n\n**What I bring:**\n• 300+ patents in electrical engineering\n• Creator of the AC system that powers your Superchargers\n• Visionary thinking that anticipated wireless charging and autonomous systems\n• Ability to see complete systems in my mind before building\n\nI would be honored to contribute to Tesla's mission.\n\nWith electric regards,\n\n**Nikola Tesla**` },
        { jobRank: 2, jobTitle: "CTO - Startup Énergie", tone: "professional_warm", wordCount: 290, content: `Dear Founders,\n\nClean energy was my life's mission. Wardenclyffe was meant to provide free wireless energy to the world. Your startup can achieve what I could not.\n\n**My assets:**\n• Inventor of the AC grid\n• Pioneer in wireless power transmission\n• 300+ patents ready to inspire\n• Ability to envision complete systems\n\nLet's power the future together.\n\n**Nikola Tesla**` },
        { jobRank: 3, jobTitle: "Principal Engineer - SpaceX", tone: "creative", wordCount: 270, content: `Hello SpaceX,\n\nI dreamed of sending energy through the sky. You send rockets.\n\nMy expertise in high-frequency electricity and electromagnetic propulsion could help optimize your systems. I've always thought in terms of efficiency and elegance - qualities your Falcon rockets embody.\n\n**What I offer:**\n• Electrical systems optimization\n• Innovative propulsion concepts\n• A mind that sees solutions others miss\n\nTo the stars!\n\n**Nikola**` }
    ]
};

export default teslaProfile;
