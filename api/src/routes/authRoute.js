import express from "express";
import jwt from "jsonwebtoken";
import {
  signup,
  allUsers,
  verifyAccount,
  login,
  refreshToken,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
} from "../controllers/authController.js";

const router = express.Router();

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token || !token.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  const actualToken = token.split(" ")[1];
  jwt.verify(actualToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token." });
    }
    req.user = decoded; // Add user data to request
    next();
  });
};

// Routes
router.post("/signup", signup);
router.get("/all-users", allUsers);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.get("/user/me", verifyToken, getCurrentUser);
router.get("/verify-account", verifyAccount);
router.post("/verify-email", sendVerificationEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
