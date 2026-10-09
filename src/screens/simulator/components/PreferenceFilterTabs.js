import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Press } from "../../../components/design/Press";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

export const TAB_TONES = {
  all: { bg: "18", color: "text2", border: "line" },
  safe: { bg: "18", color: "up", border: "up" },
  target: { bg: "18", color: "warn", border: "warn" },
  reach: { bg: "18", color: "accentBright", border: "accent" },
  blocked: { bg: "18", color: "danger", border: "danger" },
  far: { bg: "18", color: "text3", border: "line" },
};

export const PreferenceFilterTabs = memo(function PreferenceFilterTabs({
  tabs,
  filterTab,
  onSelectTab,
  C,
}) {
  return (
    <View style={styles.tabRow}>
      {tabs.map((tab) => {
        const act = filterTab === tab.key;
        const tone = TAB_TONES[tab.key] || TAB_TONES.all;
        return (
          <Press
            key={tab.key}
            haptic="tap"
            onPress={() => onSelectTab(tab.key)}
            style={[
              styles.filterChip,
              {
                backgroundColor: act
                  ? tone.color === "text2"
                    ? C.elev
                    : C[tone.color] + tone.bg
                  : C.surface,
                borderColor: act
                  ? tone.border === "line"
                    ? C.border
                    : C[tone.border]
                  : C.line,
              },
            ]}
          >
            <Text
              style={[
                TYPOGRAPHY.micro,
                { color: act ? (tone.color === "text2" ? C.text : C[tone.color]) : C.text3 },
              ]}
            >
              {tab.label}
            </Text>
          </Press>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  tabRow: { flexDirection: "row", flexWrap: "wrap", gap: STEP.s1, marginTop: STEP.s2 },
  filterChip: {
    paddingHorizontal: STEP.s2,
    height: 32,
    borderRadius: SHAPE.chip,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
