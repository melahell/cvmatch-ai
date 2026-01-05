/**
 * Schema Transformer - CDC CV Parfait
 * 
 * Transforme les données RAG existantes vers le format CVOptimized enrichi.
 * Calcule les pertinence_scores, structure les quantifications, etc.
 */

import {
    CVOptimized,
    CVMetadata,
    Identity,
    ElevatorPitch,
    ExperienceOptimized,
    RealisationOptimized,
    CompetencesOptimized,
    FormationOptimized,
    LangueOptimized,
    SeniorityLevel,
    SectorProfile,
    Quantification,
    QuantificationType,
    SkillCategory,
    SkillItem
} from '@/types/cv-optimized';

import { detectSeniorityWithRules, generateDureeAffichee } from './seniority-calculator';

// Types pour les données RAG existantes
interface RAGExperience {
    poste?: string;
    entreprise?: string;
    debut?: string;
    fin?: string | null;
    actuel?: boolean;
    lieu?: string;
    realisations?: Array<string | { description?: string; impact?: string }>;
    technologies?: string[];
}

interface RAGData {
    profil?: {
        nom?: string;
        prenom?: string;
        titre_principal?: string;
        photo_url?: string;
        email?: string;
        telephone?: string;
        localisation?: string;
        linkedin?: string;
        elevator_pitch?: string;
    };
    experiences?: RAGExperience[];
    competences?: {
        techniques?: Array<string | { name?: string; niveau?: string }>;
        soft_skills?: Array<string | { name?: string }>;
    };
    formations?: Array<{
        diplome?: string;
        ecole?: string;
        etablissement?: string;
        annee?: string;
    }>;
    langues?: Record<string, string> | Array<{ langue: string; niveau: string }>;
}

interface MatchReport {
    match_score?: number;
    job_title?: string;
    company?: string;
    strengths?: Array<{ point: string }>;
    missing_keywords?: string[];
}

/**
 * Extrait une quantification d'un texte de réalisation
 */
function extractQuantification(text: string): Quantification | undefined {
    // Patterns pour détecter les quantifications
    const patterns: Array<{ regex: RegExp; type: QuantificationType; extractor: (match: RegExpMatchArray) => { valeur: string; unite: string } }> = [
        {
            regex: /(\d+)\s*[Mm]€/,
            type: 'budget',
            extractor: (m) => ({ valeur: m[1], unite: 'M€' })
        },
        {
            regex: /(\d+)\s*[Kk]€/,
            type: 'budget',
            extractor: (m) => ({ valeur: m[1], unite: 'K€' })
        },
        {
            regex: /budget\s+de?\s*(\d+)/i,
            type: 'budget',
            extractor: (m) => ({ valeur: m[1], unite: '€' })
        },
        {
            regex: /(\d+)\+?\s*projets?/i,
            type: 'volume',
            extractor: (m) => ({ valeur: m[1] + '+', unite: 'projets' })
        },
        {
            regex: /(\d+)\+?\s*utilisateurs?/i,
            type: 'volume',
            extractor: (m) => ({ valeur: m[1] + '+', unite: 'utilisateurs' })
        },
        {
            regex: /équipe\s+de\s+(\d+)/i,
            type: 'equipe',
            extractor: (m) => ({ valeur: m[1], unite: 'personnes' })
        },
        {
            regex: /(\d+)\s*%/,
            type: 'pourcentage',
            extractor: (m) => ({ valeur: m[1], unite: '%' })
        },
        {
            regex: /(\d+)\s*ans?/i,
            type: 'duree',
            extractor: (m) => ({ valeur: m[1], unite: 'ans' })
        },
        {
            regex: /(\d+)\s*mois/i,
            type: 'duree',
            extractor: (m) => ({ valeur: m[1], unite: 'mois' })
        }
    ];

    for (const { regex, type, extractor } of patterns) {
        const match = text.match(regex);
        if (match) {
            const { valeur, unite } = extractor(match);
            return {
                type,
                valeur,
                unite,
                display: `${valeur} ${unite}`
            };
        }
    }

    return undefined;
}

/**
 * Calcule le score de pertinence d'une expérience par rapport à une offre
 */
