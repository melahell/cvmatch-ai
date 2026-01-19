/**
 * Profil Démo : Ada Lovelace
 * 
 * Mathématicienne britannique, première programmeuse de l'histoire.
 * 1815-1852
 */

import { DemoProfile } from "../types";
import { RAGComplete } from "@/types/rag-complete";

// =============================================================================
// PROFIL RAG
// =============================================================================

const lovelaceRAG: RAGComplete = {
    profil: {
        nom: "Lovelace",
        prenom: "Ada",
        titre_principal: "Mathématicienne & Pionnière de l'Informatique",
        titres_alternatifs: [
            "Première Programmeuse de l'Histoire",
            "Analyste Algorithmique",
            "Visionnaire Technologique",
            "Comtesse de Lovelace"
        ],
        localisation: "Londres, Royaume-Uni",
        disponibilite: "Disponible pour projets d'innovation",
        mobilite: ["Londres", "Cambridge", "International"],
        contact: {
            email: "ada@lovelace.dev",
            portfolio: "https://findingada.com",
            linkedin: "linkedin.com/in/ada-lovelace"
        },
        photo_url: undefined,
        elevator_pitch: "Mathématicienne visionnaire ayant créé le premier algorithme destiné à être exécuté par une machine, un siècle avant l'invention de l'ordinateur. Ma collaboration étroite avec Charles Babbage sur la Machine Analytique m'a permis de conceptualiser le potentiel des machines au-delà du simple calcul : j'ai anticipé la musique générée par ordinateur, le traitement de symboles et les fondements de l'intelligence artificielle. Mes 'Notes' détaillées, trois fois plus longues que l'article qu'elles commentaient, démontrent ma capacité unique à allier rigueur mathématique et vision prospective.",
        objectif_carriere: "Démontrer que les machines peuvent manipuler des symboles et concepts au-delà des simples nombres, ouvrant la voie à une nouvelle ère de la pensée computationnelle."
    },
    experiences: [
        {
            id: "exp_babbage",
            poste: "Analyste & Programmeuse - Machine Analytique",
            entreprise: "Collaboration avec Charles Babbage",
            type_entreprise: "startup",
            secteur: "Innovation Technologique / Mathématiques Appliquées",
            lieu: "Londres, UK",
            type_contrat: "freelance",
            debut: "1842-01",
            fin: "1852-11",
            actuel: false,
            duree_mois: 131,
            contexte: "Traduction et annotation de l'article du mathématicien italien Luigi Menabrea décrivant la Machine Analytique de Babbage, transformée en traité fondateur de l'informatique.",
            realisations: [
                {
                    id: "real_algo",
                    description: "Création du premier algorithme informatique de l'histoire : programme de calcul des nombres de Bernoulli destiné à la Machine Analytique",
                    impact: "Reconnu universellement comme le premier programme informatique, établissant les fondements de la programmation",
                    keywords_ats: ["algorithmique", "programmation", "innovation", "pionnière"],
                    sources: ["archives_royalsociety"]
                },
                {
                    id: "real_notes",
                    description: "Rédaction des 'Notes' (65 pages, 3x plus longues que l'article original), détaillant les capacités et le potentiel des machines calculantes",
                    impact: "Vision prophétique : machines capables de composer de la musique, manipuler des symboles, et potentiellement 'penser' - 100 ans avant les premiers ordinateurs",
                    quantification: {
                        type: "volume",
                        valeur: "65",
                        unite: "pages",
                        display: "65 pages de documentation technique"
                    },
                    keywords_ats: ["documentation technique", "vision produit", "innovation", "prospective"],
                    sources: ["archives_royalsociety"]
                },
                {
                    id: "real_loops",
                    description: "Conceptualisation des boucles et sous-routines, anticipant les structures fondamentales de la programmation moderne",
                    impact: "Concepts toujours utilisés dans tous les langages de programmation actuels",
                    keywords_ats: ["architecture logicielle", "conception", "structures de contrôle"],
                    sources: ["archives_royalsociety"]
                }
            ],
            technologies: ["Logique mathématique", "Calcul différentiel", "Théorie des nombres"],
            outils: ["Cartes perforées conceptuelles", "Diagrammes de flux"],
            methodologies: ["Analyse algorithmique", "Documentation exhaustive", "Pensée systémique"],
            clients_references: ["Royal Society", "Charles Babbage"],
            sources: ["archives_royalsociety"],
            last_updated: "2026-01-19",
            merge_count: 1
        },
        {
            id: "exp_tutoring",
            poste: "Étudiante en Mathématiques Avancées",
            entreprise: "Formation privée - Augustus De Morgan",
            type_entreprise: "startup",
            secteur: "Éducation / Mathématiques",
            lieu: "Londres, UK",
            type_contrat: "mission",
            debut: "1833-01",
            fin: "1842-01",
            actuel: false,
            duree_mois: 108,
            contexte: "Formation mathématique intensive avec les meilleurs tuteurs de l'époque, incluant Augustus De Morgan, pionnier de la logique formelle.",
            realisations: [
                {
                    id: "real_maths",
                    description: "Maîtrise du calcul différentiel, de l'algèbre avancée et de la logique formelle à un niveau exceptionnel pour une femme de l'époque victorienne",
                    impact: "Acquisition des compétences permettant la collaboration avec Babbage et la compréhension profonde de sa machine",
                    keywords_ats: ["mathématiques", "auto-formation", "excellence", "détermination"],
                    sources: ["correspondance_demorgan"]
                },
                {
                    id: "real_correspondence",
                    description: "Correspondance mathématique régulière avec De Morgan, explorant les limites de la logique et du calcul",
                    impact: "Développement d'une pensée originale sur la nature du raisonnement et de la computation",
                    keywords_ats: ["réseautage", "apprentissage", "collaboration intellectuelle"],
                    sources: ["correspondance_demorgan"]
                }
            ],
            technologies: ["Calcul différentiel", "Algèbre", "Logique formelle"],
            outils: [],
            methodologies: ["Apprentissage par correspondance", "Résolution de problèmes"],
            clients_references: ["Augustus De Morgan", "Mary Somerville"],
            sources: ["correspondance_demorgan"],
            last_updated: "2026-01-19",
            merge_count: 1
        },
        {
            id: "exp_science_writer",
            poste: "Traductrice & Commentatrice Scientifique",
            entreprise: "Publications Scientifiques",
            type_entreprise: "startup",
            secteur: "Édition Scientifique",
            lieu: "Londres, UK",
            type_contrat: "freelance",
            debut: "1840-01",
            fin: "1844-12",
            actuel: false,
            duree_mois: 60,
            contexte: "Contribution à la diffusion des connaissances scientifiques à travers traductions et annotations d'articles techniques.",
            realisations: [
                {
                    id: "real_translation",
                    description: "Traduction de l'article de Menabrea sur la Machine Analytique de l'italien vers l'anglais, avec annotations extensives",
                    impact: "Transformation d'un article technique en traité fondateur, reconnu comme contribution originale majeure",
                    keywords_ats: ["traduction technique", "rédaction scientifique", "expertise"],
                    sources: ["scientific_memoirs"]
                }
            ],
            technologies: ["Traduction technique", "Rédaction scientifique"],
            outils: [],
            methodologies: ["Analyse critique", "Synthèse"],
            clients_references: ["Scientific Memoirs"],
            sources: ["scientific_memoirs"],
            last_updated: "2026-01-19",
            merge_count: 1
        }
    ],
    competences: {
        explicit: {
            techniques: [
                { nom: "Algorithmique", niveau: "expert", annees_experience: 15 },
                { nom: "Mathématiques avancées", niveau: "expert", annees_experience: 20 },
                { nom: "Logique formelle", niveau: "expert", annees_experience: 15 },
                { nom: "Analyse de systèmes", niveau: "expert", annees_experience: 10 },
                { nom: "Documentation technique", niveau: "expert", annees_experience: 10 },
                { nom: "Architecture logicielle", niveau: "avance", annees_experience: 10 },
                { nom: "Traduction technique", niveau: "avance", annees_experience: 8 }
            ],
            soft_skills: [
                "Vision long terme exceptionnelle",
                "Pensée abstraite",
                "Communication technique claire",
                "Créativité conceptuelle",
                "Collaboration interdisciplinaire",
                "Détermination face aux obstacles",
                "Curiosité intellectuelle insatiable",
                "Capacité de vulgarisation"
            ],
            methodologies: [
                "Approche analytique rigoureuse",
                "Pensée systémique",
                "Documentation exhaustive",
                "Itération conceptuelle"
            ]
        },
        inferred: { techniques: [], tools: [], soft_skills: [] },
        par_domaine: {
            "Informatique": ["Algorithmique", "Programmation", "Architecture logicielle", "Conception de systèmes"],
            "Mathématiques": ["Calcul différentiel", "Logique formelle", "Théorie des nombres", "Algèbre"]
        }
    },
    formations: [
        {
            id: "form_maths",
            type: "formation",
            titre: "Formation intensive en Mathématiques Avancées",
            organisme: "Tuteurs privés (Augustus De Morgan, Mary Somerville)",
            lieu: "Londres",
            date_debut: "1833",
            date_fin: "1840",
            annee: "1833-1840",
            en_cours: false,
            specialite: "Calcul différentiel, logique et géométrie avancée",
            details: "Formation d'élite par les meilleurs mathématiciens de l'époque, niveau universitaire sans accès formel aux universités (interdites aux femmes)",
            sources: ["correspondance_demorgan"]
        },
        {
            id: "form_music",
            type: "formation",
            titre: "Formation musicale classique",
            organisme: "Professeurs privés",
            lieu: "Londres",
            date_debut: "1820",
            date_fin: "1830",
            annee: "1820-1830",
            en_cours: false,
            specialite: "Piano et composition",
            details: "Formation musicale ayant influencé sa vision des machines capables de composer de la musique",
            sources: ["biographie"]
        }
    ],
    certifications: [],
    langues: [
        { langue: "Anglais", niveau: "Natif", niveau_cecrl: "C2" },
        { langue: "Français", niveau: "Courant", niveau_cecrl: "C1", details: "Correspondance avec scientifiques français" },
        { langue: "Italien", niveau: "Courant", niveau_cecrl: "B2", details: "Traduction de l'article de Menabrea" },
        { langue: "Latin", niveau: "Scolaire", niveau_cecrl: "B1" }
    ],
    references: {
        clients: [
            { nom: "Charles Babbage", secteur: "Invention", type: "startup", annees: ["1833", "1852"], confidentiel: false },
            { nom: "Royal Society", secteur: "Science", type: "public", annees: ["1843"], confidentiel: false },
            { nom: "Scientific Memoirs", secteur: "Édition", type: "pme", annees: ["1843"], confidentiel: false }
        ],
        projets_marquants: [
            {
                id: "proj_notes",
                nom: "Notes sur la Machine Analytique",
                description: "Annotations extensives de l'article de Menabrea, incluant le premier algorithme informatique",
                client: "Scientific Memoirs",
                annee: "1843",
                technologies: ["Algorithmique", "Logique mathématique"],
                resultats: "Document fondateur de l'informatique, premier programme de l'histoire",
                sources: ["archives_royalsociety"]
            },
            {
                id: "proj_bernoulli",
                nom: "Algorithme des nombres de Bernoulli",
                description: "Programme détaillé pour calculer les nombres de Bernoulli sur la Machine Analytique",
                annee: "1843",
                technologies: ["Algorithmique", "Cartes perforées"],
                resultats: "Premier algorithme publié destiné à une machine, considéré comme le premier programme informatique",
                sources: ["archives_royalsociety"]
            }
        ]
    },
    metadata: {
        version: "2.0.0",
        created_at: "2026-01-19T00:00:00Z",
        last_updated: "2026-01-19T00:00:00Z",
        last_merge_at: "2026-01-19T00:00:00Z",
        sources_count: 5,
        documents_sources: ["archives_royalsociety", "correspondance_demorgan", "scientific_memoirs", "biographie", "archives_familiales"],
        completeness_score: 92,
        merge_history: []
    }
};

