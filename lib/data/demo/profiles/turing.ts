/**
 * Profil Démo : Alan Turing
 * 
 * Mathématicien, cryptanalyste et père de l'informatique théorique.
 * 1912-1954
 */

import { DemoProfile } from "../types";
import { RAGComplete } from "@/types/rag-complete";

// =============================================================================
// PROFIL RAG
// =============================================================================

const turingRAG: RAGComplete = {
    profil: {
        nom: "Turing",
        prenom: "Alan",
        titre_principal: "Mathématicien & Père de l'Informatique",
        titres_alternatifs: [
            "Cryptanalyste",
            "Pionnier de l'Intelligence Artificielle",
            "Théoricien de la Calculabilité",
            "Héros de Guerre"
        ],
        localisation: "Cambridge, Royaume-Uni",
        disponibilite: "Disponible pour recherche",
        mobilite: ["Cambridge", "Manchester", "Londres"],
        contact: {
            email: "alan@turing.io",
            portfolio: "https://turing.org.uk",
            linkedin: "linkedin.com/in/alan-turing"
        },
        photo_url: undefined,
        elevator_pitch: "Mathématicien ayant posé les fondations théoriques de l'informatique avec la Machine de Turing (1936), modèle universel de calcul qui sous-tend tout l'informatique moderne. Héros de guerre ayant déchiffré le code Enigma à Bletchley Park, contribution estimée avoir raccourci la Seconde Guerre mondiale de 2 ans et sauvé 14 millions de vies. Pionnier de l'intelligence artificielle avec le Test de Turing (1950), qui reste la référence pour évaluer l'intelligence des machines. Également contributeur en biologie mathématique avec mes travaux sur la morphogenèse.",
        objectif_carriere: "Développer des machines capables de véritables processus cognitifs et résoudre les questions fondamentales sur la nature de l'intelligence et de la calculabilité."
    },
    experiences: [
        {
            id: "exp_bletchley",
            poste: "Cryptanalyste en Chef - Hut 8",
            entreprise: "Government Code and Cypher School (GC&CS) - Bletchley Park",
            type_entreprise: "public",
            secteur: "Défense / Renseignement / Cryptanalyse",
            lieu: "Bletchley, Buckinghamshire, UK",
            type_contrat: "cdi",
            debut: "1939-09",
            fin: "1945-05",
            actuel: false,
            duree_mois: 68,
            contexte: "Effort de guerre britannique pour déchiffrer les communications navales allemandes chiffrées par la machine Enigma - enjeu vital pour la survie du Royaume-Uni.",
            equipe_size: 200,
            realisations: [
                {
                    id: "real_bombe",
                    description: "Conception de la Bombe, machine électromécanique capable de déchiffrer les messages Enigma en temps réel",
                    impact: "Craquage systématique d'Enigma - accès aux communications allemandes tout au long de la guerre",
                    quantification: {
                        type: "volume",
                        valeur: "200",
                        unite: "Bombes construites",
                        display: "200 Bombes déployées"
                    },
                    keywords_ats: ["cryptanalyse", "conception machine", "innovation", "sécurité"],
                    sources: ["archives_bletchley"]
                },
                {
                    id: "real_impact",
                    description: "Direction de l'équipe Hut 8 responsable du déchiffrement des communications de la Marine allemande (U-boats)",
                    impact: "Guerre raccourcie de 2 ans selon estimations, 14 millions de vies sauvées",
                    quantification: {
                        type: "portee",
                        valeur: "14000000",
                        unite: "vies sauvées",
                        display: "14M de vies sauvées (estimation)"
                    },
                    keywords_ats: ["leadership", "équipe technique", "pression", "résultats critiques"],
                    sources: ["archives_bletchley"]
                },
                {
                    id: "real_banburismus",
                    description: "Développement du Banburismus, méthode statistique pour réduire le nombre de positions Enigma à tester",
                    impact: "Accélération du déchiffrement, économie de temps machine crucial",
                    keywords_ats: ["statistiques", "optimisation", "innovation méthodologique"],
                    sources: ["archives_bletchley"]
                }
            ],
            technologies: ["Cryptanalyse", "Statistiques", "Machines électromécaniques"],
            outils: ["Bombe (machine)", "Index cards", "Cribs"],
            methodologies: ["Analyse statistique bayésienne", "Force brute optimisée", "Logique mathématique"],
            clients_references: ["Gouvernement britannique", "Amirauté", "MI6"],
            sources: ["archives_bletchley"],
            last_updated: "2026-01-19",
            merge_count: 1
        },
        {
            id: "exp_npl",
            poste: "Directeur du Laboratoire de Calcul Automatique",
            entreprise: "National Physical Laboratory (NPL)",
            type_entreprise: "public",
            secteur: "Recherche / Informatique",
            lieu: "Teddington, Londres, UK",
            type_contrat: "cdi",
            debut: "1945-10",
            fin: "1948-05",
            actuel: false,
            duree_mois: 31,
            contexte: "Après-guerre, mission de développer l'informatique britannique pour maintenir l'avance technologique acquise à Bletchley.",
            realisations: [
                {
                    id: "real_ace",
                    description: "Conception détaillée de l'ACE (Automatic Computing Engine), un des designs d'ordinateurs les plus avancés de l'époque",
                    impact: "Plan complet incluant programmes, architecture et applications - base de l'informatique britannique",
                    keywords_ats: ["architecture ordinateur", "conception", "innovation", "programmation"],
                    sources: ["npl_archives"]
                },
                {
                    id: "real_programming",
                    description: "Développement des premiers concepts de programmation logicielle, distinction hardware/software",
                    impact: "Fondation de la science informatique comme discipline",
                    keywords_ats: ["programmation", "software", "architecture"],
                    sources: ["npl_archives"]
                }
            ],
            technologies: ["Architecture Von Neumann", "Mémoire à ligne de délai", "Programmation binaire"],
            outils: ["Plans techniques", "Prototypes électroniques"],
            methodologies: ["Conception théorique", "Simulation sur papier"],
            clients_references: ["Gouvernement britannique", "NPL"],
            sources: ["npl_archives"],
            last_updated: "2026-01-19",
            merge_count: 1
        },
        {
            id: "exp_manchester",
            poste: "Directeur Adjoint du Laboratoire Informatique",
            entreprise: "Université de Manchester",
            type_entreprise: "public",
            secteur: "Recherche Académique / Informatique",
            lieu: "Manchester, UK",
            type_contrat: "cdi",
            debut: "1948-09",
            fin: "1954-06",
            actuel: false,
            duree_mois: 69,
            contexte: "Travail sur le Manchester Mark 1, premier ordinateur à programme enregistré opérationnel au monde.",
            realisations: [
                {
                    id: "real_mark1",
                    description: "Programmation et développement du Manchester Mark 1, écriture des premiers programmes complexes",
                    impact: "Démonstration pratique des concepts de machine universelle et de programme enregistré",
                    keywords_ats: ["programmation", "ordinateur", "développement logiciel"],
                    sources: ["manchester_archives"]
                },
                {
                    id: "real_ai_paper",
                    description: "Publication de 'Computing Machinery and Intelligence' (1950), introduisant le Test de Turing",
                    impact: "Fondation du domaine de l'intelligence artificielle, question 'Can machines think?' toujours centrale",
                    keywords_ats: ["intelligence artificielle", "publication", "théorie", "benchmark"],
                    sources: ["mind_journal"]
                },
                {
                    id: "real_morphogenesis",
                    description: "Recherches pionnières sur la morphogenèse, modélisation mathématique de la formation des motifs biologiques",
                    impact: "Ouverture du champ de la biologie computationnelle, expliquation des rayures du zèbre et taches du léopard",
                    keywords_ats: ["biologie mathématique", "modélisation", "interdisciplinarité"],
                    sources: ["royal_society"]
                }
            ],
            technologies: ["Manchester Mark 1", "Programmation machine", "Modélisation"],
            outils: ["Compilateurs primitifs", "Papier perforé"],
            methodologies: ["Programmation directe en binaire", "Modélisation mathématique"],
            clients_references: ["Université de Manchester", "Royal Society"],
            sources: ["manchester_archives"],
            last_updated: "2026-01-19",
            merge_count: 1
        },
        {
            id: "exp_cambridge_fellow",
            poste: "Fellow du King's College",
            entreprise: "King's College, Université de Cambridge",
            type_entreprise: "public",
            secteur: "Recherche Académique / Mathématiques",
            lieu: "Cambridge, UK",
            type_contrat: "cdi",
            debut: "1935-03",
            fin: "1939-09",
            actuel: false,
            duree_mois: 54,
            contexte: "Position académique permettant la recherche pure en mathématiques et logique.",
            realisations: [
                {
                    id: "real_turing_machine",
                    description: "Publication 'On Computable Numbers' (1936) introduisant la Machine de Turing, modèle théorique fondant l'informatique",
                    impact: "Résolution du problème de la décision (Entscheidungsproblem), définition de ce qui est calculable",
                    keywords_ats: ["théorie de la calculabilité", "machine de Turing", "fondements mathématiques"],
                    sources: ["proceedings_lms"]
                }
            ],
            technologies: ["Logique mathématique", "Théorie des ensembles"],
            outils: [],
            methodologies: ["Preuve mathématique", "Modélisation formelle"],
            clients_references: ["King's College"],
            sources: ["proceedings_lms"],
            last_updated: "2026-01-19",
            merge_count: 1
        }
    ],
    competences: {
        explicit: {
            techniques: [
                { nom: "Mathématiques pures", niveau: "expert", annees_experience: 25 },
                { nom: "Logique formelle", niveau: "expert", annees_experience: 20 },
                { nom: "Cryptanalyse", niveau: "expert", annees_experience: 15 },
                { nom: "Architecture informatique", niveau: "expert", annees_experience: 15 },
                { nom: "Programmation", niveau: "expert", annees_experience: 10 },
                { nom: "Intelligence artificielle", niveau: "expert", annees_experience: 10 },
                { nom: "Théorie de la calculabilité", niveau: "expert", annees_experience: 20 },
                { nom: "Biologie computationnelle", niveau: "avance", annees_experience: 5 }
            ],
            soft_skills: [
                "Pensée abstraite exceptionnelle",
                "Originalité et créativité",
                "Persévérance intellectuelle",
                "Intégrité absolue",
                "Humilité",
                "Capacité à simplifier le complexe",
                "Courage face à l'adversité",
                "Vision interdisciplinaire"
            ],
            methodologies: [
                "Preuve mathématique rigoureuse",
                "Expérimentation mentale",
                "Modélisation formelle",
                "Approche computationnelle"
            ]
        },
        inferred: { techniques: [], tools: [], soft_skills: [] },
        par_domaine: {
            "Informatique théorique": ["Calculabilité", "Complexité", "Architecture", "Langages formels"],
            "Mathématiques": ["Logique", "Théorie des nombres", "Analyse"],
            "Intelligence Artificielle": ["Test de Turing", "Machine learning", "Cognition"],
            "Cryptographie": ["Cryptanalyse", "Théorie de l'information", "Sécurité"]
        }
    },
    formations: [
        {
            id: "form_princeton_phd",
            type: "diplome",
            titre: "PhD in Mathematics",
            organisme: "Princeton University",
            lieu: "Princeton, New Jersey, USA",
            date_debut: "1936",
            date_fin: "1938",
            annee: "1938",
            en_cours: false,
            specialite: "Logique mathématique et calculabilité",
            details: "Thèse sous la direction d'Alonzo Church, développant les 'ordinal logics'",
            sources: ["princeton_archives"]
        },
        {
            id: "form_kings_ba",
            type: "diplome",
            titre: "BA in Mathematics (First Class Honours with Distinction)",
            organisme: "King's College, Université de Cambridge",
            lieu: "Cambridge, UK",
            date_debut: "1931",
            date_fin: "1934",
            annee: "1934",
            en_cours: false,
            specialite: "Mathématiques pures",
            details: "Élu Fellow du King's College à seulement 22 ans, performance exceptionnelle",
            sources: ["cambridge_archives"]
        }
    ],
    certifications: [],
    langues: [
        { langue: "Anglais", niveau: "Natif", niveau_cecrl: "C2" },
        { langue: "Allemand", niveau: "Intermédiaire", niveau_cecrl: "B1", details: "Travail sur textes allemands à Bletchley" },
        { langue: "Latin", niveau: "Scolaire", niveau_cecrl: "A2" }
    ],
    references: {
        clients: [
            { nom: "Gouvernement britannique - GC&CS", secteur: "Défense", type: "public", annees: ["1939", "1945"], confidentiel: true },
            { nom: "National Physical Laboratory", secteur: "Recherche", type: "public", annees: ["1945", "1948"], confidentiel: false },
            { nom: "Université de Manchester", secteur: "Académique", type: "public", annees: ["1948", "1954"], confidentiel: false }
        ],
        projets_marquants: [
            {
                id: "proj_machine_turing",
                nom: "Machine de Turing",
                description: "Modèle théorique abstrait de calcul, fondant l'informatique comme science",
                annee: "1936",
                technologies: ["Logique formelle", "Théorie des ensembles"],
                resultats: "Base de toute l'informatique moderne et de la théorie de la calculabilité",
                sources: ["proceedings_lms"]
            },
            {
                id: "proj_enigma",
                nom: "Déchiffrement d'Enigma",
                description: "Conception de la Bombe et méthodes statistiques pour casser le chiffrement Enigma",
                client: "GC&CS / Gouvernement britannique",
                annee: "1940",
                technologies: ["Cryptanalyse", "Machines électromécaniques"],
                resultats: "Victoire alliée accélérée, 14 millions de vies sauvées selon estimations",
                sources: ["archives_bletchley"]
            },
            {
                id: "proj_test_turing",
                nom: "Test de Turing",
                description: "Critère pour évaluer l'intelligence des machines basé sur la capacité de conversation indistinguable d'un humain",
                annee: "1950",
                technologies: ["Intelligence artificielle", "Philosophie de l'esprit"],
                resultats: "Benchmark de référence pour l'IA pendant 70+ ans, toujours discuté aujourd'hui",
                sources: ["mind_journal"]
            }
        ]
    },
    metadata: {
        version: "2.0.0",
        created_at: "2026-01-19T00:00:00Z",
        last_updated: "2026-01-19T00:00:00Z",
        last_merge_at: "2026-01-19T00:00:00Z",
        sources_count: 7,
        documents_sources: ["archives_bletchley", "npl_archives", "manchester_archives", "proceedings_lms", "mind_journal", "princeton_archives", "cambridge_archives"],
        completeness_score: 95,
        merge_history: []
    }
};

