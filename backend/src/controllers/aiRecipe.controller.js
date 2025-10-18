import { asyncHandler } from "../utils/asyncHandler.js";
import { Recipe } from "../models/recipe.model.js";
import { User } from "../models/user.model.js";
import axios from "axios";
// import { Configuration, OpenAIApi } from "openai";
// import OpenAI from "openai";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// Helper: build base system/user prompt pieces
function buildPreviewPrompt({ ingredients, count = 3, user }) {
  return `
You are a helpful chef assistant.

User profile:
- dietPreference: ${user?.profile?.dietPreference || "Any"}
- cuisine preference (first): ${user?.preferences?.cuisines?.[0] || "Indian"}
- cooking skill: ${user?.profile?.cookingSkill || "Beginner"}
- budget max (₹): ${user?.preferences?.budgetRange?.max ?? "200"}

Task:
Given these available ingredients: ${ingredients.join(", ")}.
Generate exactly ${count} short recipe previews (not full recipes). Each preview must be valid JSON object with keys:
{
  "title": string,
  "shortDescription": string (max 20 words),
  "mainIngredients": [string],  // subset of provided ingredients
  "estimatedCookingTime": number, // minutes
  "difficulty": "Easy"|"Medium"|"Hard",
  "tags": [string]  // up to 4 tags like "Budget","Quick","Kids"
}

Return a JSON array of the recipe preview objects ONLY (no extra commentary).
  `;
}

// Generate 3+ previews and save them as AI-generated (minimal fields)
// const generateRecipePreviews = asyncHandler(async (req, res) => {
//   const { ingredients, count } = req.body; // count optional
//   const userId = req.user._id;
//   if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
//     return res
//       .status(400)
//       .json({ success: false, message: "Provide ingredients array" });
//   }

//   const user = await User.findById(userId).lean();

//   const prompt = buildPreviewPrompt({ ingredients, count: count || 3, user });

//   //   const response = await openai.chat.completions.create({
//   //     model: "gpt-4o-mini",
//   //     messages: [{ role: "user", content: prompt }],
//   //   });

//   // 👇 Replace with your RapidAPI endpoint details
//   const options = {
//     method: "POST",
//     url: "https://free-chatgpt-api.p.rapidapi.com/chat-completion-one", // Example endpoint
//     headers: {
//       "content-type": "application/json",
//       "X-RapidAPI-Key": process.env.RAPID_API_KEY, // Your key from RapidAPI
//       "X-RapidAPI-Host": "free-chatgpt-api.p.rapidapi.com",
//     },
//     data: {
//       model: "gpt-3.5-turbo",
//       messages: [{ role: "user", content: prompt }],
//     },
//   };

//   //   const content = aiResp.data.choices?.[0]?.message?.content ?? "";

//   const response = await axios.request(options);
//   console.log("Response",response)
//   const content = response.choices[0].message.content;

//   // Try to extract JSON safely
//   let previews;
//   try {
//     const firstJson = content.trim().replace(/^[^\[\{]*/, ""); // remove leading text
//     previews = JSON.parse(firstJson);
//     if (!Array.isArray(previews)) throw new Error("Not array");
//   } catch (err) {
//     // If parsing fails, return AI raw content for debugging
//     return res.status(500).json({
//       success: false,
//       message: "Failed to parse AI response",
//       raw: content,
//     });
//   }

//   // Save each preview as a Recipe doc with minimal fields (we'll fill details on demand)
//   const saved = [];
//   for (const p of previews) {
//     const doc = {
//       title: p.title,
//       description: p.shortDescription,
//       ingredients: (p.mainIngredients || []).map((i) => ({
//         name: i,
//         optional: false,
//       })),
//       steps: [], // fill on selection
//       metadata: {
//         cookingTime: p.estimatedCookingTime || 20,
//         difficulty: p.difficulty || "Easy",
//         cuisine: user.preferences.cuisines?.[0] || "Indian",
//         dietType: user.profile.dietPreference || "Any",
//       },
//       tags: p.tags || [],
//       createdBy: userId,
//       source: "AI Generated - preview",
//     };

//     const savedDoc = await Recipe.create(doc);
//     saved.push({
//       _id: savedDoc._id,
//       title: savedDoc.title,
//       description: savedDoc.description,
//       metadata: savedDoc.metadata,
//       tags: savedDoc.tags,
//     });
//   }

