import { NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
    const supabase = createSupabaseClient();

    try {
        const { cvId } = await req.json();

        if (!cvId) {
            return NextResponse.json({ error: "Missing cvId" }, { status: 400 });
        }

        // 1. Fetch CV data
        const { data: cvData, error: cvError } = await supabase
            .from("cv_generations")
            .select("*")
            .eq("id", cvId)
            .single();

        if (cvError || !cvData) {
            return NextResponse.json({ error: "CV not found" }, { status: 404 });
        }

        // 2. Launch Puppeteer
        const browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: { width: 1920, height: 1080 },
            executablePath: await chromium.executablePath(),
            headless: true,
        });

        const page = await browser.newPage();

        // 3. Navigate to CV preview page
        const cvUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://cvmatch-ai-prod.vercel.app'}/dashboard/cv/${cvId}`;
        await page.goto(cvUrl, { waitUntil: 'networkidle0', timeout: 30000 });

        // 4. Wait for CV to render
        await page.waitForSelector('.cv-page', { timeout: 10000 });

        // 5. Generate PDF
        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: 0, right: 0, bottom: 0, left: 0 }
        });

        await browser.close();

        // 6. Upload to Supabase Storage
        const fileName = `cv_${cvId}_${Date.now()}.pdf`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('cvs')
            .upload(fileName, pdf, {
                contentType: 'application/pdf',
                upsert: true
            });

        if (uploadError) {
            console.error("Upload error:", uploadError);
            return NextResponse.json({ error: "Failed to upload PDF" }, { status: 500 });
        }

        // 7. Get public URL
        const { data: urlData } = supabase.storage
            .from('cvs')
            .getPublicUrl(fileName);

        // 8. Update CV record
        await supabase
            .from("cv_generations")
            .update({ cv_url: urlData.publicUrl })
            .eq("id", cvId);

        return NextResponse.json({
            success: true,
            pdfUrl: urlData.publicUrl
        });

    } catch (error: any) {
        console.error("PDF Generation Error:", error);
        return NextResponse.json({
            error: error.message
        }, { status: 500 });
    }
}
