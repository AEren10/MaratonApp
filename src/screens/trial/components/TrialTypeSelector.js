import { View, Text, Pressable, ScrollView } from "react-native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { useExam } from "../../../contexts/ExamContext";
import { getTrialTypesForExam } from "../trialTypes";
import * as H from "../../../lib/haptics";

export function TrialTypeSelector({ value, onChange }) {
  const C = useC();
  const { examType, field } = useExam();
  const list = getTrialTypesForExam(C, examType, field);
  return (
    <View style={{ marginBottom: SPACING.xl }}>
      <Text style={[TYPOGRAPHY.label, { color: C.muted, marginBottom: SPACING.md, paddingHorizontal: 4 }]}>
        DENEME TİPİ
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: SPACING.sm, paddingRight: SPACING.lg }}
      >
        {list.map((t) => {
          const active = value === t.code;
          return (
            <Pressable
              key={t.code}
              accessibilityRole="radio"
              accessibilityLabel={t.label}
              accessibilityState={{ selected: active }}
              accessibilityHint={t.description}
              onPress={() => { H.select(); onChange(t.code); }}
              style={{
                width: 168,
                borderRadius: RADIUS.xl,
                padding: SPACING.md,
                position: "relative",
                backgroundColor: active ? t.color : t.color + "12",
                borderWidth: 1.5,
                borderColor: active ? t.color : t.color + "26",
                shadowColor: active ? t.color : "transparent",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.30,
                shadowRadius: 14,
                elevation: active ? 5 : 0,
              }}
            >
              {/* Büyük ikon */}
              <View style={{
                width: 44, height: 44, borderRadius: 14,
                backgroundColor: active ? C.textOnFill + "40" : t.color + "20",
                alignItems: "center", justifyContent: "center",
                marginBottom: SPACING.md,
              }}>
                <Icon name={t.icon} size={22} color={active ? C.textOnFill : t.color} />
              </View>

              <Text style={[TYPOGRAPHY.bodySemiBold, {
                color: active ? C.textOnFill : C.text,
                fontSize: 14,
              }]}>
                {t.label}
              </Text>
              <Text style={[TYPOGRAPHY.caption, {
                color: active ? C.textOnFill + "DD" : C.muted,
                marginTop: 4,
                lineHeight: 16,
              }]} numberOfLines={2}>
                {t.description}
              </Text>

              {active && (
                <View style={{
                  position: "absolute", top: 10, right: 10,
                  width: SPACING.xxl, height: SPACING.xxl, borderRadius: SPACING.md,
                  backgroundColor: C.textOnFill,
                  alignItems: "center", justifyContent: "center",
                }}>
                  <Icon name="check" size={13} color={t.color} sw={3} />
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
