import { useState, useRef, useCallback, useEffect } from "react";
import { View, FlatList, useWindowDimensions, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenErrorBoundary } from "../../components/common/ScreenErrorBoundary";
import { useC } from "../../contexts/ThemeContext";
import { useExam } from "../../contexts/ExamContext";
import { setAuthIntent } from "../../lib/authIntent";
import * as H from "../../lib/haptics";
import { OnboardingAmbientGlow } from "./components/OnboardingAmbientGlow";
import { OnboardingPagination } from "./components/OnboardingPagination";
import { OnboardingSlideItem } from "./components/OnboardingSlideItem";
import { OnboardingSlideRoute } from "./components/OnboardingSlideRoute";
import { OnboardingSlideDaily } from "./components/OnboardingSlideDaily";
import { OnboardingSlideForecast } from "./components/OnboardingSlideForecast";
import { OnboardingFooter } from "./components/OnboardingFooter";

const SLIDES_COUNT = 3;
const SLIDE_DURATION = 6000;

function OnboardingScreenInner() {
  const C = useC();
  const { width } = useWindowDimensions();
  const { markSlidesAsSeen } = useExam();
  const [currentSlide, setCurrentSlide] = useState(0);
  const listRef = useRef(null);

  const createRoute = useCallback(() => {
    H.success();
    setAuthIntent("register");
    markSlidesAsSeen();
  }, [markSlidesAsSeen]);

  const goToLogin = useCallback(() => {
    H.tap();
    setAuthIntent("login");
    markSlidesAsSeen();
  }, [markSlidesAsSeen]);

  const jumpToSlide = useCallback((index) => {
    H.select();
    setCurrentSlide(index);
    listRef.current?.scrollToIndex({ index, animated: true });
  }, []);

  const goToNextSlide = useCallback(() => {
    H.tap();
    const next = Math.min(currentSlide + 1, SLIDES_COUNT - 1);
    jumpToSlide(next);
  }, [currentSlide, jumpToSlide]);

  useEffect(() => {
    if (currentSlide >= SLIDES_COUNT - 1) return undefined;
    const timer = setTimeout(() => {
      jumpToSlide(currentSlide + 1);
    }, SLIDE_DURATION);
    return () => clearTimeout(timer);
  }, [currentSlide, jumpToSlide]);

  const onMomentumScrollEnd = useCallback((e) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    if (index !== currentSlide && index >= 0 && index < SLIDES_COUNT) {
      H.select();
      setCurrentSlide(index);
    }
  }, [currentSlide, width]);

  const renderSlide = useCallback(({ item }) => (
    <View style={{ width }}>
      {item === 0 ? (
        <OnboardingSlideItem
          tag="MARATON · KİŞİYE ÖZEL ROTA"
          title="Sınava giden yol bir rotaya dönüşür."
          description="Yüzlerce konuyu gün gün duraklara böldük. Ne çalışacağını düşünmezsin; rotan her sabah hazırdır."
          C={C}
        >
          <OnboardingSlideRoute C={C} />
        </OnboardingSlideItem>
      ) : item === 1 ? (
        <OnboardingSlideItem
          tag="GÜNLÜK RİTİM · DİSİPLİN"
          title="Her sabah kalktığında ne yapacağını bil."
          description="Gelişigüzel soru çözmek yok. Sistem zayıf olduğun konuları ve borçlarını otomatik olarak günün duraklarına yerleştirir."
          C={C}
        >
          <OnboardingSlideDaily C={C} />
        </OnboardingSlideItem>
      ) : (
        <OnboardingSlideItem
          tag="DİNAMİK TAHMİN · KALİBRASYON"
          title="Her denemede rotan yeniden hesaplansın."
          description="Netin düştüğünde sistem pes etmez; tempoyu anında günceller, eksiklerini tespit eder ve yeni rotayı çizer."
          C={C}
        >
          <OnboardingSlideForecast C={C} />
        </OnboardingSlideItem>
      )}
    </View>
  ), [width, C]);

  return (
    <SafeAreaView edges={["top", "bottom"]} style={[s.safe, { backgroundColor: C.bg }]}>
      <OnboardingAmbientGlow C={C} />
      <OnboardingPagination
        total={SLIDES_COUNT}
        current={currentSlide}
        duration={SLIDE_DURATION}
        onSelect={jumpToSlide}
        onSkip={createRoute}
        C={C}
      />
      <FlatList
        ref={listRef}
        data={[0, 1, 2]}
        keyExtractor={(item) => String(item)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        renderItem={renderSlide}
        style={s.list}
      />
      <OnboardingFooter
        isLastSlide={currentSlide === SLIDES_COUNT - 1}
        onNext={goToNextSlide}
        onStart={createRoute}
        onLogin={goToLogin}
        C={C}
      />
    </SafeAreaView>
  );
}

export default function OnboardingScreen() {
  return (
    <ScreenErrorBoundary>
      <OnboardingScreenInner />
    </ScreenErrorBoundary>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  list: { flex: 1 },
});
