// A) League: tek metrik = haftalık XP (haftalık soru + 5*deneme).
// Tier de aynı haftalık XP'den hesaplanır (tek para birimi).
// Eşikler haftalık olarak ulaşılabilir seviyede tutuldu.

export const LEAGUE_TIERS = [
  { key: "bronz", name: "Bronz", icon: "medal", color: "#CD7F47", minXP: 0 },
  { key: "gumus", name: "Gümüş", icon: "medal", color: "#C0C5CE", minXP: 150 },
  { key: "altin", name: "Altın", icon: "trophy", color: "#fbbf24", minXP: 400 },
  { key: "elmas", name: "Elmas", icon: "award", color: "#22d3ee", minXP: 800 },
  { key: "obsidyen", name: "Obsidyen", icon: "crown", color: "#c084fc", minXP: 1500 },
];

export function getTier(weeklyXP) {
  let tier = LEAGUE_TIERS[0];
  for (let i = LEAGUE_TIERS.length - 1; i >= 0; i--) {
    if (weeklyXP >= LEAGUE_TIERS[i].minXP) {
      tier = LEAGUE_TIERS[i];
      break;
    }
  }
  return tier;
}

export function getNextTier(weeklyXP) {
  for (const t of LEAGUE_TIERS) {
    if (weeklyXP < t.minXP) return t;
  }
  return null;
}
