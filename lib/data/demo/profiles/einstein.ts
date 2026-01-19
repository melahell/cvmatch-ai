/**
 * Profil Démo : Albert Einstein
 * 
 * Physicien théoricien, Prix Nobel, père de la relativité.
 * 1879-1955
 */

import { DemoProfile } from "../types";
import { RAGComplete } from "@/types/rag-complete";

// =============================================================================
// PROFIL RAG
// =============================================================================

const einsteinRAG: RAGComplete = {
    profil: {
        nom: "Einstein",
        prenom: "Albert",
        titre_principal: "Physicien Théoricien - Prix Nobel de Physique",
        titres_alternatifs: [
            "Père de la Relativité",
            "Professeur de Physique Théorique",
            "Directeur de l'Institut Kaiser Wilhelm",
            "Membre de l'Institute for Advanced Study"
        ],
        localisation: "Princeton, New Jersey, USA",
        disponibilite: "Sur projet de recherche",
        mobilite: ["Princeton", "Zurich", "Berlin", "International"],
        contact: {
            email: "albert@einstein.science",
            portfolio: "https://ias.edu/einstein",
            linkedin: "linkedin.com/in/albert-einstein"
        },
        photo_url: undefined,
        elevator_pitch: "Physicien théoricien ayant révolutionné notre compréhension de l'univers avec la théorie de la relativité restreinte (1905) et générale (1915). Prix Nobel de Physique 1921 pour l'explication de l'effet photoélectrique, fondement de la mécanique quantique. Auteur de l'équation la plus célèbre de l'histoire E=mc², qui a ouvert l'ère nucléaire. Maître des 'Gedankenexperimente' (expériences de pensée), je possède une capacité unique à visualiser et conceptualiser des phénomènes physiques inaccessibles à l'expérimentation directe. Humaniste engagé pour la paix et les droits civiques.",
        objectif_carriere: "Poursuivre la quête d'une théorie du champ unifié réconciliant gravitation et électromagnétisme, tout en promouvant une utilisation pacifique et éthique des découvertes scientifiques."
    },
    experiences: [
        {
            id: "exp_princeton",
            poste: "Professeur de Physique Théorique",
            entreprise: "Institute for Advanced Study",
            type_entreprise: "public",
            secteur: "Recherche Académique / Physique Théorique",
            lieu: "Princeton, New Jersey, USA",
            type_contrat: "cdi",
            debut: "1933-10",
            fin: "1955-04",
            actuel: false,
            duree_mois: 259,
            contexte: "Exil aux États-Unis suite à la montée du nazisme en Allemagne. L'IAS offre un sanctuaire intellectuel sans obligations d'enseignement pour poursuivre la recherche pure.",
            realisations: [
                {
                    id: "real_unified",
                    description: "Recherche intensive sur la théorie du champ unifié, tentant de réconcilier gravitation et électromagnétisme dans un cadre mathématique cohérent",
                    impact: "Travaux fondateurs pour les théories de grande unification et la physique des cordes développées ultérieurement",
                    keywords_ats: ["physique théorique", "recherche fondamentale", "innovation conceptuelle"],
                    sources: ["ias_archives"]
                },
                {
                    id: "real_epr",
                    description: "Publication du paradoxe EPR (Einstein-Podolsky-Rosen) remettant en question l'interprétation de Copenhague de la mécanique quantique",
                    impact: "Débat fondamental avec Bohr, base des recherches sur l'intrication quantique (Prix Nobel 2022)",
                    keywords_ats: ["mécanique quantique", "fondements physique", "débat scientifique"],
                    sources: ["ias_archives"]
                },
                {
                    id: "real_mentoring",
                    description: "Mentorat de nombreux jeunes physiciens et collaboration avec des scientifiques du monde entier",
                    impact: "Formation informelle d'une génération de physiciens théoriciens américains",
                    keywords_ats: ["mentorat", "collaboration", "transmission"],
                    sources: ["ias_archives"]
                }
            ],
            technologies: ["Calcul tensoriel", "Géométrie différentielle", "Théorie des groupes"],
            outils: ["Tableau noir", "Papier et crayon", "Bibliothèque scientifique"],
            methodologies: ["Gedankenexperiment", "Déduction mathématique rigoureuse", "Principe de symétrie"],
            clients_references: ["Institute for Advanced Study", "Université de Princeton"],
            sources: ["ias_archives"],
            last_updated: "2026-01-19",
            merge_count: 1
        },
        {
            id: "exp_berlin",
            poste: "Directeur de l'Institut de Physique Kaiser Wilhelm",
            entreprise: "Académie Prussienne des Sciences",
            type_entreprise: "public",
            secteur: "Recherche Académique / Direction scientifique",
            lieu: "Berlin, Allemagne",
            type_contrat: "cdi",
            debut: "1914-04",
            fin: "1933-03",
            actuel: false,
            duree_mois: 227,
            contexte: "Poste de prestige créé spécialement pour Einstein, sans obligations d'enseignement, financé par l'industrie allemande.",
            equipe_size: 25,
            realisations: [
                {
                    id: "real_relativite_generale",
                    description: "Finalisation et publication de la théorie de la relativité générale, nouvelle théorie de la gravitation remplaçant Newton",
                    impact: "Révolution conceptuelle : l'espace-temps est courbé par la masse. Prédiction des trous noirs et ondes gravitationnelles (confirmées en 2015)",
                    quantification: {
                        type: "portee",
                        valeur: "1915",
                        unite: "publication",
                        display: "Théorie publiée en 1915"
                    },
                    keywords_ats: ["relativité générale", "gravitation", "espace-temps", "innovation"],
                    sources: ["publications_einstein"]
                },
                {
                    id: "real_cosmologie",
                    description: "Application de la relativité à la cosmologie, introduction de la constante cosmologique",
                    impact: "Naissance de la cosmologie moderne, modèle d'univers en expansion (confirmé par Hubble 1929)",
                    keywords_ats: ["cosmologie", "univers", "constante cosmologique"],
                    sources: ["publications_einstein"]
                },
                {
                    id: "real_bose_einstein",
                    description: "Développement de la statistique de Bose-Einstein avec Satyendra Nath Bose, prédisant un nouvel état de la matière",
                    impact: "Prédiction des condensats de Bose-Einstein (réalisés en 1995, Prix Nobel 2001)",
                    keywords_ats: ["mécanique quantique", "statistique", "prédiction"],
                    sources: ["publications_einstein"]
                }
            ],
            technologies: ["Tenseurs de Ricci", "Géométrie riemannienne", "Équations aux dérivées partielles"],
            outils: [],
            methodologies: ["Principe d'équivalence", "Covariance générale", "Gedankenexperiment"],
            clients_references: ["Académie Prussienne des Sciences", "Kaiser Wilhelm Gesellschaft"],
            sources: ["publications_einstein"],
            last_updated: "2026-01-19",
            merge_count: 1
        },
        {
            id: "exp_brevet",
            poste: "Expert Technique de 3ème Classe",
            entreprise: "Office Fédéral de la Propriété Intellectuelle",
            type_entreprise: "public",
            secteur: "Propriété Intellectuelle / Brevets",
            lieu: "Berne, Suisse",
            type_contrat: "cdi",
            debut: "1902-06",
            fin: "1909-10",
            actuel: false,
            duree_mois: 89,
            contexte: "Emploi alimentaire tout en poursuivant des recherches personnelles en physique théorique. Le travail 'routinier' laisse du temps pour la réflexion scientifique.",
            realisations: [
                {
                    id: "real_annus",
                    description: "Publication de 4 articles révolutionnaires en 1905 (Annus Mirabilis) tout en occupant ce poste",
                    impact: "Relativité restreinte (E=mc²), effet photoélectrique (Nobel 1921), mouvement brownien, équivalence masse-énergie",
                    quantification: {
                        type: "volume",
                        valeur: "4",
                        unite: "articles",
                        display: "4 articles révolutionnaires en 1 an"
                    },
                    keywords_ats: ["publications", "innovation", "physique", "productivité exceptionnelle"],
                    sources: ["nobel_archives"]
                },
                {
                    id: "real_brevets",
                    description: "Évaluation de brevets techniques, développant une expertise en analyse critique d'innovations",
                    impact: "Acquisition d'une rigueur dans l'évaluation des idées et la détection des failles logiques",
                    keywords_ats: ["analyse critique", "propriété intellectuelle", "évaluation technique"],
                    sources: ["office_brevets"]
                }
            ],
            technologies: ["Électromagnétisme", "Thermodynamique", "Mécanique"],
            outils: [],
            methodologies: ["Analyse critique", "Évaluation technique", "Rédaction de rapports"],
            clients_references: ["Confédération Suisse"],
            sources: ["office_brevets"],
            last_updated: "2026-01-19",
            merge_count: 1
        },
        {
            id: "exp_zurich",
            poste: "Professeur de Physique Théorique",
            entreprise: "ETH Zurich",
            type_entreprise: "public",
            secteur: "Enseignement Supérieur / Recherche",
            lieu: "Zurich, Suisse",
            type_contrat: "cdi",
            debut: "1912-01",
            fin: "1914-03",
            actuel: false,
            duree_mois: 27,
            contexte: "Première chaire de physique théorique à l'ETH, institution où Einstein avait été étudiant.",
            realisations: [
                {
                    id: "real_cours_eth",
                    description: "Enseignement de la physique théorique et développement des bases mathématiques de la relativité générale",
                    impact: "Formation de futurs physiciens de renom, collaboration avec Marcel Grossmann sur le formalisme tensoriel",
                    keywords_ats: ["enseignement", "relativité", "mathématiques", "collaboration"],
                    sources: ["eth_archives"]
                }
            ],
            technologies: ["Calcul tensoriel", "Géométrie différentielle"],
            outils: [],
            methodologies: [],
            clients_references: ["ETH Zurich"],
            sources: ["eth_archives"],
            last_updated: "2026-01-19",
            merge_count: 1
        }
    ],
    competences: {
        explicit: {
            techniques: [
                { nom: "Physique théorique", niveau: "expert", annees_experience: 50 },
                { nom: "Mathématiques avancées", niveau: "expert", annees_experience: 50 },
                { nom: "Relativité restreinte et générale", niveau: "expert", annees_experience: 50 },
                { nom: "Mécanique quantique", niveau: "expert", annees_experience: 40 },
                { nom: "Électrodynamique", niveau: "expert", annees_experience: 50 },
                { nom: "Thermodynamique statistique", niveau: "expert", annees_experience: 45 },
                { nom: "Cosmologie théorique", niveau: "expert", annees_experience: 35 },
                { nom: "Analyse de brevets", niveau: "avance", annees_experience: 7 }
            ],
            soft_skills: [
                "Pensée abstraite exceptionnelle",
                "Imagination scientifique",
                "Persévérance face aux échecs",
                "Indépendance intellectuelle",
                "Humilité et curiosité",
                "Humour et sens de la formule",
                "Engagement éthique",
                "Capacité de vulgarisation"
            ],
            methodologies: [
                "Gedankenexperiment (expériences de pensée)",
                "Principes de symétrie et d'invariance",
                "Déduction mathématique rigoureuse",
                "Unification conceptuelle"
            ]
        },
        inferred: { techniques: [], tools: [], soft_skills: [] },
        par_domaine: {
            "Physique théorique": ["Relativité", "Mécanique quantique", "Électrodynamique", "Gravitation"],
            "Mathématiques": ["Tenseurs", "Géométrie différentielle", "Équations différentielles"],
            "Philosophie des sciences": ["Épistémologie", "Réalisme scientifique", "Déterminisme"]
        }
    },
    formations: [
        {
            id: "form_eth",
            type: "diplome",
            titre: "Diplôme d'enseignement en Physique et Mathématiques",
            organisme: "École Polytechnique Fédérale (ETH) Zurich",
            lieu: "Zurich, Suisse",
            date_debut: "1896",
            date_fin: "1900",
            annee: "1900",
            en_cours: false,
            specialite: "Physique théorique et mathématiques",
            details: "Formation rigoureuse en physique et mathématiques. Rencontre avec sa future collaboratrice et épouse Mileva Marić. Réputation d'étudiant brillant mais indiscipliné.",
            sources: ["eth_archives"]
        },
        {
            id: "form_doctorat",
            type: "diplome",
            titre: "Doctorat en Physique",
            organisme: "Université de Zurich",
            lieu: "Zurich, Suisse",
            date_debut: "1903",
            date_fin: "1905",
            annee: "1905",
            en_cours: false,
            specialite: "Nouvelle détermination des dimensions moléculaires",
            details: "Thèse soutenue la même année que la publication des 4 articles de l'Annus Mirabilis",
            sources: ["uni_zurich_archives"]
        }
    ],
    certifications: [],
    langues: [
        { langue: "Allemand", niveau: "Natif", niveau_cecrl: "C2" },
        { langue: "Anglais", niveau: "Courant", niveau_cecrl: "C1", details: "Langue de travail à Princeton" },
        { langue: "Français", niveau: "Intermédiaire", niveau_cecrl: "B1", details: "Conférences en français" },
        { langue: "Italien", niveau: "Intermédiaire", niveau_cecrl: "B1", details: "Jeunesse à Milan" }
    ],
    references: {
        clients: [
            { nom: "Comité Nobel", secteur: "Prix scientifiques", type: "international", annees: ["1921"], confidentiel: false },
            { nom: "Académie Prussienne des Sciences", secteur: "Recherche", type: "public", annees: ["1914", "1933"], confidentiel: false },
            { nom: "Institute for Advanced Study", secteur: "Recherche", type: "public", annees: ["1933", "1955"], confidentiel: false }
        ],
        projets_marquants: [
            {
                id: "proj_relativite",
                nom: "Théorie de la Relativité Générale",
                description: "Nouvelle théorie de la gravitation remplaçant la mécanique newtonienne, décrivant la gravitation comme courbure de l'espace-temps",
                client: "Académie Prussienne des Sciences",
                annee: "1915",
                technologies: ["Calcul tensoriel", "Géométrie riemannienne"],
                resultats: "Révolution conceptuelle majeure, prédiction des trous noirs et ondes gravitationnelles confirmées 100 ans plus tard",
                sources: ["publications_einstein"]
            },
            {
                id: "proj_nobel",
                nom: "Prix Nobel de Physique 1921",
                description: "Explication théorique de l'effet photoélectrique introduisant le concept de quantum de lumière (photon)",
                client: "Académie Royale des Sciences de Suède",
                annee: "1921",
                technologies: ["Mécanique quantique", "Électrodynamique"],
                resultats: "Fondement de la mécanique quantique, base de toute l'électronique moderne",
                sources: ["nobel_archives"]
            },
            {
                id: "proj_manhattan_letter",
                nom: "Lettre à Roosevelt sur la bombe atomique",
                description: "Co-signature de la lettre alertant le président américain sur la possibilité d'une bombe atomique allemande",
                annee: "1939",
                technologies: [],
                resultats: "Déclenchement du Projet Manhattan (qu'Einstein regretta profondément par la suite)",
                sources: ["archives_fdr"]
            }
        ]
    },
    metadata: {
        version: "2.0.0",
        created_at: "2026-01-19T00:00:00Z",
        last_updated: "2026-01-19T00:00:00Z",
        last_merge_at: "2026-01-19T00:00:00Z",
        sources_count: 6,
        documents_sources: ["ias_archives", "publications_einstein", "nobel_archives", "eth_archives", "office_brevets", "uni_zurich_archives"],
        completeness_score: 94,
        merge_history: []
    }
};

