import { View, Text, Pressable, ScrollView } from "react-native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { useExam } from "../../../contexts/ExamContext";
import { TRIAL_TYPE_LIST, getTrialTypesForField } from "../trialTypes";

export function TrialTypeSelector({ value, onChange }) {
  const C = useC();
  const { field } = useExam();
  // Kullanıcının alanına göre filtrele: sayısal user sözel görmesin
  const list = getTrialTypesForField(field);
  return (
    <View style={{ marginBottom: SPACING.xl }}>
      <Text style={[TYPOGRAPHY.label, { color: C.muted, marginBottom: SPACING.md, paddingHorizontal: 4 }]}>
        DENEME TİPİ
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10, paddingRight: SPACING.lg }}
      >
        {list.map((t) => {
          const active = value === t.code;
          return (
            <Pressable
              key={t.code}
              onPress={() => onChange(t.code)}
              style={{
                width: 168,
                borderRadius: 20,
                padding: 14,
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
                backgroundColor: active ? "rgba(255,255,255,0.25)" : t.color + "1F",
                alignItems: "center", justifyContent: "center",
                marginBottom: 12,
              }}>
                <Icon name={t.icon} size={22} color={active ? "#FFFFFF" : t.color} />
              </View>

              <Text style={[TYPOGRAPHY.bodySemiBold, {
                color: active ? "#FFFFFF" : C.text,
                fontSize: 14,
              }]}>
                {t.label}
              </Text>
              <Text style={[TYPOGRAPHY.caption, {
                color: active ? "rgba(255,255,255,0.85)" : C.muted,
                marginTop: 4,
                lineHeight: 16,
              }]} numberOfLines={2}>
                {t.description}
              </Text>

              {active && (
                <View style={{
                  position: "absolute", top: 10, right: 10,
                  width: 22, height: 22, borderRadius: 11,
                  backgroundColor: "#FFFFFF",
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
