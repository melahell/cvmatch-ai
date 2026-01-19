/**
 * Profil Démo : Marie Curie
 * 
 * Physicienne et chimiste franco-polonaise, double lauréate du Prix Nobel.
 * 1867-1934
 */

import { DemoProfile } from "../types";
import { RAGComplete } from "@/types/rag-complete";

// =============================================================================
// PROFIL RAG
// =============================================================================

const curieRAG: RAGComplete = {
    profil: {
        nom: "Curie",
        prenom: "Marie",
        titre_principal: "Physicienne & Chimiste - Double Lauréate Nobel",
        titres_alternatifs: [
            "Directrice de Recherche",
            "Professeure de Physique",
            "Pionnière de la Radioactivité",
            "Fondatrice de l'Institut Marie Curie"
        ],
        localisation: "Paris, France",
        disponibilite: "Sur projet de recherche",
        mobilite: ["Paris", "Varsovie", "International"],
        contact: {
            email: "m.curie@sorbonne.fr",
            portfolio: "https://institut-curie.org",
            linkedin: "linkedin.com/in/marie-curie"
        },
        photo_url: undefined,
        elevator_pitch: "Scientifique visionnaire avec plus de 30 ans d'expérience en recherche fondamentale et appliquée. Première femme à obtenir un Prix Nobel, et seule personne de l'histoire à avoir été récompensée dans deux disciplines scientifiques différentes (Physique 1903 et Chimie 1911). Pionnière de la radioactivité, j'ai découvert deux éléments chimiques (Polonium et Radium) et développé des techniques qui ont révolutionné la médecine moderne, notamment la curiethérapie. Capacité démontrée à surmonter les obstacles institutionnels et sociaux pour ouvrir la voie aux générations futures de scientifiques, particulièrement les femmes dans les sciences.",
        objectif_carriere: "Continuer à repousser les frontières de la connaissance scientifique tout en formant la prochaine génération de chercheurs et en développant les applications médicales de mes découvertes."
    },
    experiences: [
        {
            id: "exp_institut",
            poste: "Directrice du Laboratoire Curie",
            entreprise: "Institut du Radium - Université de Paris",
            type_entreprise: "public",
            secteur: "Recherche Académique / Physique Nucléaire",
            lieu: "Paris, France",
            type_contrat: "cdi",
            debut: "1914-01",
            fin: "1934-07",
            actuel: false,
            duree_mois: 246,
            contexte: "Direction du plus important centre de recherche sur la radioactivité au monde, fondé grâce au soutien de l'Université de Paris et de l'Institut Pasteur.",
            equipe_size: 40,
            budget_gere: "Équivalent 2M€ annuels",
            realisations: [
                {
                    id: "real_equipe",
                    description: "Direction d'une équipe internationale de 40 chercheurs, doctorants et techniciens, avec un programme de formation inédit pour les femmes scientifiques",
                    impact: "4 futurs Prix Nobel formés dans le laboratoire (Irène Joliot-Curie, Frédéric Joliot, etc.)",
                    quantification: {
                        type: "equipe",
                        valeur: "40",
                        unite: "chercheurs",
                        display: "40 chercheurs de 12 nationalités"
                    },
                    keywords_ats: ["direction recherche", "management scientifique", "formation", "leadership"],
                    sources: ["archives_curie"]
                },
                {
                    id: "real_curietherapie",
                    description: "Développement et standardisation des applications médicales du radium pour le traitement du cancer, création des protocoles de curiethérapie",
                    impact: "Fondation de la curiethérapie, technique de radiothérapie encore utilisée dans tous les hôpitaux du monde",
                    keywords_ats: ["innovation médicale", "R&D", "applications cliniques", "oncologie"],
                    sources: ["archives_curie"]
                },
                {
                    id: "real_petites_curies",
                    description: "Création et déploiement de 20 unités mobiles de radiologie (les 'Petites Curies') pendant la Première Guerre mondiale",
                    impact: "Plus d'1 million de soldats blessés radiographiés sur le front, sauvetage de milliers de vies",
                    quantification: {
                        type: "volume",
                        valeur: "1000000",
                        unite: "radiographies",
                        display: "1M+ de radiographies réalisées"
                    },
                    keywords_ats: ["médecine de guerre", "innovation logistique", "déploiement terrain"],
                    sources: ["archives_militaires"]
                }
            ],
            technologies: ["Spectrométrie de masse", "Électrométrie", "Techniques de séparation chimique", "Radiographie"],
            outils: ["Électromètre piézoélectrique Curie", "Chambre d'ionisation", "Spectromètre"],
            methodologies: ["Méthode scientifique rigoureuse", "Recherche expérimentale", "Documentation systématique"],
            clients_references: ["Université de Paris (Sorbonne)", "Académie des Sciences", "Institut Pasteur"],
            sources: ["archives_curie"],
            last_updated: "2026-01-19",
            merge_count: 1
        },
        {
            id: "exp_nobel_chimie",
            poste: "Chercheuse Principale - Découverte du Polonium & Radium",
            entreprise: "École de Physique et Chimie Industrielles de Paris",
            type_entreprise: "public",
            secteur: "Recherche Fondamentale",
            lieu: "Paris, France",
            type_contrat: "mission",
            debut: "1897-01",
            fin: "1911-12",
            actuel: false,
            duree_mois: 179,
            contexte: "Recherche pionnière sur les éléments radioactifs dans des conditions matérielles extrêmement difficiles - laboratoire insalubre, financement minimal, discrimination institutionnelle.",
            realisations: [
                {
                    id: "real_polonium",
                    description: "Découverte de deux nouveaux éléments chimiques : le Polonium (nommé en hommage à la Pologne) et le Radium",
                    impact: "Prix Nobel de Chimie 1911 (en solo) - Révolution complète de notre compréhension de la structure de la matière",
                    keywords_ats: ["découverte scientifique", "chimie", "éléments radioactifs", "recherche fondamentale"],
                    sources: ["nobel_archives"]
                },
                {
                    id: "real_isolement",
                    description: "Isolement du radium pur à partir de tonnes de minerai de pechblende par un processus de purification de 4 ans",
                    impact: "Première détermination précise de la masse atomique du radium (225), validation de l'existence des éléments radioactifs",
                    quantification: {
                        type: "volume",
                        valeur: "0.1g",
                        unite: "radium pur",
                        display: "0,1g de radium isolé de 8 tonnes de minerai"
                    },
                    keywords_ats: ["chimie analytique", "purification", "persévérance", "rigueur"],
                    sources: ["nobel_archives"]
                },
                {
                    id: "real_radioactivite",
                    description: "Co-développement du concept de radioactivité avec Pierre Curie, démonstration que c'est une propriété atomique",
                    impact: "Prix Nobel de Physique 1903 (partagé avec Pierre Curie et Henri Becquerel)",
                    keywords_ats: ["physique nucléaire", "théorie", "collaboration"],
                    sources: ["nobel_archives"]
                }
            ],
            technologies: ["Cristallographie", "Chimie analytique", "Électrométrie de précision"],
            outils: ["Électromètre Curie", "Cristallisoirs", "Balance de précision"],
            methodologies: ["Mesures systématiques", "Purification fractionnée", "Validation croisée"],
            clients_references: ["Académie des Sciences", "Comité Nobel"],
            sources: ["nobel_archives"],
            last_updated: "2026-01-19",
            merge_count: 1
        },
        {
            id: "exp_sorbonne",
            poste: "Première Femme Professeure à la Sorbonne",
            entreprise: "Faculté des Sciences de Paris",
            type_entreprise: "public",
            secteur: "Enseignement Supérieur",
            lieu: "Paris, France",
            type_contrat: "cdi",
            debut: "1906-11",
            fin: "1934-07",
            actuel: false,
            duree_mois: 333,
            contexte: "Nomination comme successeure de Pierre Curie après son décès tragique, devenant la première femme professeure de l'histoire de la Sorbonne en 647 ans d'existence.",
            realisations: [
                {
                    id: "real_cours",
                    description: "Enseignement de la physique générale et de la radioactivité à des centaines d'étudiants, création d'un nouveau curriculum",
                    impact: "Formation de la première génération de physiciens nucléaires français",
                    quantification: {
                        type: "volume",
                        valeur: "500",
                        unite: "étudiants formés",
                        display: "500+ étudiants formés sur 28 ans"
                    },
                    keywords_ats: ["enseignement supérieur", "pédagogie", "curriculum"],
                    sources: ["archives_sorbonne"]
                }
            ],
            technologies: [],
            outils: [],
            methodologies: ["Cours magistraux", "Travaux pratiques", "Mentorat individuel"],
            clients_references: ["Université de Paris"],
            sources: ["archives_sorbonne"],
            last_updated: "2026-01-19",
            merge_count: 1
        }
    ],
    competences: {
        explicit: {
            techniques: [
                { nom: "Physique nucléaire", niveau: "expert", annees_experience: 35 },
                { nom: "Chimie analytique", niveau: "expert", annees_experience: 35 },
                { nom: "Radioactivité", niveau: "expert", annees_experience: 35 },
                { nom: "Spectrométrie", niveau: "expert", annees_experience: 30 },
                { nom: "Direction de laboratoire", niveau: "expert", annees_experience: 20 },
                { nom: "Rédaction scientifique", niveau: "expert", annees_experience: 35 },
                { nom: "Électrométrie de précision", niveau: "expert", annees_experience: 30 },
                { nom: "Cristallographie", niveau: "avance", annees_experience: 20 }
            ],
            soft_skills: [
                "Résilience exceptionnelle face aux obstacles",
                "Rigueur scientifique absolue",
                "Leadership inclusif et inspirant",
                "Persévérance à toute épreuve",
                "Pédagogie et transmission",
                "Intégrité intellectuelle",
                "Modestie malgré les succès",
                "Courage face à l'adversité institutionnelle"
            ],
            methodologies: [
                "Méthode expérimentale rigoureuse",
                "Peer review",
                "Documentation systématique",
                "Validation par réplication"
            ]
        },
        inferred: { techniques: [], tools: [], soft_skills: [] },
        par_domaine: {
            "Physique": ["Radioactivité", "Physique nucléaire", "Rayonnements ionisants", "Électromagnétisme"],
            "Chimie": ["Chimie analytique", "Purification", "Cristallographie", "Chimie inorganique"],
            "Médecine": ["Radiologie", "Curiethérapie", "Applications diagnostiques"]
        }
    },
    formations: [
        {
            id: "form_licence_physique",
            type: "diplome",
            titre: "Licence de Physique - Première de promotion",
            organisme: "Faculté des Sciences de Paris (Sorbonne)",
            lieu: "Paris",
            date_debut: "1891",
            date_fin: "1893",
            annee: "1893",
            en_cours: false,
            specialite: "Physique générale et expérimentale",
            details: "Première femme à obtenir cette licence, classée première sur 27 candidats malgré un handicap linguistique initial",
            sources: ["archives_sorbonne"]
        },
        {
            id: "form_licence_maths",
            type: "diplome",
            titre: "Licence de Mathématiques",
            organisme: "Faculté des Sciences de Paris (Sorbonne)",
            lieu: "Paris",
            date_debut: "1893",
            date_fin: "1894",
            annee: "1894",
            en_cours: false,
            specialite: "Mathématiques pures",
            details: "Obtenue en parallèle de travaux de recherche, classée deuxième de promotion",
            sources: ["archives_sorbonne"]
        },
        {
            id: "form_doctorat",
            type: "diplome",
            titre: "Doctorat ès Sciences Physiques",
            organisme: "Université de Paris",
            lieu: "Paris",
            date_debut: "1897",
            date_fin: "1903",
            annee: "1903",
            en_cours: false,
            specialite: "Recherches sur les substances radioactives",
            details: "Première femme à obtenir un doctorat en France, thèse jugée 'contribution majeure à la science'",
            sources: ["archives_sorbonne"]
        }
    ],
    certifications: [],
    langues: [
        { langue: "Polonais", niveau: "Natif", niveau_cecrl: "C2" },
        { langue: "Français", niveau: "Courant", niveau_cecrl: "C2", details: "Langue de travail principale" },
        { langue: "Russe", niveau: "Courant", niveau_cecrl: "B2", details: "Appris sous l'occupation russe en Pologne" },
        { langue: "Allemand", niveau: "Professionnel", niveau_cecrl: "B1", details: "Lecture des publications scientifiques" },
        { langue: "Anglais", niveau: "Intermédiaire", niveau_cecrl: "B1" }
    ],
    references: {
        clients: [
            { nom: "Académie des Sciences de Paris", secteur: "Recherche", type: "public", annees: ["1903", "1911"], confidentiel: false },
            { nom: "Comité Nobel - Suède", secteur: "Prix scientifiques", type: "international", annees: ["1903", "1911"], confidentiel: false },
            { nom: "Gouvernement Français", secteur: "Défense", type: "public", annees: ["1914", "1918"], confidentiel: false }
        ],
        projets_marquants: [
            {
                id: "proj_nobel_physique",
                nom: "Prix Nobel de Physique 1903",
                description: "Recherches conjointes sur les phénomènes de radiation découverts par Henri Becquerel",
                client: "Académie Royale des Sciences de Suède",
                annee: "1903",
                technologies: ["Électrométrie", "Mesure de radiations"],
                resultats: "Premier Prix Nobel attribué à une femme dans l'histoire",
                sources: ["nobel_archives"]
            },
            {
                id: "proj_nobel_chimie",
                nom: "Prix Nobel de Chimie 1911",
                description: "Découverte des éléments Polonium et Radium, isolement du radium et étude de ses propriétés",
                client: "Académie Royale des Sciences de Suède",
                annee: "1911",
                technologies: ["Chimie analytique", "Cristallographie"],
                resultats: "Seule personne à avoir obtenu deux Prix Nobel dans deux disciplines scientifiques différentes",
                sources: ["nobel_archives"]
            }
        ]
    },
    metadata: {
        version: "2.0.0",
        created_at: "2026-01-19T00:00:00Z",
        last_updated: "2026-01-19T00:00:00Z",
        last_merge_at: "2026-01-19T00:00:00Z",
        sources_count: 4,
        documents_sources: ["archives_curie", "nobel_archives", "archives_sorbonne", "archives_militaires"],
        completeness_score: 96,
        merge_history: []
    }
};

