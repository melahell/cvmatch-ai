/**
 * Profil Démo : Alan Turing
 * 
 * Mathématicien, cryptanalyste, père de l'informatique.
 * 1912-1954
 */

import { DemoProfile } from "../types";
import { RAGComplete } from "@/types/rag-complete";

const turingRAG: RAGComplete = {
    profil: {
        nom: "Turing",
        prenom: "Alan",
        titre_principal: "Mathématicien & Père de l'Informatique",
        titres_alternatifs: ["Cryptanalyste", "Pionnier de l'IA"],
        localisation: "Cambridge, Royaume-Uni",
        contact: { email: "alan@turing.io", github: "github.com/alan-turing" },
        elevator_pitch: "Mathématicien ayant posé les fondations théoriques de l'informatique avec la Machine de Turing. Héros de guerre ayant déchiffré le code Enigma, contribution estimée avoir raccourci la Seconde Guerre mondiale de 2 ans et sauvé 14 millions de vies. Pionnier de l'intelligence artificielle avec le Test de Turing. Esprit brillant ayant façonné le monde numérique moderne."
    },
    experiences: [
        {
            id: "exp_bletchley",
            poste: "Cryptanalyste en Chef - Hut 8",
            entreprise: "Bletchley Park / GC&CS",
            type_entreprise: "public",
            secteur: "Défense / Renseignement",
            lieu: "Bletchley, UK",
            type_contrat: "cdi",
            debut: "1939-09",
            fin: "1945-05",
            actuel: false,
            duree_mois: 68,
            contexte: "Déchiffrement des communications navales allemandes chiffrées par Enigma.",
            realisations: [
                { id: "real_enigma", description: "Conception de la Bombe, machine déchiffrant le code Enigma en temps réel", impact: "Guerre raccourcie de 2 ans, 14 millions de vies sauvées (estimation)", keywords_ats: ["cryptanalyse", "machine learning", "sécurité"], sources: ["archives_bletchley"] },
                { id: "real_equipe", description: "Direction de l'équipe Hut 8 de cryptanalystes", impact: "Déchiffrement de milliers de messages critiques", keywords_ats: ["leadership", "équipe technique", "pression"], sources: ["archives_bletchley"] }
            ],
            technologies: ["Cryptanalyse", "Machines électromécaniques"],
            outils: ["Bombe (machine)"],
            methodologies: ["Analyse statistique", "Logique mathématique"],
            clients_references: ["Gouvernement britannique", "Amirauté"],
            sources: ["archives_bletchley"],
            last_updated: "2026-01-19",
            merge_count: 1
        },
        {
            id: "exp_npl",
            poste: "Directeur du Laboratoire de Calcul",
            entreprise: "National Physical Laboratory",
            type_entreprise: "public",
            secteur: "Recherche",
            lieu: "Teddington, UK",
            type_contrat: "cdi",
            debut: "1945-10",
            fin: "1948-05",
            actuel: false,
            duree_mois: 31,
            realisations: [
                { id: "real_ace", description: "Conception de l'ACE (Automatic Computing Engine), un des premiers ordinateurs", impact: "Fondation de l'industrie informatique britannique", keywords_ats: ["architecture ordinateur", "conception", "innovation"], sources: ["npl_archives"] }
            ],
            technologies: ["Architecture ordinateur", "Programmation"],
            outils: [],
            methodologies: [],
            clients_references: [],
            sources: ["npl_archives"],
            last_updated: "2026-01-19",
            merge_count: 1
        }
    ],
    competences: {
        explicit: {
            techniques: [
                { nom: "Mathématiques", niveau: "expert", annees_experience: 25 },
                { nom: "Cryptanalyse", niveau: "expert", annees_experience: 15 },
                { nom: "Architecture informatique", niveau: "expert", annees_experience: 15 },
                { nom: "Intelligence artificielle", niveau: "expert", annees_experience: 10 },
                { nom: "Logique formelle", niveau: "expert", annees_experience: 20 }
            ],
            soft_skills: ["Pensée abstraite", "Originalité", "Persévérance", "Intégrité"],
            methodologies: ["Preuve mathématique", "Expérimentation"]
        },
        inferred: { techniques: [], tools: [], soft_skills: [] },
        par_domaine: { "Informatique": ["Théorie", "Architecture", "IA"], "Mathématiques": ["Logique", "Calculabilité"] }
    },
    formations: [
        { id: "form_cambridge", type: "diplome", titre: "PhD Mathematics", organisme: "Princeton University", lieu: "Princeton, USA", annee: "1938", en_cours: false, sources: ["princeton_archives"] },
        { id: "form_kings", type: "diplome", titre: "BA Mathematics (Distinction)", organisme: "King's College Cambridge", lieu: "Cambridge, UK", annee: "1934", en_cours: false, sources: ["cambridge_archives"] }
    ],
    certifications: [],
    langues: [
        { langue: "Anglais", niveau: "Natif", niveau_cecrl: "C2" },
        { langue: "Allemand", niveau: "Intermédiaire", niveau_cecrl: "B1" }
    ],
    references: {
        clients: [{ nom: "Gouvernement britannique", secteur: "Défense", type: "public", annees: ["1939", "1945"], confidentiel: true }],
        projets_marquants: [{ id: "proj_machine", nom: "Machine de Turing", description: "Modèle théorique fondant l'informatique", annee: "1936", technologies: [], resultats: "Base de toute l'informatique moderne", sources: ["publication_1936"] }]
    },
    metadata: { version: "2.0.0", created_at: "2026-01-19T00:00:00Z", last_updated: "2026-01-19T00:00:00Z", last_merge_at: "2026-01-19T00:00:00Z", sources_count: 4, documents_sources: ["archives_bletchley", "npl_archives", "princeton_archives", "cambridge_archives"], completeness_score: 95, merge_history: [] }
};

