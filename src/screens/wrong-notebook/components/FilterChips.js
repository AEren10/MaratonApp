import { useMemo } from "react";
import { ScrollView, Pressable, Text, View } from "react-native";
import { useC } from "../../../contexts/ThemeContext";

const makeFilters = (C) => [
  { key: "all", short: "Tümü", color: C.amber },
  { key: "turkce", short: "Türkçe", color: C.blue },
  { key: "matematik", short: "Mat", color: C.amber },
  { key: "fen", short: "Fen", color: C.green },
  { key: "sosyal", short: "Sosyal", color: C.purple },
];

export function FilterChips({ active, onChange, status, onStatusChange }) {
  const C = useC();
  const FILTERS = useMemo(() => makeFilters(C), [C]);
  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
      >
        {FILTERS.map((f) => {
          const isActive = active === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => onChange(f.key)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: isActive ? f.color + "22" : C.surface,
                borderWidth: 1,
                borderColor: isActive ? f.color : C.border,
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 13,
                  color: isActive ? f.color : C.sec,
                }}
              >
                {f.short}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View
        style={{
          flexDirection: "row",
          gap: 8,
          paddingHorizontal: 16,
          marginTop: 10,
        }}
      >
        {[
          { key: "open", label: "Çözülmemiş" },
          { key: "resolved", label: "Çözüldü" },
        ].map((s) => {
          const isActive = status === s.key;
          return (
            <Pressable
              key={s.key}
              onPress={() => onStatusChange(s.key)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: isActive ? C.surface2 : "transparent",
                borderWidth: 1,
                borderColor: isActive ? C.borderLight : "transparent",
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 12,
                  color: isActive ? C.text : C.muted,
                }}
              >
                {s.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
