import { INA226AIDGSR } from "../imports/INA226AIDGSR";
import { revisionPlacement } from "../mechanical/revision-placement";
import { logicTrace, schematicSections, schematicSheets } from "./config";

const section = {
  schSheetName: schematicSheets.motorPower,
  schSectionName: schematicSections.pdMonitor,
} as const;

/**
 * INA226's independent, high-voltage VBUS ADC measures the charger output before
 * the fuse and blocking diode. Unlike an RP2040 GPIO divider, VBUS may remain at
 * 20 V when the DATA USB and the INA226's 3.3 V supply are disconnected.
 */
export const PdBusVoltageMonitorSection = () => (
  <>
    <INA226AIDGSR
      name="U_PD_MON"
      layer="top"
      noConnect={["Alert"]}
      {...section}
      {...revisionPlacement("U_PD_MON")}
      schWidth={1.85}
      schHeight={1.5}
      schPinArrangement={{
        leftSide: { pins: [8, 10, 9], direction: "top-to-bottom" },
        rightSide: { pins: [4, 5, 3], direction: "top-to-bottom" },
        topSide: { pins: [6], direction: "left-to-right" },
        bottomSide: { pins: [1, 2, 7], direction: "left-to-right" },
      }}
    />
    <capacitor
      name="C_PD_MON"
      layer="top"
      capacitance="100nF"
      footprint="0402"
      supplierPartNumbers={{ jlcpcb: ["C1525"] }}
      maxDecouplingTraceLength={4}
      {...section}
      {...revisionPlacement("C_PD_MON")}
      schOrientation="vertical"
    />
    <trace name="PD_MON_VBUS" from=".J_MOTOR_USB > .A4B9" to=".U_PD_MON > .VBUS"
      schDisplayLabel="PD_VBUS_RAW" {...logicTrace} />
    {/* No current shunt is fitted: keep the differential input at 0 mV. */}
    <trace name="PD_MON_IN_POS" from=".U_PD_MON > .VIN_POS" to=".U_PD_MON > .VBUS" {...logicTrace} />
    <trace name="PD_MON_IN_NEG" from=".U_PD_MON > .VIN_NEG" to=".U_PD_MON > .VBUS" {...logicTrace} />
    <trace name="PD_MON_VS" from=".MCU > .L_AVDD > .pin1" to=".U_PD_MON > .VS_POS"
      schDisplayLabel="V3V3" {...logicTrace} />
    <trace name="PD_MON_BYPASS" from=".U_PD_MON > .VS_POS" to=".C_PD_MON > .pin1"
      schDisplayLabel="V3V3" {...logicTrace} />
    <trace name="PD_MON_BYPASS_GND" from=".C_PD_MON > .pin2" to="net.GND" {...logicTrace} />
    <trace name="PD_MON_GND" from=".U_PD_MON > .GND" to="net.GND" {...logicTrace} />
    <trace name="PD_MON_ADDR0" from=".U_PD_MON > .A0" to="net.GND" {...logicTrace} />
    <trace name="PD_MON_ADDR1" from=".U_PD_MON > .A1" to="net.GND" {...logicTrace} />
    <trace name="PD_MON_SDA" from=".U_PD_MON > .SDA" to=".U_TEMP > .SDA"
      schDisplayLabel="TEMP_SDA" {...logicTrace} />
    <trace name="PD_MON_SCL" from=".U_PD_MON > .SCL" to=".U_TEMP > .SCL"
      schDisplayLabel="TEMP_SCL" {...logicTrace} />
  </>
);
