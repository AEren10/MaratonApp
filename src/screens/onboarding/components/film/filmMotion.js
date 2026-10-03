import { Easing, withDelay, withTiming } from "react-native-reanimated";
import { ANIMATION } from "../../../../themes/tokens";

// Filmde iki hareket turu var (AGENTS.md: ekranda en fazla iki):
//  1) ciz/buyu -- hat, tik, cubuk; easeOut ile 0.5-0.9 sn
//  2) belir   -- sahne ve metin gecisi; yalniz opaklik
export const EASE = Easing.bezier(...ANIMATION.easing.easeOut);
export const DRAW_MS = 800;
export const REVEAL_MS = 500;

export const draw = (delay = 0, duration = DRAW_MS) =>
  withDelay(delay, withTiming(1, { duration, easing: EASE }));
