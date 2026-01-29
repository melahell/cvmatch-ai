/**
 * RAG Transform - Transformation du RAG en format optimisé pour LLM
 *
 * Ces fonctions transforment le RAG brut en un format compact et optimisé
 * pour être passé aux prompts Gemini, réduisant le nombre de tokens
 * tout en conservant l'information essentielle.
 */

/**
 * Convertit une réalisation atomisée en texte narratif fluide
 */
export function convertRealisationToNarrative(r: any): string {
    if (typeof r === "string") return r;
    if (!r || typeof r !== "object") return "";

    const parts: string[] = [];

    // Description principale
    if (r.description) parts.push(r.description);

    // Impact (si différent de description)
    if (r.impact && r.impact !== r.description) {
        parts.push(r.impact);
    }

    // Quantification : reconstruire en texte naturel
    if (r.quantification) {
        const q = r.quantification;
        let quantText = "";
        if (q.display) {
            quantText = q.display;
        } else if (q.valeur && q.unite) {
            quantText = `${q.valeur} ${q.unite}`;
        }
        if (quantText) {
            if (parts.length > 0) {
                parts[parts.length - 1] = `${parts[parts.length - 1]} (${quantText})`;
            } else {
                parts.push(quantText);
            }
        }
    }

    return parts.join(" - ").trim();
}

/**
 * Aplatit toutes les compétences en un skill_map unique
 */
export function buildSkillMap(profile: any): Record<string, { level?: string; used_in_experiences: string[]; context?: string }> {
    const skillMap: Record<string, { level?: string; used_in_experiences: string[]; context?: string }> = {};

    const addSkill = (skillName: string, level?: string, expId?: string, context?: string) => {
        if (!skillName || typeof skillName !== "string") return;
        const normalized = skillName.trim();
        if (!normalized) return;

        if (!skillMap[normalized]) {
            skillMap[normalized] = { level, used_in_experiences: [], context };
        }
        if (expId && !skillMap[normalized].used_in_experiences.includes(expId)) {
            skillMap[normalized].used_in_experiences.push(expId);
        }
        if (level && !skillMap[normalized].level) {
            skillMap[normalized].level = level;
        }
        if (context && !skillMap[normalized].context) {
            skillMap[normalized].context = context;
        }
    };

    // Extraire depuis competences.explicit
    const competences = profile?.competences || {};
    if (competences.explicit) {
        // Techniques
        const techs = competences.explicit.techniques || [];
        techs.forEach((t: any) => {
            const name = typeof t === "string" ? t : (t?.nom || t?.name || "");
            const level = typeof t === "object" ? (t?.niveau || t?.level) : undefined;
            addSkill(name, level);
        });

        // Soft skills
        const softs = competences.explicit.soft_skills || [];
        softs.forEach((s: string) => addSkill(s));

        // Autres catégories
        ["langages_programmation", "frameworks", "outils", "cloud_devops", "methodologies"].forEach(cat => {
            const items = competences.explicit[cat] || [];
            items.forEach((item: string) => addSkill(item));
        });
    }

    // Extraire depuis competences (format legacy)
    if (Array.isArray(competences.techniques)) {
        competences.techniques.forEach((t: any) => {
            const name = typeof t === "string" ? t : (t?.nom || t?.name || "");
            addSkill(name);
        });
    }
    if (Array.isArray(competences.soft_skills)) {
        competences.soft_skills.forEach((s: string) => addSkill(s));
    }

    // Extraire depuis competences.par_domaine
    if (competences.par_domaine && typeof competences.par_domaine === "object") {
        Object.entries(competences.par_domaine).forEach(([domaine, skills]: [string, any]) => {
            if (Array.isArray(skills)) {
                skills.forEach((skill: string) => addSkill(skill, undefined, undefined, domaine));
            }
        });
    }

    // Extraire depuis les expériences
    const experiences = Array.isArray(profile?.experiences) ? profile.experiences : [];
    experiences.forEach((exp: any, idx: number) => {
        const expId = `exp_${idx}`;

        // Technologies de l'expérience
        const techs = exp?.technologies || [];
        techs.forEach((t: string) => addSkill(t, undefined, expId));

        // Outils
        const outils = exp?.outils || [];
        outils.forEach((o: string) => addSkill(o, undefined, expId));

        // Méthodologies
        const methods = exp?.methodologies || [];
        methods.forEach((m: string) => addSkill(m, undefined, expId));
    });

    // Extraire depuis inferred (seulement haute confiance)
    if (competences.inferred) {
        ["techniques", "tools", "soft_skills"].forEach(cat => {
            const items = competences.inferred[cat] || [];
            items.forEach((item: any) => {
                if (item?.name && (item.confidence === undefined || item.confidence >= 70)) {
                    addSkill(item.name, undefined, undefined, item.reasoning?.substring(0, 100));
                }
            });
        });
    }

    return skillMap;
}

