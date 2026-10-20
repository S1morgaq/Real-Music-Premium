import { createServer } from "node:http";
import type { MusicClient } from "../client/MusicClient";
import { env } from "../config/env";
import { logger } from "../lib/logger";

function dashboardState(client: MusicClient) {
  const players = Array.from(client.kazagumo?.players?.values?.() ?? []) as any[];
  const ping = Number.isFinite(client.ws.ping) && client.ws.ping >= 0 ? Math.round(client.ws.ping) : 0;

  return {
    guilds: client.guilds.cache.size,
    players: players.length,
    ping,
    memory: Math.round(process.memoryUsage().rss / 1024 / 1024),
    uptime: Math.floor(process.uptime()),
    rows: players.map((player) => {
      const current = player.queue.current;
      return {
        guildId: String(player.guildId),
        title: String(current?.title ?? "Bos"),
        queue: Number(player.queue.length ?? 0),
        volume: Number(player.volume ?? 0)
      };
    })
  };
}

function page(client: MusicClient): string {
  const initialState = JSON.stringify(dashboardState(client)).replace(/</g, "\\u003c");

  return `<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Muzik Bot Dashboard</title>
  <style>
    html,body{width:100%;height:100%;margin:0;overflow:hidden;background:#080c16}
    canvas{display:block;width:100vw;height:100vh}
  </style>
</head>
<body>
  <canvas id="dashboard" aria-label="Muzik bot dashboard"></canvas>
  <script>
    const canvas = document.getElementById("dashboard");
    const ctx = canvas.getContext("2d");
    let state = ${initialState};
    const features = [
      ["Lavalink", "Kazagumo + Shoukaku player"],
      ["Kaynaklar", "YouTube, YouTube Music, SoundCloud"],
      ["Sira", "Queue, loop, shuffle, seek, replay"],
      ["Kalite", "Bassboost, nightcore, vaporwave"],
      ["Radyo", "Pop, rap, chill, rock, oyun"],
      ["Premium", "Reklamsiz 24/7 muzik"],
      ["Playlist", "Kisisel liste kaydi"],
      ["Kontrol", "Butonlar ve filtre menusu"]
    ];
    const bars = Array.from({ length: 42 }, (_, index) => ({
      phase: index * 0.51,
      speed: 0.8 + (index % 7) * 0.08
    }));
    const accentSet = ["#38bdf8", "#22c55e", "#f59e0b", "#a78bfa", "#fb7185"];

    function fitText(text, maxWidth) {
      let value = String(text);
      if (ctx.measureText(value).width <= maxWidth) return value;
      while (value.length > 4 && ctx.measureText(value + "...").width > maxWidth) {
        value = value.slice(0, -1);
      }
      return value + "...";
    }

    function roundRect(x, y, width, height, radius) {
      const r = Math.min(radius, width / 2, height / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + width, y, x + width, y + height, r);
      ctx.arcTo(x + width, y + height, x, y + height, r);
      ctx.arcTo(x, y + height, x, y, r);
      ctx.arcTo(x, y, x + width, y, r);
      ctx.closePath();
    }

    function card(x, y, width, height, tone = "dark") {
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.32)";
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 14;
      roundRect(x, y, width, height, 8);
      const fill = ctx.createLinearGradient(x, y, x + width, y + height);
      if (tone === "soft") {
        fill.addColorStop(0, "rgba(21,31,51,0.96)");
        fill.addColorStop(1, "rgba(12,18,32,0.96)");
      } else {
        fill.addColorStop(0, "rgba(17,24,39,0.98)");
        fill.addColorStop(1, "rgba(10,16,29,0.98)");
      }
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.restore();

      ctx.strokeStyle = "#243044";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.beginPath();
      ctx.moveTo(x + 12, y + 1);
      ctx.lineTo(x + width - 12, y + 1);
      ctx.stroke();
    }

    function pill(text, x, y, accent) {
      ctx.font = "700 13px Arial";
      const width = ctx.measureText(text).width + 34;
      roundRect(x, y, width, 30, 8);
      ctx.fillStyle = "rgba(15,23,42,0.78)";
      ctx.fill();
      ctx.strokeStyle = "rgba(148,163,184,0.24)";
      ctx.stroke();
      ctx.fillStyle = accent;
      roundRect(x + 12, y + 10, 8, 8, 4);
      ctx.fill();
      ctx.fillStyle = "#dbeafe";
      ctx.fillText(text, x + 26, y + 20);
      return width;
    }

    function pillWidth(text) {
      ctx.font = "700 13px Arial";
      return ctx.measureText(text).width + 34;
    }

    function metric(label, value, x, y, width, accent, time) {
      card(x, y, width, 108, "soft");
      const pulse = (Math.sin(time * 2.2) + 1) / 2;
      ctx.fillStyle = "rgba(148,163,184,0.08)";
      roundRect(x + width - 58, y + 18, 34, 34, 8);
      ctx.fill();
      ctx.fillStyle = accent;
      roundRect(x + 14, y + 14, 5, 76, 3);
      ctx.globalAlpha = 0.55 + pulse * 0.35;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#94a3b8";
      ctx.font = "600 15px Arial";
      ctx.fillText(label, x + 30, y + 31);
      ctx.fillStyle = accent;
      ctx.font = "800 34px Arial";
      ctx.fillText(fitText(value, width - 76), x + 30, y + 74);

      ctx.strokeStyle = accent;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < 24; i++) {
        const px = x + 30 + i * ((width - 62) / 23);
        const py = y + 93 - Math.sin(time * 2 + i * 0.55) * 4 - (i % 4);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    function formatUptime(seconds) {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      return h + "s " + m + "d";
    }

    function drawBackground(width, height, time) {
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#070b14");
      gradient.addColorStop(0.45, "#101827");
      gradient.addColorStop(1, "#0b2b32");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = "rgba(148,163,184,0.055)";
      ctx.lineWidth = 1;
      const step = 64;
      const drift = (time * 12) % step;
      for (let x = -step + drift; x < width + step; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + 78, height);
        ctx.stroke();
      }
      for (let y = -step + drift * 0.6; y < height + step; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y + 54);
        ctx.stroke();
      }

      ctx.strokeStyle = "rgba(56,189,248,0.12)";
      ctx.lineWidth = 2;
      for (let wave = 0; wave < 3; wave++) {
        ctx.beginPath();
        for (let x = 0; x <= width; x += 18) {
          const y = height * (0.22 + wave * 0.2) + Math.sin(x * 0.01 + time * (0.9 + wave * 0.2)) * (10 + wave * 5);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }

    function drawEqualizer(x, y, width, height, time) {
      const gap = 5;
      const visibleBars = Math.max(8, Math.min(bars.length, Math.floor(width / 10)));
      const barWidth = Math.max(3, (width - gap * (visibleBars - 1)) / visibleBars);
      bars.slice(0, visibleBars).forEach((bar, index) => {
        const level = 0.25 + Math.abs(Math.sin(time * bar.speed + bar.phase)) * 0.75;
        const h = Math.max(8, height * level);
        const bx = x + index * (barWidth + gap);
        const by = y + height - h;
        const hue = index % 3 === 0 ? "#22c55e" : index % 3 === 1 ? "#38bdf8" : "#f59e0b";
        ctx.fillStyle = hue;
        ctx.globalAlpha = 0.35 + level * 0.5;
        roundRect(bx, by, barWidth, h, 4);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    }

    function drawFeatures(x, y, width, height, time) {
      card(x, y, width, height);
      ctx.fillStyle = "#f8fafc";
      ctx.font = "800 24px Arial";
      ctx.fillText("Bot Ozellikleri", x + 22, y + 42);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "500 14px Arial";
      ctx.fillText("Muzik, kontrol ve premium modulleri", x + 22, y + 66);

      const cols = width < 560 ? 1 : 2;
      const gap = 12;
      const itemWidth = (width - 44 - gap * (cols - 1)) / cols;
      const itemHeight = 64;
      const startY = y + 92;
      features.forEach((feature, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const ix = x + 22 + col * (itemWidth + gap);
        const iy = startY + row * (itemHeight + 10);
        if (iy + itemHeight > y + height - 16) return;
        const shimmer = (Math.sin(time * 2 + index * 0.7) + 1) / 2;
        const fill = ctx.createLinearGradient(ix, iy, ix + itemWidth, iy + itemHeight);
        fill.addColorStop(0, index % 2 === 0 ? "#172033" : "#151c2d");
        fill.addColorStop(1, "#0f172a");
        ctx.fillStyle = fill;
        roundRect(ix, iy, itemWidth, itemHeight, 8);
        ctx.fill();
        ctx.strokeStyle = "rgba(148,163,184,0.14)";
        ctx.stroke();
        ctx.fillStyle = accentSet[index % accentSet.length];
        ctx.globalAlpha = 0.55 + shimmer * 0.35;
        roundRect(ix + 12, iy + 13, 7, 38, 4);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#e5e7eb";
        ctx.font = "800 15px Arial";
        ctx.fillText(feature[0], ix + 30, iy + 25);
        ctx.fillStyle = "#94a3b8";
        ctx.font = "500 13px Arial";
        ctx.fillText(fitText(feature[1], itemWidth - 42), ix + 30, iy + 47);
      });
    }

    function drawPlayers(x, y, width, height, time) {
      card(x, y, width, height);
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "800 24px Arial";
      ctx.fillText("Aktif Playerlar", x + 22, y + 42);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "500 14px Arial";
      ctx.fillText("Canli oynatici ve sira durumu", x + 22, y + 66);

      if (width > 520) drawEqualizer(x + width - 242, y + 24, 200, 32, time);

      const headers = ["Guild", "Calan", "Sira", "Ses"];
      const col = [0, 0.24, 0.74, 0.86].map((ratio) => x + 22 + width * ratio);
      ctx.fillStyle = "#93c5fd";
      ctx.font = "700 14px Arial";
      headers.forEach((header, index) => ctx.fillText(header, col[index], y + 96));

      ctx.strokeStyle = "#243044";
      ctx.beginPath();
      ctx.moveTo(x + 22, y + 112);
      ctx.lineTo(x + width - 22, y + 112);
      ctx.stroke();

      if (!state.rows.length) {
        const beat = (Math.sin(time * 3) + 1) / 2;
        ctx.fillStyle = "rgba(56,189,248,0.08)";
        roundRect(x + 22, y + 136, width - 44, 112, 8);
        ctx.fill();
        ctx.strokeStyle = "rgba(56,189,248,0.18)";
        ctx.stroke();
        ctx.fillStyle = "#94a3b8";
        ctx.font = "600 20px Arial";
        ctx.fillText("Aktif player yok.", x + 42, y + 183);
        ctx.font = "500 14px Arial";
        ctx.fillText("Bir kanalda muzik baslayinca liste burada canlanir.", x + 42, y + 209);
        ctx.fillStyle = "#38bdf8";
        ctx.globalAlpha = 0.25 + beat * 0.25;
        roundRect(x + 42, y + 224, Math.min(360, width - 84), 8, 4);
        ctx.fill();
        ctx.globalAlpha = 1;
        return;
      }

      ctx.font = "500 15px Arial";
      state.rows.slice(0, Math.floor((height - 140) / 42)).forEach((row, index) => {
        const rowPulse = (Math.sin(time * 2 + index * 0.5) + 1) / 2;
        const ry = y + 146 + index * 42;
        ctx.fillStyle = index % 2 === 0 ? "rgba(23,32,51,0.9)" : "rgba(21,28,45,0.9)";
        roundRect(x + 18, ry - 27, width - 36, 34, 7);
        ctx.fill();
        ctx.strokeStyle = "rgba(148,163,184,0.10)";
        ctx.stroke();
        ctx.fillStyle = accentSet[index % accentSet.length];
        ctx.globalAlpha = 0.35 + rowPulse * 0.35;
        ctx.fillRect(x + 18, ry - 27, 4, 34);
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#e5e7eb";
        ctx.fillText(fitText(row.guildId, width * 0.2), col[0], ry);
        ctx.fillText(fitText(row.title, width * 0.43), col[1], ry);
        ctx.fillStyle = "#cbd5e1";
        ctx.fillText(String(row.queue), col[2], ry);
        ctx.fillText(row.volume + "%", col[3], ry);
      });
    }

    function draw(timeMs = 0) {
      const time = timeMs / 1000;
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const width = Math.floor(window.innerWidth);
      const height = Math.floor(window.innerHeight);
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      drawBackground(width, height, time);

      const outerMargin = Math.max(22, Math.min(52, width * 0.05));
      const contentWidth = Math.min(width - outerMargin * 2, 1520);
      const margin = Math.max(outerMargin, (width - contentWidth) / 2);
      const columns = contentWidth < 760 ? 2 : 5;
      const gap = 16;
      const metricWidth = (contentWidth - gap * (columns - 1)) / columns;

      ctx.fillStyle = "#f8fafc";
      ctx.font = "800 36px Arial";
      ctx.fillText("Muzik Bot Dashboard", margin, margin + 40);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "500 16px Arial";
      ctx.fillText("Canli muzik operasyon paneli", margin, margin + 68);
      const liveText = state.players > 0 ? "LIVE  " + state.players + " PLAYER" : "HAZIR";
      const liveWidth = pillWidth(liveText);
      const canvasWidth = pillWidth("CANVAS UI");
      const liveX = margin + contentWidth - liveWidth;
      pill(liveText, liveX, margin + 18, state.players > 0 ? "#22c55e" : "#38bdf8");
      if (contentWidth > 760) pill("CANVAS UI", liveX - canvasWidth - 12, margin + 18, "#a78bfa");

      const metrics = [
        ["Sunucu", state.guilds, "#38bdf8"],
        ["Aktif Player", state.players, "#22c55e"],
        ["Ping", state.ping + "ms", "#f59e0b"],
        ["RAM", state.memory + " MB", "#a78bfa"],
        ["Uptime", formatUptime(state.uptime), "#fb7185"]
      ];
      let metricY = margin + 104;
      metrics.forEach(([label, value, accent], index) => {
        const x = margin + (index % columns) * (metricWidth + gap);
        const y = metricY + Math.floor(index / columns) * 124;
        metric(label, value, x, y, metricWidth, accent, time + index * 0.23);
      });

      const contentY = metricY + Math.ceil(metrics.length / columns) * 124 + 14;
      const contentHeight = Math.max(260, height - contentY - margin);
      if (width < 980) {
        const split = Math.max(250, contentHeight * 0.45);
        drawFeatures(margin, contentY, contentWidth, split, time);
        drawPlayers(margin, contentY + split + gap, contentWidth, Math.max(220, contentHeight - split - gap), time);
      } else {
        const featureWidth = Math.min(640, Math.max(560, contentWidth * 0.42));
        drawFeatures(margin, contentY, featureWidth, contentHeight, time);
        drawPlayers(margin + featureWidth + gap, contentY, contentWidth - featureWidth - gap, contentHeight, time);
      }
    }

    function animate(time) {
      draw(time);
      requestAnimationFrame(animate);
    }

    async function refresh() {
      try {
        const response = await fetch("/state", { cache: "no-store" });
        if (response.ok) state = await response.json();
      } catch {}
    }

    window.addEventListener("resize", () => draw());
    setInterval(refresh, 3000);
    requestAnimationFrame(animate);
  </script>
</body>
</html>`;
}

export function startDashboardServer(client: MusicClient): void {
  const server = createServer((req, res) => {
    if (req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, ...dashboardState(client) }));
      return;
    }

    if (req.url === "/state") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(dashboardState(client)));
      return;
    }

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(page(client));
  });

  server.on("error", (error) => logger.error({ error }, "Dashboard server error"));
  server.listen(env.DASHBOARD_PORT, env.DASHBOARD_HOST, () => {
    logger.info({ host: env.DASHBOARD_HOST, port: env.DASHBOARD_PORT }, "Dashboard server ready");
  });
}
