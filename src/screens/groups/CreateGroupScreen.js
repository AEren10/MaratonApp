import { useState } from "react";
import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "../../components/design/Icon";
import { useC } from "../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, SHAPE, CONTROL, GUTTER } from "../../themes/tokens";
import { SCREENS } from "../../constants/screens";
import { useGroupActions } from "../../hooks/useGroupActions";
import { CreateGroupForm } from "./components/CreateGroupForm";
import { CreatedGroupModal } from "./components/CreatedGroupModal";
import * as H from "../../lib/haptics";

export default function CreateGroupScreen() {
  const C = useC();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { createGroup, busy } = useGroupActions();
  const [createdGroup, setCreatedGroup] = useState(null);

  const handleBack = () => {
    H.tap();
    navigation.goBack();
  };

  const handleCreate = async (formData) => {
    try {
      const res = await createGroup(formData);
      H.success();
      setCreatedGroup(res);
    } catch {
      // Error handled by hook
    }
  };

  const handleProceed = () => {
    if (!createdGroup) return;
    const group = createdGroup;
    setCreatedGroup(null);
    navigation.replace(SCREENS.GROUP_DETAIL, { groupId: group.id, groupName: group.name });
  };

  return (
    <SafeAreaView edges={["top"]} style={[styles.safeArea, { backgroundColor: C.bg }]}>
      <View style={[styles.header, { borderBottomColor: C.line }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Geri"
          onPress={handleBack}
          style={({ pressed }) => [
            styles.backBtn,
            { backgroundColor: C.surface, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Icon name="chevL" size={20} color={C.text} />
        </Pressable>
        <Text style={[styles.title, { color: C.text }]}>Grup Kur</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 56 : 0}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.leadText, { color: C.text2 }]}>
            Kendi çalışma ekibini oluştur, haftalık ortak soru hedefini belirle ve arkadaşlarını davet et.
          </Text>

          <CreateGroupForm onSubmit={handleCreate} busy={busy} />
        </ScrollView>
      </KeyboardAvoidingView>

      <CreatedGroupModal
        visible={!!createdGroup}
        group={createdGroup}
        onProceed={handleProceed}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: GUTTER,
    paddingVertical: STEP.s2,
    borderBottomWidth: 1,
    minHeight: 56,
  },
  backBtn: {
    width: CONTROL.buttonTertiary,
    height: CONTROL.buttonTertiary,
    borderRadius: SHAPE.iconBox,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    ...TYPOGRAPHY.subheading,
  },
  placeholder: {
    width: CONTROL.buttonTertiary,
  },
  scrollContent: {
    paddingHorizontal: GUTTER,
    paddingTop: STEP.s3,
    paddingBottom: STEP.s5,
  },
  leadText: {
    ...TYPOGRAPHY.body,
    marginBottom: STEP.s3,
  },
});
