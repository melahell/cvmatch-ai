/**
 * Profil Démo : Frida Kahlo
 * 
 * Peintre mexicaine, icône féministe.
 * 1907-1954
 */

import { DemoProfile } from "../types";
import { RAGComplete } from "@/types/rag-complete";

const kahloRAG: RAGComplete = {
    profil: {
        nom: "Kahlo",
        prenom: "Frida",
        titre_principal: "Artiste Peintre & Icône Culturelle",
        titres_alternatifs: ["Peintre surréaliste", "Artiste féministe"],
        localisation: "Mexico City, Mexique",
        contact: { email: "frida@casaazul.art", portfolio: "https://museofridakahlo.org" },
        elevator_pitch: "Artiste peintre mexicaine dont l'œuvre intensément personnelle a marqué l'histoire de l'art du 20e siècle. Créatrice d'un style unique mêlant réalisme magique, symbolisme et culture mexicaine traditionnelle. Plus de 200 œuvres dont 55 autoportraits explorant l'identité, la douleur et la résilience. Première artiste mexicaine exposée au Louvre. Icône mondiale du féminisme et de la diversité."
    },
    experiences: [
        {
            id: "exp_artiste",
            poste: "Artiste Peintre Indépendante",
            entreprise: "Casa Azul Studio",
            type_entreprise: "startup",
            secteur: "Arts",
            lieu: "Mexico City",
            type_contrat: "freelance",
            debut: "1926-01",
            fin: "1954-07",
            actuel: false,
            duree_mois: 342,
            realisations: [
                { id: "real_obras", description: "Création de plus de 200 œuvres originales dont 55 autoportraits iconiques", impact: "Œuvres vendues des millions, exposées dans les plus grands musées", keywords_ats: ["peinture", "autoportrait", "art mexicain"], sources: ["museo_frida"] },
                { id: "real_louvre", description: "Première artiste mexicaine exposée au Musée du Louvre", impact: "Reconnaissance internationale, ouverture des portes aux artistes latino-américains", keywords_ats: ["reconnaissance", "international", "pionnier"], sources: ["museo_frida"] }
            ],
            technologies: ["Peinture à l'huile", "Techniques mixtes"],
            outils: [],
            methodologies: ["Art autobiographique", "Symbolisme"],
            clients_references: ["Louvre", "MoMA", "Collectionneurs privés"],
            sources: ["museo_frida"],
            last_updated: "2026-01-19",
            merge_count: 1
        },
        {
            id: "exp_prof",
            poste: "Professeure de Peinture",
            entreprise: "La Esmeralda",
            type_entreprise: "public",
            secteur: "Éducation artistique",
            lieu: "Mexico City",
            type_contrat: "cdi",
            debut: "1943-01",
            fin: "1954-07",
            actuel: false,
            duree_mois: 138,
            realisations: [
                { id: "real_enseign", description: "Formation d'une génération d'artistes mexicains (Los Fridos)", impact: "Mouvement artistique influent dans l'art mexicain contemporain", keywords_ats: ["enseignement", "mentorat", "art"], sources: ["museo_frida"] }
            ],
            technologies: [],
            outils: [],
            methodologies: ["Enseignement informel", "Apprentissage par la pratique"],
            clients_references: [],
            sources: ["museo_frida"],
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
                { nom: "Enseignement artistique", niveau: "avance", annees_experience: 11 }
            ],
            soft_skills: ["Résilience extraordinaire", "Authenticité", "Expression émotionnelle", "Engagement politique", "Charisme"],
            methodologies: ["Art comme catharsis", "Autobiographie visuelle"]
        },
        inferred: { techniques: [], tools: [], soft_skills: [] },
        par_domaine: { "Peinture": ["Portrait", "Symbolisme", "Art populaire mexicain"] }
    },
    formations: [
        { id: "form_autodidacte", type: "formation", titre: "Formation autodidacte en peinture", organisme: "Autodidacte + mentors", lieu: "Mexico", annee: "1926", en_cours: false, details: "Apprentissage suite à l'accident, influencée par l'art mexicain traditionnel", sources: ["museo_frida"] }
    ],
    certifications: [],
    langues: [
        { langue: "Espagnol", niveau: "Natif", niveau_cecrl: "C2" },
        { langue: "Anglais", niveau: "Courant", niveau_cecrl: "B2" },
        { langue: "Allemand", niveau: "Intermédiaire", niveau_cecrl: "B1" }
    ],
    references: {
        clients: [
            { nom: "Musée du Louvre", secteur: "Musées", type: "international", annees: ["1939"], confidentiel: false },
            { nom: "MoMA New York", secteur: "Musées", type: "international", annees: ["1940"], confidentiel: false }
        ],
        projets_marquants: []
    },
    metadata: { version: "2.0.0", created_at: "2026-01-19T00:00:00Z", last_updated: "2026-01-19T00:00:00Z", last_merge_at: "2026-01-19T00:00:00Z", sources_count: 1, documents_sources: ["museo_frida"], completeness_score: 87, merge_history: [] }
};