//   res.status(201).json({ success: true, previews: saved });
// });


async function callRapidAPI(prompt) {
  const url = "https://free-chatgpt-api.p.rapidapi.com/chat-completion-one";
  const headers = {
    "x-rapidapi-key": process.env.RAPID_API_KEY,
    "x-rapidapi-host": "free-chatgpt-api.p.rapidapi.com",
  };

  // provider expects GET with prompt param
  return axios.get(url, {
    params: { prompt },
    headers,
    timeout: 30000,
  });
}

const generateRecipePreviews = asyncHandler(async (req, res) => {
  const { ingredients, count = 3 } = req.body;
  const userId = req.user?._id;

  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({ success: false, message: "Provide ingredients array" });
  }

  const user = await User.findById(userId).lean();
  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  const buildPrompt = (c) => `
Generate ${c} short healthy ${user.profile?.dietPreference || "Any"} recipes using only these ingredients: ${ingredients.join(", ")}.
Return a JSON array of objects with keys: title, shortDescription, mainIngredients, estimatedCookingTime, difficulty, tags.
Return JSON only (no extra commentary).
`;

  // Try once, if provider returns failed status, retry with very small prompt
  let apiResponse;
  try {
    apiResponse = await callRapidAPI(buildPrompt(count));
  } catch (err) {
    console.error("RapidAPI network/error:", err.response?.data ?? err.message);
    return res.status(502).json({
      success: false,
      message: "AI service request failed (network)",
      error: err.response?.data ?? err.message,
    });
  }

  // Inspect provider response shape
  const data = apiResponse?.data;
  console.log("RapidAPI raw response:", data);

  // If provider returns structured failure: {"status":"failed","message":"..."}
  if (data && typeof data === "object" && (data.status === "failed" || data.error)) {
    // retry once with a tiny prompt
    console.warn("Provider returned failure, retrying with simpler prompt:", data);
    try {
      const retryPrompt = `Say "OK" if the service is available.`;
      const retryResp = await callRapidAPI(retryPrompt);
      const retryData = retryResp?.data;
      console.log("Retry response:", retryData);

      // If retry also fails, return provider message
      if (retryData && typeof retryData === "object" && (retryData.status === "failed" || retryData.error)) {
        return res.status(502).json({
          success: false,
          message: "AI service returned an error",
          providerError: data.message || data.error || data,
          raw: data,
        });
      }
      // If retry succeeded with some text, continue to parsing below using original data
      // but here we return an explicit provider error because the original request failed in a meaningful way.
      return res.status(502).json({
        success: false,
        message: "AI provider temporary error on complex prompt; retry may succeed later.",
        providerError: data.message || data.error || data,
        raw: data,
      });
    } catch (retryErr) {
      console.error("Retry failed:", retryErr.response?.data ?? retryErr.message);
      return res.status(502).json({
        success: false,
        message: "AI service retry failed",
        error: retryErr.response?.data ?? retryErr.message,
      });
    }
  }

  // If response data is a string (text) or an object containing text, normalize to string
  let content = "";
  if (typeof data === "string") {
    content = data;
  } else if (data?.output) {
    content = typeof data.output === "string" ? data.output : JSON.stringify(data.output);
  } else {
    // fallback to stringifying whole object if shape unknown
    content = JSON.stringify(data);
  }

  // Try to extract JSON array from content
  let previews;
  try {
    const start = content.indexOf("[");
    const end = content.lastIndexOf("]");
    if (start === -1 || end === -1) throw new Error("No JSON array found");
    const jsonString = content.slice(start, end + 1);
    previews = JSON.parse(jsonString);
    if (!Array.isArray(previews)) throw new Error("Parsed JSON is not an array");
  } catch (parseErr) {
    console.error("Failed to parse AI output:", parseErr.message, "Raw content:", content);
    return res.status(500).json({
      success: false,
      message: "Failed to parse AI response",
      raw: content,
      parseError: parseErr.message,
    });
  }

  // Save previews into DB (same as before)
  const saved = [];
  for (const p of previews) {
    const title = p.title || "Untitled Recipe";
    const shortDescription = p.shortDescription || "";
    const mainIngredients = Array.isArray(p.mainIngredients) ? p.mainIngredients : (p.ingredients || []).slice(0, 5).map(i => (typeof i === "string" ? i : i.name)).filter(Boolean);
    const estimatedCookingTime = Number(p.estimatedCookingTime) || 20;
    const difficulty = ["Easy","Medium","Hard"].includes(p.difficulty) ? p.difficulty : "Easy";
    const tags = Array.isArray(p.tags) ? p.tags : [];

    const doc = {
      title,
      description: shortDescription,
      ingredients: mainIngredients.map((i) => ({ name: i, optional: false })),
      steps: [],
      metadata: {
        cookingTime: estimatedCookingTime,
        difficulty,
        cuisine: user.preferences?.cuisines?.[0] || "Indian",
        dietType: user.profile?.dietPreference || "Any",
      },
      tags,
      createdBy: userId,
      source: "AI Generated - preview",
    };

    const savedDoc = await Recipe.create(doc);
    saved.push({
      _id: savedDoc._id,
      title: savedDoc.title,
      description: savedDoc.description,
      metadata: savedDoc.metadata,
      tags: savedDoc.tags,
    });
  }

  return res.status(201).json({ success: true, previews: saved });
});



