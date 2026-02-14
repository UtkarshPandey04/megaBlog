import mongoose from "mongoose";
import app from "../server/src/app.js";

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/megablog";

let cachedConnection = null;

async function connectToDatabase() {
  if (cachedConnection) return cachedConnection;
  if (mongoose.connection.readyState === 1) {
    cachedConnection = mongoose.connection;
    return cachedConnection;
  }
  cachedConnection = await mongoose.connect(MONGO_URL);
  return cachedConnection;
}

export default async function handler(req, res) {
  try {
    await connectToDatabase();
    return app(req, res);
  } catch (error) {
    return res.status(500).json({ message: "Database connection failed." });
  }
}
