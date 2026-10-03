import { StyleSheet, Text, View } from "react-native";

import { Avatar, Button } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { CONTROL, GUTTER, STEP, TYPOGRAPHY } from "../../../themes/tokens";

const EXAM_LABELS = { tyt: "TYT", tyt_ayt: "TYT + AYT", ayt: "AYT", dil: "TYT + YDT", lgs: "LGS" };

function actionFor(status) {
  if (status === "accepted") return { title: "Arkadaşsınız", disabled: true, variant: "outline" };
  if (status === "outgoing_pending") return { title: "İstek gönderildi", disabled: true, variant: "outline" };
  if (status === "incoming_pending") return { title: "İsteği yanıtla", requests: true, variant: "secondary" };
  return { title: "Arkadaş ekle", variant: "primary" };
}

export function PublicProfileHeader({ profile, sending, onAdd, onRequests }) {
  const C = useC();
  const action = actionFor(profile.relationshipStatus);
  const initials = (profile.name || "Öğrenci").slice(0, 2).toUpperCase();
  const exam = EXAM_LABELS[String(profile.examType || "").toLowerCase()] || profile.examType || "Sınav bilgisi yok";
  return (
    <View style={styles.wrap}>
      <Avatar init={initials} image={profile.avatarUrl} size={CONTROL.buttonPrimary + STEP.s3} />
      <Text style={[TYPOGRAPHY.heading, styles.name, { color: C.text }]}>{profile.name}</Text>
      <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{exam}</Text>
      <Button
        title={action.title}
        variant={action.variant}
        size="lg"
        fullWidth
        loading={sending}
        disabled={action.disabled}
        onPress={action.requests ? onRequests : onAdd}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", paddingHorizontal: GUTTER, paddingTop: STEP.s3 },
  name: { marginTop: STEP.s2, textAlign: "center" },
  button: { marginTop: STEP.s3 },
});
