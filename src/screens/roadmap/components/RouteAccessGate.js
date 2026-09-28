import { StyleSheet, View } from "react-native";

import { EmptyState, ErrorState, Skeleton } from "../../../components/design";
import { GUTTER, SHAPE, STEP } from "../../../themes/tokens";

// Rota ekranlarinin ortak kapisi: erisim yukleniyor / dogrulanamadi / Pro.
// Kopya eski Rota Detay'dan birebir tasindi; aksiyonlar ayni.
export function RouteAccessGate({ loading, error, hasAccess, onRetry, onPaywall, children }) {
  if (loading) {
    return (
      <View style={s.wrap} accessibilityLabel="Rota yükleniyor">
        <Skeleton width="42%" height={12} radius={SHAPE.chip} />
        <Skeleton width="100%" height={220} radius={SHAPE.card} style={s.gap} />
        <Skeleton width="100%" height={120} radius={SHAPE.sheet} style={s.gap} />
        <Skeleton width="100%" height={64} radius={SHAPE.card} style={s.gap} />
      </View>
    );
  }
  if (error) {
    return (
      <View style={s.center}>
        <ErrorState
          title="Rota erişimi doğrulanamadı"
          body="Bağlantını kontrol edip yeniden deneyebilirsin. Rotan ve geçmiş ilerlemen güvende."
          primary="Tekrar dene"
          onPrimary={onRetry}
        />
      </View>
    );
  }
  if (!hasAccess) {
    return (
      <View style={s.center}>
        <EmptyState
          title="Kişisel rota Pro'da"
          body="İlk 7 günden sonra rota, tahmin bandı ve tempo senaryoları Pro ile devam eder. Geçmiş rotan silinmez."
          primary="Pro'yu incele"
          onPrimary={onPaywall}
        />
      </View>
    );
  }
  return children;
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: GUTTER, paddingTop: STEP.s4 },
  gap: { marginTop: STEP.s3 },
  center: { flex: 1, justifyContent: "center", paddingHorizontal: GUTTER },
});
