import { memo } from "react";
import SegmentTabs from "../../../components/common/SegmentTabs";
import { STEP } from "../../../themes/tokens";

const OPTIONS = [
  { key: "tyt", label: "TYT" },
  { key: "ayt", label: "AYT" },
];

export const AddTaskExamSegment = memo(function AddTaskExamSegment({ value, onChange }) {
  return (
    <SegmentTabs
      options={OPTIONS}
      value={value}
      onChange={onChange}
      style={{ marginBottom: STEP.s3 }}
    />
  );
});

export default AddTaskExamSegment;
