/**
 * Profil Démo : Cléopâtre VII Philopator
 * 
 * Dernière reine d'Égypte, stratège politique et diplomate.
 * 69-30 av. J.-C.
 */

import { DemoProfile } from "../types";
import { RAGComplete } from "@/types/rag-complete";

// =============================================================================
// PROFIL RAG
// =============================================================================

const cleopatraRAG: RAGComplete = {
    profil: {
        nom: "Ptolémée",
        prenom: "Cléopâtre VII Philopator",
        titre_principal: "Reine d'Égypte & Stratège Diplomatique",
        titres_alternatifs: [
            "Pharaon d'Égypte",
            "Reine des Rois",
            "Nouvelle Isis",
            "Maîtresse de la Diplomatie Méditerranéenne"
        ],
        localisation: "Alexandrie, Égypte",
        disponibilite: "Disponible pour missions diplomatiques de haut niveau",
        mobilite: ["Alexandrie", "Rome", "Méditerranée"],
        contact: {
            email: "cleopatra@ptolemaic.gov",
            portfolio: "https://bibliotheca-alexandrina.org"
        },
        photo_url: undefined,
        elevator_pitch: "Dernière souveraine de la dynastie ptolémaïque, ayant gouverné l'Égypte pendant 21 ans avec une intelligence politique exceptionnelle. Polyglotte maîtrisant 9 langues, je suis la première Ptolémée à avoir appris l'égyptien, créant un lien unique avec mon peuple. Face à la superpuissance romaine, j'ai maintenu l'indépendance égyptienne par une diplomatie audacieuse et des alliances stratégiques avec Jules César et Marc Antoine. Gestionnaire économique avisée, j'ai redressé les finances du royaume et financé une flotte de 200 navires.",
        objectif_carriere: "Préserver la souveraineté de l'Égypte et sa civilisation millénaire face aux puissances étrangères, tout en modernisant ses structures économiques et culturelles."
    },
    experiences: [
        {
            id: "exp_pharaon",
            poste: "Pharaon d'Égypte",
            entreprise: "Royaume Ptolémaïque d'Égypte",
            type_entreprise: "public",
            secteur: "Gouvernement / Monarchie",
            lieu: "Alexandrie, Égypte",
            type_contrat: "cdi",
            debut: "-51",
            fin: "-30",
            actuel: false,
            duree_mois: 252,
            contexte: "Règne tumultueux marqué par des guerres civiles avec mes frères, des invasions romaines et la nécessité de naviguer la géopolitique complexe de la Méditerranée.",
            budget_gere: "Budget de l'État égyptien (équivalent milliards $)",
            equipe_size: 50000,
            realisations: [
                {
                    id: "real_economie",
                    description: "Redressement économique complet de l'Égypte : réforme fiscale, dévaluation monétaire contrôlée, développement du commerce méditerranéen",
                    impact: "Augmentation des revenus de l'État de 40%, financement d'une flotte de 200 navires et d'une armée moderne",
                    quantification: {
                        type: "pourcentage",
                        valeur: "40",
                        unite: "augmentation revenus",
                        display: "+40% de revenus fiscaux"
                    },
                    keywords_ats: ["économie", "réforme", "finances publiques", "redressement"],
                    sources: ["plutarque"]
                },
                {
                    id: "real_independance",
                    description: "Maintien de l'indépendance égyptienne face à Rome pendant 21 ans grâce à une diplomatie stratégique et des alliances matrimoniales",
                    impact: "L'Égypte reste le dernier grand royaume indépendant de la Méditerranée orientale, 20 ans de plus que prévu",
                    quantification: {
                        type: "delai",
                        valeur: "21",
                        unite: "années d'indépendance",
                        display: "21 ans d'indépendance préservée"
                    },
                    keywords_ats: ["diplomatie", "indépendance", "souveraineté", "stratégie"],
                    sources: ["plutarque"]
                },
                {
                    id: "real_flotte",
                    description: "Construction et financement d'une flotte de 200 navires de guerre, faisant de l'Égypte une puissance navale majeure",
                    impact: "Contribution décisive aux forces d'Antoine à Actium, contrôle des routes commerciales méditerranéennes",
                    quantification: {
                        type: "volume",
                        valeur: "200",
                        unite: "navires",
                        display: "200 navires de guerre"
                    },
                    keywords_ats: ["marine", "défense", "investissement", "puissance militaire"],
                    sources: ["dio_cassius"]
                }
            ],
            technologies: ["Gouvernance monarchique", "Administration ptolémaïque", "Diplomatie antique"],
            outils: [],
            methodologies: ["Diplomatie directe", "Alliances stratégiques", "Réformes économiques"],
            clients_references: ["Jules César", "Marc Antoine", "Peuple égyptien"],
            sources: ["plutarque", "dio_cassius"],
            last_updated: "2026-01-19",
            merge_count: 1
        },
        {
            id: "exp_cesar",
            poste: "Alliée Stratégique & Conseillère",
            entreprise: "Alliance avec Jules César",
            type_entreprise: "grand_groupe",
            secteur: "Relations Internationales / Partenariat",
            lieu: "Alexandrie / Rome",
            type_contrat: "mission",
            debut: "-48",
            fin: "-44",
            actuel: false,
            duree_mois: 48,
            contexte: "Alliance politique et personnelle avec le maître de Rome pour sécuriser le trône d'Égypte et obtenir une reconnaissance internationale.",
            realisations: [
                {
                    id: "real_cesar_alliance",
                    description: "Sécurisation du trône d'Égypte par l'alliance avec César, légitimation internationale du règne",
                    impact: "Défaite de Ptolémée XIII, unification de l'Égypte sous mon autorité",
                    keywords_ats: ["alliance", "légitimation", "stratégie", "pouvoir"],
                    sources: ["plutarque"]
                },
                {
                    id: "real_rome_visit",
                    description: "Visite historique à Rome (46-44 av. J.-C.), établissement de l'Égypte comme alliée privilégiée",
                    impact: "Reconnaissance du statut de 'Reine Amie et Alliée du Peuple Romain'",
                    keywords_ats: ["diplomatie", "reconnaissance", "statut international"],
                    sources: ["suetone"]
                }
            ],
            technologies: [],
            outils: [],
            methodologies: ["Diplomatie personnelle", "Alliance matrimoniale"],
            clients_references: ["Jules César"],
            sources: ["plutarque", "suetone"],
            last_updated: "2026-01-19",
            merge_count: 1
        },
        {
            id: "exp_antoine",
            poste: "Co-Souveraine de l'Orient",
            entreprise: "Alliance avec Marc Antoine",
            type_entreprise: "grand_groupe",
            secteur: "Gouvernance Conjointe",
            lieu: "Alexandrie / Orient méditerranéen",
            type_contrat: "cdi",
            debut: "-41",
            fin: "-30",
            actuel: false,
            duree_mois: 132,
            contexte: "Partenariat politique et personnel avec Marc Antoine, triumvir de Rome, visant à créer un empire oriental indépendant de Rome.",
            realisations: [
                {
                    id: "real_donations",
                    description: "Négociation des 'Donations d'Alexandrie' (34 av. J.-C.) : attribution de territoires romains à mes enfants",
                    impact: "Expansion territoriale majeure : Césarion proclamé 'Roi des Rois', contrôle de Chypre, Cyrénaïque, Arménie",
                    keywords_ats: ["négociation", "expansion", "succès diplomatique"],
                    sources: ["plutarque"]
                },
                {
                    id: "real_actium",
                    description: "Coalition de forces navales avec Antoine pour la bataille d'Actium, engagement militaire majeur",
                    impact: "Contribution de 200 navires et ressources financières considérables",
                    keywords_ats: ["stratégie militaire", "coalition", "engagement"],
                    sources: ["dio_cassius"]
                }
            ],
            technologies: [],
            outils: [],
            methodologies: ["Partenariat égalitaire", "Co-gouvernance"],
            clients_references: ["Marc Antoine"],
            sources: ["plutarque", "dio_cassius"],
            last_updated: "2026-01-19",
            merge_count: 1
        }
    ],
    competences: {
        explicit: {
            techniques: [
                { nom: "Gouvernance d'État", niveau: "expert", annees_experience: 21 },
                { nom: "Diplomatie internationale", niveau: "expert", annees_experience: 21 },
                { nom: "Économie et finances publiques", niveau: "expert", annees_experience: 21 },
                { nom: "Stratégie militaire", niveau: "avance", annees_experience: 15 },
                { nom: "Négociation de haut niveau", niveau: "expert", annees_experience: 21 },
                { nom: "Administration publique", niveau: "expert", annees_experience: 21 }
            ],
            soft_skills: [
                "Leadership charismatique",
                "Intelligence politique exceptionnelle",
                "Multilinguisme (9 langues)",
                "Capacité de négociation",
                "Résilience face à l'adversité",
                "Vision stratégique long terme",
                "Charisme et présence",
                "Adaptabilité culturelle"
            ],
            methodologies: [
                "Diplomatie par l'alliance",
                "Soft power culturel",
                "Réforme économique structurelle"
            ]
        },
        inferred: { techniques: [], tools: [], soft_skills: [] },
        par_domaine: {
            "Politique": ["Gouvernance", "Diplomatie", "Stratégie", "Alliances"],
            "Économie": ["Finance publique", "Commerce", "Réforme fiscale"],
            "Militaire": ["Stratégie navale", "Coalition", "Défense"]
        }
    },
    formations: [
        {
            id: "form_alexandrie",
            type: "formation",
            titre: "Éducation Royale Complète",
            organisme: "Bibliothèque d'Alexandrie / Cour Ptolémaïque",
            lieu: "Alexandrie, Égypte",
            date_debut: "-60",
            date_fin: "-51",
            annee: "-60 à -51",
            en_cours: false,
            specialite: "Philosophie, sciences, langues, arts, politique, rhétorique",
            details: "Éducation d'élite à la plus grande bibliothèque du monde antique, avec les meilleurs savants de l'époque. Maîtrise de 9 langues incluant l'égyptien (première des Ptolémées).",
            sources: ["plutarque"]
        }
    ],
    certifications: [],
    langues: [
        { langue: "Grec", niveau: "Natif", niveau_cecrl: "C2", details: "Langue maternelle de la dynastie ptolémaïque" },
        { langue: "Égyptien", niveau: "Courant", niveau_cecrl: "C2", details: "Première Ptolémée à maîtriser la langue du peuple" },
        { langue: "Latin", niveau: "Courant", niveau_cecrl: "C1", details: "Pour les négociations avec Rome" },
        { langue: "Hébreu", niveau: "Courant", niveau_cecrl: "B2" },
        { langue: "Araméen", niveau: "Courant", niveau_cecrl: "B2" },
        { langue: "Arabe", niveau: "Courant", niveau_cecrl: "B2" },
        { langue: "Éthiopien", niveau: "Intermédiaire", niveau_cecrl: "B1" },
        { langue: "Persan", niveau: "Intermédiaire", niveau_cecrl: "B1" },
        { langue: "Parthe", niveau: "Intermédiaire", niveau_cecrl: "B1" }
    ],
    references: {
        clients: [
            { nom: "Empire Romain", secteur: "Relations internationales", type: "grand_compte", annees: ["-48", "-30"], confidentiel: false },
            { nom: "Jules César", secteur: "Politique", type: "grand_compte", annees: ["-48", "-44"], confidentiel: false },
            { nom: "Marc Antoine", secteur: "Politique", type: "grand_compte", annees: ["-41", "-30"], confidentiel: false }
        ],
        projets_marquants: [
            {
                id: "proj_reforme",
                nom: "Grande Réforme Économique Égyptienne",
                description: "Restructuration complète des finances de l'État : fiscalité, monnaie, commerce",
                annee: "-47",
                technologies: ["Administration ptolémaïque", "Réforme monétaire"],
                resultats: "+40% de revenus fiscaux, financement de la flotte et de l'armée",
                sources: ["plutarque"]
            },
            {
                id: "proj_donations",
                nom: "Donations d'Alexandrie",
                description: "Accord diplomatique redistribuant les territoires orientaux de Rome à la famille royale égyptienne",
                client: "Marc Antoine",
                annee: "-34",
                technologies: ["Diplomatie", "Négociation"],
                resultats: "Expansion territoriale majeure, légitimation de Césarion comme héritier de César",
                sources: ["plutarque"]
            }
        ]
    },
    metadata: {
        version: "2.0.0",
        created_at: "2026-01-19T00:00:00Z",
        last_updated: "2026-01-19T00:00:00Z",
        last_merge_at: "2026-01-19T00:00:00Z",
        sources_count: 4,
        documents_sources: ["plutarque", "dio_cassius", "suetone", "appien"],
        completeness_score: 91,
        merge_history: []
    }
};

