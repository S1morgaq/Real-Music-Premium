import { Schema, model } from "mongoose";

export interface PremiumDocument {
  targetId: string;
  type: "user" | "guild";
  expiresAt?: Date;
}

export interface PremiumCodeDocument {
  code: string;
  type: "user" | "guild";
  expiresAt?: Date;
  redeemedBy?: string;
  redeemedFor?: string;
  redeemedAt?: Date;
}

const premiumSchema = new Schema<PremiumDocument>(
  {
    targetId: { type: String, required: true, index: true },
    type: { type: String, enum: ["user", "guild"], required: true },
    expiresAt: Date
  },
  { timestamps: true }
);

premiumSchema.index({ targetId: 1, type: 1 }, { unique: true });

export const Premium = model<PremiumDocument>("Premium", premiumSchema);

const premiumCodeSchema = new Schema<PremiumCodeDocument>(
  {
    code: { type: String, required: true, unique: true, index: true },
    type: { type: String, enum: ["user", "guild"], default: "user", required: true },
    expiresAt: Date,
    redeemedBy: String,
    redeemedFor: String,
    redeemedAt: Date
  },
  { timestamps: true }
);

export const PremiumCode = model<PremiumCodeDocument>("PremiumCode", premiumCodeSchema);
