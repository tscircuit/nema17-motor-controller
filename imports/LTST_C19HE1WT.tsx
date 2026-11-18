import { Fragment } from "react";
import { symbols, type SchSymbol } from "schematic-symbols";
import type { ChipProps } from "@tscircuit/props"

// This pinned symbols release includes led_right at runtime but declares it undefined.
const ledSymbol = symbols.led_right as unknown as SchSymbol;
if (!ledSymbol) throw new Error("Missing led_right schematic primitive");

const pinLabels = {
  pin1: ["R_NEG"],
  pin2: ["G_NEG"],
  pin3: ["B_NEG"],
  pin4: ["_POS"]
} as const

export const LTST_C19HE1WT = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      symbol={<symbol>
        <port name="pin4" aliases={["_POS"]} pinNumber={4} direction="left" schX={-0.9} schY={0} schStemLength={0.3}/>
        <schematicpath points={[{x:-0.6,y:0.8},{x:-0.6,y:-0.8}]} strokeWidth={0.03}/>
        <schematicpath points={[{x:-0.9,y:0},{x:-0.6,y:0}]} strokeWidth={0.03}/>
        {(["R_NEG","G_NEG","B_NEG"] as const).map((color,i)=>{
          const y=0.8-i*0.8;
          return <Fragment key={color}>
            {ledSymbol.primitives.map((primitive,j)=>primitive.type==="path" ?
              <Fragment key={j}><schematicpath points={primitive.points.map(p=>({x:p.x,y:p.y+y}))} strokeWidth={0.025}/></Fragment> : null)}
            <schematicpath points={[{x:-0.6,y},{x:-0.54,y}]} strokeWidth={0.025}/>
            <port name={`pin${i+1}`} aliases={[color]} pinNumber={i+1} direction="right" schX={0.54} schY={y} schStemLength={0.3}/>
            <schematictext text={color[0]} schX={-0.2} schY={y+0.27} fontSize={0.15}/>
          </Fragment>;
        })}
        <schematictext text={props.name} schX={0} schY={1.4} fontSize={0.18}/>
      </symbol>}
      supplierPartNumbers={{
  "jlcpcb": [
    "C458749"
  ]
}}
      manufacturerPartNumber="LTST-C19HE1WT"
      footprint={<footprint>
        <smtpad portHints={["pin4"]} pcbX="-0.450088mm" pcbY="-0.833501mm" width="0.5500116mm" height="0.9169908mm" radius="0.2750058mm" shape="pill" />
<smtpad portHints={["pin3"]} pcbX="0.450088mm" pcbY="-0.833501mm" width="0.5500116mm" height="0.9169908mm" radius="0.2750058mm" shape="pill" />
<smtpad portHints={["pin2"]} pcbX="0.450088mm" pcbY="0.833501mm" width="0.5500116mm" height="0.9169908mm" radius="0.2750058mm" shape="pill" />
<smtpad portHints={["pin1"]} pcbX="-0.450088mm" pcbY="0.833501mm" width="0.5500116mm" height="0.9169908mm" radius="0.2750058mm" shape="pill" />
<silkscreenpath route={[{"x":-0.8761984000000211,"y":-0.876071399999887},{"x":-0.8761984000000211,"y":0.8763254000000416}]} />
<silkscreenpath route={[{"x":0.8761984000000211,"y":-0.876071399999887},{"x":0.8761984000000211,"y":0.8763254000000416}]} />
<silkscreencircle pcbX="-0.508mm" pcbY="1.524127mm" radius="0.124968mm" />
<silkscreentext text="{NAME}" pcbX="0.0127mm" pcbY="2.651127mm" anchorAlignment="center" fontSize="0.55mm" />
{/* 1.6 mm LED body and 1.45 x 2.584 mm land pattern, with >=0.25 mm courtyard margin. */}
<courtyardrect width={2.45} height={3.1} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C458749.obj?uuid=32e1f1a4424a41c9860f9a94e64c798e",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C458749.step?uuid=32e1f1a4424a41c9860f9a94e64c798e",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0, y: 0, z: -0.11 },
      }}
      {...props}
    />
  )
}