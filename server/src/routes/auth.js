import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import multer from "multer";
import User from "../models/User.js";
import { authRequired } from "../middleware/auth.js";
import { uploadImageBuffer, deleteImage } from "../lib/cloudinary.js";
import { sendEmailVerification } from "../lib/email.js";

const router = express.Router();
const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_AVATAR_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!file?.mimetype || !ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
      cb(new Error("Only PNG, JPG, JPEG, GIF, or WEBP images are allowed."));
      return;
    }
    cb(null, true);
  },
});

function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), email: user.email, name: user.name },
    process.env.JWT_SECRET || "dev_secret",
    { expiresIn: "7d" }
  );
}

function buildUserResponse(user) {
  return {
    $id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    description: user.description,
    dob: user.dob,
    isEmailVerified: user.isEmailVerified,
    bookmarks: user.bookmarks,
  };
}

function createEmailToken() {
  return crypto.randomBytes(32).toString("hex");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email || "").trim().toLowerCase());
}

function resolvePublicClientOrigin(req) {
  const publicUrl =
    process.env.PUBLIC_APP_URL?.trim() ||
    process.env.APP_PUBLIC_URL?.trim() ||
    process.env.FRONTEND_URL?.trim();
  if (publicUrl) return publicUrl.replace(/\/+$/, "");

  const configuredOrigin = (process.env.CLIENT_ORIGIN || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)[0];
  if (configuredOrigin) return configuredOrigin.replace(/\/+$/, "");

  const requestOrigin = String(req.get("origin") || "").trim();
  if (requestOrigin) return requestOrigin.replace(/\/+$/, "");

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/+$/, "");
  }

  return "http://localhost:5173";
}

router.post("/signup", upload.single("avatar"), async (req, res) => {
  try {
    const { name, email, password, phone, description, dob } = req.body;
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: "Name, email, password, and phone are required." });
    }

    if (!req.file?.buffer) {
      return res.status(400).json({ message: "Profile photo is required." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedPhone = String(phone).trim();
    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Please enter a valid email address." });
    }

    const existing = await User.findOne({
      $or: [{ email: normalizedEmail }, { phone: normalizedPhone }],
    });
    if (existing?.email === normalizedEmail) {
      return res.status(409).json({ message: "Email already in use." });
    }
    if (existing?.phone === normalizedPhone) {
      return res.status(409).json({ message: "Phone already in use." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const avatarUpload = await uploadImageBuffer(req.file.buffer, req.file.originalname, "megablog/avatars");
    const emailVerificationToken = createEmailToken();
    const emailVerificationExpires = new Date(Date.now() + 1000 * 60 * 60 * 24);

    const parsedDob = dob ? new Date(dob) : undefined;
    if (dob && Number.isNaN(parsedDob.getTime())) {
      return res.status(400).json({ message: "Invalid date of birth." });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      phone: normalizedPhone,
      passwordHash,
      avatarUrl: avatarUpload.secure_url,
      avatarPublicId: avatarUpload.public_id,
      description: description ? String(description) : "",
      dob: parsedDob,
      emailVerificationToken,
      emailVerificationExpires,
    });

    const origin = resolvePublicClientOrigin(req);
    await sendEmailVerification({
      to: user.email,
      name: user.name,
      token: emailVerificationToken,
      origin,
    });

    const token = signToken(user);
    return res.json({
      token,
      user: buildUserResponse(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Signup failed." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: String(email).trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = signToken(user);
    return res.json({
      token,
      user: buildUserResponse(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Login failed." });
  }
});

router.get("/me", authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.json(buildUserResponse(user));
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch user." });
  }
});

router.post("/verify-email", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Verification token is required." });

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    });
    if (!user) return res.status(400).json({ message: "Invalid or expired token." });

    user.isEmailVerified = true;
    user.emailVerificationToken = "";
    user.emailVerificationExpires = undefined;
    await user.save();

    return res.json(buildUserResponse(user));
  } catch (error) {
    return res.status(500).json({ message: "Failed to verify email." });
  }
});

router.post("/resend-email-verification", authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    if (user.isEmailVerified) {
      return res.json({ message: "Email already verified." });
    }

    const emailVerificationToken = createEmailToken();
    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 1000 * 60 * 60 * 24);
    await user.save();

    const origin = resolvePublicClientOrigin(req);
    await sendEmailVerification({
      to: user.email,
      name: user.name,
      token: emailVerificationToken,
      origin,
    });

    return res.json({ message: "Verification email sent." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to resend verification email." });
  }
});

