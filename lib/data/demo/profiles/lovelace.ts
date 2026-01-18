/**
 * Profil Démo : Ada Lovelace
 * 
 * Mathématicienne britannique, première programmeuse de l'histoire.
 * 1815-1852
 */

import { DemoProfile } from "../types";
import { RAGComplete } from "@/types/rag-complete";

const lovelaceRAG: RAGComplete = {
    profil: {
        nom: "Lovelace",
        prenom: "Ada",
        titre_principal: "Mathématicienne & Pionnière de l'Informatique",
        titres_alternatifs: [
            "Première Programmeuse",
            "Analyste Algorithmique",
            "Visionnaire Technologique"
        ],
        localisation: "Londres, Royaume-Uni",
        contact: {
            email: "ada@lovelace.dev",
            github: "github.com/ada-lovelace",
            linkedin: "linkedin.com/in/ada-lovelace"
        },
        elevator_pitch: "Mathématicienne visionnaire ayant créé le premier algorithme destiné à être exécuté par une machine. Collaboration étroite avec Charles Babbage sur la Machine Analytique, ancêtre conceptuel de l'ordinateur moderne. Capacité unique à percevoir le potentiel des machines au-delà du simple calcul, anticipant la musique générée par ordinateur et l'intelligence artificielle avec plus d'un siècle d'avance."
    },
    experiences: [
        {
            id: "exp_babbage",
            poste: "Analyste & Programmeuse - Machine Analytique",
            entreprise: "Collaboration avec Charles Babbage",
            type_entreprise: "startup",
            secteur: "Innovation Technologique",
            lieu: "Londres, UK",
            type_contrat: "freelance",
            debut: "1842-01",
            fin: "1852-11",
            actuel: false,
            duree_mois: 131,
            contexte: "Traduction et annotation de l'article de Luigi Menabrea sur la Machine Analytique de Babbage.",
            realisations: [
                {
                    id: "real_algo",
                    description: "Création du premier algorithme informatique : calcul des nombres de Bernoulli",
                    impact: "Reconnu comme le premier programme informatique de l'histoire",
                    keywords_ats: ["algorithmique", "programmation", "innovation"],
                    sources: ["archives_royalsociety"]
                },
                {
                    id: "real_notes",
                    description: "Rédaction des 'Notes' (3x plus longues que l'article original) détaillant le potentiel des machines calculantes",
                    impact: "Vision prophétique : machines capables de composer de la musique et traiter des symboles",
                    keywords_ats: ["documentation technique", "vision produit", "innovation"],
                    sources: ["archives_royalsociety"]
                }
            ],
            technologies: ["Logique mathématique", "Calcul différentiel"],
            outils: ["Cartes perforées conceptuelles"],
            methodologies: ["Analyse algorithmique", "Documentation exhaustive"],
            clients_references: ["Royal Society", "Charles Babbage"],
            sources: ["archives_royalsociety"],
            last_updated: "2026-01-19",
            merge_count: 1
        }
    ],
    competences: {
        explicit: {
            techniques: [
                { nom: "Algorithmique", niveau: "expert", annees_experience: 15 },
                { nom: "Mathématiques", niveau: "expert", annees_experience: 20 },
                { nom: "Logique formelle", niveau: "avance", annees_experience: 15 },
                { nom: "Analyse de systèmes", niveau: "expert", annees_experience: 10 },
                { nom: "Documentation technique", niveau: "expert", annees_experience: 10 }
            ],
            soft_skills: [
                "Vision long terme",
                "Pensée abstraite",
                "Communication technique",
                "Créativité",
                "Collaboration"
            ],
            methodologies: ["Approche analytique", "Pensée systémique"]
        },
        inferred: { techniques: [], tools: [], soft_skills: [] },
        par_domaine: {
            "Informatique": ["Algorithmique", "Programmation", "Architecture"],
            "Mathématiques": ["Calcul", "Logique", "Analyse"]
        }
    },
    formations: [
        {
            id: "form_maths",
            type: "formation",
            titre: "Formation intensive en mathématiques",
            organisme: "Tuteurs privés (Augustus De Morgan)",
            lieu: "Londres",
            annee: "1833-1840",
            en_cours: false,
            details: "Formation d'élite incluant calcul différentiel et géométrie avancée",
            sources: ["archives_familiales"]
        }
    ],
    certifications: [],
    langues: [
        { langue: "Anglais", niveau: "Natif", niveau_cecrl: "C2" },
        { langue: "Français", niveau: "Courant", niveau_cecrl: "C1" },
        { langue: "Italien", niveau: "Intermédiaire", niveau_cecrl: "B1" }
    ],
    references: {
        clients: [
            { nom: "Charles Babbage", secteur: "Invention", type: "startup", annees: ["1833", "1852"], confidentiel: false },
            { nom: "Royal Society", secteur: "Science", type: "public", annees: ["1843"], confidentiel: false }
        ],
        projets_marquants: []
    },
    metadata: {
        version: "2.0.0",
        created_at: "2026-01-19T00:00:00Z",
        last_updated: "2026-01-19T00:00:00Z",
        last_merge_at: "2026-01-19T00:00:00Z",
        sources_count: 2,
        documents_sources: ["archives_royalsociety", "archives_familiales"],
        completeness_score: 88,
        merge_history: []
    }
};

