/**
 * Profil Démo : Michel-Ange Buonarroti
 * 
 * Sculpteur, peintre et architecte italien de la Renaissance.
 * 1475-1564
 */

import { DemoProfile } from "../types";
import { RAGComplete } from "@/types/rag-complete";

// =============================================================================
// PROFIL RAG
// =============================================================================

const michelangeloRAG: RAGComplete = {
    profil: {
        nom: "Buonarroti",
        prenom: "Michelangelo",
        titre_principal: "Maître Sculpteur, Peintre & Architecte",
        titres_alternatifs: [
            "Artiste de la Renaissance",
            "Sculpteur Monumental",
            "Fresquiste",
            "Architecte Pontifical"
        ],
        localisation: "Florence, Italie",
        disponibilite: "Sur projet",
        mobilite: ["Rome", "Florence", "Bologne"],
        contact: {
            email: "maestro@buonarroti.art",
            portfolio: "https://galerie-uffizi.it/michelangelo",
            linkedin: "linkedin.com/in/michelangelo-buonarroti"
        },
        photo_url: undefined,
        elevator_pitch: "Artiste polyvalent avec plus de 40 ans d'expérience dans la création d'œuvres monumentales pour les plus grandes institutions religieuses et politiques d'Europe. Reconnu pour ma capacité à livrer des projets d'envergure exceptionnelle sous contraintes budgétaires et temporelles strictes. Expert en sculpture sur marbre, peinture à fresque et conception architecturale. Mon travail sur le plafond de la Chapelle Sixtine et la sculpture du David sont des références mondiales en matière d'excellence artistique.",
        objectif_carriere: "Diriger des projets artistiques d'envergure internationale tout en formant la prochaine génération de maîtres artisans."
    },
    experiences: [
        {
            id: "exp_sixtine",
            poste: "Maître Fresquiste - Direction Artistique",
            entreprise: "Vatican - Chapelle Sixtine",
            type_entreprise: "public",
            secteur: "Art Religieux / Patrimoine",
            lieu: "Rome, Italie",
            type_contrat: "mission",
            debut: "1508-05",
            fin: "1512-10",
            actuel: false,
            duree_mois: 53,
            contexte: "Commission papale du Pape Jules II pour la décoration du plafond de la Chapelle Sixtine, lieu de culte le plus important de la chrétienté.",
            equipe_size: 15,
            budget_gere: "Équivalent 3M€ actuels",
            realisations: [
                {
                    id: "real_1",
                    description: "Conception et réalisation de 343 figures humaines sur 500m² de voûte",
                    impact: "Œuvre devenue référence mondiale de l'art de la Renaissance",
                    quantification: {
                        type: "volume",
                        valeur: "343",
                        unite: "figures",
                        display: "343 figures sur 500m²"
                    },
                    keywords_ats: ["fresque", "peinture monumentale", "direction artistique"],
                    sources: ["biographie_vasari"]
                },
                {
                    id: "real_2",
                    description: "Innovation technique : développement d'une technique de fresque accélérée permettant de réduire le temps d'exécution de 40%",
                    impact: "Méthode adoptée par les générations suivantes d'artistes",
                    keywords_ats: ["innovation", "optimisation", "technique picturale"],
                    sources: ["biographie_vasari"]
                },
                {
                    id: "real_3",
                    description: "Gestion d'une équipe de 15 assistants et apprentis avec formation continue",
                    impact: "5 assistants devenus maîtres reconnus",
                    quantification: {
                        type: "equipe",
                        valeur: "15",
                        unite: "personnes",
                        display: "15 collaborateurs managés"
                    },
                    keywords_ats: ["management", "formation", "leadership"],
                    sources: ["biographie_vasari"]
                }
            ],
            technologies: ["fresque a buon fresco", "pigments naturels", "échafaudages suspendus"],
            outils: ["pinceaux en soie de porc", "compas monumental", "cartons préparatoires"],
            methodologies: ["travail en sprints journaliers", "revue qualité quotidienne"],
            clients_references: ["Pape Jules II", "Saint-Siège"],
            sources: ["biographie_vasari"],
            last_updated: "2026-01-18",
            merge_count: 1
        },
        {
            id: "exp_david",
            poste: "Sculpteur Principal",
            entreprise: "Opera del Duomo - Florence",
            type_entreprise: "public",
            secteur: "Art Public / Sculpture",
            lieu: "Florence, Italie",
            type_contrat: "mission",
            debut: "1501-08",
            fin: "1504-09",
            actuel: false,
            duree_mois: 37,
            contexte: "Création d'une sculpture monumentale à partir d'un bloc de marbre de Carrare abandonné depuis 40 ans par d'autres sculpteurs.",
            realisations: [
                {
                    id: "real_david_1",
                    description: "Sculpture du David : statue de 5,17 mètres taillée dans un seul bloc de marbre",
                    impact: "Devenue symbole de Florence et chef-d'œuvre universel",
                    quantification: {
                        type: "volume",
                        valeur: "5.17",
                        unite: "mètres",
                        display: "5,17m de hauteur"
                    },
                    keywords_ats: ["sculpture monumentale", "marbre", "chef-d'œuvre"],
                    sources: ["archives_florence"]
                },
                {
                    id: "real_david_2",
                    description: "Résolution d'un défi technique majeur : exploitation d'un bloc défectueux refusé par 2 sculpteurs précédents",
                    impact: "Démonstration de capacité à résoudre des problèmes complexes",
                    keywords_ats: ["résolution problèmes", "expertise technique", "créativité"],
                    sources: ["archives_florence"]
                }
            ],
            technologies: ["taille directe marbre", "polissage au sable"],
            outils: ["gradine", "rifloir", "râpe"],
            methodologies: [],
            clients_references: ["République de Florence", "Opera del Duomo"],
            sources: ["archives_florence"],
            last_updated: "2026-01-18",
            merge_count: 1
        },
        {
            id: "exp_basilique",
            poste: "Architecte en Chef",
            entreprise: "Basilique Saint-Pierre",
            type_entreprise: "public",
            secteur: "Architecture / Patrimoine Religieux",
            lieu: "Rome, Italie",
            type_contrat: "cdi",
            debut: "1547-01",
            fin: null,
            actuel: false,
            duree_mois: 204,
            contexte: "Direction de la construction de la plus grande église de la chrétienté, reprenant le projet après Bramante et Sangallo.",
            budget_gere: "Budget colossal - équivalent 500M€",
            realisations: [
                {
                    id: "real_basilique_1",
                    description: "Conception de la coupole monumentale de 42m de diamètre, plus grande du monde à l'époque",
                    impact: "Prouesse d'ingénierie devenue modèle pour les siècles suivants",
                    quantification: {
                        type: "volume",
                        valeur: "42",
                        unite: "mètres",
                        display: "Coupole de 42m de diamètre"
                    },
                    keywords_ats: ["architecture", "ingénierie", "innovation structurelle"],
                    sources: ["archives_vatican"]
                },
                {
                    id: "real_basilique_2",
                    description: "Simplification du plan architectural réduisant les coûts de construction de 30%",
                    impact: "Économies significatives permettant l'achèvement du projet",
                    quantification: {
                        type: "pourcentage",
                        valeur: "-30%",
                        unite: "coûts",
                        display: "Réduction de 30% des coûts"
                    },
                    keywords_ats: ["optimisation budget", "gestion projet", "efficacité"],
                    sources: ["archives_vatican"]
                }
            ],
            technologies: ["architecture Renaissance", "calcul structural", "maquettes à l'échelle"],
            outils: ["équerre monumentale", "fil à plomb", "niveau à bulle"],
            methodologies: ["conception itérative", "validation par maquettes"],
            clients_references: ["Pape Paul III", "Vatican"],
            sources: ["archives_vatican"],
            last_updated: "2026-01-18",
            merge_count: 1
        }
    ],
    competences: {
        explicit: {
            techniques: [
                { nom: "Sculpture sur marbre", niveau: "expert", annees_experience: 45 },
                { nom: "Peinture à fresque", niveau: "expert", annees_experience: 30 },
                { nom: "Architecture monumentale", niveau: "expert", annees_experience: 25 },
                { nom: "Dessin anatomique", niveau: "expert", annees_experience: 50 },
                { nom: "Conception structurale", niveau: "avance", annees_experience: 20 },
                { nom: "Gestion de projet artistique", niveau: "expert", annees_experience: 40 },
                { nom: "Taille de pierre", niveau: "expert", annees_experience: 45 },
                { nom: "Préparation de pigments", niveau: "avance", annees_experience: 30 }
            ],
            soft_skills: [
                "Perfectionnisme extrême",
                "Résilience sous pression",
                "Vision créative long terme",
                "Leadership d'équipes artistiques",
                "Négociation avec commanditaires",
                "Autonomie et indépendance",
                "Résolution de problèmes complexes",
                "Transmission du savoir"
            ],
            methodologies: [
                "Étude préparatoire exhaustive",
                "Travail en sprints intensifs",
                "Itération continue",
                "Documentation détaillée"
            ]
        },
        inferred: {
            techniques: [],
            tools: [],
            soft_skills: []
        },
        par_domaine: {
            "Sculpture": ["Marbre", "Taille directe", "Polissage", "Bas-relief"],
            "Peinture": ["Fresque", "Tempera", "Préparation enduits"],
            "Architecture": ["Conception", "Calcul structure", "Direction chantier"],
            "Dessin": ["Anatomie", "Perspective", "Cartons préparatoires"]
        }
    },
    formations: [
        {
            id: "form_ghirlandaio",
            type: "formation",
            titre: "Apprentissage Atelier Ghirlandaio",
            organisme: "Atelier de Domenico Ghirlandaio",
            lieu: "Florence",
            date_debut: "1488",
            date_fin: "1490",
            annee: "1488-1490",
            en_cours: false,
            specialite: "Peinture à fresque, techniques d'atelier",
            sources: ["biographie_vasari"]
        },
        {
            id: "form_jardin",
            type: "formation",
            titre: "Formation aux Jardins de San Marco",
            organisme: "Académie de Laurent de Médicis",
            lieu: "Florence",
            date_debut: "1490",
            date_fin: "1492",
            annee: "1490-1492",
            en_cours: false,
            specialite: "Sculpture antique, anatomie humaine",
            details: "Formation d'élite sous le patronage de Laurent le Magnifique avec accès aux collections antiques",
            sources: ["biographie_vasari"]
        }
    ],
    certifications: [],
    langues: [
        { langue: "Italien", niveau: "Natif", niveau_cecrl: "C2" },
        { langue: "Latin", niveau: "Courant", niveau_cecrl: "B2", details: "Correspondance avec le Vatican" }
    ],
    references: {
        clients: [
            {
                nom: "Saint-Siège (Vatican)",
                secteur: "Religion / Patrimoine",
                type: "grand_compte",
                annees: ["1508", "1512", "1534", "1564"],
                confidentiel: false
            },
            {
                nom: "République de Florence",
                secteur: "Gouvernement / Art public",
                type: "public",
                annees: ["1501", "1504", "1520"],
                confidentiel: false
            },
            {
                nom: "Famille Médicis",
                secteur: "Mécénat / Aristocratie",
                type: "grand_compte",
                annees: ["1490", "1520", "1534"],
                confidentiel: false
            }
        ],
        projets_marquants: [
            {
                id: "proj_pieta",
                nom: "La Pietà",
                description: "Sculpture en marbre représentant la Vierge Marie tenant le corps du Christ",
                client: "Cardinal Jean Bilhères de Lagraulas",
                annee: "1499",
                technologies: ["Marbre de Carrare", "Polissage haute finition"],
                resultats: "Chef-d'œuvre unanimement acclamé, aujourd'hui à Saint-Pierre de Rome",
                sources: ["archives_vatican"]
            }
        ]
    },
    metadata: {
        version: "2.0.0",
        created_at: "2026-01-18T00:00:00Z",
        last_updated: "2026-01-18T00:00:00Z",
        last_merge_at: "2026-01-18T00:00:00Z",
        sources_count: 3,
        documents_sources: ["biographie_vasari", "archives_florence", "archives_vatican"],
        completeness_score: 94,
        merge_history: []
    }
};

