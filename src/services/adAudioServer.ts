import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { env } from "../config/env";
import { logger } from "../lib/logger";

const audioDir = path.join(process.cwd(), "assets", "audio");

function resolveAudioPath(urlPath: string): string | null {
  const prefix = "/ad-audio/";
  if (!urlPath.startsWith(prefix)) return null;

  const fileName = path.basename(decodeURIComponent(urlPath.slice(prefix.length)));
  if (!/^[a-z0-9._-]+\.mp3$/i.test(fileName)) return null;

  return path.join(audioDir, fileName);
}

export function startAdAudioServer(): void {
  const server = createServer(async (req, res) => {
    const requestedPath = new URL(req.url ?? "/", env.AD_AUDIO_PUBLIC_BASE_URL).pathname;
    const audioPath = resolveAudioPath(requestedPath);

    if (!audioPath) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    try {
      const file = await stat(audioPath);
      res.writeHead(200, {
        "Content-Type": "audio/mpeg",
        "Content-Length": file.size,
        "Cache-Control": "public, max-age=86400"
      });
      createReadStream(audioPath).pipe(res);
    } catch {
      res.writeHead(404);
      res.end("Audio not found. Run npm run generate:ads first.");
    }
  });

  server.on("error", (error) => logger.error({ error }, "Ad audio server error"));
  server.listen(env.AD_AUDIO_PORT, env.AD_AUDIO_HOST, () => {
    logger.info(
      {
        host: env.AD_AUDIO_HOST,
        port: env.AD_AUDIO_PORT,
        publicBaseUrl: env.AD_AUDIO_PUBLIC_BASE_URL
      },
      "Ad audio server ready"
    );
  });
}
