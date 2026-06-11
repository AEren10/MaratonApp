import { View, Text, Pressable } from "react-native";
import { IconBox } from "../../../components/design";
import { C, SPACING } from "../../../themes/tokens";

const SUBJECTS = [
  { key: "turkce", name: "Turkce", color: "#60A5FA", icon: "bookOpen" },
  { key: "matematik", name: "Matematik", color: "#F5A623", icon: "hash" },
  { key: "fen", name: "Fen Bilimleri", color: "#34D399", icon: "activity" },
  { key: "sosyal", name: "Sosyal Bilimler", color: "#A78BFA", icon: "layers" },
];

export function SubjectPicker({ selected, onSelect }) {
  return (
    <View style={{ flexDirection: "row", gap: SPACING.sm, flexWrap: "wrap" }}>
      {SUBJECTS.map((s) => {
        const active = selected === s.key;
        return (
          <Pressable
            key={s.key}
            onPress={() => onSelect(s.key)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: SPACING.sm,
              paddingHorizontal: SPACING.md,
              paddingVertical: 10,
              borderRadius: 14,
              backgroundColor: active ? s.color + "22" : C.surface,
              borderWidth: 1,
              borderColor: active ? s.color : C.border,
            }}
          >
            <IconBox
              icon={s.icon}
              color={s.color}
              size={28}
              rounded={8}
            />
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 13,
                color: active ? s.color : C.sec,
              }}
            >
              {s.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
