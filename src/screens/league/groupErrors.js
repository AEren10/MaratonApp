export function formatGroupJoinError(err, code, groups = []) {
  const msg = err?.message || "";

  // 1. Kilit / Throttle mesaji: oldugu gibi goster
  if (msg.includes("başarısız deneme") || msg.includes("saniye")) {
    return msg;
  }

  // 2. Zaten uye durumu
  const clean = (code || "").trim().toUpperCase();
  const isAlreadyMember =
    (Array.isArray(groups) && groups.some((g) => (g.code || "").toUpperCase() === clean)) ||
    msg.toLowerCase().includes("zaten") ||
    err?.reason === "already_member";

  if (isAlreadyMember) {
    return "Bu gruba zaten üyesin.";
  }

  // 3. 6 hane kontrolu
  if (clean.length < 6 || msg.includes("6 hane")) {
    return "Lütfen 6 haneli kodu eksiksiz gir.";
  }

  // 4. Gecersiz kod veya bulunamadi
  if (err?.reason === "not_found" || msg.includes("bulunamadı")) {
    return "Grup kodu geçersiz veya grup bulunamadı.";
  }

  return msg || "Grup kodu geçersiz.";
}
