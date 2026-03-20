import express from "express";
import { toggleRecipeLike } from "../../controllers/PostControllers/like.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";


const router = express.Router()

router.post("/toggle/r/:recipeId", protect, toggleRecipeLike)


export default router