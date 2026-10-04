// Maraton mağaza görselleri — ekran şablonları.
// Her ekran 390x844 telefon içeriği döndürür. Veriler kurgusal demo verisidir;
// sayılar kendi içinde tutarlı (D - Y/4 = net, toplamlar eşleşir).

const S = {
  tur: "var(--s-tur)", mat: "var(--s-mat)", fiz: "var(--s-fiz)", kim: "var(--s-kim)",
  bio: "var(--s-bio)", tar: "var(--s-tar)", cog: "var(--s-cog)", fel: "var(--s-fel)",
};

const statusBar = () => `
<div class="sb"><span class="num">9:41</span>
  <span class="row" style="gap:6px">
    <svg width="18" height="12" viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1" fill="#ECE8E4"/><rect x="5" y="5.5" width="3" height="6.5" rx="1" fill="#ECE8E4"/><rect x="10" y="3" width="3" height="9" rx="1" fill="#ECE8E4"/><rect x="15" y="0" width="3" height="12" rx="1" fill="#ECE8E4"/></svg>
    <svg width="16" height="12" viewBox="0 0 16 12"><path d="M8 2.2c2.3 0 4.4.9 6 2.4l1.2-1.3A10.4 10.4 0 0 0 8 .4C5.2.4 2.7 1.5.8 3.3L2 4.6a8.6 8.6 0 0 1 6-2.4Zm0 3.6c1.3 0 2.5.5 3.4 1.3l1.2-1.3A6.7 6.7 0 0 0 8 4c-1.8 0-3.4.7-4.6 1.8l1.2 1.3c.9-.8 2.1-1.3 3.4-1.3Zm0 3.5c-.5 0-1 .2-1.3.5L8 11.6l1.3-1.8c-.3-.3-.8-.5-1.3-.5Z" fill="#ECE8E4"/></svg>
    <svg width="27" height="13" viewBox="0 0 27 13"><rect x=".5" y=".5" width="23" height="12" rx="3.5" stroke="#ECE8E4" opacity=".4" fill="none"/><rect x="2" y="2" width="18" height="9" rx="2" fill="#ECE8E4"/><path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2Z" fill="#ECE8E4" opacity=".4"/></svg>
  </span></div>`;

const ICON = {
  rota: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 19 9 7l4 7 3-4 5 9"/></svg>`,
  prog: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>`,
  anal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 20v-6M10 20V8M15 20v-9M20 20V4"/></svg>`,
  prof: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" stroke-linecap="round"/></svg>`,
  check: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#0E2A20" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m3.5 8.5 3 3 6-7"/></svg>`,
  chev: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 3 5 5-5 5"/></svg>`,
  back: `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#ECE8E4" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4 7 11l7 7"/></svg>`,
  flame: `<svg width="15" height="17" viewBox="0 0 15 17"><path d="M7.6 0C8.4 3 12 5 12 9.4a4.6 4.6 0 0 1-9.2.3C2.8 7.4 4 5.8 5 5c0 1.6.7 2.6 1.6 2.9C6 5.4 6.5 2.3 7.6 0Z" fill="#FF8A3D"/><path d="M7.4 16.6A3 3 0 0 1 4.6 13c.2-1.5 1.4-2.3 1.8-3.6.9 1 1.2 2 1 2.8.7-.2 1.2-.8 1.4-1.5.8.9 1.4 1.8 1.4 2.9a2.8 2.8 0 0 1-2.8 3Z" fill="#FFC27A"/></svg>`,
};

const tabBar = (on) => {
  const t = (k, label, ic) => `<div class="tab ${on === k ? "on" : ""}">${ic}<span>${label}</span></div>`;
  return `<div class="tabs">${t("rota", "ROTA", ICON.rota)}${t("prog", "PROGRAM", ICON.prog)}
    <div class="plus"><svg width="24" height="24" viewBox="0 0 24 24" stroke="#fff" stroke-width="2.6" stroke-linecap="round"><path d="M12 4v16M4 12h16"/></svg></div>
    ${t("anal", "ANALİZ", ICON.anal)}${t("prof", "PROFİL", ICON.prof)}</div><div class="home-ind"></div>`;
};

const phone = (inner) => `<div class="device"><div class="ph">${statusBar()}${inner}</div></div>`;

