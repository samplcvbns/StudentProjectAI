import express from "express";
import jwt from "jsonwebtoken";
import {
  signup,
  verifyAccount,
  login,
  refreshToken,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  allUsers,
  deleteUser,
} from "../controllers/authController.js";
import { verifyToken } from "../middlewares/verifyTokenMiddleware.js";

const router = express.Router();

// Middleware to verify token

// Routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.get("/user/me", verifyToken, getCurrentUser);
router.get("/verify-account", verifyAccount);
router.post("/verify-email", sendVerificationEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/all-users", allUsers);
router.delete("/delete-user/:id", deleteUser);

export default router;