function calculatePertinenceScore(
    experience: RAGExperience | undefined,
    matchReport?: MatchReport,
    jobKeywords: string[] = []
): number {
    let score = 50; // Score de base

    if (!experience) return score;

    // Bonus si expérience récente
    const now = new Date();
    if (experience.fin === null || experience.actuel) {
        score += 15; // Expérience actuelle
    } else if (experience.fin) {
        const endYear = parseInt(experience.fin.substring(0, 4));
        const yearsAgo = now.getFullYear() - endYear;
        if (yearsAgo <= 2) score += 10;
        else if (yearsAgo <= 5) score += 5;
    }

    // Bonus pour les technologies matching
    const expTechs = experience.technologies?.map((t: string) => t.toLowerCase()) || [];
    const matchingTechs = jobKeywords.filter((k: string) =>
        expTechs.some((t: string) => t.includes(k.toLowerCase()) || k.toLowerCase().includes(t))
    );
    score += Math.min(20, matchingTechs.length * 5);

    // Bonus pour le poste matching
    if (experience.poste && matchReport?.job_title) {
        const posteWords = experience.poste.toLowerCase().split(/\s+/);
        const jobWords = matchReport.job_title.toLowerCase().split(/\s+/);
        const commonWords = posteWords.filter((w: string) => jobWords.includes(w));
        score += Math.min(15, commonWords.length * 5);
    }

    return Math.min(100, Math.max(0, score));
}

/**
 * Détecte le secteur à partir des données
 */
function detectSector(ragData: RAGData): SectorProfile {
    const allText = JSON.stringify(ragData).toLowerCase();

    const sectorKeywords: Record<SectorProfile, string[]> = {
        finance: ['banque', 'finance', 'assurance', 'investissement', 'crédit', 'bnp', 'société générale'],
        tech: ['développeur', 'software', 'startup', 'saas', 'devops', 'cloud', 'code'],
        pharma: ['pharma', 'laboratoire', 'médical', 'santé', 'gxp', 'fda', 'sanofi', 'servier'],
        conseil: ['conseil', 'consulting', 'consultant', 'accenture', 'capgemini', 'mckinsey'],
        luxe: ['luxe', 'lvmh', 'chanel', 'cartier', 'hermès', 'premium'],
        industrie: ['industrie', 'usine', 'production', 'manufacturing', 'automobile'],
        other: []
    };

    let maxScore = 0;
    let detectedSector: SectorProfile = 'other';

    for (const [sector, keywords] of Object.entries(sectorKeywords)) {
        const score = keywords.filter(k => allText.includes(k)).length;
        if (score > maxScore) {
            maxScore = score;
            detectedSector = sector as SectorProfile;
        }
    }

    return detectedSector;
}

/**
 * Transforme une réalisation en format optimisé
 */
function transformRealisation(
    realisation: string | { description?: string; impact?: string },
    index: number
): RealisationOptimized {
    const text = typeof realisation === 'string'
        ? realisation
        : (realisation.description || realisation.impact || '');

    const quantification = extractQuantification(text);

    return {
        id: `real-${index}`,
        description: text,
        description_short: text.length > 100 ? text.substring(0, 97) + '...' : text,
        quantification,
        keywords_ats: [], // Sera enrichi par l'IA
        display: true,
        char_count: text.length
    };
}

/**
 * Transforme une expérience en format optimisé
 */
function transformExperience(
    exp: RAGExperience,
    index: number,
    matchReport?: MatchReport
): ExperienceOptimized {
    const pertinenceScore = calculatePertinenceScore(exp, matchReport);
    const debut = exp.debut || '';
    const fin = exp.fin || null;
    const actuel = exp.actuel || false;

    // Calculer durée en mois
    let dureeMois = 0;
    if (debut) {
        const startYear = parseInt(debut.substring(0, 4));
        const startMonth = parseInt(debut.substring(5, 7) || '1');
        const endDate = actuel ? new Date() : (fin ? new Date(fin) : new Date());
        dureeMois = (endDate.getFullYear() - startYear) * 12 + (endDate.getMonth() + 1 - startMonth);
    }

    const realisations = (exp.realisations || []).map((r: string | { description?: string; impact?: string }, i: number) => transformRealisation(r, i));

    return {
        id: `exp-${index}`,
        ordre_affichage: index + 1,
        pertinence_score: pertinenceScore,
        display: pertinenceScore >= 40,
        condensed: false,

        poste: exp.poste || '',
        entreprise: exp.entreprise || '',
        localisation: exp.lieu,

        debut,
        fin,
        actuel,
        duree_affichee: generateDureeAffichee(debut, fin, actuel),
        duree_mois: Math.max(0, dureeMois),

        realisations,
        realisations_display_count: realisations.length,

        technologies: exp.technologies || []
    };
}

/**
 * Transforme les compétences en format optimisé
 */
function transformCompetences(competences: RAGData['competences']): CompetencesOptimized {
    const techniques = (competences?.techniques || []).map((s, i) => {
        const name = typeof s === 'string' ? s : (s.name || '');
        return {
            nom: name,
            priorite_affichage: i + 1,
            keywords_ats: [name.toLowerCase()]
        } as SkillItem;
    });

    const softSkills = (competences?.soft_skills || []).map((s, i) => {
        const name = typeof s === 'string' ? s : (s.name || '');
        return {
            nom: name,
            priorite_affichage: i + 1,
            keywords_ats: [name.toLowerCase()]
        } as SkillItem;
    });

    const categories: SkillCategory[] = [];

    if (techniques.length > 0) {
        categories.push({
            nom: 'Compétences Techniques',
            items: techniques,
            display: true
        });
    }

    if (softSkills.length > 0) {
        categories.push({
            nom: 'Qualités',
            items: softSkills,
            display: true
        });
    }

    return {
        display_mode: 'categorized',
        categories,
        techniques_flat: techniques.map(t => t.nom),
        soft_skills_flat: softSkills.map(s => s.nom)
    };
}

