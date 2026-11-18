import { systemblock } from "tscircuit";

/** Functional overview of the board and its external interfaces. */
export const MotorControllerSystemDiagram = () => (
  <systemblock.page name="system-overview" displayName="RP2040 Stepper Motor Controller" direction="right">
    <systemblock.group name="logic-input" displayName="Programming and logic power">
      <systemblock.component name="data-usb" displayName="DATA USB-C" description="USB programming and 5 V logic input" />
      <systemblock.component name="logic-supply" displayName="3.3 V regulator" description="Supplies the controller and logic" />
    </systemblock.group>

    <systemblock.group name="motor-input" displayName="Motor power">
      <systemblock.component name="motor-usb" displayName="PWR USB-C / CH224K" description="Negotiates 5–20 V USB-PD" />
      <systemblock.component name="protection" displayName="Motor supply protection" description="Fuse, reverse blocking, and TVS" />
    </systemblock.group>

    <systemblock.component name="rp2040" displayName="RP2040 controller" description="QSPI flash, BOOT/RUN, and motor control" />
    <systemblock.component name="driver" displayName="DRV8825 stepper driver" description="Dual H-bridge with a power-good sleep interlock" />
    <systemblock.component name="motor" displayName="NEMA 17 stepper motor" description="External motor via the 4-pin J1 connector" />
    <systemblock.component name="status" displayName="RGB LED and buzzer" description="Status and audible alerts" />

    <systemblock.group name="telemetry" displayName="Telemetry">
      <systemblock.component name="current-sense" displayName="INA240 winding current" description="Two shunts measure phase A and B current" />
      <systemblock.component name="bus-monitor" displayName="INA226 bus voltage" description="Monitors raw PWR USB-C VBUS" />
      <systemblock.component name="sensors" displayName="Temperature and position" description="TMP102 and optional AS5600 encoder" />
    </systemblock.group>

    <systemblock.connection from="data-usb" to="logic-supply" kind="power" label="5 V" />
    <systemblock.connection from="logic-supply" to="rp2040" kind="power" label="3.3 V" />
    <systemblock.connection from="data-usb" to="rp2040" direction="both" label="USB 2.0" />
    <systemblock.connection from="motor-usb" to="protection" kind="power" label="VBUS" />
    <systemblock.connection from="protection" to="driver" kind="power" label="Protected VMOTOR" />
    <systemblock.connection from="rp2040" to="motor-usb" direction="both" label="PD select / power good" />
    <systemblock.connection from="motor-usb" to="driver" label="Power-good interlock" />
    <systemblock.connection from="rp2040" to="driver" direction="both" label="STEP/DIR, enable / fault" />
    <systemblock.connection from="driver" to="motor" kind="power" label="A± and B±" />
    <systemblock.connection from="driver" to="current-sense" label="Winding shunts" />
    <systemblock.connection from="current-sense" to="rp2040" label="ADC A/B" />
    <systemblock.connection from="motor-usb" to="bus-monitor" label="Raw VBUS sense" />
    <systemblock.connection from="bus-monitor" to="rp2040" direction="both" label="I²C" />
    <systemblock.connection from="sensors" to="rp2040" direction="both" label="I²C" />
    <systemblock.connection from="rp2040" to="status" label="GPIO / PWM" />
  </systemblock.page>
);