/**
 * Supprime les métadonnées d'extraction du RAG
 */
export function stripInferredRAGForCV(profile: any): any {
    if (!profile || typeof profile !== "object") return profile;
    const cloned = JSON.parse(JSON.stringify(profile));
    if (cloned && typeof cloned === "object") {
        delete (cloned as any).extraction_metadata;
        delete (cloned as any).quality_metrics;
        delete (cloned as any).rejected_inferred;
        delete (cloned as any).metadata;
    }
    return cloned;
}

/**
 * Transforme le RAG en format optimisé pour LLM (littéraire, compact, sans métadonnées)
 *
 * Cette fonction réduit considérablement le nombre de tokens tout en conservant
 * l'information essentielle pour la génération de CV.
 *
 * IMPORTANT: Gère les expériences avec missions imbriquées (ex: Freelance)
 */
export function buildRAGForCVPrompt(profile: any): any {
    if (!profile || typeof profile !== "object") return profile;

    const base = stripInferredRAGForCV(profile);
    if (!base || typeof base !== "object") return base;

    // Construire le skill_map aplatissant toutes les compétences
    const skillMap = buildSkillMap(base);

    // Transformer les expériences : convertir réalisations en texte narratif
    // ET aplatir les missions imbriquées en expériences séparées
    const experiences: any[] = [];
    let expIndex = 0;

    (base.experiences || []).forEach((exp: any) => {
        // Vérifier si c'est une expérience avec missions imbriquées
        const hasMissions = Array.isArray(exp.missions) && exp.missions.length > 0;
        const hasActivites = Array.isArray(exp.activites) && exp.activites.length > 0;
        const hasProjects = Array.isArray(exp.projects) && exp.projects.length > 0;

        // Si expérience avec missions/activités imbriquées, les aplatir
        const nestedItems = exp.missions || exp.activites || exp.projects || [];

        if (nestedItems.length > 0) {
            // Aplatir chaque mission/activité en une expérience séparée
            nestedItems.forEach((mission: any, missionIdx: number) => {
                const transformed: any = {
                    id: `exp_${expIndex}`,
                    // Utiliser le client/titre de la mission ou combiner avec l'expérience parent
                    poste: mission.poste || mission.role || mission.titre || exp.poste || "Consultant",
                    entreprise: mission.client || mission.entreprise || mission.nom || exp.entreprise,
                    debut: mission.debut || mission.date_debut || mission.start,
                    fin: mission.fin || mission.date_fin || mission.end,
                    actuel: mission.actuel || mission.current,
                    lieu: mission.lieu || exp.lieu,
                    secteur: mission.secteur || exp.secteur,
                    contexte: mission.contexte || mission.description || exp.contexte,
                    // Marquer comme sous-mission pour référence
                    _parent_type: exp.poste || "Freelance",
                };

                // Convertir réalisations de la mission
                const realisations = mission.realisations || mission.achievements || mission.bullets || [];
                if (Array.isArray(realisations)) {
                    transformed.realisations = realisations
                        .map(convertRealisationToNarrative)
                        .filter((r: string) => r.length > 0);
                }

                // Technologies/outils de la mission
                if (mission.technologies) transformed.technologies = mission.technologies;
                if (mission.outils) transformed.outils = mission.outils;
                if (mission.stack) transformed.technologies = mission.stack;

                experiences.push(transformed);
                expIndex++;
            });

            // Ajouter aussi les réalisations directes de l'expérience parent (si existantes)
            if (Array.isArray(exp.realisations) && exp.realisations.length > 0) {
                const parentTransformed: any = {
                    id: `exp_${expIndex}`,
                    poste: exp.poste,
                    entreprise: exp.entreprise,
                    debut: exp.debut || exp.date_debut,
                    fin: exp.fin || exp.date_fin,
                    actuel: exp.actuel,
                    lieu: exp.lieu,
                    secteur: exp.secteur,
                    contexte: exp.contexte,
                };
                parentTransformed.realisations = exp.realisations
                    .map(convertRealisationToNarrative)
                    .filter((r: string) => r.length > 0);
                if (parentTransformed.realisations.length > 0) {
                    experiences.push(parentTransformed);
                    expIndex++;
                }
            }
        } else {
            // Expérience standard sans missions imbriquées
            const transformed: any = {
                id: `exp_${expIndex}`,
                poste: exp.poste,
                entreprise: exp.entreprise,
                debut: exp.debut || exp.date_debut,
                fin: exp.fin || exp.date_fin,
                actuel: exp.actuel,
                lieu: exp.lieu,
                secteur: exp.secteur,
                contexte: exp.contexte,
            };

            // Convertir réalisations en texte narratif
            if (Array.isArray(exp.realisations)) {
                transformed.realisations = exp.realisations
                    .map(convertRealisationToNarrative)
                    .filter((r: string) => r.length > 0);
            }

            // Technologies/outils (référencés dans skill_map)
            if (exp.technologies) transformed.technologies = exp.technologies;
            if (exp.outils) transformed.outils = exp.outils;
            if (exp.methodologies) transformed.methodologies = exp.methodologies;
            if (exp.clients_references) transformed.clients_references = exp.clients_references;

            experiences.push(transformed);
            expIndex++;
        }
    });

    // Construire le profil simplifié
    const profil = base.profil || {};
    const transformedProfil: any = {
        nom: profil.nom,
        prenom: profil.prenom,
        titre_principal: profil.titre_principal,
        localisation: profil.localisation,
        elevator_pitch: profil.elevator_pitch,
        photo_url: profil.photo_url,
    };

    // Contact simplifié
    if (profil.contact) {
        transformedProfil.contact = {
            email: profil.contact.email,
            telephone: profil.contact.telephone,
            linkedin: profil.contact.linkedin,
        };
    } else {
        // Fallback si contact est à la racine
        transformedProfil.contact = {
            email: (profil as any).email,
            telephone: (profil as any).telephone,
            linkedin: (profil as any).linkedin,
        };
    }

    // Formations simplifiées
    const formations = (base.formations || []).map((f: any) => ({
        titre: f.titre || f.diplome,
        organisme: f.organisme || f.ecole || f.etablissement,
        annee: f.annee,
        mention: f.mention,
    }));

    // Certifications simplifiées
    const certifications = (base.certifications || []).map((c: any) =>
        typeof c === "string" ? c : c.nom
    );

    // Langues simplifiées
    let langues: Array<{ langue: string; niveau: string }> = [];
    if (Array.isArray(base.langues)) {
        langues = base.langues.map((l: any) => ({
            langue: l.langue || l.name,
            niveau: l.niveau || l.level,
        }));
    } else if (base.langues && typeof base.langues === "object") {
        langues = Object.entries(base.langues).map(([langue, niveau]) => ({
            langue,
            niveau: String(niveau),
        }));
    }

    // Contexte enrichi (limité)
    const contexte = base.contexte_enrichi;
    const contexteSimplifie: any = {};
    if (contexte) {
        if (Array.isArray(contexte.responsabilites_implicites)) {
            contexteSimplifie.responsabilites_implicites = contexte.responsabilites_implicites.slice(0, 8);
        }
        if (Array.isArray(contexte.competences_tacites)) {
            contexteSimplifie.competences_tacites = contexte.competences_tacites.slice(0, 10);
        }
        if (Array.isArray(contexte.soft_skills_deduites)) {
            contexteSimplifie.soft_skills_deduites = contexte.soft_skills_deduites.slice(0, 8);
        }
    }

    // Références clients simplifiées
    const references = base.references || {};
    const clientsSimplifies = (references.clients || []).map((c: any) => ({
        nom: c.nom,
        secteur: c.secteur,
    }));

    // Construire le format competences combiné
    const originalCompetences = base.competences || {};

    // Extraire techniques depuis skill_map (toutes sauf soft skills)
    const techniquesFromSkillMap = Object.keys(skillMap).filter(skill => {
        const skillLower = skill.toLowerCase();
        const softSkillKeywords = ['soft', 'communication', 'leadership', 'management', 'team', 'problem solving',
            'automation mindset', 'learning agility', 'strategic thinking', 'pragmatisme', 'persistence', 'autonomie'];
        return !softSkillKeywords.some(keyword => skillLower.includes(keyword));
    });

    // Extraire soft_skills depuis skill_map
    const softSkillsFromSkillMap = Object.keys(skillMap).filter(skill => {
        const skillLower = skill.toLowerCase();
        const softSkillKeywords = ['soft', 'communication', 'leadership', 'management', 'team', 'problem solving',
            'automation mindset', 'learning agility', 'strategic thinking', 'pragmatisme', 'persistence', 'autonomie'];
        return softSkillKeywords.some(keyword => skillLower.includes(keyword));
    });

    // Format competences combiné
    const competencesCombined: any = {
        ...originalCompetences,
    };

    // Extraire techniques depuis format original
    const originalTechniques: string[] = [];
    if (originalCompetences.explicit?.techniques) {
        originalTechniques.push(...originalCompetences.explicit.techniques.map((t: any) =>
            typeof t === 'string' ? t : (t.nom || t.name || '')
        ).filter(Boolean));
    }
    if (Array.isArray(originalCompetences.techniques)) {
        originalTechniques.push(...originalCompetences.techniques.map((t: any) =>
            typeof t === 'string' ? t : (t.nom || t.name || '')
        ).filter(Boolean));
    }

    // Extraire soft_skills depuis format original
    const originalSoftSkills: string[] = [];
    if (originalCompetences.explicit?.soft_skills) {
        originalSoftSkills.push(...originalCompetences.explicit.soft_skills.filter((s: any) => typeof s === 'string'));
    }
    if (Array.isArray(originalCompetences.soft_skills)) {
        originalSoftSkills.push(...originalCompetences.soft_skills.filter((s: any) => typeof s === 'string'));
    }

    // Combiner toutes les sources (dédupliquer)
    const allTechniques = Array.from(new Set([
        ...originalTechniques,
        ...techniquesFromSkillMap
    ]));

    const allSoftSkills = Array.from(new Set([
        ...originalSoftSkills,
        ...softSkillsFromSkillMap
    ]));

    // Format simplifié pour l'IA
    competencesCombined.techniques = allTechniques;
    competencesCombined.soft_skills = allSoftSkills;

    // Assembler le format optimisé
    const optimized: any = {
        profil: transformedProfil,
        experiences,
        skill_map: skillMap,
        competences: competencesCombined,
        formations,
        certifications,
        langues,
        references: {
            clients: clientsSimplifies,
        },
    };

    // Ajouter contexte enrichi seulement s'il existe
    if (Object.keys(contexteSimplifie).length > 0) {
        optimized.contexte_enrichi = contexteSimplifie;
    }

    return optimized;
}

