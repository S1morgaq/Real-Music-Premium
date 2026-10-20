import { readdir } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import type { MusicClient } from "../client/MusicClient";
import type { Command } from "../types/Command";
import { logger } from "../lib/logger";

const requireModule = createRequire(__filename);

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const full = path.join(dir, entry.name);
      return entry.isDirectory() ? walk(full) : full;
    })
  );
  return files.flat().filter((file) => /\.(ts|js)$/.test(file));
}

export async function loadCommands(client: MusicClient): Promise<void> {
  const commandPath = path.join(__dirname, "..", "commands");
  const files = await walk(commandPath);

  for (const file of files) {
    const imported = requireModule(file) as Record<string, unknown>;
    const command = (imported.default ?? imported.command) as Command | undefined;
    if (!command?.data?.name || !command.execute) continue;
    client.commands.set(command.data.name, command);
  }

  logger.info({ count: client.commands.size }, "Commands loaded");
}
