// Rota grafiginin ORTAK geometrisi ve tipografisi.
//
// Iki grafik var: olculmus hat (RouteLineChart) ve henuz olcum yokken
// cizilen beyan hatti (RouteEmptyChart). Ikisi ayri ayri yazilmisti ve
// birbirini tutmuyordu — farkli tuval orani, farkli cizgi kalinligi, farkli
// etiket boyutu, birinde izgara var otekinde yok. Kullanici ayni ekranda
// ikisini de goruyor; ayni dilde konusmalari gerekiyor.
//
// Deger burada tanimlanir, iki bilesen de buradan okur. Yeni bir grafik
// eklenirse o da buradan okumali.

export const CHART_W = 390;
// Tasarimda grafik genis ve BASIK (yaklasik 390x210). 250 cok uzundu:
// hat ayni yolu daha dik cikiyor ve altinda bos alan kaliyordu.
export const CHART_H = 210;

// Dugum yaricapi 9; bosluk olmadan ilk/son dugum viewBox'in disina tasiyor.
// Sag taraf daha genis, cunku "TAHMİN 71" etiketi oraya yasliyor.
export const PAD_LEFT = 26;
export const PAD_RIGHT = 34;
export const PAD_TOP = 26;
export const PAD_BOTTOM = 20;

// Alt seritte tarih etiketleri duruyor; hat onlarin uzerinde kalir.
export const AXIS_BAND = 26;

export const NODE = {
  todayGlow: 9,
  today: 7,
  past: 4.6,
  end: 6.5,
};

export const STROKE = {
  past: 4.5,
  pastNode: 2.6,
  // Projeksiyon eskiden C.proj (accent'in %52 soluk karisimi) ve 2.4pt idi;
  // koyu zeminde neredeyse kayboluyordu. Tasarimda kesikli hat acikca
  // kirmizi okunuyor. Renk accent'in kendisi, canliligi opaklik veriyor.
  proj: 2.8,
  projOpacity: 0.78,
  endNode: 2.6,
  projDash: "2 8",
};

// Bolum etiketi olcusu (AGENTS.md): 11.5px Archivo 600, letter-spacing .16em,
// buyuk harf. SVG'de letterSpacing piksel cinsinden verilir: 11.5 * .16 ≈ 1.8.
export const LABEL = {
  size: 11.5,
  weight: "600",
  tracking: 1.8,
};

// Etiketin yanindaki sayi (tasarimda "net degeri" kademesi).
export const VALUE = {
  size: 17,
  weight: "500",
};

// Hattin ustunde kalan alan: tarih seridi hesaba katilmis cizim yuksekligi.
export function plotBottom({ hasAxis }) {
  return CHART_H - PAD_BOTTOM - (hasAxis ? AXIS_BAND : 0);
}

export function scaleOptions({ hasAxis }) {
  return {
    width: CHART_W,
    height: CHART_H,
    padTop: PAD_TOP,
    padBottom: PAD_BOTTOM + (hasAxis ? AXIS_BAND : 0),
    padLeft: PAD_LEFT,
    padRight: PAD_RIGHT,
  };
}

// Eksenin uc etiketinin x konumu ve hizalamasi.
export function axisAnchor(index, count) {
  if (index === 0) return { x: PAD_LEFT, anchor: "start" };
  if (index === count - 1) return { x: CHART_W - PAD_RIGHT, anchor: "end" };
  return { x: PAD_LEFT + (CHART_W - PAD_LEFT - PAD_RIGHT) / 2, anchor: "middle" };
}
