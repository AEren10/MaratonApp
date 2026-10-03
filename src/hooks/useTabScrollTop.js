import { useRef } from "react";
import { useScrollToTop } from "@react-navigation/native";

// Sekmenin kok ekrani: zaten acik sekmeye tekrar basilinca en uste kayar
// (TabBar standart tabPress olayini yayiyor). Ref'i ana ScrollView'e ver.
export function useTabScrollTop() {
  const ref = useRef(null);
  useScrollToTop(ref);
  return ref;
}
