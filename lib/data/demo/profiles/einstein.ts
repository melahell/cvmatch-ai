/**
 * Profil Démo : Albert Einstein
 * 
 * Physicien théoricien, Prix Nobel, père de la relativité.
 * 1879-1955
 */

import { DemoProfile } from "../types";
import { RAGComplete } from "@/types/rag-complete";

const einsteinRAG: RAGComplete = {
    profil: {
        nom: "Einstein",
        prenom: "Albert",
        titre_principal: "Physicien Théoricien - Prix Nobel",
        titres_alternatifs: ["Père de la Relativité", "Professeur de Physique"],
        localisation: "Princeton, USA",
        contact: { email: "albert@einstein.science" },
        elevator_pitch: "Physicien théoricien ayant révolutionné notre compréhension de l'univers avec la théorie de la relativité restreinte et générale. Prix Nobel de Physique 1921 pour l'effet photoélectrique. Auteur de E=mc², l'équation la plus célèbre de l'histoire. Capacité à remettre en question les paradigmes établis et à visualiser des concepts abstraits d'une complexité extraordinaire."
    },
    experiences: [
        {
            id: "exp_princeton",
            poste: "Professeur de Physique Théorique",
            entreprise: "Institute for Advanced Study",
            type_entreprise: "public",
            secteur: "Recherche Académique",
            lieu: "Princeton, USA",
            type_contrat: "cdi",
            debut: "1933-10",
            fin: "1955-04",
            actuel: false,
            duree_mois: 259,
            realisations: [
                { id: "real_unified", description: "Recherche sur la théorie du champ unifié tentant d'unifier gravitation et électromagnétisme", impact: "Travaux fondateurs pour la physique moderne", keywords_ats: ["physique théorique", "recherche fondamentale"], sources: ["ias_archives"] }
            ],
            technologies: [],
            outils: [],
            methodologies: ["Expériences de pensée", "Formalisme mathématique"],
            clients_references: [],
            sources: ["ias_archives"],
            last_updated: "2026-01-19",
            merge_count: 1
        },
        {
            id: "exp_brevet",
            poste: "Expert Technique - Office des Brevets",
            entreprise: "Office Fédéral des Brevets",
            type_entreprise: "public",
            secteur: "Propriété Intellectuelle",
            lieu: "Berne, Suisse",
            type_contrat: "cdi",
            debut: "1902-06",
            fin: "1909-10",
            actuel: false,
            duree_mois: 89,
            contexte: "Évaluation de brevets tout en développant ses théories révolutionnaires.",
            realisations: [
                { id: "real_annus", description: "Publication de 4 articles révolutionnaires en 1905 (Annus Mirabilis)", impact: "Relativité restreinte, effet photoélectrique, mouvement brownien, E=mc²", keywords_ats: ["publications", "innovation", "physique"], sources: ["nobel_archives"] }
            ],
            technologies: [],
            outils: [],
            methodologies: [],
            clients_references: [],
            sources: ["nobel_archives"],
            last_updated: "2026-01-19",
            merge_count: 1
        }
    ],
    competences: {
        explicit: {
            techniques: [
                { nom: "Physique théorique", niveau: "expert", annees_experience: 50 },
                { nom: "Mathématiques avancées", niveau: "expert", annees_experience: 50 },
                { nom: "Analyse de brevets", niveau: "avance", annees_experience: 7 }
            ],
            soft_skills: ["Pensée abstraite", "Imagination", "Persévérance", "Indépendance intellectuelle", "Humilité", "Humour"],
            methodologies: ["Expériences de pensée", "Gedankenexperiment"]
        },
        inferred: { techniques: [], tools: [], soft_skills: [] },
        par_domaine: { "Physique": ["Relativité", "Mécanique quantique", "Thermodynamique"] }
    },
    formations: [
        { id: "form_eth", type: "diplome", titre: "Diplôme d'enseignement en Physique et Mathématiques", organisme: "ETH Zurich", lieu: "Zurich", annee: "1900", en_cours: false, sources: ["eth_archives"] }
    ],
    certifications: [],
    langues: [
        { langue: "Allemand", niveau: "Natif", niveau_cecrl: "C2" },
        { langue: "Anglais", niveau: "Courant", niveau_cecrl: "C1" },
        { langue: "Français", niveau: "Intermédiaire", niveau_cecrl: "B1" }
    ],
    references: {
        clients: [{ nom: "Comité Nobel", secteur: "Prix", type: "international", annees: ["1921"], confidentiel: false }],
        projets_marquants: [{ id: "proj_relativity", nom: "Théorie de la Relativité Générale", description: "Nouvelle théorie de la gravitation remplaçant Newton", annee: "1915", technologies: [], resultats: "Révolution de notre compréhension de l'espace-temps", sources: ["publications"] }]
    },
    metadata: { version: "2.0.0", created_at: "2026-01-19T00:00:00Z", last_updated: "2026-01-19T00:00:00Z", last_merge_at: "2026-01-19T00:00:00Z", sources_count: 3, documents_sources: ["ias_archives", "nobel_archives", "eth_archives"], completeness_score: 91, merge_history: [] }
};

