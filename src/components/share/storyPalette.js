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
    mid: photo ? "#FFFFFF" : C.text2,
    dim: photo ? "#ECE8E4" : C.text3,
    rule: photo ? "#FFFFFF" : C.border,
    track: photo ? "#5A5961" : C.track,
    up: photo ? "#34D399" : C.up,
    upBg: photo ? "#133E2E" : C.brandTint,
    upBorder: photo ? "#34D399" : C.bandEdge,
    areaOpacity: 0.6,
    // RN'de CSS drop-shadow yok; fotograf uzerinde keskin metin golgesi ile net okunur.
    shadow: photo
      ? { textShadowColor: "rgba(0,0,0,0.88)", textShadowOffset: { width: 0, height: 1.5 }, textShadowRadius: 6 }
      : null,
  };
}
