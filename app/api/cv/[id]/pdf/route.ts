import { NextRequest, NextResponse } from "next/server";
import puppeteer, { type Browser } from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { createSupabaseUserClient, requireSupabaseUser } from "@/lib/supabase";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Maximum execution time for Vercel

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    let browser: Browser | undefined;
    try {
        const { id } = params;
        const { searchParams } = new URL(request.url);
        const format = searchParams.get("format") || "A4";
        const templateParam = searchParams.get("template") || "modern";
        const template = /^[a-z0-9_-]+$/i.test(templateParam) ? templateParam : "modern";
        const photoQuery = searchParams.get("photo") === "false" ? "false" : "true";

        // Validate format
        if (!["A4", "Letter"].includes(format)) {
            return NextResponse.json(
                { error: "Invalid format. Use A4 or Letter" },
                { status: 400 }
            );
        }

        const auth = await requireSupabaseUser(request);
        if (auth.error || !auth.user || !auth.token) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const supabase = createSupabaseUserClient(auth.token);
        const userId = auth.user.id;

        const { data: cvData, error: dbError } = await supabase
            .from("cv_generations")
            .select("*")
            .eq("id", id)
            .eq("user_id", userId)
            .single();

        if (dbError || !cvData) {
            return NextResponse.json(
                { error: "CV not found" },
                { status: 404 }
            );
        }

        // PDF caching removed (pdf-cache.ts deleted in cleanup)
        logger.info("PDF génération démarrée", { cvId: id, format, template, photo: photoQuery });

        // Determine if running locally or on Vercel
        const isLocal = process.env.NODE_ENV === "development";

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

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (!supabaseUrl) {
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        await page.evaluateOnNewDocument(
            (supabaseUrlArg: string, accessToken: string, user: any) => {
                const hostname = new URL(supabaseUrlArg).hostname;
                const projectRef = hostname.split('.')[0];
                const storageKey = `sb-${projectRef}-auth-token`;
                const expiresAt = Math.floor(Date.now() / 1000) + 60 * 30;

                const session = {
                    access_token: accessToken,
                    token_type: 'bearer',
                    expires_in: 60 * 30,
                    expires_at: expiresAt,
                    refresh_token: '',
                    user,
                };

                localStorage.setItem(storageKey, JSON.stringify(session));
            },
            supabaseUrl,
            auth.token,
            auth.user
        );

        // Build the URL for the print page
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
            `${request.nextUrl.protocol}//${request.nextUrl.host}`;
        const printUrl = `${baseUrl}/dashboard/cv/${id}/print?format=${encodeURIComponent(format)}&template=${encodeURIComponent(template)}&photo=${encodeURIComponent(photoQuery)}`;

        // Navigate to the print page
        logger.info("PDF navigation print page", { cvId: id, format, template });

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
            logger.info("PDF rendu CV prêt", { cvId: id });
        } catch (timeoutError) {
            logger.warn("PDF timeout rendu CV", { cvId: id });
        }

        // Additional safety delay for final layout
        await new Promise(resolve => setTimeout(resolve, 500));

        // Generate PDF with optimized settings
        logger.info("PDF génération buffer", { cvId: id });

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

        logger.info("PDF généré", { cvId: id, bytes: pdfBuffer.length });

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
        logger.error("PDF Generation Error", { error: error?.message });
        return NextResponse.json(
            {
                error: "Failed to generate PDF",
                details: error.message
            },
            { status: 500 }
        );
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}
