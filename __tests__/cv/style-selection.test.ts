import { describe, it, expect } from "vitest";
import { CV_COLORWAYS } from "@/lib/cv/style/colorways";
import { AVAILABLE_TEMPLATE_IDS } from "@/components/cv/CVRenderer";
import { parseLegacyTemplateId, resolveCVStyle } from "@/lib/cv/style/resolve-style";

describe("style selection", () => {
    it("expose 20 colorways", () => {
        expect(CV_COLORWAYS.length).toBe(20);
    });

    it("expose 17 templates majeurs", () => {
        expect(AVAILABLE_TEMPLATE_IDS.length).toBe(17);
    });

    it("parse les anciens ids template", () => {
        const parsed = parseLegacyTemplateId("modern__blue__sans__compact");
        expect(parsed.templateId).toBe("modern");
        expect(parsed.colorwayId).toBe("blue");
        expect(parsed.fontId).toBe("sans");
        expect(parsed.density).toBe("compact");
    });

    it("applique une couleur sans modifier le templateId", () => {
        const resolved = resolveCVStyle({ templateId: "tech", colorwayId: "emerald" });
        expect(resolved.templateId).toBe("tech");
        expect(resolved.themeOverrides["--cv-primary"]).toBeTruthy();
    });
});

