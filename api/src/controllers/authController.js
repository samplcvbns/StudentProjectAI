import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import User from "../models/userModel.js";
import { transporter } from "../utils/emailTransporterUtil.js";
import {
  sendEmailForForgotPassword,
  sendEmailToVerify,
} from "../services/emailService.js";
import { generateToken } from "../utils/generateTokenUtil.js";

// const transporter = nodemailer.createTransport({
//   service: "Gmail", // You can use other services like Outlook, Yahoo, etc.
//   auth: {
//     user: "chinedusimeon2020@gmail.com", // Your Gmail address
//     pass: "", // Your email password or app password
//   },
// });

// Utility function to generate JWT with expiration and issuer

// Signup controller
export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashedPassword });

    await newUser.save();

    // Generate a verification token
    const verificationToken = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" } // Token expires in 1 day
    );

    const verificationLink = `${process.env.FRONTEND_URL}/verify-account?token=${verificationToken}`;

    await sendEmailToVerify(name, email, verificationLink);

    res.status(201).json({
      message: "Signup successful. Check your email to verify your account.",
      verificationToken,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Verify account controller
export const verifyAccount = async (req, res) => {
  const { token } = req.query; // Token passed as a query parameter

  if (!token) {
    return res.status(400).json({ message: "Verification token is required" });
  }

  try {
    // Decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user in the database
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.verified) {
      return res.status(400).json({ message: "Account already verified" });
    }

    // Update the verified status
    user.verified = true;
    await user.save();

    res.status(200).json({ message: "Account successfully verified" });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Invalid or expired token", error: err.message });
  }
};

// Login controller
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ email: "Email not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ password: "Password does not match" });
    }

    const token = generateToken(user._id);
    res.status(200).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Refresh token controller
export const refreshToken = (req, res) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET,
    { ignoreExpiration: true },
    (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid token." });
      }

      const newToken = generateToken(decoded.id);
      res.status(200).json({ token: newToken });
    }
  );
};

// Get current user controller (protected route)
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id; // Access the user ID from the decoded token
    const user = await User.findById(userId).select("-password"); // Don't send password back
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user); // Return the user data
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Generate a reset token
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h", // Token expires in 1 hour
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Send reset email
    await sendEmailForForgotPassword(email, resetLink);
    res
      .status(200)
      .json({ message: "Password reset link sent to your email.", resetToken });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const resetPassword = async (req, res) => {
  const { token } = req.query;
  const { newPassword } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Token is required." });
  }

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({
      message: "New password is required and must be at least 6 characters.",
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by ID
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password reset successful." });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Reset token has expired." });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const sendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find the user in the database by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a JWT token for verification
    const verificationToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" } // Token expires in 1 day
    );

    // Construct verification link
    const verificationLink = `http://localhost:5173/verify-email?token=${verificationToken}`;

    // Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "Gmail", // You can use other services like Outlook, Yahoo, etc.
      auth: {
        user: "chinedusimeon2020@gmail.com", // Your Gmail address
        pass: "miseopnfheyyjapz", // Your email password or app password
      },
    });

    // Send the email
    await transporter.sendMail({
      from: "chinedusimeon2020@gmail.com",
      to: email,
      subject: "Verify Your Account",
      html: `
      <div style="
        font-family: 'Montserrat', sans-serif; 
        background-color: #f9f9f9; 
        padding: 20px; 
        text-align: center; 
        color: #333;">
        <div style="
          max-width: 600px; 
          margin: auto; 
          background: white; 
          border-radius: 10px; 
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); 
          overflow: hidden;">
          <div style="padding: 20px 20px 0;">
            <img src="https://speunibenvoting.vercel.app/assets/spelogo-CmFXs7lC.jpeg" alt="Logo" style="width: 150px; height: auto;" />
          </div>
          <div style="
            background: #1c80df; 
            color: white; 
            padding: 15px 20px;">
            <h1 style="margin: 0; font-size: 24px; font-family: 'Montserrat', sans-serif;">Welcome to SPE UNIBEN ELECTION!</h1>
          </div>
          <div style="padding: 20px;">
            <p style="font-size: 16px; margin-bottom: 20px; color: #333; font-family: 'Montserrat', sans-serif;">
              Hello ${email.split("@")[0]},<br/><br/>
              We're excited to have you join our community. Please verify your email to get started and enjoy all the benefits of our platform.
            </p>
            <a href="${verificationLink}" style="
              display: inline-block; 
              text-decoration: none; 
              background-color: #1c80df; 
              color: white; 
              padding: 12px 25px; 
              font-size: 16px; 
              border-radius: 5px; 
              box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1); 
              font-family: 'Montserrat', sans-serif;">
              Verify My Account
            </a>
          </div>
          <div style="
            background: #f1f1f1; 
            color: #777; 
            font-size: 12px; 
            padding: 10px 20px;">
            <p style="margin: 0; font-family: 'Montserrat', sans-serif;">
              Need help? Check out our <a href="https://help.yourplatform.com" style="color: #1c80df; text-decoration: none;">Help Center</a> or contact support.
            </p>
            <p style="margin-top: 5px; font-family: 'Montserrat', sans-serif;">&copy; 2024 [Your Platform Name]. All rights reserved.</p>
          </div>
        </div>
      </div>
    `,
    });

    res.status(200).json({ message: "Verification email sent successfully!" });
  } catch (error) {
    console.error("Error sending verification email:", error);
    res.status(500).json({
      message: "Failed to send verification email",
      error: error.message,
    });
  }
};

export const allUsers = async (req, res) => {
  const users = await User.find({});
  res.status(200).json({ allUsers: users });
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
