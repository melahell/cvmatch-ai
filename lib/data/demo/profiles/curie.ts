/**
 * Profil Démo : Marie Curie
 * 
 * Physicienne et chimiste franco-polonaise, double lauréate du Prix Nobel.
 * 1867-1934
 */

import { DemoProfile } from "../types";
import { RAGComplete } from "@/types/rag-complete";

const curieRAG: RAGComplete = {
    profil: {
        nom: "Curie",
        prenom: "Marie",
        titre_principal: "Physicienne & Chimiste - Double Lauréate Nobel",
        titres_alternatifs: [
            "Directrice de Recherche",
            "Professeure de Physique",
            "Pionnière de la Radioactivité"
        ],
        localisation: "Paris, France",
        disponibilite: "Sur projet de recherche",
        mobilite: ["Paris", "Varsovie", "International"],
        contact: {
            email: "m.curie@sorbonne.fr",
            portfolio: "https://institut-curie.org",
            linkedin: "linkedin.com/in/marie-curie"
        },
        elevator_pitch: "Scientifique visionnaire avec plus de 30 ans d'expérience en recherche fondamentale et appliquée. Première femme à obtenir un Prix Nobel, et seule personne à avoir été récompensée dans deux disciplines scientifiques différentes (Physique et Chimie). Pionnière de la radioactivité, j'ai développé des techniques qui ont révolutionné la médecine et l'industrie. Capacité démontrée à surmonter les obstacles institutionnels et à ouvrir la voie pour les générations futures de scientifiques."
    },
    experiences: [
        {
            id: "exp_institut",
            poste: "Directrice du Laboratoire Curie",
            entreprise: "Institut du Radium - Sorbonne",
            type_entreprise: "public",
            secteur: "Recherche Académique",
            lieu: "Paris, France",
            type_contrat: "cdi",
            debut: "1914-01",
            fin: "1934-07",
            actuel: false,
            duree_mois: 246,
            contexte: "Direction du plus important centre de recherche sur la radioactivité au monde.",
            equipe_size: 40,
            realisations: [
                {
                    id: "real_1",
                    description: "Direction d'une équipe de 40 chercheurs internationaux, formation de la prochaine génération de physiciens nucléaires",
                    impact: "4 futurs Prix Nobel formés dans le laboratoire",
                    keywords_ats: ["direction recherche", "management scientifique", "formation"],
                    sources: ["archives_curie"]
                },
                {
                    id: "real_2",
                    description: "Développement des applications médicales du radium pour le traitement du cancer",
                    impact: "Fondation de la curiethérapie, encore utilisée aujourd'hui",
                    keywords_ats: ["innovation médicale", "R&D", "applications cliniques"],
                    sources: ["archives_curie"]
                }
            ],
            technologies: ["Spectrométrie", "Électrométrie", "Techniques de séparation chimique"],
            outils: ["Électromètre piézoélectrique", "Chambre d'ionisation"],
            methodologies: ["Méthode scientifique rigoureuse", "Recherche expérimentale"],
            clients_references: ["Sorbonne", "Académie des Sciences"],
            sources: ["archives_curie"],
            last_updated: "2026-01-19",
            merge_count: 1
        },
        {
            id: "exp_nobel_chimie",
            poste: "Chercheuse Principale - Découverte Polonium & Radium",
            entreprise: "École de Physique et Chimie de Paris",
            type_entreprise: "public",
            secteur: "Recherche Fondamentale",
            lieu: "Paris, France",
            type_contrat: "mission",
            debut: "1897-01",
            fin: "1911-12",
            actuel: false,
            duree_mois: 179,
            contexte: "Recherche pionnière sur les éléments radioactifs dans des conditions matérielles difficiles.",
            realisations: [
                {
                    id: "real_polonium",
                    description: "Découverte de deux nouveaux éléments chimiques : le Polonium et le Radium",
                    impact: "Prix Nobel de Chimie 1911 - Révolution dans la compréhension de la matière",
                    keywords_ats: ["découverte scientifique", "chimie", "éléments radioactifs"],
                    sources: ["nobel_archives"]
                },
                {
                    id: "real_isolement",
                    description: "Isolement du radium pur à partir de tonnes de minerai de pechblende",
                    impact: "Première détermination précise de la masse atomique du radium",
                    quantification: {
                        type: "volume",
                        valeur: "1g",
                        unite: "radium pur",
                        display: "1g de radium isolé de 8 tonnes de minerai"
                    },
                    keywords_ats: ["chimie analytique", "purification", "persévérance"],
                    sources: ["nobel_archives"]
                }
            ],
            technologies: ["Cristallographie", "Chimie analytique"],
            outils: [],
            methodologies: [],
            clients_references: [],
            sources: ["nobel_archives"],
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
                { nom: "Rédaction scientifique", niveau: "expert", annees_experience: 35 }
            ],
            soft_skills: [
                "Résilience exceptionnelle",
                "Rigueur scientifique",
                "Leadership inclusif",
                "Persévérance",
                "Pédagogie",
                "Intégrité intellectuelle"
            ],
            methodologies: ["Méthode expérimentale", "Peer review", "Documentation rigoureuse"]
        },
        inferred: { techniques: [], tools: [], soft_skills: [] },
        par_domaine: {
            "Physique": ["Radioactivité", "Physique nucléaire", "Rayonnements"],
            "Chimie": ["Chimie analytique", "Purification", "Cristallographie"]
        }
    },
    formations: [
        {
            id: "form_sorbonne",
            type: "diplome",
            titre: "Licence de Physique (1ère de promotion)",
            organisme: "Sorbonne",
            lieu: "Paris",
            annee: "1893",
            en_cours: false,
            sources: ["archives_sorbonne"]
        },
        {
            id: "form_maths",
            type: "diplome",
            titre: "Licence de Mathématiques",
            organisme: "Sorbonne",
            lieu: "Paris",
            annee: "1894",
            en_cours: false,
            sources: ["archives_sorbonne"]
        }
    ],
    certifications: [],
    langues: [
        { langue: "Polonais", niveau: "Natif", niveau_cecrl: "C2" },
        { langue: "Français", niveau: "Courant", niveau_cecrl: "C2" },
        { langue: "Russe", niveau: "Courant", niveau_cecrl: "B2" },
        { langue: "Allemand", niveau: "Professionnel", niveau_cecrl: "B1" }
    ],
    references: {
        clients: [
            { nom: "Académie des Sciences", secteur: "Recherche", type: "public", annees: ["1903", "1911"], confidentiel: false },
            { nom: "Comité Nobel", secteur: "Prix scientifiques", type: "international", annees: ["1903", "1911"], confidentiel: false }
        ],
        projets_marquants: [
            {
                id: "proj_nobel_physique",
                nom: "Prix Nobel de Physique 1903",
                description: "Recherches sur les phénomènes de radiation (avec Pierre Curie et Henri Becquerel)",
                annee: "1903",
                technologies: [],
                resultats: "Premier Prix Nobel attribué à une femme",
                sources: ["nobel_archives"]
            }
        ]
    },
    metadata: {
        version: "2.0.0",
        created_at: "2026-01-19T00:00:00Z",
        last_updated: "2026-01-19T00:00:00Z",
        last_merge_at: "2026-01-19T00:00:00Z",
        sources_count: 3,
        documents_sources: ["archives_curie", "nobel_archives", "archives_sorbonne"],
        completeness_score: 96,
        merge_history: []
    }
};

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
        { templateId: "modern", templateName: "Standard", templateDescription: "Format professionnel classique", pdfUrl: "/demo-cvs/curie-modern.pdf", previewUrl: "/demo-cvs/previews/curie-modern.png", recommended: true },
        { templateId: "classic", templateName: "Classique", templateDescription: "Design sobre et formel", pdfUrl: "/demo-cvs/curie-classic.pdf", previewUrl: "/demo-cvs/previews/curie-classic.png", recommended: false },
        { templateId: "creative", templateName: "Créatif", templateDescription: "Layout unique avec couleur", pdfUrl: "/demo-cvs/curie-creative.pdf", previewUrl: "/demo-cvs/previews/curie-creative.png", recommended: false },
        { templateId: "tech", templateName: "ATS Optimisé", templateDescription: "Texte pur optimisé ATS", pdfUrl: "/demo-cvs/curie-tech.pdf", previewUrl: "/demo-cvs/previews/curie-tech.png", recommended: true }
    ],
    jobs: [
        { rank: 1, title: "Chief Scientific Officer", company: "Institut Pasteur", matchScore: 98, salaryMin: 120000, salaryMax: 180000, currency: "EUR", contractType: "CDI", sectors: ["Recherche", "Santé"], location: "Paris", whyMatch: "Double Nobel + expérience direction recherche = profil exceptionnel pour poste CSO.", keySkills: ["Direction recherche", "Stratégie scientifique", "Publications"], jobDescription: "Direction scientifique d'un institut de recherche de renommée mondiale." },
        { rank: 2, title: "Directrice de Recherche - CNRS", matchScore: 96, salaryMin: 80000, salaryMax: 120000, currency: "EUR", contractType: "CDI", sectors: ["Recherche publique"], location: "France", whyMatch: "Expertise en physique nucléaire + track record exceptionnel.", keySkills: ["Recherche fondamentale", "Encadrement doctorants"], jobDescription: "Direction d'unité de recherche en physique des particules." },
        { rank: 3, title: "Professeure de Physique Nucléaire", matchScore: 94, salaryMin: 70000, salaryMax: 100000, currency: "EUR", contractType: "CDI", sectors: ["Éducation", "Recherche"], location: "Paris", whyMatch: "Pédagogie + expertise = profil idéal.", keySkills: ["Enseignement", "Recherche", "Mentorat"], jobDescription: "Enseignement et recherche en physique nucléaire." },
        { rank: 4, title: "Conseillère Scientifique - AIEA", matchScore: 92, salaryMin: 100000, salaryMax: 150000, currency: "EUR", contractType: "CDI", sectors: ["International", "Nucléaire"], location: "Vienne", whyMatch: "Expertise radioactivité + vision éthique.", keySkills: ["Expertise nucléaire", "Diplomatie scientifique"], jobDescription: "Conseil sur les applications pacifiques du nucléaire." },
        { rank: 5, title: "Directrice R&D Médical - Oncologie", matchScore: 89, salaryMin: 130000, salaryMax: 200000, currency: "EUR", contractType: "CDI", sectors: ["Pharma", "Oncologie"], location: "Bâle", whyMatch: "Pionnière de la curiethérapie.", keySkills: ["R&D médicale", "Radiothérapie"], jobDescription: "Direction R&D en traitements oncologiques." },
        { rank: 6, title: "Experte Sûreté Nucléaire - ASN", matchScore: 87, salaryMin: 75000, salaryMax: 100000, currency: "EUR", contractType: "CDI", sectors: ["Sécurité", "Nucléaire"], location: "Paris", whyMatch: "Connaissance profonde des risques radiologiques.", keySkills: ["Sûreté nucléaire", "Réglementation"], jobDescription: "Expertise en sûreté des installations nucléaires." },
        { rank: 7, title: "Présidente Comité Scientifique - UNESCO", matchScore: 85, salaryMin: 90000, salaryMax: 130000, currency: "EUR", contractType: "CDD", sectors: ["International", "Science"], location: "Paris", whyMatch: "Stature internationale + engagement pour l'éducation.", keySkills: ["Leadership", "Politique scientifique"], jobDescription: "Présidence du comité scientifique de l'UNESCO." },
        { rank: 8, title: "Fondatrice - Startup DeepTech", matchScore: 82, salaryMin: 80000, salaryMax: 150000, currency: "EUR", contractType: "Freelance", sectors: ["Startup", "DeepTech"], location: "Paris", whyMatch: "Esprit pionnier + capacité à surmonter obstacles.", keySkills: ["Innovation", "Entrepreneuriat"], jobDescription: "Création d'une startup dans les technologies de radiation." },
        { rank: 9, title: "Rédactrice en Chef - Nature Physics", matchScore: 79, salaryMin: 85000, salaryMax: 120000, currency: "EUR", contractType: "CDI", sectors: ["Édition", "Science"], location: "Londres", whyMatch: "Expertise + qualité rédactionnelle exceptionnelle.", keySkills: ["Rédaction scientifique", "Peer review"], jobDescription: "Direction éditoriale d'une revue scientifique majeure." },
        { rank: 10, title: "Conférencière Internationale", matchScore: 75, salaryMin: 60000, salaryMax: 100000, currency: "EUR", contractType: "Freelance", sectors: ["Conférences", "Science"], location: "International", whyMatch: "Parcours inspirant + capacité pédagogique.", keySkills: ["Communication", "Inspiration"], jobDescription: "Conférences sur la science et l'égalité des genres." }
    ],
    coverLetters: [
        { jobRank: 1, jobTitle: "Chief Scientific Officer - Institut Pasteur", tone: "formal", wordCount: 380, content: `Madame, Monsieur,\n\nC'est avec un profond intérêt que je soumets ma candidature au poste de Chief Scientific Officer de l'Institut Pasteur.\n\nMon parcours scientifique, couronné par deux Prix Nobel dans des disciplines différentes, témoigne de ma capacité à mener des recherches fondamentales qui transforment notre compréhension du monde et génèrent des applications bénéfiques pour l'humanité.\n\n**Mes atouts pour ce poste :**\n\n• **Leadership scientifique** : Direction du Laboratoire Curie pendant 20 ans avec une équipe de 40 chercheurs internationaux\n• **Excellence en recherche** : Découverte de deux éléments chimiques et développement de la curiethérapie\n• **Vision stratégique** : Capacité à identifier les domaines de recherche porteurs et à mobiliser les ressources\n• **Formation** : 4 futurs Prix Nobel formés dans mon laboratoire\n\nJe suis convaincue que l'Institut Pasteur, avec sa mission de recherche au service de la santé publique, représente l'environnement idéal pour poursuivre mon engagement au service de la science.\n\nJe me tiens à votre disposition pour un entretien.\n\nRespectueusement,\n\n**Marie Curie**` },
        { jobRank: 2, jobTitle: "Directrice de Recherche - CNRS", tone: "professional_warm", wordCount: 310, content: `Madame, Monsieur,\n\nLe poste de Directrice de Recherche au CNRS correspond parfaitement à ma vocation de scientifique engagée dans la recherche fondamentale.\n\nTout au long de ma carrière, j'ai démontré qu'avec de la persévérance et de la rigueur, il est possible de repousser les frontières de la connaissance. Ma découverte du polonium et du radium ainsi que mes travaux sur la radioactivité ont ouvert des champs entiers de la physique moderne.\n\n**Compétences clés :**\n• Expertise en physique nucléaire et radioactivité\n• Encadrement de thèses et formation de chercheurs\n• Publications dans les meilleures revues internationales\n• Capacité à obtenir des financements de recherche\n\nJe souhaite mettre cette expérience au service du CNRS pour former la nouvelle génération de scientifiques français.\n\nCordialement,\n\n**Marie Curie**` },
        { jobRank: 3, jobTitle: "Professeure de Physique Nucléaire", tone: "professional_warm", wordCount: 290, content: `Madame, Monsieur le Doyen,\n\nLe poste de Professeure de Physique Nucléaire m'intéresse vivement car il combine mes deux passions : la recherche et la transmission du savoir.\n\nPremière femme à enseigner à la Sorbonne, j'ai toujours considéré l'éducation comme un pilier essentiel du progrès scientifique. Mes cours ont formé des centaines d'étudiants qui contribuent aujourd'hui à l'avancement de la physique mondiale.\n\n**Approche pédagogique :**\n• Cours basés sur l'expérimentation\n• Encouragement de la pensée critique\n• Mentorat personnalisé des étudiants prometteurs\n\nJe serais honorée de rejoindre votre département pour continuer cette mission.\n\nBien à vous,\n\n**Marie Curie**` }
    ]
};

export default curieProfile;
