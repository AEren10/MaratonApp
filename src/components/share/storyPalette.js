import { STORY_BG } from "../../domain/share/storySticker";

// Etiket iki zeminde yasiyor ve renkler zemine gore degisiyor: fotograf
// ustunde metin beyaz ve golgeli (her fotografta okunur kalmali), marka
// zemininde tema tokenlari. Tasarim "Paylasim Onizleme" ile birebir.
export function storyPalette(C, background) {
  const photo = background === STORY_BG.FOTO;
  return {
    photo,
    accent: C.accent,
    // Paylasim tasarimi marka isareti icin KOYU murekkep kullaniyor
    // (tasarimin kendi --ink degeri). Uygulamanin accentInk'i ise acik ton.
    // Ikisi celisiyor; bkz. briefs/99-EREN-icin-sorular.md.
    markInk: "#22090B",
    solid: photo ? "#FFFFFF" : C.text,
    mid: photo ? "rgba(255,255,255,0.82)" : C.text2,
    dim: photo ? "rgba(255,255,255,0.72)" : C.text4,
    rule: photo ? "rgba(255,255,255,0.42)" : C.border,
    track: photo ? "rgba(255,255,255,0.28)" : C.track,
    up: photo ? "#7CF0A6" : C.up,
    upBg: photo ? "rgba(124,240,166,0.14)" : C.brandTint,
    upBorder: photo ? "rgba(124,240,166,0.42)" : C.bandEdge,
    areaOpacity: photo ? 0.22 : 0.34,
    // RN'de CSS drop-shadow yok; fotograf uzerinde metin golgesi ile okunur.
    shadow: photo
      ? { textShadowColor: "rgba(0,0,0,0.55)", textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 16 }
      : null,
  };
}
