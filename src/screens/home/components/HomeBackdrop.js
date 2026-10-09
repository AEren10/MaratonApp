import { MomentBackdrop } from "../../../components/design/MomentBackdrop";
import { FEATURES } from "../../../constants/features";

// Ana sayfa arka plani: icerikle birlikte KAYAR, ustte koseden silik isilti.
// Asagidaki ikinci isilti kalkti (9 Ekim): kosesi resmin alt kenarina denk
// geliyordu, en parlak yerde duz bir cizgiyle kesiliyordu (kullanici).
// HomeScreen kaydirma alani durum cubugunun altina uzanir (marginTop -insets.top):
// doku en ustten baslar, guvenli alanda duz koyu bant kalmaz.
export function HomeBackdrop() {
  if (!FEATURES.homeBackdrop) return null;
  return <MomentBackdrop variant={FEATURES.homeBackdrop} flip strength={0.5} glow={0.8} />;
}
