import { Text as SvgText } from "react-native-svg";

// Sol eksenin net etiketleri (50, 60, 70). Haftalik grafigin sol ekseniyle
// ayni dil: text4, 11px, sagdan hizali.
export function RouteTickLabels({ ticks, x, C }) {
  return ticks.map((t) => (
    <SvgText key={`tl-${t.val}`} x={x} y={t.y + 3.5} fill={C.text4} fontSize={11} textAnchor="end">
      {t.val}
    </SvgText>
  ));
}
