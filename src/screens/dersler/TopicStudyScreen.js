import React, { useMemo, useState } from "react";
import { View, ScrollView, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Icon, Button, ErrorState } from "../../components/design";
import { STEP, GUTTER } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { SCREENS } from "../../constants/screens";
import { getSubjectByKey } from "../../themes/subjects";
import { subjectColorOf } from "../../themes/subjectPalette";
import { useTopicStudyDetail } from "../../hooks/useTopicStudyDetail";
import { TopicNoteCard } from "./components/TopicNoteCard";
import { TopicHeroHeader } from "./components/TopicHeroHeader";
import { TopicStatsRow } from "./components/TopicStatsRow";
import { TopicAccumulationChart } from "./components/TopicAccumulationChart";
import { TopicMasteryRing } from "./components/TopicMasteryRing";
import { TopicStudyTip } from "./components/TopicStudyTip";
import { TopicInfoList } from "./components/TopicInfoList";
import { TopicSubtopicsList } from "./components/TopicSubtopicsList";
import { TopicWrongNotesList } from "./components/TopicWrongNotesList";
import { TopicStudySkeleton } from "./components/TopicStudySkeleton";
import { useAuth } from "../../contexts/AuthContext";
import { useAlert } from "../../contexts/AlertContext";
import { saveStudyLogOffline } from "../../lib/offlineQueue";
import * as H from "../../lib/haptics";
import { todayTR } from "../../lib/dateUtils";

function formatLastStudied(dateStr) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
    if (diff === 0) return "Bugün";
    if (diff === 1) return "Dün";
    if (diff < 7) return `${diff} gün önce`;
    return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
  } catch {
    return null;
  }
}

export default function TopicStudyScreen() {
  const navigation = useNavigation();
  const C = useC();
  const route = useRoute();
  const { user } = useAuth();
  const showAlert = useAlert();

  // İKİ PARAMETRE ŞEKLİ destekleniyor: { topic, subject } ve { subjectKey, topicName }.
  const params = route.params ?? {};
  const { subtopics: paramSubtopics } = params;

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
  const mastery = (topic?.acc || 0) / 100;
  const [completing, setCompleting] = useState(false);

  const { loading, error, refetch, totalDurationLabel, chart, wrongList, lastStudyDate } =
    useTopicStudyDetail({ userId: user?.id, subjectKey: subject?.key, topicName: topic?.name });

  const subtopics = (paramSubtopics || []).map((name, i) => ({
    name,
    done: i < Math.floor((paramSubtopics?.length || 0) * mastery),
  }));

  const handleMarkComplete = async () => {
    if (!user?.id || user.id === "dev") return;
    setCompleting(true);
    try {
      await saveStudyLogOffline({
        user_id: user.id, subject: subject?.key, topic: topic?.name,
        question_count: 0, correct_count: 0, duration_minutes: 0, study_date: todayTR(),
      });
      H.success();
      showAlert("Tamamlandı", "Bu konu çalışıldı olarak işaretlendi.");
    } catch {
      showAlert("Hata", "İşaretleme başarısız oldu.");
    } finally {
      setCompleting(false);
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={[s.safe, { backgroundColor: C.bg }]}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Icon name="arrowL" size={22} color={C.text} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <TopicHeroHeader subjectName={subject?.name} color={color} topicName={topic?.name} />

        {error ? (
          <ErrorState preset="server" onPrimary={refetch} style={{ marginTop: STEP.s4 }} />
        ) : loading ? (
          <TopicStudySkeleton />
        ) : (
          <>
            <TopicStatsRow solved={topic?.q || 0} durationLabel={totalDurationLabel} notebookCount={wrongList.length} />
            <TopicAccumulationChart chart={chart} color={color} />
            <TopicMasteryRing q={topic?.q || 0} acc={topic?.acc || 0} color={color} />
            <TopicStudyTip mastery={mastery} q={topic?.q || 0} studyCount={topic?.studyCount || 0} color={color} />
            {subject?.key ? <TopicNoteCard subjectKey={subject.key} topicName={topic.name} /> : null}
            <TopicInfoList
              durationLabel={totalDurationLabel}
              pendingCount={wrongList.length}
              lastLabel={formatLastStudied(topic?.last || lastStudyDate)}
            />
            <TopicSubtopicsList items={subtopics} color={color} />
            <TopicWrongNotesList items={wrongList} />
          </>
        )}

        <Button onPress={() => navigation.navigate(SCREENS.STUDY_TIMER, { subjectKey: subject?.key, topicName: topic?.name })} icon="play" fullWidth style={{ marginTop: STEP.s4 }}>
          Çalışmaya Başla
        </Button>
        <Button onPress={handleMarkComplete} disabled={completing} variant="outline" icon="check" fullWidth style={{ marginTop: STEP.s2 }}>
          Konuyu Tamamla
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: GUTTER, paddingVertical: STEP.s2 },
  scroll: { paddingHorizontal: GUTTER, paddingBottom: 100 },
});
