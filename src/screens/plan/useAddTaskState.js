import { useState, useMemo, useEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useUserTasks } from "../../hooks/useUserTasks";
import { useAlert } from "../../contexts/AlertContext";
import { useExam } from "../../contexts/ExamContext";
import { useStudyRoute } from "../../hooks/useStudyRoute";
import * as H from "../../lib/haptics";
import {
  addTaskSubjectGroups,
  resolveAddTaskSubject,
  getTopicsForSubject,
  parseDurationMinutes,
} from "./addTaskOptions";

export function useAddTaskState() {
  const navigation = useNavigation();
  const route = useRoute();
  const { createTask } = useUserTasks();
  const showAlert = useAlert();
  const { examType, field } = useExam();
  const { routeCreated, createRoute } = useStudyRoute({ persist: false });

  const groups = useMemo(() => addTaskSubjectGroups(examType, field), [examType, field]);
  const paramKey = resolveAddTaskSubject(groups, route.params?.subjectKey || route.params?.preSubject);
  const tabOf = (key) => groups.find((g) => g.subjects.some((x) => x.key === key))?.key || groups[0].key;
  const [examTab, setExamTab] = useState(() => tabOf(paramKey));
  const subjects = (groups.find((g) => g.key === examTab) || groups[0]).subjects;

  const [subjectKey, setSubjectKey] = useState(paramKey || subjects[0]?.key || "matematik");
  const currentTopics = useMemo(() => getTopicsForSubject(subjectKey), [subjectKey]);

  const [topicName, setTopicName] = useState(route.params?.topicName || currentTopics[0] || "Genel çalışma");
  const [durVal, setDurVal] = useState("50 dk");
  const [pickerOpen, setPickerOpen] = useState(false);

  const selectedSubjectObj = groups.flatMap((g) => g.subjects).find((s) => s.key === subjectKey) || subjects[0];

  // Sinav bilgisi ekran acildiktan sonra yuklenirse (ya da degisirse) secili
  // ders yeni gruplarda olmayabilir: kayitta anahtar ile ad celismesin.
  useEffect(() => {
    if (groups.some((g) => g.subjects.some((x) => x.key === subjectKey))) return;
    const next = paramKey || groups[0].subjects[0]?.key;
    if (!next) return;
    setExamTab(tabOf(next));
    setSubjectKey(next);
    setTopicName(getTopicsForSubject(next)[0] || "Genel çalışma");
  }, [groups]);

  const handleExamChange = (nextTab) => {
    setExamTab(nextTab);
    const nextSubjects = (groups.find((g) => g.key === nextTab) || groups[0]).subjects;
    if (nextSubjects.length > 0) {
      const nextSub = nextSubjects[0];
      setSubjectKey(nextSub.key);
      const nextTopics = getTopicsForSubject(nextSub.key);
      setTopicName(nextTopics[0] || "Genel çalışma");
    }
  };

  const handleSubjectSelect = (subKey) => {
    setSubjectKey(subKey);
    const nextTopics = getTopicsForSubject(subKey);
    setTopicName(nextTopics[0] || "Genel çalışma");
  };

  const handleSubmit = async () => {
    try {
      // Eklenen durak BUGUNUN ek gorevi (user_tasks): Ana sayfa, Gunun plani
      // ve Program > Hafta'da aninda gorunur. "Belirtme" null veriyordu ve
      // dogrulama reddediyordu -- buton sessizce calismiyordu (uyari modalin
      // arkasinda kaliyordu). Eskiden ayrica yalniz telefonda duran bir rota
      // duragi yaziliyordu: sunucuya gitmiyor, ders programina gore baska bir
      // gune dusuyor, ana sayfada ikinci kopya oluyordu.
      const minutes = parseDurationMinutes(durVal);
      await createTask({
        subject: subjectKey,
        topic: topicName,
        ...(minutes ? { targetMinutes: minutes } : {}),
        note: "Kullanıcı ekledi",
      });
      // Rotasi olmayan kullanicinin rotasi da kurulur; kurulamazsa (erisim
      // yok, cevrimdisi) ek gorev yine kaydedilmis olur.
      if (!routeCreated) await createRoute().catch(() => {});

      H.success();
      navigation.goBack();
    } catch (e) {
      showAlert("Durak eklenemedi", e?.message || "Bilgileri kontrol edip tekrar dene.");
    }
  };

  return {
    navigation,
    examTab,
    examTabs: groups.map((g) => ({ key: g.key, label: g.label })),
    subjects,
    subjectKey,
    selectedSubjectObj,
    currentTopics,
    topicName,
    setTopicName,
    durVal,
    setDurVal,
    pickerOpen,
    setPickerOpen,
    handleExamChange,
    handleSubjectSelect,
    handleSubmit,
  };
}
