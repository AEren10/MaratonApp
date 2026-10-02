import { StyleSheet } from "react-native";
import Svg, { Defs, Pattern, Rect } from "react-native-svg";

const SIZE = 12;

// Seffaf katman (sticker) desenini simgeleyen dama tahtasi zemini (Strava stili).
export function CheckerboardBackground() {
  return (
    <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
      <Defs>
        <Pattern
          id="storyChecker"
          width={SIZE * 2}
          height={SIZE * 2}
          patternUnits="userSpaceOnUse"
        >
          <Rect width={SIZE * 2} height={SIZE * 2} fill="#1E1E26" />
          <Rect x={0} y={0} width={SIZE} height={SIZE} fill="#272732" />
          <Rect x={SIZE} y={SIZE} width={SIZE} height={SIZE} fill="#272732" />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#storyChecker)" />
    </Svg>
  );
}
