import { Router } from "express";
import {
  createComment,
  deleteComment,
  getComments,
  getReplies
} from "../../controllers/PostControllers/comment.controller.js";
import {protect} from "../../middlewares/auth.middleware.js"

const router = Router();

router.use(protect);

// Create comment or reply
router.post("/", createComment);

// Get comments of a post (pagination)
router.get("/get/:postId", getComments);

// Delete comment
router.delete("/delete/:commentId", deleteComment);

// get all replies
router.get("/replies/:commentId", getReplies);

export default router;