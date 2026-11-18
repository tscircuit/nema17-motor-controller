import { Fragment } from 'react';
import { DTC114EETL } from '../imports/DTC114EETL';
import { revisionPlacement } from '../mechanical/revision-placement';
import { logicTrace } from './config';

const sheet = {schSheetName:'pd_voltage_control', schSectionName:'pd_gpio_buffers'} as const;
/** Open-collector buffers keep the DATA and PWR USB supply domains separate. */
export const PdVoltageControlSection = () => <>
  <schematicsheet name="pd_voltage_control" displayName="PD Voltage Selection" sheetIndex={9}>
    <schematicsection name="pd_gpio_buffers" />
    <schematictext text="RP2040-selectable USB-PD voltage" fontSize={0.3} anchor="top_left" />
    <schematictext text="Three inverting buffers. Pull-ups use CH224K VDD; GPIOs never connect directly to that rail." fontSize={0.23} anchor="top_left" />
    <schematictext text="Reset/unpowered MCU: all buffers off, CFG1/2/3 high, request 5 V. Motor stays asleep." fontSize={0.23} anchor="top_left" />
    <schematictext text="GPIO4/5/6: 000 = 5 V; 111 = 9 V; 110 = 12 V; 100 = 15 V; 101 = 20 V." fontSize={0.26} anchor="top_left" />
    <schematictext text="Keep GPIO22 low while changing voltage. No application firmware is included." fontSize={0.26} anchor="top_left" />
  </schematicsheet>
  {[1,2,3].map((i) => <Fragment key={i}>
    <DTC114EETL name={`Q_PD_CFG${i}`} {...revisionPlacement(`Q_PD_CFG${i}`)} {...sheet} />
    <resistor name={`R_PD_CFG${i}_PU`} resistance="47k" footprint="0402" pcbStyle={{silkscreenTextVisibility:"hidden"}}
      supplierPartNumbers={{jlcpcb:['C25792']}}
      {...revisionPlacement(`R_PD_CFG${i}_PU`)}
      schRotation={90} {...sheet} />
    <trace name={`PD_CFG${i}_CONTROL`} from={`.MCU > .U1 > .GPIO${i+3}`} to={`.Q_PD_CFG${i} > .IN`}
      schDisplayLabel={`PD_CFG${i}_LOW`} {...logicTrace} />
    <trace name={`PD_CFG${i}_OUTPUT`} from={`.Q_PD_CFG${i} > .OUT`} to={`.U_PD > .CFG${i}`}
      schDisplayLabel={`PD_CFG${i}`} {...logicTrace} />
    <trace name={`PD_CFG${i}_PULLUP`} from={`.Q_PD_CFG${i} > .OUT`} to={`.R_PD_CFG${i}_PU > .pin1`} {...logicTrace} />
    <trace name={`PD_CFG${i}_SUPPLY`} from={`.R_PD_CFG${i}_PU > .pin2`} to=".U_PD > .VDD"
      schDisplayLabel="PD_VDD" {...logicTrace} />
    <trace name={`PD_CFG${i}_GROUND`} from={`.Q_PD_CFG${i} > .GND`} to="net.GND" {...logicTrace} />
  </Fragment>)}
</>;
