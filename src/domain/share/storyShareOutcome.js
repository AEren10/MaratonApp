// Paylasim sonucunun ADI. Native modul import etmez ki test edilebilsin —
// asil IO src/lib/storyShare.js'te.
export const STORY_SHARE = Object.freeze({
  PLACED: "placed",     // etiket dogrudan Instagram story'ye yerlesti
  OPENED: "opened",     // pano hazir + Instagram acildi
  COPIED: "copied",     // pano hazir, Instagram acilamadi
  SAVED: "saved",       // galeriye kaydedildi
  FAILED: "failed",     // etiket uretilemedi
});

/**
 * Instagram'in acilamamasi HATA DEGILDIR: etiket panoda durdugu icin
 * kullanici elle yapistirabilir. Yalniz pano bos kaldiysa paylasilacak
 * bir sey yok demektir.
 *
 * `placed` en iyi hal: etiket Instagram'a dogrudan gonderildi, kullanicinin
 * yapistirmasi gerekmedi. Bu yol Meta App ID ister; olmadiginda ya da
 * Instagram kurulu degilken asagidaki pano yoluna dusulur.
 */
export function storyShareOutcome({ copied, opened, placed } = {}) {
  if (placed) return STORY_SHARE.PLACED;
  if (!copied) return STORY_SHARE.FAILED;
  return opened ? STORY_SHARE.OPENED : STORY_SHARE.COPIED;
}
