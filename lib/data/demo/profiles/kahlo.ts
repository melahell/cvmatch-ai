/**
 * Profil Démo : Frida Kahlo
 * 
 * Peintre mexicaine, icône féministe et culturelle.
 * 1907-1954
 */

import { DemoProfile } from "../types";
import { RAGComplete } from "@/types/rag-complete";

// =============================================================================
// PROFIL RAG
// =============================================================================

const kahloRAG: RAGComplete = {
    profil: {
        nom: "Kahlo",
        prenom: "Frida",
        titre_principal: "Artiste Peintre & Icône Culturelle",
        titres_alternatifs: [
            "Peintre surréaliste",
            "Artiste féministe",
            "Icône du mexicanisme",
            "Maestra de Casa Azul"
        ],
        localisation: "Mexico City, Mexique",
        disponibilite: "Disponible pour expositions et collaborations",
        mobilite: ["Mexico City", "Paris", "New York"],
        contact: {
            email: "frida@casaazul.art",
            portfolio: "https://museofridakahlo.org"
        },
        photo_url: undefined,
        elevator_pitch: "Artiste peintre mexicaine dont l'œuvre intensément personnelle a marqué l'histoire de l'art du 20e siècle. Créatrice d'un style unique mêlant réalisme magique, symbolisme précolombien et introspection psychologique. Plus de 200 œuvres dont 55 autoportraits explorant l'identité, la douleur et la résilience. Première artiste mexicaine exposée au Louvre. Mon art transforme la souffrance en beauté et fait de chaque blessure une fleur.",
        objectif_carriere: "Exprimer la vérité de l'expérience humaine à travers l'art, célébrer l'identité mexicaine et inspirer ceux qui souffrent à transformer leur douleur en création."
    },
    experiences: [
        {
            id: "exp_artiste",
            poste: "Artiste Peintre Indépendante",
            entreprise: "Casa Azul Studio",
            type_entreprise: "startup",
            secteur: "Arts / Peinture",
            lieu: "Coyoacán, Mexico City, Mexique",
            type_contrat: "freelance",
            debut: "1926-01",
            fin: "1954-07",
            actuel: false,
            duree_mois: 342,
            contexte: "Carrière artistique née d'un accident de bus dévastateur à 18 ans. De mon lit d'hôpital, j'ai commencé à peindre avec un miroir au-dessus de moi. L'art est devenu ma survie.",
            realisations: [
                {
                    id: "real_obras",
                    description: "Création de plus de 200 œuvres originales dont 55 autoportraits iconiques, explorant l'identité, le corps, la douleur et l'amour",
                    impact: "Œuvres présentes dans les plus grands musées du monde, prix records en ventes aux enchères (jusqu'à 35M$)",
                    quantification: {
                        type: "volume",
                        valeur: "200",
                        unite: "œuvres",
                        display: "200+ œuvres créées"
                    },
                    keywords_ats: ["peinture", "autoportrait", "art mexicain", "symbolisme"],
                    sources: ["museo_frida"]
                },
                {
                    id: "real_louvre",
                    description: "Première artiste mexicaine à avoir une œuvre acquise par le Musée du Louvre (Autoportrait 'The Frame', 1938)",
                    impact: "Reconnaissance internationale historique, ouverture des portes aux artistes latino-américains en Europe",
                    keywords_ats: ["international", "pionnière", "reconnaissance", "excellence"],
                    sources: ["louvre"]
                },
                {
                    id: "real_expositions",
                    description: "Première exposition solo à New York (1938) et Paris (1939), acclamée par André Breton et le mouvement surréaliste",
                    impact: "Consécration internationale, entrée dans les cercles artistiques les plus influents de l'époque",
                    keywords_ats: ["expositions", "internationalisation", "surréalisme"],
                    sources: ["biographie"]
                }
            ],
            technologies: ["Peinture à l'huile", "Techniques mixtes", "Symbolisme précolombien"],
            outils: ["Pinceaux fins", "Miroir", "Chevalet adapté au lit"],
            methodologies: ["Art autobiographique", "Symbolisme personnel", "Catharsis créative"],
            clients_references: ["Louvre", "MoMA", "Collectionneurs privés", "Galerie Julien Levy"],
            sources: ["museo_frida", "louvre"],
            last_updated: "2026-01-19",
            merge_count: 1
        },
        {
            id: "exp_prof",
            poste: "Professeure de Peinture",
            entreprise: "La Esmeralda - École Nationale de Peinture, Sculpture et Gravure",
            type_entreprise: "public",
            secteur: "Éducation Artistique",
            lieu: "Mexico City, Mexique",
            type_contrat: "cdi",
            debut: "1943-01",
            fin: "1954-07",
            actuel: false,
            duree_mois: 138,
            contexte: "Enseignement de la peinture aux jeunes artistes mexicains, malgré ma santé fragile qui m'a obligée à enseigner depuis Casa Azul.",
            realisations: [
                {
                    id: "real_fridos",
                    description: "Formation d'une génération d'artistes mexicains exceptionnels, connus sous le nom de 'Los Fridos'",
                    impact: "Mouvement artistique influent, continuation de mon héritage artistique et philosophique",
                    keywords_ats: ["enseignement", "mentorat", "influence", "héritage"],
                    sources: ["museo_frida"]
                },
                {
                    id: "real_methode",
                    description: "Développement d'une pédagogie unique : enseignement informel à Casa Azul, immersion dans la culture populaire mexicaine",
                    impact: "Méthode reprise et célébrée, influence sur l'enseignement artistique au Mexique",
                    keywords_ats: ["pédagogie", "innovation", "culture populaire"],
                    sources: ["biographie"]
                }
            ],
            technologies: [],
            outils: [],
            methodologies: ["Enseignement informel", "Apprentissage par l'immersion", "Art populaire mexicain"],
            clients_references: ["Arturo García Bustos", "Guillermo Monroy"],
            sources: ["museo_frida"],
            last_updated: "2026-01-19",
            merge_count: 1
        },
        {
            id: "exp_politique",
            poste: "Militante Communiste et Féministe",
            entreprise: "Parti Communiste Mexicain / Mouvements féministes",
            type_entreprise: "startup",
            secteur: "Activisme Politique",
            lieu: "Mexique / International",
            type_contrat: "freelance",
            debut: "1928-01",
            fin: "1954-07",
            actuel: false,
            duree_mois: 318,
            contexte: "Engagement politique fort aux côtés de Diego Rivera, accueil de Léon Trotsky, militantisme pour les droits des femmes et des travailleurs.",
            realisations: [
                {
                    id: "real_trotsky",
                    description: "Accueil de Léon Trotsky à Casa Azul pendant son exil mexicain (1937-1939)",
                    impact: "Moment historique, positionnement politique affirmé",
                    keywords_ats: ["politique", "histoire", "engagement"],
                    sources: ["biographie"]
                },
                {
                    id: "real_manif",
                    description: "Participation à des manifestations politiques jusqu'à 11 jours avant ma mort, malgré la maladie",
                    impact: "Symbole de l'engagement jusqu'au bout, militantisme incarné",
                    keywords_ats: ["militantisme", "courage", "conviction"],
                    sources: ["biographie"]
                }
            ],
            technologies: [],
            outils: [],
            methodologies: ["Art engagé", "Militantisme par l'exemple"],
            clients_references: ["Diego Rivera", "Léon Trotsky"],
            sources: ["biographie"],
            last_updated: "2026-01-19",
            merge_count: 1
        }
    ],
    competences: {
        explicit: {
            techniques: [
                { nom: "Peinture à l'huile", niveau: "expert", annees_experience: 28 },
                { nom: "Autoportrait", niveau: "expert", annees_experience: 28 },
                { nom: "Symbolisme mexicain", niveau: "expert", annees_experience: 28 },
                { nom: "Enseignement artistique", niveau: "avance", annees_experience: 11 },
                { nom: "Art thérapeutique", niveau: "expert", annees_experience: 28 }
            ],
            soft_skills: [
                "Résilience extraordinaire",
                "Authenticité absolue",
                "Expression émotionnelle intense",
                "Engagement politique",
                "Charisme magnétique",
                "Humour face à l'adversité",
                "Force de caractère",
                "Capacité de sublimation"
            ],
            methodologies: [
                "Art comme catharsis",
                "Autobiographie visuelle",
                "Symbolisme personnel et culturel"
            ]
        },
        inferred: { techniques: [], tools: [], soft_skills: [] },
        par_domaine: {
            "Peinture": ["Portrait", "Symbolisme", "Art populaire mexicain", "Réalisme magique"],
            "Enseignement": ["Pédagogie informelle", "Mentorat", "Transmission culturelle"]
        }
    },
    formations: [
        {
            id: "form_autodidacte",
            type: "formation",
            titre: "Formation autodidacte en peinture",
            organisme: "Autodidacte + mentors",
            lieu: "Mexico City, Mexique",
            date_debut: "1926",
            date_fin: "1930",
            annee: "1926-1930",
            en_cours: false,
            specialite: "Peinture à l'huile, autoportrait",
            details: "Apprentissage suite à l'accident de bus, 18 ans. Peinture de convalescence devenue vocation. Influences : ex-votos mexicains, art précolombien, maîtres européens",
            sources: ["museo_frida"]
        },
        {
            id: "form_preparatoria",
            type: "diplome",
            titre: "Études à la Escuela Nacional Preparatoria",
            organisme: "Escuela Nacional Preparatoria",
            lieu: "Mexico City",
            date_debut: "1922",
            date_fin: "1925",
            annee: "1922-1925",
            en_cours: false,
            specialite: "Sciences (destinée à la médecine)",
            details: "Une des 35 femmes admises parmi 2000 étudiants. Études interrompues par l'accident",
            sources: ["biographie"]
        }
    ],
    certifications: [],
    langues: [
        { langue: "Espagnol", niveau: "Natif", niveau_cecrl: "C2" },
        { langue: "Anglais", niveau: "Courant", niveau_cecrl: "B2", details: "Expositions à New York" },
        { langue: "Allemand", niveau: "Intermédiaire", niveau_cecrl: "B1", details: "Héritage paternel" },
        { langue: "Français", niveau: "Intermédiaire", niveau_cecrl: "B1", details: "Séjour à Paris" }
    ],
    references: {
        clients: [
            { nom: "Musée du Louvre", secteur: "Musées", type: "international", annees: ["1939"], confidentiel: false },
            { nom: "MoMA New York", secteur: "Musées", type: "international", annees: ["1940"], confidentiel: false },
            { nom: "Galerie Julien Levy", secteur: "Galeries", type: "startup", annees: ["1938"], confidentiel: false }
        ],
        projets_marquants: [
            {
                id: "proj_dos_fridas",
                nom: "Les Deux Fridas (1939)",
                description: "Double autoportrait symbolisant la dualité de mon identité après le divorce avec Diego Rivera",
                annee: "1939",
                technologies: ["Huile sur toile", "Symbolisme"],
                resultats: "Œuvre majeure, collection permanente du Museo de Arte Moderno de Mexico",
                sources: ["museo_frida"]
            }
        ]
    },
    metadata: {
        version: "2.0.0",
        created_at: "2026-01-19T00:00:00Z",
        last_updated: "2026-01-19T00:00:00Z",
        last_merge_at: "2026-01-19T00:00:00Z",
        sources_count: 3,
        documents_sources: ["museo_frida", "louvre", "biographie"],
        completeness_score: 90,
        merge_history: []
    }
};

