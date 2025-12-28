
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn("Missing GEMINI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(apiKey || "dummy-key");

export const models = {
    flash: genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" }),
    pro: genAI.getGenerativeModel({ model: "gemini-pro" }),
    vision: genAI.getGenerativeModel({ model: "gemini-pro-vision" }),
};