// const generateRecipePreviews = asyncHandler(async (req, res) => {
//   const { ingredients, count = 3 } = req.body;
//   const userId = req.user._id;

//   if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
//     return res.status(400).json({ success: false, message: "Provide ingredients array" });
//   }

//   const user = await User.findById(userId).lean();
//   if (!user) {
//     return res.status(404).json({ success: false, message: "User not found" });
//   }

//   const prompt = `
// Generate ${count} short healthy ${user.profile.dietPreference} recipes using these ingredients: ${ingredients.join(", ")}.
// Each recipe should include:
// - title
// - shortDescription
// - mainIngredients
// - estimatedCookingTime
// - difficulty
// - tags

// Return JSON array only.
// `;

//   try {
//     const response = await axios.get("https://free-chatgpt-api.p.rapidapi.com/chat-completion-one", {
//       params: { prompt },
//       headers: {
//         "x-rapidapi-key": process.env.RAPID_API_KEY,
//         "x-rapidapi-host": "free-chatgpt-api.p.rapidapi.com",
//       },
//       timeout: 30000,
//     });

//     // The API usually returns plain text or JSON string in response.data
//     let content = response.data;
//     if (typeof content !== "string") {
//       content = JSON.stringify(content);
//     }

//     console.log("response",content)
//     // Try to extract and parse JSON array from the content
//     let previews;
//     try {
//       const start = content.indexOf("[");
//       const end = content.lastIndexOf("]");
//       const jsonString = content.slice(start, end + 1);
//       previews = JSON.parse(jsonString);
//     } catch (err) {
//       console.error("Failed to parse AI output:", err.message, "Raw content:", content);
//       return res.status(500).json({
//         success: false,
//         message: "Failed to parse AI response",
//         raw: content,
//       });
//     }

//     // Save previews to DB
//     const saved = [];
//     for (const p of previews) {
//       const doc = {
//         title: p.title,
//         description: p.shortDescription,
//         ingredients: (p.mainIngredients || []).map((i) => ({
//           name: i,
//           optional: false,
//         })),
//         steps: [],
//         metadata: {
//           cookingTime: p.estimatedCookingTime || 20,
//           difficulty: p.difficulty || "Easy",
//           cuisine: user.preferences.cuisines?.[0] || "Indian",
//           dietType: user.profile.dietPreference || "Any",
//         },
//         tags: p.tags || [],
//         createdBy: userId,
//         source: "AI Generated - preview",
//       };

//       const savedDoc = await Recipe.create(doc);
//       saved.push({
//         _id: savedDoc._id,
//         title: savedDoc.title,
//         description: savedDoc.description,
//         metadata: savedDoc.metadata,
//         tags: savedDoc.tags,
//       });
//     }

//     return res.status(201).json({ success: true, previews: saved });
//   } catch (err) {
//     console.error("RapidAPI Error:", err.response?.data || err.message);
//     return res.status(500).json({
//       success: false,
//       message: "AI service request failed",
//       error: err.response?.data || err.message,
//     });
//   }
// });



