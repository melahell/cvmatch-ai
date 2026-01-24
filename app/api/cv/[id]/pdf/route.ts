import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { createSupabaseUserClient, requireSupabaseUser } from "@/lib/supabase";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Maximum execution time for Vercel

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const auth = await requireSupabaseUser(request);
        if (auth.error || !auth.user || !auth.token) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { id } = params;
        const { searchParams } = new URL(request.url);
        const format = searchParams.get("format") || "A4";
        const requestedTemplate = searchParams.get("template");
        const requestedPhoto = searchParams.get("photo");

        // Validate format
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

        // PDF caching removed (pdf-cache.ts deleted in cleanup)
        logger.debug("Generating PDF", { cvId: id, format, userId: auth.user.id });

        // Determine if running locally or on Vercel
        const isLocal = process.env.NODE_ENV === "development";

        let browser;

        if (isLocal) {
            // For local development, use locally installed Chrome
            browser = await puppeteer.launch({
                headless: true,
                args: ["--no-sandbox", "--disable-setuid-sandbox"],
            });
        } else {
            // For production (Vercel), use Sparticuz Chromium
            const executablePath = await chromium.executablePath();

            browser = await puppeteer.launch({
                args: chromium.args,
                executablePath: executablePath,
                headless: true,
                defaultViewport: { width: 1920, height: 1080 },
            });
        }

        const page = await browser.newPage();

        await page.setExtraHTTPHeaders({
            Authorization: `Bearer ${auth.token}`,
        });

        // Build the URL for the print page
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
            `${request.nextUrl.protocol}//${request.nextUrl.host}`;
        const templateName = requestedTemplate || cvData.template_name || "modern";
        const includePhoto = requestedPhoto === "false" ? false : true;
        const printUrl = `${baseUrl}/dashboard/cv/${id}/print?format=${format}&template=${encodeURIComponent(
            templateName
        )}&photo=${includePhoto ? "true" : "false"}`;

        // Navigate to the print page
        logger.debug("Navigating to print page", { printUrl, cvId: id });

        await page.goto(printUrl, {
            waitUntil: "networkidle0",
            timeout: 30000,
        });

        // Wait for CV render completion signal (with timeout)
        try {
            await page.waitForFunction(
                () => (window as any).__CV_RENDER_COMPLETE__ === true,
                { timeout: 10000 }
            );
            logger.debug("CV render complete signal received", { cvId: id });
        } catch (timeoutError) {
            logger.warn("CV render timeout - proceeding anyway", { cvId: id, timeout: 10000 });
        }

        // Additional safety delay for final layout
        await new Promise(resolve => setTimeout(resolve, 500));

        // Generate PDF with optimized settings
        logger.debug("Generating PDF buffer", { cvId: id, format });

        const pdfBuffer = await page.pdf({
            format: format === "Letter" ? "Letter" : "A4",
            printBackground: true,
            margin: {
                top: '3mm',
                right: '0mm',
                bottom: '3mm',
                left: '0mm',
            },
            preferCSSPageSize: false, // Let puppeteer control page size
            // Improve text rendering
            omitBackground: false,
            displayHeaderFooter: false,
            scale: 1,
        });

        logger.info("PDF generated successfully", { cvId: id, sizeBytes: pdfBuffer.length, format });

        await browser.close();

        // Get profile name for filename
        const fileName = cvData.cv_data?.profil?.nom
            ? `CV_${cvData.cv_data.profil.prenom}_${cvData.cv_data.profil.nom}.pdf`
            : `CV_${id}.pdf`;

        // PDF cache storage removed (pdf-cache.ts deleted in cleanup)

        // Return PDF as download
        return new NextResponse(Buffer.from(pdfBuffer), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${fileName}"`,
                "Cache-Control": "public, max-age=3600", // 1h browser cache
                "X-Cache-Status": "MISS",
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
    }
}
