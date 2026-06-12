import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { Icon } from "../../../components/design";
import { C, TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";

function SuggestionRow({ item, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "flex-start",
        gap: SPACING.sm,
        paddingVertical: SPACING.sm,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View style={{ width: 4, height: 36, borderRadius: 2, backgroundColor: item.color, marginTop: 2 }} />
      <View style={{ flex: 1 }}>
        <Text style={{ ...TYPOGRAPHY.bodySemiBold, color: item.color, marginBottom: 2 }}>
          {item.title}
        </Text>
        <Text style={{ ...TYPOGRAPHY.caption, color: C.sec }}>{item.body}</Text>
      </View>
    </Pressable>
  );
}

export function AISuggestionsCard({ suggestions, loading, onItemPress }) {
  return (
    <View
      style={{
        backgroundColor: C.surface,
        borderRadius: RADIUS.xxl,
        borderWidth: 1,
        borderColor: C.border,
        padding: SPACING.lg,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.sm, marginBottom: SPACING.md }}>
        <Icon name="zap" size={16} color={C.amber} />
        <Text style={{ ...TYPOGRAPHY.bodySemiBold, color: C.text, flex: 1 }}>
          Akıllı Öneri
        </Text>
        <Text style={{ ...TYPOGRAPHY.micro, color: C.muted }}>BUGÜN İÇİN</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={C.amber} />
      ) : suggestions.length === 0 ? (
        <Text style={{ ...TYPOGRAPHY.caption, color: C.muted }}>
          Birkaç çalışma yaptıktan sonra öneriler burada görünecek.
        </Text>
      ) : (
        suggestions.map((s, i) => (
          <SuggestionRow key={i} item={s} onPress={() => onItemPress?.(s)} />
        ))
      )}
    </View>
  );
}