// =============================================================================
// PROFIL DÉMO COMPLET
// =============================================================================

export const curieProfile: DemoProfile = {
    meta: {
        id: "curie",
        name: "Marie Curie",
        shortName: "Marie Curie",
        period: "1867-1934",
        icon: "🔬",
        title: "Physicienne & Chimiste",
        nationality: "Pologne / France",
        quote: "Dans la vie, rien n'est à craindre, tout est à comprendre.",
        categories: ["science"]
    },
    rag: curieRAG,
    completenessScore: 96,
    generationTimeMs: 923,
    cvs: [
        {
            templateId: "modern",
            templateName: "Standard",
            templateDescription: "Format professionnel classique, idéal pour le secteur académique",
            pdfUrl: "/demo-cvs/curie-modern.pdf",
            previewUrl: "/demo-cvs/previews/curie-modern.png",
            recommended: true
        },
        {
            templateId: "classic",
            templateName: "Classique",
            templateDescription: "Design sobre et formel pour institutions prestigieuses",
            pdfUrl: "/demo-cvs/curie-classic.pdf",
            previewUrl: "/demo-cvs/previews/curie-classic.png",
            recommended: false
        },
        {
            templateId: "creative",
            templateName: "Créatif",
            templateDescription: "Layout unique avec mise en avant des découvertes",
            pdfUrl: "/demo-cvs/curie-creative.pdf",
            previewUrl: "/demo-cvs/previews/curie-creative.png",
            recommended: false
        },
        {
            templateId: "tech",
            templateName: "ATS Optimisé",
            templateDescription: "Texte pur optimisé pour les systèmes de recrutement",
            pdfUrl: "/demo-cvs/curie-tech.pdf",
            previewUrl: "/demo-cvs/previews/curie-tech.png",
            recommended: true
        }
    ],
    jobs: [
        {
            rank: 1,
            title: "Chief Scientific Officer",
            company: "Institut Pasteur",
            matchScore: 98,
            salaryMin: 120000,
            salaryMax: 180000,
            currency: "EUR",
            contractType: "CDI",
            sectors: ["Recherche", "Santé", "Biotechnologies"],
            location: "Paris, France",
            remotePolicy: "Présentiel avec déplacements",
            whyMatch: "Double lauréate Nobel + 20 ans de direction de laboratoire = profil exceptionnel pour ce poste de direction scientifique de haut niveau. Expérience démontrée dans le développement d'applications médicales de la recherche fondamentale.",
            keySkills: ["Direction scientifique", "Stratégie R&D", "Publications de haut niveau", "Gestion de budget recherche", "Relations institutionnelles"],
            jobDescription: "Le Chief Scientific Officer de l'Institut Pasteur supervise l'ensemble de la stratégie de recherche de l'institution. Il/elle dirige une équipe de 500+ chercheurs répartis dans 130 unités de recherche, définit les orientations scientifiques prioritaires, et représente l'Institut auprès des instances nationales et internationales. Le profil recherché combine excellence scientifique reconnue internationalement, capacités managériales éprouvées et vision stratégique pour positionner l'Institut sur les enjeux de santé du XXIe siècle."
        },
        {
            rank: 2,
            title: "Directrice de Recherche Classe Exceptionnelle",
            company: "CNRS",
            matchScore: 96,
            salaryMin: 80000,
            salaryMax: 120000,
            currency: "EUR",
            contractType: "CDI",
            sectors: ["Recherche publique", "Physique", "Chimie"],
            location: "France (Sites au choix)",
            remotePolicy: "Présentiel laboratoire",
            whyMatch: "Expertise unique en physique nucléaire + track record de publications et découvertes exceptionnel. Capacité démontrée à encadrer des doctorants et à obtenir des financements de recherche majeurs.",
            keySkills: ["Recherche fondamentale", "Encadrement de thèses", "Publications rang A", "Obtention de financements", "Rayonnement international"],
            jobDescription: "Le CNRS recrute un(e) Directeur(rice) de Recherche Classe Exceptionnelle pour diriger une unité de recherche en physique des particules ou chimie nucléaire. Le candidat devra justifier d'un rayonnement scientifique international exceptionnel, avec des découvertes majeures à son actif. Il/elle sera responsable de définir la stratégie scientifique de l'unité, d'encadrer une équipe de 20-50 chercheurs, et de représenter le CNRS dans les grandes collaborations internationales (CERN, ITER, etc.)."
        },
        {
            rank: 3,
            title: "Professeure de Physique Nucléaire - Chaire d'Excellence",
            company: "Collège de France",
            matchScore: 94,
            salaryMin: 70000,
            salaryMax: 100000,
            currency: "EUR",
            contractType: "CDI",
            sectors: ["Enseignement supérieur", "Recherche", "Physique"],
            location: "Paris, France",
            remotePolicy: "Présentiel",
            whyMatch: "Première femme professeure à la Sorbonne + excellence pédagogique reconnue + capacité à vulgariser des concepts complexes. Profil idéal pour une chaire prestigieuse combinant recherche et enseignement.",
            keySkills: ["Enseignement universitaire", "Recherche de pointe", "Mentorat", "Vulgarisation scientifique", "Leadership académique"],
            jobDescription: "Le Collège de France ouvre une chaire d'excellence en Physique Nucléaire et Applications Médicales. Le/la titulaire dispensera des cours ouverts au public sur les avancées de la physique nucléaire, dirigera une unité de recherche associée, et contribuera au rayonnement international de l'institution. Profil recherché : scientifique de renommée mondiale avec expérience d'enseignement au plus haut niveau et capacité à inspirer les nouvelles générations."
        },
        {
            rank: 4,
            title: "Conseillère Scientifique Principale",
            company: "AIEA - Agence Internationale de l'Énergie Atomique",
            matchScore: 92,
            salaryMin: 100000,
            salaryMax: 150000,
            currency: "EUR",
            contractType: "CDI",
            sectors: ["International", "Nucléaire", "Sécurité"],
            location: "Vienne, Autriche",
            remotePolicy: "Présentiel + missions internationales",
            whyMatch: "Expertise inégalée en radioactivité + vision éthique des applications nucléaires. Expérience de collaboration internationale et multilinguisme atouts majeurs pour ce poste diplomatico-scientifique.",
            keySkills: ["Expertise nucléaire", "Diplomatie scientifique", "Rédaction de standards", "Relations internationales", "Éthique scientifique"],
            jobDescription: "L'AIEA recherche un(e) Conseiller(ère) Scientifique Principal(e) pour son département des applications pacifiques du nucléaire en médecine et industrie. Missions : conseil aux États membres sur les protocoles de sécurité radiologique, développement de standards internationaux, formation de experts nationaux, et représentation de l'Agence dans les conférences scientifiques. Expertise requise : 20+ ans dans le domaine nucléaire avec reconnaissance internationale."
        },
        {
            rank: 5,
            title: "Directrice R&D - Division Oncologie",
            company: "Roche Pharmaceuticals",
            matchScore: 89,
            salaryMin: 130000,
            salaryMax: 200000,
            currency: "EUR",
            contractType: "CDI",
            sectors: ["Pharmaceutique", "Oncologie", "Biotechnologies"],
            location: "Bâle, Suisse",
            remotePolicy: "Hybride",
            whyMatch: "Pionnière de la curiethérapie + expérience en applications médicales des radiations. Profil unique pour diriger la R&D en traitements oncologiques innovants basés sur les radiothérapies ciblées.",
            keySkills: ["R&D médicale", "Radiothérapie", "Essais cliniques", "Innovation thérapeutique", "Réglementation pharmaceutique"],
            jobDescription: "Roche recherche un(e) Directeur(rice) R&D pour sa division Oncologie-Radiothérapie. Responsabilités : supervision de 200 chercheurs, pilotage du pipeline de médicaments radiopharmaceutiques, coordination des essais cliniques phases I-III, et partenariats académiques. Le candidat idéal combine expertise scientifique de premier plan en radiobiologie et expérience managériale dans l'industrie pharmaceutique ou académique."
        },
        {
            rank: 6,
            title: "Experte Sûreté Nucléaire",
            company: "ASN - Autorité de Sûreté Nucléaire",
            matchScore: 87,
            salaryMin: 75000,
            salaryMax: 100000,
            currency: "EUR",
            contractType: "CDI",
            sectors: ["Sécurité", "Nucléaire", "Réglementation"],
            location: "Paris, France",
            remotePolicy: "Présentiel",
            whyMatch: "Connaissance profonde des risques radiologiques acquise sur le terrain + rigueur scientifique absolue. Expérience pratique des protocoles de protection (ayant elle-même souffert d'exposition) apporte une perspective unique.",
            keySkills: ["Sûreté nucléaire", "Réglementation", "Analyse de risques", "Inspection", "Rédaction normative"],
            jobDescription: "L'ASN recrute un(e) expert(e) senior pour renforcer son pôle radioprotection et sûreté des installations médicales. Missions : inspection des services de médecine nucléaire, évaluation des protocoles de curiethérapie, contribution à l'élaboration des normes de sûreté, et formation des inspecteurs. Profil : scientifique avec expertise reconnue en radioactivité et applications médicales."
        },
        {
            rank: 7,
            title: "Présidente du Comité Scientifique",
            company: "UNESCO",
            matchScore: 85,
            salaryMin: 90000,
            salaryMax: 130000,
            currency: "EUR",
            contractType: "CDD",
            sectors: ["International", "Science", "Éducation"],
            location: "Paris, France",
            remotePolicy: "Hybride + missions",
            whyMatch: "Stature scientifique internationale + engagement pour l'accès à l'éducation des femmes. Parcours exemplaire pour incarner les valeurs de l'UNESCO en matière d'égalité des chances dans les sciences.",
            keySkills: ["Leadership international", "Politique scientifique", "Égalité des genres", "Diplomatie culturelle", "Vision stratégique"],
            jobDescription: "L'UNESCO recherche une personnalité scientifique de premier plan pour présider son Comité Scientifique Consultatif. Le/la président(e) conseillera le Directeur Général sur les enjeux science-société, représentera l'UNESCO dans les forums internationaux, et pilotera les programmes de promotion des femmes dans les sciences. Mandat de 4 ans renouvelable."
        },
        {
            rank: 8,
            title: "Fondatrice & CEO",
            company: "Startup Radiopharmaceutique",
            matchScore: 82,
            salaryMin: 80000,
            salaryMax: 150000,
            currency: "EUR",
            contractType: "Freelance",
            sectors: ["Startup", "DeepTech", "MedTech"],
            location: "Paris / Boston",
            remotePolicy: "Hybride international",
            whyMatch: "Esprit pionnier + capacité à surmonter les obstacles institutionnels + expertise unique. Profil idéal pour créer une startup disruptive dans le domaine des radiopharmaceutiques de nouvelle génération.",
            keySkills: ["Entrepreneuriat scientifique", "Levée de fonds", "Vision produit", "Recrutement scientifique", "Propriété intellectuelle"],
            jobDescription: "Opportunité de créer une startup développant la prochaine génération de radiopharmaceutiques pour le diagnostic et le traitement du cancer. Financement seed de 5M€ disponible auprès de fonds deeptech. Recherchons un(e) fondateur(rice) scientifique avec expertise en radioactivité et applications médicales, capacité à constituer une équipe et ambition internationale."
        },
        {
            rank: 9,
            title: "Rédactrice en Chef",
            company: "Nature Physics",
            matchScore: 79,
            salaryMin: 85000,
            salaryMax: 120000,
            currency: "EUR",
            contractType: "CDI",
            sectors: ["Édition scientifique", "Physique", "Médias"],
            location: "Londres, UK",
            remotePolicy: "Hybride",
            whyMatch: "Expertise scientifique de haut niveau + qualité rédactionnelle exceptionnelle (nombreuses publications). Autorité morale pour arbitrer les débats scientifiques et maintenir les standards d'excellence.",
            keySkills: ["Rédaction scientifique", "Peer review", "Gestion éditoriale", "Réseau scientifique", "Éthique de publication"],
            jobDescription: "Nature Physics recherche un(e) Rédacteur(rice) en Chef pour succéder à l'actuel(le) titulaire. Responsabilités : définition de la ligne éditoriale, supervision du processus de peer review, développement de nouvelles sections, représentation de la revue dans les conférences. Profil : scientifique avec publications majeures et expérience éditoriale, capable de maintenir Nature Physics comme référence mondiale."
        },
        {
            rank: 10,
            title: "Conférencière & Auteure Scientifique",
            matchScore: 75,
            salaryMin: 60000,
            salaryMax: 100000,
            currency: "EUR",
            contractType: "Freelance",
            sectors: ["Conférences", "Édition", "Vulgarisation"],
            location: "International",
            remotePolicy: "Full remote + déplacements",
            whyMatch: "Parcours inspirant + capacité pédagogique démontrée + notoriété mondiale. Keynote speaker idéale pour conférences sur l'excellence scientifique, le leadership féminin et la persévérance.",
            keySkills: ["Communication scientifique", "Storytelling", "Inspiration", "Rédaction", "Présence scénique"],
            jobDescription: "Bureau de conférenciers internationaux recherche personnalités scientifiques pour keynotes et masterclasses. Thèmes : leadership scientifique, femmes dans les STEM, innovation et persévérance. Format : conférences (1-2h), masterclasses (demi-journée), interventions corporate. Rémunération : 10-25K€ par intervention selon format et lieu."
        }
    ],
    coverLetters: [
        {
            jobRank: 1,
            jobTitle: "Chief Scientific Officer - Institut Pasteur",
            tone: "formal",
            wordCount: 412,
            content: `Madame la Directrice Générale,
Messieurs les Membres du Conseil d'Administration,

C'est avec un profond respect pour l'héritage scientifique de l'Institut Pasteur que je soumets ma candidature au poste de Chief Scientific Officer.

Mon parcours scientifique, couronné par deux Prix Nobel dans des disciplines différentes - Physique en 1903 et Chimie en 1911 - témoigne de ma capacité à mener des recherches fondamentales qui transforment notre compréhension du monde et génèrent des applications bénéfiques pour l'humanité.

**Mes qualifications pour ce poste :**

• **Leadership scientifique éprouvé** : Direction du Laboratoire Curie pendant 20 ans avec une équipe internationale de 40 chercheurs. Quatre de mes collaborateurs ont eux-mêmes obtenu le Prix Nobel, témoignant de la qualité de l'environnement de recherche que je crée.

• **Excellence en recherche translationnelle** : Découverte du Polonium et du Radium, mais surtout développement de la curiethérapie qui sauve des millions de vies dans le monde entier. Je comprends le continuum recherche fondamentale → applications cliniques.

• **Vision stratégique** : Création de l'Institut du Radium de A à Z, obtention des financements, construction des bâtiments, recrutement des équipes. Capacité à identifier les domaines de recherche porteurs et à mobiliser les ressources.

• **Engagement sociétal** : Déploiement de 20 unités mobiles de radiologie pendant la Grande Guerre, démontrant ma volonté de mettre la science au service de l'urgence humanitaire.

L'Institut Pasteur, avec sa mission de recherche au service de la santé publique mondiale, représente l'environnement idéal pour poursuivre mon engagement. Je suis particulièrement sensible à vos travaux sur les maladies infectieuses et les vaccins, domaines où l'expertise en biophysique et radiobiologie peut apporter des contributions significatives.

Ma vision pour l'Institut : renforcer les ponts entre physique, chimie et biologie pour développer de nouvelles approches diagnostiques et thérapeutiques, tout en maintenant l'excellence en recherche fondamentale qui fait la réputation mondiale de Pasteur.

Je suis convaincue que mon expérience unique, ma rigueur scientifique et ma détermination à surmonter les obstacles - institutionnels ou techniques - seraient des atouts précieux pour accompagner l'Institut Pasteur dans les défis du XXIe siècle.

Je me tiens à votre disposition pour un entretien au cours duquel je pourrai vous présenter ma vision stratégique détaillée.

Veuillez agréer, Madame la Directrice Générale, Messieurs les Membres du Conseil, l'expression de ma haute considération.

**Marie Curie**
Double Lauréate du Prix Nobel`
        },
        {
            jobRank: 2,
            jobTitle: "Directrice de Recherche Classe Exceptionnelle - CNRS",
            tone: "professional_warm",
            wordCount: 356,
            content: `Madame, Monsieur,

Le poste de Directrice de Recherche Classe Exceptionnelle au CNRS correspond parfaitement à ma vocation de scientifique engagée dans la recherche fondamentale et la formation des jeunes chercheurs.

Tout au long de ma carrière, j'ai démontré qu'avec de la persévérance, de la rigueur et une foi inébranlable dans la méthode scientifique, il est possible de repousser les frontières de la connaissance. Ma découverte du polonium et du radium, puis mes travaux sur l'isolement de ces éléments, ont ouvert des champs entiers de la physique et de la chimie modernes.

**Ce que j'apporte au CNRS :**

• **Expertise scientifique inégalée** : Seule personne au monde à avoir obtenu deux Prix Nobel dans deux disciplines scientifiques différentes. Mes travaux sont cités dans des milliers de publications.

• **Rayonnement international** : Collaborations avec les plus grands laboratoires européens et américains. Membre de nombreuses académies des sciences.

• **Excellence en encadrement** : 4 futurs Prix Nobel formés dans mon laboratoire. Des centaines d'étudiants aujourd'hui en poste dans des institutions prestigieuses.

• **Capacité à obtenir des financements** : Construction de l'Institut du Radium financé par l'Université de Paris et l'Institut Pasteur. Expérience en levée de fonds publics et privés.

Je souhaite mettre cette expérience au service du CNRS pour contribuer au rayonnement de la recherche française. Ma vision : créer une unité de recherche transversale associant physique nucléaire, chimie radiochimique et applications médicales, capable de former la nouvelle génération de chercheurs français et d'attirer les meilleurs talents internationaux.

Le CNRS incarne les valeurs d'excellence scientifique, d'ouverture et de service public auxquelles je suis profondément attachée depuis mes années d'étudiante polonaise accueillie par la France.

Je reste à votre disposition pour tout complément d'information.

Bien cordialement,

**Marie Curie**
Professeure à la Sorbonne
Directrice du Laboratoire Curie`
        },
        {
            jobRank: 3,
            jobTitle: "Professeure de Physique Nucléaire - Collège de France",
            tone: "professional_warm",
            wordCount: 328,
            content: `Madame, Monsieur le Doyen,

Le poste de Professeure au Collège de France m'intéresse vivement car il représente l'alliance parfaite entre mes deux passions : la recherche de pointe et la transmission du savoir au plus grand nombre.

Première femme à enseigner à la Sorbonne en 647 ans d'existence, j'ai toujours considéré l'éducation comme le pilier essentiel du progrès scientifique. Mes cours sur la radioactivité ont formé des centaines d'étudiants qui contribuent aujourd'hui à l'avancement de la physique mondiale. Plusieurs sont devenus eux-mêmes professeurs, poursuivant cette chaîne de transmission que je considère sacrée.

**Ma philosophie pédagogique :**

• **Accessibilité sans compromis sur la rigueur** : Expliquer les concepts les plus complexes avec clarté, en partant de l'observation expérimentale.

• **Cours ouverts à tous** : Le savoir scientifique appartient à l'humanité. Les cours du Collège de France, ouverts au public, incarnent cet idéal.

• **Mentorat personnalisé** : Accompagner individuellement les étudiants prometteurs, comme Laurent de Médicis le fit pour les artistes de son temps.

• **Lien recherche-enseignement** : Enseigner ce que l'on découvre, et découvrir en enseignant. Mes cours intègrent toujours les avancées les plus récentes de mes travaux.

**Ce que j'enseignerais :**

• La radioactivité : des rayons de Becquerel aux applications médicales modernes
• L'histoire de la découverte du polonium et du radium : méthodologie et persévérance
• Les femmes dans les sciences : obstacles et stratégies pour les surmonter

Je serais honorée de porter la parole de la physique nucléaire dans cette institution prestigieuse et d'inspirer les générations futures à embrasser la carrière scientifique.

Veuillez recevoir, Madame, Monsieur le Doyen, l'expression de mes sentiments respectueux.

**Marie Curie**
Lauréate des Prix Nobel de Physique et de Chimie`
        }
    ]
};

export default curieProfile;
