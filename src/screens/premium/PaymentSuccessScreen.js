import { useMemo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, CommonActions } from "@react-navigation/native";
import Svg, { Defs, RadialGradient, Rect, Stop, Line, Path, Circle, Text as SvgText } from "react-native-svg";
import { Icon } from "../../components/design";
import { useC } from "../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE } from "../../themes/tokens";
import { ROOT_STACK } from "../../navigation/routes";

export default function PaymentSuccessScreen() {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);
  const navigation = useNavigation();

  // Reset stack and go home
  const handleDone = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: ROOT_STACK.MAIN_TABS }],
      })
    );
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={s.safe}>
      
      {/* Background Radial Glow */}
      <View style={s.glowContainer} pointerEvents="none">
        <Svg width={440} height={440}>
          <Defs>
            <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={C.accent} stopOpacity={0.16} />
              <Stop offset="66%" stopColor={C.accent} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect width={440} height={440} fill="url(#glow)" />
        </Svg>
      </View>

      <View style={s.topContent}>
        <Text style={s.badge}>PRO AÇILDI</Text>
        <Text style={s.heroTitle}>Rotan artık tam görünür.</Text>
        <Text style={s.heroSub}>
          Rotanı hâlâ sen şekillendiriyorsun. Pro, verilerine göre daha net öneriler sunuyor.
        </Text>
      </View>

      <View style={s.chartContainer}>
        {/* Simple mock of the route chart line from HTML */}
        <Svg viewBox="0 0 390 130" width="100%" height={130}>
          <Line x1={34} y1={26} x2={366} y2={26} stroke={C.line} strokeWidth={1} />
          <Line x1={34} y1={62} x2={366} y2={62} stroke={C.line} strokeWidth={1} />
          <Line x1={34} y1={98} x2={366} y2={98} stroke={C.line} strokeWidth={1} />
          
          <Path 
            d="M 40 100 C 120 94 180 74 224 62" 
            fill="none" 
            stroke={C.accent} 
            strokeWidth={2.6} 
            strokeLinecap="round" 
          />
          <Path 
            d="M 224 62 C 280 50 320 40 352 32" 
            fill="none" 
            stroke={C.accent} 
            strokeWidth={2.6} 
            strokeLinecap="round" 
            strokeDasharray="1.5 7" 
          />
          
          <Circle cx={224} cy={62} r={10} fill={C.accent} fillOpacity={0.2} />
          <Circle cx={224} cy={62} r={7} fill={C.accent} />
          <Circle cx={352} cy={32} r={7.5} fill={C.bg} stroke={C.text3} strokeWidth={2.6} />
          
          <SvgText x={40} y={120} fontFamily="Archivo_700Bold" fontSize={11} letterSpacing={1.6} fill={C.text4}>23 HAZ</SvgText>
          <SvgText x={366} y={120} textAnchor="end" fontFamily="Archivo_600SemiBold" fontSize={11} letterSpacing={1.2} fill={C.text4}>20 HAZ 2027</SvgText>
        </Svg>
      </View>

      <View style={s.featuresContainer}>
        <Text style={s.featuresTitle}>ŞİMDİ AÇIK</Text>
        <View style={s.featureList}>
          
          <View style={s.featureRow}>
            <View style={s.iconWrapper}>
              <Icon name="check" size={16} color={C.up} />
            </View>
            <View style={s.featureTextCol}>
              <Text style={s.featureTitle}>Fotoğraftan deneme okuma</Text>
              <Text style={s.featureSub}>Optik formu çek, netler kendiliğinden düşsün</Text>
            </View>
          </View>

          <View style={s.featureRow}>
            <View style={s.iconWrapper}>
              <Icon name="check" size={16} color={C.up} />
            </View>
            <View style={s.featureTextCol}>
              <Text style={s.featureTitle}>Sınırsız deneme geçmişi</Text>
              <Text style={s.featureSub}>5 deneme sınırı kalktı</Text>
            </View>
          </View>

          <View style={s.featureRow}>
            <View style={s.iconWrapper}>
              <Icon name="check" size={16} color={C.up} />
            </View>
            <View style={s.featureTextCol}>
              <Text style={s.featureTitle}>Tempo senaryoları</Text>
              <Text style={s.featureSub}>Farklı temponun sınav gününe etkisi</Text>
            </View>
          </View>

          <View style={s.featureRow}>
            <View style={s.iconWrapper}>
              <Icon name="check" size={16} color={C.up} />
            </View>
            <View style={s.featureTextCol}>
              <Text style={s.featureTitle}>Bölüm raporu</Text>
              <Text style={s.featureSub}>Tahminin hangi bölümlere denk geldiği</Text>
            </View>
          </View>

        </View>
      </View>

      <View style={s.footerContainer}>
        <Text style={s.footerNote}>Yıllık ₺1.068 · sonraki yenileme 23 Haziran 2027 · Ayarlar'dan iptal</Text>
        <Pressable 
          style={({ pressed }) => [
            s.primaryBtn,
            pressed && { transform: [{ scale: 0.98 }], backgroundColor: C.accentPress }
          ]}
          onPress={handleDone}
        >
          <Text style={s.primaryBtnText}>Rotama dön</Text>
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
    glowContainer: {
      position: "absolute",
      left: -130,
      top: -150,
      width: 440,
      height: 440,
    },
    topContent: {
      paddingHorizontal: 26,
      paddingTop: 44,
      zIndex: 1,
    },
    badge: {
      fontFamily: "Archivo_600SemiBold",
      fontSize: 11.5,
      letterSpacing: 1.84,
      color: C.accentBright,
    },
    heroTitle: {
      fontFamily: "BricolageGrotesque_400Regular",
      fontSize: 52,
      lineHeight: 55,
      letterSpacing: -1.82,
      color: C.text,
      marginTop: 16,
      maxWidth: 300,
    },
    heroSub: {
      fontFamily: "Archivo_400Regular",
      fontSize: 14,
      lineHeight: 21.7, // 1.55
      color: C.text2,
      marginTop: 14,
      maxWidth: 288,
    },
    chartContainer: {
      marginTop: 28,
      zIndex: 1,
    },
    featuresContainer: {
      paddingHorizontal: GUTTER,
      paddingTop: 20,
      zIndex: 1,
      flex: 1,
    },
    featuresTitle: {
      fontFamily: "Archivo_600SemiBold",
      fontSize: 11.5,
      letterSpacing: 1.84,
      color: C.text2,
    },
    featureList: {
      marginTop: 12,
    },
    featureRow: {
      flexDirection: "row",
      gap: 14,
      paddingVertical: 15,
      borderTopWidth: 1,
      borderTopColor: C.line,
    },
    iconWrapper: {
      marginTop: 2,
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 1.7,
      borderColor: C.up,
      alignItems: "center",
      justifyContent: "center",
    },
    featureTextCol: {
      flex: 1,
    },
    featureTitle: {
      fontFamily: "Archivo_600SemiBold",
      fontSize: 13.5,
      color: C.text,
    },
    featureSub: {
      fontFamily: "Archivo_400Regular",
      fontSize: 11.5,
      lineHeight: 17.25,
      color: C.text3,
      marginTop: 3,
    },
    footerContainer: {
      paddingHorizontal: GUTTER,
      paddingBottom: 26,
      paddingTop: 14,
    },
    footerNote: {
      fontFamily: "Archivo_400Regular",
      fontSize: 11.5,
      color: C.text3,
      marginBottom: 12,
      textAlign: "center"
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
    }
  });
}
