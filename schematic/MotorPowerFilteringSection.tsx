import { PMEG6020ELRX } from "../imports/PMEG6020ELRX";
import { revisionPlacement } from "../mechanical/revision-placement";
import { TCJD226M050R0090E } from "../imports/TCJD226M050R0090E";
import {
  groundTrace,
  powerTrace,
  schematicSections,
  schematicSheets,
} from "./config";

const motorTvsName = "D_MOTOR_TVS";

const motorTvsSymbol = (
  <symbol>
    <port name="cathode" pinNumber={1} direction="up" schY={0.52} />
    <port name="anode" pinNumber={2} direction="down" schY={-0.52} />
    <schematicpath points={[
      { x: 0, y: 0.52 }, { x: 0, y: 0.2 },
      { x: -0.18, y: 0.2 }, { x: 0, y: 0 },
      { x: 0.18, y: 0.2 }, { x: 0, y: 0.2 },
    ]} />
    <schematicpath points={[
      { x: 0, y: -0.52 }, { x: 0, y: -0.2 },
      { x: -0.18, y: -0.2 }, { x: 0, y: 0 },
      { x: 0.18, y: -0.2 }, { x: 0, y: -0.2 },
    ]} />
    <schematicpath points={[
      { x: -0.25, y: -0.07 }, { x: -0.19, y: 0 },
      { x: 0.19, y: 0 }, { x: 0.25, y: 0.07 },
    ]} />
    <schematictext text={motorTvsName} schX={0.42} schY={-0.22} anchor="top_left" fontSize={0.18} />
  </symbol>
);

export const MotorPowerFilteringComponents = () => (
  <>
    <PMEG6020ELRX name="D_MOTOR_BLOCK"
      schSheetName={schematicSheets.motorPower} schSectionName={schematicSections.pdFiltering} {...revisionPlacement("D_MOTOR_BLOCK", {x:-5.625,y:-8.25})} />
    <fuse
      name="F_MOTOR_VBUS" schRotation={90.0}
      currentRating="2A"
      voltageRating="30V"
      footprint="1812"
      supplierPartNumbers={{ jlcpcb: ["C960026"] }}
      manufacturerPartNumber="BSMD1812-200-30V"
      schSheetName={schematicSheets.motorPower}
      schSectionName={schematicSections.pdFiltering}
     {...revisionPlacement("F_MOTOR_VBUS", {x:-5.625,y:-8.25})} />
    <capacitor
      name="C_PD_VBUS"
      capacitance="10uF"
      maxVoltageRating="50V"
      footprint="1206"
      supplierPartNumbers={{ jlcpcb: ["C13585"] }}
      manufacturerPartNumber="CL31A106KBHNNNE"
      // Input-side reservoir; C_VMA/C_VM_HF are the local IC bypasses.
      maxDecouplingTraceLength={22}
      schOrientation="vertical"
      schSheetName={schematicSheets.motorPower}
      schSectionName={schematicSections.pdFiltering} {...revisionPlacement("C_PD_VBUS", {x:-5.625,y:-8.25})}
    />
    <TCJD226M050R0090E
      name="C_MOTOR_BULK"
      layer="top"
      pcbX={-12.375}
      pcbY={6.75}
      pcbRotation={90}
      schOrientation="vertical"
      schSheetName={schematicSheets.motorPower}
      schSectionName={schematicSections.pdFiltering}
    />
    <diode
      name={motorTvsName} pcbRotation={180}
      pinLabels={{ pin1: ["cathode", "neg"], pin2: ["anode", "pos"] }}
      symbol={motorTvsSymbol}
      footprint="smb"
      // 22 V stand-off, 35.5 V rated pulse clamp: below DRV8825's 45 V
      // operating limit and the motor rail capacitors' 50 V rating.
      supplierPartNumbers={{ jlcpcb: ["C1975329"] }}
      manufacturerPartNumber="SMBJ22CAQ-13-F"
      pcbX={-2.875}
      pcbY={15.75}
      schSheetName={schematicSheets.motorPower}
      schSectionName={schematicSections.pdFiltering}
    />
  </>
);

export const MotorPowerFilteringSupplyTrace = () => (
  <>
    <trace name="MOTOR_REVERSE_BLOCK" from=".F_MOTOR_VBUS > .pin2" to=".D_MOTOR_BLOCK > .anode" {...powerTrace} />
    <trace
      name="MOTOR_VBUS_FUSE_INPUT"
      from=".J_MOTOR_USB > .A4B9"
      to=".F_MOTOR_VBUS > .pin1"
      {...powerTrace}
    />
    <trace
      name="MOTOR_VBUS_CAP"
      from=".D_MOTOR_BLOCK > .cathode"
      to=".C_PD_VBUS > .pin1"
      schDisplayLabel="VMOTOR_PROTECTED"
      {...powerTrace}
    />
    <trace
      name="MOTOR_VBUS_BULK"
      from=".D_MOTOR_BLOCK > .cathode"
      to=".C_MOTOR_BULK > .pin1"
      {...powerTrace}
    />
    <trace
      name="MOTOR_VBUS_TVS"
      from=".D_MOTOR_BLOCK > .cathode"
      to=".D_MOTOR_TVS > .cathode"
      {...powerTrace}
    />
  </>
);

export const MotorPowerFilteringGroundTrace = () => (
  <>
    <trace
      name="PD_VBUS_CAP_GND"
      from=".C_PD_VBUS > .pin2"
      to="net.GND"
      {...groundTrace}
    />
    <trace
      name="MOTOR_BULK_GND"
      from=".C_MOTOR_BULK > .pin2"
      to="net.GND"
      {...groundTrace}
    />
    <trace
      name="MOTOR_TVS_GND"
      from=".D_MOTOR_TVS > .anode"
      to="net.GND"
      {...groundTrace}
    />
  </>
);
