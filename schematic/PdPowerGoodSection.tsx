import { SN74LVC1G97DRLR } from '../imports/SN74LVC1G97DRLR';
import { revisionPlacement } from '../mechanical/revision-placement';
import { logicTrace } from './config';

const sheet = { schSheetName: 'pd_voltage_control', schSectionName: 'pd_power_good' } as const;

/** Y = IN1 & !IN2 when IN0=0 (TI function table): PD_VDD & !PG.
 * The local 3.3-V supply and Ioff inputs separate the two USB power domains.
 * Do not replace this with a direct PG-to-GPIO connection.
 */
export const PdPowerGoodSection = () => <>
  <schematicsection name="pd_power_good" displayName="PD Power-good / GPIO7" />
  <SN74LVC1G97DRLR name="U_PD_PG" {...sheet} {...revisionPlacement('U_PD_PG')}
    pcbStyle={{ silkscreenTextVisibility: 'hidden' }}
    schWidth={1.5} schHeight={1.1}
    schPinArrangement={{ leftSide: { pins: [1, 6, 3], direction: 'top-to-bottom' }, rightSide: { pins: [4], direction: 'top-to-bottom' }, topSide: { pins: [5], direction: 'left-to-right' }, bottomSide: { pins: [2], direction: 'left-to-right' } }} />
  <capacitor name="C_PD_PG" maxDecouplingTraceLength={5} capacitance="100nF" maxVoltageRating="16V" footprint="0402"
    supplierPartNumbers={{ jlcpcb: ['C1525'] }} {...sheet} {...revisionPlacement('C_PD_PG')}
    schOrientation="vertical" />
  <resistor name="R_PD_VDD_PD" resistance="47k" footprint="0402"
    supplierPartNumbers={{ jlcpcb: ['C25792'] }} {...sheet} {...revisionPlacement('R_PD_VDD_PD')}
    schOrientation="vertical" />
  <resistor name="R_PD_GOOD_PD" resistance="10k" footprint="0402"
    supplierPartNumbers={{ jlcpcb: ['C25744'] }} {...sheet} {...revisionPlacement('R_PD_GOOD_PD')}
    schOrientation="vertical" />
  <trace name="PD_PG_SENSE" from=".U_PD > .PG" to=".U_PD_PG > .In2" schDisplayLabel="PD_PG_N" {...logicTrace} />
  <trace name="PD_PG_SUPPLY_SENSE" from=".U_PD > .VDD" to=".U_PD_PG > .In1" schDisplayLabel="PD_VDD" {...logicTrace} />
  <trace name="PD_PG_SUPPLY_DISCHARGE" from=".U_PD_PG > .In1" to=".R_PD_VDD_PD > .pin1" {...logicTrace} />
  <trace name="PD_PG_SUPPLY_DISCHARGE_GND" from=".R_PD_VDD_PD > .pin2" to="net.GND" {...logicTrace} />
  <trace name="PD_PG_FUNCTION" from=".U_PD_PG > .In0" to="net.GND" {...logicTrace} />
  <trace name="PD_PG_GROUND" from=".U_PD_PG > .GND" to="net.GND" {...logicTrace} />
  <trace name="PD_PG_LOGIC_SUPPLY" from=".U_PD_PG > .VCC" to=".MCU > .L_AVDD > .pin1" schDisplayLabel="V3V3" {...logicTrace} />
  <trace name="PD_PG_DECOUPLING" from=".U_PD_PG > .VCC" to=".C_PD_PG > .pin1" {...logicTrace} maxLength="5mm" />
  <trace name="PD_PG_DECOUPLING_GND" from=".C_PD_PG > .pin2" to="net.GND" {...logicTrace} />
  <trace name="PD_GOOD" from=".U_PD_PG > .Y" to=".MCU > .U1 > .GPIO7" schDisplayLabel="PD_GOOD" {...logicTrace} />
  <trace name="PD_GOOD_PULLDOWN" from=".U_PD_PG > .Y" to=".R_PD_GOOD_PD > .pin1" {...logicTrace} />
  <trace name="PD_GOOD_PULLDOWN_GND" from=".R_PD_GOOD_PD > .pin2" to="net.GND" {...logicTrace} />
</>;
