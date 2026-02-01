/**
 * Convertisseur CVData → JSON Resume
 * 
 * [CDC Phase 4] Architecture hybride :
 * - Format CV-Crush riche pour le workflow (scoring, filtrage, preview)
 * - Conversion vers JSON Resume au moment de l'export final
 * - Compatible avec les templates Reactive Resume
 * 
 * @see https://jsonresume.org/schema/
 * @see https://github.com/amruthpillai/reactive-resume
 */

/**
 * Type flexible pour supporter les deux formats CVData
 * Utilise unknown avec des fonctions d'extraction type-safe
 */
type FlexibleCVData = Record<string, unknown>;
type FlexibleObject = Record<string, unknown>;

// ============================================================================
// HELPERS D'EXTRACTION TYPE-SAFE
// ============================================================================

/** Extrait une string ou undefined */
function getString(obj: unknown, ...keys: string[]): string | undefined {
    if (!obj || typeof obj !== 'object') return undefined;
    const o = obj as Record<string, unknown>;
    for (const key of keys) {
        const val = o[key];
        if (typeof val === 'string' && val.trim()) return val;
    }
    return undefined;
}

/** Extrait un array ou [] */
function getArray(obj: unknown, ...keys: string[]): unknown[] {
    if (!obj || typeof obj !== 'object') return [];
    const o = obj as Record<string, unknown>;
    for (const key of keys) {
        const val = o[key];
        if (Array.isArray(val)) return val;
    }
    return [];
}

/** Extrait un objet ou {} */
function getObject(obj: unknown, ...keys: string[]): Record<string, unknown> {
    if (!obj || typeof obj !== 'object') return {};
    const o = obj as Record<string, unknown>;
    for (const key of keys) {
        const val = o[key];
        if (val && typeof val === 'object' && !Array.isArray(val)) {
            return val as Record<string, unknown>;
        }
    }
    return {};
}

// ============================================================================
// TYPES JSON RESUME (Standard v1.0.0)
// ============================================================================

export interface JSONResumeBasics {
    name: string;
    label?: string;
    image?: string;
    email?: string;
    phone?: string;
    url?: string;
    summary?: string;
    location?: {
        address?: string;
        postalCode?: string;
        city?: string;
        countryCode?: string;
        region?: string;
    };
    profiles?: Array<{
        network: string;
        username?: string;
        url?: string;
    }>;
}

export interface JSONResumeWork {
    name: string;
    location?: string;
    description?: string;
    position: string;
    url?: string;
    startDate?: string;
    endDate?: string;
    summary?: string;
    highlights?: string[];
}

export interface JSONResumeEducation {
    institution: string;
    url?: string;
    area?: string;
    studyType?: string;
    startDate?: string;
    endDate?: string;
    score?: string;
    courses?: string[];
}

export interface JSONResumeSkill {
    name: string;
    level?: string;
    keywords?: string[];
}

export interface JSONResumeLanguage {
    language: string;
    fluency?: string;
}

export interface JSONResumeCertificate {
    name: string;
    date?: string;
    url?: string;
    issuer?: string;
}

export interface JSONResumeProject {
    name: string;
    description?: string;
    highlights?: string[];
    keywords?: string[];
    startDate?: string;
    endDate?: string;
    url?: string;
    roles?: string[];
    entity?: string;
    type?: string;
}

export interface JSONResumeReference {
    name: string;
    reference: string;
}

export interface JSONResumeMeta {
    canonical?: string;
    version?: string;
    lastModified?: string;
    // Extensions CV-Crush
    cvCrush?: {
        version: string;
        sourceRagId?: string;
        jobOfferId?: string;
        generatedAt?: string;
        qualityScore?: number;
        templateUsed?: string;
    };
}

export interface JSONResume {
    $schema?: string;
    basics: JSONResumeBasics;
    work?: JSONResumeWork[];
    volunteer?: JSONResumeWork[];
    education?: JSONResumeEducation[];
    awards?: Array<{
        title: string;
        date?: string;
        awarder?: string;
        summary?: string;
    }>;
    certificates?: JSONResumeCertificate[];
    publications?: Array<{
        name: string;
        publisher?: string;
        releaseDate?: string;
        url?: string;
        summary?: string;
    }>;
    skills?: JSONResumeSkill[];
    languages?: JSONResumeLanguage[];
    interests?: Array<{
        name: string;
        keywords?: string[];
    }>;
    references?: JSONResumeReference[];
    projects?: JSONResumeProject[];
    meta?: JSONResumeMeta;
}