// Build prompt to expand a saved preview into full recipe (ingredients + detailed steps + estimates)
function buildDetailsPrompt({ previewRecipe, ingredientsAvailable, user }) {
  // previewRecipe is a DB object (title, description, ingredients[] maybe)
  return `
You are a professional recipe author.

User profile:
- diet: ${user?.profile?.dietPreference || "Any"}
- cooking skill: ${user?.profile?.cookingSkill || "Beginner"}
- budget max (₹): ${user?.preferences?.budgetRange?.max ?? "200"}
- available ingredients: ${ingredientsAvailable.join(", ")}

Task:
Expand the following recipe preview into a FULL recipe in JSON. Use the DB preview information when relevant.

Preview:
Title: ${previewRecipe.title}
Short desc: ${previewRecipe.description || ""}
MainIngredients: ${
    previewRecipe.ingredients.map((i) => i.name).join(", ") || "Use available"
  }

Return ONE JSON object with exact keys:
{
  "title": string,
  "description": string,
  "ingredients": [{"name": "", "quantity": "", "optional": boolean}],
  "steps": [{"stepNumber": 1, "instruction": "", "time": number}],
  "metadata": {"cookingTime": number, "difficulty": "Easy"|"Medium"|"Hard", "cuisine": "", "dietType": "", "costEstimate": number, "calories": number},
  "tags": [string]
}

Keep instructions clear and suitable for the declared cooking skill. Do not include any text outside the JSON.
  `;
}

const getOrGenerateRecipeDetails = asyncHandler(async (req, res) => {
  // GET /api/recipes/:id/details
  const recipeId = req.params.id;
  const userId = req.user._id;
  const { ingredientsAvailable } = req.body || {}; // optional: current pantry to influence choices

  const recipe = await Recipe.findById(recipeId);
  if (!recipe)
    return res
      .status(404)
      .json({ success: false, message: "Recipe not found" });

  // If recipe already has steps and ingredient quantities, return directly
  const hasDetails =
    Array.isArray(recipe.steps) &&
    recipe.steps.length > 0 &&
    recipe.ingredients.some((ing) => ing.quantity);
  if (hasDetails) {
    return res.json({ success: true, recipe });
  }

  const user = await User.findById(userId).lean();
  const prompt = buildDetailsPrompt({
    previewRecipe: recipe.toObject(),
    ingredientsAvailable:
      ingredientsAvailable || recipe.ingredients.map((i) => i.name),
    user,
  });

  const aiResp = await openai.createChatCompletion({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.8,
    max_tokens: 1200,
  });

  const content = aiResp.data.choices?.[0]?.message?.content ?? "";

  let full;
  try {
    full = JSON.parse(content);
  } catch (err) {
    // Gentle extraction attempt, then fail if necessary
    try {
      const onlyJson = content.slice(
        content.indexOf("{"),
        content.lastIndexOf("}") + 1
      );
      full = JSON.parse(onlyJson);
    } catch (err2) {
      return res.status(500).json({
        success: false,
        message: "Failed to parse AI details",
        raw: content,
      });
    }
  }

  // Update recipe doc with full details
  recipe.title = full.title || recipe.title;

  recipe.description = full.description || recipe.description;

  recipe.ingredients = (full.ingredients || []).map((i) => ({
    name: i.name,
    quantity: i.quantity || "",
    optional: !!i.optional,
  }));

  recipe.steps = (full.steps || []).map((s) => ({
    stepNumber: s.stepNumber,
    instruction: s.instruction,
    time: s.time || null,
  }));

  recipe.metadata = {
    cookingTime:
      full.metadata?.cookingTime || recipe.metadata.cookingTime || 30,

    difficulty:
      full.metadata?.difficulty || recipe.metadata?.difficulty || "Easy",

    cuisine:
      full.metadata?.cuisine ||
      recipe.metadata?.cuisine ||
      recipe.metadata.cuisine,

    dietType: full.metadata?.dietType || recipe.metadata?.dietType || "Any",

    costEstimate:
      full.metadata?.costEstimate || recipe.metadata?.costEstimate || 0,

    calories: full.metadata?.calories || recipe.metadata?.calories || null,
  };
  recipe.tags = full.tags || recipe.tags;
  recipe.source = "AI Generated";

  await recipe.save();

  res.json({ success: true, recipe });
});

export { generateRecipePreviews, getOrGenerateRecipeDetails };
