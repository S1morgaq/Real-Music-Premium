import { Schema, model } from "mongoose";

export interface GuildSettingsDocument {
  guildId: string;
  textChannelId?: string;
  voiceChannelId?: string;
  autoplay: boolean;
  twentyFourSeven: boolean;
  defaultVolume: number;
  djRoleId?: string;
  language: "tr" | "en";
}

const guildSettingsSchema = new Schema<GuildSettingsDocument>(
  {
    guildId: { type: String, required: true, unique: true, index: true },
    textChannelId: String,
    voiceChannelId: String,
    autoplay: { type: Boolean, default: false },
    twentyFourSeven: { type: Boolean, default: false },
    defaultVolume: { type: Number, default: 70 },
    djRoleId: String,
    language: { type: String, enum: ["tr", "en"], default: "tr" }
  },
  { timestamps: true }
);

export const GuildSettings = model<GuildSettingsDocument>("GuildSettings", guildSettingsSchema);
