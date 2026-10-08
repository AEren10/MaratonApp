export const MAX_PUBLISHER_NAME_LENGTH = 60;

export function cleanPublisherName(value) {
  return String(value ?? "")
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
    .trim()
    .slice(0, MAX_PUBLISHER_NAME_LENGTH);
}

export function normalizePublisherSelection({ publisherId, publisherName } = {}) {
  const customName = cleanPublisherName(publisherName);
  return {
    publisherId: customName ? null : (publisherId || null),
    publisherName: customName,
  };
}

export function visiblePublisherOptions(publishers = []) {
  return publishers.filter((publisher) => publisher?.key !== "other");
}

export function publisherLabel({ publishers = [], publisherId, publisherName } = {}) {
  const customName = cleanPublisherName(publisherName);
  if (customName) return customName;
  return publishers.find((publisher) => publisher.id === publisherId)?.name || null;
}
