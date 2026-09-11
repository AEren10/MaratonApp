import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { SectionLabel } from "../../../components/design";
import { AddTaskSubjectRow } from "./AddTaskSubjectRow";

function GroupHeading({ label, C }) {
  return (
    <Text style={[TYPOGRAPHY.micro, st.groupLabel, { color: C.text3 }]}>{label}</Text>
  );
}

export function AddTaskSubjectList({ groups, subjectKey, onPick, C }) {
  return (
    <View>
      <SectionLabel>Ders</SectionLabel>
      <View style={st.list}>
        {groups.map((group, gi) => (
          <View key={group.label || gi}>
            {groups.length > 1 ? <GroupHeading label={group.label} C={C} /> : null}
            {group.items.map((sub) => (
              <AddTaskSubjectRow
                key={sub.key}
                subject={sub}
                selected={subjectKey === sub.key}
                onPress={() => onPick(sub.key)}
                C={C}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  list: { marginTop: 2 },
  groupLabel: { marginTop: STEP.s2, marginBottom: 2 },
});
