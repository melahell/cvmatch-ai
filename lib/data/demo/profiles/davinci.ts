/**
 * Profil Démo : Léonard de Vinci
 * 
 * Artiste, scientifique et inventeur italien de la Renaissance.
 * 1452-1519
 */

import { DemoProfile } from "../types";
import { RAGComplete } from "@/types/rag-complete";

const davinciRAG: RAGComplete = {
    profil: {
        nom: "da Vinci",
        prenom: "Leonardo",
        titre_principal: "Artiste, Ingénieur & Inventeur Polyvalent",
        titres_alternatifs: ["Peintre", "Sculpteur", "Architecte", "Ingénieur militaire", "Anatomiste"],
        localisation: "Florence / Milan, Italie",
        contact: {
            email: "leonardo@vinci.art",
            portfolio: "https://uffizi.it/leonardo"
        },
        elevator_pitch: "Polymathe exceptionnel maîtrisant aussi bien les arts que les sciences. Créateur de chefs-d'œuvre comme La Joconde et La Cène, mais aussi inventeur prolifique (machines volantes, chars d'assaut, scaphandre). Approche unique combinant observation rigoureuse de la nature, expérimentation scientifique et expression artistique. Plus de 7000 pages de notes et croquis documentant des innovations ayant des siècles d'avance sur leur temps."
    },
    experiences: [
        {
            id: "exp_sforza",
            poste: "Ingénieur & Artiste de Cour",
            entreprise: "Cour de Ludovic Sforza",
            type_entreprise: "public",
            secteur: "Cour Ducale",
            lieu: "Milan, Italie",
            type_contrat: "cdi",
            debut: "1482-01",
            fin: "1499-12",
            actuel: false,
            duree_mois: 216,
            contexte: "Service du duc de Milan comme ingénieur militaire, architecte et artiste.",
            realisations: [
                { id: "real_cene", description: "Création de La Cène, fresque monumentale au couvent Santa Maria delle Grazie", impact: "Chef-d'œuvre reconnu UNESCO, référence mondiale de l'art occidental", keywords_ats: ["art monumental", "fresque", "patrimoine"], sources: ["unesco"] },
                { id: "real_machines", description: "Conception de machines de guerre innovantes et systèmes de défense", impact: "Dizaines d'inventions documentées dans les codex", keywords_ats: ["ingénierie militaire", "innovation", "conception"], sources: ["codex_atlanticus"] }
            ],
            technologies: ["Peinture à l'huile", "Sfumato", "Ingénierie mécanique"],
            outils: [],
            methodologies: ["Observation nature", "Expérimentation"],
            clients_references: ["Ludovic Sforza"],
            sources: ["codex_atlanticus"],
            last_updated: "2026-01-19",
            merge_count: 1
        },
        {
            id: "exp_florence",
            poste: "Artiste Indépendant",
            entreprise: "Atelier à Florence",
            type_entreprise: "startup",
            secteur: "Arts",
            lieu: "Florence, Italie",
            type_contrat: "freelance",
            debut: "1500-01",
            fin: "1506-12",
            actuel: false,
            duree_mois: 84,
            realisations: [
                { id: "real_joconde", description: "Création de La Joconde (Mona Lisa), portrait révolutionnaire", impact: "Tableau le plus célèbre au monde, 10M visiteurs/an au Louvre", keywords_ats: ["portrait", "technique picturale", "chef-d'œuvre"], sources: ["louvre"] }
            ],
            technologies: [],
            outils: [],
            methodologies: [],
            clients_references: [],
            sources: ["louvre"],
            last_updated: "2026-01-19",
            merge_count: 1
        }
    ],
    competences: {
        explicit: {
            techniques: [
                { nom: "Peinture", niveau: "expert", annees_experience: 50 },
                { nom: "Dessin anatomique", niveau: "expert", annees_experience: 40 },
                { nom: "Ingénierie mécanique", niveau: "expert", annees_experience: 40 },
                { nom: "Architecture", niveau: "avance", annees_experience: 30 },
                { nom: "Sculpture", niveau: "avance", annees_experience: 25 },
                { nom: "Hydraulique", niveau: "avance", annees_experience: 20 }
            ],
            soft_skills: ["Curiosité insatiable", "Pensée systémique", "Observation minutieuse", "Créativité", "Perfectionnisme"],
            methodologies: ["Observation de la nature", "Expérimentation", "Documentation exhaustive"]
        },
        inferred: { techniques: [], tools: [], soft_skills: [] },
        par_domaine: {
            "Art": ["Peinture", "Dessin", "Sculpture"],
            "Science": ["Anatomie", "Optique", "Botanique"],
            "Ingénierie": ["Mécanique", "Hydraulique", "Aéronautique"]
        }
    },
    formations: [
        { id: "form_verrocchio", type: "formation", titre: "Apprentissage Atelier Verrocchio", organisme: "Andrea del Verrocchio", lieu: "Florence", annee: "1466-1472", en_cours: false, sources: ["vasari"] }
    ],
    certifications: [],
    langues: [
        { langue: "Italien", niveau: "Natif", niveau_cecrl: "C2" },
        { langue: "Latin", niveau: "Courant", niveau_cecrl: "B2" }
    ],
    references: {
        clients: [
            { nom: "Ludovic Sforza", secteur: "Aristocratie", type: "grand_compte", annees: ["1482", "1499"], confidentiel: false },
            { nom: "François Ier de France", secteur: "Royauté", type: "grand_compte", annees: ["1516", "1519"], confidentiel: false }
        ],
        projets_marquants: []
    },
    metadata: {
        version: "2.0.0",
        created_at: "2026-01-19T00:00:00Z",
        last_updated: "2026-01-19T00:00:00Z",
        last_merge_at: "2026-01-19T00:00:00Z",
        sources_count: 4,
        documents_sources: ["vasari", "codex_atlanticus", "louvre", "unesco"],
        completeness_score: 92,
        merge_history: []
    }
};

