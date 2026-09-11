import { View, Text, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Icon, LockedValue } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { STEP, GUTTER, SHAPE } from "../../../themes/tokens";
import { SCREENS } from "../../../constants/screens";
import { useThresholdView } from "../../../hooks/useThresholdView";
import * as H from "../../../lib/haptics";

// GoalsScreen'e baglaniyor: hedef net oradan duzenleniyor ve band notu
// hedef bolume gore ciziliyor.
//
// DIKKAT: uygulamada bolum SECICI yok. target_department yazilabilir bir
// kolon ama onu degistiren bir arayuz hicbir yerde bulunmuyor (grep ile
// dogrulandi: yalniz okunuyor/gosteriliyor). Bu kartin eski yorumu var
// olmayan bir seciciye isaret ediyordu. Secici yazilinca hedef burasi.
export function TargetDepartmentCard({ targetDepartment }) {
  const C = useC();
  const nav = useNavigation();
  const { gapResult, canAccess, requestAccess } = useThresholdView();

  if (!targetDepartment) return null;

  const metaText = gapResult
    ? (gapResult.reached ? "Hedefi geçtin · bölümleri gör" : null)
    : null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Hedef bölüm"
      onPress={() => { H.tap(); nav.navigate(SCREENS.GOALS); }}
      style={({ pressed }) => ({
        flexDirection: "row", alignItems: "center", gap: STEP.s2,
        marginHorizontal: GUTTER, marginTop: STEP.s3,
        padding: STEP.s2 + STEP.s1,
        borderRadius: SHAPE.panel,
        backgroundColor: C.brandTint,
        borderWidth: 1, borderColor: C.bandEdge,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontFamily: "Archivo_600", fontSize: 11, letterSpacing: 2, color: C.accentBright }}>
          HEDEF BÖLÜM
        </Text>
        <Text style={{ fontFamily: "Bricolage_400", fontSize: 17, color: C.text, marginTop: 7 }} numberOfLines={1}>
          {targetDepartment}
        </Text>
        {metaText ? (
          <Text style={{ fontFamily: "Archivo_500", fontSize: 11.5, color: C.text3, marginTop: 5 }}>
            {metaText}
          </Text>
        ) : !gapResult ? null : (
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4, marginTop: 5 }}>
            <LockedValue
              value={`${gapResult.gap} net kaldı`}
              locked={!canAccess}
              variant="micro"
              onPress={requestAccess}
              label="Net açığı Pro ile açılır"
            />
            {canAccess ? (
              <Text style={{ fontFamily: "Archivo_500", fontSize: 11.5, color: C.text3 }}>· bölümleri gör</Text>
            ) : null}
          </View>
        )}
      </View>
      <Icon name="chevR" size={16} color={C.text3} />
    </Pressable>
  );
}
