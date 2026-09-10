import { View, Text, Pressable } from "react-native";

import { SectionLabel } from "../../../components/design";
import { useSubjectIdentity } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";

function SubjectChip({ subject, selected, onPress, C }) {
  const id = useSubjectIdentity(subject.key);
  const color = id?.solid || subject.color || C.accent;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: STEP.s1,
        paddingHorizontal: STEP.s2,
        paddingVertical: STEP.s2,
        borderRadius: SHAPE.cardTight,
        borderWidth: 1,
        minWidth: "30%",
        flexGrow: 1,
        backgroundColor: selected ? color + "22" : "transparent",
        borderColor: selected ? color : C.border,
      }}
    >
      <View style={{ width: 7, height: 7, borderRadius: 1, backgroundColor: color }} />
      <Text style={[TYPOGRAPHY.captionMedium, { color: selected ? color : C.text, flexShrink: 1 }]} numberOfLines={1}>
        {subject.label || subject.name}
      </Text>
    </Pressable>
  );
}

export function SaveSubjectSection({ C, showTier, examTier, onSwitchTier, tierOptions, subjects, subjectKey, onSelectSubject }) {
  return (
    <>
      {showTier && (
        <View style={{ marginTop: STEP.s4 }}>
          <SectionLabel>SINAV TİPİ</SectionLabel>
          <View style={{ flexDirection: "row", gap: 4, padding: 4, borderRadius: SHAPE.cardTight, borderWidth: 1, borderColor: C.border }}>
            {tierOptions.map(([t, lbl, clr]) => {
              const active = examTier === t;
              return (
                <Pressable
                  key={t}
                  onPress={() => onSwitchTier(t)}
                  style={{
                    flex: 1, paddingVertical: STEP.s2, borderRadius: SHAPE.iconBox,
                    alignItems: "center",
                    backgroundColor: active ? clr : "transparent",
                  }}
                >
                  <Text style={[TYPOGRAPHY.topicName, { color: active ? C.textOnFill : clr }]}>{lbl}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      <View style={{ marginTop: STEP.s4 }}>
        <SectionLabel>DERS *</SectionLabel>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: STEP.s1 }}>
          {subjects.map((sub) => (
            <SubjectChip
              key={sub.key}
              subject={sub}
              selected={subjectKey === sub.key}
              onPress={() => onSelectSubject(sub.key)}
              C={C}
            />
          ))}
        </View>
      </View>
    </>
  );
}
