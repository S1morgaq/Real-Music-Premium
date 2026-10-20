import "dotenv/config";
import { z } from "zod";

const envBoolean = z
  .string()
  .trim()
  .toLowerCase()
  .transform((value, context) => {
    if (["true", "1", "yes", "on"].includes(value)) return true;
    if (["false", "0", "no", "off"].includes(value)) return false;

    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Expected a boolean value"
    });
    return z.NEVER;
  });

const schema = z.object({
  DISCORD_TOKEN: z.string().min(1),
  DISCORD_CLIENT_ID: z.string().min(1),
  DISCORD_GUILD_ID: z.string().optional().default(""),
  DISCORD_GUILD_IDS: z.string().optional().default(""),
  AUTO_DEPLOY_GUILD_COMMANDS: envBoolean.default("true"),
  MONGO_URI: z.string().min(1),
  REDIS_URL: z.string().min(1),
  REDIS_REQUIRED: envBoolean.default("false"),
  OWNER_IDS: z.string().optional().default(""),
  DEFAULT_VOLUME: z.coerce.number().int().min(1).max(150).default(70),
  MAX_VOLUME: z.coerce.number().int().min(1).max(300).default(150),
  QUEUE_PAGE_SIZE: z.coerce.number().int().min(5).max(20).default(10),
  MAX_QUEUE_SIZE: z.coerce.number().int().min(25).max(10000).default(10000),
  MAX_PLAYLIST_TRACKS: z.coerce.number().int().min(10).max(1000).default(250),
  SEARCH_TIMEOUT_MS: z.coerce.number().int().min(5_000).max(120_000).default(30_000),
  BOT_PREFIX: z.string().default("!"),
  LAVALINK_NAME: z.string().default("main"),
  LAVALINK_URL: z.string().default("127.0.0.1:2333"),
  LAVALINK_AUTH: z.string().default("youshallnotpass"),
  LAVALINK_SECURE: envBoolean.default("false"),
  AD_AUDIO_URL: z.string().optional().default(""),
  AD_AUDIO_URLS: z.string().optional().default(""),
  AD_AUDIO_HOST: z.string().default("0.0.0.0"),
  AD_AUDIO_PORT: z.coerce.number().int().min(1).max(65535).default(3099),
  AD_AUDIO_PUBLIC_BASE_URL: z.string().optional().default("http://127.0.0.1:3099"),
  DASHBOARD_HOST: z.string().default("0.0.0.0"),
  DASHBOARD_PORT: z.coerce.number().int().min(1).max(65535).default(3100),
  LOG_LEVEL: z.string().default("info")
});

export const env = schema.parse(process.env);

export const ownerIds = env.OWNER_IDS.split(",")
  .map((id) => id.trim())
  .filter(Boolean);
