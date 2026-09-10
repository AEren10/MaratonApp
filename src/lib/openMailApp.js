import { Linking, Platform } from "react-native";

// "Mail uygulamasını aç" — platforma göre varsayılan posta istemcisini dener,
// açılamazsa sessizce yutar (kullanıcı zaten gelen kutusunu elle açabilir).
export async function openMailApp() {
  const url = Platform.OS === "ios" ? "message://" : "mailto:";
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) await Linking.openURL(url);
  } catch {
    // yut — kritik olmayan kolaylık eylemi
  }
}
