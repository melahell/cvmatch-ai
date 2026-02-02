/**
 * [CDC-04] Enrichissement automatique du profil RAG
 * Détection secteur, séniorité, technologies principales
 */

export interface ProfileEnrichment {
    detectedSector: string | null;
    seniorityLevel: 'junior' | 'mid' | 'senior' | 'expert' | 'executive' | null;
    yearsExperience: number;
    primaryTechnologies: string[];
    industryKeywords: string[];
    // [CDC Sprint 3.1] Soft skills déduites
    soft_skills_deduites: string[];
}

// Mapping secteurs par mots-clés
const SECTOR_KEYWORDS: Record<string, string[]> = {
    "IT / Tech": ["développeur", "developer", "ingénieur", "engineer", "software", "data", "cloud", "devops", "agile", "scrum"],
    "Finance / Banque": ["banque", "finance", "trading", "risk", "compliance", "audit", "comptabilité", "gestion d'actifs"],
    "Conseil / Consulting": ["consultant", "conseil", "strategy", "management consulting", "big4", "cabinet"],
    "Industrie / Manufacturing": ["usine", "production", "manufacturing", "qualité", "supply chain", "lean"],
    "Santé / Pharma": ["santé", "health", "pharma", "médical", "hôpital", "clinique", "biotechnologie"],
    "Commerce / Retail": ["retail", "e-commerce", "commerce", "vente", "commercial", "marketing", "CRM"],
    "Énergie / Utilities": ["énergie", "energy", "nucléaire", "renouvelable", "electricité", "gaz"],
    "Assurance": ["assurance", "insurance", "actuariat", "sinistre", "souscription"],
    "Telecom / Media": ["telecom", "média", "télécommunications", "broadcast", "streaming"],
};

// Mapping séniorité par mots-clés
const SENIORITY_KEYWORDS: Record<string, string[]> = {
    "executive": ["directeur", "director", "head of", "chief", "cto", "cio", "ceo", "vp", "vice-president", "dg"],
    "expert": ["expert", "principal", "architecte", "architect", "distinguished", "fellow"],
    "senior": ["senior", "lead", "manager", "responsable", "team lead", "tech lead"],
    "mid": ["confirmé", "expérimenté", "experienced"],
    "junior": ["junior", "débutant", "stagiaire", "alternant", "apprenti", "entry-level"],
};

// [CDC Sprint 3.1] Soft skills typiques par secteur/rôle
const SOFT_SKILLS_BY_CONTEXT: Record<string, string[]> = {
    // Par rôle
    "manager": ["Leadership", "Gestion d'équipe", "Communication", "Délégation", "Prise de décision"],
    "lead": ["Mentorat", "Coordination", "Vision technique", "Communication"],
    "consultant": ["Adaptabilité", "Présentation client", "Résolution de problèmes", "Négociation"],
    "développeur": ["Rigueur", "Esprit analytique", "Travail en équipe", "Curiosité technique"],
    "chef de projet": ["Planification", "Gestion des risques", "Communication", "Organisation"],
    
    // Par secteur
    "IT / Tech": ["Veille technologique", "Agilité", "Résolution de problèmes", "Travail en équipe"],
    "Finance / Banque": ["Rigueur", "Attention aux détails", "Éthique", "Résistance au stress"],
    "Conseil / Consulting": ["Adaptabilité", "Présentation", "Esprit de synthèse", "Autonomie"],
    "Commerce / Retail": ["Sens du service", "Persuasion", "Écoute active", "Résilience"],
    
    // Par années d'expérience
    "senior_generic": ["Leadership", "Mentorat", "Vision stratégique", "Autonomie"],
    "mid_generic": ["Autonomie", "Proactivité", "Travail en équipe", "Adaptabilité"],
    "junior_generic": ["Curiosité", "Apprentissage rapide", "Travail en équipe", "Motivation"],
};

/**
 * Enrichit un profil RAG avec des métadonnées déduites
 */
