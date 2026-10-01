import { Circle, Ellipse, Line, Path, Polygon } from "react-native-svg";

// Ders ikonlari -- Icon setinin ince cizgi dilinde (24'luk tuval, yuvarlak uc).
// Icon.js bunlari kendi setine katar; ad ile cagrilir: <Icon name="atom" />.
export const SUBJECT_GLYPHS = {
  sigma: <Path d="M18 7V4H6l6 8-6 8h12v-3" />,
  atom: (
    <>
      <Circle cx="12" cy="12" r="1.3" />
      <Ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
      <Ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-60 12 12)" />
      <Ellipse cx="12" cy="12" rx="10" ry="4" />
    </>
  ),
  leaf: (
    <>
      <Path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z" />
      <Path d="M2 21c0-3 1.9-5.4 5.1-6C9.5 14.5 12 13 13 12" />
    </>
  ),
  feather: (
    <>
      <Path d="M20.2 12.2a6 6 0 0 0-8.5-8.5L5 10.5V19h8.5z" />
      <Line x1="16" y1="8" x2="2" y2="22" />
      <Line x1="17.5" y1="15" x2="9" y2="15" />
    </>
  ),
  landmark: (
    <>
      <Line x1="3" y1="22" x2="21" y2="22" />
      <Line x1="6" y1="18" x2="6" y2="11" />
      <Line x1="10" y1="18" x2="10" y2="11" />
      <Line x1="14" y1="18" x2="14" y2="11" />
      <Line x1="18" y1="18" x2="18" y2="11" />
      <Polygon points="12 2 20 7 4 7" />
    </>
  ),
  languages: (
    <>
      <Path d="M4 5h8M8 3v2M5.5 13c2.5-1.5 4.5-4.5 5-8M6 8c1 2.5 3 4.5 5.5 5.5" />
      <Path d="M13 21l4-9 4 9M14.5 18h5" />
    </>
  ),
};
