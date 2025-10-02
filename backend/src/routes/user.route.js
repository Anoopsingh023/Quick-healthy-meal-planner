// import { Router } from "express";
// import {
//     registerUser,
//     loginUser
// } from "../controllers/user.controller.js";

// const router = Router()

// router.route("/register").post(upload.single("avatar"),registerUser)
// router.route("/login").post(loginUser);

// export default router;

import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  updateAccountDetail,
  updateUserAvatar,
  updateUserProfile,
  updateUserPreferences,
  changePassword,
  saveRecipe,
  removeSavedRecipe,
  addToShoppingList,
  removeFromShoppingList,
  getAllUsers,
  getUserById,
  deleteUser,
} from "../controllers/user.controller.js";
import { protect, adminOnly } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

// --------------------- AUTH ROUTES ---------------------
router.post("/register", upload.single("avatar"), registerUser);
router.post("/login", loginUser);
router.post("/logout", protect, logoutUser);
router.post("/refresh-token", refreshAccessToken);

// --------------------- PROFILE & ACCOUNT ---------------------
router.get("/me", protect, getCurrentUser);
router.put("/me/account", protect, updateAccountDetail);
router.put("/me/avatar", protect, upload.single("avatar"), updateUserAvatar);
router.put("/me/profile", protect, updateUserProfile);
router.put("/me/preferences", protect, updateUserPreferences);
router.put("/me/password", protect, changePassword);

// --------------------- RECIPE & SHOPPING LIST ---------------------
router.post("/me/recipes", protect, saveRecipe);
router.delete("/me/recipes", protect, removeSavedRecipe);
router.post("/me/shopping-list", protect, addToShoppingList);
router.delete("/me/shopping-list", protect, removeFromShoppingList);

// --------------------- ADMIN ROUTES ---------------------
router.get("/", protect, adminOnly, getAllUsers);
router.get("/:userId", protect, adminOnly, getUserById);
router.delete("/:userId", protect, adminOnly, deleteUser);

export default router;
