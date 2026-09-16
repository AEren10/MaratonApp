import { useCallback, useMemo } from "react";
import { View, Text, Pressable, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Icon } from "../../components/design";
import { ScreenErrorBoundary } from "../../components/common/ScreenErrorBoundary";
import { useC } from "../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE } from "../../themes/tokens";
import { SCREENS } from "../../constants/screens";

const EMPTY_NOTIFICATIONS = [];

function NotificationsContent() {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);
  const navigation = useNavigation();
  const notifs = EMPTY_NOTIFICATIONS;

  const renderEmpty = () => (
    <Animated.View entering={FadeInDown.duration(500)} style={s.emptyContainer}>
      <View style={s.emptyIcon}>
        <Icon name="bell" size={30} color={C.text3} />
      </View>
      <Text style={s.emptyEyebrow}>ROTA HABERLERİ</Text>
      <Text style={s.emptyTitle}>Şimdilik yeni haber yok.</Text>
      <Text style={s.emptySubtitle}>
        Durağın açıldığında, deneme analizin hazır olduğunda veya hafta özeti geldiğinde bu ekranda birikir.
      </Text>
      
      <Pressable 
        accessibilityRole="button"
        style={({ pressed }) => [s.settingsBtn, pressed && { opacity: 0.86 }]} 
        onPress={() => navigation.navigate(SCREENS.NOTIFICATIONS_SETTINGS)}
      >
        <Text style={s.settingsBtnText}>Bildirim ayarlarına bak</Text>
      </Pressable>
    </Animated.View>
  );

  const handlePressNotif = useCallback(() => {}, []);

  const renderItem = ({ item }) => {
    const isUnread = !item.read;
    const color = C[item.colorKey] || C.accent;
    
    return (
      <Pressable 
        style={({ pressed }) => [
          s.notifCard,
          isUnread && { backgroundColor: C.surface },
          pressed && { opacity: 0.8 }
        ]}
        onPress={handlePressNotif}
      >
        <View style={[s.iconBox, { backgroundColor: color + "18" }]}>
          <View style={[s.iconDot, { backgroundColor: color }]} />
        </View>
        <View style={s.contentBox}>
          <View style={s.kindRow}>
            <Text style={[s.kindText, { color }]}>{item.kind}</Text>
            <Text style={s.timeText}>{item.time}</Text>
          </View>
          <Text style={[s.titleText, !isUnread && { color: C.text2 }]}>{item.title}</Text>
          <Text style={s.descText}>{item.desc}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView edges={["top"]} style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Pressable 
            hitSlop={12} 
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.6 }]}
            accessibilityRole="button"
            accessibilityLabel="Geri"
          >
            <Icon name="chevL" size={18} color={C.text2} />
          </Pressable>
          <Text style={s.headerTitle}>Rota haberleri</Text>
        </View>
      </View>

      <FlatList
        data={notifs}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={notifs.length === 0 ? s.listEmptyContent : s.listContent}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

export default function NotificationsScreen() {
  return (
    <ScreenErrorBoundary>
      <NotificationsContent />
    </ScreenErrorBoundary>
  );
}

function makeStyles(C) {
  return StyleSheet.create({
    safe: { 
      flex: 1, 
      backgroundColor: C.bg 
    },
    header: { 
      flexDirection: "row", 
      alignItems: "center", 
      justifyContent: "space-between", 
      paddingHorizontal: GUTTER, 
      paddingTop: STEP.s1,
      paddingBottom: STEP.s3
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14
    },
    backBtn: {
      marginLeft: -6, // optik hizalama
    },
    headerTitle: { 
      ...TYPOGRAPHY.subheading,
      color: C.text 
    },
    
    // List
    listContent: {
      paddingHorizontal: GUTTER,
      paddingBottom: STEP.s5,
      paddingTop: STEP.s3,
    },
    listEmptyContent: {
      flexGrow: 1,
    },
    
    // Notification Item
    notifCard: {
      flexDirection: "row",
      gap: 14,
      padding: 16,
      marginHorizontal: -12, // Kenarlardan tasma efekti icin (okunmamiş arkaplanini gosterirken)
      borderRadius: SHAPE.cardTight,
    },
    iconBox: {
      width: 38,
      height: 38,
      borderRadius: SHAPE.button,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0
    },
    iconDot: {
      width: 9,
      height: 9,
      borderRadius: 1, // HTML mock'ta hafif kose yumusatmasi var
    },
    contentBox: {
      flex: 1,
    },
    kindRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 6
    },
    kindText: {
      ...TYPOGRAPHY.label,
    },
    timeText: {
      ...TYPOGRAPHY.micro,
      color: C.text3,
    },
    titleText: {
      ...TYPOGRAPHY.bodySemiBold,
      color: C.text,
    },
    descText: {
      ...TYPOGRAPHY.meta,
      color: C.text2,
      marginTop: 4
    },

    // Empty State
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      paddingHorizontal: 40,
      paddingTop: 72,
    },
    emptyIcon: {
      width: 72,
      height: 72,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: C.surface,
      borderWidth: 1,
      borderColor: C.border,
    },
    emptyEyebrow: {
      ...TYPOGRAPHY.label,
      color: C.text3,
      marginTop: STEP.s3,
      textAlign: "center",
    },
    emptyTitle: {
      ...TYPOGRAPHY.subheading,
      color: C.text,
      marginTop: STEP.s1,
      textAlign: "center"
    },
    emptySubtitle: {
      ...TYPOGRAPHY.body,
      color: C.text3,
      marginTop: 12,
      textAlign: "center",
      maxWidth: 256
    },
    settingsBtn: {
      width: "100%",
      height: 52,
      borderWidth: 1,
      borderColor: C.border,
      borderRadius: SHAPE.button,
      alignItems: "center",
      justifyContent: "center",
      marginTop: STEP.s5
    },
    settingsBtnText: {
      ...TYPOGRAPHY.button,
      color: C.text
    }
  });
}
