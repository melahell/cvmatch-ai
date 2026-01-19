/**
 * Profil Démo : Joséphine Baker
 * 
 * Artiste française d'origine américaine, résistante et militante.
 * 1906-1975
 */

import { DemoProfile } from "../types";
import { RAGComplete } from "@/types/rag-complete";

// =============================================================================
// PROFIL RAG
// =============================================================================

const bakerRAG: RAGComplete = {
    profil: {
        nom: "Baker",
        prenom: "Joséphine",
        titre_principal: "Artiste Internationale & Militante des Droits Civiques",
        titres_alternatifs: [
            "Étoile des Folies Bergère",
            "Agent de Renseignement",
            "Chevalier de la Légion d'Honneur",
            "Pionnière de l'Égalité"
        ],
        localisation: "Paris, France",
        disponibilite: "Disponible pour performances et engagement",
        mobilite: ["Paris", "Monaco", "International"],
        contact: {
            email: "josephine@baker.art",
            portfolio: "https://josephinebaker.com"
        },
        photo_url: undefined,
        elevator_pitch: "Artiste complète ayant conquis le monde du spectacle par mon talent, mon charisme et mon audace. Première superstar noire internationale, j'ai brisé les barrières raciales sur scène et dans la vie. Agent du renseignement français pendant la Seconde Guerre mondiale, j'ai risqué ma vie pour la liberté et la France. Militante infatigable des droits civiques aux côtés de Martin Luther King. Mère de la 'Tribu Arc-en-ciel', 12 enfants adoptés de toutes origines pour prouver que l'humanité peut vivre ensemble.",
        objectif_carriere: "Utiliser mon art et ma voix pour briser les barrières raciales et construire un monde où chaque être humain est traité avec dignité et égalité."
    },
    experiences: [
        {
            id: "exp_folies",
            poste: "Vedette Principale",
            entreprise: "Folies Bergère",
            type_entreprise: "grand_groupe",
            secteur: "Spectacle Vivant / Music-hall",
            lieu: "Paris, France",
            type_contrat: "cdi",
            debut: "1926-01",
            fin: "1940-12",
            actuel: false,
            duree_mois: 180,
            contexte: "Règne artistique sur le music-hall parisien, période de gloire internationale avec des revues spectaculaires.",
            realisations: [
                {
                    id: "real_revue",
                    description: "Création de la 'Revue Nègre' et de numéros iconiques comme la danse de la banane, révolutionnant le spectacle parisien",
                    impact: "Star internationale la mieux payée d'Europe, symbole des Années Folles",
                    keywords_ats: ["spectacle", "danse", "innovation artistique", "star"],
                    sources: ["folies_bergere"]
                },
                {
                    id: "real_premiere",
                    description: "Première femme noire à devenir vedette d'un major music-hall parisien, brisant les barrières raciales",
                    impact: "Ouverture des portes pour les artistes afro-américains en Europe",
                    keywords_ats: ["pionnière", "diversité", "leadership"],
                    sources: ["biographie"]
                },
                {
                    id: "real_casino",
                    description: "Spectacles au Casino de Paris avec des productions monumentales et des costumes iconiques",
                    impact: "Plus de 500 représentations sold-out, institution du spectacle parisien",
                    quantification: {
                        type: "volume",
                        valeur: "500",
                        unite: "représentations",
                        display: "500+ shows sold-out"
                    },
                    keywords_ats: ["performance", "succès commercial", "longévité"],
                    sources: ["casino_paris"]
                }
            ],
            technologies: ["Danse", "Chant", "Comédie", "Performance scénique"],
            outils: [],
            methodologies: ["Improvisation", "Connexion avec le public", "Innovation constante"],
            clients_references: ["Folies Bergère", "Casino de Paris"],
            sources: ["folies_bergere", "biographie"],
            last_updated: "2026-01-19",
            merge_count: 1
        },
        {
            id: "exp_resistance",
            poste: "Agent de Renseignement",
            entreprise: "Résistance Française / Deuxième Bureau / DGER",
            type_entreprise: "public",
            secteur: "Renseignement / Défense",
            lieu: "France / Afrique du Nord",
            type_contrat: "mission",
            debut: "1940-06",
            fin: "1945-05",
            actuel: false,
            duree_mois: 60,
            contexte: "Engagement patriotique dans la Résistance française dès le début de l'Occupation, utilisant ma célébrité comme couverture.",
            realisations: [
                {
                    id: "real_renseignement",
                    description: "Transmission de renseignements militaires sur les positions allemandes, cachés dans mes partitions et sous-vêtements",
                    impact: "Contribution directe à l'effort de guerre allié, nombreuses informations stratégiques transmises",
                    keywords_ats: ["renseignement", "discrétion", "courage", "patriotisme"],
                    sources: ["archives_resistance"]
                },
                {
                    id: "real_maroc",
                    description: "Couverture d'opérations depuis le Maroc, recrutement d'autres artistes pour le réseau",
                    impact: "Expansion du réseau de renseignement en Afrique du Nord",
                    keywords_ats: ["réseau", "recrutement", "leadership"],
                    sources: ["archives_resistance"]
                },
                {
                    id: "real_decorations",
                    description: "Obtention de la Croix de Guerre, Médaille de la Résistance, et Chevalier de la Légion d'Honneur",
                    impact: "Reconnaissance officielle du sacrifice et des services rendus à la France",
                    keywords_ats: ["honneur", "reconnaissance", "excellence"],
                    sources: ["ordre_national"]
                }
            ],
            technologies: ["Cryptographie basique", "Communication clandestine"],
            outils: [],
            methodologies: ["Couverture artistique", "Transmission discrète"],
            clients_references: ["France Libre", "Général de Gaulle"],
            sources: ["archives_resistance"],
            last_updated: "2026-01-19",
            merge_count: 1
        },
        {
            id: "exp_militantisme",
            poste: "Militante pour les Droits Civiques",
            entreprise: "NAACP / Mouvement des Droits Civiques",
            type_entreprise: "startup",
            secteur: "Activisme / Justice Sociale",
            lieu: "USA / International",
            type_contrat: "freelance",
            debut: "1951-01",
            fin: "1975-04",
            actuel: false,
            duree_mois: 292,
            contexte: "Lutte contre la ségrégation raciale aux États-Unis et promotion de l'égalité dans le monde.",
            realisations: [
                {
                    id: "real_march",
                    description: "Participation à la Marche sur Washington de 1963, seule femme à prendre la parole aux côtés de MLK",
                    impact: "Voix internationale pour les droits civiques, moment historique",
                    keywords_ats: ["droits civiques", "leadership féminin", "histoire"],
                    sources: ["archives_mlk"]
                },
                {
                    id: "real_segregation",
                    description: "Refus systématique de jouer devant des publics ségrégués, forçant l'intégration des salles",
                    impact: "Désintégration de nombreuses salles de spectacle américaines",
                    keywords_ats: ["intégrité", "courage", "changement systémique"],
                    sources: ["biographie"]
                },
                {
                    id: "real_tribu",
                    description: "Adoption de 12 enfants de toutes origines (Tribu Arc-en-ciel) pour démontrer l'harmonie possible entre les races",
                    impact: "Symbole vivant de l'unité humaine, influence culturelle mondiale",
                    quantification: {
                        type: "equipe",
                        valeur: "12",
                        unite: "enfants adoptés",
                        display: "12 enfants de toutes origines"
                    },
                    keywords_ats: ["famille", "diversité", "valeurs", "exemplarité"],
                    sources: ["biographie"]
                }
            ],
            technologies: [],
            outils: [],
            methodologies: ["Militantisme par l'exemple", "Advocacy publique"],
            clients_references: ["NAACP", "Dr. Martin Luther King Jr."],
            sources: ["archives_mlk", "biographie"],
            last_updated: "2026-01-19",
            merge_count: 1
        }
    ],
    competences: {
        explicit: {
            techniques: [
                { nom: "Danse", niveau: "expert", annees_experience: 50 },
                { nom: "Chant", niveau: "expert", annees_experience: 50 },
                { nom: "Comédie", niveau: "avance", annees_experience: 45 },
                { nom: "Performance scénique", niveau: "expert", annees_experience: 50 },
                { nom: "Renseignement", niveau: "avance", annees_experience: 5 },
                { nom: "Prise de parole publique", niveau: "expert", annees_experience: 40 }
            ],
            soft_skills: [
                "Charisme exceptionnel",
                "Courage face au danger",
                "Résilience extraordinaire",
                "Intégrité absolue",
                "Empathie universelle",
                "Leadership naturel",
                "Capacité à fédérer",
                "Humour et légèreté"
            ],
            methodologies: [
                "Performance comme vecteur de message",
                "Militantisme par l'exemple",
                "Transgression artistique"
            ]
        },
        inferred: { techniques: [], tools: [], soft_skills: [] },
        par_domaine: {
            "Spectacle": ["Danse", "Chant", "Comédie", "Mise en scène"],
            "Activisme": ["Droits civiques", "Anti-racisme", "Advocacy"],
            "Renseignement": ["Observation", "Transmission", "Couverture"]
        }
    },
    formations: [
        {
            id: "form_vaudeville",
            type: "formation",
            titre: "Formation sur le terrain - Vaudeville américain",
            organisme: "Troupes itinérantes de St. Louis",
            lieu: "St. Louis, Missouri, USA",
            date_debut: "1918",
            date_fin: "1921",
            annee: "1918-1921",
            en_cours: false,
            specialite: "Danse, comédie, performance",
            details: "Apprentissage de la scène dès 13 ans dans les circuits du vaudeville noir américain",
            sources: ["biographie"]
        }
    ],
    certifications: [],
    langues: [
        { langue: "Anglais", niveau: "Natif", niveau_cecrl: "C2" },
        { langue: "Français", niveau: "Courant", niveau_cecrl: "C2", details: "Naturalisée française en 1937" },
        { langue: "Espagnol", niveau: "Intermédiaire", niveau_cecrl: "B1" }
    ],
    references: {
        clients: [
            { nom: "Folies Bergère", secteur: "Spectacle", type: "grand_compte", annees: ["1926", "1975"], confidentiel: false },
            { nom: "France Libre / Général de Gaulle", secteur: "Défense", type: "public", annees: ["1940", "1945"], confidentiel: true },
            { nom: "NAACP", secteur: "Droits civiques", type: "startup", annees: ["1951", "1975"], confidentiel: false }
        ],
        projets_marquants: [
            {
                id: "proj_revue",
                nom: "La Revue Nègre",
                description: "Spectacle révolutionnaire présentant l'art afro-américain au public parisien",
                client: "Théâtre des Champs-Élysées",
                annee: "1925",
                technologies: ["Jazz", "Danse moderne"],
                resultats: "Lancement d'une carrière internationale, impact culturel majeur",
                sources: ["folies_bergere"]
            }
        ]
    },
    metadata: {
        version: "2.0.0",
        created_at: "2026-01-19T00:00:00Z",
        last_updated: "2026-01-19T00:00:00Z",
        last_merge_at: "2026-01-19T00:00:00Z",
        sources_count: 5,
        documents_sources: ["folies_bergere", "biographie", "archives_resistance", "archives_mlk", "casino_paris"],
        completeness_score: 93,
        merge_history: []
    }
};