// ============================================================================
// OPTIONS DE CONVERSION
// ============================================================================

export interface ConversionOptions {
    /** Inclure la photo (default: true) */
    includePhoto?: boolean;
    /** Inclure les références clients (default: true) */
    includeReferences?: boolean;
    /** Maximum d'expériences à inclure */
    maxExperiences?: number;
    /** Maximum de compétences à inclure */
    maxSkills?: number;
    /** Maximum de formations à inclure */
    maxEducation?: number;
    /** Maximum de projets à inclure */
    maxProjects?: number;
    /** ID RAG source pour traçabilité */
    ragId?: string;
    /** ID offre d'emploi */
    jobOfferId?: string;
    /** Score qualité global */
    qualityScore?: number;
    /** Template utilisé */
    templateId?: string;
}

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

/**
 * Convertit une date en format ISO 8601 (YYYY-MM-DD ou YYYY-MM)
 */
function toISO8601(date: string | Date | undefined | null): string | undefined {
    if (!date) return undefined;
    
    try {
        const d = typeof date === "string" ? new Date(date) : date;
        if (isNaN(d.getTime())) return undefined;
        
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        
        return `${year}-${month}`;
    } catch {
        return undefined;
    }
}

/**
 * Convertit un niveau CECRL en description de fluency
 */
function cecrlToFluency(level: string | undefined): string | undefined {
    if (!level) return undefined;
    
    const mapping: Record<string, string> = {
        "A1": "Elementary",
        "A2": "Limited Working",
        "B1": "Professional Working",
        "B2": "Full Professional",
        "C1": "Native / Bilingual",
        "C2": "Native / Bilingual",
        "natif": "Native / Bilingual",
        "native": "Native / Bilingual",
        "courant": "Full Professional",
        "fluent": "Full Professional",
        "intermédiaire": "Professional Working",
        "intermediate": "Professional Working",
        "débutant": "Elementary",
        "beginner": "Elementary",
    };
    
    const normalized = level.toLowerCase().trim();
    return mapping[normalized] || mapping[level.toUpperCase()] || level;
}

/**
 * Convertit un niveau de compétence en description
 */
function skillLevelToString(level: number | string | undefined): string | undefined {
    if (level === undefined || level === null) return undefined;
    
    if (typeof level === "string") return level;
    
    if (level >= 90) return "Master";
    if (level >= 75) return "Advanced";
    if (level >= 50) return "Intermediate";
    if (level >= 25) return "Beginner";
    return "Novice";
}

/**
 * Extrait les highlights (bullet points) des réalisations
 */
function extractHighlights(realisations: unknown): string[] {
    if (!realisations) return [];
    
    // Si c'est un array de strings
    if (Array.isArray(realisations)) {
        return realisations
            .map((r) => {
                if (typeof r === 'string') return r;
                if (r && typeof r === 'object') {
                    const obj = r as Record<string, unknown>;
                    return getString(obj, 'description', 'texte', 'bullet_point') || '';
                }
                return '';
            })
            .filter(Boolean)
            .slice(0, 6); // Max 6 highlights par expérience
    }
    
    return [];
}

// ============================================================================
// CONVERTISSEUR PRINCIPAL
// ============================================================================

/**
 * Convertit un CVData (format CV-Crush) en JSON Resume (standard)
 * 
 * @example
 * ```typescript
 * const jsonResume = convertToJSONResume(cvData, {
 *     includePhoto: true,
 *     maxExperiences: 5,
 *     qualityScore: 8.5
 * });
 * ```
 */
