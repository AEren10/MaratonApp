import { Chart, HStack, ProgressView, Spacer, Text, VStack } from "@expo/ui/swift-ui";
import { font, foregroundStyle, padding, tint } from "@expo/ui/swift-ui/modifiers";
import { createWidget } from "expo-widgets";

// ANA EKRAN WIDGET'I — "Bugün" (tasarim: Maraton Widget.dc.html, Widget 1).
//
// Tasarimin kurali: en fazla UC bilgi, tek kahraman oge etrafinda. Burada
// kahraman gunun sayisi; seri ve kalan soru ona destek. Hareket yok.
//
// RENKLER FONKSIYONUN ICINDE, TOKENDAN IMPORT DEGIL
// `'widget'` direktifi bu fonksiyonu ayri bir pakete cikarip dis kapsamla
// bagini kesiyor; modul govdesindeki bir sabit burada YOKTUR (cihazda
// "Can't find variable" ile patliyor). Kaymayi test yakaliyor:
// tests/widgets/weekWidgetPalette.test.mjs.
//
// Tasarim dosyasinin kendi paleti eski (#FF3B47/#0A0808). Duzen oradan,
// renkler uygulamanin canli tokenlarindan — yoksa widget baska bir
// uygulamadan gelmis gibi durur.

const TodayWidget = (props, environment) => {
  "widget";

  const accent = "#E5343F";
  const up = "#34D399";
  const text = "#F5F2EF";
  const text2 = "#A3A0A8";
  const text3 = "#9794A0";
  const track = "#33333A";

  const solved = Number(props?.solved) || 0;
  const goal = Number(props?.goal) || 0;
  const streak = Number(props?.streak) || 0;
  const nextStop = props?.nextStop || null;
  const days = Array.isArray(props?.days) ? props.days : [];
  const compact = environment?.widgetFamily === "systemSmall";

  const remaining = goal > 0 ? Math.max(0, goal - solved) : 0;
  const done = goal > 0 && remaining === 0;
  const ratio = goal > 0 ? Math.min(1, solved / goal) : 0;

  // Hedef tutunca kahraman satir yesile doner: gunun bittigini soyleyen tek
  // isaret bu, ayrica bir rozet eklemiyoruz.
  const barColor = done ? up : accent;

  // Genis boyda haftanin cubuklari da var: kucuk boyla arasindaki fark tek
  // satir olmasin, genislik bir ise yarasin. Gunun kendisi vurgulu, digerleri
  // soluk -- widget'in kahramani bugunun sayisi, hafta destek.
  // BOS HAFTADA DA CIZILIR.
  // Once "veri yoksa cizme" demistim; sonuc: hic soru cozulmemis haftada
  // genis boy kucuk boydan farksiz kaliyordu. Uygulamadaki grafikte bunun
  // icin hayalet kutular var, widget'ta da olmali. Calisilmamis gun en
  // kucuk degeri alip track renginde duruyor: yerini gosteriyor, dolu
  // gibi gorunmuyor.
  const peak = days.reduce((max, d) => Math.max(max, Number(d.questions) || 0), 0);
  const ghost = Math.max(1, Math.round(peak * 0.06));
  const weekData = days.map((day) => {
    const q = Number(day.questions) || 0;
    return { x: day.label, y: q > 0 ? q : ghost, color: q > 0 ? accent : track };
  });

  return (
    <VStack modifiers={[padding({ all: compact ? 14 : 16 })]}>
      <HStack>
        <Text modifiers={[font({ size: 9.5, weight: "bold" }), foregroundStyle(accent)]}>
          BUGÜN
        </Text>
        <Spacer />
        {streak > 0 ? (
          <Text modifiers={[font({ size: 10, weight: "semibold" }), foregroundStyle(text3)]}>
            {`${streak} gün seri`}
          </Text>
        ) : null}
      </HStack>

      <Spacer />

      <HStack>
        <Text modifiers={[font({ size: compact ? 50 : 44 }), foregroundStyle(text)]}>
          {String(solved)}
        </Text>
        {goal > 0 ? (
          <Text modifiers={[font({ size: 15, weight: "semibold" }), foregroundStyle(text3)]}>
            {` /${goal}`}
          </Text>
        ) : null}
        <Spacer />
      </HStack>

      <Spacer />

      {goal > 0 ? (
        <VStack>
          <ProgressView value={ratio} modifiers={[tint(barColor)]} />
          <HStack>
            <Text modifiers={[font({ size: 11.5, weight: "medium" }), foregroundStyle(text2)]}>
              {done ? "Günlük hedef tamam" : `${remaining} soru kaldı`}
            </Text>
            <Spacer />
          </HStack>
        </VStack>
      ) : (
        <HStack>
          <Text modifiers={[font({ size: 11.5, weight: "medium" }), foregroundStyle(text2)]}>
            Günlük hedefini koy
          </Text>
          <Spacer />
        </HStack>
      )}

      {/* Orta boy: siradaki durak ve haftanin cubuklari. */}
      {!compact && nextStop ? (
        <HStack>
          <Text modifiers={[font({ size: 11, weight: "medium" }), foregroundStyle(accent)]}>
            {`sıradaki · ${nextStop}`}
          </Text>
          <Spacer />
        </HStack>
      ) : null}

      {!compact && weekData.length ? (
        <Chart
          data={weekData}
          type="bar"
          showGrid={false}
          showLegend={false}
          animate={false}
          barStyle={{ cornerRadius: 2 }}
        />
      ) : null}
    </VStack>
  );
};

export default createWidget("MaratonToday", TodayWidget);
