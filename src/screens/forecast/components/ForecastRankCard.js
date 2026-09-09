import { View, Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { GlassCard, Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { formatNumber as fmt } from "../../../lib/format";
import { RADIUS, SPACING, TYPOGRAPHY } from "../../../themes/tokens";

export function ForecastRankCard({ projectedRank, currentRank }) {
  const C = useC();
  if (!projectedRank) return null;
  const improving = currentRank && projectedRank < currentRank;
  const diff = currentRank ? Math.abs(currentRank - projectedRank) : 0;

  return (
    <Animated.View entering={FadeInDown.delay(100).duration(420).springify()}>
      <GlassCard radius={RADIUS.xxl} style={{ marginTop: SPACING.lg, padding: SPACING.lg }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View>
            <Text style={{ ...TYPOGRAPHY.label, color: C.sec }}>TAHMİNİ SIRALAMA</Text>
            <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 28, color: C.accent, marginTop: SPACING.xs }}>
              ~{fmt(projectedRank)}
            </Text>
          </View>

          {currentRank ? (
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ ...TYPOGRAPHY.caption, color: C.sec }}>Şu anki</Text>
              <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 18, color: C.sec }}>
                ~{fmt(currentRank)}
              </Text>
              {currentRank !== projectedRank ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2 }}>
                  <Icon name={improving ? "trendUp" : "trendDown"} size={11}
                    color={improving ? C.green : C.red} />
                  <Text style={{ ...TYPOGRAPHY.micro, color: improving ? C.green : C.red }}>
                    {fmt(diff)} sıra
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
      </GlassCard>
    </Animated.View>
  );
}