/**
 * Transforme les formations en format optimisé
 */
function transformFormations(formations: RAGData['formations']): FormationOptimized[] {
    return (formations || []).map((f, i) => {
        const titre = f.diplome || '';
        const organisme = f.ecole || f.etablissement || '';
        const date = f.annee || '';

        return {
            id: `form-${i}`,
            type: titre.toLowerCase().includes('certif') ? 'certification' : 'diplome',
            titre,
            titre_court: titre.length > 50 ? titre.substring(0, 47) + '...' : titre,
            organisme,
            date,
            display: true,
            priorite: i + 1,
            display_format: `${titre} - ${organisme} (${date})`
        };
    });
}

/**
 * Transforme les langues en format optimisé
 */
function transformLangues(langues: RAGData['langues']): LangueOptimized[] {
    if (!langues) return [];

    if (Array.isArray(langues)) {
        return langues.map(l => ({
            langue: l.langue,
            niveau: l.niveau,
            display: `${l.langue} (${l.niveau})`
        }));
    }

    return Object.entries(langues).map(([langue, niveau]) => ({
        langue,
        niveau,
        display: `${langue} (${niveau})`
    }));
}

/**
 * FONCTION PRINCIPALE: Transforme RAG Data vers CVOptimized
 */
export function transformRAGToOptimized(
    ragData: RAGData,
    matchReport?: MatchReport,
    templateId: string = 'modern'
): CVOptimized {
    // Calculer séniorité
    const experiences = ragData.experiences || [];
    const { level: seniorityLevel, rules } = detectSeniorityWithRules(
        experiences.map(e => ({
            debut: e.debut || '',
            fin: e.fin,
            actuel: e.actuel
        }))
    );

    // Détecter secteur
    const sectorDetected = detectSector(ragData);

    // Transformer les données
    const transformedExperiences = experiences
        .map((exp, i) => transformExperience(exp, i, matchReport))
        .sort((a, b) => b.pertinence_score - a.pertinence_score);

    // Mettre à jour ordre_affichage après tri
    transformedExperiences.forEach((exp, i) => {
        exp.ordre_affichage = i + 1;
    });

    const profil = ragData.profil || {};
    const elevatorPitch = profil.elevator_pitch || '';

    const cvOptimized: CVOptimized = {
        cv_metadata: {
            generated_for_job_id: matchReport?.job_title ? 'match_based' : undefined,
            match_score: matchReport?.match_score,
            template_used: templateId,
            optimization_level: matchReport ? 'high' : 'standard',
            seniority_level: seniorityLevel,
            sector_detected: sectorDetected,
            generated_at: new Date().toISOString(),
            compression_level_applied: 0,
            page_count: 1,
            optimizations_applied: []
        },

        identity: {
            nom: profil.nom || '',
            prenom: profil.prenom || '',
            titre_vise: profil.titre_principal || '',
            photo_url: profil.photo_url,
            contact: {
                email: profil.email || '',
                telephone: profil.telephone,
                ville: profil.localisation,
                linkedin: profil.linkedin
            }
        },

        elevator_pitch: {
            included: seniorityLevel !== 'junior' || rules.elevatorPitchRequired,
            text: elevatorPitch,
            char_count: elevatorPitch.length,
            keywords_embedded: []
        },

        experiences: transformedExperiences,
        competences: transformCompetences(ragData.competences),
        formations: transformFormations(ragData.formations),
        langues: transformLangues(ragData.langues)
    };

    return cvOptimized;
}

/**
 * Extrait les keywords d'une offre d'emploi pour le matching
 */
export function extractJobKeywords(jobDescription: string): string[] {
    // Liste de keywords techniques communs
    const technicalTerms = [
        'pmo', 'chef de projet', 'planisware', 'ms project', 'jira', 'confluence',
        'agile', 'scrum', 'waterfall', 'prince2', 'itil', 'safe',
        'budget', 'kpi', 'reporting', 'dashboard', 'powerbi', 'excel',
        'sql', 'python', 'javascript', 'react', 'node', 'java',
        'aws', 'azure', 'cloud', 'devops', 'ci/cd',
        'management', 'leadership', 'transformation', 'change'
    ];

    const jobLower = jobDescription.toLowerCase();
    return technicalTerms.filter(term => jobLower.includes(term.toLowerCase()));
}
