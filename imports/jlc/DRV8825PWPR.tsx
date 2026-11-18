import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["CP1"],
  pin2: ["CP2"],
  pin3: ["VCP"],
  pin4: ["VMA"],
  pin5: ["AOUT1"],
  pin6: ["ISENA"],
  pin7: ["AOUT2"],
  pin8: ["BOUT2"],
  pin9: ["ISENB"],
  pin10: ["BOUT1"],
  pin11: ["VMB"],
  pin12: ["AVREF"],
  pin13: ["BVREF"],
  pin14: ["GND1"],
  pin15: ["V3P3OUT"],
  pin16: ["nRESET"],
  pin17: ["nSLEEP"],
  pin18: ["nFAULT"],
  pin19: ["DECAY"],
  pin20: ["DIR"],
  pin21: ["NENBL"],
  pin22: ["STEP"],
  pin23: ["NC"],
  pin24: ["MODE0"],
  pin25: ["MODE1"],
  pin26: ["MODE2"],
  pin27: ["nHOME"],
  pin28: ["GND2"],
  pin29: ["pin29"]
} as const

const pinAttributes = {
  pin14: {requiresGround: true},
  pin23: {doNotConnect: true},
  pin28: {requiresGround: true}
} as const

export const DRV8825PWPR = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
  "jlcpcb": [
    "C81582"
  ]
}}
      manufacturerPartNumber="DRV8825PWPR"
      footprint={<footprint>
        <smtpad portHints={["pin1"]} pcbX="-4.225036mm" pcbY="-2.865755mm" width="0.3430016mm" height="1.7314926mm" radius="0.1715008mm" shape="pill" />
<smtpad portHints={["pin2"]} pcbX="-3.57505mm" pcbY="-2.865755mm" width="0.3430016mm" height="1.7314926mm" radius="0.1715008mm" shape="pill" />
<smtpad portHints={["pin3"]} pcbX="-2.925064mm" pcbY="-2.865755mm" width="0.3430016mm" height="1.7314926mm" radius="0.1715008mm" shape="pill" />
<smtpad portHints={["pin4"]} pcbX="-2.275078mm" pcbY="-2.865755mm" width="0.3430016mm" height="1.7314926mm" radius="0.1715008mm" shape="pill" />
<smtpad portHints={["pin5"]} pcbX="-1.625092mm" pcbY="-2.865755mm" width="0.3430016mm" height="1.7314926mm" radius="0.1715008mm" shape="pill" />
<smtpad portHints={["pin6"]} pcbX="-0.975106mm" pcbY="-2.865755mm" width="0.3430016mm" height="1.7314926mm" radius="0.1715008mm" shape="pill" />
<smtpad portHints={["pin7"]} pcbX="-0.324866mm" pcbY="-2.865755mm" width="0.3430016mm" height="1.7314926mm" radius="0.1715008mm" shape="pill" />
<smtpad portHints={["pin8"]} pcbX="0.32512mm" pcbY="-2.865755mm" width="0.3430016mm" height="1.7314926mm" radius="0.1715008mm" shape="pill" />
<smtpad portHints={["pin9"]} pcbX="0.975106mm" pcbY="-2.865755mm" width="0.3430016mm" height="1.7314926mm" radius="0.1715008mm" shape="pill" />
<smtpad portHints={["pin10"]} pcbX="1.625092mm" pcbY="-2.865755mm" width="0.3430016mm" height="1.7314926mm" radius="0.1715008mm" shape="pill" />
<smtpad portHints={["pin11"]} pcbX="2.275078mm" pcbY="-2.865755mm" width="0.3430016mm" height="1.7314926mm" radius="0.1715008mm" shape="pill" />
<smtpad portHints={["pin12"]} pcbX="2.925064mm" pcbY="-2.865755mm" width="0.3430016mm" height="1.7314926mm" radius="0.1715008mm" shape="pill" />
<smtpad portHints={["pin13"]} pcbX="3.57505mm" pcbY="-2.865755mm" width="0.3430016mm" height="1.7314926mm" radius="0.1715008mm" shape="pill" />
<smtpad portHints={["pin14"]} pcbX="4.225036mm" pcbY="-2.865755mm" width="0.3430016mm" height="1.7314926mm" radius="0.1715008mm" shape="pill" />
<smtpad portHints={["pin28"]} pcbX="-4.225036mm" pcbY="2.865755mm" width="0.3430016mm" height="1.7314926mm" radius="0.1715008mm" shape="pill" />
<smtpad portHints={["pin27"]} pcbX="-3.57505mm" pcbY="2.865755mm" width="0.3430016mm" height="1.7314926mm" radius="0.1715008mm" shape="pill" />
<smtpad portHints={["pin26"]} pcbX="-2.925064mm" pcbY="2.865755mm" width="0.3430016mm" height="1.7314926mm" radius="0.1715008mm" shape="pill" />
<smtpad portHints={["pin25"]} pcbX="-2.275078mm" pcbY="2.865755mm" width="0.3430016mm" height="1.7314926mm" radius="0.1715008mm" shape="pill" />
<smtpad portHints={["pin24"]} pcbX="-1.625092mm" pcbY="2.865755mm" width="0.3430016mm" height="1.7314926mm" radius="0.1715008mm" shape="pill" />
<smtpad portHints={["pin23"]} pcbX="-0.975106mm" pcbY="2.865755mm" width="0.3430016mm" height="1.7314926mm" radius="0.1715008mm" shape="pill" />
<smtpad portHints={["pin22"]} pcbX="-0.324866mm" pcbY="2.865755mm" width="0.3430016mm" height="1.7314926mm" radius="0.1715008mm" shape="pill" />
<smtpad portHints={["pin21"]} pcbX="0.32512mm" pcbY="2.865755mm" width="0.3430016mm" height="1.7314926mm" radius="0.1715008mm" shape="pill" />
<smtpad portHints={["pin20"]} pcbX="0.975106mm" pcbY="2.865755mm" width="0.3430016mm" height="1.7314926mm" radius="0.1715008mm" shape="pill" />
<smtpad portHints={["pin19"]} pcbX="1.625092mm" pcbY="2.865755mm" width="0.3430016mm" height="1.7314926mm" radius="0.1715008mm" shape="pill" />
<smtpad portHints={["pin18"]} pcbX="2.275078mm" pcbY="2.865755mm" width="0.3430016mm" height="1.7314926mm" radius="0.1715008mm" shape="pill" />
<smtpad portHints={["pin17"]} pcbX="2.925064mm" pcbY="2.865755mm" width="0.3430016mm" height="1.7314926mm" radius="0.1715008mm" shape="pill" />
<smtpad portHints={["pin16"]} pcbX="3.57505mm" pcbY="2.865755mm" width="0.3430016mm" height="1.7314926mm" radius="0.1715008mm" shape="pill" />
<smtpad portHints={["pin15"]} pcbX="4.225036mm" pcbY="2.865755mm" width="0.3430016mm" height="1.7314926mm" radius="0.1715008mm" shape="pill" />
<smtpad portHints={["pin29"]} pcbX="0mm" pcbY="-0.000127mm" width="5.5999888mm" height="3.0999938mm" shape="rect" />
<via pcbX="1.800098mm" pcbY="-1.200023mm" outerDiameter="0.5000244mm" holeDiameter="0.3000248mm" layers={["top","bottom"]} />
<via pcbX="-0.599948mm" pcbY="-0.000127mm" outerDiameter="0.5000244mm" holeDiameter="0.3000248mm" layers={["top","bottom"]} />
<via pcbX="0.599948mm" pcbY="-1.200023mm" outerDiameter="0.5000244mm" holeDiameter="0.3000248mm" layers={["top","bottom"]} />
<via pcbX="-0.599948mm" pcbY="-1.200023mm" outerDiameter="0.5000244mm" holeDiameter="0.3000248mm" layers={["top","bottom"]} />
<via pcbX="-0.599948mm" pcbY="1.200023mm" outerDiameter="0.5000244mm" holeDiameter="0.3000248mm" layers={["top","bottom"]} />
<via pcbX="-1.800098mm" pcbY="-1.200023mm" outerDiameter="0.5000244mm" holeDiameter="0.3000248mm" layers={["top","bottom"]} />
<via pcbX="-1.800098mm" pcbY="-0.000127mm" outerDiameter="0.5000244mm" holeDiameter="0.3000248mm" layers={["top","bottom"]} />
<via pcbX="-1.800098mm" pcbY="1.200023mm" outerDiameter="0.5000244mm" holeDiameter="0.3000248mm" layers={["top","bottom"]} />
<via pcbX="0.599948mm" pcbY="-0.000127mm" outerDiameter="0.5000244mm" holeDiameter="0.3000248mm" layers={["top","bottom"]} />
<via pcbX="1.778mm" pcbY="-0.000127mm" outerDiameter="0.5000244mm" holeDiameter="0.3000248mm" layers={["top","bottom"]} />
<via pcbX="0.599948mm" pcbY="1.200023mm" outerDiameter="0.5000244mm" holeDiameter="0.3000248mm" layers={["top","bottom"]} />
<via pcbX="1.800098mm" pcbY="1.200023mm" outerDiameter="0.5000244mm" holeDiameter="0.3000248mm" layers={["top","bottom"]} />
<silkscreenpath route={[{"x":-4.926202999999987,"y":-1.7712690000000748},{"x":-4.926202999999987,"y":1.771523000000002},{"x":4.926202999999987,"y":1.771523000000002},{"x":4.926202999999987,"y":-1.7712690000000748},{"x":-4.926202999999987,"y":-1.7712690000000748}]} />
<silkscreencircle pcbX="-4.225036mm" pcbY="-1.018921mm" radius="0.150114mm" />
<silkscreencircle pcbX="-4.84886mm" pcbY="-2.865755mm" radius="0.150114mm" />
<silkscreentext text="{NAME}" pcbX="-0.0381mm" pcbY="4.556127mm" anchorAlignment="center" fontSize="1mm" />
<courtyardoutline outline={[{"x":-5.253799999999956,"y":3.8061270000000604},{"x":5.177599999999984,"y":3.8061270000000604},{"x":5.177599999999984,"y":-3.8058730000000196},{"x":-5.253799999999956,"y":-3.8058730000000196},{"x":-5.253799999999956,"y":3.8061270000000604}]} />
      </footprint>}
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