export const davinciProfile: DemoProfile = {
    meta: {
        id: "davinci",
        name: "Léonard de Vinci",
        shortName: "Léonard",
        period: "1452-1519",
        icon: "🖼️",
        title: "Polymathe de la Renaissance",
        nationality: "Italien",
        quote: "La simplicité est la sophistication suprême.",
        categories: ["art", "science", "tech"]
    },
    rag: davinciRAG,
    completenessScore: 92,
    generationTimeMs: 891,
    cvs: [
        { templateId: "modern", templateName: "Standard", templateDescription: "Format professionnel", pdfUrl: "/demo-cvs/davinci-modern.pdf", previewUrl: "", recommended: false },
        { templateId: "classic", templateName: "Classique", templateDescription: "Design sobre", pdfUrl: "/demo-cvs/davinci-classic.pdf", previewUrl: "", recommended: false },
        { templateId: "creative", templateName: "Créatif", templateDescription: "Layout coloré", pdfUrl: "/demo-cvs/davinci-creative.pdf", previewUrl: "", recommended: true },
        { templateId: "tech", templateName: "ATS Optimisé", templateDescription: "Focus compétences", pdfUrl: "/demo-cvs/davinci-tech.pdf", previewUrl: "", recommended: false }
    ],
    jobs: [
        { rank: 1, title: "Chief Design Officer", company: "Apple", matchScore: 96, salaryMin: 250000, salaryMax: 400000, currency: "EUR", contractType: "CDI", sectors: ["Tech", "Design"], location: "Cupertino", whyMatch: "Fusion art + technologie = ADN Apple.", keySkills: ["Design produit", "Innovation", "Vision"], jobDescription: "Direction du design produit global." },
        { rank: 2, title: "Directeur Artistique - Musée du Louvre", matchScore: 94, salaryMin: 90000, salaryMax: 130000, currency: "EUR", contractType: "CDI", sectors: ["Musées", "Art"], location: "Paris", whyMatch: "Expertise artistique inégalée + La Joconde.", keySkills: ["Direction artistique", "Conservation"], jobDescription: "Direction artistique du plus grand musée du monde." },
        { rank: 3, title: "Lead Concept Artist - Naughty Dog", matchScore: 91, salaryMin: 120000, salaryMax: 180000, currency: "EUR", contractType: "CDI", sectors: ["Jeux vidéo"], location: "Los Angeles", whyMatch: "Maîtrise anatomie + créativité = concept art.", keySkills: ["Concept art", "Character design", "Worldbuilding"], jobDescription: "Direction artistique de jeux AAA." },
        { rank: 4, title: "Ingénieur R&D - Boston Dynamics", matchScore: 88, salaryMin: 150000, salaryMax: 220000, currency: "EUR", contractType: "CDI", sectors: ["Robotique"], location: "Boston", whyMatch: "Inventeur de machines mécaniques.", keySkills: ["Mécanique", "Robotique", "Innovation"], jobDescription: "Conception de robots humanoïdes." },
        { rank: 5, title: "Architecte Visionnaire", matchScore: 86, salaryMin: 100000, salaryMax: 160000, currency: "EUR", contractType: "Freelance", sectors: ["Architecture"], location: "Dubai", whyMatch: "Architecture + ingénierie combinées.", keySkills: ["Architecture", "Design urbain"], jobDescription: "Conception de bâtiments iconiques." },
        { rank: 6, title: "Consultant Innovation - McKinsey", matchScore: 83, salaryMin: 180000, salaryMax: 280000, currency: "EUR", contractType: "CDI", sectors: ["Conseil"], location: "Paris", whyMatch: "Pensée systémique + polyvalence.", keySkills: ["Stratégie", "Innovation"], jobDescription: "Conseil en transformation digitale." },
        { rank: 7, title: "Professeur d'Anatomie Artistique", matchScore: 80, salaryMin: 60000, salaryMax: 90000, currency: "EUR", contractType: "CDI", sectors: ["Éducation"], location: "Florence", whyMatch: "Études anatomiques légendaires.", keySkills: ["Anatomie", "Enseignement"], jobDescription: "Enseignement de l'anatomie aux artistes." },
        { rank: 8, title: "Creative Director - Pixar", matchScore: 78, salaryMin: 200000, salaryMax: 300000, currency: "EUR", contractType: "CDI", sectors: ["Animation"], location: "Emeryville", whyMatch: "Storytelling + art + technique.", keySkills: ["Direction créative", "Animation"], jobDescription: "Direction créative de films d'animation." },
        { rank: 9, title: "Ingénieur Aéronautique - Airbus", matchScore: 75, salaryMin: 80000, salaryMax: 120000, currency: "EUR", contractType: "CDI", sectors: ["Aéronautique"], location: "Toulouse", whyMatch: "Conceptions de machines volantes.", keySkills: ["Aérodynamique", "Conception"], jobDescription: "Conception d'aéronefs innovants." },
        { rank: 10, title: "Bio-Artiste Contemporain", matchScore: 72, salaryMin: 50000, salaryMax: 200000, currency: "EUR", contractType: "Freelance", sectors: ["Art contemporain"], location: "International", whyMatch: "Fusion science + art.", keySkills: ["Bio-art", "Installation"], jobDescription: "Création d'œuvres à l'intersection art/science." }
    ],
    coverLetters: [
        { jobRank: 1, jobTitle: "Chief Design Officer - Apple", tone: "professional_warm", wordCount: 350, content: `Dear Apple Leadership,\n\nI write to you as someone who has spent a lifetime believing that design and engineering are inseparable.\n\nMy career has been defined by the conviction that beautiful objects must also be functional, and that innovation comes from questioning every assumption. Whether painting the Mona Lisa or designing flying machines, I have always sought the intersection of art and technology.\n\n**Why I belong at Apple:**\n\n• **Design Philosophy**: Like Apple, I believe in simplicity as the ultimate sophistication\n• **Cross-disciplinary thinking**: I move fluidly between art, engineering, and science\n• **Attention to detail**: My notebooks contain thousands of pages of observations and refinements\n• **Innovation**: I designed machines centuries ahead of their time\n\nApple's mission to create products that enrich people's lives resonates deeply with my own work.\n\nI would be honored to contribute to Apple's next chapter.\n\nWith admiration,\n\n**Leonardo da Vinci**` },
        { jobRank: 2, jobTitle: "Directeur Artistique - Louvre", tone: "formal", wordCount: 320, content: `Madame, Monsieur,\n\nLe Musée du Louvre, qui abrite La Joconde, représente pour moi bien plus qu'une institution : c'est le gardien de l'héritage artistique de l'humanité.\n\nEn tant que créateur de plusieurs œuvres majeures de la collection, je possède une compréhension unique de l'intention artistique derrière ces chefs-d'œuvre. Mon expertise s'étend de la peinture à la sculpture, de l'architecture aux arts décoratifs.\n\n**Mes qualifications :**\n• Création d'œuvres emblématiques (Joconde, Cène, Homme de Vitruve)\n• Maîtrise des techniques de conservation de la Renaissance\n• Vision curatoriale alliant tradition et innovation\n\nJe serais honoré de guider le Louvre vers de nouveaux horizons.\n\nRespecteusement,\n\n**Leonardo da Vinci**` },
        { jobRank: 3, jobTitle: "Lead Concept Artist - Naughty Dog", tone: "creative", wordCount: 280, content: `Hey Naughty Dog Team!\n\nI've been sketching fantastical creatures and impossible machines my whole life. My notebooks are basically concept art bibles from 500 years ago.\n\n**What I'd bring:**\n• Anatomical accuracy that makes characters breathe\n• Mechanical designs that feel real and functional\n• Worldbuilding rooted in observation of nature\n\nI've always believed that the best fantasy is grounded in reality. Let me help you build worlds that players will never forget.\n\nExcited to explore together,\n\n**Leo**` }
    ]
};

export default davinciProfile;
