import { pipeline } from "@xenova/transformers";

let extractor = null;

// 🔥 Load model once (singleton)
const loadModel = async () => {
  if (!extractor) {
    extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    console.log("✅ Embedding model loaded");
  }
  return extractor;
};

// 🔥 CACHE (in-memory)
const cache = new Map();

// ---------------- SINGLE EMBEDDING ----------------
export const getEmbedding = async (text) => {
  if (cache.has(text)) return cache.get(text);

  const model = await loadModel();

  const output = await model(text, {
    pooling: "mean",
    normalize: true,
  });

  const embedding = Array.from(output.data);
  const MAX_CACHE = 500;

  if (cache.size > MAX_CACHE) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }

  cache.set(text, embedding);

  return embedding;
};

// ---------------- BATCH EMBEDDING ----------------
export const getBatchEmbedding = async (texts) => {
  const model = await loadModel();

  const results = await model(texts, {
    pooling: "mean",
    normalize: true,
  });

  return results.map((r) => Array.from(r.data));
};
