// App Store önizleme videosu: node render-video.mjs  -> ../video/maraton-onizleme-886x1920.mp4
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";
const here = path.dirname(new URL(import.meta.url).pathname);
const req = createRequire(import.meta.url);
const pwPath = (() => { try { return req.resolve("playwright"); } catch { return path.join(execFileSync("npm", ["root", "-g"]).toString().trim(), "playwright", "index.js"); } })();
const { chromium } = req(pwPath);
const FPS = 30;
const out = path.join(here, "..", "video"); mkdirSync(out, { recursive: true });
const frames = path.join(out, "_frames"); rmSync(frames, { recursive: true, force: true }); mkdirSync(frames);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 443, height: 960 }, deviceScaleFactor: 2 });
await page.goto(`file://${here}/video.html`);
await page.waitForSelector("body[data-ready='1']");
const dur = await page.evaluate(() => window.DURATION);
const n = Math.round(dur * FPS);
for (let i = 0; i < n; i++) {
  await page.evaluate((t) => window.seek(t), i / FPS);
  await page.screenshot({ path: path.join(frames, `${String(i).padStart(4, "0")}.png`) });
}
await browser.close();
const mp4 = path.join(out, "maraton-onizleme-886x1920.mp4");
// H.264 High@4.0, 30 fps, ~11 Mbps; Apple stereo AAC ses izi bekler -> sessiz iz eklenir
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", path.join(frames, "%04d.png"),
  "-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=48000",
  "-vf", "scale=886:1920:flags=lanczos,format=yuv420p", "-c:v", "libx264", "-profile:v", "high", "-level", "4.0",
  "-b:v", "11M", "-maxrate", "12M", "-bufsize", "24M", "-r", String(FPS),
  "-c:a", "aac", "-b:a", "256k", "-shortest", "-movflags", "+faststart", mp4]);
// Poster (App Store önizleme kapağı için)
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-ss", "5.5", "-i", mp4, "-frames:v", "1", path.join(out, "poster.jpg")]);
rmSync(frames, { recursive: true, force: true });
console.log(mp4, n, "kare");
