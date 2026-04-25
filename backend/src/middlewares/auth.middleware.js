// import jwt from "jsonwebtoken";
// import { asyncHandler } from "../utils/asyncHandler.js";
// import { apiError } from "../utils/apiError.js";
// import { User } from "../models/user.model.js";

// // --------------------- PROTECT ROUTE ---------------------
// const protect = asyncHandler(async (req, res, next) => {
//   let token;

//   // Get token from cookie or header
//   if (req.cookies?.accessToken) {
//     token = req.cookies.accessToken;
//   } else if (req.headers.authorization?.startsWith("Bearer")) {
//     token = req.headers.authorization.split(" ")[1];
//   }

//   if (!token) {
//     throw new apiError(401, "Not authorized, token missing");
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//     const user = await User.findById(decoded._id).select("-password -refreshToken");
//     if (!user) throw new apiError(401, "Not authorized, user not found");

//     req.user = user;
//     next();
//   } catch (error) {
//     throw new apiError(401, "Not authorized, token invalid or expired");
//   }
// });

// // --------------------- ADMIN ONLY ---------------------
// const adminOnly = (req, res, next) => {
//   if (req.user.role !== "admin") {
//     throw new apiError(403, "Access denied, admin only");
//   }
//   next();
// };

// export { protect, adminOnly };


import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";

// 🔥 SIMPLE MEMORY CACHE (replace with Redis later)
const userCache = new Map();
const CACHE_TTL = 1000 * 60 * 5; // 5 min

const getCachedUser = async (userId) => {
  const cached = userCache.get(userId);

  if (cached && cached.expiry > Date.now()) {
    return cached.user;
  }

  const user = await User.findById(userId).select("-password -refreshToken");
  if (!user) return null;

  userCache.set(userId, {
    user,
    expiry: Date.now() + CACHE_TTL,
  });

  return user;
};

// --------------------- PROTECT ---------------------
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  } else if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new apiError(401, "Unauthorized: No token");
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch {
    throw new apiError(401, "Token expired or invalid");
  }

  // 🔥 FETCH USER (WITH CACHE)
  const user = await getCachedUser(decoded._id);

  if (!user) {
    throw new apiError(401, "User not found");
  }

  // 🔥 TOKEN VERSION CHECK (CRITICAL)
  if (decoded.tokenVersion !== user.tokenVersion) {
    throw new apiError(401, "Session expired. Please login again.");
  }

  // 🔥 ACCOUNT STATUS
  if (!user.isActive) {
    throw new apiError(403, "Account is deactivated");
  }

  req.user = user;
  next();
});

// --------------------- ADMIN ---------------------
export const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    throw new apiError(403, "Admin only access");
  }
  next();
};