// Basit eğri: noktalardan yumuşak path (Catmull-Rom -> Bezier)
function smooth(pts) {
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0]},${p2[1]}`;
  }
  return d;
}
const spark = (vals, color, w = 86, h = 30) => {
  const min = Math.min(...vals), max = Math.max(...vals);
  const pts = vals.map((v, i) => [+(i * (w - 6) / (vals.length - 1) + 3).toFixed(1), +(h - 4 - (v - min) / (max - min || 1) * (h - 8)).toFixed(1)]);
  const last = pts[pts.length - 1];
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><path class="draw" d="${smooth(pts)}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round"/><circle cx="${last[0]}" cy="${last[1]}" r="3.4" fill="${color}"/></svg>`;
};

/* 1 · ROTA (ana ekran) */
function scrRota() {
  const past = [[8, 128], [40, 118], [70, 92], [100, 104], [132, 80], [164, 74]];
  const proj = [[164, 74], [220, 62], [280, 42], [326, 22]];
  const stops = [
    { s: "Matematik", c: S.mat, t: "Limit ve Süreklilik", m: "30 soru · ~38 dk", done: true },
    { s: "Türkçe", c: S.tur, t: "Paragrafta Yapı", m: "25 soru · ~30 dk", done: true },
    { s: "Matematik", c: S.mat, t: "Türev Alma Kuralları", m: "24 soru · ~32 dk", active: true },
    { s: "Fizik", c: S.fiz, t: "Dalgalar", m: "18 soru · ~25 dk" },
  ];
  return phone(`<div class="scr">
    <div class="row between">
      <div class="row" style="gap:12px">
        <div style="width:46px;height:46px;border-radius:12px;background:var(--elev);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;font-weight:700;color:var(--accent-text);font-size:16px">AY</div>
        <div><div class="eyebrow" style="font-size:11px">İYİ SABAHLAR</div><div style="font-weight:600;font-size:18px;margin-top:3px">Ahmet Yılmaz</div></div>
      </div>
      <div class="row" style="gap:7px;height:40px;padding:0 14px;border:1px solid var(--line);border-radius:12px;background:var(--surface);font-weight:700;font-size:13px;letter-spacing:.06em">${ICON.flame}<span class="num">47 GÜN</span></div>
    </div>
    <div class="row between" style="margin-top:26px;align-items:flex-start">
      <div class="eyebrow">BUGÜN ÇÖZÜLEN</div>
      <div style="text-align:right"><div class="eyebrow">YKS 2027</div><div class="bri num" style="font-size:26px;margin-top:2px;letter-spacing:-.02em">258 gün</div></div>
    </div>
    <div class="row" style="align-items:flex-end;margin-top:-26px;gap:6px">
      <span class="bri num pop" style="font-size:96px;line-height:.92;letter-spacing:-.04em">63</span>
      <span class="bri num" style="font-size:24px;color:var(--text3);margin-bottom:10px">/100</span>
    </div>
    <div style="font-size:14px;color:var(--text2);margin-top:8px">hedefe 37 soru kaldı</div>
    <svg width="346" height="150" viewBox="0 0 346 150" style="display:block;margin-top:6px;overflow:visible">
      <defs><linearGradient id="rg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E5343F" stop-opacity=".28"/><stop offset="1" stop-color="#E5343F" stop-opacity="0"/></linearGradient></defs>
      <path d="${smooth(past)} L164,150 L8,150 Z" fill="url(#rg)" class="fade"/>
      <path class="draw" d="${smooth(past)}" fill="none" stroke="#E5343F" stroke-width="3.2" stroke-linecap="round"/>
      <path class="draw2" d="${smooth(proj)}" fill="none" stroke="var(--proj)" stroke-width="2.4" stroke-dasharray="2 6" stroke-linecap="round"/>
      ${past.slice(0, -1).map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="4.5" fill="var(--bg)" stroke="#E5343F" stroke-width="2.6"/>`).join("")}
      <circle cx="164" cy="74" r="14" fill="rgba(229,52,63,.22)" class="pulse"/>
      <circle cx="164" cy="74" r="7.5" fill="#E5343F"/>
      <circle cx="326" cy="22" r="7" fill="var(--bg)" stroke="var(--proj)" stroke-width="2.4"/>
      <text x="58" y="78" fill="#A3A0AB" font-size="11" font-family="Archivo" font-weight="500">Fonksiyonlar</text>
      <text x="118" y="62" fill="#A3A0AB" font-size="11" font-family="Archivo" font-weight="500">Limit</text>
      <text x="149" y="104" fill="#FF6A72" font-size="11" font-family="Archivo" font-weight="700" letter-spacing="1.6">BUGÜN</text>
      <text x="312" y="12" text-anchor="end" fill="#A3A0AB" font-size="11" font-family="Archivo" font-weight="700" letter-spacing="1.4">TAHMİN 88</text>
    </svg>
    <div class="row between" style="margin-top:8px;font-size:11px;font-weight:600;letter-spacing:.08em;color:var(--text4)"><span>4 AĞU</span><span>4 EKİ</span><span>HAZ 2027</span></div>
    <div style="font-size:13.5px;color:var(--text2);margin-top:14px;line-height:1.5">Bu tempoyla sınav günü <b style="color:var(--text);font-weight:600">88 net</b> · hedefinin 2 net üstünde</div>
    <div class="row between" style="margin-top:18px;height:74px;border-radius:16px;background:var(--brand-fill);padding:0 16px 0 20px;box-shadow:0 14px 40px rgba(229,52,63,.28)">
      <div><div style="font-weight:700;font-size:19px;color:#fff">Çalışmaya Başla</div><div style="font-size:13px;color:rgba(255,255,255,.82);margin-top:4px;font-weight:500">Matematik · Türev · 32 dk</div></div>
      <div style="width:40px;height:40px;border-radius:20px;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;color:#fff">${ICON.chev}</div>
    </div>
    <div class="row between" style="margin-top:24px"><div class="eyebrow">BUGÜNÜN DURAKLARI</div>
      <div class="row" style="gap:5px">${[1, 1, 0, 0].map(f => `<i style="width:22px;height:4px;border-radius:2px;background:${f ? "var(--accent)" : "var(--track)"}"></i>`).join("")}<span class="num" style="font-size:12.5px;font-weight:700;margin-left:6px">2/4</span></div></div>
    <div style="display:flex;flex-direction:column;gap:10px;margin-top:12px">
    ${stops.map(s => `<div class="card row stop" style="height:72px;padding:0 14px 0 0;gap:14px;${s.active ? "background:color-mix(in oklab,var(--s-mat) 9%,var(--surface));border-color:color-mix(in oklab,var(--s-mat) 40%,var(--line))" : ""}">
      <i style="width:3px;height:44px;border-radius:2px;margin-left:12px;background:${s.done ? "var(--text5)" : s.c}"></i>
      ${s.done ? `<div class="tick" style="width:30px;height:30px;border-radius:15px;background:var(--up);display:flex;align-items:center;justify-content:center">${ICON.check}</div>` : `<div style="width:30px;height:30px;border-radius:15px;border:2.4px solid ${s.active ? "var(--accent)" : "var(--text5)"}"></div>`}
      <div style="flex:1"><div style="font-size:11px;font-weight:600;letter-spacing:.06em;color:${s.done ? "var(--text3)" : s.c}">${s.s}</div>
        <div class="bri" style="font-size:16.5px;margin-top:2px;color:${s.done ? "var(--text2)" : "var(--text)"}">${s.t}</div>
        <div class="meta" style="margin-top:2px">${s.m}</div></div>
      ${s.active ? `<div style="height:34px;padding:0 14px;border-radius:8px;background:var(--brand-tint);color:var(--accent-text);font-weight:700;font-size:13px;display:flex;align-items:center">Başla</div>` : ""}
    </div>`).join("")}
    </div>
  </div>${tabBar("rota")}`);
}

/* 2 · NET GRAFİĞİ */
function scrNet() {
  const vals = [67.75, 70.5, 69.25, 74, 77.5, 81.25];
  const X = (i) => 36 + i * 54, Y = (v) => 168 - (v - 60) * 5.2;
  const pts = vals.map((v, i) => [X(i), +Y(v).toFixed(1)]);
  const rows = [
    { n: "Türkçe", c: S.tur, v: "31,5", d: "+4,25", s: [27.25, 28, 28.5, 29.75, 30.5, 31.5] },
    { n: "Matematik", c: S.mat, v: "24,75", d: "+6,0", s: [18.75, 20.5, 19.75, 22, 23.25, 24.75] },
    { n: "Fen Bilimleri", c: S.fiz, v: "13,0", d: "+2,5", s: [10.5, 11, 10.25, 11.5, 12.75, 13] },
    { n: "Sosyal Bilimler", c: S.tar, v: "12,0", d: "+0,75", s: [11.25, 11, 10.75, 10.75, 11, 12] },
  ];
  return phone(`<div class="scr">
    <div class="row between"><div class="bri" style="font-size:32px;letter-spacing:-.03em">Analiz</div>
      <div class="row" style="padding:4px;border-radius:10px;background:var(--void);border:1px solid var(--line);gap:4px">
        <div style="width:64px;height:32px;border-radius:6px;background:var(--elev);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px">TYT</div>
        <div style="width:64px;height:32px;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:13px;color:var(--text3)">AYT</div></div></div>
    <div class="card" style="margin-top:18px;padding:20px 18px 14px">
      <div class="row between"><div class="eyebrow">SON DENEME · 2 EKİM</div><div class="eyebrow">6 DENEME</div></div>
      <div class="row" style="align-items:flex-end;gap:10px;margin-top:10px">
        <span class="bri num" style="font-size:64px;line-height:.9;letter-spacing:-.04em">81,25</span>
        <span class="num up" style="font-weight:700;font-size:15px;margin-bottom:8px">↑ 13,5 net</span></div>
      <div class="meta" style="margin-top:8px">İlk denemene göre · 6 Temmuz'dan bu yana</div>
      <svg width="320" height="190" viewBox="0 0 320 190" style="display:block;margin-top:14px;overflow:visible">
        <defs><linearGradient id="ng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E5343F" stop-opacity=".30"/><stop offset="1" stop-color="#E5343F" stop-opacity="0"/></linearGradient></defs>
        ${[60, 70, 80, 90].map(v => `<line x1="30" x2="320" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--line)" stroke-width="1"/><text x="0" y="${Y(v) + 4}" fill="#827F88" font-size="11" font-family="Archivo" font-weight="500">${v}</text>`).join("")}
        <line x1="30" x2="320" y1="${Y(90)}" y2="${Y(90)}" stroke="var(--accent)" stroke-opacity=".55" stroke-width="1.6" stroke-dasharray="5 5"/>
        <text x="320" y="${Y(90) - 8}" text-anchor="end" fill="#FF6A72" font-size="11" font-family="Archivo" font-weight="700" letter-spacing="1.4">HEDEF 90</text>
        <path class="fade" d="${smooth(pts)} L${X(5)},168 L30,168 Z" fill="url(#ng)"/>
        <path class="draw" d="${smooth(pts)}" fill="none" stroke="#E5343F" stroke-width="3.2" stroke-linecap="round"/>
        ${pts.map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="${i === 5 ? 7 : 4.5}" fill="${i === 5 ? "#E5343F" : "var(--surface)"}" stroke="#E5343F" stroke-width="2.6"/>`).join("")}
        <g transform="translate(${X(5) - 28},${Y(81.25) - 40})"><rect width="50" height="24" rx="6" fill="var(--elev)" stroke="var(--line)"/><text x="25" y="16.5" text-anchor="middle" fill="#ECE8E4" font-size="12.5" font-family="Archivo" font-weight="700">81,25</text></g>
        ${["6 Tem", "27 Tem", "17 Ağu", "7 Eyl", "21 Eyl", "2 Eki"].map((d, i) => `<text x="${X(i)}" y="188" text-anchor="middle" fill="#827F88" font-size="11" font-family="Archivo" font-weight="500">${d}</text>`).join("")}
      </svg>
    </div>
    <div class="row between" style="margin-top:22px"><div class="eyebrow">DERS BAZINDA</div><div class="meta">son 6 deneme</div></div>
    <div class="card" style="margin-top:10px;padding:2px 16px">
      ${rows.map((r, i) => `<div class="row" style="height:64px;gap:12px;${i ? "border-top:1px solid var(--line)" : ""}">
        <i class="dot" style="background:${r.c}"></i>
        <div style="flex:1"><div style="font-weight:600;font-size:14.5px">${r.n}</div><div class="num up" style="font-size:12.5px;font-weight:600;margin-top:3px">${r.d} net</div></div>
        ${spark(r.s, r.c)}
        <div class="bri num" style="font-size:24px;width:66px;text-align:right">${r.v}</div></div>`).join("")}
    </div>
  </div>${tabBar("anal")}`);
}

/* 3 · DENEME DETAYI */
function scrDeneme() {
  const rows = [
    { n: "Türkçe", c: S.tur, q: 40, d: 33, y: 6, b: 1, net: "31,5" },
    { n: "Matematik", c: S.mat, q: 40, d: 27, y: 9, b: 4, net: "24,75" },
    { n: "Fen Bilimleri", c: S.fiz, q: 20, d: 14, y: 4, b: 2, net: "13,0" },
    { n: "Sosyal Bilimler", c: S.tar, q: 20, d: 13, y: 4, b: 3, net: "12,0" },
  ];
  return phone(`<div class="scr">
    <div class="row between" style="height:44px">${ICON.back}<div class="eyebrow">DENEME DETAYI</div><div style="width:22px"></div></div>
    <div style="margin-top:14px"><div class="eyebrow red">TYT · GENEL DENEME 6</div>
      <div class="meta" style="margin-top:6px">2 Ekim Cuma · 165 dakika</div></div>
    <div class="row" style="align-items:flex-end;gap:8px;margin-top:12px">
      <span class="bri num" style="font-size:96px;line-height:.9;letter-spacing:-.04em">81,25</span>
      <span class="bri" style="font-size:22px;color:var(--text3);margin-bottom:10px">net</span></div>
    <div class="row" style="gap:8px;margin-top:16px">
      ${[["87", "doğru", "var(--text)"], ["23", "yanlış", "var(--text2)"], ["10", "boş", "var(--text3)"], ["+3,75", "önceki", "var(--up)"]].map(([v, l, c]) => `<div class="card" style="flex:1;padding:10px 0;text-align:center;border-radius:12px"><div class="bri num" style="font-size:22px;color:${c}">${v}</div><div class="meta" style="font-size:11px;margin-top:2px">${l}</div></div>`).join("")}
    </div>
    <div class="row between" style="margin-top:24px"><div class="eyebrow">DERS DERS</div>
      <div class="row meta" style="gap:12px"><span class="row" style="gap:5px"><i class="dot" style="background:linear-gradient(90deg,var(--s-tur) 50%,var(--s-mat) 50%)"></i>D</span><span class="row" style="gap:5px"><i class="dot" style="background:var(--text5)"></i>Y</span><span class="row" style="gap:5px"><i class="dot" style="background:var(--void);border:1px solid var(--line)"></i>B</span></div></div>
    <div style="display:flex;flex-direction:column;gap:10px;margin-top:12px">
    ${rows.map(r => `<div class="card" style="padding:14px 16px">
      <div class="row between"><div class="row" style="gap:10px"><i style="width:3px;height:30px;border-radius:2px;background:${r.c}"></i>
        <div><div style="font-weight:600;font-size:15px">${r.n}</div><div class="meta num" style="margin-top:2px">${r.d} D · ${r.y} Y · ${r.b} B <span style="color:var(--text4)">/ ${r.q}</span></div></div></div>
        <div class="bri num" style="font-size:26px">${r.net}</div></div>
      <div class="row" style="height:8px;margin-top:12px;border-radius:4px;overflow:hidden;background:var(--void);gap:2px">
        <i class="grow" style="height:100%;width:${r.d / r.q * 100}%;background:${r.c}"></i><i class="grow" style="height:100%;width:${r.y / r.q * 100}%;background:var(--text5)"></i></div>
    </div>`).join("")}
    </div>
    <div class="card row between" style="margin-top:12px;padding:14px 16px;background:color-mix(in oklab,var(--warn) 7%,var(--surface));border-color:color-mix(in oklab,var(--warn) 30%,var(--line))">
      <div><div class="eyebrow" style="color:var(--warn)">EN ÇOK KAYIP</div><div style="font-weight:600;font-size:14.5px;margin-top:5px">Matematik · Fonksiyonlar</div><div class="meta" style="margin-top:2px">4 yanlış · 2,25 net kaybı</div></div>
      <div style="height:34px;padding:0 12px;border-radius:8px;border:1px solid var(--border);font-weight:700;font-size:13px;display:flex;align-items:center">Deftere ekle</div>
    </div>
  </div>`);
}

/* 4 · YANLIŞ DEFTERİ */
function qThumb(kind) {
  const paper = "background:#EFEBE4;color:#26232A;";
  const map = {
    fn: `<div style="font-family:Bricolage;font-size:12px;white-space:nowrap">x² − 4x + 3 = 0</div><svg width="64" height="34" viewBox="0 0 64 34" style="margin-top:4px"><path d="M2 30H62M14 2V33" stroke="#26232A" stroke-width="1"/><path d="M6 6Q24 52 44 6" fill="none" stroke="#C42633" stroke-width="1.6"/></svg>`,
    wave: `<svg width="70" height="44" viewBox="0 0 70 44"><path d="M2 22H68" stroke="#26232A" stroke-width=".8"/><path d="M2 22C8 4 14 4 20 22S32 40 38 22 50 4 56 22 62 40 68 22" fill="none" stroke="#0C657D" stroke-width="1.6"/></svg><div style="font-size:9.5px;font-weight:600;margin-top:2px">λ = ? m</div>`,
    para: `<div style="display:flex;flex-direction:column;gap:4px;width:68px">${[1, .9, 1, .7, .95, .6].map(w => `<i style="height:3px;width:${w * 100}%;background:#26232A;opacity:.55;border-radius:2px"></i>`).join("")}</div><div style="font-size:9.5px;font-weight:700;margin-top:6px">A) B) C) D)</div>`,
    mol: `<div style="font-family:Bricolage;font-size:12px;line-height:1.3">2H₂ + O₂ →<br>2H₂O</div><div style="font-size:9.5px;font-weight:600;margin-top:4px">n = 0,4 mol</div>`,
  };
  return `<div style="${paper}width:86px;height:92px;border-radius:10px;padding:10px 8px;flex-shrink:0;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;transform:rotate(-1.5deg);box-shadow:0 0 0 1px rgba(0,0,0,.2)">${map[kind]}</div>`;
}
function scrDefter() {
  const items = [
    { s: "Matematik", c: S.mat, t: "Fonksiyonlarda Grafik", n: "Kökleri bulup işareti ters okudum.", k: "fn", st: ["Tekrar bugün", "warn"] },
    { s: "Fizik", c: S.fiz, t: "Dalgalar", n: "Dalga boyunu iki tepe arası değil, tepe-çukur aldım.", k: "wave", st: ["Tekrar yarın", "mute"] },
    { s: "Türkçe", c: S.tur, t: "Paragrafta Ana Düşünce", n: "Yardımcı düşünceyi ana fikir sandım.", k: "para", st: ["2. tekrar ✓", "up"] },
    { s: "Kimya", c: S.kim, t: "Mol Kavramı", n: "Katsayıları orana çevirmeyi unuttum.", k: "mol", st: ["Tekrar 3 gün sonra", "mute"] },
  ];
  const pill = ([l, k]) => {
    const c = k === "warn" ? "var(--warn)" : k === "up" ? "var(--up)" : "var(--text3)";
    return `<span style="height:26px;padding:0 10px;border-radius:6px;font-size:12px;font-weight:700;color:${c};background:color-mix(in oklab,${c} 12%,transparent);display:inline-flex;align-items:center">${l}</span>`;
  };
  return phone(`<div class="scr">
    <div class="row between"><div class="bri" style="font-size:32px;letter-spacing:-.03em">Yanlış Defteri</div>
      <div style="width:40px;height:40px;border-radius:12px;background:var(--brand-fill);display:flex;align-items:center;justify-content:center"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg></div></div>
    <div class="meta" style="margin-top:6px;font-size:13px">16 çözülmemiş soru · 5'i bugün tekrar bekliyor</div>
    <div class="row" style="gap:8px;margin-top:16px;overflow:hidden">
      <span class="chip on">Tümü · 16</span><span class="chip">Matematik</span><span class="chip">Fizik</span><span class="chip">Türkçe</span><span class="chip">Kimya</span></div>
    <div class="card row" style="margin-top:16px;padding:14px 16px;gap:14px">
      <div style="flex:1"><div class="eyebrow">BU HAFTA</div><div class="row" style="align-items:flex-end;gap:8px;margin-top:6px"><span class="bri num" style="font-size:34px;line-height:1">11</span><span class="meta" style="margin-bottom:4px">yanlış yeniden çözüldü</span></div></div>
      <div class="row" style="gap:4px;align-items:flex-end;height:44px">${[3, 1, 2, 0, 3, 2, 0].map((v, i) => `<i style="width:10px;height:${8 + v * 11}px;border-radius:3px;background:${i === 4 ? "var(--accent)" : "var(--track)"}"></i>`).join("")}</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:10px;margin-top:12px">
    ${items.map(it => `<div class="card row item" style="padding:12px;gap:14px;align-items:center">
      ${qThumb(it.k)}
      <div style="flex:1;min-width:0"><div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${it.c}">${it.s}</div>
        <div class="bri" style="font-size:16.5px;margin-top:3px">${it.t}</div>
        <div style="font-size:13px;color:var(--text2);margin-top:4px;line-height:1.4">“${it.n}”</div>
        <div style="margin-top:8px">${pill(it.st)}</div></div></div>`).join("")}
    </div>
  </div>${tabBar("prof")}`);
}

/* 5 · HAFTALIK PROGRAM */
function scrProgram() {
  const days = [["PZT", 28, "done"], ["SAL", 29, "done"], ["ÇAR", 30, "done"], ["PER", 1, "done"], ["CUM", 2, "done"], ["CMT", 3, "done"], ["PAZ", 4, "today"]];
  const tasks = [
    ["09:30", S.tur, "Türkçe · Sözcükte Anlam", "BİTTİ"],
    ["11:00", S.mat, "Matematik · Limit ve Süreklilik", "BİTTİ"],
    ["14:00", S.mat, "Matematik · Türev Alma Kuralları", "32 dk", true],
    ["16:30", S.fiz, "Fizik · Dalgalar", "25 dk"],
    ["20:00", S.kim, "Kimya · Mol Kavramı", "30 dk"],
  ];
  return phone(`<div class="scr">
    <div class="row between" style="height:44px"><div class="row" style="gap:12px">${ICON.back}<span class="bri" style="font-size:28px;letter-spacing:-.03em">Programım</span></div>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B0ADB5" stroke-width="1.8"><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4" stroke-linecap="round"/></svg></div>
    <div class="card" style="margin-top:16px;padding:20px 20px 18px;border-radius:22px">
      <div class="row between"><div class="eyebrow">BU HAFTA</div><div class="meta">28 Eylül – 4 Ekim</div></div>
      <div class="row" style="align-items:flex-end;gap:10px;margin-top:8px"><span class="bri num" style="font-size:64px;line-height:.95;letter-spacing:-.04em">19</span><span style="color:var(--text2);font-size:15px;margin-bottom:10px">/ 22 durak tamamlandı</span></div>
      <div style="height:6px;border-radius:3px;background:var(--track);margin-top:14px;overflow:hidden"><i class="grow" style="display:block;height:100%;width:86%;background:var(--accent);border-radius:3px"></i></div>
      <div class="row between meta" style="margin-top:10px"><span>14 sa 20 dk çalışıldı</span><span>16 sa planlı</span></div>
    </div>
    <div class="row" style="margin-top:14px;padding:4px;border-radius:10px;background:var(--void);border:1px solid var(--line);gap:4px">
      <div style="flex:1;height:34px;border-radius:6px;background:var(--elev);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13.5px">Haftalık</div>
      <div style="flex:1;height:34px;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:13.5px;color:var(--text3)">Aylık</div></div>
    <div class="row between" style="margin-top:14px">
    ${days.map(([d, n, st]) => `<div style="width:42px;height:64px;border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;
        ${st === "done" ? "background:var(--brand-fill)" : "border:1.5px solid var(--accent);background:var(--brand-tint)"}">
      <span style="font-size:11px;font-weight:700;letter-spacing:.06em;color:${st === "done" ? "rgba(255,255,255,.85)" : "var(--accent-text)"}">${d}</span>
      <span class="bri num" style="font-size:20px;color:#fff">${n}</span>
      <i style="width:5px;height:5px;border-radius:1px;background:${st === "done" ? "#fff" : "var(--accent)"};opacity:.9"></i></div>`).join("")}
    </div>
    <div class="row between" style="margin-top:22px"><div class="eyebrow">PAZAR · 4 EKİM</div><div class="meta">5 durak · 2 sa 47 dk</div></div>
    <div style="margin-top:6px">
    ${tasks.map(([h, c, t, r, now], i) => `<div class="row" style="height:52px;gap:14px;${i ? "border-top:1px solid var(--line)" : ""}">
      <span class="num" style="width:44px;font-size:13px;font-weight:${now ? 700 : 500};color:${now ? "var(--accent-text)" : "var(--text3)"}">${h}</span>
      <i class="dot" style="background:${c}"></i>
      <span style="flex:1;font-size:14.5px;font-weight:${r === "BİTTİ" ? 500 : 600};color:${r === "BİTTİ" ? "var(--text3)" : "var(--text)"};${r === "BİTTİ" ? "text-decoration:line-through;text-decoration-color:var(--text4)" : ""}">${t}</span>
      <span style="font-size:12px;font-weight:700;letter-spacing:.06em;color:${r === "BİTTİ" ? "var(--up)" : "var(--text3)"}">${r}</span></div>`).join("")}
    </div>
  </div>${tabBar("prog")}`);
}

/* 6 · HEDEF & SERİ */
function scrHedef() {
  const heat = [];
  let seed = 7;
  const N = 105, STREAK = 47;
  for (let i = 0; i < N; i++) { seed = (seed * 9301 + 49297) % 233280; const r = seed / 233280; heat.push(i < N - STREAK ? (r < .4 ? 0 : 1 + Math.floor(r * 2)) : i === N - 1 ? 4 : 1 + Math.floor(r * 3.99)); }
  const hc = ["var(--void)", "var(--heat1)", "var(--heat2)", "var(--heat3)", "var(--heat4)"];
  return phone(`<div class="scr">
    <div class="row between"><div class="bri" style="font-size:32px;letter-spacing:-.03em">Hedefim</div><div class="chip" style="height:32px">TYT + AYT Sayısal</div></div>
    <div class="card" style="margin-top:18px;padding:20px;border-radius:22px;position:relative;overflow:hidden">
      <div style="position:absolute;inset:0;background:radial-gradient(260px 160px at 100% 0%,rgba(229,52,63,.18),transparent 70%)"></div>
      <div style="position:relative"><div class="eyebrow red">YKS 2027'YE</div>
      <div class="row" style="align-items:flex-end;gap:10px;margin-top:6px"><span class="bri num" style="font-size:96px;line-height:.9;letter-spacing:-.04em">258</span><span class="bri" style="font-size:26px;color:var(--text2);margin-bottom:10px">gün</span></div>
      <div class="meta" style="margin-top:8px;font-size:13px">Her gün bir adım daha.</div></div>
    </div>
    <div class="card" style="margin-top:12px;padding:18px 20px 20px">
      <div class="row between"><div class="eyebrow">TYT NET HEDEFİ</div><div class="meta"><b class="num" style="color:var(--text);font-weight:700">13,75</b> net kaldı</div></div>
      <svg width="306" height="70" viewBox="0 0 306 70" style="display:block;margin-top:14px;overflow:visible">
        <line x1="8" x2="298" y1="26" y2="26" stroke="var(--track)" stroke-width="4" stroke-linecap="round"/>
        <line class="draw" x1="8" x2="206" y1="26" y2="26" stroke="#E5343F" stroke-width="4" stroke-linecap="round"/>
        <line x1="214" x2="296" y1="26" y2="26" stroke="var(--proj)" stroke-width="3" stroke-dasharray="2 6" stroke-linecap="round"/>
        <circle cx="8" cy="26" r="6" fill="var(--surface)" stroke="#E5343F" stroke-width="2.6"/>
        <circle cx="206" cy="26" r="13" fill="rgba(229,52,63,.22)"/><circle cx="206" cy="26" r="7.5" fill="#E5343F"/>
        <circle cx="298" cy="26" r="7" fill="var(--surface)" stroke="var(--proj)" stroke-width="2.6"/>
        <text x="0" y="62" fill="#A3A0AB" font-size="11" font-family="Archivo" font-weight="700" letter-spacing="1.2">BAŞLANGIÇ</text>
        <text x="206" y="62" text-anchor="middle" fill="#FF6A72" font-size="11" font-family="Archivo" font-weight="700" letter-spacing="1.2">ŞİMDİ</text>
        <text x="306" y="62" text-anchor="end" fill="#A3A0AB" font-size="11" font-family="Archivo" font-weight="700" letter-spacing="1.2">HEDEF</text>
      </svg>
      <div style="position:relative;height:34px;margin-top:2px"><span class="bri num" style="position:absolute;left:0;font-size:24px;color:var(--text2)">62</span><span class="bri num" style="position:absolute;left:206px;transform:translateX(-50%);font-size:30px;line-height:1">81,25</span><span class="bri num" style="position:absolute;right:0;font-size:24px;color:var(--text2)">95</span></div>
      <div style="height:1px;background:var(--line);margin:16px 0 14px"></div>
      <div class="row between"><span style="font-size:14px;font-weight:600">AYT Sayısal</span><span class="num meta" style="font-size:13px"><b style="color:var(--text);font-weight:700">48,5</b> → hedef 65 <span class="up" style="margin-left:6px;font-weight:700">↑ 9,25</span></span></div>
    </div>
    <div class="card" style="margin-top:12px;padding:18px 20px">
      <div class="row between"><div class="row" style="gap:8px">${ICON.flame}<span style="font-weight:700;font-size:15px">47 günlük seri</span></div><span class="meta">son 15 hafta</span></div>
      <div style="display:grid;grid-template-columns:repeat(15,1fr);grid-auto-flow:column;grid-template-rows:repeat(7,auto);gap:3px;margin-top:14px">
        ${heat.map((h, i) => `<i class="cell" style="aspect-ratio:1;border-radius:4px;background:${hc[h]};${i === heat.length - 1 ? "box-shadow:0 0 0 1.5px var(--text)" : ""}"></i>`).join("")}</div>
      <div class="row between meta" style="margin-top:10px;font-size:11px"><span>22 Haz</span><span class="row" style="gap:4px">az ${hc.map(c => `<i style="width:10px;height:10px;border-radius:2px;background:${c}"></i>`).join("")} çok</span></div>
    </div>
  </div>${tabBar("prof")}`);
}

const SCREENS = { rota: scrRota, net: scrNet, deneme: scrDeneme, defter: scrDefter, program: scrProgram, hedef: scrHedef };
