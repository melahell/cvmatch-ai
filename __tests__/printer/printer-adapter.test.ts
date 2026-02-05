import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("puppeteer-core", () => {
    return {
        default: {
            launch: vi.fn(),
            connect: vi.fn(),
        },
    };
});

vi.mock("@sparticuz/chromium", () => {
    return {
        default: {
            args: ["--no-sandbox"],
            executablePath: vi.fn(async () => "/tmp/chromium"),
        },
    };
});

describe("printer adapter", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it("connecte en WS si PRINTER_ENDPOINT est un ws(s)://", async () => {
        process.env.PRINTER_ENDPOINT = "wss://printer.example/devtools/browser/abc";
        const puppeteerMod = await import("puppeteer-core");
        const disconnect = vi.fn();
        (puppeteerMod.default.connect as any).mockResolvedValue({ disconnect });

        const { createPrinterSession } = await import("@/lib/printer");
        const session = await createPrinterSession();
        expect(puppeteerMod.default.connect).toHaveBeenCalledWith({
            browserWSEndpoint: "wss://printer.example/devtools/browser/abc",
        });
        expect(session.mode).toBe("remote");
        await session.close();
        expect(disconnect).toHaveBeenCalled();
    });

    it("connecte en HTTP si PRINTER_ENDPOINT est un http(s)://", async () => {
        process.env.PRINTER_ENDPOINT = "http://printer.example:9222";
        const puppeteerMod = await import("puppeteer-core");
        const disconnect = vi.fn();
        (puppeteerMod.default.connect as any).mockResolvedValue({ disconnect });

        const { createPrinterSession } = await import("@/lib/printer");
        const session = await createPrinterSession();
        expect(puppeteerMod.default.connect).toHaveBeenCalledWith({
            browserURL: "http://printer.example:9222",
        });
        expect(session.mode).toBe("remote");
        await session.close();
        expect(disconnect).toHaveBeenCalled();
    });

    it("launch en dev local quand PRINTER_ENDPOINT est absent", async () => {
        delete process.env.PRINTER_ENDPOINT;
        process.env.NODE_ENV = "development";
        const puppeteerMod = await import("puppeteer-core");
        const close = vi.fn();
        (puppeteerMod.default.launch as any).mockResolvedValue({ close });

        const { createPrinterSession } = await import("@/lib/printer");
        const session = await createPrinterSession();
        expect(puppeteerMod.default.launch).toHaveBeenCalled();
        expect(session.mode).toBe("local");
        await session.close();
        expect(close).toHaveBeenCalled();
    });
});