export function enrichProfile(ragProfile: any): ProfileEnrichment {
    const experiences = ragProfile?.experiences || [];
    const competences = ragProfile?.competences || {};
    
    // Calculer années d'expérience totales
    const yearsExperience = calculateTotalYearsExperience(experiences);
    
    // Détecter secteur principal
    const detectedSector = detectSector(ragProfile);
    
    // Déduire niveau de séniorité
    const seniorityLevel = detectSeniority(ragProfile, yearsExperience);
    
    // Extraire technologies principales
    const primaryTechnologies = extractPrimaryTechnologies(competences, experiences);
    
    // Extraire mots-clés industrie
    const industryKeywords = extractIndustryKeywords(experiences);
    
    // [CDC Sprint 3.1] Détecter soft skills
    const soft_skills_deduites = detectSoftSkills(
        ragProfile, 
        detectedSector, 
        seniorityLevel,
        competences?.soft_skills || []
    );
    
    return {
        detectedSector,
        seniorityLevel,
        yearsExperience,
        primaryTechnologies,
        industryKeywords,
        soft_skills_deduites
    };
}

/**
 * Calcule le nombre total d'années d'expérience
 */
function calculateTotalYearsExperience(experiences: any[]): number {
    if (!experiences || experiences.length === 0) return 0;
    
    let totalMonths = 0;
    
    for (const exp of experiences) {
        const start = exp.date_debut || exp.debut;
        const end = exp.actuel ? new Date().toISOString() : (exp.date_fin || exp.fin);
        
        if (start) {
            const startDate = new Date(start);
            const endDate = end ? new Date(end) : new Date();
            const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 
                         + (endDate.getMonth() - startDate.getMonth());
            totalMonths += Math.max(0, months);
        }
    }
    
    return Math.round(totalMonths / 12 * 10) / 10; // Arrondi à 1 décimale
}

/**
 * Détecte le secteur principal basé sur les expériences
 */
function detectSector(ragProfile: any): string | null {
    const textToAnalyze = extractAllText(ragProfile).toLowerCase();
    
    let bestSector: string | null = null;
    let bestScore = 0;
    
    for (const [sector, keywords] of Object.entries(SECTOR_KEYWORDS)) {
        let score = 0;
        for (const keyword of keywords) {
            const regex = new RegExp(keyword.toLowerCase(), 'gi');
            const matches = textToAnalyze.match(regex);
            if (matches) {
                score += matches.length;
            }
        }
        if (score > bestScore) {
            bestScore = score;
            bestSector = sector;
        }
    }
    
    return bestScore >= 2 ? bestSector : null; // Seuil minimum de 2 occurrences
}

/**
 * Déduit le niveau de séniorité
 */
function detectSeniority(ragProfile: any, yearsExperience: number): ProfileEnrichment['seniorityLevel'] {
    const textToAnalyze = extractAllText(ragProfile).toLowerCase();
    
    // D'abord vérifier par mots-clés
    for (const [level, keywords] of Object.entries(SENIORITY_KEYWORDS)) {
        for (const keyword of keywords) {
            if (textToAnalyze.includes(keyword.toLowerCase())) {
                return level as ProfileEnrichment['seniorityLevel'];
            }
        }
    }
    
    // Sinon déduire par années d'expérience
    if (yearsExperience >= 15) return 'executive';
    if (yearsExperience >= 10) return 'expert';
    if (yearsExperience >= 5) return 'senior';
    if (yearsExperience >= 2) return 'mid';
    return 'junior';
}

/**
 * Extrait les technologies principales
 */
function extractPrimaryTechnologies(competences: any, experiences: any[]): string[] {
    const techSet = new Set<string>();
    
    // Compétences techniques explicites
    const techniques = competences?.explicit?.techniques || competences?.techniques || [];
    for (const tech of techniques.slice(0, 10)) {
        const name = typeof tech === 'string' ? tech : tech?.nom;
        if (name) techSet.add(name);
    }
    
    // Technologies des expériences
    for (const exp of experiences.slice(0, 5)) {
        for (const tech of (exp.technologies || []).slice(0, 5)) {
            techSet.add(tech);
        }
    }
    
    return Array.from(techSet).slice(0, 15);
}

/**
 * Extrait les mots-clés industrie pertinents
 */
