import { successResponse, errorResponse } from "../../utils/response.js";
import {
  generateAndStoreOtp,
  verifyStoredOtp,
  generateAndStoreEmailOtp,
  verifyEmailOtp,
} from "./auth.service.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../user/user.model.js";
import { generateUniqueUsername } from "../../utils/generateUsername.js";
/* =====================================================
   PHONE OTP (OPTIONAL)
===================================================== */

export const sendOtp = async (req, res) => {
  try {
    console.log("📥 sendOtp API hit");
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return errorResponse(res, "Phone number required", 400);
    }

    const otp = await generateAndStoreOtp(phoneNumber);
    console.log("✅ Phone OTP sent");

    return successResponse(res, "OTP sent successfully", { otp }); // dev only
  } catch (err) {
    console.error("❌ sendOtp error:", err);
    return errorResponse(res, "Failed to send OTP", 500);
  }
};

export const verifyOtp = async (req, res) => {
  try {
    console.log("📥 verifyOtp API hit");
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return errorResponse(res, "Phone number & OTP required", 400);
    }

    const isValid = await verifyStoredOtp(phoneNumber, otp);

    if (!isValid) {
      return errorResponse(res, "Invalid or expired OTP", 401);
    }

    const token = jwt.sign(
      { phoneNumber },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    return successResponse(res, "OTP verified", { token });
  } catch (err) {
    console.error("❌ verifyOtp error:", err);
    return errorResponse(res, "OTP verification failed", 500);
  }
};

/* =====================================================
   EMAIL OTP
===================================================== */

export const sendEmailOtp = async (req, res) => {
  try {
    console.log("📥 sendEmailOtp API hit");
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, "Email required", 400);
    }

    const otp = await generateAndStoreEmailOtp(email);
    console.log("✅ Email OTP sent");

    return successResponse(res, "OTP sent to email", { otp }); // dev only
  } catch (err) {
    console.error("❌ sendEmailOtp error:", err);
    return errorResponse(res, "Failed to send email OTP", 500);
  }
};

export const verifyEmailOtpController = async (req, res) => {
  try {
    console.log("📥 verifyEmailOtp API hit");
    const { email, otp } = req.body;

    if (!email || !otp) {
      return errorResponse(res, "Email & OTP required", 400);
    }

    const isValid = await verifyEmailOtp(email, otp);

    if (!isValid) {
      return errorResponse(res, "Invalid or expired OTP", 401);
    }

    // 🔥 Mark email as verified
    await User.updateOne(
      { email },
      { $set: { isEmailVerified: true } }
    );

    console.log("✅ Email verified in DB");

    return successResponse(res, "Email verified successfully");
  } catch (err) {
    console.error("❌ verifyEmailOtp error:", err);
    return errorResponse(res, "Verification failed", 500);
  }
};

/* =====================================================
   REGISTER
===================================================== */

export const register = async (req, res) => {
  try {
    console.log("➡️ Register API called");

    const { email, password, username } = req.body;

    if (!email || !password) {
      return errorResponse(res, "Email & password required", 400);
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return errorResponse(res, "Email or username already exists", 409);
    }

    // 🔐 hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔥 generate username if not provided
    const finalUsername = username
      ? username.toLowerCase()
      : await generateUniqueUsername(email.split("@")[0]);

    const user = await User.create({
      email,
      password: hashedPassword,
      username: finalUsername,
      isEmailVerified: false,
    });

    await generateAndStoreEmailOtp(email);

    return successResponse(res, "Registration successful", {
      username: finalUsername,
    });
  } catch (err) {
    console.error("❌ Register error:", err);
    return errorResponse(res, "Registration failed", 500);
  }
};


/* =====================================================
   LOGIN
===================================================== */

export const login = async (req, res) => {
  try {
    console.log("➡️ Login API called");

    const { identifier, password } = req.body;
    // identifier = email OR username

    if (!identifier || !password) {
      return errorResponse(res, "Credentials required", 400);
    }

    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier.toLowerCase() },
      ],
    });

    if (!user) {
      return errorResponse(res, "Invalid credentials", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse(res, "Invalid credentials", 401);
    }

    if (!user.isEmailVerified) {
      return errorResponse(res, "Email not verified", 403);
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return successResponse(res, "Login successful", {
      token,
      username: user.username,
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    return errorResponse(res, "Login failed", 500);
  }
};

