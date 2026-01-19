/**
 * Profil Démo : Léonard de Vinci
 * 
 * Artiste, scientifique et inventeur italien de la Renaissance.
 * 1452-1519
 */

import { DemoProfile } from "../types";
import { RAGComplete } from "@/types/rag-complete";

// =============================================================================
// PROFIL RAG
// =============================================================================

const davinciRAG: RAGComplete = {
    profil: {
        nom: "da Vinci",
        prenom: "Leonardo",
        titre_principal: "Artiste, Ingénieur & Inventeur Polyvalent",
        titres_alternatifs: [
            "Peintre de la Renaissance",
            "Sculpteur",
            "Architecte",
            "Ingénieur militaire",
            "Anatomiste",
            "Génie Universel"
        ],
        localisation: "Florence / Milan, Italie",
        disponibilite: "Disponible pour commissions",
        mobilite: ["Florence", "Milan", "Rome", "France"],
        contact: {
            email: "leonardo@vinci.art",
            portfolio: "https://uffizi.it/leonardo"
        },
        photo_url: undefined,
        elevator_pitch: "Polymathe exceptionnel maîtrisant aussi bien les arts que les sciences et l'ingénierie. Créateur de chefs-d'œuvre immortels comme La Joconde et La Cène, mais aussi inventeur prolifique ayant conçu des machines volantes, sous-marins, chars d'assaut et robots avec des siècles d'avance. Mon approche unique combine observation rigoureuse de la nature, expérimentation scientifique et expression artistique. Plus de 7000 pages de notes et croquis documentant des innovations qui continuent d'inspirer ingénieurs et artistes aujourd'hui.",
        objectif_carriere: "Comprendre et représenter le monde dans toute sa complexité, en fusionnant art et science pour repousser les limites de l'imagination humaine."
    },
    experiences: [
        {
            id: "exp_sforza",
            poste: "Ingénieur & Artiste de Cour",
            entreprise: "Cour de Ludovic Sforza, Duc de Milan",
            type_entreprise: "public",
            secteur: "Cour Ducale / Arts & Ingénierie",
            lieu: "Milan, Italie",
            type_contrat: "cdi",
            debut: "1482-01",
            fin: "1499-12",
            actuel: false,
            duree_mois: 216,
            contexte: "Service du duc de Milan comme ingénieur militaire, architecte et artiste de cour. Période la plus productive de ma carrière avec une liberté créative exceptionnelle.",
            budget_gere: "Équivalent 10M€ en commissions",
            realisations: [
                {
                    id: "real_cene",
                    description: "Création de La Cène, fresque monumentale de 8,8m x 4,6m au couvent Santa Maria delle Grazie, révolutionnant la composition narrative",
                    impact: "Chef-d'œuvre inscrit au patrimoine UNESCO, référence mondiale de l'art occidental, 1M visiteurs/an",
                    quantification: {
                        type: "portee",
                        valeur: "1000000",
                        unite: "visiteurs annuels",
                        display: "1M visiteurs/an"
                    },
                    keywords_ats: ["art monumental", "fresque", "patrimoine", "composition"],
                    sources: ["unesco"]
                },
                {
                    id: "real_machines",
                    description: "Conception de dizaines de machines de guerre innovantes : chars d'assaut, arbalètes géantes, ponts mobiles, systèmes de défense",
                    impact: "Inventions documentées dans les codex, certaines réalisées des siècles plus tard",
                    keywords_ats: ["ingénierie militaire", "innovation", "conception mécanique"],
                    sources: ["codex_atlanticus"]
                },
                {
                    id: "real_hydraulique",
                    description: "Conception de systèmes d'irrigation et de canaux pour la Lombardie, études hydrauliques pionnières",
                    impact: "Fondements de l'ingénierie hydraulique moderne",
                    keywords_ats: ["hydraulique", "infrastructure", "ingénierie civile"],
                    sources: ["codex_atlanticus"]
                }
            ],
            technologies: ["Peinture à l'huile", "Sfumato", "Ingénierie mécanique", "Hydraulique"],
            outils: ["Pinceaux", "Compas", "Règles", "Instruments de mesure"],
            methodologies: ["Observation de la nature", "Dissection", "Expérimentation"],
            clients_references: ["Ludovic Sforza", "Santa Maria delle Grazie"],
            sources: ["codex_atlanticus", "unesco"],
            last_updated: "2026-01-19",
            merge_count: 1
        },
        {
            id: "exp_florence",
            poste: "Artiste Indépendant",
            entreprise: "Atelier à Florence",
            type_entreprise: "startup",
            secteur: "Arts / Peinture",
            lieu: "Florence, Italie",
            type_contrat: "freelance",
            debut: "1500-01",
            fin: "1506-12",
            actuel: false,
            duree_mois: 84,
            contexte: "Retour à Florence après la chute des Sforza, période de création artistique intense et de recherches anatomiques.",
            realisations: [
                {
                    id: "real_joconde",
                    description: "Création de La Joconde (Mona Lisa), portrait révolutionnant l'art du portrait avec sfumato, perspective atmosphérique et sourire énigmatique",
                    impact: "Tableau le plus célèbre au monde, 10M visiteurs/an au Louvre, icône culturelle universelle",
                    quantification: {
                        type: "portee",
                        valeur: "10000000",
                        unite: "visiteurs annuels",
                        display: "10M visiteurs/an au Louvre"
                    },
                    keywords_ats: ["portrait", "technique picturale", "chef-d'œuvre", "sfumato"],
                    sources: ["louvre"]
                },
                {
                    id: "real_anatomie",
                    description: "Dissection de plus de 30 corps humains et création de 240 planches anatomiques d'une précision inégalée",
                    impact: "Avancées majeures dans la compréhension de l'anatomie humaine, précédant Vésale de 25 ans",
                    quantification: {
                        type: "volume",
                        valeur: "240",
                        unite: "planches anatomiques",
                        display: "240 planches anatomiques"
                    },
                    keywords_ats: ["anatomie", "dessin scientifique", "recherche médicale"],
                    sources: ["royal_collection"]
                }
            ],
            technologies: ["Peinture à l'huile", "Sfumato", "Dissection anatomique"],
            outils: ["Scalpels", "Instruments de mesure"],
            methodologies: ["Observation directe", "Documentation exhaustive"],
            clients_references: ["Francesco del Giocondo", "Académie florentine"],
            sources: ["louvre", "royal_collection"],
            last_updated: "2026-01-19",
            merge_count: 1
        },
        {
            id: "exp_verrocchio",
            poste: "Apprenti puis Compagnon",
            entreprise: "Atelier d'Andrea del Verrocchio",
            type_entreprise: "pme",
            secteur: "Arts / Formation",
            lieu: "Florence, Italie",
            type_contrat: "mission",
            debut: "1466-01",
            fin: "1478-12",
            actuel: false,
            duree_mois: 156,
            contexte: "Apprentissage dans l'un des ateliers les plus prestigieux de Florence, formation complète aux techniques artistiques.",
            realisations: [
                {
                    id: "real_bapteme",
                    description: "Collaboration sur Le Baptême du Christ, peignant l'ange de gauche qui surpasse le travail du maître",
                    impact: "Selon Vasari, Verrocchio arrêta de peindre après avoir vu le talent de son élève",
                    keywords_ats: ["collaboration", "excellence", "dépassement"],
                    sources: ["vasari"]
                }
            ],
            technologies: ["Peinture", "Sculpture", "Orfèvrerie", "Dessin"],
            outils: [],
            methodologies: ["Apprentissage par imitation", "Progression par la pratique"],
            clients_references: ["Andrea del Verrocchio"],
            sources: ["vasari"],
            last_updated: "2026-01-19",
            merge_count: 1
        },
        {
            id: "exp_france",
            poste: "Premier Peintre, Ingénieur et Architecte du Roi",
            entreprise: "Cour de François Ier",
            type_entreprise: "public",
            secteur: "Cour Royale",
            lieu: "Amboise, France",
            type_contrat: "cdi",
            debut: "1516-01",
            fin: "1519-05",
            actuel: false,
            duree_mois: 40,
            contexte: "Invitation du roi François Ier à résider au Château du Clos Lucé avec pension généreuse et liberté totale.",
            budget_gere: "Pension royale + budget illimité",
            realisations: [
                {
                    id: "real_romorantin",
                    description: "Conception du projet urbain de Romorantin : ville idéale avec système hydraulique révolutionnaire",
                    impact: "Plan visionnaire d'urbanisme anticipant les concepts modernes de ville durable",
                    keywords_ats: ["urbanisme", "architecture", "vision"],
                    sources: ["archives_france"]
                }
            ],
            technologies: ["Architecture", "Urbanisme", "Hydraulique"],
            outils: [],
            methodologies: ["Conception holistique", "Intégration nature-architecture"],
            clients_references: ["François Ier de France"],
            sources: ["archives_france"],
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
                { nom: "Architecture", niveau: "expert", annees_experience: 35 },
                { nom: "Sculpture", niveau: "avance", annees_experience: 25 },
                { nom: "Hydraulique", niveau: "expert", annees_experience: 30 },
                { nom: "Optique", niveau: "avance", annees_experience: 25 },
                { nom: "Anatomie humaine", niveau: "expert", annees_experience: 30 }
            ],
            soft_skills: [
                "Curiosité insatiable",
                "Pensée systémique",
                "Observation minutieuse",
                "Créativité illimitée",
                "Perfectionnisme",
                "Patience (Joconde : 4 ans)",
                "Polyvalence exceptionnelle",
                "Capacité de synthèse"
            ],
            methodologies: [
                "Observation directe de la nature",
                "Expérimentation systématique",
                "Documentation exhaustive par croquis",
                "Approche interdisciplinaire"
            ]
        },
        inferred: { techniques: [], tools: [], soft_skills: [] },
        par_domaine: {
            "Art": ["Peinture", "Dessin", "Sculpture", "Sfumato", "Perspective"],
            "Science": ["Anatomie", "Optique", "Botanique", "Géologie"],
            "Ingénierie": ["Mécanique", "Hydraulique", "Aéronautique", "Architecture"]
        }
    },
    formations: [
        {
            id: "form_verrocchio",
            type: "formation",
            titre: "Apprentissage complet - Atelier Verrocchio",
            organisme: "Andrea del Verrocchio",
            lieu: "Florence, Italie",
            date_debut: "1466",
            date_fin: "1472",
            annee: "1466-1472",
            en_cours: false,
            specialite: "Peinture, sculpture, orfèvrerie, mécanique",
            details: "Formation dans l'un des ateliers les plus complets de la Renaissance, incluant théorie et pratique de tous les arts",
            sources: ["vasari"]
        }
    ],
    certifications: [],
    langues: [
        { langue: "Italien", niveau: "Natif", niveau_cecrl: "C2" },
        { langue: "Latin", niveau: "Courant", niveau_cecrl: "B2", details: "Langue scientifique de l'époque" },
        { langue: "Français", niveau: "Intermédiaire", niveau_cecrl: "B1", details: "Séjour à la cour de François Ier" }
    ],
    references: {
        clients: [
            { nom: "Ludovic Sforza", secteur: "Aristocratie", type: "grand_compte", annees: ["1482", "1499"], confidentiel: false },
            { nom: "François Ier de France", secteur: "Royauté", type: "grand_compte", annees: ["1516", "1519"], confidentiel: false },
            { nom: "César Borgia", secteur: "Militaire", type: "grand_compte", annees: ["1502", "1503"], confidentiel: false }
        ],
        projets_marquants: [
            {
                id: "proj_joconde",
                nom: "La Joconde (Mona Lisa)",
                description: "Portrait de Lisa Gherardini, épouse d'un marchand florentin, devenu l'œuvre d'art la plus célèbre au monde",
                client: "Francesco del Giocondo",
                annee: "1503-1519",
                technologies: ["Sfumato", "Perspective atmosphérique", "Huile sur bois"],
                resultats: "Œuvre la plus visitée au monde (10M/an), estimée à 800M$",
                sources: ["louvre"]
            },
            {
                id: "proj_cene",
                nom: "La Cène",
                description: "Fresque monumentale représentant le dernier repas du Christ avec ses apôtres",
                client: "Santa Maria delle Grazie",
                annee: "1495-1498",
                technologies: ["Tempera sur gesso", "Perspective centrale", "Innovation narrative"],
                resultats: "Chef-d'œuvre UNESCO, référence de l'art occidental",
                sources: ["unesco"]
            }
        ]
    },
    metadata: {
        version: "2.0.0",
        created_at: "2026-01-19T00:00:00Z",
        last_updated: "2026-01-19T00:00:00Z",
        last_merge_at: "2026-01-19T00:00:00Z",
        sources_count: 6,
        documents_sources: ["vasari", "codex_atlanticus", "louvre", "unesco", "royal_collection", "archives_france"],
        completeness_score: 95,
        merge_history: []
    }
};

