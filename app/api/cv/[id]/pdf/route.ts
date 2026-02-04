import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { createSupabaseUserClient, requireSupabaseUser } from "@/lib/supabase";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function toSafeFilenamePart(value: string): string {
    return value
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9._-]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .slice(0, 80);
}

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    let browser;

    try {
        const auth = await requireSupabaseUser(request);
        if (auth.error || !auth.user || !auth.token) {
            return NextResponse.json({ error: "Non autorise" }, { status: 401 });
        }

        const { id } = params;
        const { searchParams } = new URL(request.url);
        const format = searchParams.get("format") || "A4";
        const requestedTemplate = searchParams.get("template");
        const requestedColorway = searchParams.get("colorway");
        const requestedFont = searchParams.get("font");
        const requestedDensity = searchParams.get("density");
        const requestedPhoto = searchParams.get("photo");

        if (!["A4", "Letter"].includes(format)) {
            return NextResponse.json(
                { error: "Invalid format. Use A4 or Letter" },
                { status: 400 }
            );
        }

        const supabase = createSupabaseUserClient(auth.token);
        const { data: cvData, error: dbError } = await supabase
            .from("cv_generations")
            .select("*")
            .eq("id", id)
            .eq("user_id", auth.user.id)
            .single();

        if (dbError || !cvData) {
            return NextResponse.json(
                { error: "CV not found" },
                { status: 404 }
            );
        }

        logger.debug("Generating PDF", { cvId: id, format, userId: auth.user.id });

        const isLocal = process.env.NODE_ENV === "development";

        // A4: 210mm x 297mm, Letter: 215.9mm x 279.4mm
        const viewportWidth = 794; // A4 width at 96dpi
        const viewportHeight = format === "Letter" ? 1056 : 1123;

        if (isLocal) {
            browser = await puppeteer.launch({
                headless: true,
                args: [
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-gpu",
                    "--font-render-hinting=none",
                ],
            });
        } else {
            const executablePath = await chromium.executablePath();
            browser = await puppeteer.launch({
                args: [
                    ...chromium.args,
                    "--font-render-hinting=none",
                    "--disable-gpu",
                ],
                executablePath: executablePath,
                headless: true,
                defaultViewport: null,
            });
        }

        const page = await browser.newPage();

        // Set viewport to exact page dimensions for accurate rendering
        await page.setViewport({
            width: viewportWidth,
            height: viewportHeight,
            deviceScaleFactor: 2, // Retina for crisp text
        });

        await page.setExtraHTTPHeaders({
            Authorization: `Bearer ${auth.token}`,
        });

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
            `${request.nextUrl.protocol}//${request.nextUrl.host}`;
        const templateName = requestedTemplate || cvData.template_name || "modern";
        const includePhoto = requestedPhoto === "false" ? false : true;
        const extraParams = new URLSearchParams();
        if (requestedColorway) extraParams.set("colorway", requestedColorway);
        if (requestedFont) extraParams.set("font", requestedFont);
        if (requestedDensity) extraParams.set("density", requestedDensity);
        extraParams.set("photo", includePhoto ? "true" : "false");
        const printUrl = `${baseUrl}/dashboard/cv/${id}/print?format=${format}&template=${encodeURIComponent(
            templateName
        )}&${extraParams.toString()}`;

        logger.debug("Navigating to print page", { printUrl, cvId: id });

        if (typeof (page as any).setDefaultNavigationTimeout === "function") {
            await (page as any).setDefaultNavigationTimeout(45000);
        }
        await page.goto(printUrl, {
            waitUntil: "domcontentloaded",
            timeout: 45000,
        });

        // Wait for CV render completion signal (includes font + image loading)
        try {
            await page.waitForFunction(
                () => (window as any).__CV_RENDER_COMPLETE__ === true,
                { timeout: 15000 }
            );
            logger.debug("CV render complete signal received", { cvId: id });
        } catch (timeoutError) {
            logger.warn("CV render timeout - proceeding anyway", { cvId: id });
        }

        // Wait for all fonts to finish loading in the page
        try {
            await page.evaluate(() => document.fonts.ready);
        } catch {
            // Font Loading API may not be available
        }

        // Final layout stabilization
        await new Promise(resolve => setTimeout(resolve, 300));

        await page.emulateMediaType("print");

        logger.debug("Generating PDF buffer", { cvId: id, format });

        const pdfBuffer = await page.pdf({
            format: format === "Letter" ? "Letter" : "A4",
            printBackground: true,
            margin: {
                top: '0mm',
                right: '0mm',
                bottom: '0mm',
                left: '0mm',
            },
            preferCSSPageSize: true,
            omitBackground: false,
            displayHeaderFooter: false,
            scale: 1,
        });

        logger.info("PDF generated successfully", { cvId: id, sizeBytes: pdfBuffer.length, format });

        await browser.close();
        browser = undefined;

        const firstName = typeof cvData.cv_data?.profil?.prenom === "string" ? cvData.cv_data.profil.prenom : "";
        const lastName = typeof cvData.cv_data?.profil?.nom === "string" ? cvData.cv_data.profil.nom : "";
        const safeFirst = toSafeFilenamePart(firstName);
        const safeLast = toSafeFilenamePart(lastName);
        const fileName = safeFirst || safeLast ? `CV_${safeFirst}_${safeLast}.pdf`.replace(/_+\.pdf$/, ".pdf") : `CV_${id}.pdf`;

        return new NextResponse(Buffer.from(pdfBuffer), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${fileName}"`,
                "Cache-Control": "private, no-store",
                "Pragma": "no-cache",
                "Vary": "Authorization",
                "X-Content-Type-Options": "nosniff",
            },
        });

    } catch (error: any) {
        logger.error("PDF generation error", { error: error.message, stack: error.stack, cvId: params?.id });
        return NextResponse.json(
            {
                error: "Failed to generate PDF",
                details: error.message
            },
            { status: 500 }
        );
    } finally {
        if (browser) {
            try { await browser.close(); } catch {}
        }
    }
}
