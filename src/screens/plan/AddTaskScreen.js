import { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Icon, Button } from "../../components/design";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { AddTaskSubjectRow } from "./components/AddTaskSubjectRow";

function SectionHeader({ title, C }) {
  return (
    <Text style={[TYPOGRAPHY.label, { color: C.text2, letterSpacing: 1, marginTop: STEP.s5, marginBottom: STEP.s3 }]}>
      {title}
    </Text>
  );
}

function Pill({ label, selected, onPress, C }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        s.pill,
        { 
          borderColor: selected ? C.accent : C.elev,
          backgroundColor: selected ? C.brandTint : C.surface
        }
      ]}
    >
      <Text style={[TYPOGRAPHY.metaSemiBold, { color: selected ? C.text : C.text3 }]}>{label}</Text>
    </Pressable>
  );
}

function ListItemRow({ label, value, C, isLast }) {
  return (
    <View style={[s.listItem, { borderBottomColor: C.line, borderBottomWidth: isLast ? 0 : 1 }]}>
      <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text2, flex: 1 }]}>{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]}>{value}</Text>
        <Icon name="chevR" size={14} color={C.text4} />
      </View>
    </View>
  );
}

export default function AddTaskScreen() {
  const navigation = useNavigation();
  const C = useC();
  
  const [subjectKey, setSubjectKey] = useState("matematik");
  const [durVal, setDurVal] = useState("50 dk");
  const [repeat, setRepeat] = useState(true);

  // Mocks based on Image 5
  const subjects = [
    { key: "turkce", name: "Türkçe" },
    { key: "matematik", name: "Matematik" },
    { key: "fizik", name: "Fizik" },
    { key: "kimya", name: "Kimya" },
    { key: "biyoloji", name: "Biyoloji" },
    { key: "tarih", name: "Tarih" },
  ];
  const durations = ["25 dk", "50 dk", "1,5 sa", "2 sa"];

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Icon name="chevL" size={18} color={C.text} />
          <Text style={[TYPOGRAPHY.subheading, { color: C.text }]}>Durak ekle</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <SectionHeader title="DERS" C={C} />
        <View style={{ borderTopWidth: 1, borderTopColor: C.line }}>
          {subjects.map(s => (
            <AddTaskSubjectRow 
              key={s.key} 
              subject={s} 
              selected={subjectKey === s.key} 
              onPress={() => setSubjectKey(s.key)} 
              C={C} 
            />
          ))}
        </View>

        <SectionHeader title="KONU" C={C} />
        <Pressable style={[s.picker, { backgroundColor: C.surface, borderColor: C.elev }]}>
          <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text, flex: 1 }]}>Permütasyon - Kombinasyon</Text>
          <Icon name="chevD" size={14} color={C.text3} />
        </Pressable>

        <SectionHeader title="SÜRE" C={C} />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: STEP.s2 }}>
          {durations.map(d => (
            <Pill 
              key={d} 
              label={d} 
              selected={durVal === d} 
              onPress={() => setDurVal(d)} 
              C={C} 
            />
          ))}
        </View>

        <SectionHeader title="NE ZAMAN" C={C} />
        <View style={{ paddingBottom: STEP.s4 }}>
          <ListItemRow label="Tarih" value="Bugün · 23 Haz" C={C} />
          <ListItemRow label="Saat" value="19:30" C={C} />
          
          <View style={[s.listItem, { borderBottomWidth: 0, marginTop: STEP.s2 }]}>
            <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text2, flex: 1 }]}>Her hafta tekrarla</Text>
            <Switch 
              value={repeat} 
              onValueChange={setRepeat} 
              trackColor={{ false: C.line, true: C.accent }} 
              thumbColor={C.text} 
            />
          </View>
        </View>

      </ScrollView>

      <View style={[s.bottomAction, { backgroundColor: C.bg }]}>
        <Button variant="primary" size="lg" fullWidth>Rotaya ekle</Button>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: GUTTER, paddingVertical: STEP.s2 },
  scroll: { paddingHorizontal: GUTTER, paddingBottom: 120 },
  picker: { flexDirection: "row", alignItems: "center", paddingHorizontal: STEP.s3, height: 56, borderRadius: SHAPE.panel, borderWidth: 1 },
  pill: { flex: 1, minWidth: "22%", height: 48, borderRadius: SHAPE.panel, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  listItem: { flexDirection: "row", alignItems: "center", height: 56 },
  bottomAction: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: GUTTER, paddingBottom: STEP.s4, paddingTop: STEP.s3 },
});
