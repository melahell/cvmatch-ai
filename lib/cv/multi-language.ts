/**
 * Multi-Language System - Génération CV multilingue automatique
 *
 * [AMÉLIORATION P2-7] : Détection automatique de la langue de l'offre
 * et génération du CV dans la langue cible.
 *
 * Features:
 * - Détection langue offre d'emploi
 * - Traduction des réalisations
 * - Préservation des chiffres et noms propres
 * - Terminologie sectorielle par langue
 */

import { logger } from "@/lib/utils/logger";

// ============================================================================
// TYPES
// ============================================================================

export type SupportedLanguage = "fr" | "en" | "de" | "es" | "it" | "nl" | "pt";

export interface LanguageConfig {
    code: SupportedLanguage;
    name: string;
    nativeName: string;
    dateFormat: string;
    monthNames: string[];
    sectionLabels: {
        profile: string;
        experience: string;
        education: string;
        skills: string;
        languages: string;
        certifications: string;
        references: string;
    };
    commonPhrases: {
        present: string;
        years: string;
        months: string;
        managedTeam: string;
        increasedBy: string;
        reducedBy: string;
        implementedAt: string;
    };
}

export interface TranslationResult {
    originalLanguage: SupportedLanguage;
    targetLanguage: SupportedLanguage;
    translatedCV: any;
    preservedElements: string[];
    translationConfidence: number;
}

// ============================================================================
// LANGUAGE CONFIGURATIONS
// ============================================================================

export const LANGUAGE_CONFIGS: Record<SupportedLanguage, LanguageConfig> = {
    fr: {
        code: "fr",
        name: "French",
        nativeName: "Français",
        dateFormat: "MM/YYYY",
        monthNames: ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"],
        sectionLabels: {
            profile: "Profil",
            experience: "Expérience Professionnelle",
            education: "Formation",
            skills: "Compétences",
            languages: "Langues",
            certifications: "Certifications",
            references: "Références",
        },
        commonPhrases: {
            present: "Présent",
            years: "ans",
            months: "mois",
            managedTeam: "Management d'une équipe de",
            increasedBy: "Augmentation de",
            reducedBy: "Réduction de",
            implementedAt: "Déploiement chez",
        },
    },
    en: {
        code: "en",
        name: "English",
        nativeName: "English",
        dateFormat: "MM/YYYY",
        monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        sectionLabels: {
            profile: "Profile",
            experience: "Professional Experience",
            education: "Education",
            skills: "Skills",
            languages: "Languages",
            certifications: "Certifications",
            references: "References",
        },
        commonPhrases: {
            present: "Present",
            years: "years",
            months: "months",
            managedTeam: "Managed a team of",
            increasedBy: "Increased by",
            reducedBy: "Reduced by",
            implementedAt: "Implemented at",
        },
    },
    de: {
        code: "de",
        name: "German",
        nativeName: "Deutsch",
        dateFormat: "MM/YYYY",
        monthNames: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],
        sectionLabels: {
            profile: "Profil",
            experience: "Berufserfahrung",
            education: "Ausbildung",
            skills: "Fähigkeiten",
            languages: "Sprachen",
            certifications: "Zertifizierungen",
            references: "Referenzen",
        },
        commonPhrases: {
            present: "Heute",
            years: "Jahre",
            months: "Monate",
            managedTeam: "Leitung eines Teams von",
            increasedBy: "Steigerung um",
            reducedBy: "Reduzierung um",
            implementedAt: "Implementierung bei",
        },
    },
    es: {
        code: "es",
        name: "Spanish",
        nativeName: "Español",
        dateFormat: "MM/YYYY",
        monthNames: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
        sectionLabels: {
            profile: "Perfil",
            experience: "Experiencia Profesional",
            education: "Formación",
            skills: "Competencias",
            languages: "Idiomas",
            certifications: "Certificaciones",
            references: "Referencias",
        },
        commonPhrases: {
            present: "Actualidad",
            years: "años",
            months: "meses",
            managedTeam: "Gestión de un equipo de",
            increasedBy: "Aumento de",
            reducedBy: "Reducción de",
            implementedAt: "Implementación en",
        },
    },
    it: {
        code: "it",
        name: "Italian",
        nativeName: "Italiano",
        dateFormat: "MM/YYYY",
        monthNames: ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"],
        sectionLabels: {
            profile: "Profilo",
            experience: "Esperienza Professionale",
            education: "Formazione",
            skills: "Competenze",
            languages: "Lingue",
            certifications: "Certificazioni",
            references: "Referenze",
        },
        commonPhrases: {
            present: "Presente",
            years: "anni",
            months: "mesi",
            managedTeam: "Gestione di un team di",
            increasedBy: "Aumento del",
            reducedBy: "Riduzione del",
            implementedAt: "Implementazione presso",
        },
    },
    nl: {
        code: "nl",
        name: "Dutch",
        nativeName: "Nederlands",
        dateFormat: "MM/YYYY",
        monthNames: ["Jan", "Feb", "Mrt", "Apr", "Mei", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"],
        sectionLabels: {
            profile: "Profiel",
            experience: "Werkervaring",
            education: "Opleiding",
            skills: "Vaardigheden",
            languages: "Talen",
            certifications: "Certificeringen",
            references: "Referenties",
        },
        commonPhrases: {
            present: "Heden",
            years: "jaar",
            months: "maanden",
            managedTeam: "Leiding aan een team van",
            increasedBy: "Toename van",
            reducedBy: "Afname van",
            implementedAt: "Geïmplementeerd bij",
        },
    },
    pt: {
        code: "pt",
        name: "Portuguese",
        nativeName: "Português",
        dateFormat: "MM/YYYY",
        monthNames: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
        sectionLabels: {
            profile: "Perfil",
            experience: "Experiência Profissional",
            education: "Formação",
            skills: "Competências",
            languages: "Idiomas",
            certifications: "Certificações",
            references: "Referências",
        },
        commonPhrases: {
            present: "Presente",
            years: "anos",
            months: "meses",
            managedTeam: "Gestão de equipe de",
            increasedBy: "Aumento de",
            reducedBy: "Redução de",
            implementedAt: "Implementação em",
        },
    },
};

