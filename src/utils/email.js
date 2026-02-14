import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOtpEmail = async (toEmail, otp) => {
  await transporter.sendMail({
    from: `"Vartalaap App" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Your OTP Code",
    text: `Your OTP is ${otp}`,
    html: `
      <h2>Your OTP</h2>
      <p>Your OTP is <b>${otp}</b></p>
      <p>This OTP will expire in 5 minutes.</p>
    `,
  });
};
