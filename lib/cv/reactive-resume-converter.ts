/**
 * Convertisseur CVData → Schema Reactive Resume
 * 
 * [CDC Sprint 4.2] Adaptation des templates Reactive Resume
 * 
 * Reactive Resume utilise un format de données spécifique avec:
 * - picture: Configuration photo
 * - basics: Informations de base (nom, email, etc.)
 * - summary: Résumé/accroche
 * - sections: Sections du CV (experience, education, skills, etc.)
 * - metadata: Configuration template, design, typographie
 * 
 * @see https://github.com/amruthpillai/reactive-resume
 */

// ============================================================================
// TYPES REACTIVE RESUME SCHEMA
// ============================================================================

export interface RRPicture {
    url: string;
    size: number;
    aspectRatio: number;
    borderRadius: number;
    borderColor: string;
    borderWidth: number;
    shadowColor: string;
    shadowWidth: number;
    hidden: boolean;
}

export interface RRWebsite {
    url: string;
    label: string;
}

export interface RRCustomField {
    id: string;
    icon: string;
    text: string;
    link?: string;
}

export interface RRBasics {
    name: string;
    headline: string;
    email: string;
    phone: string;
    location: string;
    website: RRWebsite;
    customFields: RRCustomField[];
}

export interface RRSummary {
    title: string;
    content: string;
    columns: number;
    hidden: boolean;
}

export interface RRExperienceItem {
    id: string;
    company: string;
    position: string;
    location: string;
    date: string;
    summary: string;
    url: string;
    visible: boolean;
}

export interface RREducationItem {
    id: string;
    institution: string;
    studyType: string;
    area: string;
    score: string;
    date: string;
    summary: string;
    url: string;
    visible: boolean;
}

export interface RRSkillItem {
    id: string;
    name: string;
    description: string;
    level: number;
    keywords: string[];
    visible: boolean;
}

export interface RRLanguageItem {
    id: string;
    name: string;
    description: string;
    level: number;
    visible: boolean;
}

export interface RRCertificationItem {
    id: string;
    name: string;
    issuer: string;
    date: string;
    summary: string;
    url: string;
    visible: boolean;
}

export interface RRProjectItem {
    id: string;
    name: string;
    description: string;
    date: string;
    summary: string;
    keywords: string[];
    url: string;
    visible: boolean;
}

export interface RRProfileItem {
    id: string;
    network: string;
    username: string;
    url: string;
    icon: string;
    visible: boolean;
}

export interface RRSection<T> {
    id: string;
    name: string;
    title: string;
    columns: number;
    visible: boolean;
    items: T[];
}

export interface RRSections {
    profiles: RRSection<RRProfileItem>;
    experience: RRSection<RRExperienceItem>;
    education: RRSection<RREducationItem>;
    skills: RRSection<RRSkillItem>;
    languages: RRSection<RRLanguageItem>;
    certifications: RRSection<RRCertificationItem>;
    projects: RRSection<RRProjectItem>;
}

export interface RRPageLayout {
    fullWidth: boolean;
    main: string[];
    sidebar: string[];
}

export interface RRLayout {
    sidebarWidth: number;
    pages: RRPageLayout[];
}

export interface RRColors {
    primary: string;
    text: string;
    background: string;
}

export interface RRLevel {
    icon: string;
    type: "hidden" | "circle" | "square" | "bar" | "language";
}

export interface RRDesign {
    colors: RRColors;
    level: RRLevel;
}

export interface RRFontConfig {
    fontFamily: string;
    fontWeights: number[];
    fontSize: number;
    lineHeight: number;
}

export interface RRTypography {
    body: RRFontConfig;
    heading: RRFontConfig;
}

export interface RRPage {
    gapX: number;
    gapY: number;
    marginX: number;
    marginY: number;
    format: "a4" | "letter" | "free-form";
    locale: string;
    hideIcons: boolean;
}

export interface RRMetadata {
    template: RRTemplateName;
    layout: RRLayout;
    css: { enabled: boolean; value: string };
    page: RRPage;
    design: RRDesign;
    typography: RRTypography;
    notes: string;
}

