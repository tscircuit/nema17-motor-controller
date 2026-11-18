import { revisionPlacement } from "../mechanical/revision-placement";
import { Fragment } from "react";
import { AS5600_ASOM } from "../imports/AS5600_ASOM";
const section = { schSheetName: "position_alarm", schSectionName: "encoder" } as const;
const signal = { thickness: "0.15mm" } as const;
const supply = { thickness: "0.3mm" } as const;

/** Optional shaft sensor: footprint on the motor side, omitted from assembly. */
export const OptionalEncoderSection = () => <>
  <AS5600_ASOM name="U_ENCODER" doNotPlace layer="bottom" pcbX={0} pcbY={0}
    schWidth={1.76} schHeight={2.32} noConnect={["OUT", "PGO"]} {...section}
    schPinStyle={{pin2: {marginLeft: 0.7}, pin8: {marginLeft: 0.7}, pin5: {marginTop: 0.4}}}
    schPinArrangement={{leftSide:{pins:[6,7],direction:"top-to-bottom"},rightSide:{pins:[3,5],direction:"top-to-bottom"},topSide:{pins:[1,2],direction:"left-to-right"},bottomSide:{pins:[4,8],direction:"left-to-right"}}} />
  <capacitor name="C_ENCODER" capacitance="100nF" footprint="0402" supplierPartNumbers={{jlcpcb:["C1525"]}}
    layer="top" doNotPlace maxDecouplingTraceLength={8} schOrientation="vertical" {...section} schSectionName="feedback_supply" {...revisionPlacement("C_ENCODER")} />
  <capacitor name="C_ENCODER_BULK" capacitance="1uF" footprint="0402" supplierPartNumbers={{jlcpcb:["C52923"]}}
    layer="top" doNotPlace maxDecouplingTraceLength={8} schOrientation="vertical" {...section} schSectionName="feedback_supply" {...revisionPlacement("C_ENCODER_BULK")} />
  <resistor name="R_ENC_SDA" resistance="4.7k" footprint="0402" supplierPartNumbers={{jlcpcb:["C25900"]}}
    layer="top" schOrientation="pos_bottom" {...section} {...revisionPlacement("R_ENC_SDA")} />
  <resistor name="R_ENC_SCL" resistance="4.7k" footprint="0402" supplierPartNumbers={{jlcpcb:["C25900"]}}
    layer="top" {...revisionPlacement("R_ENC_SCL")} schOrientation="pos_bottom" {...section}/>
  <trace name="ENCODER_SDA" from=".MCU > .U1 > .GPIO0" to=".U_ENCODER > .SDA" schDisplayLabel="ENC_SDA" {...signal}/>
  <trace name="ENCODER_SCL" from=".MCU > .U1 > .GPIO1" to=".U_ENCODER > .SCL" schDisplayLabel="ENC_SCL" {...signal}/>
  <trace name="ENCODER_SUPPLY" from=".MCU > .L_AVDD > .pin1" to=".U_ENCODER > .VDD3V3" schDisplayLabel="V3V3" {...supply}/>
  <trace maxViaCount={0} name="ENCODER_3V3_MODE" from=".U_ENCODER > .VDD3V3" to=".U_ENCODER > .VDD5V" {...supply}/>
  <trace name="ENCODER_GND" from=".U_ENCODER > .GND" to="net.GND" {...supply}/>
  <trace name="ENCODER_DIRECTION" from=".U_ENCODER > .DIR" to="net.GND" {...signal}/>
  {["C_ENCODER","C_ENCODER_BULK"].map(name=><Fragment key={name}>
    <trace name={`${name}_VCC`} from={`.${name} > .pin1`} to=".U_ENCODER > .VDD3V3" schDisplayLabel="V3V3" {...supply}/>
    <trace name={`${name}_GND`} from={`.${name} > .pin2`} to="net.GND" {...supply}/>
  </Fragment>)}
  {[['R_ENC_SDA','SDA'],['R_ENC_SCL','SCL']].map(([name,pin])=><Fragment key={name}>
    <trace name={`${name}_SIGNAL`} from={`.${name} > .pin1`} to={`.U_ENCODER > .${pin}`} schDisplayLabel={`ENC_${pin}`} {...signal}/>
    <trace name={`${name}_VCC`} from={`.${name} > .pin2`} to=".U_ENCODER > .VDD3V3" schDisplayLabel="V3V3" {...signal}/>
  </Fragment>)}
</>;
