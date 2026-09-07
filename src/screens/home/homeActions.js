import { SCREENS } from "../../constants/screens";

/**
 * @param examType  "lgs" ise YKS'ye özgü eylemler gizlenir.
 *
 * Sıralama Simülatörü tamamen YKS: TYT/AYT net girişi, YKS sıralama tahmini
 * ve ÜNİVERSİTE BÖLÜMÜ seçimi içeriyor. LGS'de `field` null olduğu için
 * FIELD_TO_TYPE fallback'i "sayısal" varsayıyor ve LGS öğrencisine AYT Fizik
 * girişi çıkıyordu.
 */
export function createHomeQuickActions(C, examType) {
  const isLGS = examType === "lgs";
  const secondary = [
    { icon: "target", label: "5dk Quiz", go: SCREENS.QUICK_PRACTICE, color: C.teal, analyticsId: "home_quick_practice" },
    { icon: "clock", label: "Simülasyon", go: SCREENS.EXAM_SIMULATOR, color: C.amber, analyticsId: "home_quick_simulator" },
    { icon: "users", label: "Challenge", go: SCREENS.CHALLENGE, color: C.pink, analyticsId: "home_quick_challenge" },
  ];
  if (!isLGS) {
    secondary.push({ icon: "trophy", label: "Sıralama", go: SCREENS.RANK_SIMULATOR, color: C.amber, analyticsId: "home_quick_rank" });
  }

  return {
    secondary,
    primary: [
      { icon: "play", label: "Çalış", go: SCREENS.STUDY_TIMER, color: C.accent, analyticsId: "home_quick_study" },
      { icon: "chart", label: "Deneme", go: SCREENS.TRIAL_ENTRY, color: C.blue, analyticsId: "home_quick_trial" },
      { icon: "camera", label: "Yanlış Ekle", go: SCREENS.ADD_WRONG, color: C.coral, analyticsId: "home_quick_wrong" },
      { icon: "notebook", label: "Defterim", go: SCREENS.WRONG_NOTEBOOK, color: C.teal, analyticsId: "home_quick_notebook" },
    ],
  };
}
