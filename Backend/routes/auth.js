const express = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { auth } = require("../middleware/auth");
const {
  validateRegistration,
  validateLogin,
  validatePasswordChange,
} = require("../middleware/validation");
const emailService = require("../services/emailService");

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post("/register", validateRegistration, async (req, res) => {
  try {
    const { name, email: rawEmail, password } = req.body;

    // Normalize email to lowercase
    const email = rawEmail.toLowerCase();
    console.log("Registering email:", email);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
    });

    await user.save();

    // Generate auth token
    const token = generateToken(user._id);

    // Prepare response without sensitive fields
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: userResponse,
        token,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", validateLogin, async (req, res) => {
  try {
    // 1) Normalize email + grab password from request
    const rawEmail = req.body.email || "";
    const email = rawEmail.trim().toLowerCase();
    const password = req.body.password || "";

    // 2) fetch user (including the password hash)
    let user = await User.findOne({ email }).select("+password");

    // Special handling for Gmail addresses
    if (!user && email.endsWith("@gmail.com")) {
      // Get local part (before @) and remove dots for Gmail
      const [localPart, domain] = email.split("@");
      const normalizedLocalPart = localPart.replace(/\./g, "");
      const normalizedEmail = `${normalizedLocalPart}@${domain}`;

      // Try to find with normalized email (no dots)
      user = await User.findOne({
        email: { $regex: new RegExp(`^${normalizedEmail}$`, "i") },
      }).select("+password");

      // If still not found, try to find with dots
      if (!user) {
        // Get all users and find one with matching normalized email
        const allUsers = await User.find().select("+password");
        user = allUsers.find((u) => {
          if (u.email.endsWith("@gmail.com")) {
            const [uLocalPart, uDomain] = u.email.split("@");
            const uNormalizedPart = uLocalPart.replace(/\./g, "");
            return (
              uNormalizedPart.toLowerCase() ===
              normalizedLocalPart.toLowerCase()
            );
          }
          return false;
        });
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 4) compare the candidate password to the stored hash
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      console.log("⚠️ Password compare failed.");
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 5) At this point, login is valid:
    await user.updateLastLogin();
    const token = generateToken(user._id);
    const userResponse = user.toObject();
    delete userResponse.password;
    return res.json({
      success: true,
      message: "Login successful",
      data: { user: userResponse, token },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post("/logout", auth, async (req, res) => {
  res.json({
    success: true,
    message: "Logout successful",
  });
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user data",
    });
  }
});

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post(
  "/change-password",
  auth,
  validatePasswordChange,
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      // Get user with password
      const user = await User.findById(req.user._id).select("+password");

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(
        currentPassword
      );
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to change password",
      });
    }
  }
);

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
// Updated forgot-password route with lowercase normalization and early return
router.post("/forgot-password", async (req, res) => {
  try {
    // Normalize the email to lowercase
    const rawEmail = req.body.email;
    const email = rawEmail && rawEmail.toLowerCase();

    // Look up user using normalized email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Save the updated user
    await user.save();

    // Send reset email
    try {
      await emailService.sendPasswordResetEmail(user.email, resetToken);
      res.json({
        success: true,
        message: "Password reset email sent",
      });
    } catch (emailError) {
      console.error("Email send failed:", emailError);
      // Roll back token fields on error
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      res.status(500).json({
        success: false,
        message: "Failed to send password reset email",
      });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process password reset request",
    });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Update password
    user.set("password", password.trim());

    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    console.log("New hashed password:", user.password);

    await user.save();

    res.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset password",
    });
  }
});

// @route   POST /api/auth/verify-email
// @desc    Verify email address
// @access  Public
router.post("/verify-email", async (req, res) => {
  try {
    const { token } = req.body;

    const user = await User.findOne({ emailVerificationToken: token });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification token",
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify email",
    });
  }
});

module.exports = router;
