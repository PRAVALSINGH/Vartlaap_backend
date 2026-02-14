import twilio from "twilio";
import Redis from "../../redis/redis-client.js";
import { sendOtpEmail } from "../../utils/email.js";

console.log("🔐 TWILIO_SID:", process.env.TWILIO_SID);
console.log("🔐 TWILIO_PHONE_NUMBER:", process.env.TWILIO_PHONE_NUMBER);

const twilioClient = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// -------------------- PHONE OTP SERVICE --------------------

export const generateAndStoreOtp = async (phoneNumber) => {
  console.log("⚙️ generateAndStoreOtp called");
  console.log("📞 Phone Number:", phoneNumber);

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log("🔑 Generated Phone OTP:", otp);

  await Redis.set(`OTP_${phoneNumber}`, otp, "EX", 300);
  console.log("🧠 Phone OTP stored in Redis (5 min)");

  await twilioClient.messages.create({
    body: `Your OTP is ${otp}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phoneNumber.startsWith("+") ? phoneNumber : `+91${phoneNumber}`,
  });

  console.log("📨 SMS sent via Twilio");
  return otp;
};

export const verifyStoredOtp = async (phoneNumber, otp) => {
  console.log("🔍 verifyStoredOtp called");
  console.log("📞 Phone:", phoneNumber, "🔑 OTP:", otp);

  const storedOtp = await Redis.get(`OTP_${phoneNumber}`);
  console.log("🧠 OTP from Redis:", storedOtp);

  if (!storedOtp) {
    console.log("❌ No OTP found / expired");
    return false;
  }

  const match = storedOtp === otp;
  console.log("✅ OTP match status:", match);

  return match;
};

// -------------------- EMAIL OTP SERVICE --------------------

export const generateAndStoreEmailOtp = async (email) => {
  console.log("⚙️ generateAndStoreEmailOtp called");
  console.log("📧 Email:", email);

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log("🔑 Generated Email OTP:", otp);

  await Redis.set(`EMAIL_OTP_${email}`, otp, "EX", 300);
  console.log("🧠 Email OTP stored in Redis (5 min)");

  await sendOtpEmail(email, otp);
  console.log("📨 OTP email sent");

  return otp;
};

export const verifyEmailOtp = async (email, otp) => {
  console.log("🔍 verifyEmailOtp called");
  console.log("📧 Email:", email, "🔑 OTP:", otp);

  const storedOtp = await Redis.get(`EMAIL_OTP_${email}`);
  console.log("🧠 OTP from Redis:", storedOtp);

  if (!storedOtp) {
    console.log("❌ No Email OTP found / expired");
    return false;
  }

  const match = storedOtp === otp;
  console.log("✅ Email OTP match status:", match);

  return match;
};
