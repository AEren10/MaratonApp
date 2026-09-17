import test from "node:test";
import assert from "node:assert/strict";

import {
  buildSubjectProgressList,
  SUBJECT_PROGRESS_TAB,
} from "../../src/domain/analysis/subjectProgressList.js";
import { ROUTE_STOP_STATUS } from "../../src/domain/route/stopStatus.js";

const row = (name, over = {}) => ({
  topic_name: name,
  subject_key: "tyt_matematik",
  total_questions: 0,
  correct_count: 0,
  study_count: 0,
  ...over,
});

const stop = (topic, lifecycleStatus, weekIndex = 0) => ({
  topic,
  subject: "tyt_matematik",
  subjectLabel: "Matematik",
  lifecycleStatus,
  weekIndex,
});

const wrong = (topic, over = {}) => ({ topic, subject: "tyt_matematik", is_resolved: false, ...over });

const names = (items) => items.map((i) => i.name);

test("oncelikli: defter yuku, atlanan durak ve dusuk dogruluk toplanir", () => {
  const items = buildSubjectProgressList({
    progressRows: [row("Turev", { total_questions: 20, correct_count: 6 })],
    routeStops: [stop("Integral", ROUTE_STOP_STATUS.SKIPPED), stop("Limit", ROUTE_STOP_STATUS.RESCHEDULED)],
    notebookItems: [wrong("Olasilik")],
    tab: SUBJECT_PROGRESS_TAB.PRIORITY,
  });
  assert.deepEqual(names(items).sort(), ["Integral", "Limit", "Olasilik", "Turev"]);
});

test("sifir veri zayiflik sayilmaz ve metrik uydurulmaz", () => {
  const items = buildSubjectProgressList({
    progressRows: [row("Kumeler")],
    routeStops: [stop("Kumeler", ROUTE_STOP_STATUS.UPCOMING, 5)],
    tab: SUBJECT_PROGRESS_TAB.PRIORITY,
  });
  assert.deepEqual(items, []);

  const all = buildSubjectProgressList({
    progressRows: [row("Kumeler")],
    routeStops: [stop("Kumeler", ROUTE_STOP_STATUS.UPCOMING, 0)],
    tab: SUBJECT_PROGRESS_TAB.PROGRESS,
  });
  assert.equal(all[0].accuracy, null);
  assert.equal(all[0].totalQuestions, 0);
  // Tek gercek bilgi durak durumu; soru/dogruluk metrigi uydurulmaz.
  assert.equal(all[0].meta, "sırada");
});

test("hicbir veri yoksa metrik yerine 'henüz veri yok' yazilir", () => {
  const [item] = buildSubjectProgressList({
    notebookItems: [wrong("Parabol")],
    tab: SUBJECT_PROGRESS_TAB.PRIORITY,
  });
  assert.equal(item.meta, "henüz veri yok");
  assert.equal(item.accuracy, null);
});

test("cozulmus defter kaydi oncelik uretmez", () => {
  const items = buildSubjectProgressList({
    notebookItems: [wrong("Parabol", { is_resolved: true })],
    tab: SUBJECT_PROGRESS_TAB.PRIORITY,
  });
  assert.deepEqual(items, []);
});

test("oncelik siralamasi: once defter sayisi, sonra en dusuk dogruluk", () => {
  const items = buildSubjectProgressList({
    progressRows: [
      row("A", { total_questions: 10, correct_count: 1 }),
      row("B", { total_questions: 10, correct_count: 4 }),
      row("C", { total_questions: 10, correct_count: 2 }),
    ],
    notebookItems: [wrong("B"), wrong("B"), wrong("C")],
    tab: SUBJECT_PROGRESS_TAB.PRIORITY,
  });
  assert.deepEqual(names(items), ["B", "C", "A"]);
  assert.equal(items[0].badge, "defter 2");
});

test("suruyor: yalniz bu hafta ve sonraki, tamamlanmamis duraklar", () => {
  const items = buildSubjectProgressList({
    routeStops: [
      stop("Bu hafta", ROUTE_STOP_STATUS.ACTIVE, 0),
      stop("Gelecek hafta", ROUTE_STOP_STATUS.UPCOMING, 1),
      stop("Uzak hafta", ROUTE_STOP_STATUS.UPCOMING, 2),
      stop("Bitmis", ROUTE_STOP_STATUS.COMPLETED, 0),
    ],
    tab: SUBJECT_PROGRESS_TAB.PROGRESS,
  });
  assert.deepEqual(names(items), ["Bu hafta", "Gelecek hafta"]);
});

test("kapandi: tamamlanmis durak VE %70+ dogruluk", () => {
  const items = buildSubjectProgressList({
    progressRows: [
      row("Iyi", { total_questions: 10, correct_count: 9 }),
      row("Zayif", { total_questions: 10, correct_count: 5 }),
      row("Verisiz"),
    ],
    routeStops: [
      stop("Iyi", ROUTE_STOP_STATUS.COMPLETED),
      stop("Zayif", ROUTE_STOP_STATUS.COMPLETED),
      stop("Verisiz", ROUTE_STOP_STATUS.COMPLETED),
    ],
    tab: SUBJECT_PROGRESS_TAB.CLOSED,
  });
  assert.deepEqual(names(items), ["Iyi"]);
  assert.equal(items[0].accuracy, 90);
});

test("ayni konu birden fazla haftada durursa en erken hafta temsil eder", () => {
  const items = buildSubjectProgressList({
    routeStops: [
      stop("Turev", ROUTE_STOP_STATUS.UPCOMING, 3),
      stop("Turev", ROUTE_STOP_STATUS.ACTIVE, 1),
    ],
    tab: SUBJECT_PROGRESS_TAB.PROGRESS,
  });
  assert.equal(items.length, 1);
  assert.equal(items[0].weekIndex, 1);
});

test("ders rengi anahtari sinav on ekinden arindirilir", () => {
  const [item] = buildSubjectProgressList({
    progressRows: [row("Turev", { total_questions: 4, correct_count: 0 })],
    tab: SUBJECT_PROGRESS_TAB.PRIORITY,
  });
  assert.equal(item.subjectKey, "matematik");
  assert.equal(item.meta, "4 soru");
});
