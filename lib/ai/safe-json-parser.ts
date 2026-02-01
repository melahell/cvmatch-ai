/**
 * [CDC-09] Parser JSON sécurisé pour sorties IA
 * Gère les erreurs courantes des LLMs (markdown, trailing commas, etc.)
 */

import { z } from "zod";

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
            return { 
                success: false, 
                error: `JSON parse failed: ${e instanceof Error ? e.message : 'Unknown error'}`
            };
        }
    }
}

/**
 * Tente de réparer des erreurs JSON courantes
 */
function attemptRepair(raw: string): string {
    let cleaned = cleanLLMJson(raw);
    
    // Tenter d'extraire un objet JSON valide
    const objectMatch = cleaned.match(/\{[\s\S]*\}/);
    if (objectMatch) {
        cleaned = objectMatch[0];
    } else {
        // Tenter d'extraire un tableau JSON valide
        const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
            cleaned = arrayMatch[0];
        }
    }
    
    // Équilibrer les accolades/crochets
    const openBraces = (cleaned.match(/\{/g) || []).length;
    const closeBraces = (cleaned.match(/\}/g) || []).length;
    const openBrackets = (cleaned.match(/\[/g) || []).length;
    const closeBrackets = (cleaned.match(/\]/g) || []).length;
    
    // Ajouter les fermants manquants
    cleaned += '}'.repeat(Math.max(0, openBraces - closeBraces));
    cleaned += ']'.repeat(Math.max(0, openBrackets - closeBrackets));
    
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
