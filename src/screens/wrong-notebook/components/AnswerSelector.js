import { View, Text, Pressable } from "react-native";
import { useC } from "../../../contexts/ThemeContext";
import { SPACING, RADIUS, TYPOGRAPHY } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";

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
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: SPACING.lg, marginBottom: SPACING.sm }}>
        <Text style={[TYPOGRAPHY.label, { color: C.sec }]}>Cevap</Text>
        {(myAnswer || correctAnswer) ? (
          <Pressable onPress={clearAll} hitSlop={8}>
            <Text style={[TYPOGRAPHY.micro, { color: C.muted }]}>Temizle</Text>
          </Pressable>
        ) : null}
      </View>

      {/* Button row */}
      <View style={{ flexDirection: "row", gap: SPACING.sm }}>
        {ANSWERS.map((letter) => {
          const isMyAnswer = myAnswer === letter;
          const isCorrect = correctAnswer === letter;
          const isBoth = isMyAnswer && isCorrect;

          let bgColor = C.surface;
          let borderColor = C.border;

          if (isBoth) {
            // Double role — green dominant with orange inner ring hint
            bgColor = C.green + "1A";
            borderColor = C.green;
          } else if (isMyAnswer) {
            bgColor = C.orange + "1A";
            borderColor = C.orange;
          } else if (isCorrect) {
            bgColor = C.green + "1A";
            borderColor = C.green;
          }

          return (
            <Pressable
              key={letter}
              onPress={() => handlePress(letter)}
              style={({ pressed }) => ({
                flex: 1,
                height: 48,
                borderRadius: RADIUS.lg,
                backgroundColor: bgColor,
                borderWidth: 1.5,
                borderColor: borderColor,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.75 : 1,
              })}
            >
              <Text style={{
                fontFamily: "SpaceGrotesk_700Bold",
                fontSize: 15,
                color: isBoth ? C.green : isMyAnswer ? C.orange : isCorrect ? C.green : C.sec,
              }}>
                {letter}
              </Text>

              {/* Indicator dots below the letter */}
              <View style={{ flexDirection: "row", gap: 3, marginTop: 2, height: 6, alignItems: "center", justifyContent: "center" }}>
                {isMyAnswer && (
                  <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: C.orange }} />
                )}
                {isCorrect && (
                  <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: C.green }} />
                )}
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Legend */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: SPACING.sm }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: C.orange }} />
          <Text style={[TYPOGRAPHY.micro, { color: C.muted }]}>Senin cevabın</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: C.green }} />
          <Text style={[TYPOGRAPHY.micro, { color: C.muted }]}>Doğru cevap</Text>
        </View>
      </View>
    </View>
  );
}