// =============================================================================
// PROFIL DÉMO COMPLET
// =============================================================================

export const michelangeloProfile: DemoProfile = {
    meta: {
        id: "michelangelo",
        name: "Michel-Ange Buonarroti",
        shortName: "Michel-Ange",
        period: "1475-1564",
        icon: "🎨",
        title: "Sculpteur & Peintre Monumental",
        nationality: "Italien",
        quote: "Je vis dans mon marbre, et je n'ai qu'à enlever le superflu pour le révéler.",
        categories: ["art"]
    },
    rag: michelangeloRAG,
    completenessScore: 94,
    generationTimeMs: 847,
    cvs: [
        {
            templateId: "modern",
            templateName: "Standard",
            templateDescription: "Format professionnel classique, ATS-compatible",
            pdfUrl: "/demo-cvs/michelangelo-modern.pdf",
            previewUrl: "/demo-cvs/previews/michelangelo-modern.png",
            recommended: true
        },
        {
            templateId: "classic",
            templateName: "Classique",
            templateDescription: "Design sobre et formel",
            pdfUrl: "/demo-cvs/michelangelo-classic.pdf",
            previewUrl: "/demo-cvs/previews/michelangelo-classic.png",
            recommended: false
        },
        {
            templateId: "creative",
            templateName: "Créatif",
            templateDescription: "Layout unique avec touches de couleur",
            pdfUrl: "/demo-cvs/michelangelo-creative.pdf",
            previewUrl: "/demo-cvs/previews/michelangelo-creative.png",
            recommended: true
        },
        {
            templateId: "tech",
            templateName: "ATS Optimisé",
            templateDescription: "Texte pur, optimisé pour les systèmes ATS",
            pdfUrl: "/demo-cvs/michelangelo-tech.pdf",
            previewUrl: "/demo-cvs/previews/michelangelo-tech.png",
            recommended: false
        }
    ],
    jobs: [
        {
            rank: 1,
            title: "Directeur Artistique - Musées du Vatican",
            company: "Musei Vaticani",
            matchScore: 97,
            salaryMin: 85000,
            salaryMax: 120000,
            currency: "EUR",
            contractType: "CDI",
            sectors: ["Patrimoine", "Musées", "Art religieux"],
            location: "Vatican City",
            remotePolicy: "Présentiel",
            whyMatch: "Expertise inégalée du Vatican + portfolio iconique = candidat idéal pour ce poste prestigieux. Connaissance directe des œuvres et de l'histoire institutionnelle.",
            keySkills: ["Conservation patrimoine", "Direction artistique", "Gestion collections", "Relations institutionnelles"],
            jobDescription: "Le Directeur Artistique des Musées du Vatican supervise la conservation, la restauration et la mise en valeur des collections pontificales. Il dirige une équipe de 50 conservateurs et coordonne les expositions temporaires. Le candidat idéal possède une expertise reconnue en art de la Renaissance et une expérience de direction dans un contexte institutionnel majeur."
        },
        {
            rank: 2,
            title: "Sculpteur Monumental - Commandes Publiques",
            company: "Atelier d'Art de Florence",
            matchScore: 94,
            salaryMin: 60000,
            salaryMax: 95000,
            currency: "EUR",
            contractType: "Freelance",
            sectors: ["Art contemporain", "Sculpture", "Commandes publiques"],
            location: "Florence, Italie",
            remotePolicy: "Atelier sur site",
            whyMatch: "Portfolio exceptionnel en sculpture monumentale + maîtrise du marbre = profil recherché pour commandes artistiques prestigieuses.",
            keySkills: ["Sculpture marbre", "Projets monumentaux", "Relation client", "Gestion atelier"],
            jobDescription: "Réalisation de sculptures monumentales pour institutions publiques et collectionneurs privés. Le sculpteur travaille sur des commandes sur mesure, de la conception au polissage final. Expertise en marbre de Carrare exigée."
        },
        {
            rank: 3,
            title: "Chef de Projet Restauration - UNESCO",
            company: "UNESCO",
            matchScore: 92,
            salaryMin: 75000,
            salaryMax: 110000,
            currency: "EUR",
            contractType: "CDD",
            sectors: ["Patrimoine mondial", "Restauration", "Conservation"],
            location: "Paris / Sites patrimoniaux",
            remotePolicy: "Hybride + déplacements",
            whyMatch: "Expérience exceptionnelle sur sites patrimoniaux + compréhension des enjeux de conservation = atout majeur pour les missions UNESCO.",
            keySkills: ["Restauration patrimoine", "Gestion projet international", "Conservation préventive", "Coordination équipes"],
            jobDescription: "Pilotage de projets de restauration de sites classés au Patrimoine Mondial. Coordination d'équipes internationales, gestion budgétaire et respect des standards de conservation internationaux."
        },
        {
            rank: 4,
            title: "Professeur d'Arts Plastiques - École des Beaux-Arts",
            matchScore: 89,
            salaryMin: 55000,
            salaryMax: 75000,
            currency: "EUR",
            contractType: "CDI",
            sectors: ["Éducation", "Beaux-Arts", "Formation professionnelle"],
            location: "Paris, France",
            remotePolicy: "Présentiel",
            whyMatch: "Expertise technique inégalée + expérience de transmission en atelier = profil de maître formateur recherché.",
            keySkills: ["Pédagogie artistique", "Techniques classiques", "Mentorat", "Évaluation"],
            jobDescription: "Enseignement des techniques classiques de sculpture et dessin anatomique à des étudiants en master. Direction de mémoires et suivi personnalisé."
        },
        {
            rank: 5,
            title: "Consultant en Conservation - Christie's",
            company: "Christie's",
            matchScore: 87,
            salaryMin: 90000,
            salaryMax: 140000,
            currency: "EUR",
            contractType: "Freelance",
            sectors: ["Marché de l'art", "Expertise", "Ventes aux enchères"],
            location: "Londres / International",
            remotePolicy: "Remote + déplacements",
            whyMatch: "Connaissance profonde de l'art Renaissance + réseau institutionnel = expertise précieuse pour authentification et valorisation.",
            keySkills: ["Expertise œuvres", "Authentification", "Estimation", "Réseau collectionneurs"],
            jobDescription: "Expertise et authentification d'œuvres de la Renaissance italienne pour ventes aux enchères majeures. Conseil aux collectionneurs et institutions."
        },
        {
            rank: 6,
            title: "Architecte Patrimoine - Monuments Historiques",
            matchScore: 85,
            salaryMin: 65000,
            salaryMax: 90000,
            currency: "EUR",
            contractType: "CDI",
            sectors: ["Architecture", "Patrimoine", "Bâtiments historiques"],
            location: "France (National)",
            remotePolicy: "Hybride",
            whyMatch: "Expérience en architecture monumentale + sensibilité patrimoniale = profil adapté à la conservation du bâti ancien.",
            keySkills: ["Architecture historique", "Réglementation patrimoine", "Direction travaux", "Études techniques"],
            jobDescription: "Intervention sur monuments historiques classés. Études préalables, suivi de chantier et respect des règles de conservation."
        },
        {
            rank: 7,
            title: "Directeur Création - Luxury Brand",
            company: "Maison de luxe italienne",
            matchScore: 82,
            salaryMin: 120000,
            salaryMax: 180000,
            currency: "EUR",
            contractType: "CDI",
            sectors: ["Luxe", "Mode", "Direction artistique"],
            location: "Milan, Italie",
            remotePolicy: "Présentiel",
            whyMatch: "Vision artistique unique + réputation d'excellence = apport différenciant pour marque de luxe haut de gamme.",
            keySkills: ["Direction artistique", "Identité visuelle", "Savoir-faire artisanal", "Innovation design"],
            jobDescription: "Définition de la vision artistique d'une maison de luxe. Supervision des collections, événements et communication visuelle de la marque."
        },
        {
            rank: 8,
            title: "Mosaïste Principal - Grand Projet",
            matchScore: 79,
            salaryMin: 50000,
            salaryMax: 70000,
            currency: "EUR",
            contractType: "Mission",
            sectors: ["Artisanat d'art", "Mosaïque", "Décoration monumentale"],
            location: "Ravenne, Italie",
            remotePolicy: "Sur site",
            whyMatch: "Maîtrise des techniques anciennes + expérience fresques = compétences transférables à la mosaïque monumentale.",
            keySkills: ["Mosaïque", "Techniques anciennes", "Travail monumental", "Patience"],
            jobDescription: "Réalisation de mosaïques monumentales pour projets de décoration d'exception. Travail en équipe sur chantiers patrimoniaux."
        },
        {
            rank: 9,
            title: "Designer 3D Senior - Gaming",
            matchScore: 75,
            salaryMin: 55000,
            salaryMax: 80000,
            currency: "EUR",
            contractType: "CDI",
            sectors: ["Jeux vidéo", "Animation 3D", "Character design"],
            location: "Paris / Remote",
            remotePolicy: "Full remote possible",
            whyMatch: "Maîtrise anatomie humaine + vision artistique = potentiel élevé pour création de personnages 3D réalistes avec formation aux outils modernes.",
            keySkills: ["Anatomie", "Character design", "Sculpture digitale", "Direction artistique"],
            jobDescription: "Création de personnages et environnements 3D pour jeux AAA. Le studio recherche des profils avec une forte culture artistique classique."
        },
        {
            rank: 10,
            title: "Artiste en Résidence - Fondation",
            matchScore: 72,
            salaryMin: 40000,
            salaryMax: 60000,
            currency: "EUR",
            contractType: "CDD",
            sectors: ["Art contemporain", "Résidence artistique", "Création"],
            location: "International (variable)",
            remotePolicy: "Sur site résidence",
            whyMatch: "Parcours artistique exceptionnel + vision unique = candidat de prestige pour résidences artistiques internationales.",
            keySkills: ["Création artistique", "Exposition", "Médiation", "Recherche plastique"],
            jobDescription: "Résidence de création de 6 à 12 mois avec exposition finale. Logement et atelier fournis, bourse de création."
        }
    ],
    coverLetters: [
        {
            jobRank: 1,
            jobTitle: "Directeur Artistique - Musées du Vatican",
            tone: "formal",
            wordCount: 384,
            content: `Madame, Monsieur,

Fort de quarante années d'expérience au service de l'art sacré et de ma collaboration étroite avec le Vatican lors de la réalisation du plafond de la Chapelle Sixtine, je souhaite apporter mon expertise unique au poste de Directeur Artistique des Musées du Vatican.

Mon parcours artistique m'a permis de développer une compréhension profonde des enjeux liés à la conservation et à la mise en valeur du patrimoine religieux. Durant quatre années de travail intense sur le plafond de la Sixtine, j'ai non seulement créé une œuvre reconnue universellement, mais j'ai également acquis une connaissance intime de l'institution vaticane, de ses processus décisionnels et de sa mission de préservation du patrimoine de l'humanité.

**Mes compétences clés pour ce poste :**

• **Direction artistique d'envergure** : Gestion de projets monumentaux (Chapelle Sixtine, Basilique Saint-Pierre) avec des équipes de 15 à 50 personnes et des budgets conséquents.

• **Conservation et restauration** : Expertise technique en peinture à fresque et sculpture monumentale, avec une sensibilité particulière pour les enjeux de préservation à long terme.

• **Relations institutionnelles** : Expérience éprouvée de collaboration avec les plus hautes autorités pontificales, diplomatie et sens du protocole.

• **Vision stratégique** : Capacité démontrée à concevoir des projets sur plusieurs décennies tout en respectant les contraintes budgétaires et calendaires.

Au-delà de mes réalisations techniques, je suis profondément attaché à la transmission du savoir artistique. J'ai formé de nombreux apprentis qui perpétuent aujourd'hui les techniques classiques, et je souhaite mettre cette vocation pédagogique au service de la médiation culturelle des Musées du Vatican.

Je suis convaincu que mon expertise unique, née de décennies de création au cœur même de ces lieux sacrés, constitue un atout précieux pour accompagner les Musées du Vatican dans leurs missions de conservation, de recherche et de diffusion du patrimoine artistique occidental.

Je me tiens à votre disposition pour un entretien au cours duquel je pourrai vous présenter plus en détail ma vision pour ce poste prestigieux.

Veuillez agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

**Michelangelo Buonarroti**`
        },
        {
            jobRank: 2,
            jobTitle: "Sculpteur Monumental - Commandes Publiques",
            tone: "professional_warm",
            wordCount: 298,
            content: `Cher Directeur de l'Atelier,

Votre annonce pour un sculpteur spécialisé en commandes monumentales a immédiatement retenu mon attention. La perspective de créer des œuvres durables pour l'espace public résonne profondément avec ma vocation artistique.

Depuis plus de quarante ans, je consacre ma vie à la sculpture sur marbre. Le David, que j'ai sculpté pour la République de Florence, témoigne de ma capacité à transformer un bloc de pierre en une œuvre qui transcende son époque. Cette sculpture de 5,17 mètres, taillée dans un bloc abandonné par d'autres artistes, illustre ma philosophie : voir au-delà des obstacles apparents pour révéler la beauté cachée dans la matière.

**Ce que j'apporte à votre atelier :**

• Une maîtrise technique exceptionnelle du marbre de Carrare, acquise sur des décennies de pratique quotidienne
• Une capacité prouvée à gérer des projets monumentaux de A à Z
• Un réseau de clients institutionnels de premier plan (Vatican, Florence, Médicis)
• Une réputation d'exigence et d'excellence reconnue dans toute l'Europe

Je suis particulièrement intéressé par les commandes publiques car elles permettent à l'art de toucher le plus grand nombre. Une sculpture dans l'espace urbain devient un point de rencontre, un repère pour la communauté.

Je serais honoré de visiter votre atelier et de discuter des projets en cours. Mon portfolio de réalisations témoignera mieux que des mots de mon engagement envers l'excellence artistique.

Dans l'attente de votre réponse, recevez mes salutations les plus cordiales.

**Michelangelo Buonarroti**`
        },
        {
            jobRank: 3,
            jobTitle: "Chef de Projet Restauration - UNESCO",
            tone: "formal",
            wordCount: 356,
            content: `Madame, Monsieur,

L'annonce de l'UNESCO pour un Chef de Projet Restauration du Patrimoine Mondial représente une opportunité exceptionnelle de mettre mon expérience au service de la préservation du patrimoine de l'humanité.

Tout au long de ma carrière, j'ai été confronté aux défis complexes de la création et de la conservation d'œuvres monumentales. Mon expérience en tant qu'architecte en chef de la Basilique Saint-Pierre m'a notamment permis de développer une approche rigoureuse de la gestion de projets patrimoniaux d'envergure : coordination d'équipes pluridisciplinaires, respect des contraintes techniques et budgétaires, et vision à long terme.

**Mes atouts pour ce poste :**

• **Expertise technique transversale** : Maîtrise des techniques de sculpture, peinture et architecture, permettant une compréhension globale des problématiques de conservation.

• **Gestion de chantiers complexes** : Direction de la construction de la coupole de Saint-Pierre (42m de diamètre), avec optimisation des coûts de 30% grâce à une simplification du plan initial.

• **Travail multi-stakeholders** : Expérience de négociation avec commanditaires exigeants (papes, républiques, mécènes) et coordination d'artisans de différentes spécialités.

• **Dimension internationale** : Interventions à Florence, Rome, Bologne, et familiarité avec les enjeux diplomatiques des projets culturels transfrontaliers.

La mission de l'UNESCO de préserver le patrimoine mondial fait écho à ma conviction profonde : les œuvres d'art appartiennent à l'humanité tout entière et méritent une protection sans concession. J'ai toujours travaillé dans cette perspective, en créant des œuvres destinées à traverser les siècles.

Je souhaite désormais mettre cette philosophie et mon expertise au service de la préservation de sites exceptionnels partout dans le monde. Ma capacité à résoudre des problèmes techniques complexes et à fédérer des équipes autour d'objectifs ambitieux serait un atout précieux pour vos missions.

Je reste à votre disposition pour approfondir ma candidature.

Respectueusement,

**Michelangelo Buonarroti**`
        }
    ]
};

export default michelangeloProfile;
