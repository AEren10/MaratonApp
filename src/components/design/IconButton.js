import { Pressable } from "react-native";
import { Icon } from "./Icon";

export function IconButton({ name, size = 22, color, onPress, hitSlop = 12, label, style, sw, ...rest }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={style}
      {...rest}
    >
      <Icon name={name} size={size} color={color} sw={sw} />
    </Pressable>
  );
}
