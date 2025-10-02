import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import {
  uploadOnCloudinary,
  deleteImageFromCloudinary,
} from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// --------------------- TOKEN GENERATION ---------------------
const generateTokens = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new apiError(500, "User not found for token generation");

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

// --------------------- AUTH CONTROLLERS ---------------------
const registerUser = asyncHandler(async (req, res) => {
  const { userName, fullName, email, phoneNo, password } = req.body;
  if (!userName || !fullName || !email || !phoneNo || !password) {
    throw new apiError(400, "All fields are required");
  }

  const existingUser = await User.findOne({ $or: [{ userName }, { email }] });
  if (existingUser) throw new apiError(409, "User already exists");

  if (!req.file) throw new apiError(400, "Avatar file is required");
  const avatar = await uploadOnCloudinary(req.file.path);

  const user = await User.create({
    userName: userName.toLowerCase(),
    fullName,
    email,
    phoneNo,
    password,
    avatar: avatar.secure_url,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  return res
    .status(201)
    .json(new apiResponse(201, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, userName, password } = req.body;
  if (!(email || userName))
    throw new apiError(400, "Username or email is required");

  const user = await User.findOne({ $or: [{ email }, { userName }] });
  if (!user) throw new apiError(404, "User not found");

  const validPassword = await user.isPasswordCorrect(password);
  if (!validPassword) throw new apiError(401, "Invalid password");

  const { accessToken, refreshToken } = await generateTokens(user._id);

  const options = { httpOnly: true, secure: true };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponse(
        200,
        {
          user: await User.findById(user._id).select("-password -refreshToken"),
          accessToken,
          refreshToken,
        },
        "Logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });
  return res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new apiResponse(200, {}, "Logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingToken) throw new apiError(401, "Unauthorized request");

  const decoded = jwt.verify(incomingToken, process.env.REFRESH_TOKEN_SECRET);
  const user = await User.findById(decoded._id);
  if (!user || user.refreshToken !== incomingToken)
    throw new apiError(401, "Invalid refresh token");

  const { accessToken, refreshToken } = await generateTokens(user._id);
  const options = { httpOnly: true, secure: true };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponse(
        200,
        { accessToken, refreshToken },
        "Access token refreshed"
      )
    );
});

// --------------------- PROFILE & ACCOUNT ---------------------
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new apiResponse(200, req.user, "User fetched successfully"));
});

const updateAccountDetail = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!fullName || !email) throw new apiError(400, "All fields are required");

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { fullName, email } },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(new apiResponse(200, user, "Account updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new apiError(400, "Avatar file missing");

  const user = await User.findById(req.user._id);
  if (user.avatar) await deleteImageFromCloudinary(user.avatar);

  const avatar = await uploadOnCloudinary(req.file.path);
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: avatar.secure_url },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(new apiResponse(200, updatedUser, "Avatar updated successfully"));
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const { dietPreference, cookingSkill, allergies } = req.body;
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        "profile.dietPreference": dietPreference,
        "profile.cookingSkill": cookingSkill,
        "profile.allergies": allergies,
      },
    },
    { new: true }
  ).select("-password");
  res
    .status(200)
    .json(new apiResponse(200, updatedUser, "Profile updated successfully"));
});

const updateUserPreferences = asyncHandler(async (req, res) => {
  const { budgetRange, cuisines } = req.body;
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { preferences: { budgetRange, cuisines } } },
    { new: true }
  ).select("-password");
  res
    .status(200)
    .json(
      new apiResponse(200, updatedUser, "Preferences updated successfully")
    );
});

// --------------------- PASSWORD MANAGEMENT ---------------------
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  const isValid = await user.isPasswordCorrect(oldPassword);
  if (!isValid) throw new apiError(400, "Old password is incorrect");

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  res
    .status(200)
    .json(new apiResponse(200, {}, "Password changed successfully"));
});

// --------------------- RECIPE & SHOPPING LIST ---------------------
const saveRecipe = asyncHandler(async (req, res) => {
  const { recipeId } = req.body;
  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { savedRecipes: recipeId },
  });
  res.status(200).json(new apiResponse(200, {}, "Recipe saved successfully"));
});

const removeSavedRecipe = asyncHandler(async (req, res) => {
  const { recipeId } = req.body;
  await User.findByIdAndUpdate(req.user._id, {
    $pull: { savedRecipes: recipeId },
  });
  res.status(200).json(new apiResponse(200, {}, "Recipe removed successfully"));
});

const addToShoppingList = asyncHandler(async (req, res) => {
  let { items } = req.body;
  if (!Array.isArray(items)) {
    items = [items];
  }
  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { shoppingList: { $each: items } },
  });
  res
    .status(200)
    .json(new apiResponse(200, {}, "Items added to shopping list"));
});

const removeFromShoppingList = asyncHandler(async (req, res) => {
  let { items } = req.body;
  if (!Array.isArray(items)) {
    items = [items];
  }
  await User.findByIdAndUpdate(req.user._id, {
    $pull: { shoppingList: { $in: items } },
  });
  res
    .status(200)
    .json(new apiResponse(200, {}, "Items removed from shopping list"));
});

// --------------------- ADMIN CONTROLLERS ---------------------
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password -refreshToken");
  res.status(200).json(new apiResponse(200, users, "All users fetched"));
});

const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(userId))
    throw new apiError(400, "Invalid user ID");

  const user = await User.findById(userId).select("-password -refreshToken");
  if (!user) throw new apiError(404, "User not found");
  res.status(200).json(new apiResponse(200, user, "User fetched successfully"));
});

const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(userId))
    throw new apiError(400, "Invalid user ID");

  await User.findByIdAndDelete(userId);
  res.status(200).json(new apiResponse(200, {}, "User deleted successfully"));
});

// --------------------- EXPORTS ---------------------
export {
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
};
