import { View, Text, Pressable, ScrollView } from "react-native";
import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";

function QuickItem({ item, onPress }) {
  const C = useC();
  return (
    <Pressable
      onPress={() => onPress?.(item)}
      style={({ pressed }) => ({
        alignItems: "center",
        gap: 8,
        width: 64,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 18,
          backgroundColor: item.c + "1C",
          borderWidth: 1,
          borderColor: item.c + "33",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name={item.icon} size={22} color={item.c} />
      </View>
      <Text
        style={{
          fontFamily: "Inter_400Regular",
          fontSize: 11,
          color: C.sec,
          textAlign: "center",
        }}
      >
        {item.label}
      </Text>
    </Pressable>
  );
}

export function QuickActions({ items, onPress }) {
  const C = useC();
  return (
    <View>
      <Text
        style={{
          fontFamily: "Inter_600SemiBold",
          fontSize: 13,
          color: C.sec,
          marginHorizontal: 4,
          marginBottom: 12,
        }}
      >
        Hızlı İşlem
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 14, paddingHorizontal: 4 }}
      >
        {items.map((q, i) => (
          <QuickItem key={i} item={q} onPress={onPress} />
        ))}
      </ScrollView>
    </View>
  );
}
