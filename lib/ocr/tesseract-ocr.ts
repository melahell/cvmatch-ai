/**
 * OCR avec Tesseract.js
 * 
 * [CDC Sprint 1.2] Support des CV scannés (images)
 * 
 * Utilise Tesseract.js pour extraire le texte des images.
 * Supporte: PNG, JPEG, TIFF, BMP, GIF, WebP
 * Langues: Français + Anglais par défaut
 */

import Tesseract, { RecognizeResult, Worker } from 'tesseract.js';

// ============================================================================
// TYPES
// ============================================================================

export interface OCROptions {
    /** Langues pour la reconnaissance (default: ['fra', 'eng']) */
    languages?: string[];
    /** Niveau de log (0: silent, 1: errors, 2: warnings, 3: info) */
    logLevel?: number;
    /** Callback de progression (0-100) */
    onProgress?: (progress: number) => void;
}

export interface OCRResult {
    /** Texte extrait */
    text: string;
    /** Confiance moyenne (0-100) */
    confidence: number;
    /** Temps d'exécution en ms */
    durationMs: number;
    /** Langues détectées */
    detectedLanguages: string[];
    /** Nombre de mots détectés */
    wordCount: number;
    /** Erreur éventuelle */
    error?: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

/** Langues par défaut */
const DEFAULT_LANGUAGES = ['fra', 'eng'];

/** Confiance minimale pour considérer le texte valide */
const MIN_CONFIDENCE = 30;

/** Taille max d'image en bytes (10MB) */
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

// ============================================================================
// VALIDATION
// ============================================================================

/** Types MIME supportés pour l'OCR */
const SUPPORTED_MIME_TYPES = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/tiff',
    'image/bmp',
    'image/gif',
    'image/webp',
];

/**
 * Vérifie si un type MIME est supporté pour l'OCR
 */
export function isSupportedImageType(mimeType: string): boolean {
    return SUPPORTED_MIME_TYPES.includes(mimeType.toLowerCase());
}

/**
 * Détecte si un buffer ressemble à une image
 */
export function detectImageType(buffer: Buffer): string | null {
    if (buffer.length < 4) return null;

    // PNG
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
        return 'image/png';
    }
    // JPEG
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
        return 'image/jpeg';
    }
    // GIF
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
        return 'image/gif';
    }
    // BMP
    if (buffer[0] === 0x42 && buffer[1] === 0x4d) {
        return 'image/bmp';
    }
    // TIFF (little endian)
    if (buffer[0] === 0x49 && buffer[1] === 0x49 && buffer[2] === 0x2a && buffer[3] === 0x00) {
        return 'image/tiff';
    }
    // TIFF (big endian)
    if (buffer[0] === 0x4d && buffer[1] === 0x4d && buffer[2] === 0x00 && buffer[3] === 0x2a) {
        return 'image/tiff';
    }
    // WebP
    if (buffer.length >= 12 && 
        buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
        buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
        return 'image/webp';
    }

    return null;
}

// ============================================================================
// OCR FUNCTIONS
// ============================================================================

/**
 * Extrait le texte d'une image avec Tesseract.js
 * 
 * @example
 * ```typescript
 * const result = await extractTextFromImage(imageBuffer, {
 *     languages: ['fra', 'eng'],
 *     onProgress: (p) => console.log(`OCR: ${p}%`)
 * });
 * 
 * if (result.confidence > 50) {
 *     console.log(result.text);
 * }
 * ```
 */
export async function extractTextFromImage(
    imageInput: Buffer | string | Blob,
    options: OCROptions = {}
): Promise<OCRResult> {
    const {
        languages = DEFAULT_LANGUAGES,
        logLevel = 0,
        onProgress,
    } = options;

    const startTime = Date.now();

    try {
        // Validation taille
        if (imageInput instanceof Buffer && imageInput.length > MAX_IMAGE_SIZE) {
            return {
                text: '',
                confidence: 0,
                durationMs: Date.now() - startTime,
                detectedLanguages: [],
                wordCount: 0,
                error: `Image trop volumineuse (max ${MAX_IMAGE_SIZE / 1024 / 1024}MB)`,
            };
        }

        // Reconnaissance OCR
        const langString = languages.join('+');
        
        const result: RecognizeResult = await Tesseract.recognize(
            imageInput,
            langString,
            {
                logger: logLevel > 0 ? (m) => {
                    if (onProgress && m.status === 'recognizing text') {
                        onProgress(Math.round(m.progress * 100));
                    }
                } : undefined,
            }
        );

        const { data } = result;
        const text = data.text?.trim() || '';
        const confidence = data.confidence || 0;

        // Compter les mots
        const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;

        // Détecter les langues (basé sur les langues demandées)
        const detectedLanguages = languages;

        return {
            text,
            confidence,
            durationMs: Date.now() - startTime,
            detectedLanguages,
            wordCount,
        };

    } catch (error) {
        const message = error instanceof Error ? error.message : 'Erreur OCR inconnue';
        return {
            text: '',
            confidence: 0,
            durationMs: Date.now() - startTime,
            detectedLanguages: [],
            wordCount: 0,
            error: message,
        };
    }
}

/**
 * Extrait le texte avec un worker réutilisable (plus performant pour plusieurs images)
 */
export async function createOCRWorker(
    languages: string[] = DEFAULT_LANGUAGES
): Promise<{
    recognize: (image: Buffer | string) => Promise<OCRResult>;
    terminate: () => Promise<void>;
}> {
    const langString = languages.join('+');
    const worker = await Tesseract.createWorker(langString);

    return {
        recognize: async (image: Buffer | string): Promise<OCRResult> => {
            const startTime = Date.now();
            try {
                const result = await worker.recognize(image);
                const text = result.data.text?.trim() || '';
                
                return {
                    text,
                    confidence: result.data.confidence || 0,
                    durationMs: Date.now() - startTime,
                    detectedLanguages: languages,
                    wordCount: text ? text.split(/\s+/).filter(Boolean).length : 0,
                };
            } catch (error) {
                return {
                    text: '',
                    confidence: 0,
                    durationMs: Date.now() - startTime,
                    detectedLanguages: [],
                    wordCount: 0,
                    error: error instanceof Error ? error.message : 'Erreur OCR',
                };
            }
        },
        terminate: async () => {
            await worker.terminate();
        },
    };
}

/**
 * Vérifie si le résultat OCR est exploitable
 */
export function isOCRResultValid(result: OCRResult): boolean {
    return (
        !result.error &&
        result.confidence >= MIN_CONFIDENCE &&
        result.wordCount >= 10 // Au moins 10 mots
    );
}

/**
 * Nettoie le texte OCR (corrige les erreurs communes)
 */
export function cleanOCRText(text: string): string {
    return text
        // Normaliser les espaces
        .replace(/\s+/g, ' ')
        // Corriger les tirets cassés
        .replace(/(\w)-\s+(\w)/g, '$1$2')
        // Supprimer les caractères de contrôle
        .replace(/[\x00-\x1F\x7F]/g, '')
        // Normaliser les guillemets
        .replace(/[«»„"]/g, '"')
        .replace(/['']/g, "'")
        // Supprimer les lignes vides multiples
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
    SUPPORTED_MIME_TYPES,
    MIN_CONFIDENCE,
    MAX_IMAGE_SIZE,
    DEFAULT_LANGUAGES,
};
