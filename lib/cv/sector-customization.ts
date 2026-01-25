/**
 * Sector Customization - Personnalisation par secteur d'activité
 *
 * [AMÉLIORATION P1-4] : Prompts, templates et keywords spécialisés
 * par secteur pour maximiser l'impact ATS et recruteurs.
 *
 * Secteurs supportés:
 * - Finance / Banque / Assurance
 * - Tech / IT / Digital
 * - Pharma / Biotech / Santé
 * - Conseil / Audit
 * - Industrie / Manufacturing
 * - Retail / Commerce
 * - RH / Recrutement
 * - Marketing / Communication
 */

// ============================================================================
// TYPES
// ============================================================================

export type Sector =
    | "finance"
    | "tech"
    | "pharma"
    | "conseil"
    | "industrie"
    | "retail"
    | "rh"
    | "marketing"
    | "public"
    | "other";

export interface SectorConfig {
    id: Sector;
    name: string;
    aliases: string[];
    keywords: {
        critical: string[];     // Mots-clés ATS critiques
        important: string[];    // Mots-clés importants
        nice_to_have: string[]; // Bonus
    };
    template: {
        recommended: string;
        colorScheme: string;
        fontStyle: "formal" | "modern" | "creative";
    };
    prompt: {
        tone: string;
        focus: string[];
        avoid: string[];
        examples: string[];
    };
    scoring: {
        certificationBonus: string[];
        experienceKeywords: string[];
        softSkillsPriority: string[];
    };
}

// ============================================================================
// CONFIGURATION PAR SECTEUR
// ============================================================================

