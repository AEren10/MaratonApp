import { View, Text, Pressable } from "react-native";
import { Icon, Button } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";
import { useCountdown } from "../../../hooks/useCountdown";
import { openMailApp } from "../../../lib/openMailApp";
import * as H from "../../../lib/haptics";

const RESEND_SECONDS = 42;

// "Bağlantı yolda." paneli — Şifre Sıfırla ekranının "gönderildi" durumu.
export function EmailSentPanel({ email, onResend }) {
  const C = useC();
  const { label, isDone, reset } = useCountdown(RESEND_SECONDS);

  const handleResend = () => {
    if (!isDone) return;
    H.select();
    onResend?.();
    reset();
  };

  return (
    <View style={{ paddingTop: STEP.s5 - 4 }}>
      <View style={{
        width: 56, height: 56, borderRadius: SHAPE.card,
        backgroundColor: C.brandTint, borderWidth: 1, borderColor: C.bandEdge,
        alignItems: "center", justifyContent: "center",
      }}>
        <Icon name="mail" size={22} color={C.accent} />
      </View>

      <Text style={[TYPOGRAPHY.heading, { fontSize: 28, color: C.text, marginTop: STEP.s3, maxWidth: 280 }]}>
        Bağlantı yolda.
      </Text>
      <Text style={[TYPOGRAPHY.body, { fontSize: 13.5, color: C.text3, marginTop: STEP.s2, maxWidth: 302 }]}>
        <Text style={{ color: C.text2 }}>{email}</Text> adresine sıfırlama bağlantısı gönderdik. Bağlantı 30 dakika geçerli.
      </Text>

      <Button onPress={openMailApp} size="lg" fullWidth style={{ marginTop: STEP.s4 }}>
        Mail uygulamasını aç
      </Button>

      <Pressable onPress={handleResend} disabled={!isDone} style={{ alignItems: "center", justifyContent: "center", minHeight: 44, marginTop: STEP.s1 }}>
        <Text style={[TYPOGRAPHY.captionMedium, { color: C.text3 }]}>
          {isDone ? "Tekrar gönder" : `Tekrar gönder · ${label}`}
        </Text>
      </Pressable>

      <Text style={[TYPOGRAPHY.caption, { color: C.text3, textAlign: "center", marginTop: STEP.s2, fontSize: 12 }]}>
        Mail gelmediyse spam klasörüne bak.
      </Text>
    </View>
  );
}
