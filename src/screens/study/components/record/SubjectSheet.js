import { Fragment } from "react";
import { Text, StyleSheet } from "react-native";

import { useC, useTheme } from "../../../../contexts/ThemeContext";
import { STEP, TYPOGRAPHY } from "../../../../themes/tokens";
import { RecordSheet, SheetOption } from "./RecordSheet";

// DERS satirindan acilir. Iki grup (TYT/AYT etiketleri mufredattan) tek listede.
export function SubjectSheet({ visible, groups, selectedKey, onSelect, onClose }) {
  const C = useC();
  const theme = useTheme();
  return (
    <RecordSheet visible={visible} label="DERS" onClose={onClose}>
      {groups.filter((g) => g.subjects.length).map((group) => (
        <Fragment key={group.tier}>
          <Text style={[TYPOGRAPHY.label, styles.group, { color: C.text3 }]}>{group.label}</Text>
          {group.subjects.map((s) => (
            <SheetOption
              key={s.key}
              title={s.label || s.name}
              color={theme.subject(s.key)?.solid || s.color}
              selected={selectedKey === s.key}
              onPress={() => { onSelect(s.key, group.tier); onClose(); }}
            />
          ))}
        </Fragment>
      ))}
    </RecordSheet>
  );
}

const styles = StyleSheet.create({
  group: { marginTop: STEP.s2, marginBottom: STEP.s1 },
});
