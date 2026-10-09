import { memo } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from "react-native";
import { Press } from "../../../components/design/Press";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

export const ReferralApplyCard = memo(function ReferralApplyCard({
  friendCode,
  onChangeCode,
  onApply,
  applying,
  C,
}) {
  const canApply = friendCode.trim().length >= 4 && !applying;

  return (
    <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.line }]}>
      <View style={styles.header}>
        <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]}>Davet Kodun Var mı?</Text>
        <Text style={[TYPOGRAPHY.caption, { color: C.text3 }]}>
          Seni davet eden arkadaşının kodunu girerek bağlan.
        </Text>
      </View>

      <View style={styles.inputRow}>
        <TextInput
          value={friendCode}
          onChangeText={(t) => onChangeCode(t.toUpperCase())}
          placeholder="Örn: RUSRFH"
          placeholderTextColor={C.text4}
          maxLength={8}
          autoCapitalize="characters"
          autoCorrect={false}
          style={[
            styles.input,
            {
              backgroundColor: C.void,
              borderColor: C.border,
              color: C.text,
            },
          ]}
        />
        <Press
          haptic="medium"
          onPress={onApply}
          disabled={!canApply}
          style={[
            styles.applyBtn,
            {
              backgroundColor: canApply ? C.brandFill : C.elev,
              borderColor: canApply ? C.brandFill : C.line,
            },
          ]}
        >
          {applying ? (
            <ActivityIndicator size="small" color={C.accentInk} />
          ) : (
            <Text
              style={[
                TYPOGRAPHY.captionMedium,
                { color: canApply ? C.accentInk : C.text3 },
              ]}
            >
              Uygula
            </Text>
          )}
        </Press>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: SHAPE.panel,
    borderWidth: 1,
    padding: STEP.s2,
    gap: STEP.s2,
  },
  header: {
    gap: 2,
  },
  inputRow: {
    flexDirection: "row",
    gap: STEP.s1,
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: SHAPE.chip,
    borderWidth: 1,
    paddingHorizontal: STEP.s2,
    fontFamily: "Bricolage_400",
    fontSize: 16,
    letterSpacing: 2,
  },
  applyBtn: {
    height: 44,
    paddingHorizontal: STEP.s3,
    borderRadius: SHAPE.chip,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
