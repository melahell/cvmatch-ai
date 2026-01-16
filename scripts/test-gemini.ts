// Test Gemini API directly
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ GEMINI_API_KEY not found");
    process.exit(1);
}

console.log("✅ API Key found (length:", apiKey.length, ")");

const genAI = new GoogleGenerativeAI(apiKey);

async function testModel(modelName: string) {
    console.log(`\n🧪 Testing: ${modelName}`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Dis juste 'OK' si tu fonctionnes.");
        const text = result.response.text();
        console.log(`✅ ${modelName} works! Response: ${text.substring(0, 50)}`);
        return true;
    } catch (error: any) {
        console.error(`❌ ${modelName} failed:`);
        console.error("   Message:", error.message);
        console.error("   Status:", error.status || "N/A");
        return false;
    }
}

async function main() {
    const models = [
        "gemini-3-flash-preview",
        "gemini-3-pro-preview",
    ];

    console.log("=== GEMINI MODEL TEST ===\n");

    for (const model of models) {
        await testModel(model);
    }
}

main();