export const einsteinProfile: DemoProfile = {
    meta: {
        id: "einstein",
        name: "Albert Einstein",
        shortName: "Einstein",
        period: "1879-1955",
        icon: "🧠",
        title: "Physicien Théoricien",
        nationality: "Allemagne / USA",
        quote: "L'imagination est plus importante que le savoir.",
        categories: ["science"]
    },
    rag: einsteinRAG,
    completenessScore: 91,
    generationTimeMs: 867,
    cvs: [
        { templateId: "modern", templateName: "Standard", templateDescription: "Format professionnel", pdfUrl: "/demo-cvs/einstein-modern.pdf", previewUrl: "", recommended: true },
        { templateId: "classic", templateName: "Classique", templateDescription: "Design sobre", pdfUrl: "/demo-cvs/einstein-classic.pdf", previewUrl: "", recommended: false },
        { templateId: "creative", templateName: "Créatif", templateDescription: "Layout coloré", pdfUrl: "/demo-cvs/einstein-creative.pdf", previewUrl: "", recommended: false },
        { templateId: "tech", templateName: "ATS Optimisé", templateDescription: "Focus compétences", pdfUrl: "/demo-cvs/einstein-tech.pdf", previewUrl: "", recommended: true }
    ],
    jobs: [
        { rank: 1, title: "Chief Scientist - CERN", matchScore: 98, salaryMin: 150000, salaryMax: 220000, currency: "EUR", contractType: "CDI", sectors: ["Recherche", "Physique"], location: "Genève", whyMatch: "Expertise physique fondamentale + vision.", keySkills: ["Physique des particules", "Direction recherche"], jobDescription: "Direction scientifique du plus grand laboratoire de physique." },
        { rank: 2, title: "Professeur de Physique Théorique - MIT", matchScore: 96, salaryMin: 180000, salaryMax: 250000, currency: "EUR", contractType: "CDI", sectors: ["Académique"], location: "Cambridge, MA", whyMatch: "Excellence académique + pédagogie.", keySkills: ["Enseignement", "Recherche", "Mentorat"], jobDescription: "Chaire de physique théorique au MIT." },
        { rank: 3, title: "Conseiller Scientifique - SpaceX", matchScore: 93, salaryMin: 200000, salaryMax: 300000, currency: "EUR", contractType: "Freelance", sectors: ["Spatial"], location: "Los Angeles", whyMatch: "Relativité = GPS + navigation spatiale.", keySkills: ["Relativité", "Conseil stratégique"], jobDescription: "Conseil sur la physique de la navigation spatiale." },
        { rank: 4, title: "Fellow - Google X", matchScore: 90, salaryMin: 250000, salaryMax: 400000, currency: "EUR", contractType: "CDI", sectors: ["Tech", "Moonshots"], location: "Mountain View", whyMatch: "Pensée disruptive + vision long terme.", keySkills: ["Innovation radicale", "Vision"], jobDescription: "Recherche sur projets moonshot." },
        { rank: 5, title: "Directeur R&D - ITER", matchScore: 87, salaryMin: 140000, salaryMax: 200000, currency: "EUR", contractType: "CDI", sectors: ["Énergie", "Fusion"], location: "Cadarache", whyMatch: "E=mc² + expertise nucléaire.", keySkills: ["Fusion nucléaire", "Direction R&D"], jobDescription: "Direction de la recherche sur la fusion." },
        { rank: 6, title: "Expert IA Quantique - IBM", matchScore: 84, salaryMin: 160000, salaryMax: 230000, currency: "EUR", contractType: "CDI", sectors: ["Quantum"], location: "Zurich", whyMatch: "Père de la physique quantique.", keySkills: ["Quantum computing", "Théorie"], jobDescription: "Recherche en informatique quantique." },
        { rank: 7, title: "Vulgarisateur Scientifique - Netflix", matchScore: 81, salaryMin: 100000, salaryMax: 150000, currency: "EUR", contractType: "Freelance", sectors: ["Média"], location: "Los Angeles", whyMatch: "Charisme + capacité vulgarisation.", keySkills: ["Communication", "Pédagogie"], jobDescription: "Présentation de documentaires scientifiques." },
        { rank: 8, title: "Conseiller Éthique IA - ONU", matchScore: 78, salaryMin: 90000, salaryMax: 130000, currency: "EUR", contractType: "CDD", sectors: ["International"], location: "New York", whyMatch: "Engagement pacifiste + vision éthique.", keySkills: ["Éthique", "Conseil"], jobDescription: "Conseil sur l'éthique de l'IA." },
        { rank: 9, title: "Auteur Scientifique", matchScore: 75, salaryMin: 60000, salaryMax: 100000, currency: "EUR", contractType: "Freelance", sectors: ["Édition"], location: "Remote", whyMatch: "Clarté d'expression + notoriété.", keySkills: ["Écriture", "Vulgarisation"], jobDescription: "Rédaction d'ouvrages de vulgarisation." },
        { rank: 10, title: "Mentor Startup DeepTech", matchScore: 72, salaryMin: 50000, salaryMax: 80000, currency: "EUR", contractType: "Freelance", sectors: ["Startup"], location: "Remote", whyMatch: "Expérience + sagesse.", keySkills: ["Mentorat", "Innovation"], jobDescription: "Accompagnement de startups scientifiques." }
    ],
    coverLetters: [
        { jobRank: 1, jobTitle: "Chief Scientist - CERN", tone: "formal", wordCount: 340, content: `Madame, Monsieur,\n\nLe CERN représente l'aboutissement de ce que la science peut accomplir lorsque les nations collaborent.\n\nMa vie a été consacrée à comprendre les lois fondamentales de l'univers. La théorie de la relativité et mes travaux sur le photon ont ouvert des portes que le CERN continue d'explorer aujourd'hui avec le LHC.\n\n**Mes atouts :**\n• Expertise inégalée en physique théorique\n• Capacité à poser les bonnes questions\n• Vision stratégique long terme\n• Réseau international de physiciens\n\nJe souhaite contribuer aux prochaines découvertes du CERN.\n\nRespecteusement,\n\n**Albert Einstein**` },
        { jobRank: 2, jobTitle: "Professeur MIT", tone: "professional_warm", wordCount: 290, content: `Cher Comité de recrutement,\n\nEnseigner a toujours été pour moi une joie et un devoir. Au MIT, je pourrais former la prochaine génération de physiciens qui changera notre compréhension de l'univers.\n\n**Ma philosophie pédagogique :**\n• L'imagination avant le calcul\n• Questions naïves bienvenues\n• Apprendre en se trompant\n\nJe serais honoré de rejoindre cette institution.\n\nCordialement,\n\n**Albert Einstein**` },
        { jobRank: 3, jobTitle: "Conseiller SpaceX", tone: "professional_warm", wordCount: 260, content: `Dear SpaceX Team,\n\nWithout relativity, your GPS wouldn't work and your rockets couldn't navigate precisely.\n\nI am fascinated by what you are building. The dream of making humanity interplanetary requires exactly the kind of thinking I've dedicated my life to: imagining the impossible, then making it real.\n\n**What I offer:**\n• Deep understanding of relativistic effects on navigation\n• Ability to simplify complex physics\n• Fresh perspective on "impossible" problems\n\nLet's explore the cosmos together.\n\n**Albert**` }
    ]
};

export default einsteinProfile;
