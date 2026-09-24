import { View, Text } from "react-native";
import { useC } from "../../../contexts/ThemeContext";
import { STEP, GUTTER, SHAPE, TYPOGRAPHY } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";
import { Press } from "../../../components/design/Press";

const ANSWERS = ["A", "B", "C", "D", "E"];

// AnswerSelector — unified single-row answer picker.
// First tap = myAnswer (orange), second tap on different button = correctAnswer (green).
// Tapping same button again as myAnswer when correctAnswer is null = treated as "I got it right"
// (both indicators on same button). Tapping a selected button clears it.
export function AnswerSelector({ myAnswer, correctAnswer, onMyAnswer, onCorrectAnswer }) {
  const C = useC();

  const handlePress = (letter) => {
    H.select();
    if (myAnswer === null) {
      // No selection yet — set as myAnswer
      onMyAnswer(letter);
    } else if (correctAnswer === null) {
      // myAnswer set, correctAnswer not yet — set correctAnswer (can be same as myAnswer)
      onCorrectAnswer(letter);
    } else {
      // Both set — tapping any button resets to that as myAnswer, clear correctAnswer
      onMyAnswer(letter);
      onCorrectAnswer(null);
    }
  };

  const clearAll = () => {
    H.tap();
    onMyAnswer(null);
    onCorrectAnswer(null);
  };

  return (
    <View>
      {/* Header row */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: STEP.s4, marginBottom: STEP.s2 }}>
        <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>Cevap</Text>
        {(myAnswer || correctAnswer) ? (
          <Press haptic="none" onPress={clearAll} hitSlop={8}>
            <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>Temizle</Text>
          </Press>
        ) : null}
      </View>

      {/* Button row */}
      <View style={{ flexDirection: "row", gap: STEP.s2 }}>
        {ANSWERS.map((letter) => {
          const isMyAnswer = myAnswer === letter;
          const isCorrect = correctAnswer === letter;
          const isBoth = isMyAnswer && isCorrect;

          let bgColor = C.surface;
          let borderColor = C.border;

          if (isBoth) {
            // Double role — green dominant with orange inner ring hint
            bgColor = C.up + "1A";
            borderColor = C.up;
          } else if (isMyAnswer) {
            bgColor = C.orange + "1A";
            borderColor = C.orange;
          } else if (isCorrect) {
            bgColor = C.up + "1A";
            borderColor = C.up;
          }

          return (
            <Press haptic="none"
              key={letter}
              onPress={() => handlePress(letter)}
              style={{
                flex: 1,
                height: 48,
                borderRadius: SHAPE.cardTight,
                backgroundColor: bgColor,
                borderWidth: 1.5,
                borderColor: borderColor,
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Text style={{
                fontFamily: "Bricolage_400",
                fontSize: 15,
                color: isBoth ? C.up : isMyAnswer ? C.orange : isCorrect ? C.up : C.text2,
              }}>
                {letter}
              </Text>

              {/* Indicator dots below the letter */}
              <View style={{ flexDirection: "row", gap: 3, marginTop: 2, height: 6, alignItems: "center", justifyContent: "center" }}>
                {isMyAnswer && (
                  <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: C.orange }} />
                )}
                {isCorrect && (
                  <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: C.up }} />
                )}
              </View>
            </Press>
          );
        })}
      </View>

      {/* Legend */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: STEP.s2 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: C.orange }} />
          <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>Senin cevabın</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: C.up }} />
          <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>Doğru cevap</Text>
        </View>
      </View>
    </View>
  );
}


