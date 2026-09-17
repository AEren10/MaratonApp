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
    if (i < 4) categories[0].data.push(t);
    else if (i < 8) categories[1].data.push(t);
    else categories[2].data.push(t);
  });
  return categories.filter((c) => c.data.length > 0);
}
