// Dogru sayisi, ayni duragin calisma kaydi sunucuya ya da offline kuyruga
// yerlesmeden yazilamaz. Tamamlama hatalansa bile son bir sunucu/kuyruk
// aramasi yapabilmek icin persist yine calisir.
export async function afterStopWrite(pendingWrite, persist) {
  try {
    await pendingWrite;
  } catch {}
  return persist();
}
