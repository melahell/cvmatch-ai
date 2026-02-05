import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient, requireSupabaseUser } from "@/lib/supabase";
import { logger } from "@/lib/utils/logger";
import { createPrinterSession, getPrinterAppUrl, type PrinterSession } from "@/lib/printer";
import { createRequestId } from "@/lib/request-id";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const tokenSchema = z.string().min(10).max(200);

function toSafeFilenamePart(value: string): string {
    return value
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9._-]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .slice(0, 80);
}

export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
    let printer: PrinterSession | null = null;
    const requestId = createRequestId();

    try {
        const auth = await requireSupabaseUser(request);
        if (auth.error || !auth.user || !auth.token) {
            return NextResponse.json({ error: "Non autorisé", requestId }, { status: 401 });
        }

        const tokenParsed = tokenSchema.safeParse(params.token);
        if (!tokenParsed.success) {
            return NextResponse.json({ error: "Token invalide", requestId }, { status: 400 });
        }

        const supabase = createSupabaseAdminClient();
        const nowIso = new Date().toISOString();
        const { data: job, error: jobError } = await supabase
            .from("print_jobs")
            .select("payload, expires_at")
            .eq("token", tokenParsed.data)
            .eq("user_id", auth.user.id)
            .gt("expires_at", nowIso)
            .maybeSingle();

        if (jobError) {
            logger.error("Print job fetch for pdf failed", { error: jobError.message, requestId });
            return NextResponse.json({ error: "Erreur de lecture", requestId }, { status: 500 });
        }

        if (!job?.payload) {
            return NextResponse.json({ error: "Print job introuvable ou expiré", requestId }, { status: 404 });
        }

        const format = (job.payload?.format === "Letter" ? "Letter" : "A4") as "A4" | "Letter";
        const viewportWidth = 794;
        const viewportHeight = format === "Letter" ? 1056 : 1123;

        printer = await createPrinterSession();
        const browser = printer.browser;

        const page = await browser.newPage();
        await page.setViewport({ width: viewportWidth, height: viewportHeight, deviceScaleFactor: 2 });
        await page.setExtraHTTPHeaders({ Authorization: `Bearer ${auth.token}` });

        const url = new URL(request.url);
        const fallbackBaseUrl = `${url.protocol}//${url.host}`;
        const baseUrl = getPrinterAppUrl(fallbackBaseUrl);
        const printUrl = `${baseUrl}/dashboard/cv-builder/print?token=${encodeURIComponent(tokenParsed.data)}&format=${format}`;

        await page.evaluateOnNewDocument((payload: unknown) => {
            (window as any).__CV_PRINT_PAYLOAD__ = payload;
        }, job.payload);

        logger.debug("Navigating to print page", { printUrl, requestId, printerMode: printer.mode });

        if (typeof (page as any).setDefaultNavigationTimeout === "function") {
            await (page as any).setDefaultNavigationTimeout(45000);
        }
        await page.goto(printUrl, { waitUntil: "domcontentloaded", timeout: 45000 });

        try {
            await page.waitForFunction(() => (window as any).__CV_RENDER_COMPLETE__ === true, { timeout: 25000 });
        } catch {
            logger.warn("Print job render timeout - proceeding anyway", { token: tokenParsed.data });
        }

        try {
            await page.evaluate(() => document.fonts.ready);
        } catch {}

        await new Promise((resolve) => setTimeout(resolve, 300));
        await page.emulateMediaType("print");

        const pdfBuffer = await page.pdf({
            format: format === "Letter" ? "Letter" : "A4",
            printBackground: true,
            margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
            preferCSSPageSize: true,
            omitBackground: false,
            displayHeaderFooter: false,
            scale: 1,
        });

        await printer.close();
        printer = null;

        const firstName =
            typeof job.payload?.data?.profil?.prenom === "string" ? job.payload.data.profil.prenom : "";
        const lastName = typeof job.payload?.data?.profil?.nom === "string" ? job.payload.data.profil.nom : "";
        const safeFirst = toSafeFilenamePart(firstName);
        const safeLast = toSafeFilenamePart(lastName);
        const fileName =
            safeFirst || safeLast
                ? `CV_${safeFirst}_${safeLast}.pdf`.replace(/_+\.pdf$/, ".pdf")
                : `CV_print.pdf`;

        return new NextResponse(Buffer.from(pdfBuffer), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename=\"${fileName}\"`,
                "Cache-Control": "private, no-store",
                Pragma: "no-cache",
                Vary: "Authorization",
                "X-Content-Type-Options": "nosniff",
                "X-Request-Id": requestId,
            },
        });
    } catch (error: any) {
        logger.error("Print job PDF generation error", { error: error?.message, stack: error?.stack, requestId });
        return NextResponse.json(
            { error: "Failed to generate PDF", details: error?.message, requestId },
            { status: 500 }
        );
    } finally {
        if (printer) {
            try {
                await printer.close();
            } catch {}
        }
    }
}
