import { WeekCompleteModal } from "../../../components/common/completion/WeekCompleteModal";
import { useWeekProgram } from "../../../hooks/useWeekProgram";

// Hafta ani yalniz tetiklendiginde baglanir: useWeekProgram bu haftanin
// study_logs kaydini ceker, Ana sayfada her acilista istek atilmasin.
export function HomeWeekComplete({ week, onClose, onNextWeek, onWeeklySummary }) {
  const program = useWeekProgram();
  if (program.loading) return null;

  return (
    <WeekCompleteModal
      visible
      rangeLabel={program.weekRangeLabel ? program.weekRangeLabel.toLocaleUpperCase("tr-TR") : null}
      stopsPlanned={week.planned}
      stopsDone={week.done}
      weekMinutes={program.totalMinutes}
      days={program.days}
      onClose={onClose}
      onNextWeek={onNextWeek}
      onWeeklySummary={onWeeklySummary}
    />
  );
}
