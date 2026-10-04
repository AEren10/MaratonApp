import { useWindowDimensions } from "react-native";

import { MomentBackdrop } from "../../../components/design/MomentBackdrop";
import { FEATURES } from "../../../constants/features";

// Ana sayfa arka plani: icerikle birlikte KAYAR. Ustte SAG koseden isilti;
// asagi inildikce (sayfa yeterince uzunsa) sag taraftan ikinci bir isilti
// ("lines" ise ikinci cizgi demeti sagdan sola). Gunluk ekran: cok silik,
// fark edilmeyecek kadar (kullanici: efekt bariz olmasin). FEATURES.homeBackdrop.
// HomeScreen kaydirma alani durum cubugunun altina uzanir (marginTop -insets.top):
// doku en ustten baslar, guvenli alanda duz koyu bant kalmaz.
export function HomeBackdrop() {
  const { height } = useWindowDimensions();
  if (!FEATURES.homeBackdrop) return null;
  return (
    <>
      <MomentBackdrop variant={FEATURES.homeBackdrop} flip strength={0.5} glow={0.8} />
      {FEATURES.homeBackdrop === "lines" || FEATURES.homeBackdrop === "glow" ? (
        <MomentBackdrop variant={FEATURES.homeBackdrop} flip fadeTop strength={0.42}
          glow={FEATURES.homeBackdrop === "glow" ? 0.8 : 0} style={{ top: Math.round(height * 0.8) }} />
      ) : null}
    </>
  );
}