// =============================================================================
// PROFIL DÉMO COMPLET
// =============================================================================

export const einsteinProfile: DemoProfile = {
    meta: {
        id: "einstein",
        name: "Albert Einstein",
        shortName: "Einstein",
        period: "1879-1955",
        icon: "🧠",
        title: "Physicien Théoricien",
        nationality: "Allemagne / Suisse / USA",
        quote: "L'imagination est plus importante que le savoir.",
        categories: ["science"]
    },
    rag: einsteinRAG,
    completenessScore: 94,
    generationTimeMs: 867,
    cvs: [
        {
            templateId: "modern",
            templateName: "Standard",
            templateDescription: "Format professionnel classique, idéal pour postes académiques",
            pdfUrl: "/demo-cvs/einstein-modern.pdf",
            previewUrl: "/demo-cvs/previews/einstein-modern.png",
            recommended: true
        },
        {
            templateId: "classic",
            templateName: "Classique",
            templateDescription: "Design sobre adapté aux institutions prestigieuses",
            pdfUrl: "/demo-cvs/einstein-classic.pdf",
            previewUrl: "/demo-cvs/previews/einstein-classic.png",
            recommended: false
        },
        {
            templateId: "creative",
            templateName: "Créatif",
            templateDescription: "Layout original pour secteur innovation",
            pdfUrl: "/demo-cvs/einstein-creative.pdf",
            previewUrl: "/demo-cvs/previews/einstein-creative.png",
            recommended: false
        },
        {
            templateId: "tech",
            templateName: "ATS Optimisé",
            templateDescription: "Focus compétences techniques et publications",
            pdfUrl: "/demo-cvs/einstein-tech.pdf",
            previewUrl: "/demo-cvs/previews/einstein-tech.png",
            recommended: true
        }
    ],
    jobs: [
        {
            rank: 1,
            title: "Chief Scientist",
            company: "CERN",
            matchScore: 98,
            salaryMin: 150000,
            salaryMax: 220000,
            currency: "EUR",
            contractType: "CDI",
            sectors: ["Recherche", "Physique des particules", "International"],
            location: "Genève, Suisse",
            remotePolicy: "Présentiel avec missions",
            whyMatch: "Expertise inégalée en physique fondamentale + vision stratégique long terme. L'auteur de la relativité à la tête du plus grand laboratoire de physique du monde : une évidence historique.",
            keySkills: ["Physique théorique", "Direction scientifique", "Vision stratégique", "Rayonnement international"],
            jobDescription: "Le CERN recherche un Chief Scientist pour définir la stratégie scientifique à 20 ans du laboratoire. Le candidat supervisera les programmes de recherche du LHC et des futurs accélérateurs, coordonnera les collaborations internationales regroupant 10 000 physiciens, et représentera le CERN auprès des gouvernements et agences de financement. Profil requis : scientifique de stature mondiale avec vision stratégique et capacité à fédérer la communauté internationale de physique des hautes énergies."
        },
        {
            rank: 2,
            title: "Professeur de Physique Théorique - Chaire Lucasienne",
            company: "Université de Cambridge",
            matchScore: 96,
            salaryMin: 180000,
            salaryMax: 250000,
            currency: "GBP",
            contractType: "CDI",
            sectors: ["Académique", "Recherche fondamentale"],
            location: "Cambridge, UK",
            remotePolicy: "Présentiel",
            whyMatch: "La chaire occupée par Newton et Hawking mérite un successeur de même envergure. Excellence théorique + capacité pédagogique + rayonnement mondial.",
            keySkills: ["Physique théorique", "Enseignement d'excellence", "Recherche", "Mentorat"],
            jobDescription: "L'Université de Cambridge ouvre la prestigieuse Chaire Lucasienne de Mathématiques, occupée précédemment par Isaac Newton et Stephen Hawking. Le titulaire conduira des recherches à la frontière de la physique théorique, encadrera des doctorants, et donnera des cours de niveau master/PhD. Le candidat devra justifier d'un rayonnement scientifique exceptionnel et d'une capacité à inspirer les nouvelles générations."
        },
        {
            rank: 3,
            title: "Conseiller Scientifique Senior",
            company: "SpaceX / NASA",
            matchScore: 93,
            salaryMin: 200000,
            salaryMax: 300000,
            currency: "USD",
            contractType: "Freelance",
            sectors: ["Spatial", "Aéronautique", "Innovation"],
            location: "Los Angeles / Houston",
            remotePolicy: "Hybride",
            whyMatch: "La relativité est indispensable à la navigation spatiale précise (GPS, trajectoires interplanétaires). Expertise unique pour résoudre les défis physiques de l'exploration spatiale.",
            keySkills: ["Relativité générale", "Navigation spatiale", "Conseil stratégique", "Innovation"],
            jobDescription: "SpaceX et NASA recherchent conjointement un conseiller scientifique senior pour leurs missions interplanétaires. Missions : validation des calculs de trajectoires tenant compte des effets relativistes, conseil sur la physique des voyages interstellaires, et participation à la définition des futures missions d'exploration. Le candidat idéal combine expertise en relativité générale et capacité à dialoguer avec les ingénieurs."
        },
        {
            rank: 4,
            title: "Fellow",
            company: "Google X (Moonshot Factory)",
            matchScore: 90,
            salaryMin: 250000,
            salaryMax: 400000,
            currency: "USD",
            contractType: "CDI",
            sectors: ["Tech", "R&D", "Moonshots"],
            location: "Mountain View, CA",
            remotePolicy: "Hybride",
            whyMatch: "Pensée disruptive + capacité à imaginer l'impossible + expérience de révolutions conceptuelles. Profil idéal pour identifier les prochaines ruptures technologiques fondamentales.",
            keySkills: ["Innovation radicale", "Vision long terme", "Connexion science-technologie", "Prospective"],
            jobDescription: "Google X recherche un Fellow Scientist pour son équipe Moonshots. Rôle : identifier les opportunités de ruptures technologiques basées sur des avancées en physique fondamentale, mentor des équipes d'ingénieurs sur les possibilités physiques, et représenter X dans la communauté scientifique. Nous recherchons un penseur capable de 'voir autour des coins' et d'imaginer des applications de la physique encore inconnues."
        },
        {
            rank: 5,
            title: "Directeur de la Recherche",
            company: "ITER (Fusion nucléaire)",
            matchScore: 87,
            salaryMin: 140000,
            salaryMax: 200000,
            currency: "EUR",
            contractType: "CDI",
            sectors: ["Énergie", "Fusion", "International"],
            location: "Cadarache, France",
            remotePolicy: "Présentiel",
            whyMatch: "E=mc² est le fondement de l'énergie nucléaire. Expertise en physique des plasmas et thermodynamique statistique pertinente pour la fusion contrôlée.",
            keySkills: ["Physique nucléaire", "Direction R&D", "Collaboration internationale", "Gestion de projet"],
            jobDescription: "ITER, le plus grand projet de fusion nucléaire au monde, recherche un Directeur de la Recherche pour superviser les aspects scientifiques du tokamak. Responsabilités : validation des paramètres physiques du plasma, coordination des équipes scientifiques (35 pays), interface avec les laboratoires partenaires. Le candidat devra combiner excellence scientifique et capacités managériales dans un environnement multiculturel."
        },
        {
            rank: 6,
            title: "Expert IA Quantique Senior",
            company: "IBM Quantum",
            matchScore: 84,
            salaryMin: 160000,
            salaryMax: 230000,
            currency: "USD",
            contractType: "CDI",
            sectors: ["Informatique quantique", "R&D", "Tech"],
            location: "Zurich, Suisse",
            remotePolicy: "Hybride",
            whyMatch: "Co-fondateur de la mécanique quantique (effet photoélectrique, statistique Bose-Einstein). Compréhension profonde des fondements théoriques du calcul quantique.",
            keySkills: ["Mécanique quantique", "Fondements théoriques", "Innovation", "Conseil expert"],
            jobDescription: "IBM Quantum recherche un expert senior pour renforcer le lien entre physique fondamentale et applications quantiques pratiques. Missions : conseil sur les algorithmes quantiques exploitant les effets d'intrication, recherche sur la correction d'erreurs quantiques, et représentation d'IBM dans les conférences scientifiques. Profil recherché : physicien avec contributions majeures en mécanique quantique."
        },
        {
            rank: 7,
            title: "Présentateur & Vulgarisateur Scientifique",
            company: "Netflix / BBC",
            matchScore: 81,
            salaryMin: 100000,
            salaryMax: 150000,
            currency: "USD",
            contractType: "Freelance",
            sectors: ["Média", "Documentaires", "Vulgarisation"],
            location: "Los Angeles / Londres",
            remotePolicy: "Production en studio + terrain",
            whyMatch: "Charisme légendaire + capacité exceptionnelle à vulgariser des concepts complexes + image iconique. Parfait pour rendre la physique accessible au grand public.",
            keySkills: ["Communication scientifique", "Présence médiatique", "Pédagogie", "Storytelling"],
            jobDescription: "Netflix et BBC coproduisent une série documentaire sur l'univers et la physique moderne. Nous recherchons un présentateur scientifique de premier plan capable d'expliquer les concepts les plus complexes (trous noirs, relativité, mécanique quantique) de manière accessible et captivante. 8 épisodes, tournage sur 2 ans dans des lieux emblématiques de l'histoire des sciences."
        },
        {
            rank: 8,
            title: "Conseiller Éthique Science & Technologie",
            company: "ONU / UNESCO",
            matchScore: 78,
            salaryMin: 90000,
            salaryMax: 130000,
            currency: "USD",
            contractType: "CDD",
            sectors: ["International", "Éthique", "Politique scientifique"],
            location: "New York / Genève",
            remotePolicy: "Hybride + missions",
            whyMatch: "Engagement pacifiste légendaire + expérience du dilemme éthique (lettre sur la bombe atomique). Voix morale essentielle sur l'utilisation responsable de la science.",
            keySkills: ["Éthique scientifique", "Diplomatie", "Conseil politique", "Désarmement"],
            jobDescription: "L'ONU crée un poste de Conseiller Éthique Senior pour les questions science-technologie. Missions : conseil au Secrétaire Général sur les implications éthiques des nouvelles technologies (IA, armes autonomes, ingénierie génétique), rédaction de recommandations, et représentation de l'ONU dans les forums internationaux. Recherchons une figure morale reconnue avec expertise scientifique."
        },
        {
            rank: 9,
            title: "Auteur & Philosophe des Sciences",
            company: "Penguin Random House",
            matchScore: 75,
            salaryMin: 60000,
            salaryMax: 100000,
            currency: "USD",
            contractType: "Freelance",
            sectors: ["Édition", "Philosophie", "Vulgarisation"],
            location: "Remote",
            remotePolicy: "Full remote",
            whyMatch: "Clarté d'expression légendaire + profondeur philosophique + notoriété mondiale. Potentiel de bestseller garanti sur tout sujet abordé.",
            keySkills: ["Écriture", "Philosophie des sciences", "Vulgarisation", "Réflexion épistémologique"],
            jobDescription: "Maison d'édition internationale recherche un auteur scientifique pour une série d'ouvrages grand public sur les grandes questions de la physique et de la philosophie des sciences. Thèmes potentiels : nature du temps, réalité quantique, limites de la connaissance. Avance de 500K$ + royalties. Potentiel bestseller international."
        },
        {
            rank: 10,
            title: "Mentor Startup DeepTech & Scientifique",
            company: "Y Combinator / Station F",
            matchScore: 72,
            salaryMin: 50000,
            salaryMax: 80000,
            currency: "USD",
            contractType: "Freelance",
            sectors: ["Startup", "DeepTech", "Mentorat"],
            location: "San Francisco / Paris",
            remotePolicy: "Remote + événements",
            whyMatch: "Expérience unique de révolutions scientifiques + sagesse sur le long chemin de l'innovation. Mentor inspirant pour entrepreneurs scientifiques.",
            keySkills: ["Mentorat", "Innovation", "Évaluation scientifique", "Inspiration"],
            jobDescription: "Incubateurs de startups recherchent des mentors scientifiques de premier plan pour accompagner les startups deeptech (fusion, quantum, spatial). Engagement : 2-4 heures par semaine, participation à des jurys, sessions de mentoring individuelles. Objectif : aider les founders à naviguer les défis techniques et à maintenir la rigueur scientifique tout en innovant."
        }
    ],
    coverLetters: [
        {
            jobRank: 1,
            jobTitle: "Chief Scientist - CERN",
            tone: "formal",
            wordCount: 398,
            content: `Madame la Directrice Générale,
Mesdames et Messieurs les Membres du Conseil,

C'est avec un profond respect pour la mission du CERN que je soumets ma candidature au poste de Chief Scientist.

Le CERN incarne ce que la physique peut accomplir lorsque les nations collaborent au service de la connaissance. Vos découvertes - du boson de Higgs aux premières observations d'antimatière - perpétuent la tradition de révolutions conceptuelles que ma génération a initiée.

**Ce que j'apporte au CERN :**

• **Vision scientifique pionnière** : Auteur de la relativité restreinte et générale, j'ai démontré ma capacité à repenser les fondements mêmes de la physique. Le CERN a besoin d'une vision aussi audacieuse pour définir ses priorités post-LHC.

• **Expérience de direction scientifique** : Direction de l'Institut Kaiser Wilhelm pendant 19 ans, avec une équipe de 25 chercheurs. Compréhension des défis organisationnels de la grande science.

• **Rayonnement international** : Collaborations avec les physiciens du monde entier, de Bohr à Heisenberg en passant par Bose. Capacité à fédérer une communauté scientifique diverse.

• **Perspective historique** : Ayant moi-même vécu des révolutions conceptuelles, je sais que les plus grandes découvertes surviennent souvent là où on ne les attendait pas. Cette humilité doit guider la stratégie du CERN.

**Ma vision pour le CERN :**

Les prochaines décennies seront cruciales pour la physique fondamentale. Le modèle standard, aussi élégant soit-il, ne peut être le fin mot de l'histoire. La matière noire, l'énergie sombre, la réconciliation de la gravitation et de la mécanique quantique : ces questions attendent des réponses que seul un laboratoire comme le CERN peut apporter.

Je propose de renforcer le dialogue entre physique théorique et expérimentale, d'investir dans des approches non conventionnelles, et de maintenir le CERN comme le phare intellectuel de la physique mondiale.

Je suis convaincu que mon expérience unique - de l'office des brevets de Berne à Princeton - m'a préparé à comprendre à la fois la rigueur institutionnelle nécessaire et la liberté créative indispensable à la découverte.

Je me tiens à votre disposition pour un entretien.

Veuillez agréer, Madame la Directrice Générale, l'expression de ma haute considération.

**Albert Einstein**
Prix Nobel de Physique 1921`
        },
        {
            jobRank: 2,
            jobTitle: "Chaire Lucasienne - Cambridge",
            tone: "professional_warm",
            wordCount: 342,
            content: `Cher Comité de recrutement,

La Chaire Lucasienne de Mathématiques représente le summum de l'excellence scientifique. Occupée par Newton, qui a formulé les lois que j'ai eu l'honneur de compléter avec la relativité générale, elle incarne la tradition de révolution conceptuelle à laquelle j'ai consacré ma vie.

**Pourquoi Cambridge :**

Cambridge est le berceau de la physique moderne. Cavendish, Maxwell, Thomson, Rutherford, Dirac... La tradition d'excellence de cette université est incomparable. Y enseigner serait un honneur et une responsabilité que je prendrais avec le plus grand sérieux.

**Ce que j'apporterais :**

• **Enseignement inspiré** : Ma philosophie pédagogique repose sur les Gedankenexperimente - les expériences de pensée. Les étudiants doivent d'abord imaginer avant de calculer. "Si tu ne peux pas l'expliquer simplement, tu ne le comprends pas assez bien."

• **Recherche active** : Même à mon âge, je continue de chercher la théorie du champ unifié. Les étudiants travailleraient sur des questions ouvertes, pas sur des problèmes résolus.

• **Mentorat individuel** : Chaque étudiant a son propre chemin vers la compréhension. Je prendrais le temps de les accompagner, comme mes propres maîtres l'ont fait pour moi.

• **Rayonnement international** : Ma présence attirerait les meilleurs étudiants du monde entier à Cambridge.

**Ma vision pour la Chaire :**

La physique du XXIe siècle devra réconcilier la mécanique quantique et la gravitation. Les étudiants formés à Cambridge seront ceux qui résoudront ce puzzle. Je veux leur donner les outils conceptuels et l'audace intellectuelle nécessaires.

Je serais honoré de succéder à Newton dans cette chaire prestigieuse, et de contribuer à former la prochaine génération de révolutionnaires de la physique.

Avec mes salutations respectueuses,

**Albert Einstein**`
        },
        {
            jobRank: 3,
            jobTitle: "Conseiller Scientifique - SpaceX/NASA",
            tone: "professional_warm",
            wordCount: 312,
            content: `Dear SpaceX and NASA Leadership,

Without relativity, your GPS satellites would drift by 10 kilometers per day, and your Martian trajectories would miss their targets by thousands of miles. I am pleased to offer my expertise to help humanity reach the stars.

**Why This Partnership:**

Space exploration is the natural extension of theoretical physics. The questions we ask in our equations - about time, gravity, and the structure of spacetime - become practical engineering problems when you launch a rocket to Mars or beyond.

**What I Offer:**

• **Deep understanding of relativistic effects** : From time dilation to gravitational redshift, I literally wrote the equations you use every day.

• **Ability to simplify complex physics** : I can help your engineers understand not just *how* to use the equations, but *why* they work. This understanding prevents errors and inspires innovation.

• **Fresh perspective on "impossible" problems** : When people told me that Newton was the final word on gravity, I proved them wrong. Perhaps some of your "impossible" challenges just need a new way of thinking.

• **Historical perspective** : Having lived through the transition from horses to rockets in one lifetime, I understand how rapidly the impossible becomes routine.

**My Vision:**

Humanity belongs among the stars. Every child who looks up at the night sky deserves to dream that someday, they might travel there. SpaceX and NASA are making that dream real, and I want to help.

Let's explore the cosmos together. As I once said, "The most beautiful thing we can experience is the mysterious. It is the source of all true art and science."

Looking forward to our collaboration,

**Albert Einstein**`
        }
    ]
};

export default einsteinProfile;
