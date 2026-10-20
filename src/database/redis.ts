import Redis from "ioredis";
import { env } from "../config/env";
import { logger } from "../lib/logger";

export const redis = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 2,
  enableReadyCheck: true,
  retryStrategy: (attempt) => (env.REDIS_REQUIRED ? Math.min(attempt * 500, 5_000) : null)
});

let redisUnavailableReported = false;

function reportRedisUnavailable(error: unknown): void {
  if (redisUnavailableReported) return;
  redisUnavailableReported = true;

  const message = env.REDIS_REQUIRED
    ? "Redis unavailable; REDIS_REQUIRED=true so cache is required"
    : "Redis unavailable; cache disabled. Start Redis with npm run redis:start or install Memurai on Windows";

  if (env.REDIS_REQUIRED) logger.error({ error }, message);
  else logger.warn({ error }, message);
}

export async function connectRedis(): Promise<void> {
  redis.on("error", reportRedisUnavailable);

  try {
    await redis.connect();
    redisUnavailableReported = false;
    logger.info("Redis connected");
  } catch (error) {
    redis.disconnect();
    reportRedisUnavailable(error);
    if (env.REDIS_REQUIRED) throw error;
  }
}
