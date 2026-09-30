// Worklet'te de calisir (CountUpText); regex bilerek yok.
// Turkce bicim: ondalik virgul, sondaki sifirlar atilir (18,5 · 72,25 · 12).
export function formatDecimal(v, decimals = 0) {
  "worklet";
  const f = Math.pow(10, decimals);
  const r = Math.round(v * f) / f;
  let str = decimals > 0 ? r.toFixed(decimals) : String(Math.round(r));
  // Worklet icinde regex yok: sondaki sifirlari ve noktayi elle kirp.
  if (decimals > 0) {
    let end = str.length;
    while (end > 0 && str[end - 1] === "0") end -= 1;
    if (end > 0 && str[end - 1] === ".") end -= 1;
    str = str.slice(0, end);
  }
  const dot = str.indexOf(".");
  return dot < 0 ? str : `${str.slice(0, dot)},${str.slice(dot + 1)}`;
}
