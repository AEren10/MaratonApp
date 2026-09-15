import { useEffect, useMemo, useRef } from "react";
import { View, Text, StyleSheet, Pressable, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, CommonActions } from "@react-navigation/native";
import Svg, { Path, Circle } from "react-native-svg";
import { useC } from "../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE } from "../../themes/tokens";
import { SCREENS } from "../../constants/screens";

// Custom Animated Components for SVG
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function ComebackDoneScreen() {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);
  const navigation = useNavigation();

  // Animations
  const animValue = useRef(new Animated.Value(0)).current;
  const barAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sequence matching HTML delays
    Animated.sequence([
      Animated.delay(1100),
      Animated.parallel([
        Animated.timing(animValue, {
          toValue: 1,
          duration: 620,
          useNativeDriver: false,
        }),
        Animated.timing(barAnim, {
          toValue: 1,
          duration: 620,
          useNativeDriver: false,
        })
      ])
    ]).start();
  }, []);

  const handleNext = () => {
    // Yarin durağını görmek için ana ekrana don, home controller yarin'i secsin (veya takvim)
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: SCREENS.MAIN_TABS }],
      })
    );
  };

  const handleDone = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: SCREENS.MAIN_TABS }],
      })
    );
  };

  return (
    <SafeAreaView edges={["top"]} style={s.safe}>
      <View style={s.topContent}>
        <Text style={s.badge}>DÖNÜŞ DURAĞI TAMAMLANDI</Text>
        <Text style={s.heroTitle}>Geri döndün. Rota yeniden hareket ediyor.</Text>
      </View>

      <View style={s.chartContainer}>
        <Svg viewBox="0 0 390 130" style={s.chartSvg}>
          <Path 
            d="M 26 102 C 92 96 132 84 180 72" 
            fill="none" 
            stroke={C.accent} 
            strokeWidth={4.5} 
            strokeLinecap="round" 
          />
          <Path 
            d="M 180 72 C 244 56 302 42 364 30" 
            fill="none" 
            stroke={C.line} // proj in html maps to line/track
            strokeWidth={2.4} 
            strokeLinecap="round" 
            strokeDasharray="2 8" 
          />
          <Circle cx={26} cy={102} r={4.4} fill={C.bg} stroke={C.accent} strokeWidth={2.4} />
          
          {/* Animated Glow Circle */}
          <AnimatedCircle 
            cx={180} 
            cy={72} 
            r={animValue.interpolate({ inputRange: [0, 1], outputRange: [8, 30] })} 
            fill="none" 
            stroke={C.accent} 
            strokeWidth={3} 
            opacity={animValue.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.85, 0] })} 
          />
          
          {/* Animated Solid Node */}
          <AnimatedCircle 
            cx={180} 
            cy={72} 
            r={animValue.interpolate({ inputRange: [0, 1], outputRange: [0, 8] })} 
            fill={C.accent} 
          />
          
          <Circle cx={364} cy={30} r={5.5} fill={C.bg} stroke={C.line} strokeWidth={2.4} />
        </Svg>
        
        <View style={s.chartLabelBox}>
          <Text style={s.chartLabelAccent}>BUGÜN</Text>
        </View>
      </View>

      <View style={s.statsContent}>
        <View style={s.statsCard}>
          <View style={s.statsRow}>
            <View style={s.statsDot} />
            <Text style={s.statsText}>20 dakika · 10 soru · bir durak kapandı</Text>
          </View>
          
          <View style={s.barTrack}>
            <Animated.View style={[
              s.barFill, 
              { 
                width: barAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "28%"]
                })
              }
            ]} />
          </View>
          
          <Text style={s.statsNote}>
            Bugünkü emeğin kayda geçti · uygulama içi rota göstergesi, net tahmini değildir
          </Text>
        </View>
      </View>

      <View style={s.footerContainer}>
        <Pressable 
          style={({ pressed }) => [
            s.primaryBtn,
            pressed && { transform: [{ scale: 0.98 }], backgroundColor: C.accentPress }
          ]}
          onPress={handleNext}
        >
          <Text style={s.primaryBtnText}>Yarının durağını gör</Text>
        </Pressable>
        <Pressable 
          style={({ pressed }) => [
            s.textBtn,
            pressed && { opacity: 0.7 }
          ]}
          onPress={handleDone}
        >
          <Text style={s.textBtnText}>Bugünlük bu kadar</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function makeStyles(C) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: C.bg
    },
    topContent: {
      paddingHorizontal: 26,
      paddingTop: 56,
    },
    badge: {
      fontFamily: "Archivo_700Bold",
      fontSize: 11.5,
      letterSpacing: 2.76, // .24em
      color: C.accentBright,
    },
    heroTitle: {
      fontFamily: "BricolageGrotesque_400Regular",
      fontSize: 33,
      lineHeight: 38.28, // 1.16
      letterSpacing: -0.66, // -.02em
      color: C.text,
      marginTop: 16,
      maxWidth: 280,
    },
    chartContainer: {
      marginTop: 26,
      position: "relative",
    },
    chartSvg: {
      width: "100%",
      aspectRatio: 390 / 130,
    },
    chartLabelBox: {
      position: "absolute",
      left: "46%",
      top: "70%",
      transform: [{ translateX: -20 }, { translateY: -5 }], // Approx center adjustment
    },
    chartLabelAccent: {
      fontFamily: "Archivo_700Bold",
      fontSize: 11,
      letterSpacing: 1.76, // .16em
      color: C.accentBright,
    },
    statsContent: {
      paddingHorizontal: GUTTER,
      paddingTop: 14,
    },
    statsCard: {
      paddingHorizontal: 20,
      paddingVertical: 18,
      borderRadius: SHAPE.card,
      backgroundColor: C.surface,
      borderWidth: 1,
      borderColor: C.elev,
    },
    statsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 11,
    },
    statsDot: {
      width: 7,
      height: 7,
      borderRadius: 1,
      backgroundColor: C.up,
    },
    statsText: {
      flex: 1,
      fontFamily: "Archivo_400Regular",
      fontSize: 13,
      lineHeight: 19.5, // 1.5
      color: C.text2,
    },
    barTrack: {
      height: 4,
      marginTop: 14,
      borderRadius: 1,
      backgroundColor: C.track,
      overflow: "hidden",
    },
    barFill: {
      height: "100%",
      backgroundColor: C.up,
      borderRadius: 2,
    },
    statsNote: {
      fontFamily: "Archivo_400Regular",
      fontSize: 11,
      lineHeight: 16.5,
      color: C.text3,
      marginTop: 9,
    },
    footerContainer: {
      paddingHorizontal: GUTTER,
      paddingTop: 24,
      paddingBottom: 40,
      marginTop: "auto",
    },
    primaryBtn: {
      width: "100%",
      height: 52,
      borderRadius: SHAPE.button,
      backgroundColor: C.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    primaryBtnText: {
      ...TYPOGRAPHY.button,
      color: C.accentInk,
    },
    textBtn: {
      height: 44,
      marginTop: 6,
      alignItems: "center",
      justifyContent: "center",
    },
    textBtnText: {
      fontFamily: "Archivo_500Medium",
      fontSize: 13,
      color: C.text3,
    }
  });
}
