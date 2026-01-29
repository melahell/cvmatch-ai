import { describe, it, expect } from "vitest";

import { getRAGExtractionPrompt } from "../lib/ai/prompts";

describe("getRAGExtractionPrompt", () => {
    it("doit expliciter les règles anti-hallucination", () => {
        const prompt = getRAGExtractionPrompt("EXEMPLE");
        expect(prompt).toMatch(/interdiction absolue.*inventer/i);
    });

    it("doit cadrer la quantification sans inventer de chiffres", () => {
        const prompt = getRAGExtractionPrompt("EXEMPLE");
        expect(prompt).toContain("RÈGLES ANTI-HALLUCINATION");
        expect(prompt).toContain("CHIFFRES");
    });
});
