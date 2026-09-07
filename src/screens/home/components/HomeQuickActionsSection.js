import { View } from "react-native";

import { SectionLabel } from "../../../components/design";
import { SCREENS } from "../../../constants/screens";
import { trackButtonTap } from "../../../lib/analytics";
import { SPACING } from "../../../themes/tokens";
import { RoundActions } from "./RoundActions";

export function HomeQuickActionsSection({
  actions,
  checkFeature,
  navigation,
  showPaywall,
}) {
  return (
    <View style={{ marginTop: SPACING.xxl }}>
      <SectionLabel>HIZLI İŞLEM</SectionLabel>
      <RoundActions
        items={actions.primary}
        secondaryItems={actions.secondary}
        onPress={(action) => {
          if (!action.go) return;
          trackButtonTap(action.analyticsId || "home_quick_action", { targetScreen: action.go });
          if (action.go === SCREENS.EXAM_SIMULATOR && !checkFeature("exam_simulator")) {
            showPaywall("home_quick_simulator");
            return;
          }
          navigation.navigate(action.go);
        }}
      />
    </View>
  );
}
