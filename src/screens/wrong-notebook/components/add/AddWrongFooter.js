import React, { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "../../../../components/design";
import { GUTTER, STEP, TYPOGRAPHY } from "../../../../themes/tokens";

function AddWrongFooterComponent({ C, onSave, onSaveAndNew, saving }) {
  return (
    <View style={[styles.footer, { backgroundColor: C.bg, borderTopColor: C.line }]}>
      <View style={styles.buttonRow}>
        <View style={styles.buttonCol}>
          <Button
            variant="outline"
            size="lg"
            onPress={onSaveAndNew}
            loading={saving}
            fullWidth
          >
            Yeni Ekle
          </Button>
        </View>
        <View style={styles.buttonCol}>
          <Button
            size="lg"
            onPress={() => onSave()}
            loading={saving}
            fullWidth
          >
            Kaydet
          </Button>
        </View>
      </View>
      <Text style={[TYPOGRAPHY.micro, { color: C.text2, textAlign: "center", marginTop: STEP.s2 }]}>
        Kaydedince 1. gün tekrarına düşer.
      </Text>
    </View>
  );
}

export const AddWrongFooter = memo(AddWrongFooterComponent);

const styles = StyleSheet.create({
  footer: {
    padding: GUTTER,
    paddingBottom: STEP.s2,
    borderTopWidth: 1,
  },
  buttonRow: {
    flexDirection: "row",
    gap: STEP.s2,
  },
  buttonCol: {
    flex: 1,
  },
});
