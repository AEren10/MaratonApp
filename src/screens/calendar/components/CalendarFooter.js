import { Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Button, Icon } from "../../../components/design";
import { SCREENS } from "../../../constants/screens";
import { useC } from "../../../contexts/ThemeContext";
import { TAB_KEYS } from "../../../navigation/tabAssignment";
import { openInTab } from "../../../navigation/tabJump";
import { CONTROL, SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import UpcomingDates from "./UpcomingDates";

// Takvim ve Seri alt bolumu: seri kurali notu, yaklasan tarihler,
// "Bugüne durak ekle" ve "Çalışma geçmişini aç".
export function CalendarFooter({ tasksByDate }) {
  const C = useC();
  const navigation = useNavigation();
  return (
    <>
      <Text style={[TYPOGRAPHY.meta, s.block, { color: C.text3 }]}>
        Bir oturum bile seriyi sürdürür. Dondurulan gün seriyi bozmaz, hedefe de yazılmaz.
      </Text>
      <UpcomingDates tasksByDate={tasksByDate} />
      <View style={s.block}>
        <Button variant="primary" size="lg" fullWidth onPress={() => navigation.navigate(SCREENS.ADD_TASK)}>
          Bugüne durak ekle
        </Button>
      </View>
      <Pressable
        onPress={() => openInTab(navigation, TAB_KEYS.PROFIL, SCREENS.STUDY_HISTORY)}
        accessibilityRole="button"
        style={({ pressed }) => [s.link, { backgroundColor: pressed ? C.elev : C.surface, borderColor: C.elev }]}
      >
        <Text style={[TYPOGRAPHY.captionMedium, s.flex, { color: C.text2 }]}>Çalışma geçmişini aç</Text>
        <Icon name="chevR" size={12} color={C.text5} />
      </Pressable>
    </>
  );
}

const s = StyleSheet.create({
  block: { marginTop: STEP.s3 },
  flex: { flex: 1 },
  link: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
    minHeight: CONTROL.buttonPrimary,
    paddingHorizontal: STEP.s2 + 4,
    marginTop: STEP.s2 + 2,
    borderRadius: SHAPE.cardTight,
    borderWidth: 1,
  },
});