export function convertToJSONResume(
    cvData: FlexibleCVData,
    options: ConversionOptions = {}
): JSONResume {
    const {
        includePhoto = true,
        includeReferences = true,
        maxExperiences,
        maxSkills,
        maxEducation,
        maxProjects,
        ragId,
        jobOfferId,
        qualityScore,
        templateId,
    } = options;

    // Extraction flexible des données (supporte les deux formats)
    const profil = getObject(cvData, 'profil', 'personalInfo');
    const experiences = getArray(cvData, 'experiences', 'experience');
    const formations = getArray(cvData, 'formations', 'education');
    const competences = cvData.competences || cvData.skills || [];
    const langues = getArray(cvData, 'langues', 'languages');
    const certifications = getArray(cvData, 'certifications');
    const projets = getArray(cvData, 'projets', 'projects');
    const references = getArray(cvData, 'references');

    // ========================================================================
    // BASICS (Profil)
    // ========================================================================
    const prenom = getString(profil, 'prenom', 'firstName');
    const nom = getString(profil, 'nom', 'lastName', 'fullName');
    
    const basics: JSONResumeBasics = {
        name: [prenom, nom].filter(Boolean).join(" ") || "Unknown",
        label: getString(profil, 'titre_professionnel', 'titre_principal', 'poste_actuel', 'title'),
        summary: getString(profil, 'resume', 'accroche', 'elevator_pitch', 'summary'),
        email: getString(profil, 'email'),
        phone: getString(profil, 'telephone', 'phone'),
        url: getString(profil, 'site_web', 'portfolio', 'linkedin', 'url'),
    };

    // Photo
    const photoUrl = getString(profil, 'photo_url', 'image');
    if (includePhoto && photoUrl) {
        basics.image = photoUrl;
    }

    // Location
    const city = getString(profil, 'ville', 'city', 'localisation');
    const address = getString(profil, 'adresse', 'address');
    const region = getString(profil, 'region');
    const country = getString(profil, 'pays', 'country', 'countryCode');
    
    if (city || address || region || country) {
        basics.location = { city, address, region, countryCode: country };
    }

    // Profils sociaux
    const profiles: JSONResumeBasics["profiles"] = [];
    const linkedin = getString(profil, 'linkedin');
    const github = getString(profil, 'github');
    const twitter = getString(profil, 'twitter');
    
    if (linkedin) {
        profiles.push({
            network: "LinkedIn",
            url: linkedin,
            username: linkedin.split("/").pop(),
        });
    }
    if (github) {
        profiles.push({
            network: "GitHub",
            url: github,
            username: github.split("/").pop(),
        });
    }
    if (twitter) {
        profiles.push({ network: "Twitter", url: twitter });
    }
    if (profiles.length > 0) {
        basics.profiles = profiles;
    }

    // ========================================================================
    // WORK (Expériences)
    // ========================================================================
    let workItems = experiences.map((exp): JSONResumeWork => {
        const e = exp as FlexibleObject;
        return {
            name: getString(e, 'entreprise', 'client', 'company', 'name') || "Unknown Company",
            position: getString(e, 'poste', 'titre', 'title', 'position') || "Position",
            location: getString(e, 'localisation', 'lieu', 'location'),
            description: getString(e, 'secteur', 'type_contrat', 'description'),
            startDate: toISO8601(getString(e, 'debut', 'date_debut', 'startDate', 'dates')),
            endDate: e.actuel ? undefined : toISO8601(getString(e, 'fin', 'date_fin', 'endDate')),
            summary: getString(e, 'description', 'mission', 'summary'),
            highlights: extractHighlights(e.realisations as unknown),
            url: getString(e, 'url_entreprise', 'url'),
        };
    });

    if (maxExperiences && workItems.length > maxExperiences) {
        workItems = workItems.slice(0, maxExperiences);
    }

    // ========================================================================
    // EDUCATION (Formations)
    // ========================================================================
    let educationItems = formations.map((form): JSONResumeEducation => {
        const f = form as FlexibleObject;
        return {
            institution: getString(f, 'etablissement', 'ecole', 'institution', 'school') || "Unknown Institution",
            area: getString(f, 'domaine', 'specialite', 'area'),
            studyType: getString(f, 'diplome', 'type', 'studyType', 'degree'),
            startDate: toISO8601(getString(f, 'debut', 'date_debut', 'startDate')),
            endDate: toISO8601(getString(f, 'fin', 'date_fin', 'annee', 'endDate', 'year')),
            score: getString(f, 'mention', 'score'),
            courses: getArray(f, 'cours', 'modules', 'courses') as string[],
            url: getString(f, 'url'),
        };
    });

    if (maxEducation && educationItems.length > maxEducation) {
        educationItems = educationItems.slice(0, maxEducation);
    }

    // ========================================================================
    // SKILLS (Compétences)
    // ========================================================================
    let skillItems: JSONResumeSkill[] = [];

    // Gérer les deux formats de compétences (objet ou array)
    const compArray = Array.isArray(competences) 
        ? competences 
        : [...(getArray(competences, 'techniques') as unknown[]).map(s => ({ nom: s, categorie: 'Technical' })),
           ...(getArray(competences, 'soft_skills') as unknown[]).map(s => ({ nom: s, categorie: 'Soft Skills' }))];

    // Grouper par catégorie si disponible
    const skillsByCategory = new Map<string, string[]>();
    
    compArray.forEach((comp) => {
        const c = comp as FlexibleObject;
        const category = getString(c, 'categorie', 'type', 'category') || "General";
        const name = getString(c, 'nom', 'name', 'skill');
        
        if (name) {
            if (!skillsByCategory.has(category)) {
                skillsByCategory.set(category, []);
            }
            skillsByCategory.get(category)!.push(name);
        }
    });

    // Convertir en format JSON Resume
    skillsByCategory.forEach((keywords, category) => {
        skillItems.push({
            name: category,
            level: "Professional",
            keywords: keywords.slice(0, 10),
        });
    });

    // Si pas de catégories mais array de strings
    if (skillItems.length === 0 && compArray.length > 0) {
        const keywords = compArray
            .map(c => typeof c === 'string' ? c : getString(c as FlexibleObject, 'nom', 'name', 'skill'))
            .filter((k): k is string => !!k)
            .slice(0, 20);
        
        if (keywords.length > 0) {
            skillItems = [{ name: "Technical Skills", keywords }];
        }
    }

    if (maxSkills && skillItems.length > maxSkills) {
        skillItems = skillItems.slice(0, maxSkills);
    }

    // ========================================================================
    // LANGUAGES (Langues)
    // ========================================================================
    const languageItems: JSONResumeLanguage[] = langues.map((lang) => {
        const l = lang as FlexibleObject;
        return {
            language: getString(l, 'langue', 'nom', 'name', 'language') || "Unknown",
            fluency: cecrlToFluency(getString(l, 'niveau', 'level', 'fluency')),
        };
    });

    // ========================================================================
    // CERTIFICATES (Certifications)
    // ========================================================================
    const certificateItems: JSONResumeCertificate[] = certifications.map((cert) => {
        // Gérer les deux formats (string ou objet)
        if (typeof cert === 'string') {
            return { name: cert };
        }
        const c = cert as FlexibleObject;
        return {
            name: getString(c, 'nom', 'name', 'titre') || "Certification",
            date: toISO8601(getString(c, 'date', 'date_obtention', 'annee')),
            issuer: getString(c, 'organisme', 'emetteur', 'issuer'),
            url: getString(c, 'url', 'lien'),
        };
    });

    // ========================================================================
    // PROJECTS (Projets)
    // ========================================================================
    let projectItems: JSONResumeProject[] = projets.map((proj) => {
        const p = proj as FlexibleObject;
        return {
            name: getString(p, 'nom', 'name', 'titre') || "Project",
            description: getString(p, 'description'),
            highlights: getArray(p, 'realisations', 'achievements') as string[],
            keywords: getArray(p, 'technologies', 'tech_stack') as string[],
            startDate: toISO8601(getString(p, 'debut', 'date_debut', 'startDate')),
            endDate: toISO8601(getString(p, 'fin', 'date_fin', 'endDate')),
            url: getString(p, 'url', 'lien'),
            roles: getString(p, 'role') ? [getString(p, 'role')!] : undefined,
            entity: getString(p, 'client', 'entreprise', 'entity'),
        };
    });

    if (maxProjects && projectItems.length > maxProjects) {
        projectItems = projectItems.slice(0, maxProjects);
    }

    // ========================================================================
    // REFERENCES
    // ========================================================================
    let referenceItems: JSONResumeReference[] = [];
    
    if (includeReferences && references.length > 0) {
        referenceItems = references
            .map((ref) => {
                const r = ref as FlexibleObject;
                const nom = getString(r, 'nom', 'name');
                const temoignage = getString(r, 'temoignage', 'recommandation', 'reference');
                if (!nom || !temoignage) return null;
                
                const poste = getString(r, 'poste', 'title');
                const entreprise = getString(r, 'entreprise', 'company');
                
                return {
                    name: `${nom}${poste ? ` - ${poste}` : ""}${entreprise ? ` (${entreprise})` : ""}`,
                    reference: temoignage,
                };
            })
            .filter((r): r is JSONResumeReference => r !== null);
    }

    // ========================================================================
    // META (Extensions CV-Crush)
    // ========================================================================
    const meta: JSONResumeMeta = {
        version: "1.0.0",
        lastModified: new Date().toISOString(),
        cvCrush: {
            version: "2.0",
            sourceRagId: ragId,
            jobOfferId: jobOfferId,
            generatedAt: new Date().toISOString(),
            qualityScore: qualityScore,
            templateUsed: templateId,
        },
    };

    // ========================================================================
    // ASSEMBLAGE FINAL
    // ========================================================================
    const jsonResume: JSONResume = {
        $schema: "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
        basics,
        meta,
    };

    // Ajouter les sections non vides
    if (workItems.length > 0) jsonResume.work = workItems;
    if (educationItems.length > 0) jsonResume.education = educationItems;
    if (skillItems.length > 0) jsonResume.skills = skillItems;
    if (languageItems.length > 0) jsonResume.languages = languageItems;
    if (certificateItems.length > 0) jsonResume.certificates = certificateItems;
    if (projectItems.length > 0) jsonResume.projects = projectItems;
    if (referenceItems.length > 0) jsonResume.references = referenceItems;

    return jsonResume;
}

