// Acilis perdesi kalkarken bir kez haber verir: perdenin ALTINDA kurulmus
// ana sayfa grafik animasyonlarini o an bastan oynatir (yoksa cubuklar
// perde arkasinda dolup biter, kullanici hazir bir sayfa gorur).
const listeners = new Set();
let revealed = false;

export function onLaunchReveal(fn) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

export function emitLaunchReveal() {
  if (revealed) return;
  revealed = true;
  listeners.forEach((fn) => fn());
}
