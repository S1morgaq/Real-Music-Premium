import "dotenv/config";
import { spawn } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import ffmpegPath from "ffmpeg-static";
import { DEFAULT_AD_TEXTS } from "../src/music/ads";

const outputDir = path.join(process.cwd(), "assets", "audio");
const tempDir = path.join(outputDir, ".tmp");
const voice = "tr-TR-EmelNeural";
const sampleRate = 44_100;

async function generateSpeech(text: string): Promise<ArrayBuffer> {
  const response = await fetch("https://freetts.org/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      voice,
      rate: "-4%",
      pitch: "+1Hz"
    })
  });

  if (!response.ok) {
    throw new Error(`FreeTTS generate failed: ${response.status} ${await response.text()}`);
  }

  const data = (await response.json()) as { file_id?: string };
  if (!data.file_id) throw new Error("FreeTTS did not return file_id");

  const audio = await fetch(`https://freetts.org/api/audio/${data.file_id}`);
  if (!audio.ok) {
    throw new Error(`FreeTTS audio download failed: ${audio.status} ${await audio.text()}`);
  }

  return audio.arrayBuffer();
}

function createBackgroundMusic(durationSeconds = 12): Buffer {
  const channels = 2;
  const totalSamples = sampleRate * durationSeconds;
  const data = Buffer.alloc(totalSamples * channels * 2);
  const chords = [
    [220.0, 277.18, 329.63, 440.0],
    [196.0, 246.94, 293.66, 392.0],
    [261.63, 329.63, 392.0, 523.25],
    [174.61, 220.0, 261.63, 349.23]
  ];

  for (let i = 0; i < totalSamples; i++) {
    const time = i / sampleRate;
    const chord = chords[Math.floor(time / 3) % chords.length];
    const fadeIn = Math.min(1, time / 1.4);
    const fadeOut = Math.min(1, (durationSeconds - time) / 1.8);
    const envelope = Math.max(0, Math.min(fadeIn, fadeOut));
    let sample = 0;

    for (const [noteIndex, frequency] of chord.entries()) {
      const slowPulse = 0.78 + Math.sin(time * 0.55 + noteIndex) * 0.08;
      sample += Math.sin(2 * Math.PI * frequency * time) * 0.055 * slowPulse;
      sample += Math.sin(2 * Math.PI * frequency * 2 * time) * 0.012;
    }

    sample += Math.sin(2 * Math.PI * 880 * time) * 0.012 * Math.max(0, Math.sin(2 * Math.PI * 0.25 * time));
    sample *= envelope;

    const left = Math.max(-1, Math.min(1, sample * 0.85));
    const right = Math.max(-1, Math.min(1, sample));
    data.writeInt16LE(Math.round(left * 32767), i * 4);
    data.writeInt16LE(Math.round(right * 32767), i * 4 + 2);
  }

  const header = Buffer.alloc(44);
  const byteRate = sampleRate * channels * 2;
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(channels * 2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(data.length, 40);

  return Buffer.concat([header, data]);
}

function runFfmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!ffmpegPath) {
      reject(new Error("ffmpeg-static binary bulunamadi"));
      return;
    }

    const child = spawn(ffmpegPath, args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`ffmpeg failed with code ${code}\n${stderr}`));
    });
  });
}

async function mixWithBackground(voicePath: string, musicPath: string, outputPath: string): Promise<void> {
  await runFfmpeg([
    "-y",
    "-i",
    voicePath,
    "-stream_loop",
    "-1",
    "-i",
    musicPath,
    "-filter_complex",
    "[0:a]volume=1.25,apad=pad_dur=1.2[a0];[1:a]volume=0.16,afade=t=in:st=0:d=1.2,afade=t=out:st=9:d=2[a1];[a0][a1]amix=inputs=2:duration=first:dropout_transition=0,alimiter=limit=0.92",
    "-c:a",
    "libmp3lame",
    "-b:a",
    "192k",
    outputPath
  ]);
}

async function main(): Promise<void> {
  await mkdir(tempDir, { recursive: true });
  const musicPath = path.join(tempDir, "background.wav");
  await writeFile(musicPath, createBackgroundMusic());

  for (const [index, text] of DEFAULT_AD_TEXTS.entries()) {
    const audio = await generateSpeech(text);
    const voicePath = path.join(tempDir, `voice-${index + 1}.mp3`);
    const filePath = path.join(outputDir, `premium-${index + 1}.mp3`);
    await writeFile(voicePath, Buffer.from(audio));
    await mixWithBackground(voicePath, musicPath, filePath);
    console.log(`Generated ${filePath}`);
  }

  await rm(tempDir, { recursive: true, force: true });
}

void main().catch((error) => {
  console.error("Reklam sesleri uretilemedi.");
  console.error(error);
  process.exit(1);
});
