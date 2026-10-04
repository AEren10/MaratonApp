import { MomentBackdrop } from "./MomentBackdrop";
import { FEATURES } from "../../constants/features";

// Sekme koklerinin (Program, Analiz, Profil) arka plani: ana sayfadaki ust
// isiltinin aynisi, sabit (kaydirmaz). Ic ekranlarda YOK: okunurluk ve
// sakinlik (karar, 4 Ekim). FEATURES.homeBackdrop kapatilirsa bu da kapanir.
export function TabBackdrop() {
  if (!FEATURES.homeBackdrop) return null;
  return <MomentBackdrop variant="glow" flip strength={0.5} glow={0.8} />;
}
