import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { Recipe } from "../models/recipe.model.js";


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateMultipleRecipes = async (user, input) => {
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  const prompt = `
Generate EXACTLY 3 different recipes.

User Preferences:
- Diet: ${user.profile?.dietPreference}
- Skill: ${user.profile?.cookingSkill}
- Budget: ${user.preferences?.budgetRange?.max}
- Allergies: ${user.profile?.allergies?.join(", ")}

User Request: ${input}

Return ONLY JSON ARRAY:
[
  {
    "title": "",
    "description": "",
    "ingredients": [{ "name": "", "quantity": "" }],
    "steps": [{ "stepNumber": 1, "instruction": "", "time": 5 }],
    "metadata": {
      "cookingTime": 20,
      "difficulty": "Easy",
      "cuisine": "",
      "dietType": "Veg",
      "costEstimate": 100,
      "calories": 300
    },
    "tags": []
  }
]
`;

  const result = await model.generateContent(prompt);
  let text = result.response.text();

  // clean markdown
  text = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  let recipes = JSON.parse(text);

  // ensure array
  if (!Array.isArray(recipes)) {
    throw new Error("AI did not return array");
  }

  return recipes;
};


export const getFoodImage = async (query) => {
  const res = await axios.get(
    "https://api.unsplash.com/search/photos",
    {
      params: { query: query + " food" },
      headers: {
        Authorization: `Client-ID ${process.env.UNSPLASH_KEY}`,
      },
    }
  );
  // console.log("unsplash image",res.data)
  // console.log("unsplash image results",res.data.results[0]?.urls)

  return res.data.results[0]?.urls?.regular;
};

export const getRecipeImage = async (title) => {
  // 1. cache
  const existing = await Recipe.findOne({ title });
  if (existing?.image) return existing.image;

  // 2. try AI image
  try {
    // return await generateRecipeImage(title);
    return await getFoodImage(title);
  } catch (err) {
    if (err.response?.status === 429) {
      console.log("Rate limit hit → fallback");
    }
  }

  // 3. fallback
  // return await getFoodImage(title);
  return
};


export const generateRecipeImage = async (title) => {
  try {
    const prompt = `Professional food photography of ${title}, 
    Indian cuisine, realistic, 4k, restaurant style plating, warm lighting`;

    const response = await axios.request({
      method: "POST",
      url: "https://chatgpt-42.p.rapidapi.com/texttoimage3",
      headers: {
        "x-rapidapi-key": process.env.RAPID_API_KEY,
        "x-rapidapi-host": "chatgpt-42.p.rapidapi.com",
        "Content-Type": "application/json",
      },
      data: {
        text: prompt,
        width: 512,
        height: 512,
        steps: 1,
      },
    });

    // 🔍 Debug once
    console.log("Image API response:", response.data);

    // ⚠️ Response structure may vary → handle safely
    const imageBase64 =
      response.data?.image ||
      response.data?.data?.image ||
      response.data?.images?.[0];
      response.data?.generated_image;

    if (!imageBase64) {
      throw new Error("No image returned from API");
    }
    console.log("image base 64",imageBase64)

    // 🔥 Upload to Cloudinary
    const uploaded = await uploadOnCloudinary(
      `data:image/png;base64,${imageBase64}`
    );

    console.log("Cloudinary Image",uploaded)

    return uploaded.secure_url;

  } catch (error) {
    console.error("RapidAPI Image Error:", error.message);
    return null;
  }
};
