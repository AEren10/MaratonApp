import { useCallback, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";

import { useC } from "../../../contexts/ThemeContext";
import { GUTTER, STEP } from "../../../themes/tokens";

// Grafik alani iki sayfa: "Bu hafta" (varsayilan) ve "Rota".
//
// NEDEN SAYFA, NEDEN UST USTE DEGIL
// Iki grafik iki ayri soruya cevap veriyor ve farkli siklikta bakiliyor:
// haftalik "bugun ilerledim mi" (her gun), rota "nereye gidiyorum" (haftada
// bir). Tek tuvale sikistirmak ikisini de kucultur.
//
// DOKUNMA AYRIMI
// Sayfa yatay kayiyor, sayfanin KENDISI de dokununca Rota detayina gidiyor.
// Pressable'i ScrollView'in ICINE koyuyoruz: RN'de kaydirma basladiginda
// icteki Pressable'in onPress'i iptal edilir, yani kaydirirken yanlislikla
// navigasyon tetiklenmez. Tersi (ScrollView'i Pressable icine koymak)
// kaydirmayi yutardi.
export function HomeChartPager({ pages = [], onPressPage, onPageChange, initialPage = 0 }) {
  const C = useC();
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(initialPage);
  const indexRef = useRef(initialPage);
  const pageWidth = Math.max(1, width - GUTTER * 2);

  // Yan etki setIndex guncelleyicisinin ICINDE olmamali: React guncelleyiciyi
  // iki kez calistirabilir ve onPageChange iki kez tetiklenir.
  const onMomentumEnd = useCallback((e) => {
    const raw = Math.round(e.nativeEvent.contentOffset.x / pageWidth);
    const next = Math.min(Math.max(0, raw), Math.max(0, pages.length - 1));
    if (next === indexRef.current) return;
    indexRef.current = next;
    setIndex(next);
    onPageChange?.(pages[next]?.key);
  }, [pageWidth, onPageChange, pages]);

  const visible = pages.filter(Boolean);
  if (!visible.length) return null;
  if (visible.length === 1) {
    return (
      <Pressable onPress={() => onPressPage?.(visible[0].key)} disabled={!onPressPage}>
        {visible[0].render()}
      </Pressable>
    );
  }

  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumEnd}
        contentOffset={{ x: initialPage * pageWidth, y: 0 }}
        decelerationRate="fast"
      >
        {visible.map((page) => (
          <Pressable
            key={page.key}
            style={{ width: pageWidth }}
            onPress={() => onPressPage?.(page.key)}
            disabled={!onPressPage}
            accessibilityRole="button"
            accessibilityLabel={page.a11y}
          >
            {page.render()}
          </Pressable>
        ))}
      </ScrollView>

      {/* Nokta gostergesi olmadan ikinci sayfa hic bulunmaz: dikey kayan bir
          sayfanin icinde yatay kaydirma kendiliginden kesfedilmiyor. */}
      <View style={s.dots} accessible accessibilityLabel={`${index + 1} / ${visible.length}`}>
        {visible.map((page, i) => (
          <View
            key={`dot-${page.key}`}
            style={[
              s.dot,
              { backgroundColor: i === index ? C.accent : C.text5 },
              i === index ? s.dotActive : null,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  dots: {
    flexDirection: "row", justifyContent: "center", alignItems: "center",
    gap: STEP.s1 - 2, marginTop: STEP.s1,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotActive: { width: 18 },
});
