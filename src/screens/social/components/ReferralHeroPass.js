import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Icon } from "../../../components/design/Icon";
import { Press } from "../../../components/design/Press";
import { alpha } from "../../../themes/colorMix";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

export const ReferralHeroPass = memo(function ReferralHeroPass({
  code,
  copied,
  onCopy,
  onShare,
  C,
}) {
  return (
    <View style={[styles.ticket, { backgroundColor: C.surface, borderColor: C.line }]}>
      {/* Üst başlık rozeti */}
      <View style={styles.topRow}>
        <View style={[styles.badge, { backgroundColor: alpha(C.accent, 12), borderColor: alpha(C.accent, 25) }]}>
          <Icon name="users" size={13} color={C.accentBright} />
          <Text style={[TYPOGRAPHY.micro, styles.badgeText, { color: C.accentBright }]}>
            DAVET PASAPORTU
          </Text>
        </View>
        <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>Birlikte Çalışın</Text>
      </View>

      {/* Kod yuvası (Tactile ticket well) */}
      <View style={[styles.codeWell, { backgroundColor: C.void, borderColor: C.border }]}>
        <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>ÖZEL DAVET KODUN</Text>
        <Text
          selectable
          style={[styles.codeText, { color: C.accentBright }]}
        >
          {code || "••••••"}
        </Text>
        <Text style={[TYPOGRAPHY.meta, { color: C.text2 }]}>
          Arkadaşın bu kodla kaydolduğunda çalışma eşleşmeniz başlar.
        </Text>
      </View>

      {/* Aksiyon butonları */}
      <View style={styles.btnRow}>
        <Press
          haptic="tap"
          onPress={onCopy}
          style={[
            styles.copyBtn,
            {
              backgroundColor: copied ? alpha(C.up, 14) : C.void,
              borderColor: copied ? C.up : C.line,
            },
          ]}
        >
          <Icon
            name={copied ? "check" : "copy"}
            size={15}
            color={copied ? C.up : C.text}
          />
          <Text
            style={[
              TYPOGRAPHY.captionMedium,
              { color: copied ? C.up : C.text },
            ]}
          >
            {copied ? "Kopyalandı" : "Kodu Kopyala"}
          </Text>
        </Press>

        <Press
          haptic="medium"
          onPress={onShare}
          style={[styles.shareBtn, { backgroundColor: C.brandFill }]}
        >
          <Icon name="share" size={15} color={C.accentInk} />
          <Text style={[TYPOGRAPHY.captionMedium, styles.shareBtnText, { color: C.accentInk }]}>
            Hızlı Paylaş
          </Text>
        </Press>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  ticket: {
    width: "100%",
    borderRadius: SHAPE.panel,
    borderWidth: 1,
    padding: STEP.s3,
    gap: STEP.s2,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: STEP.s1,
    paddingVertical: 3,
    borderRadius: SHAPE.chip,
    borderWidth: 1,
  },
  badgeText: {
    fontFamily: "Archivo_600",
    letterSpacing: 0.8,
  },
  codeWell: {
    paddingVertical: STEP.s3,
    paddingHorizontal: STEP.s2,
    borderRadius: SHAPE.cardTight,
    borderWidth: 1,
    alignItems: "center",
    gap: 6,
  },
  codeText: {
    fontFamily: "Bricolage_400",
    fontSize: 34,
    letterSpacing: 4,
    fontVariant: ["tabular-nums"],
    marginVertical: 2,
  },
  btnRow: {
    flexDirection: "row",
    gap: STEP.s1,
    marginTop: STEP.s1,
  },
  copyBtn: {
    flex: 1,
    height: 44,
    borderRadius: SHAPE.button,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  shareBtn: {
    flex: 1.2,
    height: 44,
    borderRadius: SHAPE.button,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  shareBtnText: {
    fontFamily: "Archivo_600",
  },
});