router.put("/me", authRequired, upload.single("avatar"), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    const { name, email, phone, description, dob } = req.body;
    if (name !== undefined) user.name = String(name);
    if (description !== undefined) user.description = String(description);
    if (dob !== undefined) {
      const parsedDob = dob ? new Date(dob) : undefined;
      if (dob && Number.isNaN(parsedDob.getTime())) {
        return res.status(400).json({ message: "Invalid date of birth." });
      }
      user.dob = parsedDob;
    }

    if (email !== undefined && String(email).trim().toLowerCase() !== user.email) {
      const normalizedEmail = String(email).trim().toLowerCase();
      if (!isValidEmail(normalizedEmail)) {
        return res.status(400).json({ message: "Please enter a valid email address." });
      }
      const existingEmail = await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } });
      if (existingEmail) return res.status(409).json({ message: "Email already in use." });
      user.email = normalizedEmail;
      user.isEmailVerified = false;
      user.emailVerificationToken = createEmailToken();
      user.emailVerificationExpires = new Date(Date.now() + 1000 * 60 * 60 * 24);
    }

    if (phone !== undefined && String(phone).trim() !== user.phone) {
      const normalizedPhone = String(phone).trim();
      const existingPhone = await User.findOne({ phone: normalizedPhone, _id: { $ne: user._id } });
      if (existingPhone) return res.status(409).json({ message: "Phone already in use." });
      user.phone = normalizedPhone;
    }

    if (req.file?.buffer) {
      await deleteImage(user.avatarPublicId);
      const avatarUpload = await uploadImageBuffer(
        req.file.buffer,
        req.file.originalname,
        "megablog/avatars"
      );
      user.avatarUrl = avatarUpload.secure_url;
      user.avatarPublicId = avatarUpload.public_id;
    }

    await user.save();

    if (!user.isEmailVerified && user.emailVerificationToken) {
      const origin = resolvePublicClientOrigin(req);
      await sendEmailVerification({
        to: user.email,
        name: user.name,
        token: user.emailVerificationToken,
        origin,
      });
    }
    return res.json(buildUserResponse(user));
  } catch (error) {
    return res.status(500).json({ message: "Failed to update profile." });
  }
});

router.get("/author/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.json({
      $id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      description: user.description,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch author." });
  }
});

router.get("/authors", async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.max(parseInt(req.query.limit || "12", 10), 1);

    const filter = q
      ? {
          $or: [
            { name: { $regex: q, $options: "i" } },
            { email: { $regex: q, $options: "i" } },
            { description: { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select("name email avatarUrl description")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.json({
      items: users.map((user) => ({
        $id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        description: user.description || "",
      })),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch authors." });
  }
});

router.get("/bookmarks", authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    return res.json({ bookmarks: user.bookmarks });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch bookmarks." });
  }
});

router.post("/bookmarks/:slug", authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    const slug = req.params.slug;
    if (!user.bookmarks.includes(slug)) {
      user.bookmarks.push(slug);
      await user.save();
    }
    return res.json({ bookmarks: user.bookmarks });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update bookmarks." });
  }
});

router.delete("/bookmarks/:slug", authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    const slug = req.params.slug;
    user.bookmarks = user.bookmarks.filter((item) => item !== slug);
    await user.save();
    return res.json({ bookmarks: user.bookmarks });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update bookmarks." });
  }
});

router.use((error, _req, res, next) => {
  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ message: "Image too large. Maximum size is 2MB." });
  }

  if (error?.message === "Only PNG, JPG, JPEG, GIF, or WEBP images are allowed.") {
    return res.status(400).json({ message: error.message });
  }

  return next(error);
});

export default router;
