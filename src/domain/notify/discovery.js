// KESIF POPUP'LARI -- bir seyden sonra bir sey. Saf.
//
// "Daha derine" ozellikleri (donem karsilastirmasi, tahmin, hedef, rota
// evresi) Analiz'in en altinda kaliyordu. Ilgili an gelince ana sayfada bir
// kez davet edilir. Her kimlik OMURDE bir kez gosterilir (seen kumesi).
// screen: SCREENS anahtari degil, cagiranin cevirdigi kisa ad (saf kalsin).

const MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const fmt = (n) => (Math.round(n * 10) / 10).toString().replace(".", ",");
const family = (t) => (String(t?.trialType || "").startsWith("AYT") ? "AYT" : String(t?.trialType || ""));
const netOf = (t) => Number(t?.totalNet ?? t?.total_net);
const dayOf = (t) => String(t?.date || "").slice(0, 10);

export function discoveryNudges({ trials = [], targets = {}, aytExam = false, daysLeft = null, now = new Date(), seen = new Set() } = {}) {
  const out = [];
  const add = (n) => { if (!seen.has(n.id)) out.push({ type: "discovery", icon: "trendUp", color: "coral", ...n }); };
  const list = (Array.isArray(trials) ? trials : []).filter((t) => ["TYT", "AYT"].includes(family(t)));
  const latest = [...list].sort((a, b) => dayOf(b).localeCompare(dayOf(a)))[0];

  if (latest) {
    const fam = family(latest);
    const same = list.filter((t) => family(t) === fam);
    const target = Number(fam === "TYT" ? targets.tyt : targets.ayt);
    const net = netOf(latest);
    if (Number.isFinite(target) && target > 0 && Number.isFinite(net) && net >= target) {
      add({
        id: `disc_target_${fam}_${Math.round(target)}`,
        message: `Son ${fam} netin ${fmt(net)}, hedefin ${Math.round(target)}. Hedefi bir tık yükseltelim mi?`,
        actionLabel: "Hedefi güncelle", screen: "goals",
      });
    }
    if (same.length >= 3) {
      add({
        id: `disc_forecast_${fam}`,
        message: `${same.length} ${fam} denemesi tamam: sınav günü tahminin açıldı.`,
        actionLabel: "Tahminini gör", screen: "forecast",
      });
    }
    if (same.length >= 2) {
      add({
        id: `disc_compare_${fam}`,
        message: `İki ${fam} denemen oldu. Netin nereden değişti, yan yana gör.`,
        actionLabel: "Karşılaştır", screen: "comparative",
      });
    }
  }

  // Ayin ilk bes gunu: gecen ay 2+ deneme girildiyse donem karsilastirmasi.
  if (now.getDate() <= 5) {
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prefix = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`;
    if (list.filter((t) => dayOf(t).startsWith(prefix)).length >= 2) {
      add({
        id: `disc_month_${prefix}`,
        message: `${MONTHS[prev.getMonth()]} bitti. O ayın denemelerini bir öncekiyle karşılaştır.`,
        actionLabel: "Dönemini gör", screen: "comparative",
      });
    }
  }

  // Rota evresi (domain/route/examPhase ile ayni sinirlar: 150 ve 60 gun).
  if (aytExam && Number.isFinite(daysLeft) && daysLeft >= 0) {
    if (daysLeft <= 60) {
      add({ id: "disc_phase_60", message: `Son ${daysLeft} gün: rota artık ağırlıkla AYT.`, actionLabel: "Rotaya bak", screen: "route" });
    } else if (daysLeft <= 150) {
      add({ id: "disc_phase_150", message: `Sınava ${daysLeft} gün: rota AYT'ye daha çok yer açıyor.`, actionLabel: "Rotaya bak", screen: "route" });
    }
  }

  return out;
}
