// KESIF POPUP'LARI -- bir seyden sonra bir sey. Saf.
//
// "Daha derine" ozellikleri (donem karsilastirmasi, tahmin, hedef, rota
// evresi) Analiz'in en altinda kaliyordu. Ilgili an gelince ana sayfada
// davet edilir. Her KIMLIK bir kez gosterilir ama kimlikler olaya bagli
// (her 3 denemede tahmin, her buyuk net degisiminde karsilastirma, her ay,
// her yeni hedef) -- yil boyunca ara sira tekrar eder. Iki davet arasi en
// az 3 gun.
// screen: SCREENS anahtari degil, cagiranin cevirdigi kisa ad (saf kalsin).

const MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const COOLDOWN_DAYS = 3;
const BIG_SWING = 3;
const FORECAST_SPAN_DAYS = 14;
const fmt = (n) => (Math.round(n * 10) / 10).toString().replace(".", ",");
const family = (t) => (String(t?.trialType || "").startsWith("AYT") ? "AYT" : String(t?.trialType || ""));
const netOf = (t) => Number(t?.totalNet ?? t?.total_net);
const dayOf = (t) => String(t?.date || "").slice(0, 10);

export function discoveryNudges({ trials = [], targets = {}, aytExam = false, daysLeft = null, now = new Date(), seen = new Set(), lastShownAt = null } = {}) {
  // Ara sira kalsin: iki kesif davetinin arasinda en az COOLDOWN_DAYS gun.
  if (lastShownAt && now.getTime() - new Date(lastShownAt).getTime() < COOLDOWN_DAYS * 86400000) return [];
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
    // Tahmin her 3 denemede bir tazelenir: 3, 6, 9... (kimlik kademeye bagli).
    // Tahmin ancak denemeler 2 haftaya yayilinca acilir (lib/netForecast);
    // acilmamis tahmine davet etmeyiz.
    const days = same.map((x) => dayOf(x)).filter(Boolean).sort();
    const span = days.length > 1 ? (Date.parse(days[days.length - 1]) - Date.parse(days[0])) / 86400000 : 0;
    const tier = span >= FORECAST_SPAN_DAYS ? Math.floor(same.length / 3) : 0;
    if (tier >= 1) {
      add({
        id: `disc_forecast_${fam}_${tier}`,
        message: tier === 1
          ? `${same.length} ${fam} denemesi tamam: sınav günü tahminin açıldı.`
          : `${same.length}. ${fam} denemesiyle tahminin güncellendi. Sınav gününe nereden bakıyorsun?`,
        actionLabel: "Tahminini gör", screen: "forecast",
      });
    }
    // Karsilastirma: ikinci denemede bir kez, sonra her denemede net onceki
    // ayni tur denemeye gore 3+ degistiyse (kimlik denemenin gunune bagli).
    const sorted = [...same].sort((a, b) => dayOf(b).localeCompare(dayOf(a)));
    const delta = netOf(sorted[0]) - netOf(sorted[1]);
    if (same.length === 2) {
      add({
        id: `disc_compare_${fam}`,
        message: `İki ${fam} denemen oldu. Netin nereden değişti, yan yana gör.`,
        actionLabel: "Karşılaştır", screen: "comparative",
      });
    } else if (same.length > 2 && Number.isFinite(delta) && Math.abs(delta) >= BIG_SWING) {
      add({
        id: `disc_compare_${fam}_${dayOf(sorted[0])}`,
        message: delta > 0
          ? `${fam} netin ${fmt(delta)} arttı. Nereden geldiğini gör, orayı koru.`
          : `${fam} netin ${fmt(-delta)} düştü. Hangi dersten kaybettiğine bir bak.`,
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
