import { useState, useMemo } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useUserTasks } from "../../hooks/useUserTasks";
import { useAlert } from "../../contexts/AlertContext";
import { useAuth } from "../../contexts/AuthContext";
import { useExam } from "../../contexts/ExamContext";
import { useStudyRoute } from "../../hooks/useStudyRoute";
import { addStopToActiveRoute } from "../../supabase/routePlan";
import * as H from "../../lib/haptics";
import {
  ADD_TASK_TYT_SUBJECTS,
  ADD_TASK_AYT_SUBJECTS,
  getTopicsForSubject,
  parseDurationMinutes,
} from "./addTaskOptions";

export function useAddTaskState() {
  const navigation = useNavigation();
  const route = useRoute();
  const { createTask } = useUserTasks();
  const showAlert = useAlert();
  const { user } = useAuth();
  const { examType } = useExam();
  const { routeCreated, createRoute } = useStudyRoute({ persist: false });

  const [examTab, setExamTab] = useState("tyt");
  const subjects = examTab === "tyt" ? ADD_TASK_TYT_SUBJECTS : ADD_TASK_AYT_SUBJECTS;

  const initialSubject = route.params?.subjectKey || subjects[0]?.key || "matematik";
  const [subjectKey, setSubjectKey] = useState(initialSubject);
  const currentTopics = useMemo(() => getTopicsForSubject(subjectKey), [subjectKey]);

  const [topicName, setTopicName] = useState(route.params?.topicName || currentTopics[0] || "Genel çalışma");
  const [durVal, setDurVal] = useState("50 dk");
  const [pickerOpen, setPickerOpen] = useState(false);

  const selectedSubjectObj = subjects.find((s) => s.key === subjectKey) || subjects[0];

  const handleExamChange = (nextTab) => {
    setExamTab(nextTab);
    const nextSubjects = nextTab === "tyt" ? ADD_TASK_TYT_SUBJECTS : ADD_TASK_AYT_SUBJECTS;
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
      const minutes = parseDurationMinutes(durVal);
      await createTask({
        subject: subjectKey,
        topic: topicName,
        targetMinutes: minutes,
        note: "Kullanıcı ekledi",
      });

      const stopPayload = {
        userId: user?.id || "local_user",
        examType: examType || "tyt_ayt",
        subjectKey,
        topicName,
        durationMinutes: minutes,
        subjectLabel: selectedSubjectObj?.name || subjectKey,
      };

      if (!routeCreated) {
        await createRoute({ initialActiveStop: stopPayload });
      } else {
        await addStopToActiveRoute(stopPayload);
      }

      H.success();
      navigation.goBack();
    } catch (e) {
      showAlert("Durak eklenemedi", e?.message || "Bilgileri kontrol edip tekrar dene.");
    }
  };

  return {
    navigation,
    examTab,
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
