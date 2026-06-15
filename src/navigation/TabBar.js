import { useState, useEffect } from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useC } from "../contexts/ThemeContext";
import { Icon } from "../components/design";
import { QuickActionSheet } from "../components/common/QuickActionSheet";

// Spatial Aptitude tarzı: aktif tab solid pill (theme accent), pasif sade ikon.
// Center FAB siyah daire (aksiyon birleştirici), basınca dönüş animasyonu.
const TABS = [
  { key: "Home",      label: "Ana Sayfa", icon: "home" },
  { key: "DailyPlan", label: "Dersler",   icon: "book" },
  { key: "Add",       label: "Kaydet",    icon: "plus", center: true },
  { key: "Analysis",  label: "Analiz",    icon: "chart" },
  { key: "Profile",   label: "Profil",    icon: "user" },
];

function CenterFab({ onPress, C }) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={{ width: 64, alignItems: "center", justifyContent: "center" }}>
      <Animated.View style={fabStyle}>
        <Pressable
          onPressIn={() => {
            scale.value = withSpring(0.90, { damping: 14, stiffness: 320 });
            rotation.value = withSpring(135, { damping: 12, stiffness: 200 });
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
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: "#1B1530",
              alignItems: "center",
              justifyContent: "center",
              marginTop: -20,
              shadowColor: "#1B1530",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.30,
              shadowRadius: 18,
              elevation: 12,
              borderWidth: 4,
              borderColor: C.bg,
            }}
          >
            <Icon name="plus" size={26} color="#FFFFFF" sw={3} />
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

function TabItem({ tab, active, accent, onPress, C }) {
  const scale = useSharedValue(1);
  const pillWidth = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    pillWidth.value = withSpring(active ? 1 : 0, { damping: 18, stiffness: 280 });
  }, [active, pillWidth]);

  const pillStyle = useAnimatedStyle(() => ({
    opacity: pillWidth.value,
    transform: [{ scale: 0.95 + pillWidth.value * 0.05 }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => { scale.value = withSpring(0.92, { damping: 14, stiffness: 360 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 14, stiffness: 360 }); }}
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress();
      }}
      style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 6 }}
    >
      <Animated.View style={iconStyle}>
        {/* Aktif: pill arka plan */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { borderRadius: 18, backgroundColor: accent + "20" },
            pillStyle,
          ]}
        />
        <View style={{
          minWidth: 56, height: 36,
          flexDirection: "row", alignItems: "center", justifyContent: "center",
          paddingHorizontal: 12, gap: 6,
          borderRadius: 18,
        }}>
          <Icon
            name={tab.icon}
            size={20}
            color={active ? accent : C.muted}
            sw={active ? 2.4 : 1.8}
          />
          {active && (
            <Animated.Text
              style={[
                {
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 12,
                  color: accent,
                },
                pillStyle,
              ]}
            >
              {tab.label}
            </Animated.Text>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
}

export function TabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const C = useC();
  const currentKey = state.routes[state.index].name;
  const [sheetOpen, setSheetOpen] = useState(false);

  // Tab başına kimlik rengi
  const accents = {
    Home:      C.purple,
    DailyPlan: C.amber,
    Analysis:  C.blue,
    Profile:   C.coral,
  };

  return (
    <>
      <QuickActionSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onAction={(screen) => navigation.navigate(screen)}
      />
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: C.surface,
        borderTopWidth: 1,
        borderTopColor: C.border,
        paddingTop: 10,
        paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
        paddingHorizontal: 12,
        shadowColor: "#1B1530",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 8,
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
              accent={accents[tab.key] || C.purple}
              onPress={() => navigation.navigate(tab.key)}
              C={C}
            />
          );
        })}
      </View>
    </>
  );
}
