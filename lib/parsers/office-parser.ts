/**
 * Office Document Parser
 * 
 * [CDC Sprint 1.2] Support DOC/DOCX/RTF/ODT
 * 
 * Utilise:
 * - mammoth pour DOCX
 * - Extraction basique pour RTF
 * - Pour DOC/ODT: recommande conversion LibreOffice côté serveur
 */

import mammoth from 'mammoth';

// ============================================================================
// TYPES
// ============================================================================

export interface ParseResult {
    /** Texte extrait */
    text: string;
    /** Format du document */
    format: DocumentFormat;
    /** Métadonnées si disponibles */
    metadata?: DocumentMetadata;
    /** Avertissements */
    warnings: string[];
    /** Erreur éventuelle */
    error?: string;
}

export interface DocumentMetadata {
    title?: string;
    author?: string;
    createdAt?: string;
    modifiedAt?: string;
    wordCount?: number;
}

export type DocumentFormat = 'docx' | 'doc' | 'rtf' | 'odt' | 'unknown';

// ============================================================================
// CONFIGURATION
// ============================================================================

/** Types MIME supportés */
export const SUPPORTED_OFFICE_TYPES: Record<string, DocumentFormat> = {
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/msword': 'doc',
    'application/rtf': 'rtf',
    'text/rtf': 'rtf',
    'application/vnd.oasis.opendocument.text': 'odt',
};

/** Extensions supportées */
export const SUPPORTED_EXTENSIONS: Record<string, DocumentFormat> = {
    '.docx': 'docx',
    '.doc': 'doc',
    '.rtf': 'rtf',
    '.odt': 'odt',
};

// ============================================================================
// DETECTION
// ============================================================================

/**
 * Détecte le format d'un document depuis son type MIME
 */
export function detectFormatFromMime(mimeType: string): DocumentFormat {
    return SUPPORTED_OFFICE_TYPES[mimeType.toLowerCase()] || 'unknown';
}

/**
 * Détecte le format d'un document depuis son nom de fichier
 */
export function detectFormatFromFilename(filename: string): DocumentFormat {
    const ext = filename.toLowerCase().match(/\.[^.]+$/)?.[0] || '';
    return SUPPORTED_EXTENSIONS[ext] || 'unknown';
}

/**
 * Détecte le format d'un buffer en analysant les magic bytes
 */
export function detectFormatFromBuffer(buffer: Buffer): DocumentFormat {
    if (buffer.length < 4) return 'unknown';

    // DOCX (ZIP avec signature PK)
    if (buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04) {
        // Vérifier si c'est un DOCX en cherchant [Content_Types].xml
        const content = buffer.toString('utf8', 0, Math.min(1000, buffer.length));
        if (content.includes('word/') || content.includes('application/vnd.openxmlformats')) {
            return 'docx';
        }
        // Pourrait être un ODT
        if (content.includes('mimetype') || content.includes('opendocument')) {
            return 'odt';
        }
    }

    // DOC (OLE Compound Document)
    if (buffer[0] === 0xd0 && buffer[1] === 0xcf && buffer[2] === 0x11 && buffer[3] === 0xe0) {
        return 'doc';
    }

    // RTF
    if (buffer[0] === 0x7b && buffer[1] === 0x5c && buffer[2] === 0x72 && buffer[3] === 0x74) {
        return 'rtf';
    }

    return 'unknown';
}

/**
 * Vérifie si un format est supporté
 */
export function isSupportedFormat(format: DocumentFormat): boolean {
    return format !== 'unknown';
}

// ============================================================================
// PARSERS
// ============================================================================

/**
 * Parse un fichier DOCX avec mammoth
 */
async function parseDocx(buffer: Buffer): Promise<ParseResult> {
    try {
        const result = await mammoth.extractRawText({ buffer });
        
        return {
            text: result.value.trim(),
            format: 'docx',
            warnings: result.messages.map(m => m.message),
            metadata: {
                wordCount: result.value.split(/\s+/).filter(Boolean).length,
            },
        };
    } catch (error) {
        return {
            text: '',
            format: 'docx',
            warnings: [],
            error: error instanceof Error ? error.message : 'Erreur parsing DOCX',
        };
    }
}

/**
 * Parse un fichier RTF (extraction basique)
 */