export const SECTOR_CONFIGS: Record<Sector, SectorConfig> = {
    finance: {
        id: "finance",
        name: "Finance / Banque / Assurance",
        aliases: ["banque", "banking", "assurance", "insurance", "fintech", "investissement", "asset management", "bfi", "cib"],
        keywords: {
            critical: [
                "conformité", "compliance", "réglementation", "KYC", "AML", "LCB-FT",
                "Bâle III", "Bâle IV", "Solvency II", "IFRS", "risk management",
                "audit", "contrôle interne", "due diligence", "P&L", "ROI", "ROE"
            ],
            important: [
                "reporting réglementaire", "stress test", "VaR", "ALM", "trésorerie",
                "crédit", "marché", "opérationnel", "liquidité", "CCAR", "SREP"
            ],
            nice_to_have: [
                "Bloomberg", "Reuters", "SAP", "Murex", "Calypso", "Summit"
            ],
        },
        template: {
            recommended: "classic",
            colorScheme: "navy",
            fontStyle: "formal",
        },
        prompt: {
            tone: "Professionnel, rigoureux, précis. Privilégier le vocabulaire réglementaire et financier.",
            focus: [
                "Résultats quantifiés (P&L, volumes, pourcentages)",
                "Conformité et gestion des risques",
                "Expérience réglementaire (régulateurs, audits)",
                "Certifications financières (CFA, FRM, AMF)",
            ],
            avoid: [
                "Langage trop casual",
                "Termes vagues sans chiffres",
                "Jargon startup non adapté",
            ],
            examples: [
                "Pilotage du reporting réglementaire Bâle III pour un portefeuille de 2.5Md€",
                "Réduction du risque opérationnel de 35% via l'automatisation des contrôles KYC",
            ],
        },
        scoring: {
            certificationBonus: ["CFA", "FRM", "AMF", "ACAMS", "CIA"],
            experienceKeywords: ["régulateur", "ACPR", "AMF", "BCE", "audit"],
            softSkillsPriority: ["rigueur", "analyse", "synthèse", "conformité"],
        },
    },

    tech: {
        id: "tech",
        name: "Tech / IT / Digital",
        aliases: ["it", "software", "développement", "startup", "saas", "cloud", "data", "ai", "devops"],
        keywords: {
            critical: [
                "agile", "scrum", "CI/CD", "cloud", "AWS", "Azure", "GCP",
                "microservices", "API", "REST", "GraphQL", "Kubernetes", "Docker",
                "DevOps", "SRE", "scalabilité", "performance"
            ],
            important: [
                "architecture", "design patterns", "TDD", "clean code",
                "monitoring", "observabilité", "GitOps", "IaC", "Terraform"
            ],
            nice_to_have: [
                "open source", "contribution", "tech lead", "staff engineer"
            ],
        },
        template: {
            recommended: "modern",
            colorScheme: "blue",
            fontStyle: "modern",
        },
        prompt: {
            tone: "Direct, technique, orienté résultats. Mettre en avant l'impact technique et business.",
            focus: [
                "Stack technique maîtrisé",
                "Impact mesurable (performance, disponibilité, réduction dette)",
                "Leadership technique et mentorat",
                "Contributions open source si pertinent",
            ],
            avoid: [
                "Liste de technologies sans contexte",
                "Buzzwords sans substance",
                "Expériences trop anciennes (> 5 ans) sur technologies obsolètes",
            ],
            examples: [
                "Architecture microservices réduisant le time-to-market de 60%",
                "Migration cloud AWS diminuant les coûts d'infrastructure de 45%",
            ],
        },
        scoring: {
            certificationBonus: ["AWS", "Azure", "GCP", "Kubernetes", "Terraform", "Scrum Master", "PMP"],
            experienceKeywords: ["scale", "production", "architecture", "lead"],
            softSkillsPriority: ["problem solving", "collaboration", "autonomie", "curiosité"],
        },
    },

    pharma: {
        id: "pharma",
        name: "Pharma / Biotech / Santé",
        aliases: ["pharmaceutique", "biotech", "medical", "healthcare", "clinical", "r&d pharma", "dispositifs médicaux"],
        keywords: {
            critical: [
                "GxP", "GMP", "GCP", "GLP", "FDA", "EMA", "ANSM",
                "validation", "qualification", "CSV", "21 CFR Part 11",
                "pharmacovigilance", "affaires réglementaires", "AMM"
            ],
            important: [
                "essais cliniques", "phases I/II/III", "CAPA", "deviation",
                "change control", "audit trail", "quality assurance"
            ],
            nice_to_have: [
                "SAP", "Veeva", "LIMS", "MES", "serialisation"
            ],
        },
        template: {
            recommended: "classic",
            colorScheme: "teal",
            fontStyle: "formal",
        },
        prompt: {
            tone: "Rigoureux, scientifique, orienté qualité. Vocabulaire réglementaire pharmaceutique.",
            focus: [
                "Conformité réglementaire (FDA, EMA)",
                "Expérience validation/qualification",
                "Gestion des audits et inspections",
                "Résultats qualité (réduction déviations, taux de conformité)",
            ],
            avoid: [
                "Approximations sur les normes",
                "Termes non réglementaires",
            ],
            examples: [
                "Qualification d'une ligne de production aseptique (100M€) avec zéro observation FDA",
                "Réduction des déviations critiques de 75% via implémentation CAPA renforcée",
            ],
        },
        scoring: {
            certificationBonus: ["ASQ", "Six Sigma", "PMP", "CSV"],
            experienceKeywords: ["FDA", "EMA", "audit", "inspection", "validation"],
            softSkillsPriority: ["rigueur", "attention au détail", "documentation", "compliance"],
        },
    },

    conseil: {
        id: "conseil",
        name: "Conseil / Audit",
        aliases: ["consulting", "strategy", "management consulting", "audit", "big four", "cabinet conseil"],
        keywords: {
            critical: [
                "due diligence", "transformation", "stratégie", "roadmap",
                "business case", "ROI", "benchmark", "best practices",
                "change management", "PMO", "governance"
            ],
            important: [
                "stakeholder management", "C-level", "comex", "board",
                "delivery", "staffing", "proposal", "pitch"
            ],
            nice_to_have: [
                "thought leadership", "publication", "conférence"
            ],
        },
        template: {
            recommended: "modern",
            colorScheme: "gray",
            fontStyle: "modern",
        },
        prompt: {
            tone: "Business, structuré, orienté impact client. Mettre en avant la valeur créée.",
            focus: [
                "Impact client quantifié",
                "Expérience sectorielle diverse",
                "Leadership de missions complexes",
                "Développement commercial (si senior)",
            ],
            avoid: [
                "Descriptions trop opérationnelles",
                "Manque de résultats business",
            ],
            examples: [
                "Pilotage transformation digitale (50M€) générant 15% d'économies récurrentes",
                "Due diligence M&A identifiant 8M€ de synergies pour un client CAC40",
            ],
        },
        scoring: {
            certificationBonus: ["PMP", "Prince2", "Lean Six Sigma", "MBA"],
            experienceKeywords: ["transformation", "stratégie", "C-level", "mission"],
            softSkillsPriority: ["communication", "leadership", "adaptabilité", "synthèse"],
        },
    },

    industrie: {
        id: "industrie",
        name: "Industrie / Manufacturing",
        aliases: ["manufacturing", "production", "usine", "supply chain", "logistique", "automotive", "aéronautique"],
        keywords: {
            critical: [
                "lean", "six sigma", "kaizen", "5S", "TPM", "SMED",
                "supply chain", "S&OP", "MRP", "ERP", "SAP",
                "qualité", "ISO 9001", "IATF 16949", "EN 9100"
            ],
            important: [
                "OEE", "TRS", "taux de rebut", "productivité",
                "maintenance préventive", "AMDEC", "8D", "QRQC"
            ],
            nice_to_have: [
                "industrie 4.0", "IoT", "MES", "jumeaux numériques"
            ],
        },
        template: {
            recommended: "classic",
            colorScheme: "gray",
            fontStyle: "formal",
        },
        prompt: {
            tone: "Opérationnel, orienté résultats mesurables. Chiffres de production et amélioration.",
            focus: [
                "Gains de productivité quantifiés",
                "Réduction des coûts et délais",
                "Management d'équipes de production",
                "Certifications qualité obtenues/maintenues",
            ],
            avoid: [
                "Descriptions sans métriques",
                "Jargon trop théorique",
            ],
            examples: [
                "Amélioration OEE de 65% à 85% sur ligne d'assemblage (gain 2M€/an)",
                "Déploiement lean réduisant les stocks de 40% et le lead time de 3 semaines",
            ],
        },
        scoring: {
            certificationBonus: ["Lean Six Sigma", "Green Belt", "Black Belt", "PMP"],
            experienceKeywords: ["production", "usine", "amélioration", "lean"],
            softSkillsPriority: ["leadership", "résolution problèmes", "organisation", "terrain"],
        },
    },

    retail: {
        id: "retail",
        name: "Retail / Commerce / Distribution",
        aliases: ["commerce", "distribution", "e-commerce", "grande distribution", "luxe", "mode"],
        keywords: {
            critical: [
                "omnicanal", "e-commerce", "retail", "merchandising",
                "category management", "pricing", "promotion",
                "CRM", "fidélisation", "NPS", "customer experience"
            ],
            important: [
                "sell-in", "sell-out", "rotation stock", "démarque",
                "visual merchandising", "flagship", "concept store"
            ],
            nice_to_have: [
                "marketplace", "D2C", "social commerce", "live shopping"
            ],
        },
        template: {
            recommended: "modern",
            colorScheme: "purple",
            fontStyle: "modern",
        },
        prompt: {
            tone: "Dynamique, orienté client et résultats commerciaux.",
            focus: [
                "Croissance CA et parts de marché",
                "Expérience client et satisfaction",
                "Management d'équipes commerciales",
                "Innovation retail (omnicanal, digital)",
            ],
            avoid: [
                "Focus uniquement opérationnel",
                "Absence de métriques business",
            ],
            examples: [
                "Croissance CA de 25% sur zone de chalandise via stratégie omnicanale",
                "Amélioration NPS de 45 à 72 points en 18 mois",
            ],
        },
        scoring: {
            certificationBonus: ["Google Analytics", "Salesforce", "HubSpot"],
            experienceKeywords: ["CA", "croissance", "client", "commerce"],
            softSkillsPriority: ["orientation client", "négociation", "dynamisme", "créativité"],
        },
    },

    rh: {
        id: "rh",
        name: "RH / Recrutement / Formation",
        aliases: ["ressources humaines", "recrutement", "talent", "formation", "learning", "paie", "hrbp"],
        keywords: {
            critical: [
                "GPEC", "talent management", "recrutement", "onboarding",
                "formation", "développement RH", "SIRH", "paie",
                "relations sociales", "CSE", "NAO", "QVT"
            ],
            important: [
                "marque employeur", "employee experience", "engagement",
                "turnover", "absentéisme", "mobilité interne"
            ],
            nice_to_have: [
                "HR analytics", "people analytics", "HRIS", "Workday", "SAP HR"
            ],
        },
        template: {
            recommended: "modern",
            colorScheme: "green",
            fontStyle: "modern",
        },
        prompt: {
            tone: "Humain, orienté collaborateurs et business. Équilibre entre soft et hard skills.",
            focus: [
                "Impact sur l'engagement et la rétention",
                "Projets de transformation RH",
                "Partenariat avec le business (HRBP)",
                "Conformité sociale et réglementaire",
            ],
            avoid: [
                "Focus uniquement administratif",
                "Absence de métriques RH",
            ],
            examples: [
                "Réduction turnover de 25% à 12% via programme de rétention ciblé",
                "Déploiement SIRH pour 5000 collaborateurs avec 95% d'adoption",
            ],
        },
        scoring: {
            certificationBonus: ["GPEC", "Coach certifié", "Assessment"],
            experienceKeywords: ["talent", "recrutement", "formation", "social"],
            softSkillsPriority: ["écoute", "empathie", "diplomatie", "organisation"],
        },
    },

    marketing: {
        id: "marketing",
        name: "Marketing / Communication / Digital",
        aliases: ["communication", "digital marketing", "brand", "growth", "acquisition", "social media", "content"],
        keywords: {
            critical: [
                "acquisition", "conversion", "ROI", "ROAS", "CAC", "LTV",
                "SEO", "SEA", "SEM", "social media", "content marketing",
                "brand", "branding", "positionnement", "stratégie marketing"
            ],
            important: [
                "funnel", "lead generation", "nurturing", "automation",
                "analytics", "A/B testing", "UX", "persona"
            ],
            nice_to_have: [
                "growth hacking", "product marketing", "PLG", "viral"
            ],
        },
        template: {
            recommended: "creative",
            colorScheme: "orange",
            fontStyle: "creative",
        },
        prompt: {
            tone: "Créatif, orienté data et résultats. Équilibre brand et performance.",
            focus: [
                "Résultats mesurables (CA, leads, engagement)",
                "Stratégies créatives et différenciantes",
                "Maîtrise des outils et analytics",
                "Leadership créatif",
            ],
            avoid: [
                "Descriptions sans métriques",
                "Focus uniquement créatif sans business",
            ],
            examples: [
                "Stratégie d'acquisition réduisant le CAC de 45% tout en doublant le volume",
                "Campagne brand awareness générant 50M d'impressions et +30% de notoriété spontanée",
            ],
        },
        scoring: {
            certificationBonus: ["Google Ads", "Facebook Blueprint", "HubSpot", "Google Analytics"],
            experienceKeywords: ["croissance", "acquisition", "brand", "digital"],
            softSkillsPriority: ["créativité", "analyse", "communication", "agilité"],
        },
    },

    public: {
        id: "public",
        name: "Secteur Public / Associatif",
        aliases: ["administration", "fonction publique", "collectivité", "état", "association", "ong", "ess"],
        keywords: {
            critical: [
                "politique publique", "marchés publics", "RGPD",
                "service public", "usager", "collectivité", "état",
                "subvention", "budget public", "contrôle de gestion public"
            ],
            important: [
                "transformation numérique", "dématérialisation",
                "inclusion", "accessibilité", "partenariat public-privé"
            ],
            nice_to_have: [
                "LOLF", "GBCP", "CAF", "CPOM"
            ],
        },
        template: {
            recommended: "classic",
            colorScheme: "blue",
            fontStyle: "formal",
        },
        prompt: {
            tone: "Institutionnel, orienté service public et impact sociétal.",
            focus: [
                "Impact sur les usagers/citoyens",
                "Gestion de projets publics complexes",
                "Partenariats institutionnels",
                "Conformité et éthique publique",
            ],
            avoid: [
                "Vocabulaire trop privé",
                "Focus sur profit",
            ],
            examples: [
                "Déploiement plateforme numérique touchant 500 000 usagers avec 90% de satisfaction",
                "Pilotage projet inter-ministériel (budget 10M€) livré dans les délais",
            ],
        },
        scoring: {
            certificationBonus: ["Concours administratif", "ENA", "INET"],
            experienceKeywords: ["public", "état", "collectivité", "citoyen"],
            softSkillsPriority: ["service public", "éthique", "rigueur", "diplomatie"],
        },
    },

    other: {
        id: "other",
        name: "Autre / Généraliste",
        aliases: [],
        keywords: {
            critical: [
                "gestion de projet", "management", "leadership",
                "communication", "analyse", "résolution de problèmes"
            ],
            important: [
                "travail d'équipe", "adaptabilité", "autonomie",
                "organisation", "reporting"
            ],
            nice_to_have: [],
        },
        template: {
            recommended: "modern",
            colorScheme: "blue",
            fontStyle: "modern",
        },
        prompt: {
            tone: "Professionnel et adaptable.",
            focus: [
                "Résultats quantifiés",
                "Compétences transférables",
                "Évolution de carrière",
            ],
            avoid: [
                "Jargon trop spécifique",
            ],
            examples: [
                "Gestion de projet cross-fonctionnel livré avec 20% d'avance sur planning",
                "Management d'équipe de 10 personnes avec 95% de rétention annuelle",
            ],
        },
        scoring: {
            certificationBonus: ["PMP", "Lean", "Agile"],
            experienceKeywords: ["projet", "équipe", "résultat"],
            softSkillsPriority: ["adaptabilité", "communication", "organisation"],
        },
    },
};

