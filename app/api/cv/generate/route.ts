import { createSupabaseAdminClient, createSupabaseUserClient, requireSupabaseUser } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { generateWithCascade, callWithRetry } from "@/lib/ai/gemini";
import { getCVOptimizationPrompt } from "@/lib/ai/prompts";
import { checkRateLimit, createRateLimitError, getRateLimitConfig } from "@/lib/utils/rate-limit";
import { normalizeRAGData } from "@/lib/utils/normalize-rag";
import { normalizeRAGToCV } from "@/components/cv/normalizeData";
import { fitCVToTemplate } from "@/lib/cv/validator";
import { parseJobOfferFromText, JobOfferContext } from "@/lib/cv/relevance-scoring";
import packageJson from "@/package.json";

export const runtime = "nodejs";

type MatchContextSelection = {
    selectedStrengthIndexes?: number[];
    selectedMissingKeywords?: string[];
    selectedPreparationChecklistIndexes?: number[];
    selectedSellingPointsIndexes?: number[];
    extraInstructions?: string;
};

const MAX_SELECTED_ITEMS = 25;
const MAX_EXTRA_INSTRUCTIONS_CHARS = 800;

const toIntArray = (value: unknown): number[] => {
    if (!Array.isArray(value)) return [];
    const unique = new Set<number>();
    for (const raw of value) {
        const n = typeof raw === "number" ? raw : Number(raw);
        if (!Number.isFinite(n) || n < 0) continue;
        unique.add(Math.floor(n));
        if (unique.size >= MAX_SELECTED_ITEMS) break;
    }
    return Array.from(unique);
};

const toStringArray = (value: unknown): string[] => {
    if (!Array.isArray(value)) return [];
    const unique = new Set<string>();
    for (const raw of value) {
        const s = (typeof raw === "string" ? raw : String(raw)).trim();
        if (!s) continue;
        unique.add(s);
        if (unique.size >= MAX_SELECTED_ITEMS) break;
    }
    return Array.from(unique);
};

const normalizeMatchSelection = (value: unknown): Required<MatchContextSelection> => {
    const raw = (value && typeof value === "object") ? (value as MatchContextSelection) : {};
    const extra = typeof raw.extraInstructions === "string" ? raw.extraInstructions.trim() : "";
    return {
        selectedStrengthIndexes: toIntArray(raw.selectedStrengthIndexes),
        selectedMissingKeywords: toStringArray(raw.selectedMissingKeywords),
        selectedPreparationChecklistIndexes: toIntArray(raw.selectedPreparationChecklistIndexes),
        selectedSellingPointsIndexes: toIntArray(raw.selectedSellingPointsIndexes),
        extraInstructions: extra.length > MAX_EXTRA_INSTRUCTIONS_CHARS ? extra.slice(0, MAX_EXTRA_INSTRUCTIONS_CHARS) : extra,
    };
};

