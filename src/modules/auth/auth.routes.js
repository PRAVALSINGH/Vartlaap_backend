import express from "express";
import {
  sendOtp,
  verifyOtp,
  sendEmailOtp,
  verifyEmailOtpController,
  register,
  login
} from "./auth.controller.js";

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

// ----------------------------------------------------------------------------------------//

router.post("/send-email-otp", sendEmailOtp);
router.post("/verify-email-otp", verifyEmailOtpController);

// ----------------------------------------------------------------------------------------

router.post("/register", register);
router.post("/login", login);


export default router;
