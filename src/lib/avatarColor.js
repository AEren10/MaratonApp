const AVATAR_PAL = ["purple", "orange", "blue", "green", "red", "teal"];

export function avatarColors(name = "?", C) {
  const sum = String(name).split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const key = AVATAR_PAL[sum % AVATAR_PAL.length];
  const base = C[key] || C.accent;
  return [base, base + "60"];
}
