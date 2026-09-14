import { createNavigationContainerRef } from "@react-navigation/native";

// NavigationContainer disindaki global yuzeyler (OfflineBanner) icin tek ref.
export const navigationRef = createNavigationContainerRef();

export function navigateFromOutside(name, params) {
  if (!navigationRef.isReady()) return false;
  const names = navigationRef.getRootState()?.routeNames || [];
  if (!names.includes(name)) return false;
  navigationRef.navigate(name, params);
  return true;
}