// =============================================================================
// PROFIL DÉMO COMPLET
// =============================================================================

export const kahloProfile: DemoProfile = {
    meta: {
        id: "kahlo",
        name: "Frida Kahlo",
        shortName: "Frida",
        period: "1907-1954",
        icon: "🌺",
        title: "Peintre & Icône",
        nationality: "Mexicaine",
        quote: "Pieds, pourquoi en aurais-je besoin si j'ai des ailes pour voler?",
        categories: ["art"]
    },
    rag: kahloRAG,
    completenessScore: 90,
    generationTimeMs: 798,
    cvs: [
        {
            templateId: "modern",
            templateName: "Standard",
            templateDescription: "Format professionnel adapté aux arts",
            pdfUrl: "/demo-cvs/kahlo-modern.pdf",
            previewUrl: "/demo-cvs/previews/kahlo-modern.png",
            recommended: false
        },
        {
            templateId: "classic",
            templateName: "Classique",
            templateDescription: "Design sobre et élégant",
            pdfUrl: "/demo-cvs/kahlo-classic.pdf",
            previewUrl: "/demo-cvs/previews/kahlo-classic.png",
            recommended: false
        },
        {
            templateId: "creative",
            templateName: "Créatif",
            templateDescription: "Layout coloré et expressif",
            pdfUrl: "/demo-cvs/kahlo-creative.pdf",
            previewUrl: "/demo-cvs/previews/kahlo-creative.png",
            recommended: true
        },
        {
            templateId: "tech",
            templateName: "ATS Optimisé",
            templateDescription: "Focus compétences et réalisations",
            pdfUrl: "/demo-cvs/kahlo-tech.pdf",
            previewUrl: "/demo-cvs/previews/kahlo-tech.png",
            recommended: false
        }
    ],
    jobs: [
        {
            rank: 1,
            title: "Directrice Artistique",
            company: "Museo Frida Kahlo (Casa Azul)",
            matchScore: 99,
            salaryMin: 80000,
            salaryMax: 120000,
            currency: "MXN",
            contractType: "CDI",
            sectors: ["Musées", "Art", "Culture"],
            location: "Coyoacán, Mexico City",
            remotePolicy: "Présentiel",
            whyMatch: "La Casa Azul n'est pas un simple musée. C'est ma maison, mon refuge, le lieu où j'ai transformé ma douleur en art. Qui mieux que moi peut honorer cet héritage et le transmettre aux générations futures?",
            keySkills: ["Direction artistique", "Conservation", "Vision curatoriale", "Patrimoine culturel"],
            jobDescription: "Le Museo Frida Kahlo recherche un(e) Directeur(rice) Artistique pour superviser les collections permanentes et temporaires. Responsabilités : préserver l'authenticité de Casa Azul, développer la programmation culturelle, accueillir les 500 000 visiteurs annuels avec excellence. Profil : expertise artistique, connaissance intime de l'œuvre de Frida Kahlo, capacité à transmettre l'émotion au public."
        },
        {
            rank: 2,
            title: "Ambassadrice Culturelle",
            company: "Gouvernement du Mexique - Secretaría de Cultura",
            matchScore: 95,
            salaryMin: 90000,
            salaryMax: 140000,
            currency: "USD",
            contractType: "CDI",
            sectors: ["Diplomatie culturelle", "Arts", "Relations internationales"],
            location: "International",
            remotePolicy: "Missions internationales",
            whyMatch: "J'ai porté le Mexique dans chaque tableau, chaque robe Tehuana, chaque fleur dans mes cheveux. Première artiste mexicaine au Louvre, je peux représenter notre culture avec authenticité et passion.",
            keySkills: ["Représentation culturelle", "Communication", "Art mexicain", "Diplomatie"],
            jobDescription: "Le Mexique recherche une Ambassadrice Culturelle pour promouvoir l'art et la culture mexicaine dans le monde. Missions : représenter le Mexique dans les événements culturels internationaux, développer des partenariats avec les grands musées, porter la voix de l'art latino-américain. Profil : artiste reconnue internationalement incarnant les valeurs culturelles mexicaines."
        },
        {
            rank: 3,
            title: "Directrice Créative",
            company: "Maison de Mode de Luxe",
            matchScore: 91,
            salaryMin: 150000,
            salaryMax: 250000,
            currency: "EUR",
            contractType: "CDI",
            sectors: ["Mode", "Luxe", "Design"],
            location: "Paris / Mexico",
            remotePolicy: "Hybride",
            whyMatch: "Mes robes Tehuana, mes fleurs dans les cheveux, mes bijoux précolombiens - tout me définit. Le luxe n'est pas dans le prix, c'est dans l'authenticité. Ma vision de la mode comme expression de l'identité est unique.",
            keySkills: ["Direction créative", "Mode", "Identité visuelle", "Innovation"],
            jobDescription: "Maison de luxe en quête de renouvellement recherche un(e) Directeur(rice) Créatif(ve) capable de réinventer l'artisanat et l'identité culturelle dans la mode. Responsabilités : collections saisonnières, collaborations artistiques, positionnement de marque. Profil : créateur(rice) au style iconique, capable de transformer l'héritage culturel en désirabilité contemporaine."
        },
        {
            rank: 4,
            title: "Artiste en Résidence",
            company: "Fondation Beyeler (Suisse)",
            matchScore: 88,
            salaryMin: 60000,
            salaryMax: 90000,
            currency: "EUR",
            contractType: "CDD",
            sectors: ["Art", "Fondation", "Création"],
            location: "Bâle, Suisse",
            remotePolicy: "Présentiel",
            whyMatch: "Mon parcours artistique unique - né de la douleur, forgé dans la résilience - apporterait une perspective précieuse à une résidence de création. La Fondation Beyeler comprend la puissance de l'art personnel.",
            keySkills: ["Création artistique", "Résidence", "Exposition", "Médiation"],
            jobDescription: "La Fondation Beyeler propose une résidence de 12 mois à un(e) artiste majeur(e). Le résident créera une série d'œuvres sur place, participera à la programmation culturelle, et présentera une exposition finale. Budget de création généreux, logement et atelier fournis."
        },
        {
            rank: 5,
            title: "Curatrice - Art Latino-américain",
            company: "Metropolitan Museum of Art",
            matchScore: 85,
            salaryMin: 70000,
            salaryMax: 100000,
            currency: "USD",
            contractType: "CDI",
            sectors: ["Musées", "Curation", "Art latino-américain"],
            location: "New York, USA",
            remotePolicy: "Présentiel",
            whyMatch: "Ma connaissance intime de l'art mexicain et latino-américain, ma sensibilité aux artistes marginalisés et mon œil pour l'authenticité font de moi une curatrice idéale pour représenter notre continent.",
            keySkills: ["Curation", "Art latino-américain", "Recherche", "Programmation"],
            jobDescription: "Le Met recherche un(e) Curateur(rice) pour développer sa collection d'art latino-américain. Responsabilités : acquisitions, expositions temporaires, catalogues, partenariats avec musées latino-américains. Profil : expertise en art latino-américain du 20e siècle, réseau international, vision curatoriale affirmée."
        },
        {
            rank: 6,
            title: "Professeure d'Art",
            company: "UNAM - Universidad Nacional Autónoma de México",
            matchScore: 82,
            salaryMin: 55000,
            salaryMax: 80000,
            currency: "USD",
            contractType: "CDI",
            sectors: ["Éducation", "Art", "Université"],
            location: "Mexico City",
            remotePolicy: "Présentiel",
            whyMatch: "J'ai formé 'Los Fridos' avec passion et dévouement. Transmettre ma vision de l'art comme expression de soi et de la culture populaire mexicaine est ma vocation.",
            keySkills: ["Enseignement", "Art", "Pédagogie", "Mentorat"],
            jobDescription: "L'UNAM recherche un(e) Professeur(e) d'Art pour sa licence et son master en arts visuels. Responsabilités : enseigner la peinture, superviser des projets étudiants, conduire des recherches. Profil : artiste reconnu(e) avec experience pédagogique et engagement pour la formation de la prochaine génération."
        },
        {
            rank: 7,
            title: "Conférencière Inspirante",
            company: "TEDx / Entreprises internationales",
            matchScore: 79,
            salaryMin: 50000,
            salaryMax: 100000,
            currency: "USD",
            contractType: "Freelance",
            sectors: ["Conférences", "Inspiration", "Résilience"],
            location: "International",
            remotePolicy: "Événements + Remote",
            whyMatch: "Mon histoire de résilience - transformer un accident dévastateur en carrière artistique mondiale - inspire des millions de personnes. Ma douleur est devenue mon art, et mon art inspire le courage.",
            keySkills: ["Prise de parole", "Inspiration", "Storytelling", "Résilience"],
            jobDescription: "Agence de conférenciers recherche des speakers exceptionnels sur les thèmes de la résilience, de la créativité et du dépassement de soi. Le speaker présentera son histoire personnelle transformée en leçons universelles. Profil : personnalité charismatique avec parcours extraordinaire et capacité à émouvoir."
        },
        {
            rank: 8,
            title: "Directrice Diversité & Inclusion",
            company: "Groupe de Luxe International",
            matchScore: 76,
            salaryMin: 100000,
            salaryMax: 150000,
            currency: "USD",
            contractType: "CDI",
            sectors: ["Corporate", "D&I", "Luxe"],
            location: "International",
            remotePolicy: "Hybride",
            whyMatch: "Femme, handicapée, bisexuelle, communiste dans un monde patriarcal - j'ai vécu la différence et en ai fait une force. Mon authenticité absolue peut guider les entreprises vers une vraie inclusion.",
            keySkills: ["Diversité & Inclusion", "Authenticité", "Changement culturel", "Leadership"],
            jobDescription: "Groupe de luxe recherche un(e) Directeur(rice) D&I pour transformer sa culture d'entreprise. Responsabilités : stratégie D&I globale, formation des équipes, partenariats avec communautés sous-représentées. Profil : leader authentique ayant vécu la diversité, capable d'inspirer le changement."
        },
        {
            rank: 9,
            title: "Art-thérapeute Senior",
            company: "Hôpital Universitaire de Mexico",
            matchScore: 73,
            salaryMin: 45000,
            salaryMax: 70000,
            currency: "USD",
            contractType: "CDI",
            sectors: ["Santé", "Art-thérapie", "Psychologie"],
            location: "Mexico City",
            remotePolicy: "Présentiel",
            whyMatch: "L'art m'a sauvé la vie. Peindre depuis mon lit d'hôpital m'a permis de transcender la douleur. Je peux aider d'autres patients à découvrir le pouvoir transformateur de la création.",
            keySkills: ["Art-thérapie", "Accompagnement", "Douleur chronique", "Réhabilitation"],
            jobDescription: "Le service de réhabilitation recherche un(e) art-thérapeute pour accompagner les patients en douleur chronique et longue maladie. Méthodologie : utilisation de la création artistique comme outil thérapeutique. Profil : artiste avec expérience personnelle de la maladie et formation en accompagnement."
        },
        {
            rank: 10,
            title: "Auteure - Mémoires",
            company: "Éditions Penguin Random House",
            matchScore: 70,
            salaryMin: 40000,
            salaryMax: 80000,
            currency: "USD",
            contractType: "Freelance",
            sectors: ["Édition", "Autobiographie", "Littérature"],
            location: "Remote",
            remotePolicy: "Full remote",
            whyMatch: "Mon journal intime et mes lettres sont déjà des témoignages poignants. Structurer mes mémoires serait offrir au monde une vision complète de ma vie, de mes amours et de mon art.",
            keySkills: ["Écriture", "Autobiographie", "Storytelling", "Introspection"],
            jobDescription: "Maison d'édition recherche des voix exceptionnelles pour sa collection de mémoires. Format libre : autobiographie traditionnelle, journal illustré, correspondance annotée. Accompagnement éditorial premium pour artistes non-écrivains."
        }
    ],
    coverLetters: [
        {
            jobRank: 1,
            jobTitle: "Directrice Artistique - Museo Frida Kahlo",
            tone: "professional_warm",
            wordCount: 378,
            content: `Querido Comité,

La Casa Azul n'est pas un simple musée. C'est ma maison, mon refuge, le lieu où j'ai transformé ma douleur en art. Chaque mur bleu, chaque objet, chaque coin de jardin porte mon souffle.

Qui mieux que moi peut honorer cet héritage et le transmettre aux générations futures?

**Ce que j'apporte à la Casa Azul:**

• **Connaissance intime de chaque objet**: Je sais pourquoi ce miroir est accroché au-dessus de ce lit. Je sais pourquoi ces ex-votos sont alignés ainsi. Je sais pourquoi les papillons de Diego sont dans ce coin.

• **Vision artistique authentique et sans compromis**: Mon art n'a jamais suivi les modes. Il a exprimé la vérité. Je maintiendrais cette intégrité dans chaque exposition, chaque événement.

• **Capacité à connecter l'art avec les visiteurs**: Mes tableaux parlent directement au cœur. Je ferais en sorte que chaque visiteur reparte touché, transformé.

• **Réseau international dans le monde de l'art**: André Breton, Pablo Picasso, Trotsky, Diego... J'ai côtoyé les plus grands. Ces connexions peuvent enrichir la programmation.

**Ma vision pour la Casa Azul:**

La Casa Azul doit rester ce qu'elle a toujours été : un lieu de vérité. Pas un musée clinique et froid, mais une maison vivante où l'on ressent l'amour, la douleur, la passion et la création.

Je proposerais:
- Des expositions temporaires mettant en dialogue mon œuvre avec des artistes contemporains
- Des résidences pour jeunes artistes latino-américains
- Des programmes éducatifs pour les enfants de Coyoacán
- La préservation absolue de l'atmosphère authentique de la maison

"Pieds, pourquoi en aurais-je besoin si j'ai des ailes pour voler?" J'ai écrit cela dans mon journal. La Casa Azul doit donner des ailes à tous ceux qui la visitent.

Con cariño y determinación,

**Frida Kahlo**
Artista, Maestra, Guardiana de Casa Azul 🌺`
        },
        {
            jobRank: 2,
            jobTitle: "Ambassadrice Culturelle - Mexique",
            tone: "formal",
            wordCount: 342,
            content: `Estimados Señores,

J'ai porté le Mexique dans chaque tableau, chaque robe, chaque geste de ma vie.

Quand Paris m'a accueillie en 1939, ce n'était pas seulement Frida Kahlo qui arrivait. C'était le Mexique entier : nos couleurs, nos traditions, notre douleur et notre joie. André Breton m'a appelée "un ruban autour d'une bombe." Ce ruban était tissé de fils mexicains.

**Mes atouts pour représenter le Mexique:**

• **Première artiste mexicaine au Louvre**: En 1939, mon "Autoportrait au cadre" est devenu la première œuvre d'un artiste mexicain acquise par ce musée légendaire. J'ai ouvert une porte.

• **Incarnation de la culture mexicaine**: Mes robes Tehuana, mes bijoux précolombiens, mes fleurs dans les cheveux - tout cela n'est pas un costume, c'est mon identité et celle de mon peuple.

• **Reconnaissance internationale**: De New York à Paris, de Londres à Tokyo, mon nom évoque immédiatement le Mexique. Cette visibilité est un outil.

• **Capacité de communication émotionnelle**: Mes tableaux parlent sans mots, traversant les cultures et les langues.

**Ce que je ferais comme Ambassadrice:**

- Porter nos traditions et notre art contemporain dans chaque capitale
- Créer des ponts entre les musées mexicains et les grandes institutions mondiales
- Défendre les artistes émergents mexicains sur la scène internationale
- Montrer que la culture mexicaine est vivante, pas folklorique

Le Mexique m'a donné la vie, la couleur et la force de survivre. Permettez-moi de rendre au monde ce que mon pays m'a donné.

Respetuosamente,

**Frida Kahlo**
Primera artista mexicana en el Louvre`
        },
        {
            jobRank: 3,
            jobTitle: "Directrice Créative - Maison de Luxe",
            tone: "creative",
            wordCount: 298,
            content: `Bonjour,

Mes robes Tehuana, mes fleurs dans les cheveux, mes bijoux précolombiens - tout me définit. Chaque matin devant mon miroir, je crée une œuvre d'art vivante.

Le luxe n'est pas dans le prix. C'est dans l'authenticité.

**Ma vision de la mode:**

Chaque détail de mon style raconte une histoire. Les couleurs vives célèbrent la joie malgré la douleur. Les fleurs dans mes cheveux sont une couronne que je me suis donnée. Les bijoux précolombiens honorent mes ancêtres. Les robes longues cachent mes jambes abîmées tout en affirmant ma féminité.

La mode n'est pas ce qu'on porte. C'est qui on EST.

**Ce que j'apporterais:**

• **Authentic luxury**: Pas le clinquant, mais la profondeur. Chaque pièce doit avoir une histoire, une âme, une raison d'être.

• **Cultural storytelling**: Les traditions mexicaines - broderies, couleurs, symboles - réinterprétées pour le monde contemporain.

• **Inclusive beauty**: La beauté n'a pas de taille, pas d'âge, pas de norme. Mon corps brisé est devenu un temple. Votre marque peut célébrer tous les corps.

• **Art as fashion**: Mes tableaux sont portables. Vos vêtements peuvent être des œuvres d'art.

**Mon rêve pour votre maison:**

Une collection où chaque cliente se sent non pas belle selon les standards des autres, mais authentique selon les siens. Où le vêtement devient armure et ailes en même temps.

Créons ensemble quelque chose de mémorable. Quelque chose de vrai.

**Frida** 🌺

P.S. - Les sourcils ne seront pas épilés. C'est non négociable.`
        }
    ]
};

export default kahloProfile;
