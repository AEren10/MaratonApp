import { Pressable, Text } from "react-native";
import { useC, useSubjectIdentity } from "../../../contexts/ThemeContext";

const SUBJECT_LABELS = {
  turkce: "Türkçe", matematik: "Matematik", fizik: "Fizik", kimya: "Kimya",
  biyoloji: "Biyoloji", tarih: "Tarih", cografya: "Coğrafya", felsefe: "Felsefe",
  din: "Din", fen: "Fen", sosyal: "Sosyal", edebiyat: "Edebiyat",
};

export function FilterPill({ label, count, active, color, onPress }) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={count > 0 ? `${label}, ${count} yanlış` : label}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 999,
        backgroundColor: active ? color + "1A" : "transparent",
        borderWidth: 1,
        borderColor: active ? color : color + "30",
      }}
    >
      <Text style={{ fontFamily: active ? "Inter_600SemiBold" : "Inter_500Medium", fontSize: 12, color }}>
        {label}
      </Text>
      {count != null && count > 0 ? (
        <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 11, color: color + "99" }}>
          {count}
        </Text>
      ) : null}
    </Pressable>
  );
}

export function SubjectFilterPill({ subKey, active, count, onPress }) {
  const C = useC();
  const id = useSubjectIdentity(subKey);
  const color = id?.solid || C.purple;
  return (
    <FilterPill
      label={SUBJECT_LABELS[subKey] || subKey}
      count={count}
      color={color}
      active={active}
      onPress={onPress}
    />
  );
}
