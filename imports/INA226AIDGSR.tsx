import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["A1"],
  pin2: ["A0"],
  pin3: ["Alert"],
  pin4: ["SDA"],
  pin5: ["SCL"],
  pin6: ["VS_POS"],
  pin7: ["GND"],
  pin8: ["VBUS"],
  pin9: ["VIN_NEG"],
  pin10: ["VIN_POS"]
} as const

const pinAttributes = {
  pin7: {requiresGround: true},
  pin8: {isInput: true},
  pin1: {isInput: true},
  pin2: {isInput: true},
  pin3: {isOutput: true, needsExternalPullup: true, canUseOpenDrain: true},
  pin4: {isBidirectional: true, capabilities: ["i2c_sda"], needsExternalPullup: true, canUseOpenDrain: true},
  pin5: {isInput: true, capabilities: ["i2c_scl"], needsExternalPullup: true},
  pin10: {isInput: true},
  pin9: {isInput: true},
  pin6: {requiresPower: true, shouldHaveDecouplingCapacitor: true, recommendedDecouplingCapacitorCapacitance: "100nF"}
} satisfies NonNullable<ChipProps["pinAttributes"]>

export const INA226AIDGSR = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
  "jlcpcb": [
    "C49851"
  ]
}}
      manufacturerPartNumber="INA226AIDGSR"
      footprint={<footprint>
        <smtpad portHints={["pin1"]} pcbX="-0.999998mm" pcbY="-2.109978mm" width="0.2800096mm" height="1.620012mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin2"]} pcbX="-0.499872mm" pcbY="-2.109978mm" width="0.2800096mm" height="1.620012mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin3"]} pcbX="0mm" pcbY="-2.109978mm" width="0.2800096mm" height="1.620012mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin4"]} pcbX="0.500126mm" pcbY="-2.109978mm" width="0.2800096mm" height="1.620012mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin5"]} pcbX="0.999998mm" pcbY="-2.109978mm" width="0.2800096mm" height="1.620012mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin10"]} pcbX="-0.999998mm" pcbY="2.109978mm" width="0.2800096mm" height="1.620012mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin9"]} pcbX="-0.499872mm" pcbY="2.109978mm" width="0.2800096mm" height="1.620012mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin8"]} pcbX="0mm" pcbY="2.109978mm" width="0.2800096mm" height="1.620012mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin7"]} pcbX="0.500126mm" pcbY="2.109978mm" width="0.2800096mm" height="1.620012mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin6"]} pcbX="0.999998mm" pcbY="2.109978mm" width="0.2800096mm" height="1.620012mm" radius="0.1400048mm" shape="pill" />
<silkscreenpath route={[{"x":-1.5761970000000929,"y":-1.0713974000000235},{"x":-1.5761970000000929,"y":1.0713974000000235},{"x":1.5761969999998655,"y":1.0713974000000235},{"x":1.5761969999998655,"y":-1.0713974000000235},{"x":-1.5761970000000929,"y":-1.0713974000000235}]} />
<silkscreencircle pcbX="-0.999998mm" pcbY="-0.319024mm" radius="0.150114mm" />
<silkscreencircle pcbX="-1.592326mm" pcbY="-2.109978mm" radius="0.150114mm" />
<silkscreentext text="{NAME}" pcbX="-0.0889mm" pcbY="3.7686mm" anchorAlignment="center" fontSize="1mm" />
<courtyardoutline outline={[{"x":-1.7499970000000076,"y":3.169984000000113},{"x":1.7499969999998939,"y":3.169984000000113},{"x":1.7499969999998939,"y":-3.1699839999999995},{"x":-1.7499970000000076,"y":-3.1699839999999995},{"x":-1.7499970000000076,"y":3.169984000000113}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C49851.obj?uuid=a8ab40c7a7c54773a59b712bf86c7131",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C49851.step?uuid=a8ab40c7a7c54773a59b712bf86c7131",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0, y: 0, z: 0 },
      }}
      {...props}
    />
  )
}
