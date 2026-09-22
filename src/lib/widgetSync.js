// Widget YOK olan platformlar icin bos gecis.
//
// Gercek uygulama widgetSync.ios.js'te. Metro platform uzantisini kendisi
// secer: iOS orayi, digerleri burayi alir. Cagiran taraf platform bilmez,
// `if (Platform.OS === ...)` dallari ekranlara sizmaz.
//
// expo-widgets'in Android yolu su an `enableAndroid` ile opt-in ve deneysel;
// acildiginda bu dosya widgetSync.android.js'e donusur.
export function syncWeekWidget() { return false; }
export function syncTodayWidget() { return false; }
export function syncReviewWidget() { return false; }
export function syncRouteWidget() { return false; }
