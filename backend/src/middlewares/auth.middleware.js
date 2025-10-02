import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";

// --------------------- PROTECT ROUTE ---------------------
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Get token from cookie or header
  if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  } else if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new apiError(401, "Not authorized, token missing");
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded._id).select("-password -refreshToken");
    if (!user) throw new apiError(401, "Not authorized, user not found");

    req.user = user;
    next();
  } catch (error) {
    throw new apiError(401, "Not authorized, token invalid or expired");
  }
});

// --------------------- ADMIN ONLY ---------------------
const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    throw new apiError(403, "Access denied, admin only");
  }
  next();
};

export { protect, adminOnly };