// ============================================================================
// IMPORT JSON RESUME → CVDATA
// ============================================================================

/**
 * Convertit un JSON Resume en CVData (format CV-Crush étendu)
 * Utile pour importer des CV depuis d'autres outils
 */
export function convertFromJSONResume(jsonResume: JSONResume): FlexibleCVData {
    const basics = jsonResume.basics || {};
    
    // Séparer le nom en prénom/nom
    const nameParts = (basics.name || "").split(" ");
    const prenom = nameParts[0] || "";
    const nom = nameParts.slice(1).join(" ") || "";

    const cvData: FlexibleCVData = {
        profil: {
            prenom,
            nom,
            titre_professionnel: basics.label,
            email: basics.email,
            telephone: basics.phone,
            resume: basics.summary,
            photo_url: basics.image,
            ville: basics.location?.city,
            adresse: basics.location?.address,
            region: basics.location?.region,
            pays: basics.location?.countryCode,
            linkedin: basics.profiles?.find(p => p.network?.toLowerCase() === "linkedin")?.url,
            github: basics.profiles?.find(p => p.network?.toLowerCase() === "github")?.url,
            site_web: basics.url,
        },
        
        experiences: (jsonResume.work || []).map((work) => ({
            entreprise: work.name,
            poste: work.position,
            localisation: work.location,
            secteur: work.description,
            debut: work.startDate,
            fin: work.endDate,
            actuel: !work.endDate,
            description: work.summary,
            realisations: (work.highlights || []).map(h => ({ description: h })),
        })),
        
        formations: (jsonResume.education || []).map((edu) => ({
            etablissement: edu.institution,
            diplome: edu.studyType,
            domaine: edu.area,
            debut: edu.startDate,
            fin: edu.endDate,
            mention: edu.score,
            cours: edu.courses,
        })),
        
        competences: (jsonResume.skills || []).flatMap((skill) =>
            (skill.keywords || [skill.name]).map(keyword => ({
                nom: keyword,
                categorie: skill.name,
                niveau: skill.level,
            }))
        ),
        
        langues: (jsonResume.languages || []).map((lang) => ({
            langue: lang.language,
            niveau: lang.fluency,
        })),
        
        certifications: (jsonResume.certificates || []).map((cert) => ({
            nom: cert.name,
            date: cert.date,
            organisme: cert.issuer,
            url: cert.url,
        })),
        
        projets: (jsonResume.projects || []).map((proj) => ({
            nom: proj.name,
            description: proj.description,
            technologies: proj.keywords,
            debut: proj.startDate,
            fin: proj.endDate,
            url: proj.url,
            role: proj.roles?.[0],
            client: proj.entity,
        })),
    };

    return cvData;
}

// ============================================================================
// EXPORT HELPERS
// ============================================================================

/**
 * Exporte un CVData en JSON Resume string (formatté)
 */
export function exportToJSONResumeString(
    cvData: FlexibleCVData,
    options?: ConversionOptions
): string {
    const jsonResume = convertToJSONResume(cvData, options);
    return JSON.stringify(jsonResume, null, 2);
}

/**
 * Valide si un objet est un JSON Resume valide (basique)
 */
export function isValidJSONResume(obj: unknown): obj is JSONResume {
    if (!obj || typeof obj !== "object") return false;
    
    const resume = obj as JSONResume;
    
    // basics.name est obligatoire
    if (!resume.basics?.name) return false;
    
    return true;
}
