import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const getEmbedding = async (text) => {
  try {
    // ✅ IMPORTANT: use correct model
    const model = genAI.getGenerativeModel({
      model: "embedding-001",
    });

    if (!text || text.trim().length < 3) {
      return new Array(384).fill(0);
    }

    // ✅ IMPORTANT: correct input format
    const result = await model.embedContent(text);

    if (!result?.embedding?.values) {
      throw new Error("Invalid embedding response");
    }

    return result.embedding.values;
  } catch (err) {
    console.error("Embedding error:", err.message);

    // 🔥 fallback (VERY IMPORTANT for production)
    return new Array(768).fill(0);
  }
};