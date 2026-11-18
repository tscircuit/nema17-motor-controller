import type { ResistorProps } from "@tscircuit/props"

export const HoLRT1206_1W_300mR_1_ = (props: Omit<ResistorProps, "resistance">) => {
  const { name = "R1", ...restProps } = props

  return (
    <resistor
      name={name}
      resistance="300mohm"
      supplierPartNumbers={{
  "jlcpcb": [
    "C5127777"
  ]
}}
      manufacturerPartNumber="HoLRT1206-1W-300mR-1%"
      footprint="smdpads2_p2.9576mm_pw1.2075mm_ph1.701mm"
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C5127777.obj?uuid=da5f078ee43c429f91838a456f48f0a8",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C5127777.step?uuid=da5f078ee43c429f91838a456f48f0a8",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0, y: 0, z: 0 },
      }}
      {...restProps}
    />
  )
}