// ============================================================================
// LANGUAGE DETECTION
// ============================================================================

const LANGUAGE_INDICATORS: Record<SupportedLanguage, string[]> = {
    fr: [
        "nous recherchons", "poste", "expérience", "formation", "compétences",
        "salaire", "cdi", "cdd", "temps plein", "entreprise", "équipe",
        "responsabilités", "profil recherché", "missions", "environnement"
    ],
    en: [
        "we are looking", "position", "experience", "education", "skills",
        "salary", "full-time", "part-time", "company", "team", "role",
        "responsibilities", "requirements", "candidate", "environment"
    ],
    de: [
        "wir suchen", "stelle", "berufserfahrung", "ausbildung", "kenntnisse",
        "gehalt", "vollzeit", "teilzeit", "unternehmen", "team", "aufgaben",
        "anforderungen", "bewerber", "arbeitsumfeld"
    ],
    es: [
        "buscamos", "puesto", "experiencia", "formación", "competencias",
        "salario", "jornada completa", "empresa", "equipo", "funciones",
        "requisitos", "candidato", "ambiente"
    ],
    it: [
        "cerchiamo", "posizione", "esperienza", "formazione", "competenze",
        "stipendio", "tempo pieno", "azienda", "team", "responsabilità",
        "requisiti", "candidato", "ambiente"
    ],
    nl: [
        "wij zoeken", "functie", "ervaring", "opleiding", "vaardigheden",
        "salaris", "fulltime", "parttime", "bedrijf", "team", "taken",
        "eisen", "kandidaat", "werkomgeving"
    ],
    pt: [
        "procuramos", "vaga", "experiência", "formação", "competências",
        "salário", "tempo integral", "empresa", "equipe", "responsabilidades",
        "requisitos", "candidato", "ambiente"
    ],
};

/**
 * Détecte la langue d'un texte (offre d'emploi)
 */
