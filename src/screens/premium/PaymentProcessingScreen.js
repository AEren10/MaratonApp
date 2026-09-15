import { useEffect, useMemo, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Svg, { Circle, Path } from "react-native-svg";
import { useC } from "../../contexts/ThemeContext";
import { SCREENS } from "../../constants/screens";

export default function PaymentProcessingScreen() {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);
  const navigation = useNavigation();
  const spinAnim = useRef(new Animated.Value(0)).current;

  // Mock processing time
  useEffect(() => {
    // Start spinner
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1100, // dur="1.1s" in HTML
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Mock API call to navigate to success/fail
    const timer = setTimeout(() => {
      // 80% success rate for preview purposes
      if (Math.random() > 0.2) {
        navigation.navigate(SCREENS.PAYMENT_SUCCESS);
      } else {
        navigation.navigate(SCREENS.PAYMENT_FAILED);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"]
  });

  return (
    <SafeAreaView style={s.safe}>
      {/* Hide header and everything. Center content */}
      <View style={s.centerBlock}>
        
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Svg width={64} height={64} viewBox="0 0 64 64" fill="none">
            <Circle cx={32} cy={32} r={26} stroke={C.elev} strokeWidth={3} />
            <Path 
              d="M32 6a26 26 0 0 1 26 26" 
              stroke={C.accent} 
              strokeWidth={3} 
              strokeLinecap="round" 
            />
          </Svg>
        </Animated.View>

        <Text style={s.title}>Bankandan onay bekleniyor.</Text>
        <Text style={s.subtitle}>Bu sayfayı kapatma. İşlem birkaç saniye sürebilir.</Text>
      </View>

      <View style={s.bottomTextContainer}>
        <Text style={s.bottomText}>İşlem sırasında geri gitmek ödemeyi iptal eder</Text>
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
    centerBlock: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 46,
    },
    title: {
      fontFamily: "BricolageGrotesque_400Regular",
      fontSize: 24,
      lineHeight: 31.2, // 1.3
      color: C.text,
      marginTop: 28,
      textAlign: "center"
    },
    subtitle: {
      fontFamily: "Archivo_400Regular",
      fontSize: 13.5,
      lineHeight: 21.6, // 1.6
      color: C.text3,
      marginTop: 12,
      textAlign: "center",
      maxWidth: 240
    },
    bottomTextContainer: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 26,
      alignItems: "center"
    },
    bottomText: {
      fontFamily: "Archivo_500Medium",
      fontSize: 12,
      color: C.text3,
    }
  });
}