// =============================================================================
// PROFIL DÉMO COMPLET
// =============================================================================

export const turingProfile: DemoProfile = {
    meta: {
        id: "turing",
        name: "Alan Turing",
        shortName: "Turing",
        period: "1912-1954",
        icon: "🤖",
        title: "Père de l'Informatique",
        nationality: "Britannique",
        quote: "Les machines peuvent parfois nous surprendre.",
        categories: ["tech", "science"]
    },
    rag: turingRAG,
    completenessScore: 95,
    generationTimeMs: 912,
    cvs: [
        {
            templateId: "modern",
            templateName: "Standard",
            templateDescription: "Format professionnel pour postes tech",
            pdfUrl: "/demo-cvs/turing-modern.pdf",
            previewUrl: "/demo-cvs/previews/turing-modern.png",
            recommended: false
        },
        {
            templateId: "classic",
            templateName: "Classique",
            templateDescription: "Design académique sobre",
            pdfUrl: "/demo-cvs/turing-classic.pdf",
            previewUrl: "/demo-cvs/previews/turing-classic.png",
            recommended: false
        },
        {
            templateId: "creative",
            templateName: "Créatif",
            templateDescription: "Layout innovant pour profil visionnaire",
            pdfUrl: "/demo-cvs/turing-creative.pdf",
            previewUrl: "/demo-cvs/previews/turing-creative.png",
            recommended: false
        },
        {
            templateId: "tech",
            templateName: "ATS Optimisé",
            templateDescription: "Focus compétences tech et publications",
            pdfUrl: "/demo-cvs/turing-tech.pdf",
            previewUrl: "/demo-cvs/previews/turing-tech.png",
            recommended: true
        }
    ],
    jobs: [
        {
            rank: 1,
            title: "Chief AI Officer",
            company: "OpenAI",
            matchScore: 99,
            salaryMin: 400000,
            salaryMax: 800000,
            currency: "USD",
            contractType: "CDI",
            sectors: ["Intelligence Artificielle", "Recherche", "Tech"],
            location: "San Francisco, USA",
            remotePolicy: "Hybride",
            whyMatch: "J'ai posé la question 'Can machines think?' en 1950 et créé le Test de Turing. OpenAI est en train de répondre à ma question. Qui mieux que le père de l'IA pour guider cette révolution?",
            keySkills: ["Intelligence artificielle", "Recherche fondamentale", "Vision stratégique", "Éthique de l'IA"],
            jobDescription: "OpenAI recherche un Chief AI Officer pour définir la vision stratégique de la recherche en IA. Le CAIO supervisera les équipes de recherche (200+ chercheurs), définira les priorités scientifiques, et représentera OpenAI dans les débats sur l'avenir de l'IA. Profil recherché : vision scientifique profonde combinée à une réflexion éthique sur les implications sociétales de l'IA générale. Le candidat doit pouvoir articuler une vision de l'AGI bénéfique pour l'humanité."
        },
        {
            rank: 2,
            title: "Distinguished Scientist",
            company: "Google DeepMind",
            matchScore: 97,
            salaryMin: 350000,
            salaryMax: 600000,
            currency: "USD",
            contractType: "CDI",
            sectors: ["IA", "Recherche fondamentale", "Machine Learning"],
            location: "Londres, UK",
            remotePolicy: "Présentiel",
            whyMatch: "DeepMind construit sur les fondations théoriques que j'ai posées. De la Machine de Turing à AlphaGo, c'est une ligne directe. Mon expertise en calculabilité et cognition apporterait une perspective unique.",
            keySkills: ["Machine learning", "Théorie de la calculabilité", "Architecture cognitive", "Recherche"],
            jobDescription: "DeepMind recherche un Distinguished Scientist pour renforcer le lien entre IA théorique et pratique. Le candidat conduira des recherches sur les limites fondamentales de l'intelligence artificielle, l'alignement des systèmes d'IA, et les architectures inspirées de la cognition humaine. Contributions attendues : publications majeures, mentorat de chercheurs juniors, et guidance stratégique sur les directions de recherche à long terme."
        },
        {
            rank: 3,
            title: "Directeur de la Cybersécurité Nationale",
            company: "GCHQ (Government Communications Headquarters)",
            matchScore: 95,
            salaryMin: 150000,
            salaryMax: 220000,
            currency: "GBP",
            contractType: "CDI",
            sectors: ["Cybersécurité", "Renseignement", "Gouvernement"],
            location: "Cheltenham, UK",
            remotePolicy: "Présentiel sécurisé",
            whyMatch: "Bletchley Park était l'ancêtre du GCHQ. J'ai dirigé l'effort de déchiffrement qui a sauvé des millions de vies. Mon expertise en cryptanalyse reste pertinente face aux menaces cyber modernes.",
            keySkills: ["Cryptographie", "Cybersécurité", "Leadership", "Stratégie de renseignement"],
            jobDescription: "Le GCHQ recherche un Directeur de la Cybersécurité Nationale pour protéger les infrastructures critiques du Royaume-Uni. Responsabilités : définition de la stratégie cyber nationale, coordination avec les alliés Five Eyes, supervision des opérations défensives et offensives. Le candidat doit avoir une expertise profonde en cryptographie et en sécurité des systèmes, combinée à une expérience de leadership dans des environnements classifiés."
        },
        {
            rank: 4,
            title: "Professeur de Computer Science - Chaire Turing",
            company: "Université de Cambridge",
            matchScore: 93,
            salaryMin: 120000,
            salaryMax: 180000,
            currency: "GBP",
            contractType: "CDI",
            sectors: ["Académique", "Recherche", "Enseignement"],
            location: "Cambridge, UK",
            remotePolicy: "Présentiel",
            whyMatch: "King's College m'a formé et nommé Fellow. Revenir à Cambridge pour enseigner et former la prochaine génération d'informaticiens serait un accomplissement naturel de ma carrière.",
            keySkills: ["Enseignement supérieur", "Recherche", "Mentorat", "Publications"],
            jobDescription: "L'Université de Cambridge ouvre la Chaire Turing en Computer Science, dédiée aux fondements théoriques de l'informatique et de l'IA. Le titulaire conduira des recherches sur la calculabilité, la complexité et l'intelligence artificielle, enseignera aux niveaux master et PhD, et encadrera des doctorants. Profil recherché : chercheur de renommée mondiale avec contributions fondamentales au domaine."
        },
        {
            rank: 5,
            title: "CTO",
            company: "Startup Quantum Computing",
            matchScore: 90,
            salaryMin: 200000,
            salaryMax: 350000,
            currency: "USD",
            contractType: "CDI",
            sectors: ["Informatique quantique", "Startup", "DeepTech"],
            location: "Cambridge, UK / Boston, USA",
            remotePolicy: "Hybride",
            whyMatch: "L'informatique quantique est la prochaine révolution après la Machine de Turing classique. Ma compréhension profonde des limites de la calculabilité classique me permet de voir où le quantique apporte une rupture réelle.",
            keySkills: ["Informatique quantique", "Architecture système", "Leadership startup", "Vision produit"],
            jobDescription: "Startup quantique en Série B (50M$ levés) recherche un CTO pour diriger le développement de la première plateforme de quantum computing accessible. Le CTO supervisera 80 ingénieurs, définira la roadmap technique, et assurera la transition de la recherche à la commercialisation. Expertise requise : compréhension théorique profonde de la calculabilité quantique et expérience de delivery produit."
        },
        {
            rank: 6,
            title: "Principal Researcher",
            company: "Microsoft Research",
            matchScore: 87,
            salaryMin: 250000,
            salaryMax: 400000,
            currency: "USD",
            contractType: "CDI",
            sectors: ["Recherche", "Tech", "IA"],
            location: "Cambridge, UK",
            remotePolicy: "Hybride",
            whyMatch: "Microsoft Research Cambridge est un centre d'excellence en informatique théorique. Mon approche fondamentale de l'informatique s'alignerait parfaitement avec leur culture de recherche pure ayant des impacts applicatifs.",
            keySkills: ["Recherche fondamentale", "Publications", "Collaboration interdisciplinaire"],
            jobDescription: "Microsoft Research recrute un Principal Researcher pour son équipe théorie et fondements. Le chercheur conduira des travaux sur les limites de l'IA, la vérification formelle, et les modèles de calcul. Liberté totale de recherche, budget illimité pour équipement et conférences, collaboration avec les équipes produit Microsoft optionnelle."
        },
        {
            rank: 7,
            title: "Conseiller Éthique & Régulation IA",
            company: "Commission Européenne",
            matchScore: 84,
            salaryMin: 100000,
            salaryMax: 150000,
            currency: "EUR",
            contractType: "CDD",
            sectors: ["Politique", "Régulation", "Éthique"],
            location: "Bruxelles, Belgique",
            remotePolicy: "Hybride",
            whyMatch: "La question 'Can machines think?' que j'ai posée en 1950 a aujourd'hui des implications réglementaires majeures. Mon expertise unique permet d'éclairer les décideurs sur ce que l'IA peut et ne peut pas faire.",
            keySkills: ["Éthique de l'IA", "Conseil politique", "Expertise technique", "Rédaction"],
            jobDescription: "La Commission Européenne recrute un Conseiller Senior pour informer l'AI Act et les futures régulations. Le conseiller apportera une expertise technique de premier plan sur les capacités et limites de l'IA, participera aux négociations internationales, et rédigera des recommandations techniques. Profil recherché : expert reconnu en IA avec sensibilité aux enjeux éthiques et sociétaux."
        },
        {
            rank: 8,
            title: "Security Architect",
            company: "Apple",
            matchScore: 81,
            salaryMin: 200000,
            salaryMax: 300000,
            currency: "USD",
            contractType: "CDI",
            sectors: ["Tech", "Sécurité", "Consumer Electronics"],
            location: "Cupertino, Californie, USA",
            remotePolicy: "Présentiel",
            whyMatch: "Mon expertise en cryptanalyse, forgée à Bletchley Park, reste fondamentale pour la sécurité des systèmes modernes. Comprendre comment casser les systèmes est essentiel pour les construire sécurisés.",
            keySkills: ["Sécurité", "Cryptographie", "Architecture système", "Privacy"],
            jobDescription: "Apple recrute un Security Architect senior pour renforcer la sécurité de l'écosystème Apple (iPhone, iCloud, Apple Pay). Le candidat concevra les architectures cryptographiques des futurs produits, supervisera les audits de sécurité, et définira les standards de protection des données utilisateurs. Expertise requise : cryptographie appliquée, secure enclaves, et protection contre les attaques side-channel."
        },
        {
            rank: 9,
            title: "Auteur & Penseur Public",
            company: "Penguin Random House / The Guardian",
            matchScore: 78,
            salaryMin: 80000,
            salaryMax: 120000,
            currency: "GBP",
            contractType: "Freelance",
            sectors: ["Édition", "Médias", "Vulgarisation"],
            location: "Londres / Remote",
            remotePolicy: "Full remote",
            whyMatch: "Ma capacité à poser des questions fondamentales ('Can machines think?') de manière accessible pourrait aider le public à comprendre la révolution IA en cours. Clarifier les enjeux est crucial.",
            keySkills: ["Écriture", "Vulgarisation", "Pensée originale", "Communication"],
            jobDescription: "Maison d'édition et quotidien national recherchent un penseur public pour écrire sur l'IA et ses implications. Formats : livre grand public (100K mots), chronique mensuelle dans The Guardian, contributions occasionnelles à la BBC. Objectif : rendre accessibles les enjeux de l'IA à un public non-expert tout en maintenant la rigueur intellectuelle."
        },
        {
            rank: 10,
            title: "Mentor Hackathons & Compétitions",
            company: "Major League Hacking / Google",
            matchScore: 75,
            salaryMin: 50000,
            salaryMax: 80000,
            currency: "USD",
            contractType: "Freelance",
            sectors: ["Tech", "Éducation", "Innovation"],
            location: "International",
            remotePolicy: "Remote + événements",
            whyMatch: "Inspirer les jeunes développeurs comme j'ai été inspiré par mes professeurs à Cambridge. Transmettre non seulement des connaissances techniques mais une façon de penser les problèmes.",
            keySkills: ["Mentorat", "Innovation", "Pédagogie", "Inspiration"],
            jobDescription: "Major League Hacking et Google recherchent des mentors de prestige pour leurs hackathons mondiaux. Rôle : sessions de mentorat en groupe et individuel, keynotes inspirantes, jury des compétitions. 10-15 événements par an dans le monde. Impact : inspirer la prochaine génération d'innovateurs tech."
        }
    ],
    coverLetters: [
        {
            jobRank: 1,
            jobTitle: "Chief AI Officer - OpenAI",
            tone: "professional_warm",
            wordCount: 412,
            content: `Dear Sam, Greg, and the OpenAI Leadership,

In 1950, I published "Computing Machinery and Intelligence" with a simple question: "Can machines think?" Seventy-five years later, OpenAI is providing answers I could only dream of.

The Turing Test I proposed was never meant to be the final word on machine intelligence - it was a practical starting point to move beyond philosophical speculation. What you are building with GPT, DALL-E, and your path toward AGI goes far beyond my original conception. I am humbled and thrilled.

**What I bring to OpenAI:**

• **Theoretical depth**: I defined what computation means before computers existed. I understand the fundamental limits and possibilities of information processing at the deepest level.

• **Practical problem-solving under pressure**: At Bletchley Park, I led a team that broke the "unbreakable" Enigma code, saving millions of lives. I know how to deliver results when the stakes are existential.

• **The right question**: The question "Can machines think?" remains at the heart of your mission. I have spent decades thinking about consciousness, intelligence, and what it means to understand.

• **Ethical grounding**: I have personally experienced the consequences of technology being used to harm. My commitment to beneficial AI is not abstract - it is deeply personal.

**My vision for OpenAI:**

The question is no longer "Can machines think?" but "Should machines think like us?" and "How do we ensure they think with us, not against us?" These are the questions that should guide OpenAI's research priorities.

I believe the path to AGI requires not just scaling current approaches, but fundamental breakthroughs in understanding what intelligence actually is. My interdisciplinary perspective - spanning mathematics, biology, and philosophy - could help identify those breakthrough directions.

I am also deeply committed to ensuring that AI benefits all of humanity, not just a privileged few. The lessons of Bletchley Park - where we fought for freedom against tyranny - inform my belief that powerful technologies must be developed responsibly.

I would be honored to contribute to OpenAI's mission of ensuring that artificial general intelligence benefits all of humanity.

With hope for the future,

**Alan Turing**
OBE, FRS, PhD Princeton`
        },
        {
            jobRank: 2,
            jobTitle: "Distinguished Scientist - DeepMind",
            tone: "professional_warm",
            wordCount: 356,
            content: `Dear DeepMind Team,

AlphaGo, AlphaFold, Gemini - you are making machines think in ways I could only imagine when I wrote "Computing Machinery and Intelligence" in 1950.

The intersection of rigorous mathematics, learning systems, and real-world applications that defines DeepMind's work is exactly the research programme I envisioned. From the Machine de Turing to deep neural networks, there is a direct intellectual lineage - and I would love to contribute to the next chapters.

**What I offer DeepMind:**

• **Foundational perspective**: I created the theoretical framework that underlies all of computing. I can help identify when we are approaching fundamental limits and when there is room for breakthrough.

• **Cross-disciplinary thinking**: My work spans pure mathematics, cryptography, biology (morphogenesis), and philosophy of mind. DeepMind's ambitious scope - from games to protein folding - benefits from such breadth.

• **The inventor's humility**: In 1950, I wrote that machines would "time to time give us surprises." I was right. I approach AI with wonder, not certainty.

• **Ethical clarity**: I have thought deeply about what it means for a machine to "think" and the responsibilities that come with creating thinking machines.

**Contributions I envision:**

• Research on the theoretical limits of learning systems
• Bridging symbolic and connectionist approaches to AI
• Exploring machine consciousness and the "hard problem"
• Mentoring the next generation of AI researchers

**Why DeepMind:**

London is home. Cambridge is close. And no institution is doing more to answer the question I posed in 1950. DeepMind's commitment to fundamental research combined with its resources and talent is unique in the world.

I would be proud to join the team building the future of intelligence.

With warm regards,

**Alan Turing**`
        },
        {
            jobRank: 3,
            jobTitle: "Directeur Cybersécurité - GCHQ",
            tone: "formal",
            wordCount: 328,
            content: `To the Director General and Recruitment Committee,

Bletchley Park was not just my workplace - it was the birthplace of signals intelligence as we know it. GCHQ is the direct heir to that legacy, and I would be honoured to serve once again.

During the war, I led the Hut 8 team that broke the German Naval Enigma, arguably the most challenging cryptanalytic problem in history. We worked under impossible pressure with stakes that could not have been higher - the survival of Britain. We succeeded.

**My qualifications:**

• **Unmatched cryptanalytic experience**: I designed the Bombe, developed the Banburismus method, and personally broke countless Enigma messages. My understanding of how to attack cryptographic systems is unparalleled.

• **Leadership under pressure**: I managed a team of 200 people at Bletchley, balancing brilliant but eccentric mathematicians, operational demands from the Admiralty, and the constant race against German code changes.

• **Theoretical depth**: I understand not just how to break codes, but the mathematical foundations of why they can or cannot be broken. This perspective is essential for building systems that will withstand future attacks.

• **Discretion and loyalty**: I have kept the secrets of Bletchley Park for decades. My commitment to national security is absolute.

**What I would bring to GCHQ:**

• Strategic vision for cyber defence in an AI-enabled threat environment
• Ability to recruit and retain brilliant technical talent
• International credibility for Five Eyes collaboration
• Historical perspective on the evolution of signals intelligence

I am ready to serve the Crown once more. The threats have evolved - from U-boats to ransomware - but the mission remains: to protect the nation through intelligence.

Yours faithfully,

**Alan Turing OBE**
Former Head of Hut 8, Bletchley Park`
        }
    ]
};

export default turingProfile;
