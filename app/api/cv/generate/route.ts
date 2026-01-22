import { createSupabaseAdminClient, createSupabaseUserClient, requireSupabaseUser } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { generateWithCascade, callWithRetry } from "@/lib/ai/gemini";
import { getCVOptimizationPrompt } from "@/lib/ai/prompts";
import { checkRateLimit, createRateLimitError, getRateLimitConfig } from "@/lib/utils/rate-limit";
import { normalizeRAGData } from "@/lib/utils/normalize-rag";
import { normalizeRAGToCV } from "@/components/cv/normalizeData";
import { fitCVToTemplate } from "@/lib/cv/validator";
import { parseJobOfferFromText, JobOfferContext } from "@/lib/cv/relevance-scoring";

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
        delete (cloned as any).contexte_enrichi;
        delete (cloned as any).extraction_metadata;
        delete (cloned as any).quality_metrics;
        delete (cloned as any).rejected_inferred;
        delete (cloned as any).metadata;
        if ((cloned as any).competences?.inferred) {
            delete (cloned as any).competences.inferred;
        }
    }
    return cloned;
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
        const ragProfileForPrompt = stripInferredRAGForCV(ragProfile);
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
        try {
            const cascadeResult = await callWithRetry(() => generateWithCascade(prompt));
            responseText = cascadeResult.result.response.text();
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

        const mergedRaw = {
            ...ragProfile,
            profil: {
                prenom: ragProfil?.prenom || identity?.prenom || "",
                nom: ragProfil?.nom || identity?.nom || "",
                titre_principal: safeTitle || ragProfil?.titre_principal || "",
                email: identityContact?.email || ragContact?.email || "",
                telephone: identityContact?.telephone || ragContact?.telephone || "",
                localisation: identityContact?.ville || ragProfil?.localisation || "",
                linkedin: identityContact?.linkedin || ragContact?.linkedin || "",
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
