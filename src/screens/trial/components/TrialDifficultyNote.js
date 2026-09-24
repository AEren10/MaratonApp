import { Text } from "react-native";
import Animated from "react-native-reanimated";

import { useC } from "../../../contexts/ThemeContext";
import { STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { difficultyMeta } from "../trialDifficultyLevels";

// Tasarimin aciklama karti yalniz "zor" secimi icin kopya tasiyor; kolay ve
// standart icin metin uydurulmuyor, kart gosterilmez.
export function TrialDifficultyNote({ difficultyLevel, publisherName, styles }) {
  const C = useC();
  if (difficultyLevel !== "hard" && difficultyLevel !== "very_hard") return null;
  const level = difficultyMeta(difficultyLevel);
  const heading = [publisherName, level.label].filter(Boolean).join(" · ").toLocaleUpperCase("tr-TR");
  return (
    <Animated.View style={[styles.panel, styles.section]}>
      <Text style={[TYPOGRAPHY.label, { color: C.accentBright }]}>{heading}</Text>
      <Text style={[TYPOGRAPHY.caption, { color: C.text2, marginTop: STEP.s1 + 2 }]}>
        Netlerin <Text style={{ color: C.text }}>{level.factor}</Text> ile düzeltilir. Zor bir denemede net düşmesi normal; rota düzeltilmiş net üzerinden çizilir, böylece farklı yayınların denemeleri aynı hatta yan yana durabilir.
      </Text>
    </Animated.View>
  );
}
