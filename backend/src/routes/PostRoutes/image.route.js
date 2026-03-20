import express from "express";
import {
  createImage,
  getAllImages,
  getImageById,
  updateImage,
  deleteImage,
  togglePublish,
  incrementViews,
} from "../../controllers/PostControllers/image.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { upload } from "../../middlewares/multer.middleware.js";

const router = express.Router()

router.post("/create",protect, upload.single("imageFile") , createImage);
router.get("/", getAllImages);
router.get("/:id", getImageById);
router.patch("/update/:id", protect, updateImage);
router.delete("/delete/:id", protect, deleteImage);
router.patch("/:id/toggle-publish", protect, togglePublish);
router.patch("/:id/view", incrementViews);

// router.patch("/:id/save", protect, toggleSavePost);
// router.get("/user/:userId", getUserPosts);
// router.get("/feed/following", protect, getFollowingFeed);

export default router;
