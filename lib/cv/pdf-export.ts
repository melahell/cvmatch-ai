/**
 * PDF Export Natif Navigateur - Export via CSS Print
 *
 * Utilise window.print() du navigateur pour générer un PDF instantané
 * sans serveur. Les templates CV ont déjà les styles @media print optimisés.
 *
 * Avantage : Export instantané (<500ms), pas de serveur, pas de Puppeteer
 *
 * Inspiré de recup.md : "Export : Bouton 'Imprimer en PDF' (natif navigateur)"
 */

/**
 * Payload stocké temporairement pour une impression via une page dédiée /print.
 */
import type { CVDensity } from "@/lib/cv/style/density";

export type PrintPayload = {
    data: any;
    templateId: string;
    includePhoto?: boolean;
    colorwayId?: string;
    fontId?: string;
    density?: CVDensity;
    format?: "A4" | "Letter";
    customCSS?: string;
};

const STORAGE_PREFIX = "cvcrush:print:";
/** Max age for print tokens in localStorage (5 minutes) */
const MAX_TOKEN_AGE_MS = 5 * 60 * 1000;

function createToken(): string {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Clean up stale print tokens from localStorage.
 * Tokens encode their creation timestamp in base36 before the dash,
 * so we can determine age without parsing the payload.
 */
function cleanupStaleTokens(): void {
    try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < window.localStorage.length; i++) {
            const key = window.localStorage.key(i);
            if (!key?.startsWith(STORAGE_PREFIX)) continue;

            const token = key.slice(STORAGE_PREFIX.length);
            const timestampPart = token.split("-")[0];
            const createdAt = parseInt(timestampPart, 36);

            if (isNaN(createdAt) || Date.now() - createdAt > MAX_TOKEN_AGE_MS) {
                keysToRemove.push(key);
            }
        }
        for (const key of keysToRemove) {
            window.localStorage.removeItem(key);
        }
    } catch {
        // Ignore errors during cleanup
    }
}

export function openPrintPage(url: string): void {
    if (typeof window === "undefined") {
        return;
    }

    const win = window.open(url, "_blank", "noopener,noreferrer");
    if (!win) {
        window.location.href = url;
        return;
    }
}

export function openPrintPreview(routePath: string, payload: PrintPayload): void {
    if (typeof window === "undefined") {
        return;
    }

    // Clean up any stale tokens from previous exports
    cleanupStaleTokens();

    const token = createToken();
    const storageKey = `${STORAGE_PREFIX}${token}`;

    const safePayload: PrintPayload = {
        data: payload.data,
        templateId: payload.templateId,
        includePhoto: payload.includePhoto ?? true,
        colorwayId: payload.colorwayId,
        fontId: payload.fontId,
        density: payload.density,
        format: payload.format ?? "A4",
        customCSS: payload.customCSS,
    };

    window.localStorage.setItem(storageKey, JSON.stringify(safePayload));

    const url = `${routePath}?token=${encodeURIComponent(token)}&autoprint=1`;
    openPrintPage(url);
}