// ============================================================================
// DETECTION AUTOMATIQUE
// ============================================================================

/**
 * Détecte le secteur à partir de la description de l'offre
 */
export function detectSector(jobDescription: string, companyName?: string): Sector {
    const text = `${jobDescription} ${companyName || ""}`.toLowerCase();

    // Score par secteur
    const scores: Record<Sector, number> = {} as any;

    for (const [sectorId, config] of Object.entries(SECTOR_CONFIGS)) {
        let score = 0;

        // Vérifier les aliases
        for (const alias of config.aliases) {
            if (text.includes(alias.toLowerCase())) {
                score += 10;
            }
        }

        // Vérifier les keywords critiques
        for (const keyword of config.keywords.critical) {
            if (text.includes(keyword.toLowerCase())) {
                score += 5;
            }
        }

        // Vérifier les keywords importants
        for (const keyword of config.keywords.important) {
            if (text.includes(keyword.toLowerCase())) {
                score += 2;
            }
        }

        scores[sectorId as Sector] = score;
    }

    // Trouver le secteur avec le meilleur score
    let bestSector: Sector = "other";
    let bestScore = 0;

    for (const [sector, score] of Object.entries(scores)) {
        if (score > bestScore) {
            bestScore = score;
            bestSector = sector as Sector;
        }
    }

    // Si le score est trop faible, retourner "other"
    if (bestScore < 5) {
        return "other";
    }

    return bestSector;
}

