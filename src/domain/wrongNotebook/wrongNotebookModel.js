export const WRONG_NOTEBOOK_STATUS = {
  OPEN: "open",
  RESOLVED: "resolved",
  ALL: "all",
};

export const WRONG_NOTEBOOK_TAB = {
  COMMUNITY: "community",
  MINE: "mine",
};

export function getWrongSubjectKey(item) {
  return typeof item?.subject === "string" ? item.subject : item?.subject?.key;
}

export function matchesWrongStatus(item, status) {
  if (status === WRONG_NOTEBOOK_STATUS.OPEN) return !item.is_resolved;
  if (status === WRONG_NOTEBOOK_STATUS.RESOLVED) return !!item.is_resolved;
  return true;
}

export function buildWrongNotebookViewModel({ items, status, subject, topicFilter }) {
  const subjectCounts = {};
  items.forEach((item) => {
    if (!matchesWrongStatus(item, status)) return;
    const key = getWrongSubjectKey(item);
    if (!key) return;
    subjectCounts[key] = (subjectCounts[key] || 0) + 1;
  });

  const subjectKeys = Object.entries(subjectCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([key]) => key);

  const filtered = items
    .filter((item) => {
      const subKey = getWrongSubjectKey(item);
      if (subject !== "all" && subKey !== subject) return false;
      if (topicFilter !== "all" && item.topic !== topicFilter) return false;
      return matchesWrongStatus(item, status);
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const topicCounts = {};
  if (subject !== "all") {
    items.forEach((item) => {
      const subKey = getWrongSubjectKey(item);
      if (subKey !== subject || !item.topic || !matchesWrongStatus(item, status)) return;
      topicCounts[item.topic] = (topicCounts[item.topic] || 0) + 1;
    });
  }

  const topicOptions = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, n]) => ({ name, n }));

  const counts = {
    open: items.filter((item) => !item.is_resolved).length,
    total: items.length,
  };
  const dueCount = items.filter((item) => {
    if (item.is_resolved || !item.next_review_at) return false;
    return new Date(item.next_review_at).getTime() <= Date.now();
  }).length;

  return {
    counts,
    dueCount,
    filtered,
    subjectCounts,
    subjectKeys,
    topicOptions,
  };
}