// =============================================================================
// PROFIL DÉMO COMPLET
// =============================================================================

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
    completenessScore: 95,
    generationTimeMs: 891,
    cvs: [
        {
            templateId: "modern",
            templateName: "Standard",
            templateDescription: "Format professionnel polyvalent",
            pdfUrl: "/demo-cvs/davinci-modern.pdf",
            previewUrl: "/demo-cvs/previews/davinci-modern.png",
            recommended: false
        },
        {
            templateId: "classic",
            templateName: "Classique",
            templateDescription: "Design sobre et élégant",
            pdfUrl: "/demo-cvs/davinci-classic.pdf",
            previewUrl: "/demo-cvs/previews/davinci-classic.png",
            recommended: false
        },
        {
            templateId: "creative",
            templateName: "Créatif",
            templateDescription: "Layout artistique et innovant",
            pdfUrl: "/demo-cvs/davinci-creative.pdf",
            previewUrl: "/demo-cvs/previews/davinci-creative.png",
            recommended: true
        },
        {
            templateId: "tech",
            templateName: "ATS Optimisé",
            templateDescription: "Focus compétences techniques et ingénierie",
            pdfUrl: "/demo-cvs/davinci-tech.pdf",
            previewUrl: "/demo-cvs/previews/davinci-tech.png",
            recommended: false
        }
    ],
    jobs: [
        {
            rank: 1,
            title: "Chief Design Officer",
            company: "Apple",
            matchScore: 96,
            salaryMin: 250000,
            salaryMax: 400000,
            currency: "USD",
            contractType: "CDI",
            sectors: ["Tech", "Design", "Innovation"],
            location: "Cupertino, Californie, USA",
            remotePolicy: "Présentiel",
            whyMatch: "Apple incarne ma philosophie : la fusion parfaite de l'art et de la technologie, où la beauté et la fonction sont inséparables. 'La simplicité est la sophistication suprême' - j'ai dit cela il y a 500 ans, Apple le vit chaque jour.",
            keySkills: ["Design produit", "Innovation", "Vision holistique", "Excellence artisanale"],
            jobDescription: "Apple recherche un Chief Design Officer pour succéder à une lignée de designers légendaires. Le CDO dirigera Apple Design (500+ designers), définira l'évolution visuelle et fonctionnelle de tous les produits Apple, et incarnera la philosophie design de l'entreprise. Profil recherché : polymathe combinant sensibilité artistique exceptionnelle, compréhension profonde des matériaux et technologies, et capacité à créer des objets qui transforment la vie quotidienne."
        },
        {
            rank: 2,
            title: "Directeur Artistique",
            company: "Musée du Louvre",
            matchScore: 94,
            salaryMin: 90000,
            salaryMax: 130000,
            currency: "EUR",
            contractType: "CDI",
            sectors: ["Musées", "Art", "Culture"],
            location: "Paris, France",
            remotePolicy: "Présentiel",
            whyMatch: "Le Louvre abrite La Joconde, mon œuvre la plus célèbre. Qui mieux que son créateur peut guider la vision artistique du plus grand musée du monde? Je connais intimement l'intention derrière chaque coup de pinceau.",
            keySkills: ["Direction artistique", "Conservation", "Vision curatoriale", "Communication"],
            jobDescription: "Le Musée du Louvre recherche un Directeur Artistique pour superviser les collections, définir la programmation des expositions temporaires, et positionner le Louvre au cœur de l'innovation muséale. Le candidat combinera expertise artistique inégalée, compréhension des enjeux contemporains de l'art, et capacité à toucher un public de 10 millions de visiteurs annuels."
        },
        {
            rank: 3,
            title: "Lead Concept Artist",
            company: "Naughty Dog (Sony)",
            matchScore: 91,
            salaryMin: 120000,
            salaryMax: 180000,
            currency: "USD",
            contractType: "CDI",
            sectors: ["Jeux vidéo", "Entertainment", "Design"],
            location: "Santa Monica, Californie, USA",
            remotePolicy: "Hybride",
            whyMatch: "Mes carnets de croquis contiennent des milliers de créatures, machines et paysages imaginaires. Ma maîtrise de l'anatomie et ma créativité sans limites sont exactement ce qu'il faut pour créer des univers de jeu immersifs.",
            keySkills: ["Concept art", "Character design", "Worldbuilding", "Anatomie"],
            jobDescription: "Naughty Dog recrute un Lead Concept Artist pour ses prochains jeux AAA. Le candidat définira l'identité visuelle des personnages, environnements et créatures, en combinant réalisme anatomique et imagination débridée. Responsabilités : direction d'une équipe de 20 artistes, création de clés visuelles, collaboration avec game designers et narrative team."
        },
        {
            rank: 4,
            title: "Ingénieur R&D Senior",
            company: "Boston Dynamics",
            matchScore: 88,
            salaryMin: 150000,
            salaryMax: 220000,
            currency: "USD",
            contractType: "CDI",
            sectors: ["Robotique", "Innovation", "Ingénierie"],
            location: "Waltham, Massachusetts, USA",
            remotePolicy: "Présentiel",
            whyMatch: "J'ai conçu le premier robot humanoïde de l'histoire (le Chevalier Mécanique) en 1495. Boston Dynamics construit ce que j'imaginais il y a 500 ans. Ma compréhension de la biomécanique et mon approche inventive seraient précieuses.",
            keySkills: ["Mécanique", "Robotique", "Biomécanique", "Innovation"],
            jobDescription: "Boston Dynamics recherche un ingénieur senior pour son équipe robots humanoïdes. Responsabilités : conception de mécanismes inspirés de la biologie, prototypage rapide, amélioration de la locomotion et de la préhension. Profil recherché : expertise en mécanique avec pensée créative, capacité à imaginer des solutions nouvelles aux problèmes de mobilité robotique."
        },
        {
            rank: 5,
            title: "Architecte Visionnaire",
            company: "BIG (Bjarke Ingels Group)",
            matchScore: 86,
            salaryMin: 100000,
            salaryMax: 160000,
            currency: "EUR",
            contractType: "Freelance",
            sectors: ["Architecture", "Design urbain", "Innovation"],
            location: "Copenhague / Dubai",
            remotePolicy: "Hybride",
            whyMatch: "Mes projets urbains de la Renaissance - ville idéale de Romorantin, cités sur plusieurs niveaux - anticipaient l'urbanisme moderne. BIG partage ma vision d'architecture audacieuse intégrant art, nature et fonction.",
            keySkills: ["Architecture", "Design urbain", "Vision intégrée", "Innovation"],
            jobDescription: "BIG recrute un architecte visionnaire pour ses projets les plus ambitieux : villes flottantes, habitats martiens, gratte-ciels écologiques. Le candidat apportera une perspective historique et une créativité sans limites pour repenser l'habitat humain. Expertise requise : architecture + ingénierie + vision artistique holistique."
        },
        {
            rank: 6,
            title: "Consultant Innovation Senior",
            company: "McKinsey & Company",
            matchScore: 83,
            salaryMin: 180000,
            salaryMax: 280000,
            currency: "USD",
            contractType: "CDI",
            sectors: ["Conseil", "Innovation", "Stratégie"],
            location: "Paris / New York",
            remotePolicy: "Hybride",
            whyMatch: "Ma pensée systémique et ma capacité à connecter des domaines différents (art, science, ingénierie) sont exactement ce qu'il faut pour aider les entreprises à innover de manière transformationnelle.",
            keySkills: ["Stratégie", "Innovation", "Pensée systémique", "Conseil C-level"],
            jobDescription: "McKinsey recherche des experts en innovation transformationnelle pour conseiller les plus grandes entreprises mondiales. Missions : audit créatif, définition de stratégies d'innovation, accompagnement de la transformation. Profil recherché : polymathe capable de voir les connexions que les autres manquent, avec track record d'innovations majeures."
        },
        {
            rank: 7,
            title: "Professeur d'Anatomie Artistique",
            company: "École des Beaux-Arts de Paris",
            matchScore: 80,
            salaryMin: 60000,
            salaryMax: 90000,
            currency: "EUR",
            contractType: "CDI",
            sectors: ["Éducation", "Art", "Anatomie"],
            location: "Paris, France",
            remotePolicy: "Présentiel",
            whyMatch: "Mes 240 planches anatomiques restent une référence artistique et médicale. Transmettre cette connaissance aux artistes de demain serait un honneur et une continuation naturelle de mon travail.",
            keySkills: ["Anatomie", "Enseignement", "Dessin", "Pédagogie"],
            jobDescription: "L'École des Beaux-Arts recrute un professeur d'anatomie artistique. Le titulaire enseignera l'anatomie humaine aux étudiants en art (dessin, sculpture, animation), combinant rigueur scientifique et sensibilité artistique. Profil recherché : expertise anatomique avec capacité à inspirer et transmettre."
        },
        {
            rank: 8,
            title: "Creative Director",
            company: "Pixar Animation Studios",
            matchScore: 78,
            salaryMin: 200000,
            salaryMax: 300000,
            currency: "USD",
            contractType: "CDI",
            sectors: ["Animation", "Entertainment", "Storytelling"],
            location: "Emeryville, Californie, USA",
            remotePolicy: "Présentiel",
            whyMatch: "Mon talent pour le storytelling visuel (La Cène capture un moment dramatique parfait) et ma maîtrise de la lumière et de l'émotion correspondent exactement à ce que Pixar recherche.",
            keySkills: ["Direction créative", "Storytelling visuel", "Animation", "Leadership"],
            jobDescription: "Pixar recherche un Creative Director pour ses prochains films. Le candidat guidera les équipes artistiques, définira l'esthétique des films, et assurera la cohérence émotionnelle des histoires. Expertise requise : maîtrise de la narration visuelle, compréhension de la lumière et de l'émotion, capacité à diriger des équipes créatives."
        },
        {
            rank: 9,
            title: "Ingénieur Aéronautique Senior",
            company: "Airbus",
            matchScore: 75,
            salaryMin: 80000,
            salaryMax: 120000,
            currency: "EUR",
            contractType: "CDI",
            sectors: ["Aéronautique", "Ingénierie", "Innovation"],
            location: "Toulouse, France",
            remotePolicy: "Présentiel",
            whyMatch: "J'ai conçu des machines volantes avec des siècles d'avance - ornithoptère, vis aérienne, parachute. Mes études sur le vol des oiseaux et l'aérodynamisme apporteraient une perspective unique chez Airbus.",
            keySkills: ["Aérodynamique", "Conception", "Biomimétisme", "Innovation"],
            jobDescription: "Airbus recrute un ingénieur senior pour son équipe innovation. Missions : conception d'aéronefs nouvelle génération, études de biomimétisme pour améliorer l'efficacité, prototypage de concepts futuristes. Profil recherché : expertise aéronautique avec créativité et capacité à questionner les conventions."
        },
        {
            rank: 10,
            title: "Bio-Artiste Contemporain",
            company: "Galeries Internationales",
            matchScore: 72,
            salaryMin: 50000,
            salaryMax: 200000,
            currency: "EUR",
            contractType: "Freelance",
            sectors: ["Art contemporain", "Bio-art", "Galeries"],
            location: "International",
            remotePolicy: "Remote + expositions",
            whyMatch: "Mon travail a toujours fusionné art et science, anatomie et esthétique. Le bio-art contemporain continue exactement cette tradition, explorant les frontières entre vivant et créé.",
            keySkills: ["Bio-art", "Art contemporain", "Science", "Installation"],
            jobDescription: "Galeries majeures (Gagosian, Pace) recherchent des artistes explorant l'intersection art-science-biotechnologie. Formats : installations, sculptures biologiques, art numérique génératif. Recherchons artiste avec formation scientifique et vision artistique forte, capable de questionner les limites du vivant."
        }
    ],
    coverLetters: [
        {
            jobRank: 1,
            jobTitle: "Chief Design Officer - Apple",
            tone: "professional_warm",
            wordCount: 412,
            content: `Dear Tim and Apple Leadership,

I write to you as someone who has spent a lifetime believing that art and technology are inseparable - that beautiful objects must also be functional, and that innovation comes from questioning every assumption.

Five centuries ago, I wrote: "Simplicity is the ultimate sophistication." I understand this is also Apple's guiding principle.

My career has been the embodiment of this philosophy. Whether painting the Mona Lisa (four years of patient refinement) or designing flying machines (decades of observation and iteration), I have always sought the intersection of beauty, function, and humanity.

**What I bring to Apple:**

• **Obsessive attention to detail**: I spent months perfecting the enigmatic smile of the Mona Lisa. Every curve, every shadow serves the whole. This is exactly how Apple designs products.

• **Cross-disciplinary mastery**: I move fluidly between art, engineering, and science. I understand materials, mechanisms, and human perception at the deepest level.

• **Documentation of excellence**: My 7,000+ pages of notebooks show how to think through problems systematically while remaining creative. I can build a culture of design thinking.

• **Understanding of hands and tools**: I have studied the human hand obsessively. I understand how objects feel, how they must be weighted, how they become extensions of the body.

**My vision for Apple:**

Apple products should feel inevitable - as if they could not have been designed any other way. This requires understanding not just technology but humanity itself: how we see, how we touch, how we connect emotionally with objects.

I would bring 500 years of perspective on what makes objects beautiful and essential. I would push the boundaries of materials and form while never losing sight of the human at the center of every design.

The Renaissance proved that art and technology together change the world. Apple proves it every day. I want to contribute to the next chapter.

The Mona Lisa has touched billions of souls. Apple products touch billions of hands. Let's create beauty together.

With deepest respect,

**Leonardo da Vinci**
Painter, Engineer, Inventor`
        },
        {
            jobRank: 2,
            jobTitle: "Directeur Artistique - Musée du Louvre",
            tone: "formal",
            wordCount: 356,
            content: `Madame, Monsieur,

Le Musée du Louvre, qui abrite La Joconde depuis plus de deux siècles, représente pour moi bien plus qu'une institution : c'est le gardien de l'héritage artistique de l'humanité et le lieu où mon œuvre continue de toucher des millions d'âmes.

Permettez-moi de me proposer comme Directeur Artistique de cette institution incomparable.

**Mes qualifications uniques:**

• **Créateur des œuvres maîtresses de la collection**: Je connais intimement l'intention artistique derrière La Joconde, La Belle Ferronnière, La Vierge aux Rochers. Qui mieux pour guider leur présentation?

• **Maîtrise de tous les arts**: Peinture, sculpture, dessin, architecture - ma formation à l'atelier Verrocchio m'a donné une compréhension holistique que peu possèdent.

• **Vision curatoriale innovante**: Mes propres expérimentations - sfumato, perspective atmosphérique - montrent ma capacité à repousser les frontières tout en respectant la tradition.

• **Expérience des cours les plus exigeantes**: J'ai servi Ludovic Sforza et François Ier. Je sais naviguer les attentes des mécènes les plus puissants.

**Ma vision pour le Louvre:**

Le Louvre doit être un pont entre passé et futur. Je proposerais des expositions explorant les liens entre Renaissance et innovation contemporaine, montrant comment les principes artistiques traversent les siècles.

Je ferais du Louvre non seulement un musée mais un laboratoire, comme l'était mon atelier - un lieu où artistes et scientifiques dialoguent pour créer les chefs-d'œuvre de demain.

Les 10 millions de visiteurs annuels méritent de comprendre non seulement ce qu'ils voient, mais pourquoi cela les touche. C'est cette mission que je souhaite servir.

Je serais honoré de vous rencontrer pour discuter de cette vision.

Respectueusement,

**Leonardo da Vinci**
Peintre de la Joconde et de la Cène`
        },
        {
            jobRank: 3,
            jobTitle: "Lead Concept Artist - Naughty Dog",
            tone: "creative",
            wordCount: 298,
            content: `Hey Naughty Dog Team!

My notebooks are basically concept art bibles from 500 years ago. Dragons, mechanical knights, fantastic machines, impossible landscapes - I've been sketching what game designers dream about since before video games existed.

**Why I'd be perfect for your team:**

• **Anatomical mastery**: I dissected 30+ bodies to understand how muscles move, how faces express emotion, how bodies carry weight. Your characters would BREATHE.

• **Creature design**: My notebooks are full of monsters - part lion, part eagle, part imagination. I know how to make impossible creatures feel real.

• **Environment art**: I spent years studying rocks, water, trees, clouds. My backgrounds aren't decoration - they're living worlds.

• **Mechanical design**: Weapons, vehicles, armor - I've designed war machines that still inspire engineers today.

**What I'd bring to your next game:**

- Character designs with unprecedented anatomical accuracy
- Creatures that feel both fantastical and believable
- Environments where every rock and tree serves the story
- Weapons and tech designs that look functional

My Codex Atlanticus is basically a design document for a universe. Let me help build yours.

I've waited 500 years for technology to catch up with my imagination. Video games are finally here. Let's create worlds together!

**Leonardo** 🎨

P.S. - I never finished the Sforza Horse sculpture because it would have been 7 meters tall. I don't scale down my ambitions. Neither does Naughty Dog.`
        }
    ]
};

export default davinciProfile;
