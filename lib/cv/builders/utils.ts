/**
 * Utilitaires partagés pour les builders CV
 * Extraits de ai-adapter.ts pour modularité
 * 
 * [CDC Phase 3.1] Refactoring architecture
 */

import type { AIWidget } from "../ai-widgets";

// ============================================================================
// NORMALISATION
// ============================================================================

/**
 * Normalise une clé pour comparaison insensible à la casse
 */
export const normalizeKey = (value: unknown): string =>
    String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ")
        .replace(/[^\p{L}\p{N}\s&''.\\-]/gu, "");

/**
 * Normalise un nom de client pour affichage
 */
export const normalizeClientName = (value: unknown): string => {
    const raw = String(value ?? "").trim();
    if (!raw) return "";
    const cleaned = raw
        .replace(/[\u00A0]/g, " ")
        .replace(/\s+/g, " ")
        .replace(/^[-–—•·\s]+|[-–—•·\s]+$/g, "")
        .replace(/\s*\((confidentiel|n\/a|na|nc)\)\s*/gi, "")
        .trim();
    if (!cleaned) return "";

    const upper = cleaned.toUpperCase();
    const isAcronym =
        cleaned.length <= 10 &&
        /[A-Z]/.test(cleaned) &&
        cleaned === upper &&
        !/[a-z]/.test(cleaned);
    if (isAcronym) return cleaned;

    const words = cleaned.split(" ");
    const cased = words
        .map((w) => {
            if (!w) return w;
            if (/^[A-Z0-9&''.\\-]{2,}$/.test(w) && !/[a-z]/.test(w)) return w;
            const head = w[0]?.toUpperCase() ?? "";
            return head + w.slice(1).toLowerCase();
        })
        .join(" ");
    return cased;
};

/**
 * Vérifie si un nom de client est invalide
 */
export const isBadClientName = (name: string): boolean => {
    const key = normalizeKey(name);
    if (!key) return true;
    if (key.length < 2) return true;
    if (key === "client" || key === "clients" || key === "references") return true;
    if (key.includes("confidentiel") || key.includes("nda") || key.includes("n a")) return true;
    if (key.startsWith("entreprise ") || key.startsWith("societe ") || key.startsWith("company ")) return true;
    if (/^client\s*\d+$/.test(key)) return true;
    if (/[<>]/.test(name)) return true;
    const digits = (name.match(/\d/g) || []).length;
    if (digits >= 5) return true;
    return false;
};

/**
 * Nettoie et déduplique une liste de clients
 */
export const cleanClientList = (items: unknown[], options?: { exclude?: string[]; max?: number }): string[] => {
    const excludeKeys = new Set((options?.exclude || []).map(normalizeKey).filter(Boolean));
    const counts = new Map<string, { label: string; count: number }>();
    for (const item of items) {
        const label = normalizeClientName(typeof item === "string" ? item : (item as any)?.nom ?? (item as any)?.name);
        if (!label) continue;
        if (isBadClientName(label)) continue;
        const key = normalizeKey(label);
        if (!key) continue;
        if (excludeKeys.has(key)) continue;
        const prev = counts.get(key);
        if (!prev) counts.set(key, { label, count: 1 });
        else counts.set(key, { label: prev.label.length >= label.length ? prev.label : label, count: prev.count + 1 });
    }
    const sorted = Array.from(counts.values())
        .sort((a, b) => (b.count - a.count) || a.label.localeCompare(b.label, "fr"))
        .map((x) => x.label);
    const max = options?.max ?? 30;
    return sorted.slice(0, max);
};

// ============================================================================
// RAG HELPERS
// ============================================================================

/**
 * [AUDIT FIX IMPORTANT-6] : Trouve l'expérience RAG correspondante
 */
export function findRAGExperience(expId: string, ragProfile: any, headerText?: string): any | null {
    if (!ragProfile?.experiences || !Array.isArray(ragProfile.experiences)) {
        return null;
    }

    // Format exp_0, exp_1, etc.
    const numericMatch = expId.match(/^exp_(\d+)$/);
    if (numericMatch) {
        const index = parseInt(numericMatch[1], 10);
        if (index >= 0 && index < ragProfile.experiences.length) {
            return ragProfile.experiences[index];
        }
    }

    // Recherche par ID personnalisé
    for (const exp of ragProfile.experiences) {
        if (exp.id === expId) {
            return exp;
        }
    }

    // [FIX 6.5.0] Fallback: correspondance par poste/entreprise depuis headerText
    // Copié de ai-adapter.ts pour cohérence client-side
    if (headerText) {
        const normalizeForMatch = (s: string) =>
            String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

        const headerNorm = normalizeForMatch(headerText);

        for (const exp of ragProfile.experiences) {
            const ragPoste = normalizeForMatch(exp.poste || exp.titre || "");
            const ragEntreprise = normalizeForMatch(exp.entreprise || exp.client || "");

            // Match si le header contient le poste ET l'entreprise
            if (ragPoste && ragEntreprise &&
                headerNorm.includes(ragPoste.substring(0, Math.min(20, ragPoste.length))) &&
                headerNorm.includes(ragEntreprise.substring(0, Math.min(15, ragEntreprise.length)))) {
                return exp;
            }

            // Match si le header contient juste le poste (pour les postes uniques)
            if (ragPoste && ragPoste.length > 10 &&
                headerNorm.includes(ragPoste.substring(0, Math.min(30, ragPoste.length)))) {
                return exp;
            }
        }
    }

    return null;
}

/**
 * [AUDIT FIX IMPORTANT-6] : Normalise et formate une date pour affichage
 */
export function formatDate(dateStr: string | undefined): string {
    if (!dateStr) return "";

    // Si déjà au format "YYYY-MM", retourner tel quel
    if (/^\d{4}-\d{2}$/.test(dateStr)) {
        return dateStr;
    }

    // Si format ISO, extraire YYYY-MM
    const isoMatch = dateStr.match(/^(\d{4})-(\d{2})/);
    if (isoMatch) {
        return `${isoMatch[1]}-${isoMatch[2]}`;
    }

    // Si juste une année
    const yearMatch = dateStr.match(/^(\d{4})$/);
    if (yearMatch) {
        return `${yearMatch[1]}-01`;
    }

    return dateStr;
}

// ============================================================================
// WIDGET HELPERS
// ============================================================================

/**
 * Normalise et clamp un score entre 0 et 100
 */
export function clampScore(value: any): number {
    const n = typeof value === "number" ? value : parseFloat(value);
    if (Number.isNaN(n)) return 0;
    return Math.max(0, Math.min(100, Math.round(n)));
}

/**
 * Extrait le texte d'un widget de manière sécurisée
 */
export function extractWidgetText(widget: AIWidget): string {
    return (widget.text || "").trim();
}
