import { useMemo } from "react";
import { Pressable, View, Text, Switch } from "react-native";
import { Icon, IconBox } from "../../../components/design";
import { TYPOGRAPHY, SPACING } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

export function SettingsRow({ icon, iconColor, label, toggle, value, onToggle, onPress, disabled }) {
  const C = useC();
  const styles = useMemo(() => makeStyles(C), [C]);

  const content = (
    <View style={styles.row}>
      <IconBox icon={icon} color={iconColor ?? C.amber} size={38} rounded={12} />
      <Text style={styles.label} numberOfLines={1}>{label}</Text>
      {toggle ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          disabled={disabled}
          trackColor={{ false: C.border, true: C.amber + "80" }}
          thumbColor={value ? C.amber : C.muted}
        />
      ) : (
        <Icon name="chevR" size={18} color={C.muted} />
      )}
    </View>
  );

  if (toggle) return <View style={styles.wrapper}>{content}</View>;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.wrapper, { opacity: pressed ? 0.7 : 1 }]}
    >
      {content}
    </Pressable>
  );
}

const makeStyles = (C) => ({
  wrapper: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  label: {
    ...TYPOGRAPHY.bodyMedium,
    color: C.text,
    flex: 1,
  },
});
