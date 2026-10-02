import { useCallback, useMemo, useState } from "react";
import { useNavigation } from "@react-navigation/native";

import { SCREENS } from "../../constants/screens";
import { EVENTS } from "../../constants/analytics";
import { track } from "../../lib/analytics";
import * as H from "../../lib/haptics";
import { setPendingPreview } from "../../lib/routePreviewStore";
import { buildRoutePreview, PREVIEW_DAILY_OPTIONS } from "../../domain/onboarding/routePreview";
import { buildCategoryOptions, buildYKSOptions, MONTHS } from "./constants/examSetupOptions";

const yearOf = (month) => Number(String(month).match(/(\d{4})/)?.[1]) || new Date().getFullYear() + 1;

// Kayit oncesi uc soru (sinav, yil, gunluk sure) -> gercek rota. Cevaplar
// kayittan sonra kurulumu besler (routePreviewStore).
export function useRoutePreviewForm() {
  const navigation = useNavigation();
  const categories = useMemo(() => buildCategoryOptions(), []);
  const yksOptions = useMemo(() => buildYKSOptions(), []);
  const [category, setCategory] = useState(null);
  const [optionId, setOptionId] = useState(null);
  const [month, setMonth] = useState(MONTHS[0]);
  const [dailyId, setDailyId] = useState(null);
  const [preview, setPreview] = useState(null);

  const answers = useMemo(() => {
    const daily = PREVIEW_DAILY_OPTIONS.find((o) => o.id === dailyId);
    const opt = category === "lgs"
      ? { examType: "lgs", field: null }
      : yksOptions.find((o) => o.id === optionId);
    if (!category || !opt || !daily) return null;
    return { examType: opt.examType, field: opt.field ?? null, examYear: yearOf(month), dailyQuestions: daily.questions };
  }, [category, optionId, month, dailyId, yksOptions]);

  const pickCategory = useCallback((id) => {
    H.select();
    setCategory(id);
    setOptionId(null);
  }, []);

  const draw = useCallback(() => {
    if (!answers) return;
    const result = buildRoutePreview(answers);
    if (!result?.firstStops?.length) return;
    H.success();
    setPendingPreview(answers);
    setPreview(result);
    track(EVENTS.ROUTE_PREVIEW_SHOWN, { exam_type: answers.examType, field: answers.field, daily_questions: answers.dailyQuestions });
  }, [answers]);

  const save = useCallback(() => {
    track(EVENTS.ROUTE_PREVIEW_SAVE, { exam_type: answers?.examType || null });
    navigation.navigate(SCREENS.REGISTER);
  }, [answers?.examType, navigation]);

  return {
    categories, yksOptions, months: MONTHS,
    category, pickCategory, optionId, setOptionId, month, setMonth, dailyId, setDailyId,
    canDraw: Boolean(answers), preview, draw, save,
    back: () => setPreview(null),
    login: () => navigation.navigate(SCREENS.LOGIN),
  };
}