export type RRTemplateName = 
    | "azurill" | "bronzor" | "chikorita" | "ditto" | "gengar"
    | "glalie" | "kakuna" | "leafish" | "nosepass" | "onyx"
    | "pikachu" | "rhyhorn";

export interface RRResumeData {
    picture: RRPicture;
    basics: RRBasics;
    summary: RRSummary;
    sections: RRSections;
    metadata: RRMetadata;
}

// ============================================================================
// OPTIONS DE CONVERSION
// ============================================================================

export interface RRConversionOptions {
    /** Template Reactive Resume à utiliser */
    template?: RRTemplateName;
    /** Inclure la photo */
    includePhoto?: boolean;
    /** Couleur primaire (hex) */
    primaryColor?: string;
    /** Couleur texte (hex) */
    textColor?: string;
    /** Couleur fond (hex) */
    backgroundColor?: string;
    /** Police du corps */
    bodyFont?: string;
    /** Police des titres */
    headingFont?: string;
    /** Format de page */
    pageFormat?: "a4" | "letter";
    /** Largeur sidebar (0-50) */
    sidebarWidth?: number;
    /** Mode dense (marges réduites) */
    dense?: boolean;
}

// ============================================================================
// HELPERS
// ============================================================================

/** Génère un ID unique */
function generateId(): string {
    return Math.random().toString(36).substring(2, 11);
}

/** Extrait une string de manière sûre */
function safeString(value: unknown): string {
    if (typeof value === "string") return value;
    if (value === null || value === undefined) return "";
    return String(value);
}

/** Formate une date pour Reactive Resume (MMMM YYYY ou range) */
function formatDate(start?: string, end?: string, current?: boolean): string {
    const formatSingle = (dateStr?: string): string => {
        if (!dateStr) return "";
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
        } catch {
            return dateStr;
        }
    };

    const startFormatted = formatSingle(start);
    const endFormatted = current ? "Présent" : formatSingle(end);

    if (startFormatted && endFormatted) {
        return `${startFormatted} - ${endFormatted}`;
    }
    return startFormatted || endFormatted || "";
}

/** Convertit un niveau CECRL en pourcentage (0-100) */
function cecrlToLevel(niveau?: string): number {
    if (!niveau) return 50;
    const mapping: Record<string, number> = {
        "A1": 16, "A2": 33,
        "B1": 50, "B2": 66,
        "C1": 83, "C2": 100,
        "natif": 100, "native": 100,
        "courant": 83, "fluent": 83,
        "intermédiaire": 50, "intermediate": 50,
        "débutant": 25, "beginner": 25,
    };
    return mapping[niveau.toLowerCase()] || mapping[niveau.toUpperCase()] || 50;
}

/** Convertit le niveau de skill en pourcentage */
function skillToLevel(value?: unknown): number {
    if (typeof value === "number") return Math.min(100, Math.max(0, value));
    if (typeof value === "string") {
        const num = parseInt(value, 10);
        if (!isNaN(num)) return Math.min(100, Math.max(0, num));
        // Niveaux textuels
        const mapping: Record<string, number> = {
            "expert": 100, "avancé": 80, "advanced": 80,
            "intermédiaire": 60, "intermediate": 60,
            "débutant": 30, "beginner": 30,
        };
        return mapping[value.toLowerCase()] || 60;
    }
    return 60;
}

/** Détecte l'icône réseau social */
function getNetworkIcon(network: string): string {
    const icons: Record<string, string> = {
        "linkedin": "ph-linkedin-logo",
        "github": "ph-github-logo",
        "twitter": "ph-twitter-logo",
        "facebook": "ph-facebook-logo",
        "instagram": "ph-instagram-logo",
        "youtube": "ph-youtube-logo",
        "dribbble": "ph-dribbble-logo",
        "behance": "ph-behance-logo",
    };
    return icons[network.toLowerCase()] || "ph-link";
}

// ============================================================================
// CONVERTISSEUR PRINCIPAL
// ============================================================================

type FlexibleData = Record<string, unknown>;

