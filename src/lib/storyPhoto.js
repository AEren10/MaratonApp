import { Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";

// Story arka plani icin fotograf secimi. 9:16 kirpma secicinin kendi
// ekraninda; kalite 0.7 -- Instagram story cozunurlugu icin yeterli, base64
// (iOS paylasimi bunu ister) bellekte birkac yuz KB'ta kalir.
// Doner: { uri, share } -- uri onizleme icin, share Instagram'a giden deger.
// Kullanici vazgecerse null.
// source: "library" (galeriden sec) ya da "camera" (o an cek; Strava gibi).
// Kamera izin ister; reddedilirse null.
export async function pickStoryPhoto(source = "library") {
  try {
    const options = {
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.85,
      base64: Platform.OS === "ios",
    };
    if (source === "camera") {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) return null;
    }
    const res = source === "camera"
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);
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
