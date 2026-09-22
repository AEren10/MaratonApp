export function makeTopicKey(subjectKey, topicName) {
  return `${subjectKey || ""}:${topicName || ""}`;
}

export function isTopicDone(completedMap, subjectKey, topicName, autoPct = 0) {
  if (!completedMap) return autoPct >= 100;
  const k = makeTopicKey(subjectKey, topicName);
  if (Object.prototype.hasOwnProperty.call(completedMap, k)) {
    return Boolean(completedMap[k]);
  }
  return autoPct >= 100;
}