/**
 * Convertit CVData (format CV-Crush) vers RRResumeData (format Reactive Resume)
 */
export function convertToRRSchema(
    cvData: FlexibleData,
    options: RRConversionOptions = {}
): RRResumeData {
    const {
        template = "onyx",
        includePhoto = true,
        primaryColor = "#3b82f6",
        textColor = "#1f2937",
        backgroundColor = "#ffffff",
        bodyFont = "Inter",
        headingFont = "Inter",
        pageFormat = "a4",
        sidebarWidth = 35,
        dense = false,
    } = options;

    // Extraction flexible des données
    const profil = (cvData.profil || cvData.personalInfo || {}) as FlexibleData;
    const experiences = (cvData.experiences || cvData.experience || []) as FlexibleData[];
    const formations = (cvData.formations || cvData.education || []) as FlexibleData[];
    const competences = cvData.competences || cvData.skills || [];
    const langues = (cvData.langues || cvData.languages || []) as FlexibleData[];
    const certifications = (cvData.certifications || []) as (string | FlexibleData)[];
    const projets = (cvData.projets || cvData.projects || []) as FlexibleData[];

    // ========================================================================
    // PICTURE
    // ========================================================================
    const photoUrl = safeString(profil.photo_url || profil.image);
    const picture: RRPicture = {
        url: includePhoto ? photoUrl : "",
        size: 100,
        aspectRatio: 1,
        borderRadius: 50,
        borderColor: primaryColor,
        borderWidth: 0,
        shadowColor: "rgba(0,0,0,0.1)",
        shadowWidth: 0,
        hidden: !includePhoto || !photoUrl,
    };

    // ========================================================================
    // BASICS
    // ========================================================================
    const prenom = safeString(profil.prenom || profil.firstName || "");
    const nom = safeString(profil.nom || profil.lastName || profil.fullName || "");
    const fullName = [prenom, nom].filter(Boolean).join(" ") || "Nom";

    const basics: RRBasics = {
        name: fullName,
        headline: safeString(
            profil.titre_professionnel || 
            profil.titre_principal || 
            profil.poste_actuel || 
            profil.title || 
            ""
        ),
        email: safeString(profil.email || ""),
        phone: safeString(profil.telephone || profil.phone || ""),
        location: safeString(
            profil.localisation || 
            profil.ville || 
            profil.city || 
            profil.location || 
            ""
        ),
        website: {
            url: safeString(profil.site_web || profil.portfolio || profil.url || ""),
            label: "Portfolio",
        },
        customFields: [],
    };

    // ========================================================================
    // SUMMARY
    // ========================================================================
    const summary: RRSummary = {
        title: "Profil",
        content: safeString(
            profil.resume || 
            profil.accroche || 
            profil.elevator_pitch || 
            profil.summary || 
            ""
        ),
        columns: 1,
        hidden: !profil.resume && !profil.accroche && !profil.elevator_pitch,
    };

    // ========================================================================
    // PROFILES (Réseaux sociaux)
    // ========================================================================
    const profileItems: RRProfileItem[] = [];
    
    const linkedin = safeString(profil.linkedin);
    if (linkedin) {
        profileItems.push({
            id: generateId(),
            network: "LinkedIn",
            username: linkedin.split("/").pop() || "",
            url: linkedin,
            icon: "ph-linkedin-logo",
            visible: true,
        });
    }
    
    const github = safeString(profil.github);
    if (github) {
        profileItems.push({
            id: generateId(),
            network: "GitHub",
            username: github.split("/").pop() || "",
            url: github,
            icon: "ph-github-logo",
            visible: true,
        });
    }

    // ========================================================================
    // EXPERIENCE
    // ========================================================================
    const experienceItems: RRExperienceItem[] = experiences.map((exp) => {
        const startDate = safeString(exp.debut || exp.date_debut || exp.startDate);
        const endDate = safeString(exp.fin || exp.date_fin || exp.endDate);
        const isCurrent = Boolean(exp.actuel);

        // Construire le summary avec les réalisations
        let summaryText = safeString(exp.description || exp.mission || exp.summary || "");
        const realisations = exp.realisations as unknown[];
        if (Array.isArray(realisations) && realisations.length > 0) {
            const bullets = realisations
                .map((r) => {
                    if (typeof r === "string") return r;
                    if (r && typeof r === "object") {
                        const obj = r as FlexibleData;
                        return safeString(obj.description || obj.texte || obj.bullet_point);
                    }
                    return "";
                })
                .filter(Boolean)
                .map((b) => `<li>${b}</li>`)
                .join("");
            if (bullets) {
                summaryText += `<ul>${bullets}</ul>`;
            }
        }

        return {
            id: generateId(),
            company: safeString(exp.entreprise || exp.client || exp.company || exp.name || ""),
            position: safeString(exp.poste || exp.titre || exp.title || exp.position || ""),
            location: safeString(exp.localisation || exp.lieu || exp.location || ""),
            date: formatDate(startDate, endDate, isCurrent),
            summary: summaryText,
            url: safeString(exp.url_entreprise || exp.url || ""),
            visible: true,
        };
    });

    // ========================================================================
    // EDUCATION
    // ========================================================================
    const educationItems: RREducationItem[] = formations.map((form) => {
        const startDate = safeString(form.debut || form.date_debut || form.startDate);
        const endDate = safeString(form.fin || form.date_fin || form.annee || form.endDate || form.year);

        return {
            id: generateId(),
            institution: safeString(form.etablissement || form.ecole || form.institution || form.school || ""),
            studyType: safeString(form.diplome || form.type || form.studyType || form.degree || ""),
            area: safeString(form.domaine || form.specialite || form.area || ""),
            score: safeString(form.mention || form.score || ""),
            date: formatDate(startDate, endDate),
            summary: safeString(form.description || ""),
            url: safeString(form.url || ""),
            visible: true,
        };
    });

    // ========================================================================
    // SKILLS
    // ========================================================================
    const skillItems: RRSkillItem[] = [];

    // Gérer les deux formats de compétences
    if (Array.isArray(competences)) {
        competences.forEach((comp) => {
            if (typeof comp === "string") {
                skillItems.push({
                    id: generateId(),
                    name: comp,
                    description: "",
                    level: 60,
                    keywords: [],
                    visible: true,
                });
            } else if (comp && typeof comp === "object") {
                const c = comp as FlexibleData;
                skillItems.push({
                    id: generateId(),
                    name: safeString(c.nom || c.name || c.skill || ""),
                    description: safeString(c.categorie || c.type || c.category || ""),
                    level: skillToLevel(c.niveau || c.level),
                    keywords: [],
                    visible: true,
                });
            }
        });
    } else if (competences && typeof competences === "object") {
        // Format objet avec techniques et soft_skills
        const compObj = competences as FlexibleData;
        const techniques = (compObj.techniques || []) as string[];
        const softSkills = (compObj.soft_skills || []) as string[];

        techniques.forEach((tech) => {
            skillItems.push({
                id: generateId(),
                name: safeString(tech),
                description: "Technique",
                level: 70,
                keywords: [],
                visible: true,
            });
        });

        softSkills.forEach((soft) => {
            skillItems.push({
                id: generateId(),
                name: safeString(soft),
                description: "Soft Skill",
                level: 70,
                keywords: [],
                visible: true,
            });
        });
    }

    // ========================================================================
    // LANGUAGES
    // ========================================================================
    const languageItems: RRLanguageItem[] = langues.map((lang) => ({
        id: generateId(),
        name: safeString(lang.langue || lang.nom || lang.name || lang.language || ""),
        description: safeString(lang.niveau || lang.level || lang.fluency || ""),
        level: cecrlToLevel(safeString(lang.niveau || lang.level)),
        visible: true,
    }));

    // ========================================================================
    // CERTIFICATIONS
    // ========================================================================
    const certificationItems: RRCertificationItem[] = certifications.map((cert) => {
        if (typeof cert === "string") {
            return {
                id: generateId(),
                name: cert,
                issuer: "",
                date: "",
                summary: "",
                url: "",
                visible: true,
            };
        }
        const c = cert as FlexibleData;
        return {
            id: generateId(),
            name: safeString(c.nom || c.name || c.titre || ""),
            issuer: safeString(c.organisme || c.emetteur || c.issuer || ""),
            date: safeString(c.date || c.date_obtention || c.annee || ""),
            summary: safeString(c.description || ""),
            url: safeString(c.url || c.lien || ""),
            visible: true,
        };
    });

    // ========================================================================
    // PROJECTS
    // ========================================================================
    const projectItems: RRProjectItem[] = projets.map((proj) => {
        const startDate = safeString(proj.debut || proj.date_debut || proj.startDate);
        const endDate = safeString(proj.fin || proj.date_fin || proj.endDate);
        const technologies = (proj.technologies || proj.tech_stack || []) as string[];

        return {
            id: generateId(),
            name: safeString(proj.nom || proj.name || proj.titre || ""),
            description: safeString(proj.description || ""),
            date: formatDate(startDate, endDate),
            summary: safeString(proj.role || ""),
            keywords: technologies.map(safeString),
            url: safeString(proj.url || proj.lien || ""),
            visible: true,
        };
    });

    // ========================================================================
    // SECTIONS
    // ========================================================================
    const sections: RRSections = {
        profiles: {
            id: "profiles",
            name: "Profiles",
            title: "Réseaux",
            columns: 1,
            visible: profileItems.length > 0,
            items: profileItems,
        },
        experience: {
            id: "experience",
            name: "Experience",
            title: "Expérience Professionnelle",
            columns: 1,
            visible: experienceItems.length > 0,
            items: experienceItems,
        },
        education: {
            id: "education",
            name: "Education",
            title: "Formation",
            columns: 1,
            visible: educationItems.length > 0,
            items: educationItems,
        },
        skills: {
            id: "skills",
            name: "Skills",
            title: "Compétences",
            columns: 2,
            visible: skillItems.length > 0,
            items: skillItems,
        },
        languages: {
            id: "languages",
            name: "Languages",
            title: "Langues",
            columns: 2,
            visible: languageItems.length > 0,
            items: languageItems,
        },
        certifications: {
            id: "certifications",
            name: "Certifications",
            title: "Certifications",
            columns: 1,
            visible: certificationItems.length > 0,
            items: certificationItems,
        },
        projects: {
            id: "projects",
            name: "Projects",
            title: "Projets",
            columns: 1,
            visible: projectItems.length > 0,
            items: projectItems,
        },
    };

    // ========================================================================
    // METADATA
    // ========================================================================
    const margins = dense ? 10 : 20;
    const gaps = dense ? 8 : 16;

    const metadata: RRMetadata = {
        template,
        layout: {
            sidebarWidth,
            pages: [
                {
                    fullWidth: false,
                    main: ["experience", "education", "projects"],
                    sidebar: ["profiles", "skills", "languages", "certifications"],
                },
            ],
        },
        css: { enabled: false, value: "" },
        page: {
            gapX: gaps,
            gapY: gaps,
            marginX: margins,
            marginY: margins,
            format: pageFormat,
            locale: "fr-FR",
            hideIcons: false,
        },
        design: {
            colors: {
                primary: primaryColor,
                text: textColor,
                background: backgroundColor,
            },
            level: {
                icon: "ph-circle-fill",
                type: "circle",
            },
        },
        typography: {
            body: {
                fontFamily: bodyFont,
                fontWeights: [400, 500, 600],
                fontSize: 14,
                lineHeight: 1.5,
            },
            heading: {
                fontFamily: headingFont,
                fontWeights: [600, 700],
                fontSize: 24,
                lineHeight: 1.2,
            },
        },
        notes: "",
    };

    // ========================================================================
    // ASSEMBLAGE FINAL
    // ========================================================================
    return {
        picture,
        basics,
        summary,
        sections,
        metadata,
    };
}

// ============================================================================
// EXPORTS
// ============================================================================

export { convertToRRSchema as default };
