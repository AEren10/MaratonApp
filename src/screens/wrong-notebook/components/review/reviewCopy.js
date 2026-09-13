import { isLastStage, ladderStageOf, REVIEW_LADDER } from "../../../../lib/wrongReviewLadder";

// "Tekrar" artboardinin durum metinleri (revNext / revHint). Tasarim uc hal
// gosteriyor: cevap oncesi, Bildim, Bilemedim. Uc kademeli merdivenin uc
// ucu (ilk kademede bilemedim, son kademede bildim) icin ayni cumleler
// kisaltilarak kullanildi -- yeni cumle yazilmadi.
const DEFAULT_HINT = "Aralıklı tekrar: 1. gün, 3. gün, 7. gün. Bildiklerin uzar, bilemediklerin bir kademe geriler.";

export function reviewStatus(item, answer, C) {
  if (!answer) {
    return { next: `${REVIEW_LADDER[ladderStageOf(item)]}. gün tekrarı`, color: C.text, hint: DEFAULT_HINT };
  }
  if (!answer.knew) {
    return {
      next: "Yarın tekrar",
      color: C.warn,
      hint: answer.stage > 0
        ? "Sorun değil, yarına alındı. Aralık başa dönmedi, bir kademe geriledi."
        : "Sorun değil, yarına alındı.",
    };
  }
  if (answer.closes) {
    return { next: "Kapatıldı", color: C.up, hint: DEFAULT_HINT };
  }
  if (isLastStage(answer.nextStage)) {
    return {
      next: `${answer.nextDays} gün sonra · kapanmaya bir tekrar`,
      color: C.up,
      hint: "Aralık uzadı. Bir kez daha bilirsen bu soru kapanır.",
    };
  }
  return { next: `${answer.nextDays} gün sonra`, color: C.up, hint: "Aralık uzadı." };
}
