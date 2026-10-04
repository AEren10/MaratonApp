import { useWindowDimensions } from "react-native";

import { MomentBackdrop } from "../../../components/design/MomentBackdrop";
import { FEATURES } from "../../../constants/features";

// Ana sayfa arka plani: icerikle birlikte KAYAR. Ustte sol koseden gelen
// isik cizgileri; asagi inildikce (sayfa yeterince uzunsa) ikinci demet bu
// kez sagdan sola akar, birincinin devami gibi. Gunluk ekran: cok silik,
// fark edilmeyecek kadar (kullanici: efekt bariz olmasin). FEATURES.homeBackdrop.
export function HomeBackdrop() {
  const { height } = useWindowDimensions();
  if (!FEATURES.homeBackdrop) return null;
  return (
    <>
      <MomentBackdrop variant={FEATURES.homeBackdrop} strength={0.5} glow={0.35} />
      {FEATURES.homeBackdrop === "lines" ? (
        <MomentBackdrop variant="lines" flip fadeTop strength={0.42} glow={0} style={{ top: Math.round(height * 0.8) }} />
      ) : null}
    </>
  );
}
