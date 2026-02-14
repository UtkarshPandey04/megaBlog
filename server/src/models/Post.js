import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    content: { type: String, required: true },
    featuredImage: { type: String, default: "" },
    featuredImagePublicId: { type: String, default: "" },
    status: { type: String, enum: ["active", "inactive", "draft"], default: "active" },
    tags: { type: [String], default: [] },
    category: { type: String, default: "" },
    views: { type: Number, default: 0 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

postSchema.index({ title: "text", content: "text", tags: "text", category: "text" });

export default mongoose.model("Post", postSchema);
