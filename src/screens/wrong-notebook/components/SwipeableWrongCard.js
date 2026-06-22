import React, { useRef, useCallback } from "react";
import { Text, Pressable } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY } from "../../../themes/tokens";
import { WrongCard } from "./WrongCard";
import * as H from "../../../lib/haptics";

export const SwipeableWrongCard = React.memo(function SwipeableWrongCard({ item, onPress, onResolve, onShare, onDelete, shared }) {
  const C = useC();
  const ref = useRef(null);

  const handlePress = useCallback(() => onPress?.(item), [onPress, item]);
  const handleShare = useCallback(() => onShare?.(item), [onShare, item]);

  const handleResolve = useCallback(() => {
    ref.current?.close();
    H.success();
    onResolve?.(item.id);
  }, [onResolve, item.id]);

  const handleDelete = useCallback(() => {
    ref.current?.close();
    H.warn();
    onDelete?.();
  }, [onDelete]);

  const actionStyle = {
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    width: 80,
  };

  const renderRight = useCallback(() => {
    if (item.is_resolved) return null;
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Çözdüm"
        accessibilityHint="Yanlışı çözülmüş olarak işaretler"
        onPress={handleResolve}
        style={{ ...actionStyle, backgroundColor: C.green, marginLeft: 8 }}
      >
        <Icon name="check" size={24} color="#FFFFFF" sw={2.5} />
        <Text style={{ ...TYPOGRAPHY.micro, color: "#FFFFFF", marginTop: 4 }}>Çözdüm</Text>
      </Pressable>
    );
  }, [C, handleResolve, item.is_resolved]);

  const renderLeft = useCallback(() => {
    if (!onDelete) return null;
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Sil"
        accessibilityHint="Yanlış soruyu siler"
        onPress={handleDelete}
        style={{ ...actionStyle, backgroundColor: C.red, marginRight: 8 }}
      >
        <Icon name="trash" size={24} color="#FFFFFF" sw={2} />
        <Text style={{ ...TYPOGRAPHY.micro, color: "#FFFFFF", marginTop: 4 }}>Sil</Text>
      </Pressable>
    );
  }, [C, handleDelete, onDelete]);

  const onSwipeOpen = useCallback((dir) => {
    if (dir === "right" && !item.is_resolved) handleResolve();
  }, [item.is_resolved, handleResolve]);

  return (
    <Swipeable
      ref={ref}
      renderRightActions={renderRight}
      renderLeftActions={renderLeft}
      onSwipeableOpen={onSwipeOpen}
      overshootRight={false}
      overshootLeft={false}
      friction={2}
      rightThreshold={40}
      leftThreshold={40}
    >
      <WrongCard
        item={item}
        onPress={handlePress}
        onResolve={handleResolve}
        onShare={handleShare}
        shared={shared}
      />
    </Swipeable>
  );
});
