import { View, Text } from "react-native";
import { Icon, Trend, Card, StatBlock } from "../../../components/design";
import { TYPOGRAPHY, STEP, SHAPE, CONTROL } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { Press } from "../../../components/design/Press";

const TYPE_LABEL = {
  TYT: "TYT",
  AYT_SAY: "AYT SAY",
  AYT_EA: "AYT EA",
  AYT_SOZ: "AYT SOZ",
  BRANCH: "Branş",
  AYT: "AYT",
};

function HistoryRow({ item, onPress, C }) {
  const label = TYPE_LABEL[item.trialType] || null;
  return (
    <Press haptic="none"
      onPress={onPress}
      style={{
        minHeight: CONTROL.tapMin,
        paddingVertical: STEP.s2,
        paddingHorizontal: STEP.s3
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ flex: 1 }}>
          {label && (
            <Text style={{ ...TYPOGRAPHY.label, color: C.text2, marginBottom: 4 }}>
              {label}
            </Text>
          )}
          <Text style={{ ...TYPOGRAPHY.captionMedium, color: C.text2 }}>{item.date}</Text>
        </View>

        <StatBlock value={item.net} size="value" color={C.text} style={{ marginRight: STEP.s2 }} />

        <View style={{ marginRight: STEP.s2 }}>
          <Trend v={item.trend} size={11} />
        </View>

        <Icon name="chevR" size={16} color={C.text2} />
      </View>
    </Press>
  );
}

export function HistoryList({ history, onPress, onCompare, onSeeAll, totalCount }) {
  const C = useC();
  return (
    <View style={{ gap: STEP.s2 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: STEP.s1 }}>
        <Icon name="clock" size={18} color={C.text2} />
        <Text style={{ ...TYPOGRAPHY.subheading, color: C.text, flex: 1 }}>Deneme kayıtları</Text>
        {onSeeAll && totalCount > history.length && (
          <Press haptic="none"
            onPress={onSeeAll}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Tüm deneme kayıtları"
          >
            <Text style={{ ...TYPOGRAPHY.captionMedium, color: C.accent }}>Tüm kayıtlar</Text>
          </Press>
        )}
      </View>

      <Card tone="surface" radius="sheet" padded={false}>
        {history.map((h, i) => (
          <View key={h.id || h.date}>
            {i > 0 && (
              <View style={{ height: 1, backgroundColor: C.line, marginHorizontal: STEP.s3 }} />
            )}
            <HistoryRow item={h} onPress={() => onPress?.(h)} C={C} />
          </View>
        ))}
      </Card>

      {history.length >= 2 && onCompare && (
        <Press haptic="none"
          onPress={onCompare}
          accessibilityRole="button"
          accessibilityLabel="Denemeleri Karşılaştır"
        >
          <Card
            tone="surface"
            radius="sheet"
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: STEP.s3,
              paddingVertical: STEP.s3,
              gap: STEP.s2,
              borderColor: C.accent + "30",
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: SHAPE.iconBox,
                backgroundColor: C.brandTint,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="barChart" size={20} color={C.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ ...TYPOGRAPHY.bodySemiBold, color: C.text }}>
                Yayın karşılaştırması
              </Text>
              <Text style={{ ...TYPOGRAPHY.caption, color: C.text2, marginTop: 2 }}>
                Son iki denemeni ders ders kıyasla
              </Text>
            </View>
            <Icon name="chevR" size={18} color={C.accent} />
          </Card>
        </Press>
      )}
    </View>
  );
}
