import { Fragment } from "react";
import type { ChipProps } from "@tscircuit/props"
import { symbols } from "schematic-symbols"

const pinLabels = {
  pin1: ["_POS"],
  pin2: ["_NEG"],
  pin3: ["NC1"],
  pin4: ["NC2"]
} as const

const pinAttributes = {
  pin3: {doNotConnect: true},
  pin4: {doNotConnect: true}
} as const

export const HYG_8503A = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      schPinArrangement={{ leftSide: { direction: "top-to-bottom", pins: ["pin1", "pin2"] } }}
      symbol={
        <symbol>
          {symbols.speaker_right.primitives.map((primitive, index) =>
            primitive.type === "path" ? (
              <Fragment key={index}><schematicpath points={primitive.points} strokeWidth={0.05} /></Fragment>
            ) : null,
          )}
          <schematictext  text={props.name} schX={0} schY={0.7} fontSize={0.18} />
          <schematictext text="+" schX={-0.3} schY={0.38} fontSize={0.15} />
          <port name="_POS" pinNumber={1} direction="left" schX={-0.4} schY={0.2} />
          <port name="_NEG" pinNumber={2} direction="left" schX={-0.4} schY={-0.2} />
        </symbol>
      }
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
  "jlcpcb": [
    "C7544813"
  ]
}}
      manufacturerPartNumber="HYG-8503A"
      footprint={<footprint>
        <smtpad portHints={["pin1"]} pcbX="-3.599815mm" pcbY="-3.599942mm" width="2.400046mm" height="2.400046mm" shape="rect" />
<smtpad portHints={["pin2"]} pcbX="3.599815mm" pcbY="-3.599942mm" width="2.400046mm" height="2.400046mm" shape="rect" />
<smtpad portHints={["pin3"]} pcbX="3.599561mm" pcbY="3.599688mm" width="2.400046mm" height="2.400046mm" shape="rect" />
<smtpad portHints={["pin4"]} pcbX="-3.599815mm" pcbY="3.599942mm" width="2.400046mm" height="2.400046mm" shape="rect" />
<silkscreenpath route={[{"x":-2.1686520000000087,"y":4.249851800000016},{"x":2.1683980000000105,"y":4.249851800000016}]} />
<silkscreenpath route={[{"x":-4.249877199999986,"y":-2.1687790000000007},{"x":-4.249877199999986,"y":2.1687790000000007}]} />
<silkscreenpath route={[{"x":2.1686520000000087,"y":-4.250131199999998},{"x":-2.1686520000000087,"y":-4.250131199999998}]} />
<silkscreenpath route={[{"x":4.250131199999998,"y":2.1685250000000025},{"x":4.250131199999998,"y":-2.1687790000000007}]} />
<silkscreenpath route={[{"x":-0.999998000000005,"y":2.499741},{"x":0.9999980000000193,"y":2.499741},{"x":0,"y":3.4997390000000053},{"x":-0.999998000000005,"y":2.499741}]} />
<silkscreentext text="+" pcbX="-0.999871mm" pcbY="-2.500376mm" anchorAlignment="bottom_left" pcbRotation="90deg" fontSize="2.032mm" />
<silkscreentext text="{NAME}" pcbX="-0.000127mm" pcbY="5.800346mm" anchorAlignment="center" fontSize="1mm" />
<fabricationnotepath route={[{"x":-4.479874199999983,"y":-2.680131799999998},{"x":-4.479874199999983,"y":-2.240127599999994},{"x":-2.079878999999991,"y":-2.240127599999994},{"x":-2.079878999999991,"y":-2.7001215999999886},{"x":-4.479874199999983,"y":-2.680131799999998}]} strokeWidth="0.254mm" />
<fabricationnotepath route={[{"x":-3.0800801999999976,"y":-3.6172647999999867},{"x":-3.5200843999999876,"y":-3.6172647999999867},{"x":-3.5200843999999876,"y":-1.2172695999999945},{"x":-3.060090399999993,"y":-1.2172695999999945},{"x":-3.0800801999999976,"y":-3.6172647999999867}]} strokeWidth="0.254mm" />
<fabricationnotepath route={[{"x":-0.9998709999999846,"y":2.4798782000000017},{"x":0.9401302000000129,"y":2.4798782000000017},{"x":0.9401048000000145,"y":2.4798782000000017},{"x":-0.039877999999987424,"y":3.4598610000000036},{"x":-0.9998709999999846,"y":2.4798782000000017}]} strokeWidth="0.254mm" />
<courtyardoutline outline={[{"x":-5.050726999999981,"y":5.050346000000005},{"x":5.050473000000011,"y":5.050346000000005},{"x":5.050473000000011,"y":-5.050854000000001},{"x":-5.050726999999981,"y":-5.050854000000001},{"x":-5.050726999999981,"y":5.050346000000005}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C7544813.obj?uuid=23ea17edf3ba4256b107fb38293125d4",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C7544813.step?uuid=23ea17edf3ba4256b107fb38293125d4",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: -0.000012700000013410317, y: 0.000012699999999199463, z: 0 },
      }}
      {...props}
    />
  )
}
