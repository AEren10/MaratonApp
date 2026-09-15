import { useState, useCallback, useMemo } from "react";
import { View, Text, Pressable, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "../../components/design";
import { useC } from "../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE } from "../../themes/tokens";
import { SCREENS } from "../../constants/screens";

// Mock data based on "Bildirim Halleri" design specs
const INITIAL_NOTIFS = [
  { 
    id: "1", 
    kind: "MARATON", 
    title: "Bugünkü durağın hazır", 
    desc: "Felsefe · Bilgi Felsefesi · 24 dk",
    time: "Şimdi", 
    read: false, 
    colorKey: "accent" 
  },
  { 
    id: "2", 
    kind: "MARATON", 
    title: "Sonuç rotayı değiştirdi", 
    desc: "Bugünkü ilk adım hazır: 20 dakikalık tekrar durağı.",
    time: "Dün", 
    read: true, 
    colorKey: "accent" 
  },
  { 
    id: "3", 
    kind: "MARATON", 
    title: "Bu hafta 3 durağı tamamladın", 
    desc: "Sıradaki durak açıldı: Matematik · Kombinasyon.",
    time: "Pazartesi", 
    read: true, 
    colorKey: "up" 
  },
];

export default function NotificationsScreen() {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);
  const navigation = useNavigation();
  const [notifs, setNotifs] = useState(INITIAL_NOTIFS);

  const unreadCount = notifs.filter(n => !n.read).length;

  const handleMarkAllRead = useCallback(() => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const handlePressNotif = useCallback((id) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const renderEmpty = () => (
    <View style={s.emptyContainer}>
      <Icon name="bell" size={72} color={C.text4} />
      <Text style={s.emptyTitle}>Yeni haber yok.</Text>
      <Text style={s.emptySubtitle}>
        Rotan değiştiğinde, defterinde tekrar zamanı geldiğinde ve hafta kapandığında burada görürsün.
      </Text>
      
      <Pressable 
        style={({ pressed }) => [s.settingsBtn, pressed && { backgroundColor: C.accentPress, transform: [{ scale: 0.98 }] }]} 
        onPress={() => navigation.navigate(SCREENS.NOTIFICATIONS_SETTINGS)}
      >
        <Text style={s.settingsBtnText}>Bildirim ayarlarına bak</Text>
      </Pressable>
    </View>
  );

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
        onPress={() => handlePressNotif(item.id)}
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
          >
            <Icon name="chevronLeft" size={24} color={C.text2} />
          </Pressable>
          <Text style={s.headerTitle}>Rota haberleri</Text>
        </View>

        {unreadCount > 0 && (
          <Pressable hitSlop={12} onPress={handleMarkAllRead}>
            <Text style={s.markReadText}>Tümünü oku</Text>
          </Pressable>
        )}
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
      ...TYPOGRAPHY.h2, 
      color: C.text 
    },
    markReadText: {
      ...TYPOGRAPHY.captionMedium,
      color: C.text3,
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
      fontFamily: "Archivo_700Bold",
      fontSize: 11,
      letterSpacing: 1.76, // 0.16em
      textTransform: "uppercase"
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
      fontFamily: "Archivo_400Regular",
      fontSize: 12.5,
      lineHeight: 18.75, // 1.5
      color: C.text2,
      marginTop: 4
    },

    // Empty State
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      paddingHorizontal: 40,
      paddingTop: 66,
    },
    emptyTitle: {
      ...TYPOGRAPHY.h2,
      color: C.text,
      marginTop: 26,
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
      backgroundColor: C.accent,
      borderRadius: SHAPE.button,
      alignItems: "center",
      justifyContent: "center",
      marginTop: STEP.s5
    },
    settingsBtnText: {
      ...TYPOGRAPHY.button,
      color: C.accentInk
    }
  });
}
