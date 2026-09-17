// Deneme Ozeti imza ani: "hat eski halden yeni hale gecer".
// Tasarimin 390x176 SVG'si: baslangic x26, bugun x178, tahmin x364; y 150 (dip) - 34 (tepe).
// Egri kontrol noktalari tasarimdaki iki kubik parcadan oranlanmistir.

export const SUMMARY_ROUTE = { width: 390, height: 176, bottom: 150, top: 34 };

const SEGMENTS = Object.freeze([
  Object.freeze([0.46, 0.21, 0.7, 0.63]),
  Object.freeze([0.33, 0.4, 0.66, 0.72]),
]);

export function summaryRouteXs(count) {
  return count >= 3 ? [26, 178, 364] : [26, 364];
}

// Degerleri (net) SVG y'sine cevirir. Hepsi esitse hat ortadan gecer.
export function makeSummaryScale(values) {
  const finite = values.filter((v) => Number.isFinite(v));
  const min = Math.min(...finite);
  const max = Math.max(...finite);
  const { bottom, top } = SUMMARY_ROUTE;
  if (!finite.length || max - min < 0.001) return () => (bottom + top) / 2;
  return (value) => bottom - ((value - min) / (max - min)) * (bottom - top);
}

export function buildSummaryRoutePath(xs, ys) {
  "worklet";
  let d = `M ${xs[0]} ${ys[0]}`;
  for (let i = 1; i < xs.length; i += 1) {
    const f = xs.length === 2 ? SEGMENTS[0] : SEGMENTS[Math.min(i - 1, 1)];
    const x0 = xs[i - 1];
    const y0 = ys[i - 1];
    const dx = xs[i] - x0;
    const dy = ys[i] - y0;
    d += ` C ${x0 + dx * f[0]} ${y0 + dy * f[1]} ${x0 + dx * f[2]} ${y0 + dy * f[3]} ${xs[i]} ${ys[i]}`;
  }
  return d;
}

export function lerpYs(from, to, progress) {
  "worklet";
  const out = [];
  for (let i = 0; i < to.length; i += 1) out.push(from[i] + (to[i] - from[i]) * progress);
  return out;
}
