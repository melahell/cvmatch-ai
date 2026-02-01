/**
 * Document Parsers - Index
 * 
 * [CDC Sprint 1.2] Support des formats de documents variés
 */

export {
    parseOfficeDocument,
    isOfficeDocument,
    getSupportedFormats,
    detectFormatFromMime,
    detectFormatFromFilename,
    detectFormatFromBuffer,
    isSupportedFormat,
    SUPPORTED_OFFICE_TYPES,
    SUPPORTED_EXTENSIONS,
} from './office-parser';

export type { 
    ParseResult, 
    DocumentMetadata, 
    DocumentFormat,
} from './office-parser';
