import express from "express";
import { toggleLike } from "../../controllers/PostControllers/like.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";


const router = express.Router()

router.post("/toggle", protect, toggleLike)


export default router