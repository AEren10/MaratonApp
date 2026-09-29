import { Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";

// Story arka plani icin fotograf secimi. 9:16 kirpma secicinin kendi
// ekraninda; kalite 0.7 -- Instagram story cozunurlugu icin yeterli, base64
// (iOS paylasimi bunu ister) bellekte birkac yuz KB'ta kalir.
// Doner: { uri, share } -- uri onizleme icin, share Instagram'a giden deger.
// Kullanici vazgecerse null.
export async function pickStoryPhoto() {
  try {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [9, 16],
      quality: 0.7,
      base64: Platform.OS === "ios",
    });
    if (res.canceled || !res.assets?.[0]) return null;
    const asset = res.assets[0];
    const share = Platform.OS === "ios" && asset.base64
      ? `data:image/jpeg;base64,${asset.base64}`
      : asset.uri;
    return { uri: asset.uri, share };
  } catch {
    return null;
  }
}
