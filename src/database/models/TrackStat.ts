import { Schema, model } from "mongoose";

export interface TrackStatDocument {
  guildId: string;
  userId: string;
  title: string;
  uri?: string;
  author?: string;
  plays: number;
  lastPlayedAt: Date;
}

const trackStatSchema = new Schema<TrackStatDocument>(
  {
    guildId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    uri: { type: String, index: true },
    author: String,
    plays: { type: Number, default: 0 },
    lastPlayedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

trackStatSchema.index({ guildId: 1, uri: 1, userId: 1 });
trackStatSchema.index({ guildId: 1, plays: -1 });

export const TrackStat = model<TrackStatDocument>("TrackStat", trackStatSchema);
