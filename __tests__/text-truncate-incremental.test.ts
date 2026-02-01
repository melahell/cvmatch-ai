import { describe, it, expect } from "vitest";
import { estimateTokenCount, truncateForRAGIncrementalExtraction } from "@/lib/utils/text-truncate";

describe("truncateForRAGIncrementalExtraction", () => {
    it("doit tronquer sous ~20k tokens et insérer le marqueur si nécessaire", () => {
        const tokenTarget = 26000;
        const text = "A".repeat(tokenTarget * 4);
        const res = truncateForRAGIncrementalExtraction(text);

        expect(res.stats.wasTruncated).toBe(true);
        expect(res.text.includes("[... CONTENU TRONQUÉ ...]")).toBe(true);
        expect(estimateTokenCount(res.text)).toBeLessThanOrEqual(20000);
    });
});

