import { useCallback, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { useC } from "../../../contexts/ThemeContext";
import { GUTTER, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { Press } from "../../../components/design/Press";

// Grafik alani sayfalari ("Bu hafta" varsayilan, "Rota", "Denemeler").
// Iki grafik iki ayri soruya cevap verir; cumle sayfanin icinde durur ki
// sayfalar esit yukseklikte kalsin. Pressable ScrollView'in ICINDE:
// kaydirma baslayinca onPress iptal olur, yanlislikla navigasyon olmaz.
export function HomeChartPager({ pages = [], onPressPage, onPageChange, initialPage = 0 }) {
  const C = useC();
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(initialPage);
  // Sayfa icerigi ILK KEZ gorunurken kurulur: grafikler kendini acilista
  // ciziyor; ikinci sayfa ekran disinda cizilip bitiyordu, kullanici hic
  // gormuyordu. Gorulmemis sayfa ilk sayfanin yuksekliginde bos yer tutar.
  const [seen, setSeen] = useState(() => new Set([initialPage]));
  // Sayfa ilk gorundugunde kurulur ve KURULU KALIR. Eskiden her geliste yeni
  // anahtarla sokulup yeniden kuruluyordu (kaydirmada takilma, 4 Ekim).
  const candRef = useRef(initialPage);
  const [firstH, setFirstH] = useState(0);
  const indexRef = useRef(initialPage);
  const pageWidth = Math.max(1, width - GUTTER * 2);

  // Gorunen sayfalar uzerinden sayilir: `pages` icinde kosullu (null) bir
  // sayfa varsa indeks ile anahtar kayar ve yanlis sayfa bildirilir.
  const visible = pages.filter(Boolean);
  const hasFooter = visible.some((page) => page.caption || page.renderFooter);

  // Yan etki setIndex guncelleyicisinin ICINDE olmamali: React guncelleyiciyi
  // iki kez calistirabilir ve onPageChange iki kez tetiklenir.
  const onMomentumEnd = useCallback((e) => {
    const raw = Math.round(e.nativeEvent.contentOffset.x / pageWidth);
    const next = Math.min(Math.max(0, raw), Math.max(0, visible.length - 1));
    if (next === indexRef.current) return;
    indexRef.current = next;
    setIndex(next);
    onPageChange?.(visible[next]?.key);
  }, [pageWidth, onPageChange, visible]);

  // Siradaki sayfanin %30'u gorununce kur: cizim sayfa ekrana girerken baslar.
  const onScroll = useCallback((e) => {
    const pos = e.nativeEvent.contentOffset.x / pageWidth;
    const cand = Math.min(visible.length - 1, pos % 1 > 0.3 ? Math.ceil(pos) : Math.floor(pos));
    if (cand !== candRef.current) {
      candRef.current = cand;
      setSeen((prev) => (prev.has(cand) ? prev : new Set(prev).add(cand)));
    }
  }, [pageWidth, visible.length]);

  const body = (page) => (
    <>
      {page.render()}
      {page.renderFooter ? (
        page.renderFooter()
      ) : hasFooter ? (
        <View style={s.captionWrap}>
          <Text style={[TYPOGRAPHY.body, s.caption, { color: C.text2 }]}>
            {page.caption || ""}
          </Text>
        </View>
      ) : null}
    </>
  );

  if (!visible.length) return null;
  if (visible.length === 1) {
    return (
      <Press haptic="none" onPress={() => onPressPage?.(visible[0].key)} disabled={!onPressPage}>
        {body(visible[0])}
      </Press>
    );
  }

  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumEnd}
        onScroll={onScroll}
        scrollEventThrottle={32}
        contentOffset={{ x: initialPage * pageWidth, y: 0 }}
        decelerationRate="fast"
      >
        {visible.map((page, i) => (
          <Press haptic="none"
            key={page.key}
            style={{ width: pageWidth }}
            onPress={() => onPressPage?.(page.key)}
            disabled={!onPressPage}
            accessibilityRole="button"
            accessibilityLabel={page.a11y}
            onLayout={i === 0 ? (e) => setFirstH(e.nativeEvent.layout.height) : undefined}
          >
            {seen.has(i) ? <View>{body(page)}</View> : <View style={{ height: firstH }} />}
          </Press>
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
      {/* Grafige dokununca detay aciliyor ama bunu soyleyen bir sey yoktu. */}
      {visible[index]?.hint ? <Text style={[TYPOGRAPHY.meta, s.hint, { color: C.text3 }]}>{visible[index].hint}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  // Cumle yoksa da satir yer tutar: sayfalar ayni yukseklikte kalsin.
  captionWrap: {
    marginTop: STEP.s2,
    minHeight: STEP.s5,
    justifyContent: "center",
  },
  caption: { minHeight: TYPOGRAPHY.body.lineHeight },
  dots: {
    flexDirection: "row", justifyContent: "center", alignItems: "center",
    gap: STEP.s1 - 2, marginTop: STEP.s1,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  hint: { textAlign: "center", marginTop: STEP.s1 },
  dotActive: { width: 18 },
});
