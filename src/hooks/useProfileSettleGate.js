import { isProfileSettling } from "../lib/profileSettleGate";

// Profil okumasi bitmeden ya da acik bir hata durumuna gecmeden kok yigin
// secilmez. Bu sayede yavas ag yeni kullanici kurulumunu yanlislikla acmaz.
export function useProfileSettleGate({ userId, profileReadyFor, profileLoadErrorFor }) {
  return isProfileSettling({ userId, profileReadyFor, profileLoadErrorFor });
}
