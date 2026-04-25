import { OAuth2Client } from "google-auth-library";
import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateTokens } from "./user.controller.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = asyncHandler(async (req, res) => {
  const { credential } = req.body; // Google ID token

  if (!credential) {
    throw new apiError(400, "No Google credential provided");
  }

  // 🔥 Verify token with Google
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  const { email, name, picture, sub } = payload;

  // 🔥 Check if user exists
  let user = await User.findOne({ email });

  if (!user) {
    const baseUserName = email.split("@")[0].slice(0, 10);
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);

    user = await User.create({
    email,
    fullName: name,
    userName: `${baseUserName}_${randomSuffix}`,
    avatar: picture,
    googleId: sub,
    isVerified: true,
    password: sub, // dummy
  });
  }

  const { accessToken, refreshToken } = await generateTokens(user);

  res
    .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
    .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true })
    .json(new apiResponse(200, { user }, "Google login successful"));
});

export {googleLogin}