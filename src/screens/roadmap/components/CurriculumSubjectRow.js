import { memo } from "react";
import { useC } from "../../../contexts/ThemeContext";
import { subjectColorOf } from "../../../themes/subjectPalette";
import SubjectProgressRow from "../../../components/common/SubjectProgressRow";

function CurriculumSubjectRow({ subject, onPress }) {
  const C = useC();
  const color = subjectColorOf(C, subject.key);
  const ratio = subject.total > 0 ? subject.done / subject.total : 0;
  const pct = Math.round(ratio * 100);
  const value = subject.done > 0 ? `${subject.done}/${subject.total}` : `${subject.total} konu`;

  return (
    <SubjectProgressRow
      name={subject.name}
      subjectKey={subject.key}
      color={color}
      pct={pct}
      value={value}
      variant="card"
      showChevron
      onPress={onPress ? () => onPress(subject) : undefined}
      accessibilityLabel={`${subject.name}, ${subject.done}/${subject.total} konu tamamlandı`}
    />
  );
}

export default memo(CurriculumSubjectRow);
export { CurriculumSubjectRow };