const buildSelectedMatchReportForCV = (
    analysisData: any,
    selection: Required<MatchContextSelection>
): {
    match_score?: number;
    strengths?: Array<{ point: string; match_percent?: number }>;
    missing_keywords?: string[];
    coaching_tips?: { preparation_checklist?: string[]; key_selling_points?: string[] };
} | null => {
    const matchReport = analysisData?.match_report || {};
    const strengths = Array.isArray(matchReport?.strengths) ? matchReport.strengths : [];
    const missingKeywords = Array.isArray(matchReport?.missing_keywords) ? matchReport.missing_keywords : [];
    const coachingTips = matchReport?.coaching_tips || {};
    const prep = Array.isArray(coachingTips?.preparation_checklist) ? coachingTips.preparation_checklist : [];
    const selling = Array.isArray(coachingTips?.key_selling_points) ? coachingTips.key_selling_points : [];

    const selectedStrengths = selection.selectedStrengthIndexes
        .map((idx) => strengths[idx])
        .filter(Boolean)
        .map((s: any) => ({ point: String(s.point || "").trim(), match_percent: s.match_percent }))
        .filter((s: any) => s.point);

    const allowedKeywords = new Set(missingKeywords.map((k: any) => String(k).trim()).filter(Boolean));
    const selectedKeywords = selection.selectedMissingKeywords
        .map((k) => k.trim())
        .filter((k) => allowedKeywords.has(k));

    const selectedPrep = selection.selectedPreparationChecklistIndexes
        .map((idx) => prep[idx])
        .filter(Boolean)
        .map((v: any) => String(v).trim())
        .filter(Boolean);

    const selectedSelling = selection.selectedSellingPointsIndexes
        .map((idx) => selling[idx])
        .filter(Boolean)
        .map((v: any) => String(v).trim())
        .filter(Boolean);

    const hasAny = selectedStrengths.length > 0 || selectedKeywords.length > 0 || selectedPrep.length > 0 || selectedSelling.length > 0;
    if (!hasAny) return null;

    const payload: any = {
        match_score: typeof analysisData?.match_score === "number" ? analysisData.match_score : undefined,
        strengths: selectedStrengths.length > 0 ? selectedStrengths : undefined,
        missing_keywords: selectedKeywords.length > 0 ? selectedKeywords : undefined,
    };

    if (selectedPrep.length > 0 || selectedSelling.length > 0) {
        payload.coaching_tips = {
            preparation_checklist: selectedPrep.length > 0 ? selectedPrep : undefined,
            key_selling_points: selectedSelling.length > 0 ? selectedSelling : undefined,
        };
    }

    return payload;
};

const buildBoosterTrace = (analysisData: any, selection: Required<MatchContextSelection>) => {
    const matchReport = analysisData?.match_report || {};
    const strengths = Array.isArray(matchReport?.strengths) ? matchReport.strengths : [];
    const missingKeywords = Array.isArray(matchReport?.missing_keywords) ? matchReport.missing_keywords : [];
    const coachingTips = matchReport?.coaching_tips || {};
    const prep = Array.isArray(coachingTips?.preparation_checklist) ? coachingTips.preparation_checklist : [];
    const selling = Array.isArray(coachingTips?.key_selling_points) ? coachingTips.key_selling_points : [];

    const selectedStrengths = selection.selectedStrengthIndexes
        .map((idx) => strengths[idx])
        .filter(Boolean)
        .map((s: any) => String(s.point || "").trim())
        .filter(Boolean);

    const allowedKeywords = new Set(missingKeywords.map((k: any) => String(k).trim()).filter(Boolean));
    const selectedKeywords = selection.selectedMissingKeywords
        .map((k) => k.trim())
        .filter((k) => allowedKeywords.has(k));

    const selectedPrep = selection.selectedPreparationChecklistIndexes
        .map((idx) => prep[idx])
        .filter(Boolean)
        .map((v: any) => String(v).trim())
        .filter(Boolean);

    const selectedSelling = selection.selectedSellingPointsIndexes
        .map((idx) => selling[idx])
        .filter(Boolean)
        .map((v: any) => String(v).trim())
        .filter(Boolean);

    return {
        selected_strengths: selectedStrengths,
        selected_missing_keywords: selectedKeywords,
        selected_preparation_checklist: selectedPrep,
        selected_selling_points: selectedSelling,
        extra_instructions: selection.extraInstructions || null,
    };
};

const stripInferredRAGForCV = (profile: any) => {
    if (!profile || typeof profile !== "object") return profile;
    const cloned = JSON.parse(JSON.stringify(profile));
    if (cloned && typeof cloned === "object") {
        delete (cloned as any).extraction_metadata;
        delete (cloned as any).quality_metrics;
        delete (cloned as any).rejected_inferred;
        delete (cloned as any).metadata;
    }
    return cloned;
};

/**
 * Convertit une réalisation atomisée en texte narratif fluide
 */
const convertRealisationToNarrative = (r: any): string => {
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
            // Ajouter la quantification de manière naturelle
            if (parts.length > 0) {
                parts[parts.length - 1] = `${parts[parts.length - 1]} (${quantText})`;
            } else {
                parts.push(quantText);
            }
        }
    }
    
    return parts.join(" - ").trim();
};