function extractIndustryKeywords(experiences: any[]): string[] {
    const keywords = new Set<string>();
    
    for (const exp of experiences) {
        // Nom d'entreprise
        if (exp.entreprise) {
            keywords.add(exp.entreprise);
        }
        // Clients
        for (const client of (exp.clients_references || []).slice(0, 3)) {
            keywords.add(typeof client === 'string' ? client : client?.nom || '');
        }
    }
    
    return Array.from(keywords).filter(k => k.length > 0).slice(0, 20);
}

/**
 * Extrait tout le texte du profil pour analyse
 */
function extractAllText(ragProfile: any): string {
    const parts: string[] = [];
    
    // Profil
    if (ragProfile?.profil) {
        parts.push(ragProfile.profil.titre_principal || '');
        parts.push(ragProfile.profil.elevator_pitch || '');
    }
    
    // Expériences
    for (const exp of (ragProfile?.experiences || [])) {
        parts.push(exp.poste || '');
        parts.push(exp.entreprise || '');
        parts.push(exp.description || '');
        for (const real of (exp.realisations || [])) {
            parts.push(typeof real === 'string' ? real : real?.description || '');
        }
    }
    
    return parts.join(' ');
}

// ============================================================================
// [CDC Sprint 3.1] SOFT SKILLS DETECTION
// ============================================================================

/**
 * Détecte les soft skills basé sur le contexte du profil
 */
function detectSoftSkills(
    ragProfile: any,
    detectedSector: string | null,
    seniorityLevel: ProfileEnrichment['seniorityLevel'],
    existingSoftSkills: string[]
): string[] {
    const suggestedSkills = new Set<string>();
    const textToAnalyze = extractAllText(ragProfile).toLowerCase();
    
    // 1. Déduire par rôle détecté dans les postes
    for (const [role, skills] of Object.entries(SOFT_SKILLS_BY_CONTEXT)) {
        if (role.startsWith("IT") || role.startsWith("Finance") || role.startsWith("Conseil") || role.startsWith("Commerce")) {
            continue; // Skip sector entries here
        }
        if (textToAnalyze.includes(role.toLowerCase())) {
            for (const skill of skills) {
                suggestedSkills.add(skill);
            }
        }
    }
    
    // 2. Déduire par secteur
    if (detectedSector && SOFT_SKILLS_BY_CONTEXT[detectedSector]) {
        for (const skill of SOFT_SKILLS_BY_CONTEXT[detectedSector]) {
            suggestedSkills.add(skill);
        }
    }
    
    // 3. Déduire par séniorité
    const seniorityKey = `${seniorityLevel}_generic`;
    if (SOFT_SKILLS_BY_CONTEXT[seniorityKey]) {
        for (const skill of SOFT_SKILLS_BY_CONTEXT[seniorityKey]) {
            suggestedSkills.add(skill);
        }
    }
    
    // 4. Filtrer les soft skills déjà présents explicitement
    const existingLower = new Set(existingSoftSkills.map(s => s.toLowerCase()));
    const deduplicated = Array.from(suggestedSkills).filter(
        skill => !existingLower.has(skill.toLowerCase())
    );
    
    return deduplicated.slice(0, 10); // Max 10 soft skills déduites
}

/**
 * [CDC Sprint 3.1] Dédoublonne les skills explicites vs tacites
 * Retourne les skills déduites qui ne sont pas déjà dans les explicites
 */
export function deduplicateSoftSkills(
    explicitSkills: string[],
    deducedSkills: string[]
): string[] {
    const normalizeSkill = (s: string) => s.toLowerCase().trim();
    const explicitSet = new Set(explicitSkills.map(normalizeSkill));
    
    return deducedSkills.filter(skill => !explicitSet.has(normalizeSkill(skill)));
}

/**
 * [CDC Sprint 3.1] Filtre les compétences tacites en excluant les rejetées
 */
export function filterRejectedTacitSkills(
    deducedSkills: string[],
    rejectedSkills: string[]
): string[] {
    const normalizeSkill = (s: string) => s.toLowerCase().trim();
    const rejectedSet = new Set(rejectedSkills.map(normalizeSkill));
    
    return deducedSkills.filter(skill => !rejectedSet.has(normalizeSkill(skill)));
}
