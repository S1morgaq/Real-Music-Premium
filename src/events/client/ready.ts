import { ActivityType, Events } from "discord.js";
import { GatewayOpcodes } from "discord-api-types/v10";
import type { MusicClient } from "../../client/MusicClient";
import { logger } from "../../lib/logger";
import { recover247Players } from "../../services/recoveryService";
import { deployAllGuildSlashCommands } from "../../services/slashCommandService";

const STREAMING_HOURS = 9_282_828;
const STREAMING_STARTED_AT = Date.now() - STREAMING_HOURS * 60 * 60 * 1000;
const PRESENCE_ROTATE_MS = 5_000;
const STREAMING_MESSAGES = [
  "r!play ile dinlemeye başla",
  "I Love Music ❤️ S1morg",
  "Sunucunu ileriye taşı",
  "Kaliteli müzik keyfi",
  "Ardmetra Music yanında"
];

export default {
  name: Events.ClientReady,
  once: true,
  async execute(client: MusicClient) {
    startStreamingPresenceRotation(client);
    logger.info({ tag: client.user?.tag, guilds: client.guilds.cache.size }, "Bot ready");
    await deployAllGuildSlashCommands(client);
    await recover247Players(client);
  }
};

function startStreamingPresenceRotation(client: MusicClient): void {
  let index = 0;
  setStreamingPresence(client, STREAMING_MESSAGES[index]);

  const timer = setInterval(() => {
    index = (index + 1) % STREAMING_MESSAGES.length;
    setStreamingPresence(client, STREAMING_MESSAGES[index]);
  }, PRESENCE_ROTATE_MS);
  timer.unref();
}

function setStreamingPresence(client: MusicClient, name: string): void {
  (client.ws as any).broadcast({
    op: GatewayOpcodes.PresenceUpdate,
    d: {
      since: null,
      afk: false,
      status: "online",
      activities: [
        {
          name,
          type: ActivityType.Streaming,
          url: "https://www.twitch.tv/realyueloin",
          timestamps: {
            start: STREAMING_STARTED_AT
          }
        }
      ]
    }
  });
}
