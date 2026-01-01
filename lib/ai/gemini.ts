import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn("Missing GEMINI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(apiKey || "dummy-key");

// Gemini 3 models (2025-2026)
export const models = {
    flash: genAI.getGenerativeModel({ model: "gemini-3-flash-preview" }),
    pro: genAI.getGenerativeModel({ model: "gemini-3-pro-preview" }),
    vision: genAI.getGenerativeModel({ model: "gemini-3-flash-preview" }),
};
