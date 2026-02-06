/**
 * [CDC-09] Parser JSON sécurisé pour sorties IA
 * Gère les erreurs courantes des LLMs (markdown, trailing commas, etc.)
 * Fallback: jsonrepair pour réparer le JSON mal formé (virgules, guillemets, tronqué).
 */

import { z } from "zod";
import { jsonrepair } from "jsonrepair";

/**
 * Nettoie une chaîne JSON potentiellement mal formatée par un LLM
 */
export function cleanLLMJson(raw: string): string {
    let cleaned = raw
        // Retirer les blocs markdown
        .replace(/^```json?\s*/i, '')
        .replace(/```\s*$/i, '')
        .replace(/```\s*/gi, '')
        // Retirer les commentaires (// et /* */)
        .replace(/\/\/[^\n]*/g, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // Retirer les trailing commas avant ] ou }
        .replace(/,\s*([\]}])/g, '$1')
        // Normaliser les guillemets
        .replace(/'/g, '"')
        .replace(/[""`]/g, '"')
        // Retirer les caractères de contrôle
        .replace(/[\x00-\x1F\x7F]/g, ' ')
        .trim();
    
    return cleaned;
}

/**
 * Parse du JSON avec nettoyage et validation optionnelle
 */
export function safeParseJSON<T>(
    raw: string, 
    schema?: z.ZodType<T>
): { success: true; data: T } | { success: false; error: string } {
    try {
        const cleaned = cleanLLMJson(raw);
        const parsed = JSON.parse(cleaned);
        
        if (schema) {
            const result = schema.safeParse(parsed);
            if (!result.success) {
                return { 
                    success: false, 
                    error: `Validation failed: ${result.error.issues.map(i => i.message).join(', ')}`
                };
            }
            return { success: true, data: result.data };
        }
        
        return { success: true, data: parsed as T };
    } catch (e) {
        // Tenter de réparer les erreurs courantes
        try {
            const repaired = attemptRepair(raw);
            const parsed = JSON.parse(repaired);
            
            if (schema) {
                const result = schema.safeParse(parsed);
                if (!result.success) {
                    return { 
                        success: false, 
                        error: `Validation failed after repair: ${result.error.issues.map(i => i.message).join(', ')}`
                    };
                }
                return { success: true, data: result.data };
            }
            
            return { success: true, data: parsed as T };
        } catch (repairError) {
            // Dernier essai: jsonrepair (gère virgules manquantes, guillemets, tronqué, etc.)
            try {
                const repaired = jsonrepair(raw);
                const parsed = JSON.parse(repaired);
                if (schema) {
                    const result = schema.safeParse(parsed);
                    if (!result.success) {
                        return {
                            success: false,
                            error: `Validation failed after jsonrepair: ${result.error.issues.map((i) => i.message).join(", ")}`
                        };
                    }
                    return { success: true, data: result.data };
                }
                return { success: true, data: parsed as T };
            } catch (jsonrepairError) {
                return {
                    success: false,
                    error: `JSON parse failed: ${e instanceof Error ? e.message : "Unknown error"} (jsonrepair failed)`
                };
            }
        }
    }
}

/**
 * Tente de réparer des erreurs JSON courantes (LLM : virgules manquantes, etc.)
 */
function attemptRepair(raw: string): string {
    let cleaned = cleanLLMJson(raw);

    // Extraire tableau ou objet principal
    const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
        cleaned = arrayMatch[0];
    } else {
        const objectMatch = cleaned.match(/\{[\s\S]*\}/);
        if (objectMatch) {
            cleaned = objectMatch[0];
        }
    }

    // Réparer virgules manquantes (cause fréquente "Expected ',' or '}' after property value")
    // 1) Entre deux objets dans un tableau : } \n { -> }, \n {
    cleaned = cleaned.replace(/\}\s*\{/g, "},{");
    // 2) Après une chaîne fermante, avant newline puis nouvelle clé "key" : "val" \n " -> "val", \n "
    cleaned = cleaned.replace(/"([^"\\]|\\.)*"\s*\n\s*"/g, (m) => m.replace(/\s*\n\s*"$/, ",\n  \""));
    // 3) Après un nombre, avant newline puis " : 42 \n " -> 42, \n "
    cleaned = cleaned.replace(/(\d)\s*\n\s*"/g, "$1,\n  \"");
    // 4) Après true/false/null, avant newline puis "
    cleaned = cleaned.replace(/(true|false|null)\s*\n\s*"/g, "$1,\n  \"");
    // 5) Entre deux éléments de tableau ] [ -> ], [
    cleaned = cleaned.replace(/\]\s*\[/g, "],[");
    // 5b) Après ] (fin de tableau dans un objet) avant newline et } : ], }
    cleaned = cleaned.replace(/\]\s*\n\s*\}/g, "],\n  }");
    // 6) Après } avant newline puis " (objet fermé, prochaine clé)
    cleaned = cleaned.replace(/\}\s*\n\s*"/g, "},\n  \"");
    // 7) Deuxième passe (plusieurs virgules manquantes)
    cleaned = cleaned.replace(/\}\s*\{/g, "},{");
    cleaned = cleaned.replace(/"([^"\\]|\\.)*"\s*\n\s*"/g, (m) => m.replace(/\s*\n\s*"$/, ",\n  \""));

    // Équilibrer les accolades/crochets
    const openBraces = (cleaned.match(/\{/g) || []).length;
    const closeBraces = (cleaned.match(/\}/g) || []).length;
    const openBrackets = (cleaned.match(/\[/g) || []).length;
    const closeBrackets = (cleaned.match(/\]/g) || []).length;
    cleaned += "}".repeat(Math.max(0, openBraces - closeBraces));
    cleaned += "]".repeat(Math.max(0, openBrackets - closeBrackets));

    return cleaned;
}

/**
 * Parse JSON avec retry et fallback
 */
export async function parseJSONWithRetry<T>(
    raw: string,
    schema?: z.ZodType<T>,
    maxAttempts: number = 3
): Promise<T | null> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const result = safeParseJSON(raw, schema);
        if (result.success) {
            return result.data;
        }
        
        // Log l'erreur mais continue
        console.warn(`[safe-json-parser] Attempt ${attempt} failed:`, result.error);
    }
    
    return null;
}
