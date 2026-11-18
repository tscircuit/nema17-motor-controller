/** Skyline packing of measured schematic groups; no component coordinates or named exceptions. */
export function packMeasuredGroups<T extends {width: number; height: number}>(blocks: T[], availableWidth: number) {
  const placed: Array<T & {x: number; y: number}> = [];
  const width = Math.max(availableWidth, ...blocks.map(block => block.width));
  for (const block of blocks) {
    const candidates = [0, ...placed.map(other => other.x + other.width)]
      .filter(x => x + block.width <= width + 1e-8)
      .map(x => ({ x, y: Math.max(0, ...placed
        .filter(other => x < other.x + other.width - 1e-8 && x + block.width > other.x + 1e-8)
        .map(other => other.y + other.height)) }))
      .sort((a, b) => a.y - b.y || a.x - b.x);
    placed.push({...block, ...candidates[0]!});
  }
  return placed;
}
