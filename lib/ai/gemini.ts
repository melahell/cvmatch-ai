import { GoogleGenerativeAI } from "@google/generative-ai";

export const GEMINI_MODELS = {
    principal: "gemini-3-pro-preview",
    fallback: "gemini-3-flash-preview",
} as const;

export type GeminiModel = (typeof GEMINI_MODELS)[keyof typeof GEMINI_MODELS];

const MODEL_CASCADE: GeminiModel[] = [GEMINI_MODELS.principal, GEMINI_MODELS.fallback];

function getApiKey() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY manquante");
    }
    return apiKey;
}

function isRateLimitError(error: unknown) {
    const anyError = error as any;
    const status = anyError?.status ?? anyError?.response?.status;
    const message = typeof anyError?.message === "string" ? anyError.message : "";

    return (
        status === 429 ||
        message.includes("429") ||
        message.toLowerCase().includes("rate limit") ||
        message.toLowerCase().includes("quota") ||
        message.toLowerCase().includes("resource_exhausted")
    );
}

async function delay(ms: number) {
    await new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export async function generateWithCascade(
    prompt: string | any[],
    options?: { startFromIndex?: number }
): Promise<{ result: any; modelUsed: GeminiModel }> {
    const startIndex = options?.startFromIndex ?? 0;
    const genAI = new GoogleGenerativeAI(getApiKey());

    for (let i = startIndex; i < MODEL_CASCADE.length; i++) {
        const modelName = MODEL_CASCADE[i];
        const model = genAI.getGenerativeModel({ model: modelName });
        try {
            const result = await model.generateContent(prompt);
            return { result, modelUsed: modelName };
        } catch (error) {
            if (isRateLimitError(error) && i < MODEL_CASCADE.length - 1) {
                continue;
            }
            throw error;
        }
    }

    throw new Error("Tous les modèles Gemini sont indisponibles");
}

export async function callWithRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 2
): Promise<T> {
    const backoffsMs = [30_000, 60_000, 120_000];

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            const isRateLimited = isRateLimitError(error);
            if (!isRateLimited || attempt >= maxRetries - 1) {
                throw error;
            }

            const delayMs = backoffsMs[Math.min(attempt, backoffsMs.length - 1)];
            await delay(delayMs);
        }
    }

    throw new Error("Max retries exceeded");
}

export async function generateWithGemini(params: {
    prompt: string | any[];
    model?: GeminiModel;
}) {
    const startFromIndex = params.model === GEMINI_MODELS.fallback ? 1 : 0;
    const { result } = await callWithRetry(() =>
        generateWithCascade(params.prompt, { startFromIndex })
    );
    return result.response.text();
}
