import Fuse from "fuse.js";

// 🔥 Build dictionary (IMPORTANT)
let dictionary = [];

export const buildDictionary = async (recipes) => {
  const words = new Set();

  recipes.forEach((r) => {
    // title words
    r.title?.split(" ").forEach((w) => words.add(w.toLowerCase()));

    // ingredients
    r.ingredients?.forEach((i) => words.add(i.name.toLowerCase()));

    // cuisine
    if (r.metadata?.cuisine) {
      words.add(r.metadata.cuisine.toLowerCase());
    }

    // tags
    r.tags?.forEach((t) => words.add(t.toLowerCase()));
  });

  dictionary = Array.from(words);
  if (dictionary.length > 5000) {
    dictionary = dictionary.slice(0, 5000);
  }
};

// 🔥 Fuse instance
let fuse = null;

export const initAutoCorrect = () => {
  fuse = new Fuse(dictionary, {
    includeScore: true,
    threshold: 0.2, // lower = stricter
    minMatchCharLength: 3,
  });
};

// 🔥 Correct single word
const correctWord = (word) => {
  if (!fuse) return word;

  const result = fuse.search(word);

  if (result.length > 0 && result[0].score < 0.3) {
    return result[0].item;
  }

  return word;
};

const correctionCache = new Map();
// 🔥 Correct full query
export const autoCorrectQuery = (query) => {
  if (correctionCache.has(query)) {
    return correctionCache.get(query);
  }
  const corrected = query
    .split(" ")
    .map((word) => correctWord(word))
    .join(" ");

  correctionCache.set(query, corrected);

  return corrected;
};
