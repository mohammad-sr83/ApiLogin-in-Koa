import mongoose from "mongoose";


export async function connectDB() {
  try {
    const MONGO_URI =  "mongodb://127.0.0.1:27017/koa-ts";
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  }
}