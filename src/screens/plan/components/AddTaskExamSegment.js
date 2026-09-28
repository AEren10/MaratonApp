import { memo } from "react";
import SegmentTabs from "../../../components/common/SegmentTabs";
import { STEP } from "../../../themes/tokens";

// Sekmeler kullanicinin sinavindan gelir (TYT/AYT, TYT/YDT ya da tek LGS).
export const AddTaskExamSegment = memo(function AddTaskExamSegment({ options, value, onChange }) {
  if (!options || options.length < 2) return null;
  return (
    <SegmentTabs
      options={options}
      value={value}
      onChange={onChange}
      style={{ marginBottom: STEP.s3 }}
    />
  );
});

export default AddTaskExamSegment;
