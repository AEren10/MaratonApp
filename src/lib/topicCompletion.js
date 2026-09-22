import * as appStorage from "./storage/appStorage";
import { STORAGE_KEYS, userScopedKey } from "../constants/storageKeys";
import { makeTopicKey, isTopicDone } from "../domain/curriculum/topicCompletion";

export { makeTopicKey, isTopicDone };

// Yol Haritası ve Ders Detayı için kullanıcı bazlı konu tamamlama yönetimi.
// Öğrencinin manuel attığı tikler yerel depolanır.
// Otomatik ilerleme 100 olunca veya manuel tik atılınca bitti sayılır.
const keyFor = (userId) => userScopedKey(STORAGE_KEYS.COMPLETED_TOPICS, userId || "guest");

export async function getCompletedTopicsMap(userId) {
  try {
    const data = await appStorage.getJson(keyFor(userId), {});
    return data && typeof data === "object" ? data : {};
  } catch (_) {
    return {};
  }
}

export async function saveCompletedTopicsMap(userId, map) {
  try {
    await appStorage.setJson(keyFor(userId), map || {});
  } catch (_) {}
}

export async function toggleTopicCompletion(userId, subjectKey, topicName, currentDone) {
  const currentMap = await getCompletedTopicsMap(userId);
  const k = makeTopicKey(subjectKey, topicName);
  const nextDone = !currentDone;
  const nextMap = { ...currentMap, [k]: nextDone };
  await saveCompletedTopicsMap(userId, nextMap);
  return nextMap;
}

