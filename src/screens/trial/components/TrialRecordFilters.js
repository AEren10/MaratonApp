import React, { useCallback } from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";
import { TYPOGRAPHY, STEP, SHAPE, CONTROL } from "../../../themes/tokens";
import { Icon } from "../../../components/design";
import * as H from "../../../lib/haptics";
import { Press } from "../../../components/design/Press";

const LABELS = { ALL: "Tümü", TYT: "TYT", AYT: "AYT", BRANCH: "Branş" };

export const TrialRecordFilters = React.memo(function TrialRecordFilters({ tabs, active, onChange, C, onOpenFilterMenu }) {
  const handlePress = useCallback(
    (tab) => {
      H.tap();
      onChange(tab);
    },
    [onChange],
  );

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={[styles.wrap, { backgroundColor: C.surface, borderColor: C.elev }]}>
          {tabs.map((tab) => {
            const isActive = tab === active;
            return (
              <Press haptic="none"
                key={tab}
                onPress={() => handlePress(tab)}
                style={[styles.tab, isActive && { backgroundColor: C.elev }]}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={LABELS[tab]}
              >
                <Text style={[styles.tabText, { color: isActive ? C.text : C.text3 }]}>
                  {LABELS[tab]}
                </Text>
              </Press>
            );
          })}
        </View>

        {onOpenFilterMenu ? (
          <Press haptic="none"
            onPress={onOpenFilterMenu}
            accessibilityRole="button"
            accessibilityLabel="Filtrele"
            style={[styles.filterBtn, { borderColor: C.border }]}
          >
            <Icon name="filter" size={15} color={C.text2} />
          </Press>
        ) : null}
      </View>

      <View style={styles.dropdownRow}>
        <Pressable style={[styles.dropdownPill, { borderColor: C.border }]}>
          <Text style={[styles.dropdownText, { color: C.text3 }]}>Yayın · hepsi</Text>
          <Icon name="chevDown" size={10} color={C.text5 || C.text4} />
        </Pressable>

        <Pressable style={[styles.dropdownPill, { borderColor: C.border }]}>
          <Text style={[styles.dropdownText, { color: C.text3 }]}>Son 3 ay</Text>
          <Icon name="chevDown" size={10} color={C.text5 || C.text4} />
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: STEP.s2,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  wrap: {
    flex: 1,
    flexDirection: "row",
    gap: 4,
    padding: 4,
    borderWidth: 1,
    borderRadius: SHAPE.chip, // 6px
  },
  tab: {
    flex: 1,
    height: 36,
    borderRadius: SHAPE.chip, // 6px
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    fontFamily: "Archivo_700",
    fontSize: 12.5,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: SHAPE.chip, // 6px
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dropdownRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  dropdownPill: {
    height: 34,
    paddingHorizontal: 13,
    borderRadius: SHAPE.chip, // 6px
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  dropdownText: {
    fontFamily: "Archivo_500",
    fontSize: 12,
  },
});