function parseRtf(buffer: Buffer): ParseResult {
    try {
        const content = buffer.toString('utf8');
        
        // Extraction basique du texte RTF
        let text = content
            // Supprimer les groupes de contrôle RTF
            .replace(/\{[^{}]*\}/g, '')
            // Supprimer les codes de contrôle
            .replace(/\\[a-z]+\d*\s?/gi, ' ')
            // Supprimer les caractères spéciaux RTF
            .replace(/[\\{}]/g, '')
            // Normaliser les espaces
            .replace(/\s+/g, ' ')
            .trim();

        // Décoder les caractères Unicode RTF (\uNNNN)
        text = text.replace(/\\u(\d+)\?/g, (_, code) => {
            return String.fromCharCode(parseInt(code, 10));
        });

        return {
            text,
            format: 'rtf',
            warnings: ['Extraction RTF basique - certains formatages peuvent être perdus'],
            metadata: {
                wordCount: text.split(/\s+/).filter(Boolean).length,
            },
        };
    } catch (error) {
        return {
            text: '',
            format: 'rtf',
            warnings: [],
            error: error instanceof Error ? error.message : 'Erreur parsing RTF',
        };
    }
}

/**
 * Pour DOC et ODT - retourne une erreur avec suggestion
 */
function parseUnsupportedNatively(format: DocumentFormat): ParseResult {
    const suggestions: Record<string, string> = {
        'doc': 'Convertissez le fichier en DOCX ou utilisez LibreOffice côté serveur',
        'odt': 'Convertissez le fichier en DOCX ou utilisez LibreOffice côté serveur',
    };

    return {
        text: '',
        format,
        warnings: [],
        error: `Format ${format.toUpperCase()} non supporté nativement. ${suggestions[format] || ''}`,
    };
}

// ============================================================================
// API PRINCIPALE
// ============================================================================

/**
 * Parse un document Office et extrait son contenu textuel
 * 
 * @example
 * ```typescript
 * const result = await parseOfficeDocument(buffer, 'document.docx');
 * if (!result.error) {
 *     console.log(result.text);
 * }
 * ```
 */
export async function parseOfficeDocument(
    buffer: Buffer,
    filename?: string,
    mimeType?: string
): Promise<ParseResult> {
    // Détecter le format
    let format: DocumentFormat = 'unknown';
    
    if (mimeType) {
        format = detectFormatFromMime(mimeType);
    }
    
    if (format === 'unknown' && filename) {
        format = detectFormatFromFilename(filename);
    }
    
    if (format === 'unknown') {
        format = detectFormatFromBuffer(buffer);
    }

    if (format === 'unknown') {
        return {
            text: '',
            format: 'unknown',
            warnings: [],
            error: 'Format de document non reconnu',
        };
    }

    // Parser selon le format
    switch (format) {
        case 'docx':
            return parseDocx(buffer);
        case 'rtf':
            return parseRtf(buffer);
        case 'doc':
        case 'odt':
            return parseUnsupportedNatively(format);
        default:
            return {
                text: '',
                format,
                warnings: [],
                error: `Format ${format} non supporté`,
            };
    }
}

/**
 * Vérifie si un buffer est un document Office valide
 */
export function isOfficeDocument(buffer: Buffer): boolean {
    const format = detectFormatFromBuffer(buffer);
    return format !== 'unknown';
}

/**
 * Liste les formats supportés avec leur niveau de support
 */
export function getSupportedFormats(): Array<{
    format: DocumentFormat;
    extension: string;
    supported: 'full' | 'basic' | 'conversion_required';
    description: string;
}> {
    return [
        {
            format: 'docx',
            extension: '.docx',
            supported: 'full',
            description: 'Microsoft Word 2007+ (plein support via mammoth)',
        },
        {
            format: 'rtf',
            extension: '.rtf',
            supported: 'basic',
            description: 'Rich Text Format (extraction texte basique)',
        },
        {
            format: 'doc',
            extension: '.doc',
            supported: 'conversion_required',
            description: 'Microsoft Word 97-2003 (requiert conversion LibreOffice)',
        },
        {
            format: 'odt',
            extension: '.odt',
            supported: 'conversion_required',
            description: 'OpenDocument Text (requiert conversion LibreOffice)',
        },
    ];
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
    parseDocx,
    parseRtf,
};
