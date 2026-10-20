import { env } from "./config/env";
import { MusicClient } from "./client/MusicClient";
import { connectMongo } from "./database/mongo";
import { connectRedis } from "./database/redis";
import { loadCommands } from "./handlers/commandLoader";
import { loadEvents } from "./handlers/eventLoader";
import { createKazagumo } from "./music/kazagumo";
import { logger } from "./lib/logger";
import { redis } from "./database/redis";
import { infinityPremiumCodes } from "./database/seedPremiumCodes";
import { seedPremiumCodes } from "./services/premiumCodeService";
import { startAdAudioServer } from "./services/adAudioServer";
import { startDashboardServer } from "./services/dashboardServer";
import mongoose from "mongoose";

async function bootstrap(): Promise<void> {
  const client = new MusicClient();
  setupProcessGuards(client);

  await Promise.all([connectMongo(), connectRedis()]);
  await seedPremiumCodes(infinityPremiumCodes);
  startAdAudioServer();
  client.kazagumo = createKazagumo(client);
  startDashboardServer(client);
  await Promise.all([loadCommands(client), loadEvents(client)]);

  await client.login(env.DISCORD_TOKEN);
}

function setupProcessGuards(client: MusicClient): void {
  let shuttingDown = false;

  const shutdown = async (reason: string, exitCode: number) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.warn({ reason }, "Shutting down bot");

    try {
      for (const player of client.kazagumo?.players?.values?.() ?? []) {
        try {
          player.destroy();
        } catch (error) {
          logger.warn({ error }, "Failed to destroy player during shutdown");
        }
      }

      client.destroy();
      redis.disconnect();
      await mongoose.disconnect();
    } catch (error) {
      logger.error({ error }, "Shutdown cleanup failed");
    } finally {
      process.exit(exitCode);
    }
  };

  process.on("SIGINT", () => void shutdown("SIGINT", 0));
  process.on("SIGTERM", () => void shutdown("SIGTERM", 0));
  process.on("unhandledRejection", (reason) => logger.error({ reason }, "Unhandled rejection"));
  process.on("uncaughtException", (error) => {
    logger.fatal({ error }, "Uncaught exception");
    void shutdown("uncaughtException", 1);
  });
}

void bootstrap().catch((error) => {
  logger.fatal({ error }, "Failed to bootstrap bot");
  process.exit(1);
});
