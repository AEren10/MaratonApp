import { SCREENS } from "../constants/screens";
import { TAB_KEYS } from "./tabAssignment";
import { openInTab } from "./tabJump";

// Program sekmesinin tek girisi. Hafta, Ay ve Mufredat ayri ekran degil,
// ayni ekranin gorunumleri; nereden gelinirse gelinsin sekme dogru parlar
// ve geri tusu sekmenin kokune doner.
export const PROGRAM_VIEWS = Object.freeze({ WEEK: "hafta", MONTH: "ay", CURRICULUM: "mufredat" });

export function openProgram(navigation, view = PROGRAM_VIEWS.WEEK) {
  openInTab(navigation, TAB_KEYS.PROGRAM, SCREENS.CURRICULUM_MAP, { view });
}
