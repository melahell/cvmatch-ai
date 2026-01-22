import { describe, it, expect } from "vitest";

import { getRAGExtractionPrompt } from "../lib/ai/prompts";

describe("getRAGExtractionPrompt", () => {
    it("doit expliciter les règles anti-hallucination", () => {
        const prompt = getRAGExtractionPrompt("EXEMPLE");
        expect(prompt).toContain("Interdiction absolue d'inventer");
    });

    it("ne doit pas forcer la quantification par des seuils", () => {
        const prompt = getRAGExtractionPrompt("EXEMPLE");
        expect(prompt).not.toContain("60%");
        expect(prompt).not.toContain("3+ chiffres");
    });
});

