import { Microcontroller_RP2040 } from "../vendor/rp2040";
import { schematicSheets } from "./config";

/**
 * @tscircuit/common owns the RP2040 controller, clock, debug, and programming
 * sub-sections, so they remain one reusable controller subsystem here.
 */
export const ControllerSections = () => (
  <Microcontroller_RP2040
    name="MCU"
    schAutoLayoutEnabled
    schSheetName={schematicSheets.controller}
		pcbX={-3.5}
    pcbY={2.5}
  />
);
