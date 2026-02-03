import { describe, it, expect } from "vitest";
import { CV_TEMPLATE_VARIANTS, resolveTemplateVariant } from "@/lib/cv/template-variants";

describe("template variants", () => {
    it("génère au moins 100 variantes", () => {
        expect(CV_TEMPLATE_VARIANTS.length).toBeGreaterThanOrEqual(100);
    });

    it("résout baseId + variant depuis un id de variante", () => {
        const any = CV_TEMPLATE_VARIANTS[0];
        const resolved = resolveTemplateVariant(any.id);
        expect(resolved.baseId).toBe(any.baseId);
        expect(resolved.variant?.id).toBe(any.id);
    });
});

