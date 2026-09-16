import React, { useMemo, useState } from "react";
import { View, ScrollView, Pressable, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Icon, Button, ErrorState } from "../../components/design";
import { STEP, GUTTER, TYPOGRAPHY, SHAPE } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { SCREENS } from "../../constants/screens";
import { getSubjectByKey } from "../../themes/subjects";
import { subjectColorOf } from "../../themes/subjectPalette";
import { useTopicStudyDetail } from "../../hooks/useTopicStudyDetail";
import { TopicHeroHeader } from "./components/TopicHeroHeader";
import { TopicStatsRow } from "./components/TopicStatsRow";
import { TopicAccumulationChart } from "./components/TopicAccumulationChart";
import { TopicInfoList } from "./components/TopicInfoList";
import { TopicWrongNotesList } from "./components/TopicWrongNotesList";
import { TopicStudySkeleton } from "./components/TopicStudySkeleton";
import { useAuth } from "../../contexts/AuthContext";
import { useAlert } from "../../contexts/AlertContext";
import { saveStudyLogOffline } from "../../lib/offlineQueue";
import * as H from "../../lib/haptics";

export default function TopicStudyScreen() {
  const navigation = useNavigation();
  const C = useC();
  const route = useRoute();

  const params = route.params ?? {};
  const subject = useMemo(() => {
    if (params.subject) return params.subject;
    const key = params.subjectKey;
    if (!key) return null;
    const found = getSubjectByKey(key);
    return found ? { key, name: found.label, icon: found.icon } : { key, name: key, icon: "bookOpen" };
  }, [params.subject, params.subjectKey]);

  const topic = useMemo(() => {
    if (params.topic) return params.topic;
    const name = params.topicName;
    return name ? { name } : null;
  }, [params.topic, params.topicName]);

  const color = subjectColorOf(C, subject?.key);

  const { data, loading, error, refresh } = useTopicStudyDetail(subject?.key, topic?.name);

  // Tasarım (Image 2) için statik başlık meta eklendi
  return (
    <SafeAreaView edges={["top"]} style={[s.safe, { backgroundColor: C.bg }]}>
      <View style={s.headerBar}>
        <Pressable hitSlop={10} onPress={() => navigation.goBack()} style={s.iconBtn}>
          <Icon name="chevL" size={16} color={C.text} />
        </Pressable>
        <Text style={[TYPOGRAPHY.metaSemiBold, s.headerMeta, { color: C.text3 }]}>KONU DETAYI</Text>
        <Pressable hitSlop={10} style={s.iconBtn}>
          <Icon name="moreVertical" size={20} color={C.text} />
        </Pressable>
      </View>

      {loading ? (
        <TopicStudySkeleton C={C} />
      ) : error ? (
        <ErrorState preset="server" onPrimary={refresh} style={{ marginTop: STEP.s5 }} />
      ) : (
        <>
          <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
            <TopicHeroHeader C={C} subject={subject} topic={topic} color={color} />
            <TopicStatsRow C={C} data={data} />
            <TopicAccumulationChart C={C} color={color} data={data} />
            <TopicInfoList C={C} data={data} />
            <TopicWrongNotesList C={C} data={data} subjectKey={subject?.key} />
          </ScrollView>

          <View style={[s.bottom, { backgroundColor: C.bg }]}>
            <Button variant="primary" size="lg" fullWidth>
              Bu konuya durak koy
            </Button>
            <Text style={[TYPOGRAPHY.meta, { color: C.text3, textAlign: "center", marginTop: STEP.s2 }]}>
              Defterdeki 5 soruyu tekrar et
            </Text>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  headerBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: GUTTER - STEP.s1, paddingTop: STEP.s1, paddingBottom: STEP.s2 },
  iconBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  headerMeta: { flex: 1, textAlign: "center", letterSpacing: 1.5, opacity: 0.5 },
  content: { paddingHorizontal: GUTTER, paddingBottom: 140 },
  bottom: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: GUTTER, paddingBottom: STEP.s4, paddingTop: STEP.s3 },
});
