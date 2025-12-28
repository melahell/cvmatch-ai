
import { describe, it, expect } from "vitest";

function buildPrompt(name: string) {
    return `Hello ${name}`;
}

describe("AI Prompt Builder", () => {
    it("should include the user name", () => {
        const prompt = buildPrompt("Gilles");
        expect(prompt).toContain("Gilles");
    });
});
