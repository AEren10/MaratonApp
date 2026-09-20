import { useState } from "react";
import { View, Text, Modal, Pressable, Share, StyleSheet } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Icon } from "../../../components/design/Icon";
import { Button } from "../../../components/design/Button";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, SHAPE, SPACING, GUTTER } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";

export function CreatedGroupModal({ visible, group, onProceed }) {
  const C = useC();
  const [copied, setCopied] = useState(false);

  if (!group) return null;

  const handleCopy = async () => {
    H.success();
    await Clipboard.setStringAsync(group.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    H.tap();
    Share.share({
      message: `Maraton'da "${group.name}" çalışma grubumu kurdum! Birlikte soru çözelim ve haftalık hedefimizi yakalayalım.\n\nKatılım Kodu: ${group.code}`,
    }).catch(() => {});
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={[styles.iconCircle, { backgroundColor: C.elev, borderColor: C.line }]}>
            <Icon name="check" size={28} color={C.accent} />
          </View>

          <Text style={[styles.title, { color: C.text }]}>Grubun Hazır!</Text>
          <Text style={[styles.subtitle, { color: C.text2 }]}>
            "{group.name}" grubu oluşturuldu. Arkadaşlarını davet etmek için kodu paylaş.
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Kodu kopyala"
            onPress={handleCopy}
            style={[styles.codeBox, { backgroundColor: C.void, borderColor: C.line }]}
          >
            <Text style={[styles.codeText, { color: C.accentBright }]}>{group.code}</Text>
            <View style={styles.copyRow}>
              <Icon name={copied ? "check" : "copy"} size={14} color={copied ? C.up : C.text3} />
              <Text style={[styles.copyLabel, { color: copied ? C.up : C.text3 }]}>
                {copied ? "Kopyalandı" : "Kopyalamak için dokun"}
              </Text>
            </View>
          </Pressable>

          <View style={styles.actions}>
            <Button
              title="Arkadaşlarınla Paylaş"
              variant="outline"
              size="md"
              fullWidth
              icon="share"
              onPress={handleShare}
            />
            <Button
              title="Gruba Git"
              variant="primary"
              size="lg"
              fullWidth
              onPress={onProceed}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: GUTTER,
  },
  card: {
    width: "100%",
    borderRadius: SHAPE.sheet,
    borderWidth: 1,
    padding: STEP.s4,
    alignItems: "center",
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: SHAPE.phone,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: STEP.s2,
  },
  title: {
    ...TYPOGRAPHY.heading,
    marginBottom: SHAPE.chip,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    textAlign: "center",
    marginBottom: STEP.s3,
  },
  codeBox: {
    width: "100%",
    paddingVertical: STEP.s3,
    paddingHorizontal: STEP.s3,
    borderRadius: SHAPE.cardTight,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: STEP.s4,
  },
  codeText: {
    ...TYPOGRAPHY.display,
    letterSpacing: 4,
    marginBottom: SPACING.xs,
  },
  copyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SHAPE.chip,
  },
  copyLabel: {
    ...TYPOGRAPHY.micro,
  },
  actions: {
    width: "100%",
    gap: STEP.s2,
  },
});
