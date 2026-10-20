# Advanced Discord Music Bot

Discord.js v14, TypeScript, Kazagumo/Shoukaku, Lavalink v4, MongoDB ve Redis ile hazirlanmis public sunucu odakli muzik botu.

## Ozellikler

- Slash command tabanli Discord.js v14 mimarisi
- Lavalink + Kazagumo/Shoukaku player sistemi
- YouTube, YouTube Music, SoundCloud ve credential gerektirmeyen Spotify metadata cozme destegi
- Queue, loop, shuffle, seek, previous, replay, autoplay ve 24/7
- Bassboost, equalizer tabanli filtreler, nightcore, vaporwave, speed, pitch
- Lyrics, playlist, premium ve sunucu ayarlari
- Canvas now playing karti, progress bar, buton kontrolu ve select menu filtreleri
- MongoDB kalici veri, Redis cache hazirligi, sharding icin `shards: "auto"`
- Docker Compose ve PM2 production calistirma destegi

## Kurulum

```bash
npm install
cp .env.example .env
npm run deploy
npm run build
npm start
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
npm install
npm run deploy
npm run build
npm start
```

Prefix komutlari icin Discord Developer Portal > Bot sayfasinda **Message Content Intent** aktif olmalidir. Bot artik `DISCORD_GUILD_ID` istemez; hangi sunucuya davet edildiyse orada `r!play`, `r!skip`, `r!queue` gibi prefix komutlariyla calisir.

Slash komut kullanmak istersen `npm run deploy` global deploy yapar. Test icin tek sunucuya deploy etmek istersen `.env` icine opsiyonel olarak `DISCORD_GUILD_ID=SUNUCU_ID` ekleyebilirsin.

## Lavalink

Docker ile her sey birlikte:

```bash
docker compose up -d --build
```

Manuel Lavalink icin `lavalink/application.yml` dosyasini Lavalink jar dosyanizin yanina koyun ve:

```bash
java -jar Lavalink.jar
```

`.env` icindeki `LAVALINK_AUTH` degeri ile `application.yml` icindeki `lavalink.server.password` ayni olmalidir.

`lavalink/application.yml` dosyasi Lavasrc ve YouTube pluginlerini Maven uzerinden otomatik indirecek sekilde ayarlandi. Ekstra Spotify client id/secret, Apple token veya Deezer ARL girmen gerekmez.

Credential gerektirmeyen modda Spotify linkleri Lavasrc tarafinda anonymous/public token ile metadata olarak cozulur; ses, hizli fallback sirasi ile `ytmsearch`, `ytsearch`, `scsearch` uzerinden oynatilir. Apple Music ve Deezer direkt kaynaklari kapali gelir, cunku bu kaynaklarda stabil direkt stream icin servis credential/cookie gerekir. Kullanici `r!play sarki adi` yazdiginda sistem YouTube Music/YouTube/SoundCloud uzerinden hizli calar.

Performans icin:

- Lavalink'i botla ayni makinede veya ayni region'da calistir.
- Redis ve MongoDB'yi local network'te tut.
- Spotify playlist/album limitleri config'te sinirli tutuldu; buyuk public botlarda ani bellek yukunu azaltir.
- `providers` sirasinda YouTube Music once gelir; bu, credential gerektirmeyen modda en hizli ve stabil sonucu verir.

## PM2

```bash
npm run build
pm2 start ecosystem.config.cjs
pm2 save
```

## Komutlar

Muzik: `/play`, `/stop`, `/skip`, `/previous`, `/pause`, `/resume`, `/queue`, `/nowplaying`, `/volume`, `/shuffle`, `/loop`, `/seek`, `/remove`, `/autoplay`, `/replay`, `/lyrics`, `/playlist`, `/bassboost`, `/filter`, `/nightcore`, `/vaporwave`, `/speed`, `/pitch`, `/247`, `/join`, `/leave`

Yonetim: `/settings`, `/premium`

Prefix karsiliklari:

```text
r!play <sarki veya url>
r!stop
r!skip
r!previous
r!pause
r!resume
r!queue
r!nowplaying
r!volume 80
r!shuffle
r!loop none|track|queue
r!seek 1m30s
r!remove 3
r!autoplay on|off
r!replay
r!lyrics <sarki>
r!playlist create|add-current|list|load <isim>
r!bassboost 1-5
r!filter clear|bassboost|nightcore|vaporwave|karaoke|tremolo|vibrato
r!nightcore
r!vaporwave
r!speed 1.2
r!pitch 1.2
r!247 on|off
r!join
r!leave
```

## Dashboard Baglantisi

Dashboard icin servisler ayrildi:

- Mongo modelleri: `GuildSettings`, `Playlist`, `Premium`
- Player runtime: `client.kazagumo.players`
- Redis: `src/database/redis.ts`

Bir Express/Fastify dashboard eklerken bot process'iyle ayni Mongo/Redis'i kullanip guild ayarlarini dogrudan okuyabilirsiniz. Runtime player kontrolleri icin dashboard'u bot process'ine IPC, Redis pub/sub veya HTTP internal API ile baglamak en stabil yoldur.