/**
 * Calcule le score de complétude du RAG (0-100)
 */
export function calculateRAGCompletenessScore(ragProfile: any): number {
    let score = 0;
    const weights = {
        profil: 15,
        experiences: 35,
        competences: 20,
        formations: 10,
        certifications: 5,
        langues: 5,
        references: 10,
    };

    // Profil
    const profil = ragProfile?.profil || {};
    if (profil.nom && profil.prenom) score += weights.profil * 0.3;
    if (profil.titre_principal) score += weights.profil * 0.3;
    if (profil.elevator_pitch) score += weights.profil * 0.4;

    // Expériences
    const experiences = Array.isArray(ragProfile?.experiences) ? ragProfile.experiences : [];
    if (experiences.length > 0) {
        const expScore = Math.min(1, experiences.length / 3); // Max 3 expériences pour 100%
        const avgRealisations = experiences.reduce((sum: number, exp: any) => {
            return sum + (Array.isArray(exp.realisations) ? exp.realisations.length : 0);
        }, 0) / Math.max(1, experiences.length);
        const realisationsScore = Math.min(1, avgRealisations / 5); // Avg 5 réalisations pour 100%
        score += weights.experiences * (expScore * 0.5 + realisationsScore * 0.5);
    }

    // Compétences
    const competences = ragProfile?.competences || {};
    const techCount = (competences.techniques?.length || 0) + (competences.explicit?.techniques?.length || 0);
    const softCount = (competences.soft_skills?.length || 0) + (competences.explicit?.soft_skills?.length || 0);
    const compScore = Math.min(1, (techCount + softCount) / 15);
    score += weights.competences * compScore;

    // Formations
    const formations = Array.isArray(ragProfile?.formations) ? ragProfile.formations : [];
    score += weights.formations * Math.min(1, formations.length / 2);

    // Certifications
    const certifications = Array.isArray(ragProfile?.certifications) ? ragProfile.certifications : [];
    score += weights.certifications * Math.min(1, certifications.length / 2);

    // Langues
    const langues = Array.isArray(ragProfile?.langues) ? ragProfile.langues : Object.keys(ragProfile?.langues || {});
    score += weights.langues * Math.min(1, langues.length / 2);

    // Références
    const references = ragProfile?.references?.clients || [];
    score += weights.references * Math.min(1, references.length / 3);

    return Math.round(score);
}
