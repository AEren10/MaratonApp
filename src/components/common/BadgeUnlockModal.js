import { useMemo } from "react";
import { View, Text, Pressable, Modal, StyleSheet } from "react-native";
import { IconBox } from "../design";
import { useC } from "../../contexts/ThemeContext";

export function BadgeUnlockModal({ badge, visible, onClose }) {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);
  if (!badge) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.backdrop}>
        <View style={s.content}>
          <Text style={s.congrats}>Tebrikler! 🎉</Text>

          <View style={s.badgeWrap}>
            <View style={[s.badgeRing, { borderColor: badge.color + "60" }]}>
              <IconBox icon={badge.icon} color={badge.color} size={80} rounded={24} />
            </View>
          </View>

          <Text style={s.badgeName}>{badge.name}</Text>
          <Text style={s.badgeDesc}>{badge.desc}</Text>

          <Pressable onPress={onClose} style={({ pressed }) => [s.btn, pressed && { opacity: 0.8 }]}>
            <Text style={s.btnText}>Harika!</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function makeStyles(C) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.75)",
      alignItems: "center",
      justifyContent: "center",
    },
    content: {
      backgroundColor: C.surface,
      borderRadius: 32,
      borderWidth: 1,
      borderColor: C.border,
      padding: 32,
      alignItems: "center",
      marginHorizontal: 32,
      width: "85%",
      maxWidth: 340,
    },
    congrats: {
      fontFamily: "SpaceGrotesk_700Bold",
      fontSize: 24,
      color: C.text,
      marginBottom: 24,
    },
    badgeWrap: {
      marginBottom: 20,
    },
    badgeRing: {
      borderWidth: 3,
      borderRadius: 28,
      padding: 4,
    },
    badgeName: {
      fontFamily: "SpaceGrotesk_700Bold",
      fontSize: 20,
      color: C.text,
      marginBottom: 8,
    },
    badgeDesc: {
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      color: C.sec,
      textAlign: "center",
      marginBottom: 28,
      lineHeight: 20,
    },
    btn: {
      backgroundColor: C.amber,
      borderRadius: 16,
      paddingHorizontal: 40,
      paddingVertical: 14,
      shadowColor: C.amber,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
    btnText: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 16,
      color: "#FFFFFF",
    },
  });
}
