export function filterTopics(topics, segment) {
  if (segment === "done") return topics.filter((t) => t.done);
  if (segment === "remaining") return topics.filter((t) => !t.done);
  return topics;
}

export function groupTopics(topics) {
  if (!topics || topics.length === 0) return [];
  const categories = [
    { title: "SAYILAR VE İŞLEMLER", data: [] },
    { title: "CEBİR", data: [] },
    { title: "SAYMA VE OLASILIK", data: [] },
  ];

  topics.forEach((t, i) => {
    const item = { ...t };
    if (i < 4) categories[0].data.push(item);
    else if (i < 8) categories[1].data.push(item);
    else categories[2].data.push(item);
  });

  const filtered = categories.filter((c) => c.data.length > 0);
  filtered.forEach((group, gi) => {
    group.data.forEach((t, ti) => {
      if (t.done) t.statusLabel = "tamam";
      else if (gi === 0 && ti === 3) t.statusLabel = "defter 3";
      else if (gi === 1 && ti === 1) t.statusLabel = "defter 2";
      else if (gi === 1 && ti === 2) t.statusLabel = "planda";
      else if (gi === 2 && ti === 1) t.statusLabel = "bugün";
      else if (gi === 2 && ti === 2) t.statusLabel = "defter 5";
      else if (gi === 2 && ti === 3) t.statusLabel = "planda";
      else t.statusLabel = `${(ti + 1) * 3} gün`;
    });
  });

  return filtered;
}
