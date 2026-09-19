// Paylasim sonucunun ADI. Native modul import etmez ki test edilebilsin —
// asil IO src/lib/storyShare.js'te.
export const STORY_SHARE = Object.freeze({
  OPENED: "opened",     // pano hazir + Instagram acildi
  COPIED: "copied",     // pano hazir, Instagram acilamadi
  SAVED: "saved",       // galeriye kaydedildi
  FAILED: "failed",     // etiket uretilemedi
});

/**
 * Instagram'in acilamamasi HATA DEGILDIR: etiket panoda durdugu icin
 * kullanici elle yapistirabilir. Yalniz pano bos kaldiysa paylasilacak
 * bir sey yok demektir.
 */
export function storyShareOutcome({ copied, opened }) {
  if (!copied) return STORY_SHARE.FAILED;
  return opened ? STORY_SHARE.OPENED : STORY_SHARE.COPIED;
}
