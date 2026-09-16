import React, { useCallback, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown, useSharedValue, withDelay, withSpring, withTiming } from "react-native-reanimated";
import Svg, { Path, Circle } from "react-native-svg";

import { Button, Icon } from "../../components/design";
import { useC } from "../../contexts/ThemeContext";
import { SCREENS } from "../../constants/screens";
import { useFirstWeekMomentData } from "../../hooks/useFirstWeekMomentData";
import { TAB_KEYS } from "../../navigation/tabAssignment";
import { resetToTabStackScreen } from "../../navigation/rootStackActions";
import { TYPOGRAPHY, STEP, GUTTER } from "../../themes/tokens";
import * as H from "../../lib/haptics";
import { useBlockBack } from "../../hooks/useBlockBack";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Tasarim: "Ilk Rotan Hazir". 1. Gun Sonu - Ilk deneme kaydedildiginde rota kurulur.
export default function FirstRouteReadyScreen() {
  useBlockBack(true);
  const C = useC();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const moment = useFirstWeekMomentData();
  const routeStops = moment.totals.routeStops;
  const firstWeekStarts = Math.min(routeStops, 4);

  const handleClose = useCallback(() => {
    H.select();
    navigation.goBack();
  }, [navigation]);

  const handleAction = useCallback(() => {
    H.select();
    resetToTabStackScreen(navigation, TAB_KEYS.ROTA, SCREENS.ROADMAP);
  }, [navigation]);

  // SVG Animation values
  const pulseScale = useSharedValue(8);
  const pulseOpacity = useSharedValue(0);
  const coreScale = useSharedValue(0);

  useEffect(() => {
    // Tasarimdaki delay'ler: 1.05s
    const delay = 1050;
    pulseOpacity.value = withDelay(delay, withTiming(0.8, { duration: 550 }, () => {
      pulseOpacity.value = withTiming(0, { duration: 550 });
    }));
    pulseScale.value = withDelay(delay, withTiming(28, { duration: 1100 }));
    coreScale.value = withDelay(delay, withSpring(8, { damping: 12, stiffness: 90 }));
  }, [pulseOpacity, pulseScale, coreScale]);

  return (
    <View style={[styles.container, { backgroundColor: C.bg, paddingTop: insets.top }]}>
      <View style={[styles.header, { paddingHorizontal: GUTTER }]}>
        <View style={{ width: 24 }} />
        <Text style={[styles.headerTitle, { color: C.text }]}></Text>
        <Pressable onPress={handleClose} hitSlop={10}>
          <Icon name="x" size={24} color={C.text2} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + STEP.s5 }}>
        <Animated.View entering={FadeInDown.duration(600).springify()} style={{ paddingHorizontal: 26, paddingTop: STEP.s5 }}>
          <Text style={[styles.eyebrow, { color: C.accentBright }]}>İLK GÜN TAMAM</Text>
          <Text style={[styles.title, { color: C.text }]}>İlk rotan hazır.</Text>
          <Text style={[styles.desc, { color: C.text2 }]}>
            Tek denemeyle başladık. Rota şimdilik kaba bir çizgi; her kayıtla netleşecek.
          </Text>
        </Animated.View>

        <View style={styles.svgContainer}>
          <Svg viewBox="0 0 390 122" style={styles.svg}>
            <Path 
              d="M 26 96 C 92 90 132 78 180 66" 
              fill="none" 
              stroke={C.accent} 
              strokeWidth="4.5" 
              strokeLinecap="round" 
            />
            <Path 
              d="M 180 66 C 244 52 302 38 364 26" 
              fill="none" 
              stroke={C.line} // Tasarimda --proj rengi, burada line / track ile yansitiyoruz
              strokeWidth="2.4" 
              strokeLinecap="round" 
              strokeDasharray="2 8" 
            />
            
            <Circle cx="26" cy="96" r="4.4" fill={C.bg} stroke={C.accent} strokeWidth="2.4" />
            
            <AnimatedCircle 
              cx="180" 
              cy="66" 
              r={pulseScale} 
              fill="none" 
              stroke={C.accent} 
              strokeWidth="3" 
              opacity={pulseOpacity} 
            />
            <AnimatedCircle 
              cx="180" 
              cy="66" 
              r={coreScale} 
              fill={C.accent} 
            />
            
            <Circle cx="364" cy="26" r="5.5" fill={C.bg} stroke={C.border} strokeWidth="2.4" />
          </Svg>
        </View>

        <Animated.View entering={FadeInDown.delay(140).duration(600).springify()} style={{ paddingHorizontal: GUTTER, paddingTop: STEP.s1 }}>
          <View style={[styles.statsCard, { backgroundColor: C.surface, borderColor: C.elev }]}>
            <Text style={[styles.statNumber, { color: C.text }]}>{routeStops || "—"}</Text>
            <Text style={[styles.statText, { color: C.text2 }]}>
              {routeStops
                ? `durak rotana yerleşti · ilk hafta ${firstWeekStarts} tanesi öne çıkıyor`
                : "rota verin oluştukça durak sayısı burada netleşecek"}
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(600).springify()} style={{ paddingHorizontal: GUTTER, paddingTop: STEP.s4 }}>
          <Button
            title="Rotayı gör"
            onPress={handleAction}
            size="large"
          />
          <Text style={[styles.footerText, { color: C.text3 }]}>
            Yarın tek işin: ilk çalışma oturumunu tamamlamak.
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontFamily: TYPOGRAPHY.Bricolage_400,
    fontSize: 22,
  },
  eyebrow: {
    fontFamily: TYPOGRAPHY.Archivo_700,
    fontSize: 11.5,
    letterSpacing: 2.76, // .24em
  },
  title: {
    fontFamily: TYPOGRAPHY.Bricolage_400,
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -1.08, // -.03em
    marginTop: 16,
    maxWidth: 280,
  },
  desc: {
    fontFamily: TYPOGRAPHY.Archivo_400,
    fontSize: 13.5,
    lineHeight: 22, // 1.65
    marginTop: 14,
    maxWidth: 296,
  },
  svgContainer: {
    marginTop: 26,
    width: "100%",
    aspectRatio: 390 / 122,
  },
  svg: {
    width: "100%",
    height: "100%",
  },
  statsCard: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
  },
  statNumber: {
    fontFamily: TYPOGRAPHY.Bricolage_400,
    fontSize: 40,
    lineHeight: 40, // .9 is about 36, let's keep it 40
    fontVariant: ["tabular-nums"],
  },
  statText: {
    flex: 1,
    fontFamily: TYPOGRAPHY.Archivo_500,
    fontSize: 12.5,
    lineHeight: 18, // 1.45
    paddingBottom: 2,
  },
  footerText: {
    fontFamily: TYPOGRAPHY.Archivo_400,
    fontSize: 12,
    lineHeight: 19, // 1.6
    marginTop: 12,
    textAlign: "center",
  },
});

