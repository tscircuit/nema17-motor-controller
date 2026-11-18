import { Fragment } from "react";
import { INA240A1D } from "../imports/INA240A1D";
import { FRM121WFR050TM } from "../imports/FRM121WFR050TM";
import { revisionPlacement as p } from "../mechanical/revision-placement";

const supply = ".MCU > .L_AVDD > .pin1";

/** Bidirectional, inline winding current. Independent of the DRV8825 current-regulation shunts. */
export const CurrentTelemetrySection = () => <>
  <schematicsheet name="current_telemetry" displayName="Winding Current Measurement" sheetIndex={7}>
    <schematicsection name="phase_A" displayName="Winding A"/>
    <schematicsection name="phase_B" displayName="Winding B"/>
    <schematicsection name="current_supply" displayName="Current-sense Supply Bypass"/>
  </schematicsheet>
  {(["A", "B"] as const).map((phase, index) => {
    const sch = {schSheetName:"current_telemetry", schSectionName:`phase_${phase}`};
    const amp = `U_CURRENT_${phase}`;
    const shunt = `R_PHASE_${phase}`;
    const r = `R_ADC_${phase}`;
    const c = `C_ADC_${phase}`;
    const bypass = `C_CURRENT_${phase}`;
    const wire = (name: string, from: string, to: string, label?:string, thickness="0.15mm") =>
      <trace name={`CURRENT_${phase}_${name}`} from={from} to={to} schDisplayLabel={label} thickness={thickness} maxViaCount={name === "SENSE_POS" || name === "SENSE_NEG" ? 0 : undefined} />;
    return <Fragment key={phase}>
      <FRM121WFR050TM name={shunt} {...p(shunt)} {...sch} schOrientation="vertical" />
      <INA240A1D name={amp} {...p(amp)} {...sch} schWidth={1.98} schHeight={2.35}
        schPinStyle={{pin1:{marginTop:0.8},pin7:{marginLeft:0.85},pin2:{marginLeft:0.3},pin4:{marginLeft:0.3}}}
        schPinArrangement={{leftSide:{pins:[8,1],direction:"top-to-bottom"},rightSide:{pins:[5],direction:"top-to-bottom"},topSide:{pins:[6,7],direction:"left-to-right"},bottomSide:{pins:[3,2,4],direction:"left-to-right"}}} />
      <capacitor name={bypass} capacitance="100nF" footprint="0402" supplierPartNumbers={{jlcpcb:["C1525"]}}
        {...p(bypass)} {...sch} schSectionName="current_supply" schOrientation="vertical" maxDecouplingTraceLength={5}/>
      <resistor name={r} resistance="1k" footprint="0402" supplierPartNumbers={{jlcpcb:["C11702"]}}
        {...p(r)} {...sch}/>
      <capacitor name={c} capacitance="10nF" footprint="0402" supplierPartNumbers={{jlcpcb:["C15195"]}}
        {...p(c)} {...sch} schOrientation="vertical"/>
      {wire("WINDING", `.${shunt} > .pin2`, `.J1 > .pin${index*2+1}`, `${phase}+`, "1mm")}
      {/* Independent sense branches must meet the power path at the shunt pads. */}
      {wire("SENSE_POS", `.${shunt} > .pin1`, `.${amp} > .IN_POS`, `${phase}_DRIVE`)}
      {wire("SENSE_NEG", `.${shunt} > .pin2`, `.${amp} > .IN_NEG`, `${phase}+`)}
      {wire("VCC", supply, `.${amp} > .VS`, "V3V3", "0.3mm")}
      {wire("REF1", supply, `.${amp} > .REF1`, "V3V3")}
      {wire("REF2", `.${amp} > .REF2`, "net.GND")}
      {wire("GND", `.${amp} > .GND`, "net.GND", undefined, "0.3mm")}
      {/* TI permits the unused pin 4 to be grounded. */}
      {wire("RESERVED", `.${amp} > .NC`, "net.GND")}
      {wire("BYPASS", `.${bypass} > .pin1`, `.${amp} > .VS`, "V3V3", "0.3mm")}
      {wire("BYPASS_GND", `.${bypass} > .pin2`, "net.GND", undefined, "0.3mm")}
      {wire("OUT", `.${amp} > .OUT`, `.${r} > .pin1`)}
      {wire("ADC", `.${r} > .pin2`, `.MCU > .U1 > .GPIO${28+index}_ADC${2+index}`, `CURRENT_${phase}`)}
      {wire("FILTER", `.${r} > .pin2`, `.${c} > .pin1`, `CURRENT_${phase}`)}
      {wire("FILTER_GND", `.${c} > .pin2`, "net.GND")}
    </Fragment>;
  })}
</>;
