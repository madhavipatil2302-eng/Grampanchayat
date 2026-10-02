import LoginModel from "../Shema/loginSchma.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();
import Transporter from "../EmailSetup/Email.js";
import bcrypt from 'bcrypt';
import { StoreIpInDB } from "../Shema/IPwithlist.js";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function normalizeEmail(email = "") {
  return email.trim().toLowerCase();
}

function isActiveAccount(user) {
  const status = String(user.status || "").trim().toLowerCase();
  const valid = String(user.valid || "").trim().toLowerCase();

  return !status || status === "active" || valid === "active" || valid === "true" || valid === "valid";
}

function getSavedPassword(user) {
  return user.password || user.pass || "";
}

function sendSafeUser(user) {
  return {
    id: user._id,
    fullName: user.fullName,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    profilePhoto: user.profilePhoto,
  };
}

export const AdminLoginPage = (req, res) => {
  return res.render("Login", { error: "" });
};

export const EmailVirify = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);

    const ip = req.ip || req.socket.remoteAddress;

    console.log(" This Is The User IP",ip);

    await StoreIpInDB.create({ ip });

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email.",
      });
    }

    const user = await LoginModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email is not found.",
      });
    }

    if (!isActiveAccount(user)) {
      return res.status(403).json({
        success: false,
        message: "This account is not active.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Email verified successfully.",
      user: sendSafeUser(user),
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const CheckIpAccess = async (req, res) => {
  try {
    const ip = req.ip || req.socket.remoteAddress;
    const blocked = await StoreIpInDB.exists({ ip, block: true });

    return res.status(200).json({ allowed: !blocked });
  } catch (err) {
    console.log("IP access check error", err);
    return res.status(500).json({ allowed: false, message: "Unable to verify access." });
  }
};

export const AdminLogin = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email.",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Please enter password.",
      });
    }

    const user = await LoginModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email is not found.",
      });
    }

    if (!isActiveAccount(user)) {
      return res.status(403).json({
        success: false,
        message: "This account is not active.",
      });
    }

    const savedPassword = String(getSavedPassword(user));
    const passwordMatches = /^\$2[aby]\$/.test(savedPassword)
      ? await bcrypt.compare(password, savedPassword)
      : savedPassword === password;

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid password.",
      });
    }

    if (!process.env.JWT_SECRET_KEY) {
      return res.status(500).json({
        success: false,
        message: "JWT secret key is not configured.",
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: sendSafeUser(user),
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const ForGatePassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email.",
      });
    }

    const user = await LoginModel.findOne({ email });
    if (user && isActiveAccount(user)) {
      const temporaryPassword = crypto.randomBytes(9).toString("base64url");
      user.password = await bcrypt.hash(temporaryPassword, 10);
      await user.save();

      await Transporter.sendMail({
        from: process.env.EMAIL || process.env.EMAIL_USER,
        to: user.email,
        subject: "Password reset instructions",
        text: `Your temporary password is ${temporaryPassword}. Sign in and change it as soon as possible.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "If the email is registered, password reset instructions will be sent.",
    });
  } catch (error) {
    console.log("Forgot password error", error);
    return res.status(500).json({
      success: false,
      message: "Unable to process the password reset request. Please try again later.",
    });
  }
};