/**
 * Aplatit toutes les compétences en un skill_map unique
 */
const buildSkillMap = (profile: any): Record<string, { level?: string; used_in_experiences: string[]; context?: string }> => {
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
};

/**
 * Transforme le RAG en format optimisé pour LLM (littéraire, compact, sans métadonnées)
 */
const buildRAGForCVPrompt = (profile: any) => {
    if (!profile || typeof profile !== "object") return profile;
    
    const base = stripInferredRAGForCV(profile);
    if (!base || typeof base !== "object") return base;
    
    // Construire le skill_map aplatissant toutes les compétences
    const skillMap = buildSkillMap(base);
    
    // Transformer les expériences : convertir réalisations en texte narratif
    const experiences = (base.experiences || []).map((exp: any) => {
        const transformed: any = {
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
        
        return transformed;
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
    
    // Construire competences depuis skill_map ET garder format original
    const originalCompetences = base.competences || {};
    
    // Extraire techniques depuis skill_map (toutes sauf soft skills)
    const techniquesFromSkillMap = Object.keys(skillMap).filter(skill => {
        const skillLower = skill.toLowerCase();
        // Filtrer les soft skills connus
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
    
    // Construire le format competences combiné
    const competencesCombined: any = {
        // Format original pour compatibilité
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
        skill_map: skillMap, // Pour l'IA (vue aplatissant)
        competences: competencesCombined, // Format compatible pour normalizeRAGToCV
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
};

const normalizeForMatch = (value: unknown) => {
    if (value === null || value === undefined) return "";
    const s = typeof value === "string" ? value : String(value);
    return s
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
};

const normalizeLoose = (value: string) => {
    return value
        .trim()
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "");
};

const isPlaceholderValue = (value: string) => {
    const v = normalizeLoose(value)
        .replace(/\s+/g, " ")
        .replace(/[^\p{L}\p{N}\s]/gu, "");
    if (!v) return true;
    return v === "non renseigne" || v === "non renseign" || v === "nr" || v === "n a" || v === "na" || v === "none" || v === "null" || v === "undefined";
};

const cleanRawString = (value: unknown) => {
    if (typeof value !== "string") return "";
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (isPlaceholderValue(trimmed)) return "";
    return trimmed;
};

const pickFirstString = (...candidates: unknown[]) => {
    for (const c of candidates) {
        const s = cleanRawString(c);
        if (s) return s;
    }
    return "";
};

const extractNumbers = (text: string) => {
    return text.match(/\d[\d\s.,]*\d|\d/g) || [];
};

const isNumbersGroundedInText = (candidate: string, source: string) => {
    const sourceLower = source.toLowerCase();
    const numbers = extractNumbers(candidate);
    for (const n of numbers) {
        const token = n.replace(/\s+/g, "");
        if (!token) continue;
        if (!sourceLower.includes(token.toLowerCase())) return false;
    }
    return true;
};

const buildSourceSkillSet = (profile: any) => {
    const skills = new Set<string>();
    const add = (value: unknown) => {
        const key = normalizeForMatch(value);
        if (key) skills.add(key);
    };

    const competences = profile?.competences || {};
    const collectArray = (arr: unknown) => {
        if (!Array.isArray(arr)) return;
        for (const item of arr) {
            if (typeof item === "string") add(item);
            else if (item && typeof item === "object") {
                add((item as any).nom ?? (item as any).name ?? (item as any).skill);
            } else add(item);
        }
    };

    collectArray(competences.techniques);
    collectArray(competences.soft_skills);
    collectArray(competences.langages_programmation);
    collectArray(competences.frameworks);
    collectArray(competences.outils);
    collectArray(competences.cloud_devops);
    if (competences.explicit) {
        collectArray(competences.explicit.techniques);
        collectArray(competences.explicit.soft_skills);
        collectArray(competences.explicit.langages_programmation);
        collectArray(competences.explicit.frameworks);
        collectArray(competences.explicit.outils);
        collectArray(competences.explicit.cloud_devops);
    }

    const experiences = Array.isArray(profile?.experiences) ? profile.experiences : [];
    for (const exp of experiences) {
        collectArray((exp as any).technologies);
        collectArray((exp as any).outils);
        collectArray((exp as any).methodologies);
    }

    return skills;
};

const extractSkillStrings = (value: unknown): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) {
        return value
            .map((v) => {
                if (typeof v === "string") return v;
                if (v && typeof v === "object") {
                    return String((v as any)?.nom ?? (v as any)?.name ?? (v as any)?.skill ?? (v as any)?.value ?? (v as any)?.label ?? "");
                }
                return String(v ?? "");
            })
            .map((s) => s.trim())
            .filter(Boolean);
    }
    if (typeof value === "object") {
        const v =
            (value as any).nom ??
            (value as any).name ??
            (value as any).skill ??
            (value as any).value ??
            (value as any).label;
        return v ? [String(v).trim()].filter(Boolean) : [];
    }
    return [String(value).trim()].filter(Boolean);
};

const mergeAIOptimizationsIntoProfile = (params: {
    ragProfile: any;
    ragProfileForPrompt: any;
    aiOptimizedCV: any;
    guardWarnings: string[];
}) => {
    const { ragProfile, ragProfileForPrompt, aiOptimizedCV, guardWarnings } = params;
    const merged = JSON.parse(JSON.stringify(ragProfile || {}));

    const sourceExperiences = Array.isArray(ragProfileForPrompt?.experiences) ? ragProfileForPrompt.experiences : [];
    const sourceSkillSet = buildSourceSkillSet(ragProfileForPrompt);

    const aiExperiences = Array.isArray(aiOptimizedCV?.experiences) ? aiOptimizedCV.experiences : [];
    const aiKey = (exp: any) => `${normalizeForMatch(exp?.entreprise)}|${normalizeForMatch(exp?.poste)}`;

    const aiByKey = new Map<string, any[]>();
    for (const exp of aiExperiences) {
        const key = aiKey(exp);
        if (!key || key === "|") continue;
        const list = aiByKey.get(key) ?? [];
        list.push(exp);
        aiByKey.set(key, list);
    }

    const mergedExperiences = Array.isArray(merged.experiences) ? merged.experiences : [];
    for (const exp of mergedExperiences) {
        const key = `${normalizeForMatch((exp as any).entreprise)}|${normalizeForMatch((exp as any).poste)}`;
        const candidates = aiByKey.get(key) ?? [];
        if (candidates.length === 0) continue;

        const sourceExp = sourceExperiences.find((s: any) => {
            return normalizeForMatch(s?.entreprise) === normalizeForMatch((exp as any).entreprise) &&
                normalizeForMatch(s?.poste) === normalizeForMatch((exp as any).poste);
        });

        const sourceText = JSON.stringify(sourceExp ?? exp ?? "").toLowerCase();
        const aiExp = candidates[0];
        const aiRealisations = Array.isArray(aiExp?.realisations) ? aiExp.realisations : [];
        const filteredRealisations: string[] = [];

        for (const r of aiRealisations) {
            let text = "";
            if (typeof r === "string") {
                text = r.trim();
            } else if (r && typeof r === "object") {
                const parts: string[] = [];
                const desc = (r as any).description ?? (r as any).text ?? (r as any).value;
                const impact = (r as any).impact;
                if (typeof desc === "string" && desc.trim()) parts.push(desc.trim());
                if (typeof impact === "string" && impact.trim() && impact.trim() !== desc?.trim?.()) parts.push(impact.trim());
                text = parts.join(" - ").trim();
            } else {
                text = String(r ?? "").trim();
            }
            if (!text) continue;
            if (text.length < 12) continue;
            if (text.length > 260) continue;
            if (text.includes("[object Object]")) continue;
            if (!isNumbersGroundedInText(text, sourceText)) continue;
            filteredRealisations.push(text);
            if (filteredRealisations.length >= 8) break;
        }

        if (filteredRealisations.length > 0) {
            (exp as any).realisations = filteredRealisations;
        } else if (aiRealisations.length > 0) {
            guardWarnings.push(`Réalisations IA ignorées pour ${String((exp as any).poste || "").slice(0, 40)} (grounding)`);
        }

        const mergedTech: string[] = [];
        const addSkillIfSource = (val: unknown) => {
            const s = typeof val === "string" ? val : String(val ?? "");
            const key = normalizeForMatch(s);
            if (!key) return;
            if (!sourceSkillSet.has(key)) return;
            mergedTech.push(s);
        };

        for (const s of extractSkillStrings(aiExp?.technologies)) addSkillIfSource(s);
        for (const s of extractSkillStrings(aiExp?.outils)) addSkillIfSource(s);
        for (const s of extractSkillStrings(aiExp?.methodologies)) addSkillIfSource(s);

        if (mergedTech.length > 0) {
            const unique = Array.from(new Set(mergedTech));
            (exp as any).technologies = unique;
        }
    }

    const aiCompetences = aiOptimizedCV?.competences || {};
    const sourceTechniques = (merged?.competences?.techniques && Array.isArray(merged.competences.techniques))
        ? merged.competences.techniques
        : [];
    const sourceSoft = (merged?.competences?.soft_skills && Array.isArray(merged.competences.soft_skills))
        ? merged.competences.soft_skills
        : [];

    const desiredTechniques: string[] = [];
    const desiredSoft: string[] = [];

    for (const s of extractSkillStrings(aiCompetences?.techniques ?? aiCompetences?.langages_programmation ?? [])) {
        const key = normalizeForMatch(s);
        if (!key || !sourceSkillSet.has(key)) continue;
        desiredTechniques.push(String(s));
    }
    for (const s of extractSkillStrings(aiCompetences?.frameworks ?? [])) {
        const key = normalizeForMatch(s);
        if (!key || !sourceSkillSet.has(key)) continue;
        desiredTechniques.push(String(s));
    }
    for (const s of extractSkillStrings(aiCompetences?.outils ?? [])) {
        const key = normalizeForMatch(s);
        if (!key || !sourceSkillSet.has(key)) continue;
        desiredTechniques.push(String(s));
    }
    for (const s of extractSkillStrings(aiCompetences?.soft_skills ?? [])) {
        const key = normalizeForMatch(s);
        if (!key || !sourceSkillSet.has(key)) continue;
        desiredSoft.push(String(s));
    }

    const uniqueDesiredTechniques = Array.from(new Set(desiredTechniques));
    const uniqueDesiredSoft = Array.from(new Set(desiredSoft));

    if (uniqueDesiredTechniques.length > 0) {
        const sourceNormalized = new Map<string, string>();
        for (const s of sourceTechniques) sourceNormalized.set(normalizeForMatch(s), s);
        const ordered = uniqueDesiredTechniques
            .map((s) => sourceNormalized.get(normalizeForMatch(s)) ?? s)
            .filter(Boolean);
        const remainder = sourceTechniques.filter((s: any) => !new Set(ordered.map(normalizeForMatch)).has(normalizeForMatch(s)));
        merged.competences = merged.competences || {};
        merged.competences.techniques = [...ordered, ...remainder];
    }

    if (uniqueDesiredSoft.length > 0) {
        const sourceNormalized = new Map<string, string>();
        for (const s of sourceSoft) sourceNormalized.set(normalizeForMatch(s), s);
        const ordered = uniqueDesiredSoft
            .map((s) => sourceNormalized.get(normalizeForMatch(s)) ?? s)
            .filter(Boolean);
        const remainder = sourceSoft.filter((s: any) => !new Set(ordered.map(normalizeForMatch)).has(normalizeForMatch(s)));
        merged.competences = merged.competences || {};
        merged.competences.soft_skills = [...ordered, ...remainder];
    }

    return merged;
};

export async function POST(req: Request) {
    try {
        const generationStartMs = Date.now();
        const auth = await requireSupabaseUser(req);
        if (auth.error || !auth.user || !auth.token) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { analysisId, template, includePhoto = true, matchContextSelection } = await req.json();
        const userId = auth.user.id;
        const selection = normalizeMatchSelection(matchContextSelection);
        const hasSelectionOrExtra =
            selection.selectedStrengthIndexes.length > 0 ||
            selection.selectedMissingKeywords.length > 0 ||
            selection.selectedPreparationChecklistIndexes.length > 0 ||
            selection.selectedSellingPointsIndexes.length > 0 ||
            !!selection.extraInstructions;

        if (!analysisId) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const supabase = createSupabaseUserClient(auth.token);
        const admin = createSupabaseAdminClient();

        const { data: userRow } = await admin
            .from("users")
            .select("subscription_tier, subscription_expires_at, subscription_status")
            .eq("id", userId)
            .maybeSingle();

        const isExpired = userRow?.subscription_expires_at
            ? new Date(userRow.subscription_expires_at) < new Date()
            : false;
        const tier = !userRow || userRow.subscription_status !== "active" || isExpired
            ? "free"
            : (userRow.subscription_tier || "free");

        const rateLimitResult = checkRateLimit(`cv:${userId}`, getRateLimitConfig(tier, "CV_GENERATION"));
        if (!rateLimitResult.success) {
            return NextResponse.json(createRateLimitError(rateLimitResult), { status: 429 });
        }

        // Check cache: if CV already generated for this analysis + template, return it
        const { data: cachedCV, error: cacheError } = hasSelectionOrExtra
            ? { data: null as any, error: null as any }
            : await supabase
                .from("cv_generations")
                .select("id, cv_data, template_name, created_at")
                .eq("user_id", userId)
                .eq("job_analysis_id", analysisId)
                .eq("template_name", template || "modern")
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();

        if (cachedCV && !cacheError) {
            const cacheAge = Date.now() - new Date(cachedCV.created_at).getTime();
            const CACHE_TTL = 60 * 60 * 1000; // 1 hour

            if (cacheAge < CACHE_TTL) {
                const cachedGeneratorVersion = (cachedCV as any)?.cv_data?.cv_metadata?.generator_version;
                if (cachedGeneratorVersion !== packageJson.version) {
                    console.log(`[CV CACHE SKIP] generator_version mismatch (${cachedGeneratorVersion} != ${packageJson.version})`);
                } else {
                const cachedHasPhoto = !!(cachedCV as any)?.cv_data?.profil?.photo_url;
                if (!includePhoto) {
                    const cvWithoutPhoto = JSON.parse(JSON.stringify(cachedCV.cv_data));
                    if (cvWithoutPhoto?.profil) {
                        delete cvWithoutPhoto.profil.photo_url;
                    }
                    console.log(`[CV CACHE HIT] Returning cached CV (age: ${Math.round(cacheAge / 1000)}s)`);
                    return NextResponse.json({
                        success: true,
                        cvId: cachedCV.id,
                        cvData: cvWithoutPhoto,
                        templateName: cachedCV.template_name,
                        includePhoto,
                        cached: true,
                        cacheAge: Math.round(cacheAge / 1000)
                    });
                }

                if (cachedHasPhoto) {
                    console.log(`[CV CACHE HIT] Returning cached CV (age: ${Math.round(cacheAge / 1000)}s)`);
                    return NextResponse.json({
                        success: true,
                        cvId: cachedCV.id,
                        cvData: cachedCV.cv_data,
                        templateName: cachedCV.template_name,
                        includePhoto,
                        cached: true,
                        cacheAge: Math.round(cacheAge / 1000)
                    });
                }
                }
            } else {
                console.log(`[CV CACHE EXPIRED] Cache too old (${Math.round(cacheAge / 1000)}s), regenerating...`);
            }
        }

        // 1. Fetch Job Analysis & User Profile
        const { data: analysisData, error: analysisError } = await supabase
            .from("job_analyses")
            .select("*")
            .eq("id", analysisId)
            .eq("user_id", userId)
            .single();

        if (analysisError || !analysisData) {
            return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
        }

        const { data: ragData, error: ragError } = await supabase
            .from("rag_metadata")
            .select("completeness_details, custom_notes")
            .eq("user_id", userId)
            .single();

        if (ragError || !ragData) {
            return NextResponse.json({ error: "RAG Profile not found" }, { status: 404 });
        }

        const ragProfile = normalizeRAGData(ragData.completeness_details);
        const ragProfileForPrompt = buildRAGForCVPrompt(ragProfile);
        const customNotes = ragData.custom_notes || "";
        const jobDescription = analysisData.job_description;
        const selectedMatchReport = buildSelectedMatchReportForCV(analysisData, selection);
        const boosterTrace = hasSelectionOrExtra ? buildBoosterTrace(analysisData, selection) : null;

        const ragProfil = (ragProfile as any)?.profil || {};
        const ragContact = ragProfil?.contact || {};

        const photoRef = ragProfil?.photo_url as string | undefined;
        const photoValue = includePhoto && photoRef ? photoRef : null;

        // 2. Generate CV with AI (with retry logic)
        const extraNotes = selection.extraInstructions ? `Instructions utilisateur pour ce CV:\n${selection.extraInstructions}` : "";
        const mergedNotes = [customNotes, extraNotes].filter(Boolean).join("\n\n");
        const prompt = getCVOptimizationPrompt(ragProfileForPrompt, jobDescription, mergedNotes, selectedMatchReport || undefined);

        console.log("=== CV GENERATION START ===");

        let responseText: string;
        let modelUsed: string | undefined;
        try {
            const cascadeResult = await callWithRetry(() => generateWithCascade(prompt));
            responseText = cascadeResult.result.response.text();
            modelUsed = cascadeResult.modelUsed;
            console.log("Using model:", cascadeResult.modelUsed);
            console.log("Gemini response length:", responseText.length);
        } catch (geminiError: any) {
            console.error("Gemini API Error:", geminiError.message);
            return NextResponse.json({
                error: "AI service error: Unable to generate CV at this time",
                errorCode: "GEMINI_ERROR",
                details: geminiError.message,
                retry: true
            }, { status: 503 });
        }

        const jsonString = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

        let aiOptimizedCV;
        try {
            aiOptimizedCV = JSON.parse(jsonString);
        } catch (e) {
            console.error("CV Parse Error - Response was:", responseText.substring(0, 500));
            return NextResponse.json({ error: "AI Parse Error" }, { status: 500 });
        }

        const identity = (aiOptimizedCV as any)?.identity || {};
        const identityContact = identity?.contact || {};
        const optimizedPitchText = typeof (aiOptimizedCV as any)?.elevator_pitch?.text === "string"
            ? (aiOptimizedCV as any).elevator_pitch.text
            : undefined;

        const sourceText = JSON.stringify(ragProfileForPrompt || {}).toLowerCase();
        const guardWarnings: string[] = [];
        const isPitchGrounded = (candidate: string) => {
            const numbers = candidate.match(/\d[\d\s.,]*\d|\d/g) || [];
            for (const n of numbers) {
                const token = n.replace(/\s+/g, "");
                if (!token) continue;
                if (!sourceText.includes(token.toLowerCase())) return false;
            }
            return true;
        };

        const safeOptimizedPitchText =
            optimizedPitchText && isPitchGrounded(optimizedPitchText)
                ? optimizedPitchText
                : undefined;
        if (optimizedPitchText && !safeOptimizedPitchText) {
            guardWarnings.push("Elevator pitch IA ignoré (chiffres non présents dans le profil source)");
        }

        const safeTitle =
            typeof identity?.titre_vise === "string" && identity.titre_vise.trim().length > 0
                ? identity.titre_vise.trim()
                : undefined;

        const aiMergedProfile = mergeAIOptimizationsIntoProfile({
            ragProfile,
            ragProfileForPrompt,
            aiOptimizedCV,
            guardWarnings,
        });

        const mergedRaw = {
            ...aiMergedProfile,
            profil: {
                prenom: ragProfil?.prenom || identity?.prenom || "",
                nom: ragProfil?.nom || identity?.nom || "",
                titre_principal: safeTitle || ragProfil?.titre_principal || "",
                email: pickFirstString(
                    identityContact?.email,
                    (ragProfil as any)?.email,
                    ragContact?.email,
                    ragContact?.mail,
                    ragContact?.email_pro
                ),
                telephone: pickFirstString(
                    identityContact?.telephone,
                    (ragProfil as any)?.telephone,
                    (ragProfil as any)?.tel,
                    ragContact?.telephone,
                    ragContact?.tel,
                    ragContact?.phone,
                    ragContact?.mobile
                ),
                localisation: pickFirstString(
                    identityContact?.ville,
                    (ragProfil as any)?.localisation,
                    ragContact?.ville
                ) || ragProfil?.localisation || "",
                linkedin: pickFirstString(
                    identityContact?.linkedin,
                    (ragProfil as any)?.linkedin,
                    ragContact?.linkedin,
                    ragContact?.linkedin_url,
                    ragContact?.linkedinUrl
                ),
                elevator_pitch: safeOptimizedPitchText || ragProfil?.elevator_pitch || "",
                photo_url: includePhoto && photoValue ? photoValue : undefined,
            },
        };

        const normalizedCV = normalizeRAGToCV(mergedRaw);

        // Extract job offer context for relevance scoring
        const jobOfferContext: JobOfferContext | null = jobDescription
            ? {
                ...parseJobOfferFromText(jobDescription),
                title: analysisData.job_title || parseJobOfferFromText(jobDescription).title,
                sector: analysisData.company_name || undefined,
            }
            : null;

        const { cvData: finalCV, compressionLevelApplied, dense, unitStats } = fitCVToTemplate({
            cvData: normalizedCV,
            templateName: template || "modern",
            includePhoto,
            jobOffer: jobOfferContext,
        });

        // Count formats used
        const formatsUsed = {
            detailed: 0,
            standard: 0,
            compact: 0,
            minimal: 0,
        };
        for (const exp of (finalCV.experiences || [])) {
            const fmt = (exp as any)._format || "standard";
            if (fmt in formatsUsed) formatsUsed[fmt as keyof typeof formatsUsed]++;
        }

        const baseMeta = (aiOptimizedCV as any)?.cv_metadata && typeof (aiOptimizedCV as any).cv_metadata === "object"
            ? (aiOptimizedCV as any).cv_metadata
            : {};
        const generatedAt = typeof baseMeta.generated_at === "string" ? baseMeta.generated_at : new Date().toISOString();
        const optimizationsApplied = Array.isArray(baseMeta.optimizations_applied) ? baseMeta.optimizations_applied : [];

        (finalCV as any).cv_metadata = {
            ...baseMeta,
            template_used: template || "modern",
            generated_for_job_id: analysisId,
            match_score: typeof baseMeta.match_score === "number" ? baseMeta.match_score : analysisData.match_score,
            generated_at: generatedAt,
            generator_version: packageJson.version,
            generator_model: modelUsed || null,
            compression_level_applied: compressionLevelApplied,
            page_count: 1,
            optimizations_applied: optimizationsApplied,
            dense: !!dense,
            unit_stats: unitStats,
            // New fields for UI accordion
            warnings: [...(unitStats?.warnings || []), ...guardWarnings],
            formats_used: formatsUsed,
            relevance_scoring_applied: !!jobOfferContext,
            job_title: analysisData.job_title || null,
            match_booster: boosterTrace || undefined,
        };

        // 4. Save Generated CV
        const { data: cvGen, error: cvError } = await supabase
            .from("cv_generations")
            .insert({
                user_id: userId,
                job_analysis_id: analysisId,
                template_name: template || "modern",
                cv_data: finalCV,
                optimizations_applied: (finalCV as any)?.cv_metadata?.optimizations_applied || [],
                ats_score: (finalCV as any)?.cv_metadata?.ats_score,
                generation_duration_ms: Date.now() - generationStartMs,
            })
            .select("id")
            .single();

        if (cvError) {
            console.error("CV Save Error", cvError);
            return NextResponse.json({ error: "Failed to save CV: " + cvError.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            cvId: cvGen?.id,
            cvData: finalCV,
            templateName: template || "modern",
            includePhoto,
        });

    } catch (error: any) {
        console.error("CV Generation Error", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
