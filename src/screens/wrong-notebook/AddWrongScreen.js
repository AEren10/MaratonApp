import { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Alert, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { C } from "../../themes/tokens";
import { Icon } from "../../components/design";
import { useGamification } from "../../hooks/useGamification";
import { XPToast } from "../../components/common/XPToast";
import { BadgeUnlockModal } from "../../components/common/BadgeUnlockModal";
import { useAuth } from "../../contexts/AuthContext";
import { useCurriculum } from "../../hooks/useCurriculum";
import { addWrongQuestion } from "../../supabase/wrongQuestions";
import { uploadWrongQuestionImage } from "../../supabase/storage";

const ANSWERS = ["A", "B", "C", "D", "E"];

export default function AddWrongScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { subjects } = useCurriculum();
  const { reward, xpToast, dismissXP, badgeModal, dismissBadge } = useGamification();
  const [subject, setSubject] = useState(() => subjects[1] || subjects[0] || { key: "matematik", label: "Matematik", color: "#F5A623", icon: "hash" });
  const [topic, setTopic] = useState("");
  const [note, setNote] = useState("");
  const [myAnswer, setMyAnswer] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("İzin gerekli", "Galeriden foto seçmek için izin ver.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
    });
    if (!res.canceled) setImage(res.assets[0].uri);
  };

  const save = async () => {
    if (!topic.trim()) {
      Alert.alert("Konu eksik", "Hangi konuda yanlış yaptın?");
      return;
    }
    setSaving(true);
    try {
      let imagePath = null;
      if (image) {
        imagePath = await uploadWrongQuestionImage(user.id, image);
      }
      await addWrongQuestion({
        user_id: user.id,
        subject: subject.key,
        topic: topic.trim(),
        my_answer: myAnswer,
        correct_answer: correctAnswer,
        note: note.trim() || null,
        image_path: imagePath,
        is_resolved: false,
      });
      reward("question_solved", {
        count: 1,
        statUpdates: [{ type: "increment", key: "totalQuestions" }],
      });
      navigation.goBack();
    } catch (err) {
      Alert.alert("Hata", "Kaydederken bir sorun oluştu.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={10}
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            backgroundColor: C.surface,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: C.border,
          }}
        >
          <Icon name="x" size={18} color={C.text} />
        </Pressable>
        <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 17, color: C.text }}>
          Yanlış Ekle
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <Label>Ders</Label>
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          {subjects.map((s) => {
            const active = subject.key === s.key;
            return (
              <Pressable
                key={s.key}
                onPress={() => setSubject(s)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderRadius: 14,
                  backgroundColor: active ? s.color + "22" : C.surface,
                  borderWidth: 1,
                  borderColor: active ? s.color : C.border,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Icon name={s.icon} size={18} color={active ? s.color : C.sec} />
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 13,
                    color: active ? s.color : C.sec,
                  }}
                >
                  {s.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Label>Konu</Label>
        <TextInput
          value={topic}
          onChangeText={setTopic}
          placeholder="ör. Üslü Sayılar"
          placeholderTextColor={C.muted}
          style={inputStyle}
        />

        <Label>Şıklar</Label>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Text style={miniLabel}>Cevabın</Text>
            <View style={{ flexDirection: "row", gap: 6, marginTop: 6 }}>
              {ANSWERS.map((a) => {
                const active = myAnswer === a;
                return (
                  <Pressable
                    key={a}
                    onPress={() => setMyAnswer(a)}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 10,
                      backgroundColor: active ? C.red + "22" : C.surface,
                      borderWidth: 1,
                      borderColor: active ? C.red : C.border,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 13,
                        color: active ? C.red : C.sec,
                      }}
                    >
                      {a}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
        <View style={{ marginTop: 10 }}>
          <Text style={miniLabel}>Doğru Cevap</Text>
          <View style={{ flexDirection: "row", gap: 6, marginTop: 6 }}>
            {ANSWERS.map((a) => {
              const active = correctAnswer === a;
              return (
                <Pressable
                  key={a}
                  onPress={() => setCorrectAnswer(a)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 10,
                    backgroundColor: active ? C.green + "22" : C.surface,
                    borderWidth: 1,
                    borderColor: active ? C.green : C.border,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 13,
                      color: active ? C.green : C.sec,
                    }}
                  >
                    {a}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Label>Not</Label>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Nerede takıldın? Tekrar bakman gereken şey ne?"
          placeholderTextColor={C.muted}
          multiline
          style={[inputStyle, { minHeight: 90, textAlignVertical: "top", paddingTop: 12 }]}
        />

        <Label>Foto (opsiyonel)</Label>
        <Pressable
          onPress={pickImage}
          style={{
            height: image ? 180 : 100,
            borderRadius: 16,
            backgroundColor: C.surface,
            borderWidth: 1,
            borderColor: image ? C.amber + "40" : C.border,
            borderStyle: image ? "solid" : "dashed",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            overflow: "hidden",
          }}
        >
          {image ? (
            <>
              <Image source={{ uri: image }} style={{ width: "100%", height: 180, borderRadius: 14 }} resizeMode="cover" />
              <View style={{
                position: "absolute", bottom: 8, right: 8,
                backgroundColor: C.bg + "CC", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
                flexDirection: "row", alignItems: "center", gap: 4,
              }}>
                <Icon name="camera" size={12} color={C.sec} />
                <Text style={{ fontFamily: "Inter_500Medium", fontSize: 11, color: C.sec }}>Değiştir</Text>
              </View>
            </>
          ) : (
            <>
              <Icon name="camera" size={26} color={C.muted} />
              <Text style={{ fontFamily: "Inter_500Medium", fontSize: 13, color: C.muted }}>
                Foto ekle
              </Text>
            </>
          )}
        </Pressable>
      </ScrollView>

      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: 16,
          backgroundColor: C.bg,
          borderTopWidth: 1,
          borderTopColor: C.border,
        }}
      >
        <Pressable
          onPress={save}
          disabled={saving}
          style={({ pressed }) => ({
            backgroundColor: saving ? C.surface2 : C.amber,
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            gap: 8,
            opacity: pressed && !saving ? 0.85 : 1,
          })}
        >
          {saving && <ActivityIndicator size="small" color={C.muted} />}
          <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 15, color: saving ? C.muted : C.bg }}>
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </Text>
        </Pressable>
      </View>
      <XPToast amount={xpToast.amount} visible={xpToast.visible} onDone={dismissXP} />
      <BadgeUnlockModal badge={badgeModal.badge} visible={badgeModal.visible} onClose={dismissBadge} />
    </SafeAreaView>
  );
}

const inputStyle = {
  backgroundColor: C.surface,
  borderWidth: 1,
  borderColor: C.border,
  borderRadius: 14,
  paddingHorizontal: 14,
  paddingVertical: 14,
  fontFamily: "Inter_400Regular",
  fontSize: 15,
  color: C.text,
};

const miniLabel = {
  fontFamily: "Inter_500Medium",
  fontSize: 11,
  color: C.muted,
  letterSpacing: 0.4,
  textTransform: "uppercase",
};

function Label({ children }) {
  return (
    <Text
      style={{
        fontFamily: "Inter_600SemiBold",
        fontSize: 12,
        color: C.sec,
        marginTop: 18,
        marginBottom: 8,
        letterSpacing: 0.4,
        textTransform: "uppercase",
      }}
    >
      {children}
    </Text>
  );
}
