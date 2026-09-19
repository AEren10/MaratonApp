import { useState } from "react";
import { View, Text, Pressable, Share, StyleSheet } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Icon } from "../../../components/design/Icon";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, SHAPE, SPACING } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";

export function GroupShareCard({ code, groupName }) {
  const C = useC();
  const [copied, setCopied] = useState(false);

  if (!code) return null;

  const handleCopy = async () => {
    H.success();
    await Clipboard.setStringAsync(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    H.tap();
    Share.share({
      message: `Maraton'da "${groupName || "Çalışma Grubu"}" ekibine katıl! Katılım kodu: ${code}`,
    }).catch(() => {});
  };

  return (
    <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
      <View style={styles.infoCol}>
        <Text style={[styles.label, { color: C.text3 }]}>GRUP KATILIM KODU</Text>
        <Text style={[styles.codeText, { color: C.text }]}>{code}</Text>
      </View>

      <View style={styles.buttonsRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kodu kopyala"
          onPress={handleCopy}
          style={({ pressed }) => [
            styles.iconBtn,
            {
              backgroundColor: copied ? C.elev : C.elev,
              borderColor: copied ? C.line : C.line,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Icon name={copied ? "check" : "copy"} size={16} color={C.text} />
          <Text style={[styles.btnLabel, { color: C.text }]}>
            {copied ? "Kopyalandı" : "Kopyala"}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Grubu paylaş"
          onPress={handleShare}
          style={({ pressed }) => [
            styles.iconBtn,
            {
              backgroundColor: C.accent,
              borderColor: C.accent,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Icon name="share" size={16} color={C.accentInk} />
          <Text style={[styles.btnLabel, { color: C.accentInk }]}>Paylaş</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: SHAPE.card,
    borderWidth: 1,
    padding: STEP.s3,
    marginBottom: STEP.s4,
  },
  infoCol: {
    marginBottom: STEP.s2,
  },
  label: {
    ...TYPOGRAPHY.label,
    marginBottom: SPACING.xs,
  },
  codeText: {
    ...TYPOGRAPHY.statSmall,
    letterSpacing: 2,
  },
  buttonsRow: {
    flexDirection: "row",
    gap: STEP.s2,
  },
  iconBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SHAPE.chip,
    height: 40,
    borderRadius: SHAPE.chip,
    borderWidth: 1,
  },
  btnLabel: {
    ...TYPOGRAPHY.micro,
  },
});