export function detectLanguage(text: string): {
    language: SupportedLanguage;
    confidence: number;
    scores: Record<SupportedLanguage, number>;
} {
    const normalizedText = text.toLowerCase();
    const scores: Record<SupportedLanguage, number> = {} as any;

    // Calculer le score pour chaque langue
    for (const [lang, indicators] of Object.entries(LANGUAGE_INDICATORS)) {
        let score = 0;
        for (const indicator of indicators) {
            if (normalizedText.includes(indicator)) {
                score += 1;
            }
        }
        scores[lang as SupportedLanguage] = score;
    }

    // Trouver la langue avec le meilleur score
    let bestLang: SupportedLanguage = "fr";
    let bestScore = 0;

    for (const [lang, score] of Object.entries(scores)) {
        if (score > bestScore) {
            bestScore = score;
            bestLang = lang as SupportedLanguage;
        }
    }

    // Calculer la confiance
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    const confidence = totalScore > 0 ? bestScore / totalScore : 0;

    logger.debug("[language] Langue détectée", { bestLang, confidence, scores });

    return {
        language: bestLang,
        confidence: Math.round(confidence * 100) / 100,
        scores,
    };
}

// ============================================================================
// TRANSLATION HELPERS
// ============================================================================

/**
 * Éléments à préserver lors de la traduction (ne pas traduire)
 */
const PRESERVE_PATTERNS = [
    // Chiffres avec unités
    /\d+[kKmM]?€/g,
    /\d+%/g,
    /\d+\+/g,
    /\d+[kKmM]?\s*(utilisateurs|users|clients|projets|projects)/gi,
    // Noms propres (companies, certifications, technologies)
    /\b(AWS|GCP|Azure|Kubernetes|Docker|React|Node\.js|TypeScript|Python|Java)\b/gi,
    /\b(CFA|PMP|Prince2|Scrum|Agile|Six Sigma)\b/gi,
    /\b(SAP|Salesforce|HubSpot|Jira|Confluence)\b/gi,
    // Acronymes
    /\b[A-Z]{2,5}\b/g,
    // Dates
    /\d{4}(-\d{2})?/g,
];

/**
 * Extrait les éléments à préserver d'un texte
 */
export function extractPreservedElements(text: string): string[] {
    const preserved = new Set<string>();

    for (const pattern of PRESERVE_PATTERNS) {
        const matches = text.match(pattern);
        if (matches) {
            matches.forEach(m => preserved.add(m));
        }
    }

    return Array.from(preserved);
}

/**
 * Génère les instructions de traduction pour le prompt LLM
 */
export function getTranslationPromptInstructions(
    sourceLang: SupportedLanguage,
    targetLang: SupportedLanguage,
    preservedElements: string[]
): string {
    const sourceConfig = LANGUAGE_CONFIGS[sourceLang];
    const targetConfig = LANGUAGE_CONFIGS[targetLang];

    return `
## INSTRUCTIONS DE TRADUCTION

SOURCE: ${sourceConfig.nativeName} (${sourceLang})
CIBLE: ${targetConfig.nativeName} (${targetLang})

### RÈGLES CRITIQUES

1. NE PAS TRADUIRE ces éléments (les garder tels quels):
${preservedElements.map(e => `   - "${e}"`).join("\n")}

2. UTILISER ces labels de section en ${targetConfig.nativeName}:
   - Profil: "${targetConfig.sectionLabels.profile}"
   - Expérience: "${targetConfig.sectionLabels.experience}"
   - Formation: "${targetConfig.sectionLabels.education}"
   - Compétences: "${targetConfig.sectionLabels.skills}"
   - Langues: "${targetConfig.sectionLabels.languages}"
   - Certifications: "${targetConfig.sectionLabels.certifications}"

3. UTILISER ces expressions courantes:
   - "Présent" → "${targetConfig.commonPhrases.present}"
   - "ans" → "${targetConfig.commonPhrases.years}"
   - "Management d'équipe" → "${targetConfig.commonPhrases.managedTeam}"

4. ADAPTER le ton au marché ${targetConfig.nativeName} (formel/informel selon le pays)

5. PRÉSERVER les chiffres et pourcentages EXACTEMENT comme dans l'original
`;
}

// ============================================================================
// CV TRANSLATION
// ============================================================================

/**
 * Prépare un CV pour traduction
 */
