import type { ChipProps } from "@tscircuit/props";
import { BSS84_7_F } from "./jlc/BSS84_7_F";

const pinLabels = {
  pin1: ["gate"],
  pin2: ["source"],
  pin3: ["drain"],
} as const;

/** Exact C85202 JLCsearch/EasyEDA import; retain the existing schematic aliases. */
export const BSS84 = (props: ChipProps<typeof pinLabels>) => {
  const imported = BSS84_7_F({ name: props.name });
  return <chip {...imported.props} pinLabels={pinLabels} symbol={undefined} {...props} />;
};
