import { memo } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { Icon } from "../../../components/design";
import { Press } from "../../../components/design/Press";
import { SHAPE, STEP } from "../../../themes/tokens";

export const PreferenceSearchBar = memo(function PreferenceSearchBar({
  query,
  onChangeQuery,
  C,
}) {
  return (
    <View style={[styles.box, { backgroundColor: C.void, borderColor: C.line }]}>
      <Icon name="search" size={17} color={C.text3} />
      <TextInput
        value={query}
        onChangeText={onChangeQuery}
        placeholder="Bölüm veya üniversite ara... (örn: Tıp, Bilgisayar)"
        placeholderTextColor={C.text4}
        style={[styles.input, { color: C.text }]}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {query ? (
        <Press haptic="tap" onPress={() => onChangeQuery("")} hitSlop={10} style={styles.clearBtn}>
          <Icon name="x" size={15} color={C.text3} />
        </Press>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  box: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    borderRadius: SHAPE.chip,
    borderWidth: 1,
    paddingHorizontal: STEP.s2,
    gap: STEP.s1,
    marginTop: STEP.s2,
  },
  input: {
    flex: 1,
    fontFamily: "Archivo_500",
    fontSize: 13,
    paddingVertical: 0,
  },
  clearBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});
