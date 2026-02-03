import { describe, it, expect } from "vitest";
import { sanitizeText } from "@/lib/cv/sanitize-text";

describe("sanitizeText", () => {
    it("ne doit pas insérer d'espaces dans des mots français normaux (ex: moderne)", () => {
        expect(sanitizeText("moderne")).toBe("moderne");
        expect(sanitizeText("développeur")).toBe("développeur");
        expect(sanitizeText("modelage")).toBe("modelage");
        expect(sanitizeText("code")).toBe("code");
    });

    it("doit supprimer les caractères invisibles qui cassent l'affichage", () => {
        expect(sanitizeText("mo\u200bderne")).toBe("moderne");
        expect(sanitizeText("mo\u00adderne")).toBe("moderne");
        expect(sanitizeText("\ufeffmoderne")).toBe("moderne");
    });

    it("doit corriger des concaténations sûres avec frontières de mots", () => {
        expect(sanitizeText("etde")).toBe("et de");
        expect(sanitizeText("dela")).toBe("de la");
        expect(sanitizeText("dansle")).toBe("dans le");
    });

    it("doit corriger digit↔lettre, % et + sans casser le reste", () => {
        expect(sanitizeText("12clients")).toBe("12 clients");
        expect(sanitizeText("pour12")).toBe("pour 12");
        expect(sanitizeText("10%")).toBe("10 %");
        expect(sanitizeText("+12")).toBe("+ 12");
        expect(sanitizeText("12+")).toBe("12 +");
    });
});

