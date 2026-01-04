import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn("Missing GEMINI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(apiKey || "dummy-key");

// Model cascade: use stable model names
// gemini-1.5-flash is the most stable and widely available
const MODEL_CASCADE = [
    "gemini-1.5-flash",          // Most stable, good quality
    "gemini-1.5-pro",            // Better quality if available
];

// Legacy exports for backward compatibility
export const models = {
    flash: genAI.getGenerativeModel({ model: "gemini-1.5-flash" }),
    pro: genAI.getGenerativeModel({ model: "gemini-1.5-pro" }),
    vision: genAI.getGenerativeModel({ model: "gemini-1.5-flash" }),
};

/**
 * Generates content with automatic model cascade fallback
 * Tries each model in order until one succeeds
 */
export async function generateWithCascade(
    prompt: string | any[],
    options?: { startFromIndex?: number }
): Promise<{ result: any; modelUsed: string }> {
    const startIndex = options?.startFromIndex ?? 0;

    for (let i = startIndex; i < MODEL_CASCADE.length; i++) {
        const modelName = MODEL_CASCADE[i];
        const model = genAI.getGenerativeModel({ model: modelName });

        try {
            console.log(`Trying model: ${modelName}`);
            const result = await model.generateContent(prompt);
            console.log(`Success with model: ${modelName}`);
            return { result, modelUsed: modelName };
        } catch (error: any) {
            const isQuotaError =
                error.message?.includes("429") ||
                error.message?.includes("quota") ||
                error.message?.includes("Too Many") ||
                error.message?.includes("RESOURCE_EXHAUSTED");

            if (isQuotaError && i < MODEL_CASCADE.length - 1) {
                console.log(`Model ${modelName} quota exceeded, trying next...`);
                continue;
            }

            // Not a quota error or last model - throw
            throw error;
        }
    }

    throw new Error("All models exhausted - please try again later");
}

/**
 * Retry wrapper with exponential backoff
 */
export async function callWithRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 2,
    baseDelay: number = 5000
): Promise<T> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error: any) {
            const isRateLimit =
                error.message?.includes("429") ||
                error.message?.includes("quota") ||
                error.message?.includes("Too Many");

            if (isRateLimit && attempt < maxRetries - 1) {
                const delay = baseDelay * Math.pow(2, attempt);
                console.log(`Rate limited, waiting ${delay / 1000}s...`);
                await new Promise(r => setTimeout(r, delay));
                continue;
            }
            throw error;
        }
    }
    throw new Error("Max retries exceeded");
}

export { genAI, MODEL_CASCADE };
