import { revisionPlacement } from "../mechanical/revision-placement";
import { Fragment } from "react";
import { schematicSheets, schematicSections } from "./config";

const sch = { schSheetName: schematicSheets.motorDriver, schSectionName: schematicSections.driverCore };


/** TI DRV8825, sections 6/8/10: charge pump, local supplies and 1 A reference.
 * V3P3OUT is an isolated driver reference supply, NOT the RP2040 3.3 V rail.
 * 3.3 * 2k/(2.4k+2k) = 1.5 V; I_FS = 1.5/(5*0.3) = 1 A.
 * Divider + MODE2 + both reference inputs remain below V3P3OUT's 1 mA limit.
 */
export const Drv8825Support = () => <>
  <capacitor name="C_CP" schRotation={0} capacitance="10nF" maxVoltageRating="50V" footprint="0402"
    supplierPartNumbers={{jlcpcb:["C15195"]}} {...sch} {...revisionPlacement("C_CP", {x:-5.625,y:-8.25})} />
  <capacitor name="C_VCP" schOrientation="vertical" capacitance="100nF" maxVoltageRating="50V" footprint="0402"
    supplierPartNumbers={{jlcpcb:["C960916"]}} {...sch} {...revisionPlacement("C_VCP", {x:-5.625,y:-8.25})} />
  <resistor name="R_VCP" resistance="1M" footprint="0402" supplierPartNumbers={{jlcpcb:["C26083"]}} {...sch} {...revisionPlacement("R_VCP", {x:-5.625,y:-8.25})} />
  <capacitor name="C_VMA" maxDecouplingTraceLength={4} capacitance="100nF" maxVoltageRating="50V" footprint="0402"
    supplierPartNumbers={{jlcpcb:["C960916"]}} {...sch} schOrientation="vertical" {...revisionPlacement("C_VMA", {x:-5.625,y:-8.25})} />
  <capacitor name="C_DRV_3V3" maxDecouplingTraceLength={4.5} capacitance="470nF" maxVoltageRating="16V" footprint="0402"
    supplierPartNumbers={{jlcpcb:["C480644"]}} {...sch} schOrientation="vertical" {...revisionPlacement("C_DRV_3V3", {x:-5.625,y:-8.25})} />
  <resistor name="R_DRV_REF_TOP" resistance="2.4k" footprint="0402" supplierPartNumbers={{jlcpcb:["C25882"]}} {...sch} schOrientation="vertical" {...revisionPlacement("R_DRV_REF_TOP", {x:-5.625,y:-8.25})} />
  <resistor name="R_DRV_REF_BOTTOM" resistance="2k" footprint="0402" supplierPartNumbers={{jlcpcb:["C4109"]}} {...sch} schOrientation="vertical" {...revisionPlacement("R_DRV_REF_BOTTOM", {x:-5.625,y:-8.25})} />
  <capacitor name="C_DRV_REF" capacitance="100nF" maxVoltageRating="16V" footprint="0402"
    supplierPartNumbers={{jlcpcb:["C1525"]}} {...sch} schOrientation="vertical" {...revisionPlacement("C_DRV_REF", {x:-5.625,y:-8.25})} />
  <resistor name="R_DRV_ENABLE_PU" resistance="10k" footprint="0402" supplierPartNumbers={{jlcpcb:["C25744"]}} {...sch} schOrientation="vertical" {...revisionPlacement("R_DRV_ENABLE_PU", {x:-5.625,y:-8.25})} />
  {([
    ["CP1", ".DRIVER > .CP1", ".C_CP > .pin1", "CP1"],
    ["CP2", ".DRIVER > .CP2", ".C_CP > .pin2", "CP2"],
    ["VCP", ".DRIVER > .VCP", ".C_VCP > .pin1", "VCP"],
    ["VCP_CAP_VM", ".C_VCP > .pin2", ".DRIVER > .VMA", "VMOTOR"],
    ["VCP_PULL", ".R_VCP > .pin1", ".DRIVER > .VCP", "VCP"],
    ["VCP_PULL_VM", ".R_VCP > .pin2", ".DRIVER > .VMA", "VMOTOR"],
    ["VMB", ".DRIVER > .VMB", ".DRIVER > .VMA", "VMOTOR", "0.8mm"],
    ["VMA_CAP", ".C_VMA > .pin1", ".DRIVER > .VMA", "VMOTOR", "0.4mm"],
    ["VMA_CAP_GND", ".C_VMA > .pin2", "net.GND", "GND", "0.3mm"],
    ["GND2", ".DRIVER > .GND2", ".DRIVER > .EP", "GND", "0.3mm"],
    ["V3P3", ".DRIVER > .V3P3OUT", ".C_DRV_3V3 > .pin1", "DRV_3V3"],
    ["V3P3_GND", ".C_DRV_3V3 > .pin2", "net.GND", "GND"],
    ["REF_SUPPLY", ".R_DRV_REF_TOP > .pin1", ".DRIVER > .V3P3OUT", "DRV_3V3"],
    ["REF_DIVIDER", ".R_DRV_REF_TOP > .pin2", ".R_DRV_REF_BOTTOM > .pin1", "DRV_VREF"],
    ["REF_A", ".R_DRV_REF_BOTTOM > .pin1", ".DRIVER > .AVREF", "DRV_VREF"],
    ["REF_B", ".DRIVER > .AVREF", ".DRIVER > .BVREF", "DRV_VREF"],
    ["REF_CAP", ".C_DRV_REF > .pin1", ".DRIVER > .AVREF", "DRV_VREF"],
    ["REF_CAP_GND", ".C_DRV_REF > .pin2", "net.GND", "GND"],
    ["REF_GND", ".R_DRV_REF_BOTTOM > .pin2", "net.GND", "GND"],
    ["MODE0", ".DRIVER > .MODE0", "net.GND", "GND"],
    ["MODE1", ".DRIVER > .MODE1", "net.GND", "GND"],
    ["MODE2", ".DRIVER > .MODE2", ".DRIVER > .V3P3OUT", "DRV_3V3"],
    ["EN_PULLUP", ".DRIVER > .nENBL", ".R_DRV_ENABLE_PU > .pin1", "DRIVER_ENABLE_N"],
    ["EN_PULLUP_SUPPLY", ".R_DRV_ENABLE_PU > .pin2", ".MCU > .L_AVDD > .pin1", "V3V3"],
  ] as const).map(([name,from,to,label,width]) => <Fragment key={name}><trace name={`DRV_${name}`} from={from} to={to}
    schDisplayLabel={label} thickness={width ?? "0.15mm"} /></Fragment>)}
</>;
