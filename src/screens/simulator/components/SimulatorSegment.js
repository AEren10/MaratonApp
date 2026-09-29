import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Press } from "../../../components/design/Press";
import { useC } from "../../../contexts/ThemeContext";
import { CONTROL, SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

export const SimulatorSegment = memo(function SimulatorSegment({ activeTab, onSelectTab }) {
  const C = useC();
  const tabs = [
    { key: "threshold", label: "Bölüm Eşiği" },
    { key: "preference", label: "Sıralama & Tercih" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: C.void, borderColor: C.line }]}>
      {tabs.map((t) => {
        const active = activeTab === t.key;
        return (
          <Press
            key={t.key}
            haptic="tap"
            onPress={() => onSelectTab(t.key)}
            style={[
              styles.tab,
              active && { backgroundColor: C.surface, borderColor: C.elev },
            ]}
          >
            <Text
              style={[
                TYPOGRAPHY.captionMedium,
                { color: active ? C.text : C.text3 },
              ]}
            >
              {t.label}
            </Text>
          </Press>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 3,
    borderRadius: SHAPE.button,
    borderWidth: 1,
    marginTop: STEP.s2,
  },
  tab: {
    flex: 1,
    height: CONTROL.segment,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: SHAPE.segment,
    borderWidth: 1,
    borderColor: "transparent",
  },
});
