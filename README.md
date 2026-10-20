# ⚡ Realyueloin_

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:09090B,50:6D28D9,100:A855F7&height=230&section=header&text=REAlYUELOIN_&fontSize=48&fontColor=FFFFFF&fontAlignY=38&desc=Developer%20%7C%20Bot%20Engineer%20%7C%20Creative%20Technologist&descAlignY=58&descSize=15" width="100%" alt="Realyueloin_ Banner"/>

### Building digital experiences, one project at a time.

**Welcome to my GitHub profile!** 👋

I'm **Realyueloin_**, a developer passionate about software development, Discord bots, web technologies and automation systems. I enjoy building modern digital products with clean architecture, powerful functionality and premium user experiences.

[![GitHub](https://img.shields.io/badge/GitHub-Realyueloin__-181717?style=for-the-badge&logo=github)](https://github.com/Realyueloin_)
[![Discord](https://img.shields.io/badge/Discord-Connect-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.com/users/1017736516245655614)
[![Profile Views](https://komarev.com/ghpvc/?username=S1morgaq&style=for-the-badge&color=8B5CF6)](https://github.com/S1morgaq)

</div>

---

## 👨‍💻 About Me

- 💻 **Developer:** `Realyueloin_`
- 🎯 **Interests:** Software Development, Discord Bots, Web Development and Automation
- ⚙️ **Focus:** Backend systems, clean architecture and scalable applications
- 🎨 **Design Philosophy:** Minimal, modern and premium UI/UX
- 🚀 **Goal:** Turning creative ideas into powerful digital products
- 🌐 **GitHub:** [github.com/Realyueloin_](https://github.com/Realyueloin_)

I enjoy exploring new technologies, solving technical challenges and continuously improving my development skills. My focus is on creating practical, maintainable and high-quality projects that combine performance, functionality and design.

## 🚀 Featured Project

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:18181B,100:6D28D9&height=100&text=ADVANCED%20DISCORD%20MUSIC%20BOT&fontSize=23&fontColor=FFFFFF" width="100%" alt="Advanced Discord Music Bot"/>

### 🎵 Advanced Discord Music Bot

**A powerful, scalable and feature-rich music experience for Discord.**

Built with Discord.js v14, TypeScript, Kazagumo, Shoukaku, Lavalink v4, MongoDB and Redis, this project is designed for public Discord servers with an emphasis on modular architecture, interactive controls and production deployment.

[![Discord.js](https://img.shields.io/badge/Discord.js-v14-5865F2?style=flat-square&logo=discord)](https://discord.js.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Lavalink](https://img.shields.io/badge/Lavalink-v4-7C3AED?style=flat-square)](https://github.com/lavalink-devs/Lavalink)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-Cache-DC382D?style=flat-square&logo=redis)](https://redis.io/)

</div>

### ✨ Key Features

- 🎧 **Multi-Source Playback:** YouTube, YouTube Music, SoundCloud and Spotify metadata resolution with supported audio-source fallback.
- 📜 **Advanced Queue System:** Queue management, shuffle, loop, seek, previous, replay and autoplay.
- 🎚️ **Audio Filters:** Bassboost, equalizer-based filters, nightcore, vaporwave, speed and pitch controls.
- 🎨 **Interactive Music Interface:** Canvas-based now-playing cards, progress bars, buttons and select menu controls.
- 📝 **Lyrics & Playlists:** Lyrics lookup and playlist management.
- ⚙️ **Server Settings:** Guild configuration and premium feature infrastructure.
- 🗄️ **Persistent Storage:** MongoDB integration for persistent data.
- ⚡ **Redis Integration:** Cache infrastructure for performance-oriented workloads.
- 🌐 **Scalable Deployment:** Docker Compose, PM2 and automatic sharding configuration.
- 🔌 **Dashboard-Ready Architecture:** Separated services designed to support future dashboard integration.

### 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| Languages | TypeScript, JavaScript |
| Discord Framework | Discord.js v14 |
| Music System | Kazagumo, Shoukaku, Lavalink v4 |
| Database | MongoDB |
| Cache | Redis |
| Rendering | Canvas |
| Deployment | Docker Compose, PM2 |
| Configuration | Environment Variables, YAML |
| Version Control | Git, GitHub |

### 📦 Installation

**Requirements**

- Node.js and npm
- Discord application and bot token
- MongoDB connection
- Lavalink v4 server
- Redis if using the configured cache integration

**Linux / macOS**

```bash
git clone YOUR_REPOSITORY_URL
cd YOUR_PROJECT_FOLDER
npm install
cp .env.example .env
npm run deploy
npm run build
npm start
```

**Windows PowerShell**

```powershell
git clone YOUR_REPOSITORY_URL
cd YOUR_PROJECT_FOLDER
Copy-Item .env.example .env
npm install
npm run deploy
npm run build
npm start
```

Before starting the bot, configure the required values in `.env`, including your Discord token, database connection and Lavalink credentials.

Never commit your real `.env` file, bot token, database credentials or other secrets to GitHub.

### 🐳 Docker Deployment

If the repository includes the provided Docker Compose configuration:

```bash
docker compose up -d --build
```

### ⚙️ PM2 Production

```bash
npm run build
pm2 start ecosystem.config.cjs
pm2 save
```

### 🎼 Command Overview

| Category | Commands |
|---|---|
| Playback | `/play`, `/stop`, `/skip`, `/pause`, `/resume` |
| Queue | `/queue`, `/shuffle`, `/remove`, `/previous` |
| Player | `/nowplaying`, `/volume`, `/seek`, `/replay` |
| Audio Filters | `/bassboost`, `/filter`, `/nightcore`, `/vaporwave` |
| Advanced Audio | `/speed`, `/pitch`, `/autoplay`, `/247` |
| Music Content | `/lyrics`, `/playlist` |
| Server Management | `/settings`, `/premium` |

**Prefix commands** are also supported by the project configuration, including `r!play`, `r!skip`, `r!queue`, `r!volume` and other corresponding commands.

### 🏗️ Architecture Overview

```text
                 DISCORD USERS
                       |
                       v
                 Discord.js v14
                       |
                       v
              Commands & Event System
                       |
                       v
               Kazagumo / Shoukaku
                       |
                       v
                  Lavalink v4
                       |
              +--------+--------+
              |                 |
              v                 v
           MongoDB            Redis
        Persistent Data      Cache Layer
```

### 🎯 Development Goals

- Improve playback reliability and error handling.
- Maintain modular and readable code.
- Optimize queue and playlist processing.
- Support scalable deployments for public Discord servers.
- Keep the architecture ready for future dashboard integration.

> **Note:** Spotify links are resolved as metadata and matched with supported audio sources. Playback availability depends on the configured Lavalink plugins, source availability and service conditions. Feature availability may vary by configuration.

---

## 🧰 Technologies & Tools

<div align="center">

<img src="https://skillicons.dev/icons?i=js,ts,nodejs,html,css,php,python,java,cs,cpp,react,express,mongodb,redis,mysql,git,github,docker,linux,vscode&perline=10" alt="Technologies and Tools"/>

</div>

I am interested in exploring different programming languages, development tools and software architectures. The technologies displayed here represent areas of interest and should be updated as my projects evolve.

## 📊 GitHub Statistics

<div align="center">

<img height="165" src="https://github-readme-stats.vercel.app/api?username=Realyueloin_&show_icons=true&theme=tokyonight&hide_border=true&rank_icon=github" alt="GitHub Statistics"/>

<img height="165" src="https://github-readme-stats.vercel.app/api/top-langs/?username=Realyueloin_&layout=compact&theme=tokyonight&hide_border=true" alt="Most Used Languages"/>

<img width="95%" src="https://streak-stats.demolab.com?user=Realyueloin_&theme=tokyonight&hide_border=true" alt="GitHub Contribution Streak"/>

</div>

## 🎯 Current Goals

- ⚡ Build advanced and scalable Discord bots.
- 🏗️ Improve software architecture and code quality.
- 🌐 Develop modern web applications and management dashboards.
- 🔐 Build secure and reliable production systems.
- 🎨 Create polished, intuitive and responsive interfaces.
- 🚀 Contribute to open-source projects and developer communities.

## 🤝 Let's Connect

<div align="center">

### Have an idea? Let's build something great.

[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=for-the-badge&logo=github)](https://github.com/Realyueloin_)

[![Discord](https://img.shields.io/badge/Discord-Realyueloin__-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.com/users/1017736516245655614)

**Discord User ID**

`1017736516245655614`

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:A855F7,50:6D28D9,100:09090B&height=120&section=footer" width="100%" alt="Footer Banner"/>

*Designed with curiosity. Built with code. Improved with every project.*

</div>
