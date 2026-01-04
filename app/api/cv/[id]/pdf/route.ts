import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { createClient } from "@supabase/supabase-js";
import { PDFCache } from "@/lib/cv/pdf-cache";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Maximum execution time for Vercel

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const { searchParams } = new URL(request.url);
        const format = searchParams.get("format") || "A4";

        // Validate format
        if (!["A4", "Letter"].includes(format)) {
            return NextResponse.json(
                { error: "Invalid format. Use A4 or Letter" },
                { status: 400 }
            );
        }

        // Verify CV exists in database
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data: cvData, error: dbError } = await supabase
            .from("cv_generations")
            .select("*")
            .eq("id", id)
            .single();

        if (dbError || !cvData) {
            return NextResponse.json(
                { error: "CV not found" },
                { status: 404 }
            );
        }

        // Check cache first (skip cache in dev for easier testing)
        const isProduction = process.env.NODE_ENV === "production";

        if (isProduction) {
            try {
                const cache = new PDFCache();
                const cachedPDF = await cache.getCachedPDF(id, format as "A4" | "Letter");

                if (cachedPDF) {
                    console.log(`✅ PDF Cache HIT for CV ${id} (${format})`);

                    const fileName = cvData.cv_data?.profil?.nom
                        ? `CV_${cvData.cv_data.profil.prenom}_${cvData.cv_data.profil.nom}.pdf`
                        : `CV_${id}.pdf`;

                    return new NextResponse(Buffer.from(cachedPDF), {
                        headers: {
                            "Content-Type": "application/pdf",
                            "Content-Disposition": `attachment; filename="${fileName}"`,
                            "Cache-Control": "public, max-age=86400", // 24h browser cache
                            "X-Cache-Status": "HIT",
                        },
                    });
                }

                console.log(`⚠️ PDF Cache MISS for CV ${id} (${format}) - Generating...`);
            } catch (cacheError) {
                console.error("Cache check error:", cacheError);
                // Continue to generation if cache fails
            }
        }

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
            browser = await puppeteer.launch({
                args: chromium.args,
                executablePath: await chromium.executablePath(),
                headless: true,
            });
        }

        const page = await browser.newPage();

        // Build the URL for the print page
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
                       `${request.nextUrl.protocol}//${request.nextUrl.host}`;
        const printUrl = `${baseUrl}/dashboard/cv/${id}/print?format=${format}`;

        // Navigate to the print page
        await page.goto(printUrl, {
            waitUntil: "networkidle0",
            timeout: 30000,
        });

        // Wait a bit more to ensure all fonts and styles are loaded
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Generate PDF
        const pdfBuffer = await page.pdf({
            format: format === "Letter" ? "Letter" : "A4",
            printBackground: true,
            margin: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
            },
            preferCSSPageSize: true,
        });

        await browser.close();

        // Get profile name for filename
        const fileName = cvData.cv_data?.profil?.nom
            ? `CV_${cvData.cv_data.profil.prenom}_${cvData.cv_data.profil.nom}.pdf`
            : `CV_${id}.pdf`;

        // Store in cache for future requests (fire-and-forget in production)
        if (isProduction) {
            const cache = new PDFCache();
            cache.storePDF(id, format as "A4" | "Letter", pdfBuffer)
                .then(() => console.log(`💾 PDF cached successfully for CV ${id} (${format})`))
                .catch(err => console.error("Cache store error:", err));
        }

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
        console.error("PDF Generation Error:", error);
        return NextResponse.json(
            {
                error: "Failed to generate PDF",
                details: error.message
            },
            { status: 500 }
        );
    }
}
