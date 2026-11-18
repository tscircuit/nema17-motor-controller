import { schematicSections, schematicSheets } from "./config";

export const SchematicSheets = () => (
  <>
    <schematicsheet
      name={schematicSheets.controller}
      displayName="RP2040 Controller"
      sheetIndex={1}
    />

    <schematicsheet
      name={schematicSheets.programming}
      displayName="Programming USB-C & QSPI"
      sheetIndex={2}
    >
      <schematicsection
        name="MCU__usb"
        
      />
      <schematicsection name="MCU__programming_supply" />
      <schematicsection name="MCU__programming_flash" displayName="QSPI Flash" />
      <schematicsection name="MCU__programming_bypass" />
      <schematictext text="3.3 V Supply" anchor="top_left" fontSize={0.22} />
      <schematictext text="3.3 V Bypass" anchor="top_left" fontSize={0.22} />
      <schematictext text="Programming USB-C" anchor="top_left" fontSize={0.22} />
    </schematicsheet>

    <schematicsheet
      name={schematicSheets.motorDriver}
      displayName="Stepper Motor Driver"
      sheetIndex={3}
    >
      <schematicsection
        name={schematicSections.driverCore}
        displayName="H-Bridge, Power & Control"
      />
      <schematicsection
        name={schematicSections.motorOutputs}
        displayName="Stepper Motor Output"
      />
    </schematicsheet>

    <schematicsheet
      name={schematicSheets.motorPower}
      displayName="USB-C PD Motor Power"
      sheetIndex={4}
    >
      <schematicsection
        name={schematicSections.pdNegotiation}
        
      />
      <schematicsection
        name={schematicSections.pdFiltering}
        
      />
      <schematicsection
        name={schematicSections.pdMonitor}
        displayName="PD Bus Voltage Monitor"
      />
      <schematictext text="USB-C PD Negotiation" anchor="top_left" fontSize={0.22} />
      <schematictext text="Power Filtering" anchor="top_left" fontSize={0.22} />
    </schematicsheet>
    <schematicsheet name={schematicSheets.thermalProtection}
      displayName="Temperature Telemetry" sheetIndex={5}>
      <schematicsection name="thermal_protection" />
      <schematictext text="Temperature Sensing & MCU Alert" anchor="top_left" fontSize={0.22} />
    </schematicsheet>
  </>
);
