import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

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

    const executablePath = await chromium.executablePath();
    const browser = await puppeteer.launch({
        args: [...chromium.args, "--font-render-hinting=none", "--disable-gpu"],
        executablePath,
        headless: true,
        defaultViewport: null,
    });
    return { mode: "local", browser, close: async () => browser.close() };
}
