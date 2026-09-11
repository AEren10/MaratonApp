// Rota çizgi grafiği için SAF path/koordinat üretimi. React/RN import etmez,
// node --test ile doğrudan test edilir.

// Değer dizisini viewBox içine x/y koordinatlarına eşler.
export function scalePoints(values, { width, height, padTop = 12, padBottom = 12 }) {
  if (!Array.isArray(values) || values.length === 0) return [];
  const nums = values.map((v) => (typeof v === "number" ? v : v?.y ?? 0));
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const span = max - min || 1;
  const usableH = height - padTop - padBottom;
  const stepX = values.length > 1 ? width / (values.length - 1) : 0;

  return nums.map((v, i) => ({
    x: values.length > 1 ? i * stepX : width / 2,
    y: padTop + (1 - (v - min) / span) * usableH,
  }));
}

// Noktalardan düz çizgili (L) bir SVG path üretir. Tasarımın "ln" çizilme
// animasyonu strokeDasharray/strokeDashoffset ile bileşen katmanında yapılır;
// path'in kendisi burada sade tutulur (test edilebilirlik için).
export function buildLinePath(points) {
  if (!points || points.length === 0) return "";
  if (points.length === 1) return `M${points[0].x},${points[0].y}`;
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`)
    .join(" ");
}

// Alan dolgusu: hat + taban çizgisine kapanan path.
export function buildAreaPath(points, baseY) {
  if (!points || points.length < 2) return "";
  const line = buildLinePath(points);
  const last = points[points.length - 1];
  const first = points[0];
  return `${line} L${last.x},${baseY} L${first.x},${baseY} Z`;
}

// Güven bandı: üst sınır ileri, alt sınır geri — kapalı bir şerit.
export function buildBandPath(upperPoints, lowerPoints) {
  if (!upperPoints?.length || !lowerPoints?.length) return "";
  const upper = buildLinePath(upperPoints);
  const reversedLower = [...lowerPoints].reverse();
  const lowerSegment = reversedLower
    .map((p) => `L${p.x},${p.y}`)
    .join(" ");
  return `${upper} ${lowerSegment} Z`;
}

// Path uzunluğunu kabaca tahmin eder (poligon kenarlarının toplamı).
// Reanimated'de strokeDashoffset animasyonu için gerekli; gerçek SVG path
// uzunluğu değil ama düz L segmentleri için TAM DOĞRU.
export function estimatePathLength(points) {
  if (!points || points.length < 2) return 0;
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    total += Math.sqrt(dx * dx + dy * dy);
  }
  return total;
}

// Durak listesini geçmiş (bugüne kadar, todayIndex dahil) ve projeksiyon
// (bugünden sonrası) olarak ikiye ayırır. todayIndex yoksa tüm noktalar
// geçmiş sayılır.
export function splitPastFuture(points, todayIndex) {
  if (!points || points.length === 0) return { past: [], future: [] };
  if (todayIndex == null || todayIndex < 0) return { past: points, future: [] };
  const idx = Math.min(todayIndex, points.length - 1);
  const past = points.slice(0, idx + 1);
  const future = points.slice(idx);
  return { past, future };
}

// Mini grafik için: taban çizgisi (line) y konumu, alan ve "kuyruk" (son
// projeksiyon segmenti, kesikli/soluk) path'lerini üretir.
export function buildMiniChart(values, { width, height, tailCount = 2 }) {
  const points = scalePoints(values, { width, height, padTop: 4, padBottom: 6 });
  const baseY = height - 4;
  const area = buildAreaPath(points, baseY);
  const full = buildLinePath(points);
  const tailStart = Math.max(0, points.length - tailCount);
  const tail = buildLinePath(points.slice(tailStart));
  const body = buildLinePath(points.slice(0, tailStart + 1));
  const last = points[points.length - 1] || { x: width, y: height / 2 };
  return { points, baseY, area, full, tail, body, last };
}

// ORTAK OLCEK.
// scalePoints min/max'i KENDI ICINDE hesapliyor; gecmis noktalar ile
// projeksiyon ayri ayri olceklenirse iki dizi farkli alan araligina oturur ve
// projeksiyon cizgisi gecmis hattin bittigi yerde KOPUK baslar. Hedef cizgisi
// de ayni alanda olmali, yoksa tuvalin disina duser.
// Bu yuzden tum degerler (duraklar + projeksiyon + hedef) tek bir alandan
// olceklenir.
export function makeScale(domainValues, { width, height, padTop = 12, padBottom = 12 }) {
  const nums = (domainValues || [])
    .map((v) => (typeof v === "number" ? v : v?.y))
    .filter((v) => typeof v === "number" && Number.isFinite(v));
  const min = nums.length ? Math.min(...nums) : 0;
  const max = nums.length ? Math.max(...nums) : 1;
  const span = max - min || 1;
  const usableH = height - padTop - padBottom;

  const toY = (value) => {
    if (typeof value !== "number" || !Number.isFinite(value)) return null;
    return padTop + (1 - (value - min) / span) * usableH;
  };

  // count: bu dizinin tuval genisligine kac nokta yayacagi
  const toPoints = (values, { count, offset = 0 } = {}) => {
    const list = (values || []).map((v) => (typeof v === "number" ? v : v?.y));
    const total = count ?? list.length;
    const stepX = total > 1 ? width / (total - 1) : 0;
    return list.map((v, i) => ({
      x: total > 1 ? (i + offset) * stepX : width / 2,
      y: toY(v),
    }));
  };

  return { min, max, toY, toPoints };
}

// Net grafiginin ekran okuyucu ozeti. Grafik bir NET grafigi (y ekseni net,
// x zaman); dugumler tek tek okunmaz, egilim bir cumleyle anlatilir.
export function buildChartSummary({ values = [], projection = [], target } = {}) {
  const nums = values
    .map((v) => (typeof v === "number" ? v : v?.y))
    .filter((v) => typeof v === "number" && Number.isFinite(v));
  if (!nums.length) return "Net grafiği: henüz veri yok.";

  const first = nums[0];
  const last = nums[nums.length - 1];
  const diff = Math.round((last - first) * 10) / 10;
  const yon = diff > 0 ? `${diff} net artış`
    : diff < 0 ? `${Math.abs(diff)} net düşüş`
    : "değişim yok";

  const son = projection.length ? projection[projection.length - 1] : null;
  const projeksiyon = typeof son === "number"
    ? ` Tahmin ${Math.round(son * 10) / 10} net.`
    : "";
  const hedef = typeof target === "number" ? ` Hedef ${target} net.` : "";

  return `Net grafiği: ${nums.length} ölçüm, ${first} netten ${last} nete, ${yon}.${projeksiyon}${hedef}`;
}
