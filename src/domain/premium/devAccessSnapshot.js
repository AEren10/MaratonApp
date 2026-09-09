import { PRODUCT_FEATURES } from "../../constants/premium.js";

export const DEV_ACCESS_SNAPSHOT = {
  ok: true,
  accessMode: "premium",
  isPremium: true,
  isFirstWeek: true,
  trialDaysLeft: 0,
  features: Object.fromEntries(Object.values(PRODUCT_FEATURES).map((key) => [key, true])),
  quotas: {
    trialEntry: {
      used: 0,
      limit: 4,
      remaining: null,
      unlimited: true,
      resetsAt: null,
    },
  },
};
