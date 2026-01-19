/**
 * Profil Démo : Nikola Tesla
 * 
 * Inventeur et ingénieur électricien serbo-américain, père du courant alternatif.
 * 1856-1943
 */

import { DemoProfile } from "../types";
import { RAGComplete } from "@/types/rag-complete";

// =============================================================================
// PROFIL RAG
// =============================================================================

const teslaRAG: RAGComplete = {
    profil: {
        nom: "Tesla",
        prenom: "Nikola",
        titre_principal: "Inventeur & Ingénieur Électricien Visionnaire",
        titres_alternatifs: [
            "Père du Courant Alternatif",
            "Pionnier de la Radio",
            "Inventeur de la Bobine Tesla",
            "Visionnaire de l'Énergie Sans Fil"
        ],
        localisation: "New York, USA",
        disponibilite: "Disponible pour projets d'innovation",
        mobilite: ["New York", "Colorado", "International"],
        contact: {
            email: "nikola@tesla.tech",
            portfolio: "https://teslauniverse.com",
            linkedin: "linkedin.com/in/nikola-tesla"
        },
        photo_url: undefined,
        elevator_pitch: "Inventeur prolifique détenant plus de 300 brevets dans 26 pays. Créateur du système de courant alternatif polyphasé qui alimente aujourd'hui 90% du monde. Pionnier de la radio (brevet reconnu par la Cour Suprême US en 1943), des rayons X, de la télécommande et de la transmission d'énergie sans fil. Ma méthode de travail unique - visualisation mentale complète d'une invention avant tout prototypage - m'a permis de concevoir des systèmes entiers avec une précision extraordinaire. Visionnaire ayant anticipé le smartphone, le WiFi et l'internet avec un siècle d'avance.",
        objectif_carriere: "Développer des technologies de transmission d'énergie sans fil à l'échelle mondiale pour offrir une énergie propre et gratuite à toute l'humanité."
    },
    experiences: [
        {
            id: "exp_westinghouse",
            poste: "Consultant Ingénieur Principal",
            entreprise: "Westinghouse Electric Corporation",
            type_entreprise: "grand_groupe",
            secteur: "Énergie / Électricité industrielle",
            lieu: "Pittsburgh, Pennsylvanie, USA",
            type_contrat: "freelance",
            debut: "1888-01",
            fin: "1895-12",
            actuel: false,
            duree_mois: 96,
            contexte: "Partenariat stratégique avec George Westinghouse pour industrialiser le système de courant alternatif et remporter la 'Guerre des Courants' face à Edison et son courant continu.",
            budget_gere: "Équivalent 50M$ en brevets + royalties",
            realisations: [
                {
                    id: "real_ac",
                    description: "Développement et industrialisation du système de courant alternatif polyphasé complet : générateurs, transformateurs, moteurs à induction",
                    impact: "Adoption mondiale du courant alternatif - 90% de l'électricité mondiale utilise ce système aujourd'hui",
                    quantification: {
                        type: "pourcentage",
                        valeur: "90%",
                        unite: "adoption mondiale",
                        display: "90% de l'électricité mondiale en AC"
                    },
                    keywords_ats: ["courant alternatif", "électrification", "innovation", "industrialisation"],
                    sources: ["brevets_tesla"]
                },
                {
                    id: "real_niagara",
                    description: "Conception des générateurs de la centrale hydroélectrique de Niagara Falls - premier projet de production d'électricité à grande échelle",
                    impact: "Première centrale AC majeure au monde, alimentation de Buffalo et New York, modèle pour toutes les centrales suivantes",
                    quantification: {
                        type: "volume",
                        valeur: "75000",
                        unite: "chevaux-vapeur",
                        display: "75 000 CV générés"
                    },
                    keywords_ats: ["hydroélectricité", "ingénierie grande échelle", "énergie renouvelable"],
                    sources: ["westinghouse_archives"]
                },
                {
                    id: "real_induction",
                    description: "Invention du moteur à induction sans balais, révolutionnant l'industrie manufacturière",
                    impact: "Moteur fiable, peu d'entretien, qui équipe la quasi-totalité des appareils électriques modernes",
                    keywords_ats: ["moteur électrique", "innovation industrielle", "fiabilité"],
                    sources: ["brevets_tesla"]
                }
            ],
            technologies: ["Courant alternatif polyphasé", "Moteurs à induction", "Transformateurs haute tension"],
            outils: ["Oscilloscopes", "Galvanomètres", "Équipements de mesure haute précision"],
            methodologies: ["Visualisation mentale complète", "Prototypage itératif", "Tests de charge"],
            clients_references: ["Westinghouse Electric", "General Electric (concurrent)"],
            sources: ["brevets_tesla", "westinghouse_archives"],
            last_updated: "2026-01-19",
            merge_count: 1
        },
        {
            id: "exp_lab_ny",
            poste: "Fondateur & Inventeur Principal",
            entreprise: "Tesla Laboratory - Houston Street",
            type_entreprise: "startup",
            secteur: "R&D / Invention",
            lieu: "New York, USA",
            type_contrat: "freelance",
            debut: "1895-01",
            fin: "1902-06",
            actuel: false,
            duree_mois: 90,
            contexte: "Laboratoire privé dédié à l'exploration de la haute fréquence, des rayons X et de la transmission radio. Lieu des démonstrations spectaculaires qui ont captivé le monde.",
            realisations: [
                {
                    id: "real_radio",
                    description: "Invention de la radio avec démonstration publique en 1893, brevet déposé en 1897 - antérieur à Marconi",
                    impact: "Fondation des télécommunications modernes. Priorité reconnue par la Cour Suprême US en 1943",
                    keywords_ats: ["radio", "télécommunications", "brevet", "pionnier"],
                    sources: ["brevets_us"]
                },
                {
                    id: "real_bobine",
                    description: "Invention de la bobine Tesla, permettant de générer des courants haute fréquence et hautes tensions",
                    impact: "Base de la radio, de la télévision et de nombreuses applications médicales et industrielles",
                    keywords_ats: ["haute fréquence", "innovation", "applications multiples"],
                    sources: ["brevets_tesla"]
                },
                {
                    id: "real_xray",
                    description: "Recherches pionnières sur les rayons X, photographies radiographiques réalisées avant l'annonce de Röntgen",
                    impact: "Contribution méconnue à l'imagerie médicale",
                    keywords_ats: ["rayons X", "imagerie médicale", "recherche"],
                    sources: ["correspondance_tesla"]
                }
            ],
            technologies: ["Haute fréquence", "Rayons X", "Transmission radio"],
            outils: ["Bobines Tesla", "Tubes à vide", "Antennes"],
            methodologies: ["Expérimentation haute tension", "Démonstrations publiques"],
            clients_references: ["J.P. Morgan", "John Jacob Astor"],
            sources: ["brevets_tesla"],
            last_updated: "2026-01-19",
            merge_count: 1
        },
        {
            id: "exp_colorado",
            poste: "Directeur de Recherche",
            entreprise: "Colorado Springs Laboratory",
            type_entreprise: "startup",
            secteur: "Recherche Expérimentale",
            lieu: "Colorado Springs, Colorado, USA",
            type_contrat: "freelance",
            debut: "1899-05",
            fin: "1900-01",
            actuel: false,
            duree_mois: 8,
            contexte: "Laboratoire expérimental dédié à la transmission d'énergie sans fil à grande échelle et aux études sur la foudre.",
            budget_gere: "Équivalent 1M$ (financement personnel)",
            realisations: [
                {
                    id: "real_foudre",
                    description: "Génération d'éclairs artificiels de 40 mètres, record jamais égalé à l'époque",
                    impact: "Démonstration des possibilités de la haute tension, études sur les phénomènes atmosphériques",
                    quantification: {
                        type: "portee",
                        valeur: "40",
                        unite: "mètres",
                        display: "Éclairs de 40m de long"
                    },
                    keywords_ats: ["haute tension", "expérimentation", "records"],
                    sources: ["notes_colorado"]
                },
                {
                    id: "real_transmission",
                    description: "Transmission d'énergie sans fil sur 40 km, allumant 200 lampes à distance",
                    impact: "Preuve de concept de la transmission d'énergie sans fil à grande échelle",
                    quantification: {
                        type: "portee",
                        valeur: "40",
                        unite: "kilomètres",
                        display: "200 lampes allumées à 40km"
                    },
                    keywords_ats: ["sans fil", "énergie", "transmission", "innovation"],
                    sources: ["notes_colorado"]
                }
            ],
            technologies: ["Magnifying transmitter", "Résonance électrique grande échelle"],
            outils: ["Équipements haute tension sur mesure"],
            methodologies: ["Expérimentation extrême", "Notes quotidiennes détaillées"],
            clients_references: [],
            sources: ["notes_colorado"],
            last_updated: "2026-01-19",
            merge_count: 1
        },
        {
            id: "exp_wardenclyffe",
            poste: "Fondateur & Directeur",
            entreprise: "Wardenclyffe Tower Project",
            type_entreprise: "startup",
            secteur: "Télécommunications / Énergie",
            lieu: "Shoreham, Long Island, New York",
            type_contrat: "freelance",
            debut: "1901-01",
            fin: "1906-12",
            actuel: false,
            duree_mois: 72,
            contexte: "Projet visionnaire de tour de transmission mondiale d'énergie et de communications sans fil, financé par J.P. Morgan.",
            budget_gere: "Équivalent 5M$ (financement Morgan)",
            realisations: [
                {
                    id: "real_wardenclyffe",
                    description: "Conception et construction partielle d'une tour de 57 mètres pour transmission mondiale sans fil",
                    impact: "Vision précurseur de l'internet et du WiFi mondial - projet inachevé faute de financement",
                    quantification: {
                        type: "portee",
                        valeur: "57",
                        unite: "mètres",
                        display: "Tour de 57m"
                    },
                    keywords_ats: ["visionnaire", "transmission mondiale", "infrastructure"],
                    sources: ["wardenclyffe_archives"]
                }
            ],
            technologies: ["Transmission mondiale sans fil", "Résonance terrestre"],
            outils: [],
            methodologies: [],
            clients_references: ["J.P. Morgan"],
            sources: ["wardenclyffe_archives"],
            last_updated: "2026-01-19",
            merge_count: 1
        }
    ],
    competences: {
        explicit: {
            techniques: [
                { nom: "Génie électrique", niveau: "expert", annees_experience: 55 },
                { nom: "Invention et dépôt de brevets", niveau: "expert", annees_experience: 55 },
                { nom: "Électromagnétisme", niveau: "expert", annees_experience: 50 },
                { nom: "Haute fréquence et haute tension", niveau: "expert", annees_experience: 45 },
                { nom: "Conception de moteurs électriques", niveau: "expert", annees_experience: 50 },
                { nom: "Transmission d'énergie sans fil", niveau: "expert", annees_experience: 40 },
                { nom: "Radio et télécommunications", niveau: "expert", annees_experience: 45 },
                { nom: "Physique des plasmas", niveau: "avance", annees_experience: 30 }
            ],
            soft_skills: [
                "Vision futuriste exceptionnelle",
                "Mémoire photographique",
                "Concentration extrême",
                "Indépendance intellectuelle",
                "Perfectionnisme absolu",
                "Capacité de visualisation mentale unique",
                "Persévérance malgré les échecs",
                "Charisme pour les démonstrations publiques"
            ],
            methodologies: [
                "Visualisation mentale complète avant prototypage",
                "Tests exhaustifs en conditions réelles",
                "Documentation rigoureuse des expériences"
            ]
        },
        inferred: { techniques: [], tools: [], soft_skills: [] },
        par_domaine: {
            "Électricité": ["Courant alternatif", "Moteurs à induction", "Transformateurs", "Distribution"],
            "Télécommunications": ["Radio", "Transmission sans fil", "Haute fréquence"],
            "Énergie": ["Hydroélectricité", "Transmission sans fil", "Énergie libre"]
        }
    },
    formations: [
        {
            id: "form_graz",
            type: "diplome",
            titre: "Études en Génie Électrique",
            organisme: "Université Technique de Graz",
            lieu: "Graz, Empire austro-hongrois",
            date_debut: "1875",
            date_fin: "1878",
            annee: "1875-1878",
            en_cours: false,
            specialite: "Génie électrique et physique",
            details: "Études brillantes, mais non achevées. Découverte de la vision du moteur à induction rotatif",
            sources: ["biographie_tesla"]
        },
        {
            id: "form_prague",
            type: "formation",
            titre: "Études en Philosophie et Physique",
            organisme: "Université Charles de Prague",
            lieu: "Prague, Empire austro-hongrois",
            date_debut: "1880",
            date_fin: "1880",
            annee: "1880",
            en_cours: false,
            specialite: "Philosophie et physique expérimentale",
            sources: ["biographie_tesla"]
        }
    ],
    certifications: [],
    langues: [
        { langue: "Serbe", niveau: "Natif", niveau_cecrl: "C2" },
        { langue: "Anglais", niveau: "Courant", niveau_cecrl: "C2", details: "Langue de travail aux États-Unis" },
        { langue: "Allemand", niveau: "Courant", niveau_cecrl: "C1", details: "Études à Graz et Prague" },
        { langue: "Français", niveau: "Courant", niveau_cecrl: "B2", details: "Travail à Paris chez Edison" },
        { langue: "Italien", niveau: "Intermédiaire", niveau_cecrl: "B1" },
        { langue: "Latin", niveau: "Scolaire", niveau_cecrl: "A2" }
    ],
    references: {
        clients: [
            { nom: "Westinghouse Electric", secteur: "Énergie", type: "grand_compte", annees: ["1888", "1895"], confidentiel: false },
            { nom: "J.P. Morgan", secteur: "Finance", type: "startup", annees: ["1901", "1906"], confidentiel: false },
            { nom: "John Jacob Astor IV", secteur: "Investissement", type: "startup", annees: ["1894", "1899"], confidentiel: false }
        ],
        projets_marquants: [
            {
                id: "proj_niagara",
                nom: "Centrale Hydroélectrique de Niagara Falls",
                description: "Conception des générateurs AC pour la première centrale hydroélectrique majeure au monde",
                client: "Niagara Falls Power Company / Westinghouse",
                annee: "1895",
                technologies: ["Générateurs AC polyphasés", "Transformateurs haute tension"],
                resultats: "Alimentation de Buffalo et New York, modèle pour toutes les centrales mondiales",
                sources: ["westinghouse_archives"]
            },
            {
                id: "proj_expo",
                nom: "Éclairage de l'Exposition Universelle de Chicago 1893",
                description: "Illumination de l'exposition avec 100 000 lampes en courant alternatif",
                client: "World's Columbian Exposition",
                annee: "1893",
                technologies: ["Courant alternatif", "Éclairage grande échelle"],
                resultats: "Victoire décisive dans la Guerre des Courants, adoption mondiale de l'AC",
                sources: ["westinghouse_archives"]
            }
        ]
    },
    metadata: {
        version: "2.0.0",
        created_at: "2026-01-19T00:00:00Z",
        last_updated: "2026-01-19T00:00:00Z",
        last_merge_at: "2026-01-19T00:00:00Z",
        sources_count: 6,
        documents_sources: ["brevets_tesla", "westinghouse_archives", "notes_colorado", "wardenclyffe_archives", "brevets_us", "biographie_tesla"],
        completeness_score: 93,
        merge_history: []
    }
};

