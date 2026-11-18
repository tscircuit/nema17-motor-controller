import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["In1"],
  pin2: ["GND"],
  pin3: ["In0"],
  pin4: ["Y"],
  pin5: ["VCC"],
  pin6: ["In2"]
} as const

const pinAttributes = {
  pin1: {isInput: true},
  pin2: {requiresGround: true},
  pin3: {isInput: true},
  pin4: {isOutput: true},
  pin6: {isInput: true},
  pin5: {requiresPower: true, shouldHaveDecouplingCapacitor: true, recommendedDecouplingCapacitorCapacitance: "100nF"}
} as const

export const SN74LVC1G97DRLR = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
  "jlcpcb": [
    "C2682094"
  ]
}}
      manufacturerPartNumber="SN74LVC1G97DRLR"
      footprint={<footprint>
        <smtpad portHints={["pin1"]} pcbX="-0.499999mm" pcbY="-0.64008mm" width="0.2800096mm" height="0.6800088mm" shape="rect" />
<smtpad portHints={["pin2"]} pcbX="-0.000127mm" pcbY="-0.64008mm" width="0.2800096mm" height="0.6800088mm" shape="rect" />
<smtpad portHints={["pin3"]} pcbX="0.499999mm" pcbY="-0.64008mm" width="0.2800096mm" height="0.6800088mm" shape="rect" />
<smtpad portHints={["pin4"]} pcbX="0.499999mm" pcbY="0.64008mm" width="0.2800096mm" height="0.6800088mm" shape="rect" />
<smtpad portHints={["pin5"]} pcbX="-0.000127mm" pcbY="0.64008mm" width="0.2800096mm" height="0.6800088mm" shape="rect" />
<smtpad portHints={["pin6"]} pcbX="-0.499999mm" pcbY="0.64008mm" width="0.2800096mm" height="0.6800088mm" shape="rect" />
<silkscreenpath route={[{"x":-0.8762746000000021,"y":-0.6761987999999945},{"x":-0.8762746000000021,"y":0.6761987999999945}]} />
<silkscreenpath route={[{"x":0.8761221999999975,"y":-0.6761987999999945},{"x":0.8761221999999975,"y":0.6761987999999945}]} />
<silkscreencircle pcbX="-0.949833mm" pcbY="-0.94996mm" radius="0.07493mm" />
<silkscreentext text="{NAME}" pcbX="-0.061849mm" pcbY="1.9906mm" anchorAlignment="center" fontSize="1mm" />
<courtyardoutline outline={[{"x":-1.0499475999999959,"y":1.2300843999999813},{"x":1.0500492000000037,"y":1.2300843999999813},{"x":1.0500492000000037,"y":-1.2300843999999955},{"x":-1.0499475999999959,"y":-1.2300843999999955},{"x":-1.0499475999999959,"y":1.2300843999999813}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C2682094.obj?uuid=52c348d94bf141ea80650d0613706b8c",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C2682094.step?uuid=52c348d94bf141ea80650d0613706b8c",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: -0.00005079999999679785, y: 0, z: 0 },
      }}
      {...props}
    />
  )
}