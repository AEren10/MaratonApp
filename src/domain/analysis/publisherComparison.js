// Yayin karsilastirmasi — SAF.
//
// Bu kart bir zamanlar hic veri almiyordu: her kullaniciya "Limit 58,
// 3D 52, Karekok 47" gosteriyordu. Simdi kullanicinin kendi denemelerinden
// hesaplaniyor.
//
// En az IKI farkli yayin sart: tek yayinla karsilastirma diye bir sey yok,
// o durumda kart kendi bos halini soyluyor.
const MIN_PUBLISHERS = 2;

export function buildPublisherComparison(trials = []) {
  const byPublisher = new Map();

  for (const trial of trials) {
    const name = trial?.publisherNameSnapshot ?? trial?.publisher_name_snapshot;
    const net = Number(trial?.totalNet ?? trial?.total_net);
    if (!name || !Number.isFinite(net)) continue;

    const bucket = byPublisher.get(name) || { name, total: 0, count: 0 };
    bucket.total += net;
    bucket.count += 1;
    byPublisher.set(name, bucket);
  }

  const rows = [...byPublisher.values()]
    .map((b) => ({ name: b.name, net: b.total / b.count, trials: b.count }))
    .sort((a, b) => b.net - a.net);

  if (rows.length < MIN_PUBLISHERS) {
    return { ready: false, publishers: [], reason: rows.length ? "tek_yayin" : "yayin_yok" };
  }

  // Cubuk boyu en yuksek ortalamaya gore; mutlak net degil oran gosteriliyor.
  const best = rows[0].net || 1;
  return {
    ready: true,
    reason: null,
    publishers: rows.map((r) => ({
      name: r.name,
      net: Math.round(r.net * 100) / 100,
      trials: r.trials,
      percent: `${Math.max(6, Math.round((r.net / best) * 100))}%`,
    })),
  };
}

export const PUBLISHER_COMPARISON_MIN = MIN_PUBLISHERS;
