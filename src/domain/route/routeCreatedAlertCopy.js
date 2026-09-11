function pluralCount(count, label) {
  return count > 0 ? `${count} ${label}` : null;
}

function revisionCountLine(counts = {}) {
  return [
    pluralCount(counts.added, "yeni durak"),
    pluralCount(counts.moved, "taşınan durak"),
    pluralCount(counts.resized, "yük güncellemesi"),
    pluralCount(counts.removed, "çıkan durak"),
  ].filter(Boolean).join(", ");
}

function revisionMessage(revisionSummary) {
  if (!revisionSummary) return "Rota yeniden analiz edildi. Yeni planın önceki ilerlemeni ezmeden güncellendi.";
  if (!revisionSummary.changed) {
    return "Yeni veriler rotayı değiştirmedi. Mevcut plana güvenle devam edebilirsin.";
  }

  const countLine = revisionCountLine(revisionSummary.counts);
  const detail = countLine ? `: ${countLine}` : "";
  if (revisionSummary.decision?.urgency === "low") {
    return `${revisionSummary.decision.reason}${detail}. ${revisionSummary.nextAction}`;
  }
  return `${revisionSummary.headline}${detail}. ${revisionSummary.nextAction}`;
}

export function buildRouteCreatedAlertCopy({ action, routeCreated, revisionSummary } = {}) {
  const urgency = revisionSummary?.decision?.urgency || null;
  const title = routeCreated
    ? revisionSummary?.changed === false
      ? "Rota aynı kaldı"
      : urgency === "low" ? "Rota ince ayar aldı" : "Rota güncellendi"
    : "Rota oluşturuldu";
  const baseMessage = routeCreated
    ? revisionMessage(revisionSummary)
    : "İlk hafta durakların kilitlendi. Tamamladıkların sonraki revizyonlarda korunacak.";
  const actionMessage = action ? `${action.title}\n${action.message}` : null;

  return {
    title,
    message: [baseMessage, actionMessage].filter(Boolean).join("\n\n"),
  };
}
