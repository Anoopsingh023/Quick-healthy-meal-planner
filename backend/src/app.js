import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import bodyParser from "body-parser"
import axios from "axios"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true,limit: "16kb"}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"))
app.use(cookieParser())

// const API_KEY = process.env.SPOONACULAR_API_KEY;

// Endpoint: Search recipes by ingredients
// app.get("/recipes", async (req, res) => {
//   try {
//     const ingredients = "egg, tomato"; // ?ingredients=egg,tomato
//     const response = await axios.get(
//       `https://api.spoonacular.com/recipes/findByIngredients`,
//       {
//         params: {
//           ingredients: ingredients,
//           number: 5, // limit results
//           apiKey: API_KEY,
//         },
//       }
//     );

//     res.json(response.data);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// Endpoint: Get full recipe details
// app.get("/recipes/:id", async (req, res) => {
//   try {
//     const recipeId = req.params.id;
//     const response = await axios.get(
//       `https://api.spoonacular.com/recipes/${recipeId}/information`,
//       {
//         params: { apiKey: API_KEY },
//       }
//     );

//     res.json(response.data);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

import userRouter from "./routes/user.route.js"
import recipeRouter from "./routes/recipe.route.js"


app.use("/api/v1/users", userRouter)
app.use("/api/v1/recipes", recipeRouter)





export {app}