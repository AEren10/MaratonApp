import { memo } from "react";
import SegmentTabs from "../../../components/common/SegmentTabs";
import { GUTTER, STEP } from "../../../themes/tokens";

const TABS = [
  { key: "all", label: "Tümü" },
  { key: "done", label: "Biten" },
  { key: "remaining", label: "Kalan" },
];

export const SubjectTopicSegment = memo(function SubjectTopicSegment({ active, onChange }) {
  return (
    <SegmentTabs
      options={TABS}
      value={active}
      onChange={onChange}
      style={{ marginHorizontal: GUTTER, marginTop: STEP.s3 }}
    />
  );
});

export default SubjectTopicSegment;
