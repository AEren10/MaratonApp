import { useMemo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Svg, { Path, Circle } from "react-native-svg";
import { useC } from "../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE } from "../../themes/tokens";
import { SCREENS } from "../../constants/screens";
import * as H from "../../lib/haptics";

export default function ComebackScreen({ route }) {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);
  const navigation = useNavigation();

  const handleStart = () => {
    H.select();
    // Normalde task data gecilir, mock olarak ana ekrana veya StudyTimer'a atabiliriz
    // Simdilik sadece done ekranini gosterelim veya geri donelim
    navigation.navigate(SCREENS.COMEBACK_DONE);
  };

  const handleChooseOther = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView edges={["top"]} style={s.safe}>
      <View style={s.topContent}>
        <Text style={s.badge}>ROTAN YERİNDE</Text>
        <Text style={s.heroTitle}>Rota seni bekliyor.</Text>
        <Text style={s.heroSub}>
          Bugünü telafi etmeye çalışma. Sadece küçük bir durakla yeniden ritim yakala.
        </Text>
      </View>

      <View style={s.chartContainer}>
        <Svg viewBox="0 0 390 150" style={s.chartSvg}>
          <Path 
            d="M 26 118 C 90 110 126 96 172 84" 
            fill="none" 
            stroke={C.accent} 
            strokeWidth={4.5} 
            strokeLinecap="round" 
          />
          <Path 
            d="M 172 84 L 232 74" 
            fill="none" 
            stroke={C.text5} 
            strokeWidth={3} 
            strokeLinecap="round" 
            strokeDasharray="4 6" 
          />
          <Path 
            d="M 232 74 C 288 58 330 44 364 32" 
            fill="none" 
            stroke={C.line} // proj in html maps to line/track
            strokeWidth={2.4} 
            strokeLinecap="round" 
            strokeDasharray="2 8" 
          />
          
          <Circle cx={26} cy={118} r={4.4} fill={C.bg} stroke={C.accent} strokeWidth={2.4} />
          <Circle cx={172} cy={84} r={7} fill={C.accent} />
          <Circle cx={232} cy={74} r={5} fill={C.bg} stroke={C.text5} strokeWidth={2.2} />
          <Circle cx={364} cy={32} r={6.5} fill={C.bg} stroke={C.line} strokeWidth={2.4} />
        </Svg>
        
        {/* Absolute labels using percentages to match SVG viewbox mapping */}
        <View style={[s.chartLabelBox, { left: "41%", top: "64%" }]}>
          <Text style={s.chartLabelAccent}>KALDIĞIN YER</Text>
        </View>
        <View style={[s.chartLabelBox, { left: "59%", top: "34%" }]}>
          <Text style={s.chartLabelMuted}>BEKLEYEN İKİ DURAK</Text>
        </View>
      </View>

      <View style={s.recContent}>
        <View style={s.recCard}>
          <View style={s.recHeader}>
            <Text style={s.recBadge}>DÖNÜŞ DURAĞI</Text>
            <View style={{ flex: 1 }} />
            <Text style={s.recNumber}>20</Text>
            <Text style={s.recUnit}>dk</Text>
          </View>

          <View style={s.recList}>
            <View style={s.recListItem}>
              <View style={s.bullet} />
              <Text style={s.recListText}>10 dakika konu tekrarı</Text>
            </View>
            <View style={s.recListItem}>
              <View style={s.bullet} />
              <Text style={s.recListText}>10 soru</Text>
            </View>
            <View style={s.recListItem}>
              <View style={[s.bullet, { backgroundColor: C.up }]} />
              <Text style={s.recListText}>Tamamla ve rotaya geri dön</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={s.footerContainer}>
        <Pressable 
          style={({ pressed }) => [
            s.primaryBtn,
            pressed && { transform: [{ scale: 0.98 }], backgroundColor: C.accentPress }
          ]}
          onPress={handleStart}
        >
          <Text style={s.primaryBtnText}>20 dakikayla dön</Text>
        </Pressable>
        <Pressable 
          style={({ pressed }) => [
            s.secondaryBtn,
            pressed && { opacity: 0.7 }
          ]}
          onPress={handleChooseOther}
        >
          <Text style={s.secondaryBtnText}>Başka bir durak seç</Text>
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
      paddingTop: 40,
    },
    badge: {
      fontFamily: "Archivo_700Bold",
      fontSize: 11.5,
      letterSpacing: 2.76, // .24em
      color: C.text3,
    },
    heroTitle: {
      fontFamily: "BricolageGrotesque_400Regular",
      fontSize: 32,
      lineHeight: 37.12, // 1.16
      color: C.text,
      marginTop: 16,
      maxWidth: 290,
    },
    heroSub: {
      fontFamily: "Archivo_400Regular",
      fontSize: 14,
      lineHeight: 22.4, // 1.6
      color: C.text3,
      marginTop: 16,
      maxWidth: 296,
    },
    chartContainer: {
      marginTop: 30,
      position: "relative",
    },
    chartSvg: {
      width: "100%",
      aspectRatio: 390 / 150,
    },
    chartLabelBox: {
      position: "absolute",
      transform: [{ translateX: -50 }, { translateY: -50 }],
    },
    chartLabelAccent: {
      fontFamily: "Archivo_700Bold",
      fontSize: 11,
      letterSpacing: 1.76, // .16em
      color: C.accentBright,
    },
    chartLabelMuted: {
      fontFamily: "Archivo_700Bold",
      fontSize: 11,
      letterSpacing: 1.54, // .14em
      color: C.text3,
    },
    recContent: {
      paddingHorizontal: GUTTER,
      paddingTop: 16,
    },
    recCard: {
      padding: 20,
      borderRadius: 24,
      backgroundColor: C.surface,
      borderWidth: 1,
      borderColor: C.elev,
    },
    recHeader: {
      flexDirection: "row",
      alignItems: "baseline",
    },
    recBadge: {
      fontFamily: "Archivo_600SemiBold",
      fontSize: 11.5,
      letterSpacing: 2.07, // .18em
      color: C.accentBright,
    },
    recNumber: {
      fontFamily: "BricolageGrotesque_400Regular",
      fontSize: 28,
      lineHeight: 28,
      color: C.text,
      fontVariant: ["tabular-nums"],
    },
    recUnit: {
      fontFamily: "Archivo_500Medium",
      fontSize: 12.5,
      color: C.text3,
      marginLeft: 4,
    },
    recList: {
      marginTop: 18,
      gap: 13,
    },
    recListItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    bullet: {
      width: 6,
      height: 6,
      borderRadius: 1,
      backgroundColor: C.accent,
    },
    recListText: {
      fontFamily: "Archivo_400Regular",
      fontSize: 13.5,
      color: C.text2,
      flex: 1,
    },
    footerContainer: {
      paddingHorizontal: GUTTER,
      paddingTop: 32,
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
    secondaryBtn: {
      width: "100%",
      height: 46,
      marginTop: 12,
      borderRadius: SHAPE.button,
      borderWidth: 1,
      borderColor: C.border,
      alignItems: "center",
      justifyContent: "center",
    },
    secondaryBtnText: {
      fontFamily: "Archivo_600SemiBold",
      fontSize: 13.5,
      color: C.text2,
    }
  });
}
