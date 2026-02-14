import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import { authRequired } from "../middleware/auth.js";
import { uploadImageBuffer, deleteImage } from "../lib/cloudinary.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer({ storage: multer.memoryStorage() });

router.get("/", async (req, res) => {
  try {
    const status = req.query.status;
    const category = req.query.category;
    const tag = req.query.tag;
    const q = req.query.q;
    const author = req.query.author;

    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (tag) filter.tags = tag;
    if (author) filter.userId = author;
    if (q) filter.$text = { $search: q };
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.max(parseInt(req.query.limit || "8", 10), 1);

    const total = await Post.countDocuments(filter);
    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const items = posts.map((post) => ({
      $id: post.slug,
      title: post.title,
      slug: post.slug,
      content: post.content,
      featuredImage: post.featuredImage,
      category: post.category,
      tags: post.tags,
      status: post.status,
      views: post.views,
      userId: post.userId.toString(),
    }));

    return res.json({
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch posts." });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug });
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }
    post.views += 1;
    await post.save();
    return res.json({
      $id: post.slug,
      title: post.title,
      slug: post.slug,
      content: post.content,
      featuredImage: post.featuredImage,
      category: post.category,
      tags: post.tags,
      status: post.status,
      views: post.views,
      userId: post.userId.toString(),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch post." });
  }
});

router.post("/", authRequired, upload.single("image"), async (req, res) => {
  try {
    const { title, slug, content, status, category, tags } = req.body;
    if (!title || !slug || !content) {
      return res.status(400).json({ message: "Title, slug, and content are required." });
    }

    const existing = await Post.findOne({ slug: slug.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Slug already exists." });
    }

    let featuredImage = "";
    let featuredImagePublicId = "";
    if (req.file?.buffer) {
      const uploadResult = await uploadImageBuffer(
        req.file.buffer,
        req.file.originalname,
        "megablog/posts"
      );
      featuredImage = uploadResult.secure_url;
      featuredImagePublicId = uploadResult.public_id;
    }
    const post = await Post.create({
      title,
      slug: slug.toLowerCase(),
      content,
      featuredImage,
      featuredImagePublicId,
      status: status || "active",
      category: category || "",
      tags: tags ? String(tags).split(",").map((t) => t.trim()).filter(Boolean) : [],
      userId: req.user.id,
    });

    return res.json({
      $id: post.slug,
      title: post.title,
      slug: post.slug,
      content: post.content,
      featuredImage: post.featuredImage,
      category: post.category,
      tags: post.tags,
      status: post.status,
      views: post.views,
      userId: post.userId.toString(),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create post." });
  }
});

router.put("/:slug", authRequired, upload.single("image"), async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug });
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }
    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden." });
    }

    const { title, content, status, category, tags } = req.body;
    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;
    if (status !== undefined) post.status = status;
    if (category !== undefined) post.category = category;
    if (tags !== undefined) {
      post.tags = String(tags).split(",").map((t) => t.trim()).filter(Boolean);
    }

    if (req.file?.buffer) {
      await deleteImage(post.featuredImagePublicId);
      const uploadResult = await uploadImageBuffer(
        req.file.buffer,
        req.file.originalname,
        "megablog/posts"
      );
      post.featuredImage = uploadResult.secure_url;
      post.featuredImagePublicId = uploadResult.public_id;
    }

    await post.save();
    return res.json({
      $id: post.slug,
      title: post.title,
      slug: post.slug,
      content: post.content,
      featuredImage: post.featuredImage,
      category: post.category,
      tags: post.tags,
      status: post.status,
      views: post.views,
      userId: post.userId.toString(),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update post." });
  }
});

router.delete("/:slug", authRequired, async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug });
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }
    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden." });
    }

    await post.deleteOne();
    await deleteImage(post.featuredImagePublicId);
    await Comment.deleteMany({ postId: post._id });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete post." });
  }
});

router.get("/:slug/comments", async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug });
    if (!post) return res.status(404).json({ message: "Post not found." });

    const comments = await Comment.find({ postId: post._id })
      .sort({ createdAt: -1 })
      .populate("userId", "name");
    return res.json(
      comments.map((comment) => ({
        id: comment._id.toString(),
        content: comment.content,
        createdAt: comment.createdAt,
        user: { id: comment.userId._id.toString(), name: comment.userId.name },
      }))
    );
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch comments." });
  }
});

router.post("/:slug/comments", authRequired, async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug });
    if (!post) return res.status(404).json({ message: "Post not found." });
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: "Comment is required." });

    const comment = await Comment.create({
      postId: post._id,
      userId: req.user.id,
      content,
    });

    return res.json({
      id: comment._id.toString(),
      content: comment.content,
      createdAt: comment.createdAt,
      user: { id: req.user.id, name: req.user.name },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to add comment." });
  }
});

router.delete("/:slug/comments/:commentId", authRequired, async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug });
    if (!post) return res.status(404).json({ message: "Post not found." });
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found." });
    if (comment.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden." });
    }
    await comment.deleteOne();
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete comment." });
  }
});

export default router;
