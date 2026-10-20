import { readdir } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import type { MusicClient } from "../client/MusicClient";
import { logger } from "../lib/logger";

const requireModule = createRequire(__filename);

interface EventFile {
  name: string;
  once?: boolean;
  execute: (...args: any[]) => Promise<void> | void;
}

async function loadFolder(client: MusicClient, folder: string, binder: (event: EventFile) => void): Promise<number> {
  const dir = path.join(__dirname, "..", "events", folder);
  const entries = await readdir(dir, { withFileTypes: true });
  let count = 0;

  for (const entry of entries) {
    if (!entry.isFile() || !/\.(ts|js)$/.test(entry.name)) continue;
    const imported = requireModule(path.join(dir, entry.name)) as Record<string, unknown>;
    const event = (imported.default ?? imported.event) as EventFile | undefined;
    if (!event?.name || !event.execute) continue;
    binder(event);
    count++;
  }

  return count;
}

export async function loadEvents(client: MusicClient): Promise<void> {
  const clientEvents = await loadFolder(client, "client", (event) => {
    const runner = (...args: any[]) => {
      Promise.resolve(event.execute(...args, client)).catch((error) => client.emit("error", error as Error));
    };
    event.once ? client.once(event.name, runner) : client.on(event.name, runner);
  });

  const kazagumoEvents = await loadFolder(client, "kazagumo", (event) => {
    const runner = (...args: any[]) => {
      Promise.resolve(event.execute(...args, client)).catch((error) => client.emit("error", error as Error));
    };
    event.once ? (client.kazagumo as any).once(event.name, runner) : (client.kazagumo as any).on(event.name, runner);
  });

  logger.info({ clientEvents, kazagumoEvents }, "Events loaded");
}
