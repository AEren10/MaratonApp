import { useCallback, useEffect, useRef, useState } from "react";
import { addStudyLog } from "../supabase/studyLogs";
import { clearRehearsal } from "../lib/examRehearsalStore";
import { todayTR } from "../lib/dateUtils";
import * as H from "../lib/haptics";

// Prova oturumu sayaci. Gecen sure baslangic anindan hesaplanir: uygulama
// arka plana dusse de gercek saat akar ("gerçek saat"). Duraklatma yok.
// Sure dolarsa calisma kaydi yazilir ve netler elle girilir; yarim
// birakilirsa kayit acilmaz (tasarimin notu).
export function useRehearsalTimer({ userId, session }) {
  const [phase, setPhase] = useState("idle");
  const [elapsed, setElapsed] = useState(0);
  const [full, setFull] = useState(false);
  const startedAt = useRef(0);
  const total = (session?.minutes || 0) * 60;

  const complete = useCallback((isFull) => {
    setFull(isFull);
    setPhase("done");
    clearRehearsal(userId).catch(() => {});
    if (!isFull) return;
    H.success();
    if (userId && userId !== "dev") {
      addStudyLog({
        user_id: userId,
        subject: session.key,
        topic: "Sınav Simülasyonu",
        question_count: 0,
        correct_count: 0,
        duration_minutes: session.minutes,
        study_date: todayTR(),
      }).catch(() => {});
    }
  }, [session, userId]);

  useEffect(() => {
    if (phase !== "running") return undefined;
    const id = setInterval(() => {
      const secs = Math.floor((Date.now() - startedAt.current) / 1000);
      if (secs >= total) {
        clearInterval(id);
        setElapsed(total);
        complete(true);
      } else {
        setElapsed(secs);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [phase, total, complete]);

  const start = useCallback(() => {
    startedAt.current = Date.now();
    setElapsed(0);
    setPhase("running");
  }, []);

  const finishEarly = useCallback(() => complete(false), [complete]);

  return { phase, elapsed, remaining: Math.max(0, total - elapsed), total, full, start, finishEarly };
}
