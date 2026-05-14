function normalizeInput(value: string) {
  return value.replace(/\r\n/g, "\n");
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
    a.localeCompare(b),
  );
  return `{${entries
    .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`)
    .join(",")}}`;
}

function djb2Hash(input: string) {
  let hash = 5381;
  for (let index = 0; index < input.length; index += 1) {
    hash = ((hash << 5) + hash + input.charCodeAt(index)) >>> 0;
  }
  return hash >>> 0;
}

export class SeededRandom {
  private state: number;

  constructor(seed: string | number) {
    const seedValue = typeof seed === "number" ? String(seed) : seed;
    this.state = djb2Hash(normalizeInput(seedValue)) || 1;
  }

  next() {
    this.state = (1664525 * this.state + 1013904223) >>> 0;
    return this.state / 0x100000000;
  }

  nextInt(maxExclusive: number) {
    return Math.floor(this.next() * maxExclusive);
  }

  pick<T>(items: T[]) {
    if (items.length === 0) {
      throw new Error("Cannot pick from an empty array");
    }
    return items[this.nextInt(items.length)];
  }
}

export function deterministicHash(input: string) {
  return `djb2:${djb2Hash(normalizeInput(input)).toString(16).padStart(8, "0")}`;
}

export function proofHash(data: Record<string, unknown>) {
  return `proof:${djb2Hash(stableStringify(data)).toString(16).padStart(8, "0")}`;
}