// =============================================================================
// PROFIL DÉMO COMPLET
// =============================================================================

export const cleopatraProfile: DemoProfile = {
    meta: {
        id: "cleopatra",
        name: "Cléopâtre VII",
        shortName: "Cléopâtre",
        period: "69-30 av. J.-C.",
        icon: "👑",
        title: "Reine d'Égypte",
        nationality: "Égypte",
        quote: "Je ne serai pas exhibée lors d'un triomphe.",
        categories: ["politics", "business"]
    },
    rag: cleopatraRAG,
    completenessScore: 91,
    generationTimeMs: 734,
    cvs: [
        {
            templateId: "modern",
            templateName: "Standard",
            templateDescription: "Format professionnel pour postes exécutifs",
            pdfUrl: "/demo-cvs/cleopatra-modern.pdf",
            previewUrl: "/demo-cvs/previews/cleopatra-modern.png",
            recommended: false
        },
        {
            templateId: "classic",
            templateName: "Classique",
            templateDescription: "Design sobre et prestigieux",
            pdfUrl: "/demo-cvs/cleopatra-classic.pdf",
            previewUrl: "/demo-cvs/previews/cleopatra-classic.png",
            recommended: true
        },
        {
            templateId: "creative",
            templateName: "Créatif",
            templateDescription: "Layout royal et distinctif",
            pdfUrl: "/demo-cvs/cleopatra-creative.pdf",
            previewUrl: "/demo-cvs/previews/cleopatra-creative.png",
            recommended: false
        },
        {
            templateId: "tech",
            templateName: "ATS Optimisé",
            templateDescription: "Focus compétences de leadership",
            pdfUrl: "/demo-cvs/cleopatra-tech.pdf",
            previewUrl: "/demo-cvs/previews/cleopatra-tech.png",
            recommended: false
        }
    ],
    jobs: [
        {
            rank: 1,
            title: "CEO",
            company: "Groupe Multinational",
            matchScore: 96,
            salaryMin: 500000,
            salaryMax: 2000000,
            currency: "EUR",
            contractType: "CDI",
            sectors: ["Direction Générale", "International", "Stratégie"],
            location: "International",
            remotePolicy: "Présentiel avec déplacements",
            whyMatch: "21 ans à gouverner un royaume face à la superpuissance de l'époque = leadership éprouvé dans les conditions les plus difficiles. J'ai géré des crises existentielles, négocié avec les plus puissants, et maintenu la prospérité économique.",
            keySkills: ["CEO", "Stratégie", "M&A", "Leadership", "Gestion de crise"],
            jobDescription: "Groupe international (50 000 employés, 10Md€ CA) recherche un(e) CEO pour piloter sa transformation stratégique. Responsabilités : définition de la vision, relations avec le conseil d'administration, expansion internationale, gestion des crises. Profil recherché : leader charismatique avec track record de redressement, expérience de négociations de haut niveau, capacité à fédérer des équipes multiculturelles."
        },
        {
            rank: 2,
            title: "Ambassadrice Extraordinaire",
            company: "Organisation des Nations Unies",
            matchScore: 94,
            salaryMin: 120000,
            salaryMax: 180000,
            currency: "USD",
            contractType: "CDI",
            sectors: ["Diplomatie", "Relations Internationales", "ONG"],
            location: "New York / Genève",
            remotePolicy: "Missions internationales",
            whyMatch: "Maître diplomate maîtrisant 9 langues, ayant négocié avec les plus grandes puissances de mon époque. J'ai maintenu l'indépendance de mon pays par la seule force de ma diplomatie.",
            keySkills: ["Diplomatie", "Négociation multilat&era;le", "Langues", "Géopolitique"],
            jobDescription: "L'ONU recrute un(e) Ambassadeur(rice) Extraordinaire pour des missions de médiation dans les conflits les plus complexes. Missions : facilitation du dialogue entre parties en conflit, négociation d'accords de paix, représentation du Secrétaire Général. Profil : diplomate d'exception avec expérience de négociations au plus haut niveau et maîtrise de multiples langues."
        },
        {
            rank: 3,
            title: "Directrice Générale",
            company: "Banque Centrale Européenne",
            matchScore: 91,
            salaryMin: 200000,
            salaryMax: 350000,
            currency: "EUR",
            contractType: "CDI",
            sectors: ["Finance", "Politique Monétaire", "Économie"],
            location: "Francfort, Allemagne",
            remotePolicy: "Présentiel",
            whyMatch: "Ma réforme monétaire a stabilisé l'économie égyptienne en crise et augmenté les revenus de l'État de 40%. La gestion de la politique monétaire à l'échelle d'une zone économique majeure est un défi que je suis prête à relever.",
            keySkills: ["Politique monétaire", "Économie macro", "Finance publique", "Leadership institutionnel"],
            jobDescription: "La BCE recherche un(e) Membre du Directoire pour piloter la politique monétaire de la zone euro. Responsabilités : stabilité des prix, supervision bancaire, communication avec les marchés. Profil : expertise économique de premier plan, expérience de réforme monétaire, capacité à naviguer les intérêts divergents de 20+ pays."
        },
        {
            rank: 4,
            title: "Présidente",
            company: "Commission Européenne",
            matchScore: 88,
            salaryMin: 300000,
            salaryMax: 400000,
            currency: "EUR",
            contractType: "CDD",
            sectors: ["Politique", "Gouvernance Européenne", "Leadership"],
            location: "Bruxelles, Belgique",
            remotePolicy: "Présentiel",
            whyMatch: "Gérer des alliances complexes entre puissances aux intérêts divergents était mon quotidien. L'Union Européenne requiert exactement ce type de leadership fédérateur et stratégique.",
            keySkills: ["Leadership européen", "Diplomatie", "Vision politique", "Consensus-building"],
            jobDescription: "La présidence de la Commission Européenne requiert un leader capable de définir la vision stratégique de l'UE, coordonner 27 commissaires, et représenter l'Europe sur la scène mondiale. Profil : expérience de gouvernance au plus haut niveau, capacité à construire des consensus, vision géopolitique."
        },
        {
            rank: 5,
            title: "Managing Partner",
            company: "Cabinet de Lobbying International",
            matchScore: 85,
            salaryMin: 250000,
            salaryMax: 500000,
            currency: "USD",
            contractType: "CDI",
            sectors: ["Lobbying", "Affaires Publiques", "Conseil"],
            location: "Washington D.C. / Bruxelles",
            remotePolicy: "Hybride",
            whyMatch: "Influencer les décideurs les plus puissants, construire des alliances, négocier des accords impossibles - c'est exactement ce que j'ai fait toute ma vie. Mon réseau et mes méthodes sont uniques.",
            keySkills: ["Lobbying", "Influence", "Réseau", "Négociation stratégique"],
            jobDescription: "Cabinet de lobbying top-tier recherche un Managing Partner pour développer sa practice Europe/MENA. Missions : représenter des clients souverains et corporates auprès des gouvernements, négocier des accords complexes, développer le réseau. Profil : leader d'influence avec carnet d'adresses exceptionnel et track record de succès."
        },
        {
            rank: 6,
            title: "Directrice Générale du Patrimoine",
            company: "Département de la Culture d'Abu Dhabi",
            matchScore: 82,
            salaryMin: 180000,
            salaryMax: 280000,
            currency: "USD",
            contractType: "CDI",
            sectors: ["Culture", "Patrimoine", "Musées"],
            location: "Abu Dhabi, Émirats Arabes Unis",
            remotePolicy: "Présentiel",
            whyMatch: "Alexandrie fut le centre culturel du monde antique grâce à ma famille. La Grande Bibliothèque, le Phare, le Mouseion - nous avons créé le modèle que les grands projets culturels suivent encore. Abu Dhabi perpétue cette vision.",
            keySkills: ["Patrimoine culturel", "Direction de musées", "Vision culturelle", "Mécénat"],
            jobDescription: "Abu Dhabi recrute un(e) DG pour superviser son patrimoine culturel : Louvre Abu Dhabi, projets futurs, préservation archéologique. Responsabilités : vision stratégique, partenariats internationaux, développement des collections. Profil : expert(e) culturel(le) avec vision internationale et expérience de projets d'envergure."
        },
        {
            rank: 7,
            title: "Senior Advisor - Fusions & Acquisitions",
            company: "Goldman Sachs",
            matchScore: 79,
            salaryMin: 200000,
            salaryMax: 350000,
            currency: "USD",
            contractType: "CDI",
            sectors: ["Finance", "M&A", "Conseil"],
            location: "Londres / New York",
            remotePolicy: "Présentiel",
            whyMatch: "Les alliances stratégiques que j'ai négociées - avec César, avec Antoine - étaient essentiellement des fusions-acquisitions géopolitiques. Évaluer les synergies, négocier les termes, gérer l'intégration : c'est mon expertise.",
            keySkills: ["M&A", "Négociation de deals", "Valorisation", "Due diligence"],
            jobDescription: "Goldman Sachs renforce son équipe M&A souverain avec des advisors d'exception. Missions : conseiller des États et des corporate sur des opérations stratégiques, négocier des transactions complexes, gérer les relations avec les décideurs de haut niveau. Profil : leader avec expérience d'alliances stratégiques au plus haut niveau."
        },
        {
            rank: 8,
            title: "VP Relations Internationales",
            company: "Total Energies",
            matchScore: 76,
            salaryMin: 120000,
            salaryMax: 180000,
            currency: "EUR",
            contractType: "CDI",
            sectors: ["Énergie", "Relations Internationales", "Corporate"],
            location: "Paris / La Défense",
            remotePolicy: "Hybride",
            whyMatch: "Naviguer les relations avec des États souverains, négocier l'accès aux ressources, gérer des partenariats complexes - mon règne était une masterclass en relations internationales corporates.",
            keySkills: ["Relations internationales", "Gestion de stakeholders", "Diplomatie économique"],
            jobDescription: "TotalEnergies recrute un(e) VP Relations Internationales pour gérer les relations avec les États producteurs. Responsabilités : négociation de concessions, gestion des risques géopolitiques, représentation auprès des gouvernements. Profil : diplomate corporate avec réseau international et expérience de négociations souveraines."
        },
        {
            rank: 9,
            title: "Présidente d'Université",
            company: "Bibliotheca Alexandrina / Al-Azhar",
            matchScore: 73,
            salaryMin: 150000,
            salaryMax: 220000,
            currency: "USD",
            contractType: "CDI",
            sectors: ["Éducation", "Recherche", "Académique"],
            location: "Alexandrie / Le Caire, Égypte",
            remotePolicy: "Présentiel",
            whyMatch: "Ma famille a créé la Bibliothèque d'Alexandrie, le plus grand centre de savoir du monde antique. Présider une grande université égyptienne serait perpétuer cet héritage millénaire.",
            keySkills: ["Direction académique", "Vision éducative", "Rayonnement international", "Philanthropie"],
            jobDescription: "Grande université égyptienne recherche un(e) Président(e) pour définir sa vision stratégique, renforcer son rayonnement international, et développer ses ressources. Profil : leader académique ou figure publique d'exception avec engagement pour l'éducation et réseau international."
        },
        {
            rank: 10,
            title: "Auteure & Conférencière",
            company: "Édition / Conférences Internationales",
            matchScore: 70,
            salaryMin: 80000,
            salaryMax: 150000,
            currency: "EUR",
            contractType: "Freelance",
            sectors: ["Édition", "Conférences", "Leadership"],
            location: "International",
            remotePolicy: "Remote + événements",
            whyMatch: "Mon histoire est une leçon de leadership, de résilience et de stratégie. 2000 ans plus tard, on parle encore de moi. Ces enseignements méritent d'être partagés.",
            keySkills: ["Écriture", "Prise de parole", "Leadership", "Storytelling"],
            jobDescription: "Agences littéraires et de conférences recherchent des personnalités exceptionnelles pour des livres de leadership et des keynotes premium. Thèmes : stratégie, négociation, résilience, leadership féminin. Profil : parcours extraordinaire, capacité narrative, présence scénique."
        }
    ],
    coverLetters: [
        {
            jobRank: 1,
            jobTitle: "CEO - Groupe Multinational",
            tone: "formal",
            wordCount: 398,
            content: `Madame, Monsieur le Conseil d'Administration,

Gérer une entreprise multinationale et gouverner un royaume millénaire face à la plus grande puissance de l'époque demandent les mêmes qualités : vision stratégique, résilience et capacité à fédérer.

J'ai dirigé l'Égypte pendant 21 ans dans les conditions les plus difficiles : guerres civiles, invasions étrangères, crise économique. Non seulement j'ai survécu, mais j'ai prospéré. Mon royaume fut le dernier à résister à Rome.

**Mon track record de CEO avant l'heure:**

• **Redressement économique**: J'ai hérité d'un royaume en faillite. Ma réforme fiscale a augmenté les revenus de 40%. Ma réforme monétaire a stabilisé les échanges. J'ai financé une flotte de 200 navires tout en maintenant la prospérité.

• **Négociations au plus haut niveau**: J'ai traité d'égal à égal avec Jules César et Marc Antoine, les hommes les plus puissants du monde. J'ai obtenu des accords que personne ne croyait possibles.

• **Leadership dans la crise**: Exilée à 21 ans, j'ai reconquis mon trône. Encerclée par Rome, j'ai maintenu l'indépendance. La résilience n'est pas une vertu pour moi - c'est une nécessité.

• **Vision stratégique**: Les "Donations d'Alexandrie" auraient créé un empire oriental rival de Rome. J'ai vu des possibilités que même mes alliés ne saisissaient pas.

**Ce que j'apporterais à votre groupe:**

Votre entreprise fait face à des concurrents puissants, des marchés volatils, des transformations technologiques. Ces défis sont mon terrain naturel.

Je construirais une stratégie qui ne se contente pas de survivre mais de dominer. Je négocierais des partenariats que vos concurrents croient impossibles. Je fédérerais vos équipes autour d'une vision qui donne du sens.

Et si cela échoue, je ferai face avec dignité. "Je ne serai pas exhibée lors d'un triomphe" - ces mots, je les ai prononcés. Je ne fuis jamais mes responsabilités.

Je suis prête à mettre 21 ans d'expérience de souveraine au service de votre entreprise.

Respectueusement,

**Cléopâtre VII Philopator**
Ancienne Reine d'Égypte, Pharaon`
        },
        {
            jobRank: 2,
            jobTitle: "Ambassadrice Extraordinaire - ONU",
            tone: "formal",
            wordCount: 352,
            content: `Excellence,

La diplomatie a été l'arme principale de mon règne. Face à Rome, la plus grande puissance militaire de l'histoire, j'ai su négocier, séduire et résister pour préserver l'indépendance de mon peuple pendant 21 ans.

Les conflits que l'ONU cherche à résoudre aujourd'hui me sont familiers : rivalités de puissances, intérêts économiques divergents, questions de souveraineté. Je les ai vécus chaque jour.

**Mes qualifications diplomatiques:**

• **Maîtrise de 9 langues**: Grec, égyptien, latin, hébreu, araméen, arabe, éthiopien, persan, parthe. La première Ptolémée à parler la langue de son peuple. La communication directe brise les barrières.

• **Négociation avec les plus puissants**: J'ai traité avec César et Antoine non comme suppliante mais comme égale. J'ai obtenu ce que je voulais par la persuasion, pas par la soumission.

• **Compréhension des équilibres géopolitiques**: J'ai navigué les rivalités entre Rome et ses factions, entre Orient et Occident, entre tradition et modernité. Ces équilibres, je les sens intuitivement.

• **Représentation d'une civilisation millénaire**: L'Égypte de 3000 ans m'a enseigné que les nations survivent aux crises. Je porte cette sagesse.

**Ce que j'apporterais à l'ONU:**

• Médiation dans les conflits du Moyen-Orient - je connais intimement cette région
• Dialogue entre puissances rivales - c'était mon quotidien
• Défense des nations menacées par des voisins plus puissants - j'ai vécu cette situation
• Promotion du patrimoine culturel et éducatif - la Bibliothèque d'Alexandrie fut ma fierté

L'ONU incarne les idéaux de dialogue entre les nations que j'ai pratiqués toute ma vie. Permettez-moi de servir cette mission.

Avec mes hommages les plus respectueux,

**Cléopâtre VII Philopator**
Reine d'Égypte (51-30 av. J.-C.)`
        },
        {
            jobRank: 3,
            jobTitle: "Directrice Générale - BCE",
            tone: "formal",
            wordCount: 312,
            content: `Madame, Monsieur,

Ma réforme monétaire en Égypte a stabilisé une économie en crise et permis de financer l'indépendance de mon royaume face à la superpuissance de l'époque.

La politique monétaire n'est pas seulement technique - elle est politique au sens le plus noble. Elle détermine la prospérité des peuples et la souveraineté des nations.

**Mes réalisations économiques:**

• **Réforme fiscale structurelle**: Augmentation des revenus de l'État de 40% par rationalisation de la collecte et élargissement de l'assiette.

• **Stabilisation monétaire**: Gestion contrôlée de la dévaluation ptolémaïque pour stimuler les exportations tout en préservant la confiance.

• **Développement du commerce**: Alexandrie sous mon règne fut le hub commercial de la Méditerranée orientale, avec des échanges jusqu'en Inde.

• **Financement des grands projets**: J'ai financé une flotte de 200 navires et une armée moderne sans appauvrir mon peuple.

**Ma vision pour la BCE:**

La zone euro fait face à des défis que je reconnais : divergences entre États membres, pressions extérieures, transformation économique. Ces défis nécessitent:

• Une vision politique de long terme, pas seulement des ajustements techniques
• Une communication crédible qui inspire la confiance des marchés et des peuples
• La capacité à construire des consensus entre intérêts divergents
• Le courage de prendre des décisions impopulaires quand nécessaire

La stabilité monétaire est la fondation de la souveraineté. L'Égypte l'a compris il y a 2000 ans. L'Europe doit le comprendre aujourd'hui.

Je souhaite mettre cette expertise au service de la stabilité européenne.

Respectueusement,

**Cléopâtre VII**
Pharaon d'Égypte, Économiste avant l'heure`
        }
    ]
};

export default cleopatraProfile;
