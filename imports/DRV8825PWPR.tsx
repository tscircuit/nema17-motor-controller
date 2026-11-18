import { Children, cloneElement, isValidElement } from "react";
import { DRV8825PWPR as JlcDriver } from "./jlc/DRV8825PWPR";
import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["CP1"],
  pin2: ["CP2"],
  pin3: ["VCP"],
  pin4: ["VMA", "VM"],
  pin5: ["AOUT1"],
  pin6: ["ISENA", "AISEN"],
  pin7: ["AOUT2"],
  pin8: ["BOUT2"],
  pin9: ["ISENB", "BISEN"],
  pin10: ["BOUT1"],
  pin11: ["VMB"],
  pin12: ["AVREF"],
  pin13: ["BVREF"],
  pin14: ["GND1"],
  pin15: ["V3P3OUT"],
  pin16: ["nRESET"],
  pin17: ["nSLEEP", "nSleep"],
  pin18: ["nFAULT", "nFault"],
  pin19: ["DECAY"],
  pin20: ["DIR"],
  pin21: ["nENBL"],
  pin22: ["STEP"],
  pin23: ["NC"],
  pin24: ["MODE0"],
  pin25: ["MODE1"],
  pin26: ["MODE2"],
  pin27: ["nHOME"],
  pin28: ["GND2"],
  pin29: ["EP"]
} as const

const pinAttributes = {
  pin14: {requiresGround: true},
  pin23: {doNotConnect: true},
  pin28: {requiresGround: true},
  pin29: {requiresGround: true}
} as const

const footprinterPinLabels = {
  ...pinLabels,
  "pin29": [...pinLabels["pin29"], "thermalpad"],
} as const

export const DRV8825PWPR = (props: ChipProps<typeof pinLabels>) => {
  const importedFootprint = JlcDriver({name: props.name}).props.footprint;
  let viaIndex = 0;
  // Keep the supplier geometry unchanged; explicitly bind its embedded vias
  // to EP because this core version misses some rotated pad-containment joins.
  const footprint = cloneElement(importedFootprint, {}, Children.map(importedFootprint.props.children, child => {
    if (!isValidElement(child) || child.type !== "via") return child;
    return cloneElement(child as any, {name: `DRV_IMPORTED_EP_${++viaIndex}`, connectsTo: "pin29", tented: "both_sides"});
  }));
  return (
    <chip
      pinLabels={footprinterPinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
  "jlcpcb": [
    "C81582"
  ]
}}
      manufacturerPartNumber="DRV8825PWPR"
      footprint={footprint}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C81582.obj?uuid=8cb208170c6a49d2a22c82795805910d",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C81582.step?uuid=8cb208170c6a49d2a22c82795805910d",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: -0.000012699999842880061, y: 0, z: -0.65 },
      }}
      {...props}
    />
  )
}