export function prepareCVForTranslation(
    cvData: any,
    targetLanguage: SupportedLanguage
): {
    cvData: any;
    translationNeeded: boolean;
    sectionsToTranslate: string[];
    preservedElements: string[];
} {
    // Détecter la langue actuelle
    const cvText = JSON.stringify(cvData);
    const currentLang = detectLanguage(cvText);

    // Si déjà dans la langue cible, pas besoin de traduire
    if (currentLang.language === targetLanguage && currentLang.confidence > 0.7) {
        return {
            cvData,
            translationNeeded: false,
            sectionsToTranslate: [],
            preservedElements: [],
        };
    }

    // Identifier les éléments à préserver
    const preservedElements = extractPreservedElements(cvText);

    // Sections à traduire
    const sectionsToTranslate = [
        "profil.elevator_pitch",
        "profil.titre_principal",
        "experiences[].realisations",
        "competences.soft_skills",
        "formations[].diplome",
    ];

    return {
        cvData,
        translationNeeded: true,
        sectionsToTranslate,
        preservedElements,
    };
}

/**
 * Applique les labels de section dans la langue cible
 */
export function applySectionLabels(cvData: any, targetLanguage: SupportedLanguage): any {
    const config = LANGUAGE_CONFIGS[targetLanguage];

    // Créer une copie pour ne pas modifier l'original
    const translated = JSON.parse(JSON.stringify(cvData));

    // Ajouter les labels de section si nécessaire
    if (translated.cv_metadata) {
        translated.cv_metadata.section_labels = config.sectionLabels;
        translated.cv_metadata.language = targetLanguage;
    }

    return translated;
}

/**
 * Formate les dates selon la langue cible
 */
export function formatDateForLanguage(
    date: string | undefined,
    language: SupportedLanguage,
    isPresent: boolean = false
): string {
    if (isPresent) {
        return LANGUAGE_CONFIGS[language].commonPhrases.present;
    }

    if (!date) return "";

    // Format: YYYY-MM
    const match = date.match(/^(\d{4})-(\d{2})/);
    if (!match) return date;

    const year = match[1];
    const monthIndex = parseInt(match[2], 10) - 1;
    const monthNames = LANGUAGE_CONFIGS[language].monthNames;

    return `${monthNames[monthIndex]} ${year}`;
}

// ============================================================================
// LANGUAGE SKILL LEVELS
// ============================================================================

export const LANGUAGE_LEVEL_TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
    fr: {
        "Natif": "Natif",
        "Bilingue": "Bilingue",
        "Courant": "Courant",
        "Avancé": "Avancé",
        "Intermédiaire": "Intermédiaire",
        "Débutant": "Débutant",
    },
    en: {
        "Natif": "Native",
        "Bilingue": "Bilingual",
        "Courant": "Fluent",
        "Avancé": "Advanced",
        "Intermédiaire": "Intermediate",
        "Débutant": "Beginner",
    },
    de: {
        "Natif": "Muttersprache",
        "Bilingue": "Zweisprachig",
        "Courant": "Fließend",
        "Avancé": "Fortgeschritten",
        "Intermédiaire": "Mittelstufe",
        "Débutant": "Anfänger",
    },
    es: {
        "Natif": "Nativo",
        "Bilingue": "Bilingüe",
        "Courant": "Fluido",
        "Avancé": "Avanzado",
        "Intermédiaire": "Intermedio",
        "Débutant": "Principiante",
    },
    it: {
        "Natif": "Madrelingua",
        "Bilingue": "Bilingue",
        "Courant": "Fluente",
        "Avancé": "Avanzato",
        "Intermédiaire": "Intermedio",
        "Débutant": "Principiante",
    },
    nl: {
        "Natif": "Moedertaal",
        "Bilingue": "Tweetalig",
        "Courant": "Vloeiend",
        "Avancé": "Gevorderd",
        "Intermédiaire": "Gemiddeld",
        "Débutant": "Beginner",
    },
    pt: {
        "Natif": "Nativo",
        "Bilingue": "Bilíngue",
        "Courant": "Fluente",
        "Avancé": "Avançado",
        "Intermédiaire": "Intermediário",
        "Débutant": "Iniciante",
    },
};

/**
 * Traduit un niveau de langue
 */
export function translateLanguageLevel(
    level: string,
    targetLanguage: SupportedLanguage
): string {
    const translations = LANGUAGE_LEVEL_TRANSLATIONS[targetLanguage];

    // Chercher une correspondance
    for (const [fr, translated] of Object.entries(LANGUAGE_LEVEL_TRANSLATIONS.fr)) {
        if (level.toLowerCase().includes(fr.toLowerCase())) {
            return translations[fr] || level;
        }
    }

    return level;
}
