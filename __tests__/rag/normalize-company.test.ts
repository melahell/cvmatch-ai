import { describe, it, expect } from "vitest";
import { normalizeCompanyName, areSameCompany } from "../../lib/rag/normalize-company";

describe("normalize-company", () => {
    describe("normalizeCompanyName", () => {
        it("normalise les variations communes BNP", () => {
            expect(normalizeCompanyName("BNP")).toBe("bnp paribas");
            expect(normalizeCompanyName("BNP Paribas")).toBe("bnp paribas");
            expect(normalizeCompanyName("BNP Paribas SA")).toBe("bnp paribas");
        });

        it("normalise les acronymes VW", () => {
            expect(normalizeCompanyName("VW")).toBe("volkswagen");
            expect(normalizeCompanyName("Volkswagen")).toBe("volkswagen");
            expect(normalizeCompanyName("VW FS")).toBe("volkswagen financial services");
        });

        it("supprime les suffixes (SA, Ltd, Inc)", () => {
            expect(normalizeCompanyName("Microsoft SA")).toBe("microsoft");
            expect(normalizeCompanyName("Google Inc")).toBe("google");
            expect(normalizeCompanyName("Apple Ltd")).toBe("apple");
        });

        it("gère les variations avec espaces et casse", () => {
            expect(normalizeCompanyName("  BNP  PARIBAS  ")).toBe("bnp paribas");
            expect(normalizeCompanyName("bnp paribas")).toBe("bnp paribas");
            expect(normalizeCompanyName("BnP pArIbAs")).toBe("bnp paribas");
        });

        it("retourne chaîne vide pour valeurs nulles/undefined", () => {
            expect(normalizeCompanyName(null as any)).toBe("");
            expect(normalizeCompanyName(undefined as any)).toBe("");
            expect(normalizeCompanyName("")).toBe("");
        });
    });

    describe("areSameCompany", () => {
        it("détecte les mêmes entreprises avec variations", () => {
            expect(areSameCompany("BNP", "BNP Paribas")).toBe(true);
            expect(areSameCompany("VW", "Volkswagen")).toBe(true);
            expect(areSameCompany("BNP Paribas SA", "BNP")).toBe(true);
        });

        it("détecte les entreprises différentes", () => {
            expect(areSameCompany("BNP", "Société Générale")).toBe(false);
            expect(areSameCompany("VW", "BMW")).toBe(false);
        });

        it("gère les valeurs nulles/undefined", () => {
            expect(areSameCompany(null as any, "BNP")).toBe(false);
            expect(areSameCompany("BNP", undefined as any)).toBe(false);
            expect(areSameCompany(null as any, null as any)).toBe(false);
        });

        it("détecte les correspondances partielles valides", () => {
            expect(areSameCompany("BNP Paribas France", "BNP")).toBe(true);
            expect(areSameCompany("Volkswagen Group", "VW")).toBe(true);
        });
    });
});
