type CVCounts = {
    experiences: number;
    realisations: number;
    technicalSkills: number;
    softSkills: number;
    formations: number;
    languages: number;
    certifications: number;
    clientsReferences: number;
    clientsInExperiences: number;
    elevatorPitchChars: number;
};

const stableKey = (value: unknown) =>
    String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ")
        .replace(/[^\p{L}\p{N}\s\-_.]/gu, "");

const getCounts = (cvData: any): CVCounts => {
    const experiences = Array.isArray(cvData?.experiences) ? cvData.experiences : [];
    const competences = cvData?.competences || {};
    const formations = Array.isArray(cvData?.formations) ? cvData.formations : [];
    const langues = Array.isArray(cvData?.langues) ? cvData.langues : [];
    const certifications = Array.isArray(cvData?.certifications) ? cvData.certifications : [];
    const clientsReferences = Array.isArray(cvData?.clients_references?.clients) ? cvData.clients_references.clients : [];
    const realisations = experiences.reduce((sum: number, exp: any) => sum + (Array.isArray(exp?.realisations) ? exp.realisations.length : 0), 0);
    const clientsInExperiences = experiences.reduce(
        (sum: number, exp: any) => sum + (Array.isArray(exp?.clients) ? exp.clients.length : 0),
        0
    );
    return {
        experiences: experiences.length,
        realisations,
        technicalSkills: Array.isArray(competences.techniques) ? competences.techniques.length : 0,
        softSkills: Array.isArray(competences.soft_skills) ? competences.soft_skills.length : 0,
        formations: formations.length,
        languages: langues.length,
        certifications: certifications.length,
        clientsReferences: clientsReferences.length,
        clientsInExperiences,
        elevatorPitchChars: String(cvData?.profil?.elevator_pitch || "").length,
    };
};

const experienceKey = (exp: any) =>
    [
        stableKey(exp?.poste),
        stableKey(exp?.entreprise),
        stableKey(exp?.date_debut || exp?.debut || exp?.date_debut),
        stableKey(exp?.date_fin || exp?.fin || ""),
    ].join("|");

const listRemovedByKey = (before: any[], after: any[]) => {
    const afterKeys = new Set(after.map(experienceKey));
    return before.filter((e) => !afterKeys.has(experienceKey(e)));
};

const listRemovedRealisations = (beforeExp: any, afterExp: any) => {
    const before = Array.isArray(beforeExp?.realisations) ? beforeExp.realisations : [];
    const after = Array.isArray(afterExp?.realisations) ? afterExp.realisations : [];
    const afterKeys = new Set(after.map((r: any) => stableKey(typeof r === "string" ? r : r?.description)));
    return before.filter((r: any) => !afterKeys.has(stableKey(typeof r === "string" ? r : r?.description)));
};

const computeTemplateOmissions = (cvData: any, templateName: string) => {
    const omissions: string[] = [];
    const profil = cvData?.profil || {};
    const hasLinks = Boolean(profil.linkedin || profil.github || profil.portfolio);
    const hasSoftSkills = Array.isArray(cvData?.competences?.soft_skills) && cvData.competences.soft_skills.length > 0;
    const hasLieu = Array.isArray(cvData?.experiences) && cvData.experiences.some((e: any) => Boolean(e?.lieu));
    const hasSectors =
        Array.isArray(cvData?.clients_references?.secteurs) && cvData.clients_references.secteurs.length > 0;

    if ((templateName === "classic" || templateName === "creative") && hasLinks) {
        omissions.push("profil.linkedin/github/portfolio");
    }
    if ((templateName === "classic" || templateName === "tech") && hasSoftSkills) {
        omissions.push("competences.soft_skills");
    }
    if ((templateName === "tech" || templateName === "creative") && hasLieu) {
        omissions.push("experiences.lieu");
    }
    if (templateName !== "modern" && hasSectors) {
        omissions.push("clients_references.secteurs");
    }
    return omissions;
};

export type CVLossReport = {
    templateName: string;
    counts: {
        input: CVCounts;
        preselected: CVCounts;
        prelimited: CVCounts;
        adapted: CVCounts;
    };
    removed: {
        experiences: {
            inputToPreselected: string[];
            preselectedToPrelimited: string[];
            prelimitedToAdapted: string[];
        };
        realisations: number;
        elevatorPitchChars: {
            before: number;
            after: number;
        };
    };
    templateOmissions: string[];
};

export function buildCVLossReport(params: {
    input: any;
    preselected: any;
    prelimited: any;
    adapted: any;
    templateName: string;
}): CVLossReport {
    const inputExp = Array.isArray(params.input?.experiences) ? params.input.experiences : [];
    const preselectedExp = Array.isArray(params.preselected?.experiences) ? params.preselected.experiences : [];
    const prelimitedExp = Array.isArray(params.prelimited?.experiences) ? params.prelimited.experiences : [];
    const adaptedExp = Array.isArray(params.adapted?.experiences) ? params.adapted.experiences : [];

    const removed1 = listRemovedByKey(inputExp, preselectedExp).map((e) => `${e.poste} - ${e.entreprise}`);
    const removed2 = listRemovedByKey(preselectedExp, prelimitedExp).map((e) => `${e.poste} - ${e.entreprise}`);
    const removed3 = listRemovedByKey(prelimitedExp, adaptedExp).map((e) => `${e.poste} - ${e.entreprise}`);

    const adaptedByKey = new Map(adaptedExp.map((e: any) => [experienceKey(e), e]));
    let removedReals = 0;
    for (const before of prelimitedExp) {
        const after = adaptedByKey.get(experienceKey(before));
        if (!after) continue;
        removedReals += listRemovedRealisations(before, after).length;
    }

    const pitchBefore = String(params.prelimited?.profil?.elevator_pitch || params.input?.profil?.elevator_pitch || "").length;
    const pitchAfter = String(params.adapted?.profil?.elevator_pitch || "").length;

    return {
        templateName: params.templateName,
        counts: {
            input: getCounts(params.input),
            preselected: getCounts(params.preselected),
            prelimited: getCounts(params.prelimited),
            adapted: getCounts(params.adapted),
        },
        removed: {
            experiences: {
                inputToPreselected: removed1,
                preselectedToPrelimited: removed2,
                prelimitedToAdapted: removed3,
            },
            realisations: removedReals,
            elevatorPitchChars: { before: pitchBefore, after: pitchAfter },
        },
        templateOmissions: computeTemplateOmissions(params.adapted, params.templateName),
    };
}

