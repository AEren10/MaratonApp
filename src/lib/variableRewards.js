const MULTIPLIERS = [
  { value: 1, weight: 60 },
  { value: 1.5, weight: 25 },
  { value: 2, weight: 12 },
  { value: 3, weight: 3 },
];

function weightedRandom(options) {
  const total = options.reduce((sum, o) => sum + o.weight, 0);
  let rand = Math.random() * total;
  for (const opt of options) {
    rand -= opt.weight;
    if (rand <= 0) return opt;
  }
  return options[0];
}

export function rollMultiplier() {
  return weightedRandom(MULTIPLIERS).value;
}

export function shouldApplyMultiplier() {
  return Math.random() < 0.15;
}