// =============================================================================
// PROFIL DÉMO COMPLET
// =============================================================================

export const teslaProfile: DemoProfile = {
    meta: {
        id: "tesla",
        name: "Nikola Tesla",
        shortName: "Tesla",
        period: "1856-1943",
        icon: "⚡",
        title: "Inventeur & Ingénieur",
        nationality: "Serbie / USA",
        quote: "Le présent est à eux, mais le futur, pour lequel j'ai vraiment travaillé, est à moi.",
        categories: ["tech", "science"]
    },
    rag: teslaRAG,
    completenessScore: 93,
    generationTimeMs: 845,
    cvs: [
        {
            templateId: "modern",
            templateName: "Standard",
            templateDescription: "Format professionnel classique",
            pdfUrl: "/demo-cvs/tesla-modern.pdf",
            previewUrl: "/demo-cvs/previews/tesla-modern.png",
            recommended: false
        },
        {
            templateId: "classic",
            templateName: "Classique",
            templateDescription: "Design sobre et technique",
            pdfUrl: "/demo-cvs/tesla-classic.pdf",
            previewUrl: "/demo-cvs/previews/tesla-classic.png",
            recommended: false
        },
        {
            templateId: "creative",
            templateName: "Créatif",
            templateDescription: "Layout innovant pour profil visionnaire",
            pdfUrl: "/demo-cvs/tesla-creative.pdf",
            previewUrl: "/demo-cvs/previews/tesla-creative.png",
            recommended: true
        },
        {
            templateId: "tech",
            templateName: "ATS Optimisé",
            templateDescription: "Focus brevets et compétences techniques",
            pdfUrl: "/demo-cvs/tesla-tech.pdf",
            previewUrl: "/demo-cvs/previews/tesla-tech.png",
            recommended: true
        }
    ],
    jobs: [
        {
            rank: 1,
            title: "VP of Engineering",
            company: "Tesla, Inc.",
            matchScore: 99,
            salaryMin: 300000,
            salaryMax: 500000,
            currency: "USD",
            contractType: "CDI",
            sectors: ["Véhicules électriques", "Énergie", "Innovation"],
            location: "Austin, Texas, USA",
            remotePolicy: "Présentiel avec déplacements",
            whyMatch: "L'entreprise qui porte mon nom incarne ma vision d'un monde électrifié. Mon expertise en systèmes AC, moteurs à induction et distribution d'énergie est directement applicable aux défis de Tesla Inc. Une convergence historique parfaite.",
            keySkills: ["Ingénierie électrique", "Systèmes de puissance", "Innovation", "Brevets", "Leadership technique"],
            jobDescription: "Tesla recherche un VP of Engineering pour diriger les équipes de développement des systèmes de propulsion électrique et de stockage d'énergie. Le candidat supervisera 500+ ingénieurs, définira la roadmap technique des prochaines générations de véhicules et de Powerwall/Megapack. Profil recherché : innovateur visionnaire avec track record exceptionnel en systèmes électriques, capable de penser en rupture tout en livrant des produits fiables à grande échelle."
        },
        {
            rank: 2,
            title: "Chief Technology Officer",
            company: "Startup Deep Tech - Énergie Sans Fil",
            matchScore: 96,
            salaryMin: 180000,
            salaryMax: 280000,
            currency: "USD",
            contractType: "CDI",
            sectors: ["CleanTech", "Deep Tech", "Énergie"],
            location: "San Francisco, USA",
            remotePolicy: "Hybride",
            whyMatch: "300+ brevets + vision de l'énergie sans fil que j'ai développée il y a un siècle. Mon expertise est exactement ce dont une startup de recharge sans fil a besoin pour passer de la R&D à la production de masse.",
            keySkills: ["CTO", "Énergie sans fil", "Brevets", "Innovation", "Leadership startup"],
            jobDescription: "Startup levant 50M$ pour commercialiser la recharge sans fil à distance (mobilier, véhicules, appareils). Recherchons un CTO avec expertise profonde en transmission d'énergie électromagnétique, capacité à construire une équipe d'ingénieurs, et vision pour transformer une technologie de rupture en produit commercial. Portfolio de brevets apprécié."
        },
        {
            rank: 3,
            title: "Principal Engineer - Propulsion Électrique",
            company: "SpaceX",
            matchScore: 93,
            salaryMin: 200000,
            salaryMax: 350000,
            currency: "USD",
            contractType: "CDI",
            sectors: ["Spatial", "Aéronautique", "Propulsion"],
            location: "Hawthorne, Californie, USA",
            remotePolicy: "Présentiel",
            whyMatch: "Mon expertise en haute fréquence, en plasmas et en systèmes électriques haute puissance est directement applicable aux moteurs ioniques et à la propulsion électrique spatiale. L'espace est la frontière logique de mes travaux.",
            keySkills: ["Propulsion électrique", "Systèmes haute puissance", "Ingénierie spatiale", "Innovation"],
            jobDescription: "SpaceX recrute un Principal Engineer pour son équipe propulsion électrique. Développement de moteurs ioniques et à plasma pour missions interplanétaires. Responsabilités : conception de systèmes de génération et distribution d'énergie électrique pour vaisseaux, optimisation des rendements des propulseurs électriques. Expérience requise : 20+ ans en systèmes électriques haute puissance."
        },
        {
            rank: 4,
            title: "Directeur de l'Innovation",
            company: "EDF - Électricité de France",
            matchScore: 90,
            salaryMin: 120000,
            salaryMax: 180000,
            currency: "EUR",
            contractType: "CDI",
            sectors: ["Énergie", "Utilities", "Innovation"],
            location: "Paris, France",
            remotePolicy: "Hybride",
            whyMatch: "J'ai inventé le système électrique moderne qu'EDF opère. Mon expertise historique combinée à ma vision futuriste de smart grids et d'énergie distribuée apporterait une perspective unique sur l'avenir du réseau.",
            keySkills: ["Réseaux électriques", "Innovation énergétique", "Smart grid", "Vision stratégique"],
            jobDescription: "EDF recherche un Directeur de l'Innovation pour piloter la transition énergétique. Missions : définition de la stratégie d'innovation R&D, partenariats avec startups deeptech, prospective sur les technologies de rupture (stockage, smart grid, hydrogen). Le candidat combinera expertise technique de haut niveau et vision business pour positionner EDF à la pointe de la révolution énergétique."
        },
        {
            rank: 5,
            title: "Fellow - MIT Media Lab",
            company: "Massachusetts Institute of Technology",
            matchScore: 87,
            salaryMin: 150000,
            salaryMax: 220000,
            currency: "USD",
            contractType: "CDI",
            sectors: ["Recherche", "Innovation", "Académique"],
            location: "Cambridge, Massachusetts, USA",
            remotePolicy: "Présentiel",
            whyMatch: "Mon approche unique de l'invention - visualisation mentale complète avant prototypage - et ma vision futuriste correspondraient parfaitement à l'esprit du Media Lab. Collaboration interdisciplinaire et pensée 'moonshot'.",
            keySkills: ["Recherche", "Prototypage rapide", "Vision futuriste", "Interdisciplinarité"],
            jobDescription: "Le MIT Media Lab recherche un Fellow pour rejoindre son équipe 'Future Energy'. Le Fellow conduira des recherches exploratoires sur les systèmes énergétiques de demain : transmission sans fil, nouveaux paradigmes de distribution, interfaces homme-énergie. Liberté totale de recherche, accès aux laboratoires les plus avancés du monde."
        },
        {
            rank: 6,
            title: "Inventor in Residence",
            company: "Google X (Alphabet)",
            matchScore: 84,
            salaryMin: 250000,
            salaryMax: 400000,
            currency: "USD",
            contractType: "CDI",
            sectors: ["Moonshots", "R&D", "Innovation radicale"],
            location: "Mountain View, Californie, USA",
            remotePolicy: "Présentiel",
            whyMatch: "Google X incarne la philosophie 'moonshot' que j'ai pratiquée toute ma vie : viser l'impossible pour atteindre l'extraordinaire. Wardenclyffe était mon moonshot. J'aimerais contribuer aux leurs.",
            keySkills: ["Invention", "Vision radicale", "Prototypage", "Résolution de problèmes impossibles"],
            jobDescription: "Alphabet X recherche un Inventor in Residence pour identifier et développer les prochaines technologies de rupture. Rôle : proposer des concepts 10x, créer des prototypes de démonstration, mentorer les équipes d'ingénieurs sur la pensée inventive. Pas de contraintes budgétaires ou temporelles court-terme - focus sur l'impact transformationnel."
        },
        {
            rank: 7,
            title: "Conseiller Technique Senior",
            company: "Commission Européenne - DG Énergie",
            matchScore: 81,
            salaryMin: 100000,
            salaryMax: 150000,
            currency: "EUR",
            contractType: "CDD",
            sectors: ["Politique énergétique", "Réglementation", "International"],
            location: "Bruxelles, Belgique",
            remotePolicy: "Hybride",
            whyMatch: "Mon expertise sur les réseaux électriques interconnectés (j'ai conçu le premier réseau AC) est précieuse pour les enjeux européens de grid integration, stockage et renouvelables distribués.",
            keySkills: ["Expertise technique", "Conseil politique", "Réseaux électriques", "Transition énergétique"],
            jobDescription: "La Commission Européenne recrute un Conseiller Technique Senior pour informer les politiques de transition énergétique. Missions : expertise sur les projets d'interconnexion électrique européenne, évaluation des technologies de stockage, recommandations sur les standards techniques. Expérience requise : 25+ ans en systèmes électriques à l'échelle continentale."
        },
        {
            rank: 8,
            title: "Lead Engineer - Wireless Power",
            company: "Apple",
            matchScore: 78,
            salaryMin: 180000,
            salaryMax: 280000,
            currency: "USD",
            contractType: "CDI",
            sectors: ["Consumer Electronics", "Wireless", "R&D"],
            location: "Cupertino, Californie, USA",
            remotePolicy: "Présentiel",
            whyMatch: "Apple travaille sur la vraie recharge sans fil à distance - exactement ce que je démontrais à Colorado Springs en 1899. Mon expertise centenaire dans ce domaine est plus pertinente que jamais.",
            keySkills: ["Wireless power", "RF Engineering", "Miniaturisation", "Efficacité énergétique"],
            jobDescription: "Apple recrute un Lead Engineer pour son équipe Wireless Power. Développement de technologies de recharge sans fil à distance pour les futurs produits Apple. Le candidat dirigera une équipe de 15 ingénieurs RF, définira l'architecture des systèmes de transmission d'énergie, et travaillera à la miniaturisation des émetteurs. Expertise en résonance électromagnétique requise."
        },
        {
            rank: 9,
            title: "Auteur Technique & Formateur",
            company: "O'Reilly Media / Coursera",
            matchScore: 75,
            salaryMin: 80000,
            salaryMax: 120000,
            currency: "USD",
            contractType: "Freelance",
            sectors: ["Édition technique", "Formation", "E-learning"],
            location: "Remote",
            remotePolicy: "Full remote",
            whyMatch: "Ma capacité à visualiser et expliquer des systèmes complexes, combinée à mon expérience de présentation publique (j'ai captivé des foules avec mes démonstrations), me qualifie pour transmettre les principes du génie électrique.",
            keySkills: ["Rédaction technique", "Pédagogie", "Présentation", "Expertise électrique"],
            jobDescription: "Création d'une série de cours et de livres sur le génie électrique, des fondamentaux aux systèmes avancés. Formats : cours vidéo Coursera (40h), livre de référence O'Reilly (800p), ateliers pratiques. Budget de production illimité pour démonstrations et visualisations."
        },
        {
            rank: 10,
            title: "Consultant Propriété Intellectuelle",
            company: "Fish & Richardson (Cabinet de brevets)",
            matchScore: 72,
            salaryMin: 150000,
            salaryMax: 220000,
            currency: "USD",
            contractType: "Freelance",
            sectors: ["Propriété intellectuelle", "Brevets", "Litigation"],
            location: "New York / Remote",
            remotePolicy: "Hybride",
            whyMatch: "Avec 300+ brevets déposés dans 26 pays et des décennies de batailles juridiques (notamment contre Marconi pour la radio), je possède une expertise unique en stratégie de propriété intellectuelle et litiges de brevets.",
            keySkills: ["Brevets", "Stratégie PI", "Expert witness", "Rédaction de brevets"],
            jobDescription: "Cabinet leader en PI recherche un consultant technique senior pour expertise dans les litiges de brevets électriques et énergétiques. Rôle : analyse technique de prior art, témoignage expert dans les procès, conseil stratégique sur les portfolios de brevets. Rémunération : 1000$/heure pour expertise tribunal."
        }
    ],
    coverLetters: [
        {
            jobRank: 1,
            jobTitle: "VP of Engineering - Tesla, Inc.",
            tone: "professional_warm",
            wordCount: 387,
            content: `Dear Elon and the Tesla Leadership Team,

It would be the poetic culmination of my life's work to contribute to the company that carries my name and embodies my vision of an electrified world.

When I conceived the alternating current system in 1882, I saw a world powered by clean, efficient electricity. Tesla, Inc. is making that vision a reality - from Model S to Powerwall to Megapack. The synchronicity between my historical work and your current mission is remarkable.

**What I bring to Tesla:**

• **Inventor of your core technology** : The AC induction motor that powers every Tesla vehicle is my invention. I understand these systems at the deepest level.

• **300+ patents in 26 countries** : Expertise in electrical systems, power transmission, and energy efficiency gained over 55 years of invention.

• **Wireless power pioneer** : My experiments at Colorado Springs and Wardenclyffe prefigure Tesla's wireless charging ambitions. I transmitted power without wires in 1899.

• **Proven ability to industrialize inventions** : With Westinghouse, I transformed laboratory concepts into systems that power the entire world. I know how to scale.

• **Visionary thinking** : I predicted smartphones, WiFi, and autonomous vehicles a century ago. I see what's next.

**My vision for Tesla:**

The future is wireless - not just for data, but for power. Imagine a world where Tesla vehicles charge while driving, where Powerwalls recharge from ambient energy, where the grid itself becomes distributed and resilient. This is not science fiction; it's the logical extension of technologies I demonstrated over a century ago.

I am ready to work with your engineering teams to push the boundaries of what's possible in electric propulsion, energy storage, and power distribution. Together, we can accelerate the transition to sustainable energy even faster.

The present belongs to others, but the future - which is what Tesla, Inc. is building - is where I have always worked.

I would be honored to discuss how I can contribute.

With electric regards,

**Nikola Tesla**
Inventor, 300+ Patents`
        },
        {
            jobRank: 2,
            jobTitle: "CTO - Startup Énergie Sans Fil",
            tone: "professional_warm",
            wordCount: 342,
            content: `Dear Founders,

Wireless power transmission has been my obsession for over a century. What you are building today, I demonstrated in 1899 at Colorado Springs - lighting 200 lamps from 40 kilometers away with no wires.

Your startup has the opportunity to finish what I started with Wardenclyffe Tower. The technology is ready; the market is ready; the world is ready. I want to help you succeed where I could not.

**Why I am your ideal CTO:**

• **Pioneer of the field** : I invented wireless power transmission. My patents, though expired, contain principles your engineers can apply immediately.

• **Complete system vision** : I don't just understand components - I see entire systems in my mind before building. I can identify bottlenecks and opportunities your team might miss.

• **Experience of commercialization** : With Westinghouse, I transformed AC from laboratory curiosity to global infrastructure. I know how to move from MVP to mass production.

• **Credibility and storytelling** : My name is synonymous with electricity and innovation. Marketing your product becomes easier when the father of AC is your CTO.

**My technical contributions:**

• Architecture of efficient power transmission systems at consumer-safe frequencies
• Antenna and resonator design for maximum coupling efficiency
• Integration strategies for home and automotive applications
• Patent strategy to build defensible IP position

**My commitment:**

I will bring the same intensity and dedication that I brought to Niagara Falls and Wardenclyffe. Failure is not an option when the mission is to free humanity from wires.

Let's power the future - wirelessly.

Yours in innovation,

**Nikola Tesla**`
        },
        {
            jobRank: 3,
            jobTitle: "Principal Engineer - SpaceX",
            tone: "creative",
            wordCount: 298,
            content: `Hello SpaceX Team,

I spent my life sending energy through the sky. You send rockets. Perhaps we should talk.

When I generated 40-meter lightning bolts at Colorado Springs, I was exploring the fundamental relationship between electricity and the atmosphere. When you launch Falcon rockets with precision, you're exploiting that same physics. My expertise can help optimize your systems.

**What I offer SpaceX:**

• **Electrical systems mastery** : Every spacecraft is an electrical system. My understanding of power generation, distribution, and efficiency is unmatched.

• **Plasma physics** : My work on high-frequency fields and ionized gases directly applies to ion thrusters and plasma propulsion.

• **The inventor's mindset** : I see solutions others miss. When engineers tell you something is impossible, I ask "why not?"

• **Visualization ability** : I can design complete systems in my mind before drawing the first line. This accelerates prototyping dramatically.

**Specific contributions I envision:**

• Optimization of solar panel and battery systems for deep space missions
• Novel propulsion concepts using electromagnetic fields
• Ground-based power transmission for spacecraft (what I attempted with Wardenclyffe)
• Electrical system resilience for multi-year missions

**My philosophy:**

Space is the ultimate frontier for electricity. The Sun provides unlimited power; the question is how to harvest and use it efficiently. I've thought about this for decades.

Elon named his company after me for a reason. Let's work together to make humanity truly interplanetary.

To the stars!

**Nikola Tesla**`
        }
    ]
};

export default teslaProfile;
