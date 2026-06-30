import { useState, useEffect } from "react";
import { View, Pressable, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useC } from "../contexts/ThemeContext";
import { TYPOGRAPHY } from "../themes/tokens";
import { Icon } from "../components/design";
import { QuickActionSheet } from "../components/common/QuickActionSheet";
import { SCREENS } from "../constants/screens";

const TABS = [
  { key: SCREENS.HOME,       label: "Ana Sayfa", icon: "home",  hint: "Ana sayfaya gider" },
  { key: SCREENS.DAILY_PLAN, label: "Dersler",   icon: "book",  hint: "Ders planını gösterir" },
  { key: "Add",              label: "Kaydet",    icon: "plus",  center: true },
  { key: SCREENS.ANALYSIS,   label: "Analiz",    icon: "chart", hint: "Analiz ekranına gider" },
  { key: SCREENS.PROFILE,    label: "Profil",    icon: "user",  hint: "Profil sayfanı açar" },
];

function CenterFab({ onPress, C }) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Animated.View style={fabStyle}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Yeni kayıt ekle"
          accessibilityHint="Hızlı işlem menüsünü açar"
          onPressIn={() => {
            scale.value = withSpring(0.90, { damping: 14, stiffness: 320 });
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
              width: 54, height: 54, borderRadius: 27,
              backgroundColor: C.orange,
              alignItems: "center", justifyContent: "center",
              marginTop: -18,
              shadowColor: C.orange,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.32,
              shadowRadius: 14,
              elevation: 8,
            }}
          >
            <Icon name="plus" size={24} color={C.textOnFill} sw={3} />
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

function TabItem({ tab, active, onPress, C }) {
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
      accessibilityRole="tab"
      accessibilityLabel={tab.label}
      accessibilityHint={tab.hint}
      accessibilityState={{ selected: active }}
      onPressIn={() => { scale.value = withSpring(0.88, { damping: 14, stiffness: 360 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 14, stiffness: 360 }); }}
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress();
      }}
      style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 6 }}
    >
      <Animated.View style={[{ alignItems: "center" }, iconStyle]}>
        <Icon name={tab.icon} size={22} color={active ? C.orange : C.muted} sw={active ? 2.2 : 1.8} />
        <Animated.View
          style={[
            {
              width: 4, height: 4, borderRadius: 2,
              backgroundColor: C.orange,
              marginTop: 3,
            },
            dotStyle,
          ]}
        />
      </Animated.View>
      <Text
        style={{
          ...TYPOGRAPHY.micro,
          fontFamily: active ? "Inter_600SemiBold" : "Inter_500Medium",
          color: active ? C.orange : C.muted,
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
  const C = useC();
  const currentKey = state.routes[state.index].name;
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <QuickActionSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onAction={(screen) => navigation.navigate(screen)}
      />
      <LinearGradient
        colors={["transparent", C.surface + "CC", C.surface]}
        style={{ position: "absolute", top: -20, left: 0, right: 0, height: 20 }}
        pointerEvents="none"
      />
      <View style={{
        flexDirection: "row",
        backgroundColor: C.surface,
        paddingTop: 8,
        paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
        paddingHorizontal: 8,
      }}>
        {TABS.map((tab) => {
          if (tab.center) {
            return <CenterFab key={tab.key} onPress={() => setSheetOpen(true)} C={C} />;
          }
          const active = currentKey === tab.key;
          return (
            <TabItem
              key={tab.key}
              tab={tab}
              active={active}
              onPress={() => navigation.navigate(tab.key)}
              C={C}
            />
          );
        })}
      </View>
    </>
  );
}
