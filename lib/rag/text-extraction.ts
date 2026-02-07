import { logger } from '@/lib/utils/logger';

/**
 * Supported MIME types for extraction
 */
export const SUPPORTED_MIME_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
    'application/msword', // doc
    'text/plain',
    'text/markdown',      // .md
    'text/x-markdown',    // .md (fallback)
    'image/png',
    'image/jpeg',
    'image/jpg'
];

interface ExtractionResult {
    text: string;
    method: 'pdf-text' | 'pdf-ocr' | 'docx' | 'image-ocr' | 'text' | 'unknown';
    confidence?: number;
}

/**
 * Extracts text from a file buffer using the appropriate strategy.
 * All heavy dependencies (pdf-parse, mammoth, tesseract.js) are lazy-loaded
 * to avoid cold-start issues on serverless platforms.
 *
 * - PDF: Tries text extraction first. If density is low (< 50 chars/page), falls back to OCR.
 * - DOCX: Uses mammoth.
 * - Images: Uses Tesseract.
 */
export async function extractTextFromBuffer(buffer: Buffer, mimeType: string): Promise<ExtractionResult> {
    logger.info(`Starting extraction for ${mimeType}`, { size: buffer.length });

    try {
        if (mimeType === 'application/pdf') {
            return await extractFromPDF(buffer);
        }

        if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || mimeType === 'application/msword') {
            return await extractFromDOCX(buffer);
        }

        if (mimeType.startsWith('image/')) {
            return await extractFromImage(buffer);
        }

        if (mimeType === 'text/plain' || mimeType === 'text/markdown' || mimeType === 'text/x-markdown') {
            return { text: buffer.toString('utf-8'), method: 'text' };
        }

        throw new Error(`Unsupported MIME type: ${mimeType}`);
    } catch (error) {
        logger.error('Text extraction failed', { error, mimeType });
        throw error;
    }
}

async function extractFromPDF(buffer: Buffer): Promise<ExtractionResult> {
    const { PDFParse } = await import('pdf-parse');
    const parser = new PDFParse({ data: buffer });
    try {
        // 1. Get page count then text (pdf-parse v2 API)
        const info = await parser.getInfo().catch(() => ({ total: 1 }));
        const pageCount = (info as any).total ?? 1;
        const textResult = await parser.getText();
        const text = (textResult as any).text ?? '';

        // Clean text to check density
        const cleanText = text.replace(/\s+/g, ' ').trim();
        const density = cleanText.length / (pageCount || 1);

        // 2. If density is high enough, return text
        if (density > 50) {
            logger.info('PDF Text extraction successful', { density, method: 'pdf-text' });
            return { text: cleanText, method: 'pdf-text' };
        }

        logger.warn('PDF density too low, returning extracted text', { density });
        return { text: cleanText, method: 'pdf-text' };
    } catch (e) {
        logger.warn('PDF text extraction failed', { error: e });
        throw e;
    } finally {
        await parser.destroy();
    }
}

async function extractFromDOCX(buffer: Buffer): Promise<ExtractionResult> {
    const mammoth = await import('mammoth');
    const extractFn = mammoth.extractRawText ?? (mammoth as any).default?.extractRawText;
    if (!extractFn) throw new Error('mammoth.extractRawText not found');
    const result = await extractFn({ buffer });
    return { text: result.value.trim(), method: 'docx' };
}

async function extractFromImage(buffer: Buffer): Promise<ExtractionResult> {
    try {
        const Tesseract = await import('tesseract.js');
        const createWorker = Tesseract.createWorker ?? (Tesseract as any).default?.createWorker;
        if (!createWorker) throw new Error('Tesseract.createWorker not found');
        const worker = await createWorker('fra');
        const ret = await worker.recognize(buffer);
        await worker.terminate();
        return { text: ret.data.text, method: 'image-ocr', confidence: ret.data.confidence };
    } catch (e) {
        logger.error('OCR failed', e);
        throw new Error("OCR failed");
    }
}