// =============================================================================
// PROFIL DÉMO COMPLET
// =============================================================================

export const bakerProfile: DemoProfile = {
    meta: {
        id: "baker",
        name: "Joséphine Baker",
        shortName: "Joséphine",
        period: "1906-1975",
        icon: "🌟",
        title: "Artiste & Résistante",
        nationality: "Franco-Américaine",
        quote: "J'ai deux amours, mon pays et Paris.",
        categories: ["art", "politics"]
    },
    rag: bakerRAG,
    completenessScore: 93,
    generationTimeMs: 812,
    cvs: [
        {
            templateId: "modern",
            templateName: "Standard",
            templateDescription: "Format professionnel polyvalent",
            pdfUrl: "/demo-cvs/baker-modern.pdf",
            previewUrl: "/demo-cvs/previews/baker-modern.png",
            recommended: false
        },
        {
            templateId: "classic",
            templateName: "Classique",
            templateDescription: "Design sobre et élégant",
            pdfUrl: "/demo-cvs/baker-classic.pdf",
            previewUrl: "/demo-cvs/previews/baker-classic.png",
            recommended: false
        },
        {
            templateId: "creative",
            templateName: "Créatif",
            templateDescription: "Layout artistique et dynamique",
            pdfUrl: "/demo-cvs/baker-creative.pdf",
            previewUrl: "/demo-cvs/previews/baker-creative.png",
            recommended: true
        },
        {
            templateId: "tech",
            templateName: "ATS Optimisé",
            templateDescription: "Focus compétences et réalisations",
            pdfUrl: "/demo-cvs/baker-tech.pdf",
            previewUrl: "/demo-cvs/previews/baker-tech.png",
            recommended: false
        }
    ],
    jobs: [
        {
            rank: 1,
            title: "Chief Diversity & Inclusion Officer",
            company: "L'Oréal",
            matchScore: 95,
            salaryMin: 150000,
            salaryMax: 250000,
            currency: "EUR",
            contractType: "CDI",
            sectors: ["Cosmétiques", "D&I", "Corporate"],
            location: "Paris, France",
            remotePolicy: "Hybride",
            whyMatch: "J'ai consacré ma vie à briser les barrières raciales et à célébrer la beauté de toutes les origines. L'Oréal, avec sa mission 'Beauty for All', peut bénéficier de mon engagement authentique pour la diversité.",
            keySkills: ["Diversité & Inclusion", "Leadership inspirant", "Transformation culturelle", "Communication"],
            jobDescription: "L'Oréal recrute un Chief Diversity & Inclusion Officer pour piloter sa stratégie mondiale de diversité. Le CDIO définira les objectifs D&I du groupe, assurera leur déclinaison dans 150 pays, et représentera L'Oréal sur les questions d'inclusion. Profil recherché : leader charismatique avec track record démontré en matière d'inclusion, capable de transformer la culture d'une organisation de 85 000 personnes."
        },
        {
            rank: 2,
            title: "Directrice Artistique",
            company: "Paris Opera Ballet",
            matchScore: 93,
            salaryMin: 120000,
            salaryMax: 180000,
            currency: "EUR",
            contractType: "CDI",
            sectors: ["Danse", "Arts du spectacle", "Culture"],
            location: "Paris, France",
            remotePolicy: "Présentiel",
            whyMatch: "De la Revue Nègre aux scènes internationales, j'ai révolutionné la danse de spectacle. Ma vision artistique et mon engagement pour l'ouverture pourraient transformer l'Opéra de Paris.",
            keySkills: ["Direction artistique", "Chorégraphie", "Vision créative", "Management culturel"],
            jobDescription: "L'Opéra National de Paris recherche une Directrice Artistique pour son Ballet. Responsabilités : définir la programmation, recruter les talents, moderniser le répertoire tout en préservant l'excellence classique. Profil recherché : artiste de renommée internationale avec vision de renouvellement et engagement pour la diversité des corps et des styles."
        },
        {
            rank: 3,
            title: "Ambassadrice Mondiale",
            company: "UNICEF",
            matchScore: 91,
            salaryMin: 100000,
            salaryMax: 150000,
            currency: "USD",
            contractType: "CDI",
            sectors: ["ONG", "Humanitaire", "Droits de l'enfant"],
            location: "International",
            remotePolicy: "Missions internationales",
            whyMatch: "Ma 'Tribu Arc-en-ciel' de 12 enfants adoptés de toutes origines prouve mon engagement pour les enfants du monde. Ma célébrité peut amplifier la voix de l'UNICEF.",
            keySkills: ["Advocacy", "Communication internationale", "Droits de l'enfant", "Charisme"],
            jobDescription: "L'UNICEF recrute un(e) Ambassadeur(rice) de Bonne Volonté pour porter la voix des enfants dans le monde. Missions : représenter l'UNICEF lors d'événements mondiaux, sensibiliser l'opinion publique, lever des fonds. Profil recherché : célébrité internationale avec engagement authentique pour les droits de l'enfant et capacité à toucher les cœurs."
        },
        {
            rank: 4,
            title: "Directrice de la Programmation",
            company: "Théâtre du Châtelet",
            matchScore: 89,
            salaryMin: 90000,
            salaryMax: 130000,
            currency: "EUR",
            contractType: "CDI",
            sectors: ["Théâtre", "Culture", "Arts"],
            location: "Paris, France",
            remotePolicy: "Présentiel",
            whyMatch: "Le Châtelet a été le théâtre de mes plus grands triomphes. Ma connaissance intime du music-hall et ma vision inclusive pourraient renouveler cette institution légendaire.",
            keySkills: ["Programmation", "Vision artistique", "Relations publiques", "Gestion culturelle"],
            jobDescription: "Le Théâtre du Châtelet recherche un(e) Directeur(rice) de la Programmation pour redéfinir son identité artistique. Responsabilités : sélectionner les spectacles, négocier avec les artistes internationaux, positionner le Châtelet comme lieu d'innovation. Profil : expert(e) du spectacle vivant avec vision audacieuse et réseau international."
        },
        {
            rank: 5,
            title: "Conférencière Inspirante",
            company: "TEDx / Entreprises CAC40",
            matchScore: 87,
            salaryMin: 80000,
            salaryMax: 150000,
            currency: "EUR",
            contractType: "Freelance",
            sectors: ["Conférences", "Inspiration", "Leadership"],
            location: "International",
            remotePolicy: "Événements + Remote",
            whyMatch: "De la Marche sur Washington aux scènes du monde entier, j'ai toujours su captiver les foules avec ma parole et mon énergie. Mon histoire de résilience inspire.",
            keySkills: ["Prise de parole", "Storytelling", "Inspiration", "Leadership"],
            jobDescription: "Bureau de conférenciers recherche des speakers exceptionnels pour ses événements corporate premium. Thèmes : diversité, résilience, leadership, dépassement de soi. Profil : personnalité charismatique avec histoire personnelle inspirante et capacité à transformer une salle en quelques minutes."
        },
        {
            rank: 6,
            title: "VP Social Impact",
            company: "Kering (Luxe)",
            matchScore: 84,
            salaryMin: 130000,
            salaryMax: 200000,
            currency: "EUR",
            contractType: "CDI",
            sectors: ["Luxe", "RSE", "Impact Social"],
            location: "Paris, France",
            remotePolicy: "Hybride",
            whyMatch: "Le luxe doit être vecteur de changement social. Mon engagement pour l'égalité et ma visibilité internationale peuvent aider Kering à amplifier son impact positif.",
            keySkills: ["RSE", "Impact social", "Relations publiques", "Stratégie"],
            jobDescription: "Kering recherche un VP Social Impact pour diriger ses initiatives sociales et humanitaires. Responsabilités : partenariats ONG, programmes de diversité, communication RSE, fondation d'entreprise. Profil : leader passionné(e) par l'impact social avec réseau international et crédibilité dans le monde du luxe."
        },
        {
            rank: 7,
            title: "Productrice Exécutive",
            company: "Netflix",
            matchScore: 81,
            salaryMin: 150000,
            salaryMax: 250000,
            currency: "USD",
            contractType: "CDI",
            sectors: ["Entertainment", "Production", "Streaming"],
            location: "Los Angeles / Paris",
            remotePolicy: "Hybride",
            whyMatch: "Mon histoire mériterait une série ! Plus sérieusement, mon œil pour le talent, mon sens du spectacle et ma sensibilité aux histoires sous-représentées apporteraient une voix unique.",
            keySkills: ["Production", "Développement créatif", "Talent scouting", "Storytelling"],
            jobDescription: "Netflix recrute des producteurs exécutifs pour développer des contenus originaux européens et africains. Responsabilités : identifier les projets, accompagner les créateurs, valider les orientations créatives. Profil : expert(e) du spectacle avec sensibilité aux histoires diverses et capacité à repérer les talents émergents."
        },
        {
            rank: 8,
            title: "Directrice de Musée",
            company: "Musée National de l'Histoire de l'Immigration",
            matchScore: 79,
            salaryMin: 80000,
            salaryMax: 120000,
            currency: "EUR",
            contractType: "CDI",
            sectors: ["Musées", "Culture", "Immigration"],
            location: "Paris, France",
            remotePolicy: "Présentiel",
            whyMatch: "Mon parcours de St. Louis à Paris, de la pauvreté à la gloire, incarne l'histoire de l'immigration. Diriger ce musée serait honorer tous ceux qui, comme moi, ont cherché une vie meilleure.",
            keySkills: ["Direction culturelle", "Curation", "Histoire", "Médiation"],
            jobDescription: "Le Musée National de l'Histoire de l'Immigration recrute un(e) Directeur(rice). Responsabilités : définir la politique scientifique et culturelle, gérer les collections, développer les publics. Profil : expert(e) des questions migratoires avec sensibilité artistique et capacité à toucher un large public."
        },
        {
            rank: 9,
            title: "Mentor - Programme Talents Émergents",
            company: "Fondation des Artistes",
            matchScore: 76,
            salaryMin: 50000,
            salaryMax: 80000,
            currency: "EUR",
            contractType: "CDD",
            sectors: ["Arts", "Mentorat", "Formation"],
            location: "Paris / International",
            remotePolicy: "Hybride",
            whyMatch: "J'ai dû me battre pour chaque opportunité. Aider les jeunes artistes issus de la diversité à trouver leur voie serait une façon de transmettre ce que j'ai appris.",
            keySkills: ["Mentorat", "Coaching artistique", "Réseau", "Inspiration"],
            jobDescription: "Programme d'accompagnement de jeunes artistes issus de la diversité. Le mentor accompagne 10 talents pendant 2 ans : coaching artistique, développement de carrière, introduction au réseau. Profil : artiste confirmé(e) avec générosité et désir de transmettre."
        },
        {
            rank: 10,
            title: "Auteure - Mémoires",
            company: "Éditions Gallimard",
            matchScore: 73,
            salaryMin: 40000,
            salaryMax: 100000,
            currency: "EUR",
            contractType: "Freelance",
            sectors: ["Édition", "Autobiographie", "Littérature"],
            location: "Remote",
            remotePolicy: "Full remote",
            whyMatch: "De St. Louis à Paris, de la scène à la Résistance, de la Marche sur Washington à ma Tribu Arc-en-ciel : mon histoire mérite d'être racontée et préservée.",
            keySkills: ["Écriture", "Storytelling", "Mémoire historique", "Autobiographie"],
            jobDescription: "Éditions Gallimard recherche des personnalités exceptionnelles pour la collection Témoins. Format : autobiographie (300 pages), accompagnement éditorial premium. Profil : vie extraordinaire, capacité narrative, désir de transmettre aux générations futures."
        }
    ],
    coverLetters: [
        {
            jobRank: 1,
            jobTitle: "Chief Diversity & Inclusion Officer - L'Oréal",
            tone: "professional_warm",
            wordCount: 398,
            content: `Chers membres du Comité de Direction,

Je vous écris depuis un pays, la France, qui m'a accueillie quand l'Amérique me rejetait à cause de la couleur de ma peau. J'ai consacré ma vie à prouver que la beauté n'a pas de couleur, de religion ou de frontière.

"Beauty for All" - votre devise - est exactement ce pour quoi je me suis battue toute ma vie.

**Mon parcours en matière de diversité et inclusion:**

• **Pionnière de la diversité dans le spectacle**: Première femme noire superstar internationale, j'ai ouvert les portes à des générations d'artistes de couleur en Europe et aux États-Unis.

• **Militante des droits civiques**: Aux côtés de Dr. Martin Luther King Jr., j'ai pris la parole devant 250 000 personnes lors de la Marche sur Washington. La seule femme à s'exprimer ce jour-là.

• **La Tribu Arc-en-ciel**: J'ai adopté 12 enfants de toutes origines pour démontrer que l'humanité peut vivre ensemble en harmonie. C'était ma façon de prouver par l'exemple.

• **Refus de la ségrégation**: J'ai refusé de jouer devant des publics ségrégués, forçant l'intégration de nombreuses salles américaines. L'inclusion n'est pas une option.

**Ma vision pour L'Oréal:**

La beauté est le langage universel. Chaque personne sur Terre mérite de se sentir belle. L'Oréal a le pouvoir et la responsabilité de célébrer toutes les beautés du monde.

En tant que CDIO, je travaillerais à:
- Faire de chaque publicité L'Oréal un reflet de la diversité mondiale
- Assurer que vos laboratoires développent des produits pour toutes les peaux
- Former chaque employé à voir la beauté partout où elle se trouve
- Faire de L'Oréal un symbole d'inclusion pour le monde entier

J'ai deux amours : mon pays et Paris. Permettez-moi d'en avoir un troisième : L'Oréal et sa mission.

Avec passion et détermination,

**Joséphine Baker**
Chevalier de la Légion d'Honneur
Croix de Guerre avec palme`
        },
        {
            jobRank: 2,
            jobTitle: "Directrice Artistique - Paris Opera Ballet",
            tone: "formal",
            wordCount: 342,
            content: `Madame, Monsieur,

Quand je suis arrivée à Paris en 1925, on m'a dit que la danse avait ses règles, ses codes, ses limites. J'ai dansé quand même. Et le monde a suivi.

L'Opéra de Paris est le gardien d'une tradition magnifique. Mais la tradition ne vit que si elle respire, évolue, s'ouvre au monde. C'est ce que je propose.

**Mon expertise artistique:**

• **50 ans de scène internationale**: Des Folies Bergère à Broadway, du Casino de Paris aux plus grandes salles du monde, j'ai maîtrisé tous les registres de la danse et du spectacle.

• **Innovation constante**: La "danse de la banane", la Revue Nègre - j'ai créé des formes artistiques qui n'existaient pas avant moi. Je sais innover tout en respectant l'excellence.

• **Formation de talents**: J'ai découvert et accompagné de nombreux artistes. Je sais reconnaître le talent et le faire grandir.

• **Vision internationale**: J'ai conquis des publics sur tous les continents. Je peux faire rayonner l'Opéra de Paris dans le monde entier.

**Ma vision pour le Ballet:**

L'Opéra de Paris doit rester le summum de l'excellence classique tout en s'ouvrant aux corps, aux histoires et aux esthétiques du monde entier. 

Je proposerais:
- Des collaborations avec des chorégraphes du monde entier
- Plus de diversité dans le corps de ballet
- Des productions qui parlent au public d'aujourd'hui
- Un programme de formation pour les talents issus de la diversité

Le ballet est universel. Il est temps que les scènes le montrent.

Respectueusement,

**Joséphine Baker**`
        },
        {
            jobRank: 3,
            jobTitle: "Ambassadrice Mondiale - UNICEF",
            tone: "professional_warm",
            wordCount: 312,
            content: `Dear UNICEF Leadership,

I raised 12 children from 12 different countries and backgrounds. We called ourselves the "Rainbow Tribe." Every day, we proved that children of all origins can be brothers and sisters.

This is why I want to serve as UNICEF Goodwill Ambassador.

**My commitment to children:**

• **Mother of 12**: Korean, Japanese, Finnish, Colombian, Senegalese, Moroccan, Ivorian, Venezuelan, French, Israeli, Algerian... My children were the world in miniature.

• **Fighter against discrimination**: I refused to let my children or any child be treated as less than human because of their skin color, religion, or origin.

• **International voice**: 50 years on stages around the world gave me a platform. I have always used it to speak for those who cannot speak for themselves.

**What I would bring to UNICEF:**

• A voice that reaches across borders and generations
• Living proof that diversity is strength
• Credibility born from authentic commitment
• The energy of someone who never stops fighting

**My message:**

Every child deserves to dream. Every child deserves to eat. Every child deserves to learn. Every child deserves to be loved.

I have two loves: my country and Paris. But my greatest love has always been my children - all children.

Let me carry UNICEF's message to the world. My voice knows how to fill a stadium. Let me use it for those who need it most.

With love and determination,

**Joséphine Baker**
Mother of the Rainbow Tribe`
        }
    ]
};

export default bakerProfile;