export const turingProfile: DemoProfile = {
    meta: {
        id: "turing",
        name: "Alan Turing",
        shortName: "Turing",
        period: "1912-1954",
        icon: "🤖",
        title: "Père de l'Informatique",
        nationality: "Britannique",
        quote: "Les machines peuvent donner l'impression de penser.",
        categories: ["tech", "science"]
    },
    rag: turingRAG,
    completenessScore: 95,
    generationTimeMs: 912,
    cvs: [
        { templateId: "modern", templateName: "Standard", templateDescription: "Format professionnel", pdfUrl: "/demo-cvs/turing-modern.pdf", previewUrl: "", recommended: false },
        { templateId: "classic", templateName: "Classique", templateDescription: "Design sobre", pdfUrl: "/demo-cvs/turing-classic.pdf", previewUrl: "", recommended: false },
        { templateId: "creative", templateName: "Créatif", templateDescription: "Layout coloré", pdfUrl: "/demo-cvs/turing-creative.pdf", previewUrl: "", recommended: false },
        { templateId: "tech", templateName: "ATS Optimisé", templateDescription: "Focus compétences tech", pdfUrl: "/demo-cvs/turing-tech.pdf", previewUrl: "", recommended: true }
    ],
    jobs: [
        { rank: 1, title: "Chief AI Officer - OpenAI", matchScore: 99, salaryMin: 400000, salaryMax: 800000, currency: "EUR", contractType: "CDI", sectors: ["IA"], location: "San Francisco", whyMatch: "Père du Test de Turing = père de l'IA.", keySkills: ["IA", "Recherche", "Vision"], jobDescription: "Direction de la recherche en IA." },
        { rank: 2, title: "Distinguished Scientist - Google DeepMind", matchScore: 97, salaryMin: 350000, salaryMax: 600000, currency: "EUR", contractType: "CDI", sectors: ["IA", "Recherche"], location: "Londres", whyMatch: "Fondateur théorique de tout ce que DeepMind construit.", keySkills: ["ML", "Théorie", "Recherche"], jobDescription: "Recherche fondamentale en intelligence artificielle." },
        { rank: 3, title: "Directeur Cybersécurité - GCHQ", matchScore: 95, salaryMin: 150000, salaryMax: 220000, currency: "EUR", contractType: "CDI", sectors: ["Sécurité", "Gouvernement"], location: "Cheltenham", whyMatch: "Héros de Bletchley Park + expertise cryptanalyse.", keySkills: ["Cryptographie", "Cybersécurité"], jobDescription: "Direction de la cybersécurité nationale." },
        { rank: 4, title: "Professeur d'Informatique - Cambridge", matchScore: 93, salaryMin: 120000, salaryMax: 180000, currency: "EUR", contractType: "CDI", sectors: ["Académique"], location: "Cambridge", whyMatch: "Ancien de King's College + fondateur du domaine.", keySkills: ["Enseignement", "Recherche"], jobDescription: "Chaire d'informatique théorique." },
        { rank: 5, title: "CTO - Startup Quantum Computing", matchScore: 90, salaryMin: 200000, salaryMax: 350000, currency: "EUR", contractType: "CDI", sectors: ["Quantum"], location: "Cambridge", whyMatch: "Machine de Turing → machines quantiques.", keySkills: ["CTO", "Quantum", "Architecture"], jobDescription: "Direction technique d'une startup quantique." },
        { rank: 6, title: "Principal Researcher - Microsoft Research", matchScore: 87, salaryMin: 250000, salaryMax: 400000, currency: "EUR", contractType: "CDI", sectors: ["Recherche"], location: "Cambridge", whyMatch: "Recherche fondamentale + application.", keySkills: ["Recherche", "Publication"], jobDescription: "Recherche en informatique théorique." },
        { rank: 7, title: "Conseiller Éthique IA - UE", matchScore: 84, salaryMin: 100000, salaryMax: 150000, currency: "EUR", contractType: "CDD", sectors: ["Politique"], location: "Bruxelles", whyMatch: "Questions éthiques de l'IA depuis 1950.", keySkills: ["Éthique IA", "Conseil"], jobDescription: "Conseil sur la régulation de l'IA." },
        { rank: 8, title: "Architecte Sécurité - Apple", matchScore: 81, salaryMin: 200000, salaryMax: 300000, currency: "EUR", contractType: "CDI", sectors: ["Tech"], location: "Cupertino", whyMatch: "Expertise cryptographie.", keySkills: ["Sécurité", "Cryptographie"], jobDescription: "Architecture de sécurité des produits." },
        { rank: 9, title: "Auteur & Vulgarisateur", matchScore: 78, salaryMin: 80000, salaryMax: 120000, currency: "EUR", contractType: "Freelance", sectors: ["Édition"], location: "Remote", whyMatch: "Clarté d'expression + concepts complexes.", keySkills: ["Écriture", "Vulgarisation"], jobDescription: "Ouvrages sur l'IA et l'informatique." },
        { rank: 10, title: "Mentor Hackathons", matchScore: 75, salaryMin: 50000, salaryMax: 80000, currency: "EUR", contractType: "Freelance", sectors: ["Tech"], location: "International", whyMatch: "Inspiration pour les jeunes développeurs.", keySkills: ["Mentorat", "Innovation"], jobDescription: "Mentorat lors de hackathons internationaux." }
    ],
    coverLetters: [
        { jobRank: 1, jobTitle: "Chief AI Officer - OpenAI", tone: "professional_warm", wordCount: 360, content: `Dear OpenAI Leadership,\n\nIn 1950, I asked: "Can machines think?" OpenAI is now providing the answer.\n\nI have spent my entire career laying the theoretical foundations for what you are now building. The Turing Machine, the Turing Test, and my work on morphogenesis all share a common thread: understanding computation and intelligence.\n\n**What I bring:**\n\n• **Theoretical depth**: I defined what computation means before computers existed\n• **Practical problem-solving**: I broke Enigma and saved millions of lives\n• **Vision for AI**: The Turing Test remains the benchmark for machine intelligence\n• **Scientific rigor**: Mathematics ensures we build on solid foundations\n\nOpenAI's mission to ensure AI benefits humanity aligns perfectly with my life's work.\n\nI would be honored to contribute.\n\nSincerely,\n\n**Alan Turing**` },
        { jobRank: 2, jobTitle: "Distinguished Scientist - DeepMind", tone: "professional_warm", wordCount: 310, content: `Dear DeepMind Team,\n\nAlphaGo, AlphaFold, Gemini - you are making machines think in ways I only imagined.\n\nMy theoretical work on computation and intelligence laid the groundwork that DeepMind has built upon so brilliantly. The intersection of mathematics and learning systems that defines your research is exactly what I envisioned.\n\n**My contributions:**\n• The Turing Machine: formal model of computation\n• The Turing Test: measuring machine intelligence\n• Early work on machine learning and pattern recognition\n\nI would love to contribute to DeepMind's next breakthrough.\n\nWith admiration,\n\n**Alan Turing**` },
        { jobRank: 3, jobTitle: "Directeur Cybersécurité - GCHQ", tone: "formal", wordCount: 290, content: `Dear Director,\n\nBletchley Park was the beginning of signals intelligence. GCHQ carries that legacy forward.\n\nI led the team that broke Enigma, developing techniques still relevant to modern cryptanalysis. My experience combining mathematical rigor with practical urgency is exactly what national security requires.\n\n**My qualifications:**\n• Broke the "unbreakable" Enigma code\n• Designed the Bombe and early computing machines\n• Deep understanding of both offense and defense in cryptography\n\nI am ready to serve again.\n\nYours faithfully,\n\n**Alan Turing OBE**` }
    ]
};

export default turingProfile;
