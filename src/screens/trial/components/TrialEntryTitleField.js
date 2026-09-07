import { TextInput } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Icon } from "../../../components/design";

export function TrialEntryTitleField({ C, styles, title, onChangeTitle }) {
  return (
    <Animated.View entering={FadeInDown.delay(100).duration(420).springify()} style={styles.titleRow}>
      <Icon name="edit" size={16} color={C.muted} />
      <TextInput
        accessibilityLabel="Deneme adı"
        value={title}
        onChangeText={onChangeTitle}
        placeholder="Deneme adı (Özdebir, 3D, Limit...)"
        placeholderTextColor={C.muted}
        style={styles.titleInput}
        maxLength={40}
      />
    </Animated.View>
  );
}
