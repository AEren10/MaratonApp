import { MomentBackdrop } from "../../../components/design/MomentBackdrop";
import { FEATURES } from "../../../constants/features";

// Ana sayfa arka plani (deneme): sabit durur, icerik ustunden kayar. Gunluk
// ekranda oldugu icin an ekranlarindan daha silik. FEATURES.homeBackdrop.
export function HomeBackdrop() {
  if (!FEATURES.homeBackdrop) return null;
  return <MomentBackdrop variant={FEATURES.homeBackdrop} strength={0.7} glow={0.5} />;
}
