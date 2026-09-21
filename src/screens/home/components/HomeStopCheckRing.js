import { useCallback } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Icon } from "../../../components/design/Icon";
import { useC } from "../../../contexts/ThemeContext";
import { CONTROL, STEP } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";

const RING_SIZE = STEP.s3 + 6;

// Tik halkasi. Yayli buyuyup kuculen animasyon ve onu bekleten 420 ms
// gecikme kaldirildi: kullanici tike bastiginda durum ANINDA degisiyor.
// Geri bildirim dokunsal (H.success) ve renk degisimi — gosteri yok.
export function HomeStopCheckRing({ done, isNext, onToggle, onChecked, accessibilityLabel }) {
  const C = useC();

  const handlePress = useCallback(() => {
    if (done) {
      H.select();
      onToggle();
      return;
    }
    H.success();
    onChecked?.();
    onToggle();
  }, [done, onToggle, onChecked]);

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={STEP.s2}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      accessibilityLabel={accessibilityLabel}
      style={s.area}
    >
      <View
        style={[
          s.ring,
          {
            borderColor: done ? C.up : (isNext ? C.accent : C.text5),
            backgroundColor: done ? C.up : "transparent",
          },
        ]}
      >
        {done ? <Icon name="check" size={13} color={C.bg} sw={2.8} /> : null}
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  area: {
    width: CONTROL.tapMin,
    height: CONTROL.tapMin,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});
