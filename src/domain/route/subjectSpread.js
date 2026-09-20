// Ayni dersin ust uste yigilmasini onler — SAF.
//
// Oncelik siralamasi tek basina dogru ama tek basina birakildiginda ilk gun
// acilan kullanici "Sozcukte Anlam, Deyim ve Atasozleri, Soz Yorumu, Cumlede
// Anlam" goruyordu: dort durak, tek ders. Uygulama Turkce calisma araci gibi
// hissettiriyor, uygulamanin neyi kapsadigi da gorunmuyor.
//
// Onceligi BOZMUYORUZ: her adimda hala kalanlarin en oncelikli olani secilir,
// yalniz ayni dersten ust uste `maxRun` taneden fazlasi varsa sirada bekleyen
// ilk farkli ders one alinir. Baska ders kalmadiysa kural gevser — plan
// tikanmaz, sadece cesitlendirmeye calisir.
const DEFAULT_MAX_RUN = 2;

const subjectOf = (item) => item?.subject ?? item?.subjectKey ?? item?.subjectLabel ?? null;

export function spreadSubjects(items = [], { maxRun = DEFAULT_MAX_RUN } = {}) {
  if (!Array.isArray(items) || items.length < 2) return [...(items || [])];
  if (maxRun < 1) return [...items];

  const remaining = [...items];
  const out = [];
  let lastSubject = null;
  let run = 0;

  while (remaining.length) {
    let pick = 0;

    if (run >= maxRun) {
      const different = remaining.findIndex((item) => subjectOf(item) !== lastSubject);
      // -1 ise geriye tek ders kalmis; kurali zorlamanin anlami yok.
      if (different !== -1) pick = different;
    }

    const [chosen] = remaining.splice(pick, 1);
    const subject = subjectOf(chosen);
    run = subject === lastSubject ? run + 1 : 1;
    lastSubject = subject;
    out.push(chosen);
  }

  return out;
}

export const SUBJECT_MAX_RUN = DEFAULT_MAX_RUN;
