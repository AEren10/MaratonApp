import { useRouteConfirm } from "../../hooks/useRouteConfirm";
import { RouteConfirmLayout } from "./components/RouteConfirmLayout";
import { RouteNumbersCard } from "./components/RouteNumbersCard";

// Tasarim AKIS 2 · "Ara Verme": rotayi dondurmadan once ne donacagini
// sayiyla gosteren tam ekran onay. Giris: Durak Detayi uc nokta menusu.
export default function RoutePauseScreen() {
  const d = useRouteConfirm();
  return (
    <RouteConfirmLayout
      title="Rotayı dondurmak bırakmak değil."
      body="Rotan olduğu gibi kalır. Bildirimler durur, seri sayacı donar, hiçbir şey silinmez."
      primaryLabel="Rotayı dondur"
      onPrimary={d.confirmPause}
      loading={d.pausing}
      cancelLabel="Vazgeç, devam ediyorum"
      onCancel={d.goBack}
    >
      <RouteNumbersCard label="DONDURULAN" loading={d.statsLoading} stats={d.frozenStats} />
    </RouteConfirmLayout>
  );
}
