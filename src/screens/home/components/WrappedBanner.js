import React, { useState, useCallback, useRef } from "react";
import { View, Text, Pressable, Share, StyleSheet } from "react-native";
import { captureRef } from "react-native-view-shot";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { Icon } from "../../../components/design";
import WrappedCard from "../../wrapped/WrappedCard";

export function WrappedBanner({ stats, period, onPress }) {
  const C = useC();
  const cardRef = useRef();
  const [sharing, setSharing] = useState(false);

  const label = period === "monthly" ? "Aylık Özetin Hazır!" : "Haftalık Özetin Hazır!";

  const handleShare = useCallback(async () => {
    if (sharing) return;
    setSharing(true);
    try {
      const uri = await captureRef(cardRef, { format: "png", quality: 0.9 });
      await Share.share({ url: uri, message: "Maraton ile çalışıyorum!" });
    } catch {}
    setSharing(false);
  }, [sharing]);

  if (!stats) return null;

  return (
    <View style={styles.wrap}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: SPACING.md }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.sm }}>
          <Icon name="chart" size={16} color={C.accent} />
          <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]}>{label}</Text>
        </View>
        <Pressable onPress={handleShare} hitSlop={8} style={[styles.shareBtn, { backgroundColor: C.accent + "18", borderColor: C.accent + "30" }]}>
          <Icon name="share" size={14} color={C.accent} />
          <Text style={[TYPOGRAPHY.micro, { color: C.accent }]}>Paylaş</Text>
        </Pressable>
      </View>
      <View ref={cardRef} collapsable={false}>
        <WrappedCard stats={stats} period={period} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: SPACING.lg },
  shareBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderRadius: RADIUS.pill, borderWidth: 1,
  },
});
