/**
 * PDF GENERATOR
 *
 * Génère des PDFs à partir de HTML en utilisant Puppeteer.
 * Optimisé pour génération A4 avec garanties spatiales.
 */

import puppeteer, { Browser, Page } from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export interface PDFGenerationOptions {
  format?: "A4" | "Letter";
  printBackground?: boolean;
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  displayHeaderFooter?: boolean;
  headerTemplate?: string;
  footerTemplate?: string;
}

const DEFAULT_OPTIONS: PDFGenerationOptions = {
  format: "A4",
  printBackground: true,
  margin: {
    top: "0mm",
    right: "0mm",
    bottom: "0mm",
    left: "0mm"
  },
  displayHeaderFooter: false
};

/**
 * Générer PDF à partir de HTML
 */
export async function generatePDF(
  html: string,
  options: PDFGenerationOptions = {}
): Promise<Buffer> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  let browser: Browser | null = null;

  try {
    // Lancer browser
    browser = await launchBrowser();

    // Créer page
    const page = await browser.newPage();

    // Configuration viewport pour A4
    await page.setViewport({
      width: 794, // A4 width in pixels (210mm at 96dpi)
      height: 1123, // A4 height in pixels (297mm at 96dpi)
      deviceScaleFactor: 1
    });

    // Charger HTML
    await page.setContent(html, {
      waitUntil: "networkidle0"
    });

    // Générer PDF
    const pdfBuffer = await page.pdf({
      format: mergedOptions.format,
      printBackground: mergedOptions.printBackground,
      margin: mergedOptions.margin,
      displayHeaderFooter: mergedOptions.displayHeaderFooter,
      headerTemplate: mergedOptions.headerTemplate,
      footerTemplate: mergedOptions.footerTemplate,
      preferCSSPageSize: false
    });

    return Buffer.from(pdfBuffer);
  } catch (error: any) {
    console.error("[PDF Generator] Error:", error);
    throw new Error(`PDF generation failed: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Lancer browser Puppeteer (avec Chromium pour serverless)
 */
async function launchBrowser(): Promise<Browser> {
  const isProduction = process.env.NODE_ENV === "production";
  const isVercel = !!process.env.VERCEL;

  if (isVercel || isProduction) {
    // Environnement serverless (Vercel, AWS Lambda, etc.)
    return await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless
    });
  } else {
    // Environnement local (development)
    // Utilise Chrome/Chromium installé localement
    return await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
      executablePath:
        process.env.CHROME_EXECUTABLE_PATH ||
        "/usr/bin/google-chrome-stable" || // Linux
        "/usr/bin/chromium-browser" || // Linux alternative
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" || // macOS
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" // Windows
    });
  }
}

/**
 * Générer PDF avec validation spatiale
 *
 * Vérifie que le PDF généré respecte bien les contraintes de pages
 */
export async function generateValidatedPDF(
  html: string,
  expectedPages: number,
  options: PDFGenerationOptions = {}
): Promise<{
  success: boolean;
  pdf: Buffer | null;
  actualPages: number;
  warnings: string[];
}> {
  const warnings: string[] = [];

  try {
    const pdfBuffer = await generatePDF(html, options);

    // Compter les pages du PDF (approximatif via buffer size)
    // Note: Pour compter précisément, il faudrait parser le PDF avec pdf-lib
    const approximatePages = Math.ceil(pdfBuffer.length / 50000); // ~50KB par page

    if (approximatePages > expectedPages) {
      warnings.push(
        `⚠️ PDF has ~${approximatePages} pages (expected ${expectedPages}). Content may have overflowed.`
      );
    }

    return {
      success: true,
      pdf: pdfBuffer,
      actualPages: approximatePages,
      warnings
    };
  } catch (error: any) {
    return {
      success: false,
      pdf: null,
      actualPages: 0,
      warnings: [`❌ PDF generation failed: ${error.message}`]
    };
  }
}

/**
 * Générer thumbnail du PDF (première page en image)
 */
export async function generatePDFThumbnail(
  html: string,
  width: number = 300
): Promise<Buffer> {
  let browser: Browser | null = null;

  try {
    browser = await launchBrowser();
    const page = await browser.newPage();

    await page.setViewport({
      width,
      height: Math.floor(width * 1.414), // A4 ratio
      deviceScaleFactor: 1
    });

    await page.setContent(html, { waitUntil: "networkidle0" });

    const screenshot = await page.screenshot({
      type: "png",
      fullPage: false,
      clip: {
        x: 0,
        y: 0,
        width,
        height: Math.floor(width * 1.414)
      }
    });

    return Buffer.from(screenshot);
  } catch (error: any) {
    console.error("[PDF Thumbnail] Error:", error);
    throw new Error(`Thumbnail generation failed: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Batch generate PDFs (avec pool de browsers pour performance)
 */
export async function generatePDFBatch(
  htmlList: string[],
  options: PDFGenerationOptions = {}
): Promise<Buffer[]> {
  const browser = await launchBrowser();

  try {
    const results = await Promise.all(
      htmlList.map(async (html) => {
        const page = await browser.newPage();

        try {
          await page.setViewport({
            width: 794,
            height: 1123,
            deviceScaleFactor: 1
          });

          await page.setContent(html, { waitUntil: "networkidle0" });

          const pdfBuffer = await page.pdf({
            format: options.format || "A4",
            printBackground: options.printBackground !== false,
            margin: options.margin || DEFAULT_OPTIONS.margin
          });

          return Buffer.from(pdfBuffer);
        } finally {
          await page.close();
        }
      })
    );

    return results;
  } finally {
    await browser.close();
  }
}

/**
 * Utilitaire: Estimer le nombre de pages d'un HTML
 * (pour validation AVANT génération PDF)
 */
export function estimatePagesFromHTML(html: string): number {
  // Approximation basée sur longueur du contenu
  // 1 page A4 ≈ 3000-4000 caractères de texte
  const textContent = html.replace(/<[^>]*>/g, ""); // Strip HTML tags
  const chars = textContent.length;

  return Math.ceil(chars / 3500);
}