export const lovelaceProfile: DemoProfile = {
    meta: {
        id: "lovelace",
        name: "Ada Lovelace",
        shortName: "Ada Lovelace",
        period: "1815-1852",
        icon: "💻",
        title: "Première Programmeuse",
        nationality: "Britannique",
        quote: "La Machine Analytique n'a pas la prétention de créer quoi que ce soit. Elle peut faire tout ce que nous savons lui ordonner de faire.",
        categories: ["tech", "science"]
    },
    rag: lovelaceRAG,
    completenessScore: 88,
    generationTimeMs: 756,
    cvs: [
        { templateId: "modern", templateName: "Standard", templateDescription: "Format professionnel", pdfUrl: "/demo-cvs/lovelace-modern.pdf", previewUrl: "/demo-cvs/previews/lovelace-modern.png", recommended: false },
        { templateId: "classic", templateName: "Classique", templateDescription: "Design sobre", pdfUrl: "/demo-cvs/lovelace-classic.pdf", previewUrl: "/demo-cvs/previews/lovelace-classic.png", recommended: false },
        { templateId: "creative", templateName: "Créatif", templateDescription: "Layout coloré", pdfUrl: "/demo-cvs/lovelace-creative.pdf", previewUrl: "/demo-cvs/previews/lovelace-creative.png", recommended: false },
        { templateId: "tech", templateName: "ATS Optimisé", templateDescription: "Focus compétences tech", pdfUrl: "/demo-cvs/lovelace-tech.pdf", previewUrl: "/demo-cvs/previews/lovelace-tech.png", recommended: true }
    ],
    jobs: [
        { rank: 1, title: "Principal Software Engineer", company: "Google DeepMind", matchScore: 95, salaryMin: 150000, salaryMax: 250000, currency: "EUR", contractType: "CDI", sectors: ["IA", "Tech"], location: "Londres", whyMatch: "Pionnière de l'algorithmique + vision IA avant l'heure.", keySkills: ["Algorithmique", "IA", "Vision produit"], jobDescription: "Développement d'algorithmes d'apprentissage automatique." },
        { rank: 2, title: "CTO - Startup IA", matchScore: 93, salaryMin: 120000, salaryMax: 180000, currency: "EUR", contractType: "CDI", sectors: ["Startup", "IA"], location: "Londres", whyMatch: "Vision technologique + capacité à conceptualiser l'impossible.", keySkills: ["Leadership tech", "Architecture", "Innovation"], jobDescription: "Direction technique d'une startup en intelligence artificielle." },
        { rank: 3, title: "Staff Algorithm Engineer", company: "Spotify", matchScore: 91, salaryMin: 130000, salaryMax: 200000, currency: "EUR", contractType: "CDI", sectors: ["Tech", "Musique"], location: "Stockholm", whyMatch: "Vision prophétique : machines composant de la musique.", keySkills: ["Algorithmes musicaux", "ML", "Recommandation"], jobDescription: "Conception d'algorithmes de recommandation musicale." },
        { rank: 4, title: "Distinguished Engineer", company: "Microsoft Research", matchScore: 89, salaryMin: 180000, salaryMax: 280000, currency: "EUR", contractType: "CDI", sectors: ["Recherche", "Tech"], location: "Cambridge", whyMatch: "Excellence technique + pensée fondamentale.", keySkills: ["Recherche", "Publication", "Mentorat"], jobDescription: "Recherche fondamentale en informatique théorique." },
        { rank: 5, title: "VP Engineering", matchScore: 87, salaryMin: 200000, salaryMax: 300000, currency: "EUR", contractType: "CDI", sectors: ["Scale-up"], location: "Londres", whyMatch: "Vision système + documentation exemplaire.", keySkills: ["Management", "Architecture", "Scaling"], jobDescription: "Direction des équipes d'ingénierie d'une scale-up." },
        { rank: 6, title: "Technical Writer Lead", company: "Stripe", matchScore: 84, salaryMin: 90000, salaryMax: 140000, currency: "EUR", contractType: "CDI", sectors: ["Fintech", "Documentation"], location: "Dublin", whyMatch: "Notes d'Ada = documentation technique exemplaire.", keySkills: ["Documentation", "API", "Clarté"], jobDescription: "Direction de la documentation technique produit." },
        { rank: 7, title: "Quantum Computing Researcher", company: "IBM", matchScore: 82, salaryMin: 120000, salaryMax: 180000, currency: "EUR", contractType: "CDI", sectors: ["Quantum", "Recherche"], location: "Zurich", whyMatch: "Pensée abstraite + mathématiques avancées.", keySkills: ["Quantum", "Mathématiques", "Recherche"], jobDescription: "Recherche en algorithmes quantiques." },
        { rank: 8, title: "Developer Advocate", company: "GitHub", matchScore: 79, salaryMin: 100000, salaryMax: 150000, currency: "EUR", contractType: "CDI", sectors: ["DevRel", "Open Source"], location: "Remote", whyMatch: "Communication technique + passion pour l'éducation.", keySkills: ["Communication", "Code", "Community"], jobDescription: "Évangélisation et support de la communauté développeur." },
        { rank: 9, title: "Professeure d'Informatique", matchScore: 77, salaryMin: 70000, salaryMax: 100000, currency: "EUR", contractType: "CDI", sectors: ["Éducation"], location: "Oxford", whyMatch: "Pédagogie + expertise fondamentale.", keySkills: ["Enseignement", "Recherche"], jobDescription: "Enseignement de l'informatique théorique." },
        { rank: 10, title: "Consultante Tech & Innovation", matchScore: 74, salaryMin: 800, salaryMax: 1500, currency: "EUR", contractType: "Freelance", sectors: ["Conseil"], location: "Remote", remotePolicy: "Full remote", whyMatch: "Vision + capacité d'analyse systémique.", keySkills: ["Conseil", "Stratégie tech"], jobDescription: "Conseil en stratégie technologique." }
    ],
    coverLetters: [
        { jobRank: 1, jobTitle: "Principal Software Engineer - Google DeepMind", tone: "professional_warm", wordCount: 340, content: `Dear Hiring Manager,\n\nI am writing to express my interest in the Principal Software Engineer position at Google DeepMind.\n\nAs the creator of what is recognized as the first computer algorithm, I bring a unique perspective on computational thinking and machine capabilities. My work on the Analytical Engine demonstrated not only technical proficiency but also a vision for what machines could achieve beyond mere calculation.\n\n**Key qualifications:**\n\n• **Algorithmic thinking**: Designed the first published algorithm, establishing principles still used today\n• **Technical documentation**: My "Notes" remain a model of technical writing, explaining complex concepts clearly\n• **Visionary perspective**: Anticipated machines' potential for music composition and symbolic manipulation\n\nI am particularly drawn to DeepMind's mission to solve intelligence. My own work was driven by the same fundamental questions about the nature of computation and its limits.\n\nI would welcome the opportunity to contribute to your groundbreaking research.\n\nBest regards,\n\n**Ada Lovelace**` },
        { jobRank: 2, jobTitle: "CTO - Startup IA", tone: "professional_warm", wordCount: 290, content: `Dear Founders,\n\nThe opportunity to serve as CTO of an AI startup resonates deeply with my life's work.\n\nI have spent my career at the intersection of abstract mathematics and practical computation. My collaboration with Charles Babbage taught me how to translate visionary ideas into concrete technical specifications.\n\n**What I bring:**\n• Ability to see technological potential others miss\n• Strong technical foundation in algorithmic design\n• Experience translating complex concepts for diverse audiences\n\nI am excited by the challenge of building something that doesn't yet exist.\n\nSincerely,\n\n**Ada Lovelace**` },
        { jobRank: 3, jobTitle: "Staff Algorithm Engineer - Spotify", tone: "creative", wordCount: 280, content: `Hello Spotify Team,\n\nMusic and machines - this is exactly what I envisioned in 1843!\n\nIn my Notes on the Analytical Engine, I wrote that the machine "might compose elaborate and scientific pieces of music of any degree of complexity." I would be thrilled to finally see this vision come to life.\n\n**Why Spotify:**\n• Your recommendation algorithms are the realization of my predictions\n• Music has always been intertwined with mathematics for me\n• I want to push the boundaries of what algorithms can create\n\nLet's make machines sing together.\n\n**Ada**` }
    ]
};

export default lovelaceProfile;
