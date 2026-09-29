// YANLIS DEFTERI -> ROTA.
//
// Rota yanlis defterini hic okumuyordu: 15 yanlisi bekleyen konu ile hic
// yanlisi olmayan konu ayni sayiliyordu. Iki sinyal:
//   open -- cozulmemis yanlis sayisi: konu henuz oturmamis, oncelik artar
//   due  -- tekrar zamani gelmis cozulmemis yanlis: bu hafta bakilmali
// Yalniz mufredat konusuna bagli yanlislar sayilir (ozel etiket rotada yok).

export function wrongSignalByTopic(rows = [], now = new Date()) {
  const out = {};
  for (const row of rows || []) {
    if (!row?.subject || !row?.topic || row.is_resolved) continue;
    const slot = ((out[row.subject] = out[row.subject] || {})[row.topic] = out[row.subject][row.topic] || { open: 0, due: 0 });
    slot.open += 1;
    const next = row.next_review_at ? new Date(row.next_review_at) : null;
    if (!next || next <= now) slot.due += 1;
  }
  return out;
}

// Bekleyen yanlis basina %6, en fazla %30 oncelik.
export function wrongBoost(signal) {
  const open = Number(signal?.open) || 0;
  return 1 + Math.min(0.3, open * 0.06);
}

// Ustalasilmis konuda zamani gelmis en az 2 yanlis -> kisa "yanlis tekrari"
// duragi. Yanlislari yeniden coz + ayni tipten birkac soru.
export const WRONG_REVIEW_MIN_DUE = 2;
export function wrongReviewQuestions(due) {
  return Math.min(15, due * 2 + 4);
}
