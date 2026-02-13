/**
 * Coerce une valeur inconnue en booléen fiable.
 *
 * Objectif: éviter les bugs "false" (string) -> truthy.
 * Retourne `undefined` si la valeur est absente ou non interprétable.
 */
export function coerceBoolean(value: unknown): boolean | undefined {
  if (value === null || value === undefined) return undefined;

  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;

  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    if (!v) return undefined;

    if (["true", "1", "yes", "y", "oui", "vrai"].includes(v)) return true;
    if (["false", "0", "no", "n", "non", "faux"].includes(v)) return false;

    // Cas fréquents côté IA
    if (v === "present" || v === "présent" || v === "now" || v === "aujourd'hui") return true;
  }

  // Ne PAS fallback vers Boolean(value) ici: ça ferait ("false" -> true) ou ({} -> true).
  return undefined;
}