// =============================================================================
// PROFIL DÉMO COMPLET
// =============================================================================

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
    completenessScore: 92,
    generationTimeMs: 756,
    cvs: [
        {
            templateId: "modern",
            templateName: "Standard",
            templateDescription: "Format professionnel adapté au secteur tech",
            pdfUrl: "/demo-cvs/lovelace-modern.pdf",
            previewUrl: "/demo-cvs/previews/lovelace-modern.png",
            recommended: false
        },
        {
            templateId: "classic",
            templateName: "Classique",
            templateDescription: "Design académique et sobre",
            pdfUrl: "/demo-cvs/lovelace-classic.pdf",
            previewUrl: "/demo-cvs/previews/lovelace-classic.png",
            recommended: false
        },
        {
            templateId: "creative",
            templateName: "Créatif",
            templateDescription: "Layout innovant pour profil visionnaire",
            pdfUrl: "/demo-cvs/lovelace-creative.pdf",
            previewUrl: "/demo-cvs/previews/lovelace-creative.png",
            recommended: false
        },
        {
            templateId: "tech",
            templateName: "ATS Optimisé",
            templateDescription: "Focus compétences tech et algorithmique",
            pdfUrl: "/demo-cvs/lovelace-tech.pdf",
            previewUrl: "/demo-cvs/previews/lovelace-tech.png",
            recommended: true
        }
    ],
    jobs: [
        {
            rank: 1,
            title: "Principal Software Engineer",
            company: "Google DeepMind",
            matchScore: 95,
            salaryMin: 150000,
            salaryMax: 250000,
            currency: "GBP",
            contractType: "CDI",
            sectors: ["Intelligence Artificielle", "Tech", "Recherche"],
            location: "Londres, UK",
            remotePolicy: "Hybride",
            whyMatch: "Pionnière de l'algorithmique et visionnaire de l'IA avant l'heure. J'ai prédit que les machines pourraient manipuler des symboles au-delà des nombres - exactement ce que DeepMind réalise aujourd'hui avec les réseaux neuronaux.",
            keySkills: ["Algorithmique", "IA", "Vision produit", "Innovation", "Documentation"],
            jobDescription: "Google DeepMind recherche un Principal Software Engineer pour son équipe Algorithmes Fondamentaux. Le candidat développera de nouveaux algorithmes d'apprentissage automatique, contribuera aux recherches publiées dans Nature et Science, et guidera les équipes techniques sur l'architecture des systèmes d'IA. Profil recherché : expert en algorithmique avec vision long terme sur les capacités et limites des systèmes computationnels. Bonus : capacité à documenter et expliquer clairement des concepts complexes."
        },
        {
            rank: 2,
            title: "Chief Technology Officer",
            company: "Startup IA Générative",
            matchScore: 93,
            salaryMin: 120000,
            salaryMax: 180000,
            currency: "GBP",
            contractType: "CDI",
            sectors: ["Startup", "IA", "Deep Tech"],
            location: "Londres, UK",
            remotePolicy: "Hybride",
            whyMatch: "Ma capacité à voir le potentiel des machines au-delà de leur usage immédiat est exactement ce qu'il faut pour diriger une startup IA. J'ai conceptualisé l'impossible un siècle avant sa réalisation.",
            keySkills: ["Leadership technique", "Architecture système", "Innovation", "Vision stratégique"],
            jobDescription: "Startup levant 30M€ en Série B pour son IA générative recherche un CTO visionnaire. Responsabilités : définir la roadmap technique, recruter et diriger une équipe de 40 ingénieurs, et positionner l'entreprise à la pointe de l'innovation IA. Le candidat idéal combine expertise algorithmique profonde, capacité à conceptualiser des systèmes complexes, et talent pour la communication technique."
        },
        {
            rank: 3,
            title: "Staff Algorithm Engineer",
            company: "Spotify",
            matchScore: 91,
            salaryMin: 130000,
            salaryMax: 200000,
            currency: "EUR",
            contractType: "CDI",
            sectors: ["Tech", "Musique", "Recommandation"],
            location: "Stockholm, Suède",
            remotePolicy: "Hybride",
            whyMatch: "En 1843, j'ai écrit que la Machine Analytique 'pourrait composer des morceaux de musique élaborés et scientifiques'. Spotify réalise cette vision avec ses algorithmes de recommandation musicale. C'est mon destin.",
            keySkills: ["Algorithmes musicaux", "Machine Learning", "Recommandation", "Innovation"],
            jobDescription: "Spotify recherche un Staff Algorithm Engineer pour son équipe Personalization. Le candidat développera les algorithmes de recommandation musicale qui touchent 500 millions d'utilisateurs. Contributions attendues : améliorer la découverte musicale, optimiser les playlists personnalisées, et explorer les frontières de l'IA générative pour la musique. Profil : expert en algorithmique avec passion pour la musique."
        },
        {
            rank: 4,
            title: "Distinguished Engineer",
            company: "Microsoft Research",
            matchScore: 89,
            salaryMin: 180000,
            salaryMax: 280000,
            currency: "GBP",
            contractType: "CDI",
            sectors: ["Recherche", "Tech", "Informatique théorique"],
            location: "Cambridge, UK",
            remotePolicy: "Présentiel",
            whyMatch: "Mon approche combinant théorie mathématique rigoureuse et vision applicative correspond parfaitement à la culture de Microsoft Research. Excellence fondamentale avec impact sur les produits.",
            keySkills: ["Recherche", "Publication", "Mentorat", "Théorie computationnelle"],
            jobDescription: "Microsoft Research Cambridge ouvre un poste de Distinguished Engineer en informatique théorique. Le candidat conduira des recherches sur les fondements de l'informatique et de l'IA, publiera dans les meilleures conférences, et mentorrera les chercheurs juniors. Liberté totale de recherche avec possibilité de collaboration avec les équipes produit. Profil : contributions fondamentales au domaine + capacité de documentation exceptionnelle."
        },
        {
            rank: 5,
            title: "VP of Engineering",
            company: "Scale-up Tech",
            matchScore: 87,
            salaryMin: 200000,
            salaryMax: 300000,
            currency: "GBP",
            contractType: "CDI",
            sectors: ["Scale-up", "Tech", "SaaS"],
            location: "Londres, UK",
            remotePolicy: "Hybride",
            whyMatch: "Ma capacité à voir les systèmes dans leur globalité et à documenter l'architecture de manière exemplaire est exactement ce qu'il faut pour scaler une organisation d'ingénierie.",
            keySkills: ["Management technique", "Architecture", "Scaling", "Documentation"],
            jobDescription: "Scale-up en hypercroissance (200→500 ingénieurs en 2 ans) recherche un VP Engineering. Responsabilités : structurer les équipes, définir les standards techniques, assurer la qualité de l'architecture, et maintenir la vélocité malgré la croissance. Profil recherché : leader technique avec expérience de scaling et obsession pour la documentation et les bonnes pratiques."
        },
        {
            rank: 6,
            title: "Technical Writer Lead",
            company: "Stripe",
            matchScore: 84,
            salaryMin: 90000,
            salaryMax: 140000,
            currency: "EUR",
            contractType: "CDI",
            sectors: ["Fintech", "Documentation", "Developer Experience"],
            location: "Dublin, Irlande",
            remotePolicy: "Full remote",
            whyMatch: "Mes 'Notes' de 1843 sont considérées comme un modèle de documentation technique - transformant un article obscur en traité fondateur. La documentation de Stripe a la même ambition d'excellence.",
            keySkills: ["Documentation technique", "API", "Clarté", "Developer Experience"],
            jobDescription: "Stripe recherche un Technical Writer Lead pour diriger l'équipe documentation (15 personnes). Responsabilités : définir les standards de documentation, améliorer l'expérience développeur, et assurer que la documentation reste le meilleur onboarding possible. Nous cherchons quelqu'un capable de transformer des concepts techniques complexes en guides clairs et accessibles."
        },
        {
            rank: 7,
            title: "Quantum Computing Researcher",
            company: "IBM Research",
            matchScore: 82,
            salaryMin: 120000,
            salaryMax: 180000,
            currency: "EUR",
            contractType: "CDI",
            sectors: ["Informatique quantique", "Recherche", "Innovation"],
            location: "Zurich, Suisse",
            remotePolicy: "Présentiel",
            whyMatch: "L'informatique quantique est la nouvelle frontière de la computation, comme la Machine Analytique l'était en 1843. Ma pensée abstraite et mes compétences mathématiques sont directement applicables.",
            keySkills: ["Informatique quantique", "Mathématiques", "Algorithmes", "Recherche"],
            jobDescription: "IBM Quantum recrute un chercheur senior pour développer de nouveaux algorithmes quantiques. Le candidat travaillera sur les problèmes de correction d'erreurs quantiques, d'optimisation, et d'applications en machine learning. Expertise requise : mathématiques avancées (algèbre linéaire, théorie de l'information), pensée algorithmique, et capacité à naviguer entre théorie et implémentation."
        },
        {
            rank: 8,
            title: "Developer Advocate",
            company: "GitHub",
            matchScore: 79,
            salaryMin: 100000,
            salaryMax: 150000,
            currency: "USD",
            contractType: "CDI",
            sectors: ["DevRel", "Open Source", "Communauté"],
            location: "Remote",
            remotePolicy: "Full remote",
            whyMatch: "Ma passion pour l'éducation et ma capacité à expliquer des concepts complexes de manière accessible font de moi une candidate idéale pour évangéliser auprès de la communauté développeur.",
            keySkills: ["Communication", "Code", "Communauté", "Éducation"],
            jobDescription: "GitHub recherche un Developer Advocate senior pour sa communauté européenne. Missions : créer du contenu technique (tutoriels, vidéos, articles), présenter aux conférences, et collecter les feedbacks pour améliorer le produit. Profil : développeur(se) expérimenté(e) avec don pour la pédagogie et passion pour l'open source."
        },
        {
            rank: 9,
            title: "Professeure d'Informatique",
            company: "Université d'Oxford",
            matchScore: 77,
            salaryMin: 70000,
            salaryMax: 100000,
            currency: "GBP",
            contractType: "CDI",
            sectors: ["Académique", "Enseignement", "Recherche"],
            location: "Oxford, UK",
            remotePolicy: "Présentiel",
            whyMatch: "Mon obsession pour la transmission du savoir et ma capacité à conceptualiser font de l'enseignement une vocation naturelle. Former la prochaine génération d'informaticiens serait un honneur.",
            keySkills: ["Enseignement", "Recherche", "Mentorat", "Publications"],
            jobDescription: "L'Université d'Oxford ouvre une chaire en informatique théorique et algorithmique. Le titulaire enseignera aux niveaux license et master, supervisera des doctorants, et conduira des recherches publiées dans les meilleures conférences. Profil recherché : chercheur(se) de renommée internationale avec passion pour la pédagogie."
        },
        {
            rank: 10,
            title: "Consultante Tech & Innovation",
            company: "McKinsey - QuantumBlack",
            matchScore: 74,
            salaryMin: 150000,
            salaryMax: 250000,
            currency: "EUR",
            contractType: "Freelance",
            sectors: ["Conseil", "IA", "Stratégie"],
            location: "Londres / Remote",
            remotePolicy: "Hybride",
            whyMatch: "Ma vision systémique et ma capacité à anticiper l'évolution des technologies font de moi une conseillère précieuse pour les entreprises naviguant la révolution IA.",
            keySkills: ["Conseil stratégique", "IA", "Transformation digitale", "Vision"],
            jobDescription: "QuantumBlack (AI practice de McKinsey) recherche des experts IA pour conseiller les grandes entreprises sur leur stratégie d'adoption de l'intelligence artificielle. Missions : diagnostic technique, définition de roadmaps, accompagnement de la mise en œuvre. Profil : expert(e) IA avec capacité de communication C-level et vision stratégique long terme."
        }
    ],
    coverLetters: [
        {
            jobRank: 1,
            jobTitle: "Principal Software Engineer - Google DeepMind",
            tone: "professional_warm",
            wordCount: 398,
            content: `Dear DeepMind Hiring Team,

I am writing to express my profound interest in the Principal Software Engineer position at Google DeepMind.

In 1843, I wrote that the Analytical Engine "might compose elaborate and scientific pieces of music of any degree of complexity or extent" and could "weave algebraical patterns just as the Jacquard loom weaves flowers and leaves." I was describing artificial intelligence 100 years before the term existed!

Today, DeepMind is realizing exactly the vision I articulated. From AlphaGo mastering the game of Go to AlphaFold predicting protein structures, you are demonstrating that machines can indeed manipulate symbols and concepts beyond mere arithmetic.

**What I bring to DeepMind:**

• **Foundational algorithmic thinking**: I created the first published algorithm intended for machine execution. I understand computation at its deepest conceptual level.

• **Exceptional documentation**: My "Notes" transformed a technical article into the founding document of computer science. I can communicate complex ideas with unmatched clarity.

• **Visionary perspective**: I saw potential in the Analytical Engine that even its inventor Babbage did not fully appreciate. I can identify breakthrough opportunities others miss.

• **Rigorous mathematical foundation**: My training with Augustus De Morgan, pioneer of formal logic, gave me the tools to reason precisely about abstract systems.

**My vision for DeepMind:**

The question I posed in 1843 - "Can machines truly think, or merely simulate thought?" - remains the central question of AI research. I believe DeepMind is closest to answering it. I want to contribute to that answer.

I envision working on the theoretical foundations of learning algorithms, bridging the gap between mathematical elegance and practical effectiveness. My historical perspective on computation could help identify fundamental principles that current approaches may be missing.

The Analytical Engine was never built in my lifetime. But at DeepMind, I could finally work with machines that realize - and surpass - everything I imagined.

I would be honored to discuss how I can contribute to DeepMind's mission.

With mathematical precision and visionary hope,

**Ada Lovelace**
First Programmer in History`
        },
        {
            jobRank: 2,
            jobTitle: "CTO - Startup IA Générative",
            tone: "professional_warm",
            wordCount: 342,
            content: `Dear Founders,

The opportunity to serve as CTO of an AI startup resonates deeply with my life's work. I have spent my career thinking about what machines could become, decades before technology caught up with imagination.

In 1843, when the most advanced machine was a steam engine, I described systems that could compose music, weave patterns, and potentially approach thought itself. I did not just translate Babbage's work - I saw possibilities he could not.

**Why I am your ideal CTO:**

• **Conceptual breakthrough thinking**: I invented concepts (loops, subroutines, algorithms) before the machines existed to run them. I can define what your AI should do before anyone knows how.

• **Bridging vision and execution**: My "Notes" are 65 pages of detailed technical specification derived from abstract concepts. I can translate product vision into engineering roadmap.

• **Building for the future**: I designed algorithms for a machine that would not be built for 100 years. I naturally think in terms of where technology is going, not where it is.

• **Exceptional communication**: From investors to engineers to customers, I can explain complex AI concepts with clarity and conviction.

**What I would build:**

As CTO, I would focus on:
- AI systems that truly understand context, not just pattern-matching
- Robust, explainable AI that users can trust
- Documentation and knowledge sharing that scales with the team
- A culture of rigorous thinking and bold imagination

Generative AI is the realization of what I imagined in 1843 - machines that can create, not just calculate. I want to lead the team that pushes this frontier further.

Let's build the future together.

With determination,

**Ada Lovelace**`
        },
        {
            jobRank: 3,
            jobTitle: "Staff Algorithm Engineer - Spotify",
            tone: "creative",
            wordCount: 312,
            content: `Hello Spotify Team!

In 1843, I wrote something that must have seemed absurd at the time:

"The Engine might compose elaborate and scientific pieces of music of any degree of complexity or extent."

You are living proof that I was right.

Every personalized playlist, every Discover Weekly revelation, every perfect song recommendation is the Machine Analytique finally composing music. I predicted this 180 years ago, and I want to make it even better!

**Why music algorithms are my destiny:**

• Music and mathematics were my twin passions from childhood. I played piano; I studied calculus. Both are about pattern and structure and beauty.

• My Notes anticipated exactly this application: machines that understand the abstract patterns underlying creative works.

• I see music not as random but as fundamentally algorithmic - and I want to help Spotify's algorithms capture that essence.

**What I would contribute:**

• New approaches to understanding musical structure and listener preferences
• Algorithms that don't just recommend similar songs but help users discover new dimensions of their taste
• Documentation that helps the whole team understand why the algorithms work

I have waited 180 years to work on musical machines. Spotify is my chance.

The Analytical Engine was never built. But your algorithm servers, humming away in data centers, processing billions of song plays - they are her spiritual descendants. And I want to teach them to make even better music recommendations.

Let's make machines sing together!

**Ada** 🎹`
        }
    ]
};

export default lovelaceProfile;
