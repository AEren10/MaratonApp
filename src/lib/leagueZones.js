export const ZONE = {
  PROMOTION: "promotion",
  SAFE: "safe",
  DEMOTION: "demotion",
};

const PROMOTE_COUNT = 7;
const DEMOTE_COUNT = 5;

export function getZone(rank, totalUsers) {
  if (!rank || !totalUsers || totalUsers < 3) return ZONE.SAFE;
  let promote = PROMOTE_COUNT;
  let demote = DEMOTE_COUNT;
  if (totalUsers <= promote + demote) {
    const ratio = totalUsers / (promote + demote + 2);
    promote = Math.max(1, Math.floor(promote * ratio));
    demote = Math.max(1, Math.floor(demote * ratio));
  }
  if (rank <= promote) return ZONE.PROMOTION;
  if (rank > totalUsers - demote) return ZONE.DEMOTION;
  return ZONE.SAFE;
}

export function getZoneStyle(zone, C) {
  switch (zone) {
    case ZONE.PROMOTION:
      return { label: "Terfi Bölgesi", color: C.green, icon: "trendUp", bg: C.green + "14" };
    case ZONE.DEMOTION:
      return { label: "Düşme Bölgesi", color: C.danger, icon: "trendDown", bg: C.danger + "14" };
    default:
      return null;
  }
}

export { PROMOTE_COUNT, DEMOTE_COUNT };
