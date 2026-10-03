import { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ScreenErrorBoundary } from "../../components/common/ScreenErrorBoundary";
import { Icon } from "../../components/design/Icon";
import { Press } from "../../components/design/Press";
import { useAuth } from "../../contexts/AuthContext";
import { useC } from "../../contexts/ThemeContext";
import { SCREENS } from "../../constants/screens";
import { FEATURES } from "../../constants/features";
import { CONTROL, GUTTER, NAV_ICON, STEP, TYPOGRAPHY } from "../../themes/tokens";
import { GroupsTab } from "./GroupsTab";
import { LeagueBoard } from "./LeagueBoard";
import { LeagueSegment } from "./components/LeagueSegment";

// Gruplar · Arkadaslar (· Genel Lig, bayrakla). Eski adi "Sosyal" merkezdi;
// ekran kalin bir kabuk: baslik + segment + secili sekmenin govdesi.
const TABS = [
  { key: "groups", label: "Gruplar" },
  { key: "friends", label: "Arkadaşlar" },
  ...(FEATURES.globalLeague ? [{ key: "global", label: "Genel Lig" }] : []),
];

const SUBTITLE = {
  groups: "Birlikte çalış, haftayı birlikte kapat.",
  friends: "Arkadaşlarınla haftalık soru sıralaması.",
  global: "Bu hafta en çok soru çözenler.",
};

function LeagueScreenInner() {
  const navigation = useNavigation();
  const route = useRoute();
  const C = useC();
  const { user } = useAuth();
  const allowed = useMemo(() => new Set(TABS.map((t) => t.key)), []);
  const pick = (key) => (allowed.has(key) ? key : "groups");
  const [tab, setTab] = useState(pick(route.params?.tab));

  useEffect(() => {
    if (route.params?.tab) setTab(pick(route.params.tab));
    else if (route.params?.groupCode) setTab("groups");
  }, [route.params?.tab, route.params?.groupCode]); // eslint-disable-line react-hooks/exhaustive-deps

  const goInvite = () => navigation.navigate(SCREENS.REFERRAL);

  return (
    <SafeAreaView edges={["top"]} style={[s.safe, { backgroundColor: C.bg }]}>
      <View style={s.header}>
        <Press haptic="none" onPress={() => navigation.goBack()} hitSlop={8} accessibilityLabel="Geri" style={s.iconBtn}>
          <Icon name="arrowL" size={NAV_ICON.back} color={C.text2} />
        </Press>
        <Press haptic="none" onPress={goInvite} hitSlop={8} accessibilityLabel="Arkadaşını davet et" style={s.iconBtn}>
          <Icon name="users" size={NAV_ICON.action} color={C.text2} />
        </Press>
      </View>
      <View style={s.titleBlock}>
        <Text style={[TYPOGRAPHY.display, { color: C.text }]}>Birlikte</Text>
        <Text style={[TYPOGRAPHY.caption, { color: C.text3 }]}>{SUBTITLE[tab]}</Text>
      </View>

      <LeagueSegment tabs={TABS} value={tab} onChange={setTab} />

      {tab === "groups" ? (
        <GroupsTab user={user} initialGroupCode={route.params?.groupCode} />
      ) : (
        <LeagueBoard
          key={tab}
          user={user}
          kind={tab}
          onAddFriend={() => navigation.navigate(SCREENS.FRIENDS)}
          onInvite={goInvite}
          onCompanion={() => navigation.navigate(SCREENS.ROUTE_COMPANION)}
        />
      )}
    </SafeAreaView>
  );
}

export default function LeagueScreen() {
  return (
    <ScreenErrorBoundary>
      <LeagueScreenInner />
    </ScreenErrorBoundary>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: GUTTER - 10,
    minHeight: CONTROL.tapMin,
  },
  iconBtn: { minWidth: CONTROL.tapMin, minHeight: CONTROL.tapMin, alignItems: "center", justifyContent: "center" },
  titleBlock: { paddingHorizontal: GUTTER, paddingTop: STEP.s1, paddingBottom: STEP.s3, gap: 4 },
});
