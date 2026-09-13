import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import { usePremium } from "../../contexts/PremiumContext";
import { selectTrials } from "../../store/slices/trialSlice";
import { dateKey } from "../../lib/dateUtils";
import { formatNumber } from "../../lib/format";
import { withCase } from "../../lib/turkishSuffix";

const TZ = "Europe/Istanbul";
const dayMonth = (value) => new Date(value).toLocaleDateString("tr-TR", { day: "numeric", month: "long", timeZone: TZ });

// Deneme Kotasi Doldu: kota GIRISTE sorulur, form doldurulduktan sonra degil.
// Karar ekrana girildigi an sabitlenir; kaydin kendisi son hakki tuketince
// ekran kota sayfasina donmez. Pro alininca (izin gelince) kilit kalkar.
export function useTrialQuotaGate() {
  const { accessLoading, accessError, accessSnapshot, checkFeature } = usePremium();
  const trials = useSelector(selectTrials);
  const ready = !accessLoading && !accessError;
  const allowed = ready && checkFeature("unlimited_trials");
  const [blocked, setBlocked] = useState(null);

  useEffect(() => {
    if (!ready) return;
    if (blocked === null) setBlocked(!allowed);
    else if (blocked && allowed) setBlocked(false);
  }, [ready, allowed, blocked]);

  const quota = accessSnapshot?.quotas?.trialEntry || null;

  const sheet = useMemo(() => {
    if (!blocked || !quota) return null;
    const monthKey = dateKey()?.slice(0, 7);
    const monthName = new Date().toLocaleDateString("tr-TR", { month: "long", timeZone: TZ });
    const rows = (trials || [])
      .filter((trial) => String(trial.date || "").slice(0, 7) === monthKey)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map((trial) => ({
        id: String(trial.id),
        title: [trial.name, trial.date ? dayMonth(trial.date) : null].filter(Boolean).join(" · "),
        net: formatNumber(trial.totalNet, 2),
      }));
    return {
      used: quota.used ?? quota.limit,
      resetLabel: quota.resetsAt ? withCase(dayMonth(quota.resetsAt), "locative") : null,
      monthLabel: `${withCase(monthName, "locative")} kaydettiklerin`.toLocaleUpperCase("tr-TR"),
      rows,
    };
  }, [blocked, quota, trials]);

  return {
    loading: accessLoading || (ready && blocked === null),
    error: accessError || (blocked === true && !quota),
    blocked: blocked === true,
    sheet,
  };
}
