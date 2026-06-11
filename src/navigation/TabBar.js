import { useState } from "react";
import { View, Pressable, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { C } from "../themes/tokens";
import { Icon } from "../components/design";
import { QuickActionSheet } from "../components/common/QuickActionSheet";

const TABS = [
  { key: "Home", label: "Ana Sayfa", icon: "home" },
  { key: "DailyPlan", label: "Dersler", icon: "book" },
  { key: "Add", label: "Kaydet", icon: "plus", center: true },
  { key: "Analysis", label: "Analiz", icon: "chart" },
  { key: "Profile", label: "Profil", icon: "user" },
];

function CenterFab({ label, onPress }) {
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Pressable onPress={onPress}>
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: C.amber,
            alignItems: "center",
            justifyContent: "center",
            marginTop: -22,
            shadowColor: C.amber,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.5,
            shadowRadius: 20,
            elevation: 12,
          }}
        >
          <Icon name="plus" size={26} color={C.bg} sw={3} />
        </View>
      </Pressable>
      <Text style={{ fontFamily: "Inter_500Medium", fontSize: 10, color: C.muted, marginTop: 4 }}>
        {label}
      </Text>
    </View>
  );
}

function TabItem({ tab, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 6 }}
    >
      <View style={{ alignItems: "center" }}>
        <Icon name={tab.icon} size={22} color={active ? C.amber : C.muted} sw={active ? 2.2 : 1.8} />
        {active && (
          <View
            style={{
              width: 4,
              height: 4,
              borderRadius: 2,
              backgroundColor: C.amber,
              marginTop: 3,
            }}
          />
        )}
      </View>
      <Text
        style={{
          fontFamily: active ? "Inter_600SemiBold" : "Inter_500Medium",
          fontSize: 10,
          color: active ? C.amber : C.muted,
          marginTop: active ? 0 : 4,
        }}
      >
        {tab.label}
      </Text>
    </Pressable>
  );
}

export function TabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const currentKey = state.routes[state.index].name;
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <QuickActionSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onAction={(screen) => navigation.navigate(screen)}
      />
      <View
        style={{
          flexDirection: "row",
          backgroundColor: C.surface,
          borderTopWidth: 1,
          borderTopColor: C.border,
          paddingTop: 8,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
          paddingHorizontal: 8,
        }}
      >
        {TABS.map((tab) => {
          if (tab.center) {
            return <CenterFab key={tab.key} label={tab.label} onPress={() => setSheetOpen(true)} />;
          }
          const active = currentKey === tab.key;
          return (
            <TabItem key={tab.key} tab={tab} active={active} onPress={() => navigation.navigate(tab.key)} />
          );
        })}
      </View>
    </>
  );
}
