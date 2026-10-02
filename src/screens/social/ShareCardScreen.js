import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";

import { useC } from "../../contexts/ThemeContext";
import { Icon } from "../../components/design";
import { Press } from "../../components/design/Press";
import ScreenErrorBoundary from "../../components/common/ScreenErrorBoundary";
import { StoryShareBlock } from "../../components/share/StoryShareBlock";
import { STORY_MOMENT } from "../../domain/share/storySticker";
import { STEP, CONTROL, TYPOGRAPHY } from "../../themes/tokens";

function ShareCardScreen() {
  const C = useC();
  const nav = useNavigation();
  const { params } = useRoute();

  return (
    <SafeAreaView edges={["top"]} style={[s.safe, { backgroundColor: C.bg }]}>
      {/* Strava stili baslik cubugu */}
      <View style={[s.header, { borderBottomColor: C.line }]}>
        <Press haptic="none" onPress={() => nav.goBack()} hitSlop={12} style={s.closeBtn}>
          <Icon name="x" size={18} color={C.text} />
        </Press>
        <Text style={[TYPOGRAPHY.subheading, s.title, { color: C.text }]}>Aktiviteyi Paylaş</Text>
        <View style={s.spacer} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <StoryShareBlock moment={params?.moment || STORY_MOMENT.GENERIC} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: STEP.s3,
    paddingVertical: STEP.s2,
    borderBottomWidth: 1,
  },
  closeBtn: {
    width: CONTROL.tapMin,
    height: CONTROL.tapMin,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
  },
  title: { fontFamily: "Bricolage_400", fontSize: 20 },
  spacer: { width: CONTROL.tapMin },
  content: { flexGrow: 1, paddingBottom: STEP.s4 },
});

export default ScreenErrorBoundary(ShareCardScreen, "ShareCardScreen");
