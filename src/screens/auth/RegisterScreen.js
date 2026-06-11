import { useState } from "react";
import { View, Text, Pressable, KeyboardAvoidingView, Platform, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { signUp } from "../../supabase/auth";
import { SCREENS } from "../../constants/screens";
import { C } from "../../themes/tokens";
import { AuthInput } from "./components/AuthInput";
import { Icon } from "../../components/design";

export default function RegisterScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});

  const submit = async () => {
    const e = {};
    if (name.trim().length < 2) e.name = "Adın en az 2 karakter olmalı";
    if (!email.includes("@")) e.email = "Geçerli bir e-posta gir";
    if (password.length < 6) e.password = "Şifre en az 6 karakter";
    setErrors(e);
    if (Object.keys(e).length) return;

    setBusy(true);
    try {
      await signUp({ email, password, name });
      Alert.alert("Hoş geldin!", "Hesabın oluşturuldu, e-postanı doğrulamayı unutma.");
    } catch (err) {
      Alert.alert("Kayıt başarısız", err.message ?? "Bir sorun oldu");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ padding: 24, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={10}
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              backgroundColor: C.surface,
              borderWidth: 1,
              borderColor: C.border,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
            }}
          >
            <Icon name="x" size={18} color={C.text} />
          </Pressable>

          <Text
            style={{
              fontFamily: "SpaceGrotesk_700Bold",
              fontSize: 28,
              color: C.text,
              letterSpacing: -0.5,
            }}
          >
            Aramıza katıl
          </Text>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 15,
              color: C.muted,
              marginTop: 6,
              marginBottom: 32,
            }}
          >
            Bugün başla, sınava hazır gel.
          </Text>

          <AuthInput
            label="Ad"
            value={name}
            onChangeText={setName}
            placeholder="Eren"
            autoCapitalize="words"
            error={errors.name}
          />
          <AuthInput
            label="E-posta"
            value={email}
            onChangeText={setEmail}
            placeholder="ornek@mail.com"
            keyboardType="email-address"
            error={errors.email}
          />
          <AuthInput
            label="Şifre"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            error={errors.password}
          />

          <Pressable
            onPress={submit}
            disabled={busy}
            style={({ pressed }) => ({
              backgroundColor: C.amber,
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: "center",
              marginTop: 12,
              opacity: busy ? 0.6 : pressed ? 0.85 : 1,
              shadowColor: C.amber,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 16,
              elevation: 6,
            })}
          >
            <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 15, color: C.bg }}>
              {busy ? "Hesap açılıyor..." : "Kayıt Ol"}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
