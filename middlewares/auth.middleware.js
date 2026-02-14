import jwt from "jsonwebtoken";
import { errorResponse } from "../src/utils/response.js";

const authMiddleware = (req, res, next) => {
  try {
    console.log("🔐 Auth middleware hit");

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return errorResponse(res, "Token missing", 401);
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return errorResponse(res, "Invalid token format", 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token verified:", decoded);

    // user info attach
    req.user = decoded;

    next();
  } catch (err) {
    console.error("❌ Auth middleware error:", err.message);
    return errorResponse(res, "Unauthorized", 401);
  }
};

export default authMiddleware;
