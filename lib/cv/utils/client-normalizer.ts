/**
 * Client Normalizer Utils
 * 
 * [CDC Sprint 2.6] Extrait depuis ai-adapter.ts
 * 
 * Utilitaires pour normaliser et nettoyer les noms de clients.
 */

// ============================================================================
// NORMALIZATION
// ============================================================================

/**
 * Normalise une clé pour comparaison (lowercase, trim, supprime caractères spéciaux)
 */
export const normalizeKey = (value: unknown): string =>
    String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ")
        .replace(/[^\p{L}\p{N}\s&''.\-]/gu, "");

/**
 * Normalise un nom de client avec casing intelligent
 * - Préserve les acronymes (ex: "IBM", "BNPP")
 * - Capitalise correctement les noms (ex: "société générale" → "Société Générale")
 */
export const normalizeClientName = (value: unknown): string => {
    const raw = String(value ?? "").trim();
    if (!raw) return "";

    const cleaned = raw
        // Normaliser les espaces
        .replace(/[\u00A0]/g, " ")
        .replace(/\s+/g, " ")
        // Supprimer les puces et tirets en début/fin
        .replace(/^[-–—•·\s]+|[-–—•·\s]+$/g, "")
        // Supprimer les mentions (confidentiel)
        .replace(/\s*\((confidentiel|n\/a|na|nc)\)\s*/gi, "")
        .trim();

    if (!cleaned) return "";

    // Vérifier si c'est un acronyme (tout en majuscules, court)
    const upper = cleaned.toUpperCase();
    const isAcronym =
        cleaned.length <= 10 &&
        /[A-Z]/.test(cleaned) &&
        cleaned === upper &&
        !/[a-z]/.test(cleaned);

    if (isAcronym) return cleaned;

    // Capitaliser chaque mot intelligemment
    const words = cleaned.split(" ");
    const cased = words
        .map((w) => {
            if (!w) return w;
            // Préserver les acronymes dans les mots
            if (/^[A-Z0-9&''.\-]{2,}$/.test(w) && !/[a-z]/.test(w)) return w;
            // Capitaliser normalement
            const head = w[0]?.toUpperCase() ?? "";
            return head + w.slice(1).toLowerCase();
        })
        .join(" ");

    return cased;
};

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Vérifie si un nom de client est invalide/générique
 */
export const isBadClientName = (name: string): boolean => {
    const key = normalizeKey(name);

    // Vide ou trop court
    if (!key) return true;
    if (key.length < 2) return true;

    // Noms génériques
    if (key === "client" || key === "clients" || key === "references") return true;

    // Mentions de confidentialité
    if (key.includes("confidentiel") || key.includes("nda") || key.includes("n a")) return true;

    // Descriptions génériques
    if (key.startsWith("entreprise ") || key.startsWith("societe ") || key.startsWith("company ")) return true;

    // Client numéroté (ex: "Client 1", "Client 2")
    if (/^client\s*\d+$/.test(key)) return true;

    // Caractères HTML
    if (/[<>]/.test(name)) return true;

    // Trop de chiffres (probablement un ID ou code)
    const digits = (name.match(/\d/g) || []).length;
    if (digits >= 5) return true;

    return false;
};

// ============================================================================
// CLEANING
// ============================================================================

export interface CleanClientListOptions {
    /** Clients à exclure */
    exclude?: string[];
    /** Nombre maximum de clients à retourner */
    max?: number;
}

/**
 * Nettoie et dédoublonne une liste de clients
 * - Normalise les noms
 * - Supprime les invalides
 * - Dédoublonne par clé normalisée
 * - Trie par fréquence puis alphabétique
 */
export const cleanClientList = (
    items: unknown[],
    options?: CleanClientListOptions
): string[] => {
    const excludeKeys = new Set(
        (options?.exclude || [])
            .map(normalizeKey)
            .filter(Boolean)
    );

    const counts = new Map<string, { label: string; count: number }>();

    for (const item of items) {
        // Extraire le nom du client
        const label = normalizeClientName(
            typeof item === "string"
                ? item
                : (item as { nom?: string; name?: string })?.nom ??
                (item as { nom?: string; name?: string })?.name
        );

        if (!label) continue;
        if (isBadClientName(label)) continue;

        const key = normalizeKey(label);
        if (!key) continue;
        if (excludeKeys.has(key)) continue;

        // Compter et garder le meilleur label
        const prev = counts.get(key);
        if (!prev) {
            counts.set(key, { label, count: 1 });
        } else {
            counts.set(key, {
                label: prev.label.length >= label.length ? prev.label : label,
                count: prev.count + 1
            });
        }
    }

    // Trier par fréquence décroissante, puis alphabétique
    const sorted = Array.from(counts.values())
        .sort((a, b) => (b.count - a.count) || a.label.localeCompare(b.label, "fr"))
        .map((x) => x.label);

    const max = options?.max ?? 30;
    return sorted.slice(0, max);
};

// ============================================================================
// EXPORTS
// ============================================================================

const clientNormalizer = {
    normalizeKey,
    normalizeClientName,
    isBadClientName,
    cleanClientList,
};

export default clientNormalizer;
