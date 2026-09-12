import { useMemo } from "react";

import { PLANS } from "../constants/premium";
import { PRO_PLAN_COPY } from "../constants/proPitch";

// Tasarimda yillik plan ustte: onerilen secim once gorunur.
const ORDER = ["yearly", "monthly"];

function toRow(plan) {
  const copy = PRO_PLAN_COPY[plan.id] || {};
  const fallback = PLANS.find((p) => p.id === plan.id);
  // %40 avantaj ve aylik karsilik (₺89) iki SABIT fiyattan turetilmis
  // degerler. Magaza fiyati sabitten farkliysa ikisi de yanlis olur;
  // veriyle desteklenmeyen sayi gosterilmez, o yuzden ikisi de dusuyor.
  const derived = Boolean(fallback && plan.price === fallback.price);

  const parts = [];
  if (derived && plan.monthlyEquiv) parts.push(`${plan.monthlyEquiv}/ay`);
  if (copy.note) parts.push(copy.note);

  return {
    id: plan.id,
    name: copy.name || plan.id,
    sub: parts.join(" · ") || null,
    price: plan.price,
    per: `/${plan.period}`,
    badge: derived && plan.savings && copy.badgeSuffix
      ? `${plan.savings} ${copy.badgeSuffix}`
      : null,
  };
}

// Plan satirinin GORUNUM modeli. Fiyat metni usePaywallPurchase'ten gelir
// (magaza paketi varsa onun priceString'i, yoksa PLANS).
export function usePremiumPlanRows(plans) {
  return useMemo(() => {
    const rows = (plans || []).map(toRow);
    return rows.sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id));
  }, [plans]);
}
