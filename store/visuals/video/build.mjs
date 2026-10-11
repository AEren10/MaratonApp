// Tanitim videosu: node store/visuals/video/build.mjs
// 1) frames/screens.html'i 886x1920'de, grafikler cizilirken kare kare yakalar
// 2) compose.html bu kareleri tuvalde oynatir, MediaRecorder ile mp4 kaydeder
// Cikti: store/visuals/video/out/maraton-tanitim-886x1920.mp4 (Edge gerekir, ffmpeg gerekmez)
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..", "..");
const out = join(here, "out");
const SCREENS = ["home", "rota", "analiz", "mat", "mufredat", "gecmis"];
const FRAMES = 28;
const W = 886, H = 1920;
mkdirSync(join(out, "f"), { recursive: true });

const MIME = { ".html": "text/html", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".ttf": "font/ttf" };
const server = createServer((req, res) => {
  const file = join(root, decodeURIComponent(req.url.split("?")[0]));
  if (!existsSync(file)) { res.writeHead(404).end(); return; }
  res.writeHead(200, { "Content-Type": MIME[extname(file)] || "application/octet-stream" }).end(readFileSync(file));
}).listen(0);
const base = `http://127.0.0.1:${server.address().port}`;

const port = 9400 + Math.floor(Math.random() * 400);
const edge = spawn("C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", [
  "--headless=new", "--hide-scrollbars", "--autoplay-policy=no-user-gesture-required",
  `--remote-debugging-port=${port}`, `--user-data-dir=${join(tmpdir(), "maraton-video-" + port)}`, "about:blank",
], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let targets;
for (let i = 0; i < 60 && !targets; i++) { try { targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); } catch { await sleep(200); } }
const ws = new WebSocket(targets.find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = new Map();
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (pending.has(d.id)) { pending.get(d.id)(d.result); pending.delete(d.id); } };
const send = (method, params = {}) => new Promise((r) => { pending.set(++id, r); ws.send(JSON.stringify({ id, method, params })); });
const ev = async (expression) => (await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }))?.result?.value;
const waitTitle = async (t, max = 180) => { const t0 = Date.now(); while ((await ev("document.title")) !== t) { if (Date.now() - t0 > max * 1000) throw new Error("zaman asimi: " + t); await sleep(250); } };

if (!process.argv.includes("--compose-only")) {
  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 845, deviceScaleFactor: W / 390, mobile: false });
  for (const s of SCREENS) {
    await send("Page.navigate", { url: `${base}/store/visuals/frames/screens.html?s=${s}` });
    await sleep(300); await waitTitle("ready");
    for (let f = 0; f <= FRAMES; f++) {
      const t = f / FRAMES, p = 1 - Math.pow(1 - t, 3);
      await ev(`applyProgress(${p})`);
      const shot = await send("Page.captureScreenshot", { format: "jpeg", quality: 93 });
      writeFileSync(join(out, "f", `${s}_${f}.jpg`), Buffer.from(shot.data, "base64"));
    }
    console.log("kareler:", s);
  }
}

await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url: `${base}/store/visuals/video/compose.html?frames=${FRAMES}` });
await sleep(500); await waitTitle("done", 240);
console.log("bilgi:", await ev("window.__info"));
const len = await ev("window.__b64.length"); let b64 = "";
for (let i = 0; i < len; i += 4e6) b64 += await ev(`window.__b64.slice(${i},${i + 4e6})`);
const file = join(out, "maraton-tanitim-886x1920.mp4");
writeFileSync(file, Buffer.from(b64, "base64"));
console.log("yazildi:", file, Math.round(Buffer.from(b64, "base64").length / 1024) + " KB");
ws.close(); edge.kill(); server.close(); process.exit(0);
