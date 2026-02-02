/**
 * Builder pour les certifications et références clients
 * Extrait de ai-adapter.ts pour modularité
 * 
 * [AUDIT FIX] : Enrichit les certifications et clients depuis le RAG
 * [CDC Phase 3.2] Refactoring architecture
 */

import type { AIWidget } from "../ai-widgets";
import type { RendererResumeSchema } from "../renderer-schema";
import { normalizeKey, normalizeClientName, cleanClientList } from "./utils";

// Type pour les options
interface BuildCertificationsOptions {
    limitsBySection?: {
        maxClientsReferences?: number;
    };
}

/**
 * Extrait un nom de client d'une valeur quelconque
 */
function extractClientName(value: any): string {
    if (typeof value === "string") return value;
    if (!value || typeof value !== "object") return "";
    const candidate = value.nom ?? value.name ?? value.client ?? value.entreprise ?? value.company;
    return typeof candidate === "string" ? candidate : "";
}

/**
 * [AUDIT FIX] : Construit les certifications et références clients
 * Enrichit depuis le RAG si les widgets sont insuffisants
 */
export function buildCertificationsAndReferences(
    certificationWidgets: AIWidget[],
    referenceWidgets: AIWidget[],
    ragProfile?: any,
    opts?: BuildCertificationsOptions
): {
    certifications: string[] | undefined;
    clients_references: RendererResumeSchema["clients_references"];
} {
    const certifications: string[] = [];
    const clientsRaw: unknown[] = [];

    // Construire certifications depuis widgets
    certificationWidgets.forEach((widget) => {
        const text = widget.text.trim();
        if (!text) return;
        certifications.push(text);
    });

    // Construire clients depuis widgets
    referenceWidgets.forEach((widget) => {
        const text = widget.text.trim();
        if (!text) return;
        clientsRaw.push(text);
    });

    // [AUDIT FIX] : Enrichir certifications depuis RAG si vide
    if (certifications.length === 0 && ragProfile?.certifications) {
        const ragCerts = Array.isArray(ragProfile.certifications) ? ragProfile.certifications : [];
        ragCerts.forEach((c: any) => {
            const certName = typeof c === "string" ? c : c.nom;
            if (certName) certifications.push(certName);
        });
    }

    // [AUDIT FIX] : Enrichir clients depuis RAG
    // Chemin 1: references.clients
    const ragClientsFromReferences = Array.isArray(ragProfile?.references?.clients)
        ? ragProfile.references.clients
        : [];
    ragClientsFromReferences.forEach((c: any) => {
        const clientName = extractClientName(c);
        if (clientName) clientsRaw.push(clientName);
    });

    // Chemin 2: clients_references (au niveau racine)
    const ragClientsFromRoot = Array.isArray(ragProfile?.clients_references?.clients)
        ? ragProfile.clients_references.clients
        : [];
    ragClientsFromRoot.forEach((c: any) => {
        const clientName = extractClientName(c);
        if (clientName) clientsRaw.push(clientName);
    });

    // Chemin 3: experiences[].clients ou clients_references
    const ragClientsFromExperiences = Array.isArray(ragProfile?.experiences)
        ? ragProfile.experiences
        : [];
    ragClientsFromExperiences.forEach((exp: any) => {
        const expClients =
            (Array.isArray(exp?.clients_references) && exp.clients_references) ||
            (Array.isArray(exp?.clients) && exp.clients) ||
            (Array.isArray(exp?.clientsReferences) && exp.clientsReferences) ||
            [];
        expClients.forEach((c: any) => {
            const clientName = extractClientName(c);
            if (clientName) clientsRaw.push(clientName);
        });
    });

    // Exclure les entreprises (éviter de lister l'employeur comme client)
    const excludeCompanies = Array.isArray(ragProfile?.experiences)
        ? ragProfile.experiences.map((e: any) => e?.entreprise || e?.client).filter(Boolean)
        : [];

    const maxClientsReferences = opts?.limitsBySection?.maxClientsReferences ?? 25;
    let uniqueClients = cleanClientList(clientsRaw, { exclude: excludeCompanies, max: maxClientsReferences });

    // Fallback si 0 clients après exclusion
    if (uniqueClients.length === 0 && clientsRaw.length > 0) {
        uniqueClients = cleanClientList(clientsRaw, { max: maxClientsReferences });
    }

    // Construire les secteurs depuis le RAG
    const uniqueClientsKeys = new Set(uniqueClients.map(normalizeKey));

    const secteursFromRag = (() => {
        const ragClients = Array.isArray(ragProfile?.references?.clients)
            ? ragProfile.references.clients
            : [];
        const bySector = new Map<string, Set<string>>();

        for (const c of ragClients) {
            if (!c || typeof c !== "object") continue;
            const sector = String((c as any).secteur || "").trim();
            if (!sector) continue;
            const name = normalizeClientName((c as any).nom ?? (c as any).name);
            if (!name) continue;

            // Utiliser normalizeKey pour le matching
            const nameKey = normalizeKey(name);
            if (!uniqueClientsKeys.has(nameKey)) continue;

            const set = bySector.get(sector) ?? new Set<string>();
            set.add(name);
            bySector.set(sector, set);
        }

        const sectors = Array.from(bySector.entries())
            .map(([secteur, set]) => ({ secteur, clients: Array.from(set.values()) }))
            .filter((x) => x.clients.length > 0)
            .sort((a, b) => b.clients.length - a.clients.length || a.secteur.localeCompare(b.secteur, "fr"));
        return sectors.length > 0 ? sectors.slice(0, 6) : undefined;
    })();

    const clients_references =
        uniqueClients.length > 0
            ? {
                clients: uniqueClients,
                secteurs: secteursFromRag,
            }
            : undefined;

    return {
        certifications: certifications.length > 0 ? certifications : undefined,
        clients_references,
    };
}
