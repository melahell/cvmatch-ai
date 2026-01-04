import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { createClient } from "@supabase/supabase-js";

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

        // Return PDF as download
        return new NextResponse(Buffer.from(pdfBuffer), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${fileName}"`,
                "Cache-Control": "no-cache, no-store, must-revalidate",
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
