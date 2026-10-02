// HEDEFI KORUMA MODU NE ZAMAN (saf).
// Eskiden TEK son deneme hedefteyse rota yeni konu kovalamayi birakip tekrara
// donuyordu: tek bir kolay deneme modu degistirebiliyordu. Artik en az iki
// deneme ve son uc denemenin agirlikli ortalamasi (yeniye daha cok agirlik)
// hedefte olmali; son deneme de hedefin altinda olmamali.
const WEIGHTS = [0.5, 0.3, 0.2];
const dateOf = (t) => String(t?.date || t?.trial_date || "");
const timeOf = (t) => (t?.created_at || t?.createdAt ? new Date(t.created_at || t.createdAt).getTime() : 0);
const netOf = (t) => Number(t?.normalizedTotalNet ?? t?.totalNet ?? t?.total_net);

export function recentNets(trials = [], n = 3) {
  return [...(trials || [])]
    .sort((a, b) => dateOf(b).localeCompare(dateOf(a)) || timeOf(b) - timeOf(a))
    .map(netOf)
    .filter(Number.isFinite)
    .slice(0, n);
}

export function targetReachedFrom(trials = [], target) {
  const t = Number(target);
  if (!Number.isFinite(t) || t <= 0) return false;
  const nets = recentNets(trials, 3);
  if (nets.length < 2 || nets[0] < t) return false;
  const w = WEIGHTS.slice(0, nets.length);
  const sum = w.reduce((a, b) => a + b, 0);
  const avg = nets.reduce((acc, net, i) => acc + net * w[i], 0) / sum;
  return avg >= t;
}
