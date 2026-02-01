const mergeDeep = (base: any, patch: any): any => {
    if (patch === null || patch === undefined) return base;
    if (Array.isArray(patch)) return patch;
    if (typeof patch !== "object") return patch;
    const out: any = Array.isArray(base) ? [...base] : { ...(base || {}) };
    for (const [k, v] of Object.entries(patch)) {
        if (v === undefined) continue;
        const prev = (out as any)[k];
        if (Array.isArray(v)) (out as any)[k] = v;
        else if (v && typeof v === "object") (out as any)[k] = mergeDeep(prev, v);
        else (out as any)[k] = v;
    }
    return out;
};

const stripComputedFields = (value: any) => {
    if (!value || typeof value !== "object") return value;
    const { score, breakdown, topJobs, photo_url, ...rest } = value as any;
    return rest;
};

export function mergeRAGUserUpdate(existingDetails: any, incomingDetails: any): any {
    const base = existingDetails || {};
    const incoming = stripComputedFields(incomingDetails);
    const merged = mergeDeep(base, incoming);

    const prevPhoto = base?.profil?.photo_url as string | undefined;
    const nextPhoto = merged?.profil?.photo_url as string | undefined;
    const prevIsStorage = typeof prevPhoto === "string" && prevPhoto.startsWith("storage:");
    const nextIsStorage = typeof nextPhoto === "string" && nextPhoto.startsWith("storage:");
    if (prevIsStorage && (!nextPhoto || !nextIsStorage)) {
        merged.profil = { ...(merged.profil || {}), photo_url: prevPhoto };
    }

    return merged;
}

