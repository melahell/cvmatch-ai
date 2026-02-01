export function preserveUserFieldsOnRegeneration(previousDetails: any, nextDetails: any): any {
    const prev = previousDetails || {};
    const next = nextDetails || {};

    const out = { ...next };

    if (prev.rejected_inferred && !out.rejected_inferred) {
        out.rejected_inferred = prev.rejected_inferred;
    }

    const prevPhoto = prev?.profil?.photo_url;
    if (prevPhoto && !out?.profil?.photo_url) {
        out.profil = { ...(out.profil || {}), photo_url: prevPhoto };
    }

    const prevClients = prev?.references?.clients;
    const nextClients = out?.references?.clients;
    if (Array.isArray(prevClients) && prevClients.length > 0 && (!Array.isArray(nextClients) || nextClients.length === 0)) {
        out.references = { ...(out.references || {}), clients: prevClients };
    }

    return out;
}

