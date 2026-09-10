import { View, Text, Pressable } from "react-native";

import { Icon } from "../../../components/design";
import { WRONG_NOTEBOOK_TAB } from "../../../domain/wrongNotebook/wrongNotebookModel";
import { RADIUS, SHADOWS, SPACING } from "../../../themes/tokens";

const TABS = [
  { key: WRONG_NOTEBOOK_TAB.COMMUNITY, label: "Topluluk", icon: "globe", accentBg: true },
  { key: WRONG_NOTEBOOK_TAB.MINE, label: "Defterim", icon: "notebook" },
];

export function WrongNotebookTabs({ C, activeTab, onChange }) {
  return (
    <View
      style={{
        flexDirection: "row",
        marginHorizontal: SPACING.lg,
        marginVertical: SPACING.sm,
        backgroundColor: C.surface2,
        borderRadius: RADIUS.lg,
        padding: 3,
      }}
    >
      {TABS.map((tab) => {
        const active = activeTab === tab.key;
        const isAccent = tab.accentBg && active;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: active }}
            onPress={() => onChange(tab.key)}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              paddingVertical: 10,
              borderRadius: RADIUS.md,
              backgroundColor: isAccent ? C.accent : active ? C.surface : "transparent",
              ...(active ? SHADOWS.sm : {}),
            }}
          >
            <Icon name={tab.icon} size={16} color={isAccent ? C.textOnFill : active ? C.accent : C.muted} />
            <Text
              style={{
                fontFamily: active ? "Archivo_600" : "Archivo_500",
                fontSize: 14,
                color: isAccent ? C.textOnFill : active ? C.text : C.muted,
              }}
            >
              {tab.label}
            </Text>
            {tab.accentBg && !active && (
              <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: C.accent, marginLeft: -2 }} />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
