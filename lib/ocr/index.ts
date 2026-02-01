/**
 * OCR Module - Index
 * 
 * [CDC Sprint 1.2] Support des CV scannés
 */

export {
    extractTextFromImage,
    createOCRWorker,
    isOCRResultValid,
    cleanOCRText,
    isSupportedImageType,
    detectImageType,
    SUPPORTED_MIME_TYPES,
    MIN_CONFIDENCE,
    MAX_IMAGE_SIZE,
    DEFAULT_LANGUAGES,
} from './tesseract-ocr';

export type { OCROptions, OCRResult } from './tesseract-ocr';
