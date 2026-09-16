import { useEffect } from "react";
import { BackHandler } from "react-native";
import { useNavigation } from "@react-navigation/native";

export function useBlockBack(shouldBlock = true) {
  const navigation = useNavigation();

  useEffect(() => {
    if (!shouldBlock) return;
    
    // Disable iOS swipe back
    navigation.setOptions({ gestureEnabled: false });
    
    // Disable Android hardware back button
    const onBackPress = () => true;
    const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);

    return () => {
      navigation.setOptions({ gestureEnabled: true });
      subscription.remove();
    };
  }, [navigation, shouldBlock]);
}
