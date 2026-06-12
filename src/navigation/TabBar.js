import { useState, useEffect } from "react";
import { View, Pressable, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
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
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Animated.View style={fabStyle}>
        <Pressable
          onPressIn={() => {
            scale.value = withSpring(0.92, { damping: 14, stiffness: 320 });
            rotation.value = withSpring(45, { damping: 14, stiffness: 220 });
          }}
          onPressOut={() => {
            scale.value = withSpring(1, { damping: 14, stiffness: 320 });
            rotation.value = withSpring(0, { damping: 14, stiffness: 220 });
          }}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
            onPress();
          }}
        >
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
      </Animated.View>
      <Text style={{ fontFamily: "Inter_500Medium", fontSize: 10, color: C.muted, marginTop: 4 }}>
        {label}
      </Text>
    </View>
  );
}

function TabItem({ tab, active, onPress }) {
  const scale = useSharedValue(1);
  const dotScale = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    dotScale.value = withSpring(active ? 1 : 0, { damping: 18, stiffness: 320 });
  }, [active, dotScale]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dotScale.value }],
    opacity: dotScale.value,
  }));

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(0.85, { damping: 14, stiffness: 360 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 14, stiffness: 360 });
      }}
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress();
      }}
      style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 6 }}
    >
      <Animated.View style={[{ alignItems: "center" }, iconStyle]}>
        <Icon name={tab.icon} size={22} color={active ? C.amber : C.muted} sw={active ? 2.2 : 1.8} />
        <Animated.View
          style={[
            {
              width: 4,
              height: 4,
              borderRadius: 2,
              backgroundColor: C.amber,
              marginTop: 3,
            },
            dotStyle,
          ]}
        />
      </Animated.View>
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
