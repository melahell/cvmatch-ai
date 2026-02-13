import { getExperienceDates } from "@/lib/utils/normalize-rag";
import { coerceBoolean } from "@/lib/utils/coerce-boolean";

const PRESENT_LABELS = new Set(["présent", "present", "now", "aujourd'hui"]);

const toMonthIndex = (value: unknown): number | null => {
    const s = String(value ?? "").trim();
    if (!s) return null;
    const ym = s.match(/^(\d{4})-(\d{2})$/);
    if (ym) {
        const y = Number(ym[1]);
        const m = Number(ym[2]);
        if (m >= 1 && m <= 12) return y * 12 + m;
        return null;
    }
    const yOnly = s.match(/^(\d{4})$/);
    if (yOnly) return Number(yOnly[1]) * 12 + 1;
    return null;
};

const isPresent = (value: unknown): boolean => {
    const s = String(value ?? "").trim().toLowerCase();
    return PRESENT_LABELS.has(s);
};

export function sanitizeRAGExperiences(rag: any): any {
    if (!rag || typeof rag !== "object") return rag;
    const experiences = Array.isArray(rag.experiences) ? rag.experiences : [];
    if (experiences.length === 0) return rag;

    const normalized = experiences.map((exp: any) => {
        const { start, end, isCurrent } = getExperienceDates(exp);
        const current = coerceBoolean(exp?.actuel ?? exp?.current ?? exp?.is_current) === true || isPresent(end);
        const endValue = isPresent(end) ? null : (end ?? null);
        const finalIsCurrent = endValue ? false : current;
        const base = { ...exp, actuel: finalIsCurrent };
        if (start !== null && base.debut === undefined && base.date_debut === undefined && base.start_date === undefined) {
            base.debut = start;
        }
        if (endValue !== null) {
            base.fin = endValue;
        } else if (base.fin === undefined) {
            base.fin = null;
        }
        return base;
    });

    const currentOnes = normalized
        .map((exp: any, idx: number) => ({
            idx,
            exp,
            startIdx: toMonthIndex(getExperienceDates(exp).start),
            isCurrent: getExperienceDates(exp).isCurrent,
        }))
        .filter((x: { idx: number; exp: any; startIdx: number | null; isCurrent: boolean }) => x.isCurrent);

    if (currentOnes.length > 1) {
        const maxStart = Math.max(...currentOnes.map((x: { startIdx: number | null }) => x.startIdx ?? -Infinity));
        const keep = new Set(
            currentOnes
                .filter((x: { startIdx: number | null }) => (x.startIdx ?? -Infinity) === maxStart)
                .map((x: { idx: number }) => x.idx)
        );
        for (const x of currentOnes) {
            if (!keep.has(x.idx)) {
                normalized[x.idx] = { ...normalized[x.idx], actuel: false };
            }
        }
    }

    return { ...rag, experiences: normalized };
}
