import Svg, { Path, Circle, Polyline, Line, Polygon, Rect, G } from "react-native-svg";

const ICONS = {
  zap: <Polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
  flame: (
    <Path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.4 0 2.5-1.1 2.5-2.5 0-3-2-4.5-2-7 0 1.5-1 3-2 4-1 .8-1.5 2-1 3.5z M12 2c0 2 1 3.5 2.5 5 2 2 3.5 4 3.5 7a6 6 0 0 1-12 0c0-1.4.4-2.6 1-3.5C9 8 9.5 5.5 9 3c1 1 2 2 3 2-.5-1.5-.5-3 0-3z" />
  ),
  shield: <Path d="M12 2L4 5v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3z" />,
  arrowR: <Polyline points="9 6 15 12 9 18" />,
  arrowL: <Polyline points="15 18 9 12 15 6" />,
  arrowUp: <Polyline points="18 15 12 9 6 15" />,
  arrowDown: <Polyline points="6 9 12 15 18 9" />,
  chevR: <Polyline points="9 6 15 12 9 18" />,
  chevL: <Polyline points="15 18 9 12 15 6" />,
  chevDown: <Polyline points="6 9 12 15 18 9" />,
  chevUp: <Polyline points="18 15 12 9 6 15" />,
  alert: (
    <>
      <Path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <Line x1="12" y1="9" x2="12" y2="13" />
      <Line x1="12" y1="17" x2="12.01" y2="17" />
    </>
  ),
  edit: (
    <>
      <Path d="M12 20h9" />
      <Path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </>
  ),
  chart: (
    <>
      <Line x1="3" y1="21" x2="21" y2="21" />
      <Polyline points="4 17 9 12 14 15 21 8" />
    </>
  ),
  barChart: (
    <>
      <Line x1="12" y1="20" x2="12" y2="10" />
      <Line x1="18" y1="20" x2="18" y2="4" />
      <Line x1="6" y1="20" x2="6" y2="14" />
    </>
  ),
  camera: (
    <>
      <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <Circle cx="12" cy="13" r="4" />
    </>
  ),
  target: (
    <>
      <Circle cx="12" cy="12" r="10" />
      <Circle cx="12" cy="12" r="6" />
      <Circle cx="12" cy="12" r="2" />
    </>
  ),
  home: (
    <>
      <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <Polyline points="9 22 9 12 15 12 15 22" />
    </>
  ),
  book: (
    <>
      <Path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </>
  ),
  bookOpen: (
    <>
      <Path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <Path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </>
  ),
  user: (
    <>
      <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <Circle cx="12" cy="7" r="4" />
    </>
  ),
  users: (
    <>
      <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <Circle cx="9" cy="7" r="4" />
      <Path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  plus: (
    <>
      <Line x1="12" y1="5" x2="12" y2="19" />
      <Line x1="5" y1="12" x2="19" y2="12" />
    </>
  ),
  x: (
    <>
      <Line x1="18" y1="6" x2="6" y2="18" />
      <Line x1="6" y1="6" x2="18" y2="18" />
    </>
  ),
  check: <Polyline points="20 6 9 17 4 12" />,
  checkCircle: (
    <>
      <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <Polyline points="22 4 12 14.01 9 11.01" />
    </>
  ),
  circle: <Circle cx="12" cy="12" r="10" />,
  search: (
    <>
      <Circle cx="11" cy="11" r="8" />
      <Line x1="21" y1="21" x2="16.65" y2="16.65" />
    </>
  ),
  notebook: (
    <>
      <Path d="M4 4h16v16H4z" />
      <Line x1="8" y1="4" x2="8" y2="20" />
      <Line x1="12" y1="8" x2="18" y2="8" />
      <Line x1="12" y1="12" x2="18" y2="12" />
      <Line x1="12" y1="16" x2="18" y2="16" />
    </>
  ),
  trophy: (
    <>
      <Path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2" />
      <Path d="M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2" />
      <Path d="M6 3h12v7a6 6 0 0 1-12 0V3z" />
      <Path d="M9 21h6" />
      <Path d="M12 16v5" />
    </>
  ),
  crown: (
    <>
      <Path d="M2 20h20" />
      <Polygon points="12 4 5 10 2 4 2 20 22 20 22 4 19 10 12 4" />
    </>
  ),
  medal: (
    <>
      <Circle cx="12" cy="8" r="6" />
      <Path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
    </>
  ),
  star: (
    <Polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  ),
  clock: (
    <>
      <Circle cx="12" cy="12" r="10" />
      <Polyline points="12 6 12 12 16 14" />
    </>
  ),
  timer: (
    <>
      <Circle cx="12" cy="13" r="8" />
      <Line x1="12" y1="9" x2="12" y2="13" />
      <Line x1="16.24" y1="7.76" x2="14.12" y2="9.88" />
      <Line x1="10" y1="2" x2="14" y2="2" />
    </>
  ),
  calendar: (
    <>
      <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <Line x1="16" y1="2" x2="16" y2="6" />
      <Line x1="8" y1="2" x2="8" y2="6" />
      <Line x1="3" y1="10" x2="21" y2="10" />
    </>
  ),
  settings: (
    <>
      <Circle cx="12" cy="12" r="3" />
      <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </>
  ),
  logOut: (
    <>
      <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <Polyline points="16 17 21 12 16 7" />
      <Line x1="21" y1="12" x2="9" y2="12" />
    </>
  ),
  play: <Polygon points="5 3 19 12 5 21 5 3" />,
  pause: (
    <>
      <Rect x="6" y="4" width="4" height="16" />
      <Rect x="14" y="4" width="4" height="16" />
    </>
  ),
  stop: <Rect x="3" y="3" width="18" height="18" rx="2" ry="2" />,
  sun: (
    <>
      <Circle cx="12" cy="12" r="5" />
      <Line x1="12" y1="1" x2="12" y2="3" />
      <Line x1="12" y1="21" x2="12" y2="23" />
      <Line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <Line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <Line x1="1" y1="12" x2="3" y2="12" />
      <Line x1="21" y1="12" x2="23" y2="12" />
      <Line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <Line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </>
  ),
  moon: <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />,
  bell: (
    <>
      <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </>
  ),
  eye: (
    <>
      <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <Circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: (
    <>
      <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <Line x1="1" y1="1" x2="23" y2="23" />
    </>
  ),
  lock: (
    <>
      <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>
  ),
  mail: (
    <>
      <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <Polyline points="22 6 12 13 2 6" />
    </>
  ),
  image: (
    <>
      <Rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <Circle cx="8.5" cy="8.5" r="1.5" />
      <Polyline points="21 15 16 10 5 21" />
    </>
  ),
  hash: (
    <>
      <Line x1="4" y1="9" x2="20" y2="9" />
      <Line x1="4" y1="15" x2="20" y2="15" />
      <Line x1="10" y1="3" x2="8" y2="21" />
      <Line x1="16" y1="3" x2="14" y2="21" />
    </>
  ),
  filter: <Polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />,
  trendUp: (
    <>
      <Polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <Polyline points="17 6 23 6 23 12" />
    </>
  ),
  trendDown: (
    <>
      <Polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <Polyline points="17 18 23 18 23 12" />
    </>
  ),
  refresh: (
    <>
      <Polyline points="23 4 23 10 17 10" />
      <Polyline points="1 20 1 14 7 14" />
      <Path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </>
  ),
  share: (
    <>
      <Circle cx="18" cy="5" r="3" />
      <Circle cx="6" cy="12" r="3" />
      <Circle cx="18" cy="19" r="3" />
      <Line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <Line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </>
  ),
  trash: (
    <>
      <Polyline points="3 6 5 6 21 6" />
      <Path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </>
  ),
  info: (
    <>
      <Circle cx="12" cy="12" r="10" />
      <Line x1="12" y1="16" x2="12" y2="12" />
      <Line x1="12" y1="8" x2="12.01" y2="8" />
    </>
  ),
  award: (
    <>
      <Circle cx="12" cy="8" r="7" />
      <Polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </>
  ),
  grid: (
    <>
      <Rect x="3" y="3" width="7" height="7" />
      <Rect x="14" y="3" width="7" height="7" />
      <Rect x="14" y="14" width="7" height="7" />
      <Rect x="3" y="14" width="7" height="7" />
    </>
  ),
  activity: (
    <Polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  ),
  percent: (
    <>
      <Line x1="19" y1="5" x2="5" y2="19" />
      <Circle cx="6.5" cy="6.5" r="2.5" />
      <Circle cx="17.5" cy="17.5" r="2.5" />
    </>
  ),
  layers: (
    <>
      <Polygon points="12 2 2 7 12 12 22 7 12 2" />
      <Polyline points="2 17 12 22 22 17" />
      <Polyline points="2 12 12 17 22 12" />
    </>
  ),
  mic: (
    <>
      <Path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <Path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <Line x1="12" y1="19" x2="12" y2="23" />
      <Line x1="8" y1="23" x2="16" y2="23" />
    </>
  ),
  volume: (
    <>
      <Polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <Path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
    </>
  ),
  radio: (
    <>
      <Circle cx="12" cy="12" r="2" />
      <Path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
    </>
  ),
  globe: (
    <>
      <Circle cx="12" cy="12" r="10" />
      <Line x1="2" y1="12" x2="22" y2="12" />
      <Path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </>
  ),
  flask: (
    <>
      <Path d="M9 3h6M10 3v7.4a2 2 0 0 1-.5 1.3L4 19a2 2 0 0 0 1.5 3h13a2 2 0 0 0 1.5-3l-5.5-7.3a2 2 0 0 1-.5-1.3V3" />
      <Line x1="8.5" y1="16" x2="15.5" y2="16" />
    </>
  ),
  heart: <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />,
};

export function Icon({ name, size = 20, color = "#FFFFFF", sw = 2, fill = "none" }) {
  const path = ICONS[name];
  if (!path) return null;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {path}
    </Svg>
  );
}