/**
 * Obtient la configuration complète d'un secteur
 */
export function getSectorConfig(sector: Sector): SectorConfig {
    return SECTOR_CONFIGS[sector] || SECTOR_CONFIGS.other;
}

/**
 * Génère les instructions de prompt pour un secteur
 */
export function getSectorPromptInstructions(sector: Sector): string {
    const config = getSectorConfig(sector);

    return `
## CONTEXTE SECTEUR : ${config.name}

### TONALITÉ
${config.tone}

### FOCUS (PRIORITÉS)
${config.prompt.focus.map(f => `- ${f}`).join("\n")}

### À ÉVITER
${config.prompt.avoid.map(a => `- ${a}`).join("\n")}

### MOTS-CLÉS ATS CRITIQUES
${config.keywords.critical.slice(0, 10).join(", ")}

### EXEMPLES DE RÉALISATIONS ATTENDUES
${config.prompt.examples.map(e => `- "${e}"`).join("\n")}

### CERTIFICATIONS VALORISÉES
${config.scoring.certificationBonus.join(", ")}
`;
}

/**
 * Applique les boost de scoring par secteur
 */
export function applySectorScoringBoost(
    widget: any,
    sector: Sector,
    ragProfile: any
): number {
    const config = getSectorConfig(sector);
    let boost = 0;
    const text = (widget.text || "").toLowerCase();

    // Boost pour keywords critiques
    for (const keyword of config.keywords.critical) {
        if (text.includes(keyword.toLowerCase())) {
            boost += 5;
        }
    }

    // Boost pour certifications
    const certifications = ragProfile?.certifications || [];
    for (const cert of certifications) {
        const certName = typeof cert === "string" ? cert : cert.nom || "";
        for (const bonusCert of config.scoring.certificationBonus) {
            if (certName.toLowerCase().includes(bonusCert.toLowerCase())) {
                boost += 10;
            }
        }
    }

    // Boost pour keywords d'expérience
    for (const keyword of config.scoring.experienceKeywords) {
        if (text.includes(keyword.toLowerCase())) {
            boost += 3;
        }
    }

    return Math.min(boost, 25); // Max +25 points
}
