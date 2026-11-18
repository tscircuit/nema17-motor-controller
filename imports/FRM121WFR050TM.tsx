import type { ResistorProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["pin1"],
  pin2: ["pin2"]
} as const

export const FRM121WFR050TM = (props: Omit<ResistorProps, "resistance">) => {
  return (
    <resistor
      resistance="0.05ohm"
      supplierPartNumbers={{
  "jlcpcb": [
    "C7467249"
  ]
}}
      manufacturerPartNumber="FRM121WFR050TM"
      footprint="smdpads2_p2.9576mm_pw1.2075mm_ph1.701mm"
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C7467249.obj?uuid=da5f078ee43c429f91838a456f48f0a8",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C7467249.step?uuid=da5f078ee43c429f91838a456f48f0a8",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0, y: 0, z: 0 },
      }}
      {...props}
    />
  )
}