export const kahloProfile: DemoProfile = {
    meta: {
        id: "kahlo",
        name: "Frida Kahlo",
        shortName: "Frida",
        period: "1907-1954",
        icon: "🌺",
        title: "Peintre & Icône",
        nationality: "Mexicaine",
        quote: "Pieds, pourquoi en aurais-je besoin si j'ai des ailes pour voler ?",
        categories: ["art"]
    },
    rag: kahloRAG,
    completenessScore: 87,
    generationTimeMs: 798,
    cvs: [
        { templateId: "modern", templateName: "Standard", templateDescription: "Format professionnel", pdfUrl: "/demo-cvs/kahlo-modern.pdf", previewUrl: "", recommended: false },
        { templateId: "classic", templateName: "Classique", templateDescription: "Design sobre", pdfUrl: "/demo-cvs/kahlo-classic.pdf", previewUrl: "", recommended: false },
        { templateId: "creative", templateName: "Créatif", templateDescription: "Layout coloré", pdfUrl: "/demo-cvs/kahlo-creative.pdf", previewUrl: "", recommended: true },
        { templateId: "tech", templateName: "ATS Optimisé", templateDescription: "Focus compétences", pdfUrl: "/demo-cvs/kahlo-tech.pdf", previewUrl: "", recommended: false }
    ],
    jobs: [
        { rank: 1, title: "Directrice Artistique - Musée Frida Kahlo", matchScore: 99, salaryMin: 80000, salaryMax: 120000, currency: "EUR", contractType: "CDI", sectors: ["Musées"], location: "Mexico City", whyMatch: "C'est ma maison, mon musée, mon héritage.", keySkills: ["Direction artistique", "Patrimoine"], jobDescription: "Direction artistique de la Casa Azul." },
        { rank: 2, title: "Ambassadrice Culturelle - Mexique", matchScore: 95, salaryMin: 90000, salaryMax: 140000, currency: "EUR", contractType: "CDI", sectors: ["Culture", "Diplomatie"], location: "International", whyMatch: "Icône de la culture mexicaine mondiale.", keySkills: ["Diplomatie culturelle", "Représentation"], jobDescription: "Promotion de la culture mexicaine dans le monde." },
        { rank: 3, title: "Directrice Créative - Maison de Luxe", matchScore: 91, salaryMin: 150000, salaryMax: 250000, currency: "EUR", contractType: "CDI", sectors: ["Mode", "Luxe"], location: "Paris", whyMatch: "Style iconique + influence mode.", keySkills: ["Direction créative", "Mode"], jobDescription: "Direction créative d'une maison de luxe." },
        { rank: 4, title: "Artiste en Résidence - Fondation", matchScore: 88, salaryMin: 60000, salaryMax: 90000, currency: "EUR", contractType: "CDD", sectors: ["Art"], location: "International", whyMatch: "Parcours artistique unique.", keySkills: ["Création", "Résidence"], jobDescription: "Résidence de création dans une fondation internationale." },
        { rank: 5, title: "Curatrice - Art Latino-américain", matchScore: 85, salaryMin: 70000, salaryMax: 100000, currency: "EUR", contractType: "CDI", sectors: ["Musées"], location: "New York", whyMatch: "Connaissance profonde de l'art mexicain.", keySkills: ["Curation", "Art latino"], jobDescription: "Curation d'expositions d'art latino-américain." },
        { rank: 6, title: "Professeure d'Art - Beaux-Arts", matchScore: 82, salaryMin: 55000, salaryMax: 80000, currency: "EUR", contractType: "CDI", sectors: ["Éducation"], location: "Mexico City", whyMatch: "Expérience d'enseignement + pédagogie unique.", keySkills: ["Enseignement", "Art"], jobDescription: "Enseignement de la peinture et du symbolisme." },
        { rank: 7, title: "Conférencière Inspirante", matchScore: 79, salaryMin: 50000, salaryMax: 100000, currency: "EUR", contractType: "Freelance", sectors: ["Conférences"], location: "International", whyMatch: "Histoire de résilience inspirante.", keySkills: ["Conférences", "Inspiration"], jobDescription: "Conférences sur la résilience et la créativité." },
        { rank: 8, title: "Directrice Diversité & Inclusion", matchScore: 76, salaryMin: 100000, salaryMax: 150000, currency: "EUR", contractType: "CDI", sectors: ["Corporate"], location: "International", whyMatch: "Icône féministe et de diversité.", keySkills: ["D&I", "Leadership"], jobDescription: "Direction des initiatives D&I d'un groupe." },
        { rank: 9, title: "Art-thérapeute", matchScore: 73, salaryMin: 45000, salaryMax: 70000, currency: "EUR", contractType: "CDI", sectors: ["Santé"], location: "Mexico City", whyMatch: "Art comme catharsis personnelle.", keySkills: ["Art-thérapie", "Accompagnement"], jobDescription: "Accompagnement thérapeutique par l'art." },
        { rank: 10, title: "Auteure - Mémoires", matchScore: 70, salaryMin: 40000, salaryMax: 80000, currency: "EUR", contractType: "Freelance", sectors: ["Édition"], location: "Remote", whyMatch: "Histoire extraordinaire à raconter.", keySkills: ["Écriture", "Autobiographie"], jobDescription: "Rédaction de mémoires et essais." }
    ],
    coverLetters: [
        { jobRank: 1, jobTitle: "Directrice Artistique - Musée Frida Kahlo", tone: "professional_warm", wordCount: 320, content: `Querido Comité,\n\nLa Casa Azul n'est pas un simple musée. C'est ma maison, mon refuge, le lieu où j'ai transformé ma douleur en art.\n\nQui mieux que moi peut honorer cet héritage et le transmettre aux générations futures ?\n\n**Ce que j'apporte :**\n• Connaissance intime de chaque objet, chaque coin de la Casa Azul\n• Vision artistique authentique et sans compromis\n• Capacité à connecter l'art avec les visiteurs du monde entier\n• Réseau international dans le monde de l'art\n\nJe souhaite que la Casa Azul continue d'inspirer le monde.\n\nCon cariño,\n\n**Frida Kahlo**` },
        { jobRank: 2, jobTitle: "Ambassadrice Culturelle - Mexique", tone: "formal", wordCount: 290, content: `Estimados Señores,\n\nJ'ai porté le Mexique dans chaque tableau, chaque robe, chaque geste de ma vie.\n\nPremière artiste mexicaine exposée au Louvre, j'ai ouvert les portes de l'art mondial à notre culture. Mes œuvres parlent de nos traditions, notre histoire, notre fierté.\n\n**Mes atouts :**\n• Reconnaissance internationale\n• Incarnation de la culture mexicaine\n• Capacité de communication émotionnelle\n\nJe serais honorée de représenter officiellement notre nation.\n\n**Frida Kahlo**` },
        { jobRank: 3, jobTitle: "Directrice Créative - Luxe", tone: "creative", wordCount: 260, content: `Bonjour,\n\nMes robes Tehuana, mes fleurs dans les cheveux, mes bijoux précolombiens - tout me définit.\n\nLe luxe n'est pas dans le prix, c'est dans l'authenticité. Chaque détail de mon style raconte une histoire, une culture, une identité.\n\n**Ma vision :**\n• Luxe authentique et culturel\n• Mode comme expression de soi\n• Célébration de la différence\n\nCréons ensemble quelque chose de mémorable.\n\n**Frida** 🌺` }
    ]
};

export default kahloProfile;
