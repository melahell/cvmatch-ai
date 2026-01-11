
import { GoogleGenerativeAI } from "@google/generative-ai";

export const GEMINI_MODELS = {
    principal: "gemini-3-pro-preview",
    fallback: "gemini-3-flash-preview",
} as const;

export type GeminiModel = (typeof GEMINI_MODELS)[keyof typeof GEMINI_MODELS];

async function delay(ms: number) {
    await new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function isRateLimitError(error: unknown) {
    const anyError = error as any;
    const status = anyError?.status ?? anyError?.response?.status;
    const message = typeof anyError?.message === "string" ? anyError.message : "";
    return status === 429 || message.includes("429") || message.toLowerCase().includes("rate limit");
}

function getApiKey() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY manquante");
    }
    return apiKey;
}

async function generateOnce(model: GeminiModel, prompt: string) {
    const genAI = new GoogleGenerativeAI(getApiKey());
    const generativeModel = genAI.getGenerativeModel({ model });
    const result = await generativeModel.generateContent(prompt);
    return result.response.text();
}

export async function generateWithGemini(params: {
    prompt: string;
    model?: GeminiModel;
}) {
    const model = params.model ?? GEMINI_MODELS.principal;
    const fallbacks: GeminiModel[] = model === GEMINI_MODELS.principal
        ? [GEMINI_MODELS.principal, GEMINI_MODELS.fallback]
        : [GEMINI_MODELS.fallback, GEMINI_MODELS.principal];

    let lastError: unknown;

    for (const candidate of fallbacks) {
        try {
            return await generateOnce(candidate, params.prompt);
        } catch (error) {
            lastError = error;

            if (isRateLimitError(error)) {
                const backoffsMs = [30_000, 60_000, 120_000];
                for (const backoff of backoffsMs) {
                    await delay(backoff);
                    try {
                        return await generateOnce(candidate, params.prompt);
                    } catch (retryError) {
                        lastError = retryError;
                        if (!isRateLimitError(retryError)) {
                            break;
                        }
                    }
                }
            }
        }
    }

    throw lastError instanceof Error ? lastError : new Error("Erreur Gemini");
}
