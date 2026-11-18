import placement from "./next-placement.json";

/** Absolute board coordinates; subtract the origin for parts in translated groups. */
export function revisionPlacement(name: string, origin = {x: 0, y: 0}) {
  const position = (placement as Record<string, {pcbX:number; pcbY:number; pcbRotation:number}>)[name];
  if (!position) throw new Error(`Missing PCB placement for ${name}`);
  return {...position, pcbX:position.pcbX-origin.x, pcbY:position.pcbY-origin.y};
}
