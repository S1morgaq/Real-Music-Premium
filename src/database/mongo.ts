import mongoose from "mongoose";
import { env } from "../config/env";
import { logger } from "../lib/logger";

export async function connectMongo(): Promise<void> {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.MONGO_URI, {
    serverSelectionTimeoutMS: 10_000,
    maxPoolSize: 20,
    minPoolSize: 2
  });
  logger.info("MongoDB connected");
}
