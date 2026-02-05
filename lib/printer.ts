import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import fs from "fs";
import path from "path";

export type PrinterMode = "remote" | "local";

export type PrinterSession = {
    mode: PrinterMode;
    browser: any;
    close: () => Promise<void>;
};

export type PrinterConnectivity = {
    hasEndpoint: boolean;
    mode: PrinterMode;
};

export function getPrinterEndpoint(): string | null {
    const v = process.env.PRINTER_ENDPOINT?.trim();
    return v ? v : null;
}

export function getPrinterAppUrl(fallbackUrl: string): string {
    return (process.env.PRINTER_APP_URL || process.env.NEXT_PUBLIC_APP_URL || fallbackUrl).replace(/\/+$/, "");
}

export async function checkPrinterConnectivity(): Promise<PrinterConnectivity> {
    const endpoint = getPrinterEndpoint();
    if (!endpoint) return { hasEndpoint: false, mode: "local" };

    if (endpoint.startsWith("ws://") || endpoint.startsWith("wss://")) {
        const browser = await (puppeteer as any).connect({ browserWSEndpoint: endpoint });
        browser.disconnect();
        return { hasEndpoint: true, mode: "remote" };
    }

    const browser = await (puppeteer as any).connect({ browserURL: endpoint });
    browser.disconnect();
    return { hasEndpoint: true, mode: "remote" };
}

async function resolveChromiumExecutablePath(): Promise<string> {
    try {
        return await chromium.executablePath();
    } catch {}

    const candidates = [
        process.env.LAMBDA_TASK_ROOT ? path.join(process.env.LAMBDA_TASK_ROOT, "node_modules/@sparticuz/chromium/bin") : null,
        "/var/task/node_modules/@sparticuz/chromium/bin",
        path.join(process.cwd(), "node_modules/@sparticuz/chromium/bin"),
    ].filter(Boolean) as string[];

    for (const candidate of candidates) {
        try {
            if (fs.existsSync(candidate)) return await chromium.executablePath(candidate);
        } catch {}
    }

    return await chromium.executablePath();
}

export async function createPrinterSession(): Promise<PrinterSession> {
    const endpoint = getPrinterEndpoint();

    if (endpoint) {
        if (endpoint.startsWith("ws://") || endpoint.startsWith("wss://")) {
            const browser = await (puppeteer as any).connect({ browserWSEndpoint: endpoint });
            return { mode: "remote", browser, close: async () => browser.disconnect() };
        }

        const browser = await (puppeteer as any).connect({ browserURL: endpoint });
        return { mode: "remote", browser, close: async () => browser.disconnect() };
    }

    const isLocal = process.env.NODE_ENV === "development";
    if (isLocal) {
        const browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--font-render-hinting=none"],
        });
        return { mode: "local", browser, close: async () => browser.close() };
    }

    let executablePath: string;
    try {
        executablePath = await resolveChromiumExecutablePath();
    } catch (error: any) {
        const message = typeof error?.message === "string" ? error.message : "";
        if (message.includes("@sparticuz/chromium/bin") || message.includes("brotli")) {
            throw new Error(
                [
                    "Chromium introuvable dans l’environnement serveur.",
                    "Sur Vercel, ajoutez outputFileTracingIncludes pour `node_modules/@sparticuz/chromium/bin/**`",
                    "ou configurez PRINTER_ENDPOINT (Chrome/Browserless) pour éviter Chromium packagé.",
                    `cwd=${process.cwd()}`,
                    `lambda_task_root=${process.env.LAMBDA_TASK_ROOT ?? "null"}`,
                ].join(" ")
            );
        }
        throw error;
    }
    const browser = await puppeteer.launch({
        args: [...chromium.args, "--font-render-hinting=none", "--disable-gpu"],
        executablePath,
        headless: true,
        defaultViewport: null,
    });
    return { mode: "local", browser, close: async () => browser.close() };
}
