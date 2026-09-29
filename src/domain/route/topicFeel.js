// KONU HISSI -- ogrencinin son geri bildirimi, konu konu.
// Calisma kaydindaki "perceived" (easy|ok|hard); en yeni kayit gecerli.
// Motor bunu konunun zorluk carpanina uygular (topicCost FEEL_EFFORT):
// "zorladi" diyen konuya daha cok soru, "kolaydi" diyene daha az.

export function topicFeelFromLogs(logs = []) {
  const latest = {};
  for (const log of logs || []) {
    if (!log?.perceived || !log.subject || !log.topic) continue;
    const at = String(log.created_at || log.study_date || "");
    const slot = (latest[log.subject] = latest[log.subject] || {});
    if (!slot[log.topic] || slot[log.topic].at < at) slot[log.topic] = { at, feel: log.perceived };
  }
  const out = {};
  for (const [subject, topics] of Object.entries(latest)) {
    out[subject] = Object.fromEntries(Object.entries(topics).map(([t, v]) => [t, v.feel]));
  }
  return out;
}
