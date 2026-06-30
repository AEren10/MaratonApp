import { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Icon } from "../../../components/design";
import { useExam } from "../../../contexts/ExamContext";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";

function pad(n) {
  return String(n).padStart(2, "0");
}

function getTimeLeft(examDate) {
  if (!examDate) return null;
  const diff = examDate.getTime() - Date.now();
  if (diff <= 0) return { h: "00", m: "00", s: "00" };
  const totalSec = Math.floor(diff / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return { h: pad(h % 24), m: pad(m), s: pad(s) };
}

export function ExamCountdown({ onPress }) {
  const C = useC();
  const { daysUntilExam, examDate, examType } = useExam();
  const [clock, setClock] = useState(() => getTimeLeft(examDate));

  useEffect(() => {
    if (!examDate) return;
    const id = setInterval(() => setClock(getTimeLeft(examDate)), 1000);
    return () => clearInterval(id);
  }, [examDate]);

  if (daysUntilExam == null) return null;

  const examYear = examDate ? examDate.getFullYear() : new Date().getFullYear();
  const YEAR_SUFFIX = { 0: "'A", 1: "'E", 2: "'YE", 3: "'E", 4: "'E", 5: "'E", 6: "'YA", 7: "'YE", 8: "'E", 9: "'A" };
  const suffix = examYear % 10 === 0 ? "'A" : YEAR_SUFFIX[examYear % 10] || "'A";
  const label = `${(examType || "YKS").toUpperCase()} ${examYear}${suffix} KALAN`;
  const clockStr = clock ? `${clock.h}:${clock.m}:${clock.s}` : "--:--:--";

  return (
    <Animated.View entering={FadeInDown.delay(160).duration(440).springify().damping(16)}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          {
            flexDirection: "row",
            alignItems: "center",
            gap: SPACING.md,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: C.orange + "33",
            backgroundColor: C.orange + "12",
            padding: SPACING.md,
          },
          pressed && { opacity: 0.92 },
        ]}
      >
        {/* Left icon box */}
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 13,
            backgroundColor: C.orange + "29",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="target" size={22} color={C.orange} />
        </View>

        {/* Content */}
        <View style={{ flex: 1, gap: 2 }}>
          <Text
            style={{
              ...TYPOGRAPHY.label,
              fontSize: 10,
              fontFamily: "Inter_600SemiBold",
              letterSpacing: 1.3,
              color: C.muted,
            }}
          >
            {label}
          </Text>

          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
            <Text
              style={{
                fontFamily: "SpaceGrotesk_700Bold",
                fontSize: 27,
                letterSpacing: -1,
                color: C.text,
                lineHeight: 32,
              }}
            >
              {daysUntilExam <= 0 ? "0" : daysUntilExam}
            </Text>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 13,
                color: C.sec,
              }}
            >
              gün
            </Text>
          </View>

          <Text
            style={{
              fontFamily: "SpaceGrotesk_600SemiBold",
              fontSize: 12,
              letterSpacing: 0.5,
              color: C.orange,
            }}
          >
            {clockStr}
          </Text>
        </View>

        {/* Right caret */}
        <Icon name="chevR" size={16} color={C.muted} />
      </Pressable>
    </Animated.View>
  );
}
