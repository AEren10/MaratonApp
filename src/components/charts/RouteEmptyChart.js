import { StyleSheet, View } from "react-native";
import Svg, { Circle, Path, Text as SvgText } from "react-native-svg";

import { useC } from "../../contexts/ThemeContext";
import {
  CHART_W, CHART_H, PAD_LEFT, PAD_RIGHT, PAD_TOP,
  NODE, STROKE, LABEL, VALUE, plotBottom, axisAnchor,
} from "./chartStyle";

// Olculmus tahmin yokken cizilen hat. Iki ucu biliyoruz: kullanici kurulumda
// baslangic ve hedef netini kendi girdi. Hat KESIKLI — hicbir sey olculmedi,
// kirilim de yok, cunku arada veri noktasi yok.
//
// Gorunum RouteLineChart ile AYNI dilde: ayni tuval orani, ayni dugum
// yaricaplari, ayni etiket olculeri, ayni tarih seridi. Eski hali kendi
// olculerini kullaniyordu ve yan yana konunca baska bir uygulamadan gelmis
// gibi duruyordu. Izgara cizgileri de kaldirildi — olculmus grafikte yok.
export function RouteEmptyChart({ examDateTag, declared, axisLabels, emptyLabel = "HENÜZ TAHMİN YOK" }) {
  const C = useC();
  const hasAxis = Array.isArray(axisLabels) && axisLabels.some(Boolean);
  const bottom = plotBottom({ hasAxis });

  // Hat asagidan yukari. Olcum olmadigi icin gercek bir y degeri yok;
  // bunlar yalnizca CIZIM konumu, uzerlerine sayi yazilmaz.
  const x0 = PAD_LEFT;
  const y0 = bottom - 16;
  const x1 = CHART_W - PAD_RIGHT;
  // Tasarimda hattin ucu tuvalin EN USTUNE kadar cikiyor. Etiket artik
  // dugumun ustunde degil solunda durdugu icin yukarida yer kaldi.
  const y1 = PAD_TOP - 8;
  const cx1 = x0 + (x1 - x0) * 0.42;
  const cy1 = y0 - (y0 - y1) * 0.12;
  const cx2 = x0 + (x1 - x0) * 0.72;
  const cy2 = y1 + (y0 - y1) * 0.34;

  // "HEDEF 60" — olculmus grafikteki "TAHMİN 71" ile ayni kalip.
  const goalNumber = declared?.goalLabel ? declared.goalLabel.replace(/\s*net$/i, "") : null;
  const goalText = goalNumber ? `HEDEF ${goalNumber}` : (examDateTag ? null : emptyLabel);

  return (
    <View
      style={s.wrap}
      accessible
      accessibilityLabel={declared?.summary
        ? `Rota: ${declared.startLabel || "başlangıç bilinmiyor"} → ${declared.goalLabel || "hedef yok"}. ${declared.summary}`
        : "Net grafiği: henüz veri yok."}
    >
      <Svg width="100%" height="100%" viewBox={`0 0 ${CHART_W} ${CHART_H}`}>
        <Path
          d={`M${x0},${y0} C${cx1},${cy1} ${cx2},${cy2} ${x1},${y1}`}
          fill="none"
          stroke={C.proj}
          strokeWidth={STROKE.proj}
          strokeLinecap="round"
          strokeDasharray={STROKE.projDash}
        />

        <Circle cx={x0} cy={y0} r={NODE.todayGlow} fill={C.accent} fillOpacity={0.18} />
        <Circle cx={x0} cy={y0} r={NODE.today} fill={C.accent} />
        <Circle
          cx={x1} cy={y1} r={NODE.end}
          fill={C.bg} stroke={C.projNode} strokeWidth={STROKE.endNode}
        />

        {declared?.startLabel ? (
          <SvgText
            x={x0 + 13} y={y0 - 12}
            fill={C.text} fontSize={VALUE.size} fontWeight={VALUE.weight}
          >
            {declared.startLabel}
          </SvgText>
        ) : null}
        <SvgText
          x={x0 + 13} y={y0 + 20}
          fill={C.accentBright}
          fontSize={LABEL.size} fontWeight={LABEL.weight} letterSpacing={LABEL.tracking}
        >
          BUGÜN
        </SvgText>

        {/* Tasarimda uc etiketi TEK SATIR ve dugumun SOL ALTINDA:
            "TAHMİN 71" gibi. Burada karsiligi "HEDEF 60". */}
        {goalText ? (
          <SvgText
            x={x1 - 14} y={y1 + 26}
            fill={declared?.goalLabel ? C.text2 : C.text4}
            fontSize={LABEL.size} fontWeight={LABEL.weight} letterSpacing={LABEL.tracking}
            textAnchor="end"
          >
            {goalText}
          </SvgText>
        ) : null}

        {hasAxis ? axisLabels.map((label, i) => {
          if (!label) return null;
          const { x, anchor } = axisAnchor(i, axisLabels.length);
          return (
            <SvgText
              key={`axis-${i}`}
              x={x} y={CHART_H - 6}
              fill={C.text4} fontSize={LABEL.size} fontWeight="500" textAnchor={anchor}
            >
              {label}
            </SvgText>
          );
        }) : null}

        {!hasAxis && examDateTag ? (
          <SvgText
            x={CHART_W - PAD_RIGHT} y={PAD_TOP - 8}
            fill={C.text2} fontSize={LABEL.size} fontWeight={LABEL.weight}
            letterSpacing={LABEL.tracking} textAnchor="end"
          >
            {examDateTag}
          </SvgText>
        ) : null}
      </Svg>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { width: "100%", aspectRatio: CHART_W / CHART_H },
});
