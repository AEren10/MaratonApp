import { memo } from "react";
import { View, StyleSheet } from "react-native";

import SegmentTabs from "./SegmentTabs";
import { GUTTER, STEP } from "../../themes/tokens";

// IKI EKRANI TEK BOLUM GIBI GOSTEREN GECIS.
//
// Ayri ekranlar, ama ogrenci icin ayni sekmenin iki yuzu. Ust uste segment
// koyuyoruz ve secim navigasyona donuyor; ikisi de AYNI segmenti tasidigi
// icin gecis cift yonlu oluyor. Tek yonlu oldugunda (Mufredat -> Programim)
// ogrenci geri donmek icin sekmeye basip bastan basliyordu.
function SectionSwitchBase({ options, value, onChange }) {
  return (
    <View style={s.wrap}>
      <SegmentTabs options={options} value={value} onChange={onChange} />
    </View>
  );
}

export const SectionSwitch = memo(SectionSwitchBase);

const s = StyleSheet.create({
  wrap: { paddingHorizontal: GUTTER, marginBottom: STEP.s2 },
});
