// Acilis filmi: uc sahne, uc vaat. Metin burada, hareket sahne dosyalarinda.
// Iddialar uygulamanin gercekten yaptigi seyler -- atlanan durak yeniden
// yerlesir, deneme sonrasi rota yeniden hesaplanir (planEngine).
export const FILM_SCENE_MS = 4600;

export const FILM_SCENES = [
  {
    key: "route",
    tag: "ROTA",
    title: "Sınava kadar her gün, tek bir hat.",
    description:
      "Konuları senin hızına göre gün gün duraklara bölüyoruz. Sabah ne çalışacağını düşünmezsin.",
  },
  {
    key: "stop",
    tag: "DURAK",
    title: "Tikle, hat bir sonraki durağa uzasın.",
    description:
      "Yetişemediğin durak kaybolmaz; rota onu kendiliğinden yeniden yerleştirir.",
  },
  {
    key: "week",
    tag: "İLERLEME",
    title: "Emeğin haftalık, netin denemeyle büyür.",
    description:
      "Her denemeden sonra rota yeniden hesaplanır. Nereye gittiğini hep bilirsin.",
  },
];
