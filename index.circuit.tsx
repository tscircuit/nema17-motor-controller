import { PdPowerGoodSection } from "./schematic/PdPowerGoodSection";
import { MotorControllerSystemDiagram } from "./schematic/MotorControllerSystemDiagram";
import { autoLayoutSections } from "./schematic/AutoLayoutSections";
import { PdVoltageControlSection } from "./schematic/PdVoltageControlSection";
import { PdBusVoltageMonitorSection } from "./schematic/PdBusVoltageMonitorSection";
import jlcClearanceRules from "./engineering/jlcpcb-clearance-rules.json";
import { ChipDescriptions } from "./schematic/ChipDescriptions";
import { tscircuitBottomLogo } from "./assets/tscircuit-logo-bottom";
import { Drv8825ThermalCopper } from "./schematic/Drv8825ThermalCopper";
import { OptionalEncoderSection } from "./schematic/OptionalEncoderSection";
import { CurrentTelemetrySection } from "./schematic/CurrentTelemetrySection";
import { StatusLedSection } from "./schematic/StatusLedSection";
import { FeedbackSection } from "./schematic/FeedbackSection";
import nema17Outline from "./mechanical/nema17-outline.json";
import { ControllerSections } from "./schematic/ControllerSections";
import {
	MotorDriverController,
	MotorDriverControlTraces,
	MotorDriverGroundTraces,
	MotorDriverPassives,
	MotorDriverPowerTraces,
	MotorDriverPrimaryGroundTraces,
	MotorDriverSenseAndControlTraces,
} from "./schematic/MotorDriverCoreSection";
import {
	MotorOutputConnectors,
	MotorOutputTraces,
} from "./schematic/MotorOutputsSection";
import {
	MotorPowerFilteringComponents,
	MotorPowerFilteringGroundTrace,
	MotorPowerFilteringSupplyTrace,
} from "./schematic/MotorPowerFilteringSection";
import {
	MotorPowerPdConnectorGroundTraces,
	MotorPowerPdControllers,
	MotorPowerPdInputTraces,
	MotorPowerPdPassives,
	MotorPowerPdPrimaryGroundTrace,
	MotorPowerPdProtocolTraces,
	MotorPowerPdSupportGroundTraces,
} from "./schematic/MotorPowerPdNegotiationSection";
import { SchematicSheets } from "./schematic/SchematicSheets";
import { ThermalProtectionComponents, ThermalProtectionTraces } from "./schematic/ThermalProtectionSection";

export default function Rp2040MotorController({
	routingDisabled = false,
}: {
	routingDisabled?: boolean;
} = {}) {
	// The DRV8825 footprint intentionally has thermal vias inside its exposed pad.
	// Core's placement check treats via-in-pad as a collision and skips routing.
	return autoLayoutSections(
    <board
      schMaxTraceDistance={4}
      routeRemaining
      routingDisabled={routingDisabled}
			placementDrcChecksDisabled
			layers={4}
      thickness="1.6mm"
			outline={nema17Outline}
			minViaHoleDiameter="0.3mm"
      minViaPadDiameter="0.5mm"
      minViaHoleEdgeToViaHoleEdgeClearance="0.2mm"
      minPlatedHoleDrillEdgeToDrillEdgeClearance="0.45mm"
      minViaEdgeToPadEdgeClearance="0.125mm"
      minTraceWidth={jlcClearanceRules.minimumMm.traceWidth}
      minTraceToPadEdgeClearance={jlcClearanceRules.minimumMm.padToTrace}
      // Native checks currently reuse this field for via-to-pad spacing.
      // checkJlcClearances separately enforces 0.15 mm between component pads.
      minPadEdgeToPadEdgeClearance={jlcClearanceRules.minimumMm.viaToPad}
      minBoardEdgeClearance={jlcClearanceRules.minimumMm.copperToBoardEdge}
			autorouter="auto-local"
		>
			<net name="GND" />
			{/* Explicit net names keep labels consistent across the MCU subcircuit and sheets. */}
			<net name="DRIVER_STEP" connectsTo=".MCU > .U1 > .GPIO18" />
			<net name="DRIVER_DIR" connectsTo=".MCU > .U1 > .GPIO19" />
			<net name="DRIVER_RESET" connectsTo=".MCU > .U1 > .GPIO20" />
			<net name="MCU_ENABLE" connectsTo=".MCU > .U1 > .GPIO22" />
			<net name="TEMP_SDA" connectsTo=".MCU > .U1 > .GPIO26_ADC0" />
			<net name="TEMP_SCL" connectsTo=".MCU > .U1 > .GPIO27_ADC1" />
			<SchematicSheets />

			<group pcbX={-5.625} pcbY={-8.25}>
				<ControllerSections />
				<MotorDriverController />
				<MotorPowerPdControllers />
				<MotorOutputConnectors />
				<MotorPowerFilteringComponents />
				<MotorPowerPdPassives />
				<MotorDriverPassives />
				<ThermalProtectionComponents />

				<MotorDriverControlTraces />
				<MotorPowerPdInputTraces />
				<MotorPowerFilteringSupplyTrace />
				<MotorPowerPdProtocolTraces />
				<MotorDriverPowerTraces />
				<MotorDriverPrimaryGroundTraces />
				<MotorPowerPdPrimaryGroundTrace />
				<MotorPowerPdConnectorGroundTraces />
				<MotorPowerFilteringGroundTrace />
				<MotorPowerPdSupportGroundTraces />
				<MotorDriverGroundTraces />
				<MotorOutputTraces />
				<MotorDriverSenseAndControlTraces />
				<ThermalProtectionTraces />
			</group>

			<copperpour
				name="GND_TOP"
				layer="top"
				connectsTo="net.GND"
				clearance="0.21mm"
				padMargin="0.2mm"
				traceMargin="0.2mm"
				boardEdgeMargin="0.3mm"
				coveredWithSolderMask
			/>
			<copperpour
				name="GND_BOTTOM"
				layer="bottom"
				connectsTo="net.GND"
				clearance="0.21mm"
				padMargin="0.2mm"
				traceMargin="0.2mm"
				boardEdgeMargin="0.3mm"
				coveredWithSolderMask
			/>

			<group pcbX={0} pcbY={0}>
        {[-15.5,15.5].flatMap(x => [-15.5,15.5].map(y => (
            <chip key={`${x}:${y}`} doNotPlace name={`MH${(x > 0 ? 2 : 0) + (y > 0 ? 1 : 0) + 1}`} pcbX={x} pcbY={y} schSheetName="motor_power"
              pinLabels={{pin1:["GND"]}} connections={{pin1:"net.GND"}}
              footprint={<footprint><platedhole portHints={["pin1"]} shape="circle" holeDiameter="3.3mm" outerDiameter="5.6mm" /></footprint>} />
        )))}
        {/* Back-side coordinates are in board space, so USB DATA appears on the right from underneath. */}
        <silkscreentext text="DATA" layer="bottom" pcbX={-6} pcbY={18.5}
          fontSize="2.2mm" isKnockout knockoutPadding="0.25mm" />
        <silkscreentext text="PWR" layer="bottom" pcbX={7} pcbY={18.5}
          fontSize="2.2mm" isKnockout knockoutPadding="0.25mm" />
        <silkscreengraphic imageUrl={tscircuitBottomLogo} width="5.5mm" height="5.708244mm"
          layer="bottom" pcbX={14.2} pcbY={8.35} />
        <silkscreentext text="Made by AI with tscircuit" layer="bottom"
          pcbX={10.7} pcbY={9.55} fontSize="1.55mm" anchorAlignment="center_left" />
        <silkscreentext text="USAGE: motorcontrol.tscircuit.com" layer="bottom"
          pcbX={10.7} pcbY={7.2} fontSize="1.32mm" anchorAlignment="center_left" />
        {/* The Gerber font leaves the colon position blank. Add its two ink dots. */}
        <silkscreencircle layer="bottom" pcbX={5.7} pcbY={7.27} radius="0.095mm" isFilled />
        <silkscreencircle layer="bottom" pcbX={5.7} pcbY={6.94} radius="0.095mm" isFilled />
        {/* Leave clearance for the optional encoder between the two text blocks. */}
        <silkscreenpath layer="bottom" route={[{ x: -11, y: -4.65 }, { x: 11, y: -4.65 }]}
          strokeWidth="0.22mm" />
        <silkscreentext text="DEVELOPMENT USE ONLY" layer="bottom"
          pcbX={0} pcbY={-6.75} fontSize="2mm" />
        <silkscreentext text="NOT FCC APPROVED" layer="bottom"
          pcbX={0} pcbY={-9.45} fontSize="2mm" />
        <silkscreentext text="NOT FOR RESALE" layer="bottom"
          pcbX={0} pcbY={-12.15} fontSize="2mm" />
        <silkscreentext text="v1.0.56" layer="bottom"
          pcbX={0} pcbY={-18.55} fontSize="1.65mm" />
        {/* Large port labels stay visible beside the USB-C shells. */}
        <silkscreentext text="DATA" pcbX={-13.73} pcbY={19.35} fontSize="1.8mm" isKnockout knockoutPadding="0.18mm" />
        <silkscreentext text="PWR" pcbX={2} pcbY={18.67} pcbRotation={90} fontSize="0.8mm" isKnockout knockoutPadding="0.1mm" />
        <silkscreentext text="RP2040 NEMA17" pcbX={0} pcbY={20} fontSize="0.8mm" />
      </group>
			{/* Explicit source joins also give the MCU sheet the same net labels. */}
			<trace name="LABEL_STEP" from=".MCU > .U1 > .GPIO18" to="net.DRIVER_STEP" schDisplayLabel="DRIVER_STEP" />
			<trace name="LABEL_DIR" from=".MCU > .U1 > .GPIO19" to="net.DRIVER_DIR" schDisplayLabel="DRIVER_DIR" />
			<trace name="LABEL_RESET" from=".MCU > .U1 > .GPIO20" to="net.DRIVER_RESET" schDisplayLabel="DRIVER_RESET" />
			<trace name="LABEL_ENABLE" from=".MCU > .U1 > .GPIO22" to="net.MCU_ENABLE" schDisplayLabel="MCU_ENABLE" />
			<trace name="LABEL_TEMP_SDA" from=".MCU > .U1 > .GPIO26_ADC0" to="net.TEMP_SDA" schDisplayLabel="TEMP_SDA" />
			<trace name="LABEL_TEMP_SCL" from=".MCU > .U1 > .GPIO27_ADC1" to="net.TEMP_SCL" schDisplayLabel="TEMP_SCL" />
      <FeedbackSection />
      <CurrentTelemetrySection />
      <StatusLedSection />
      <OptionalEncoderSection />
      <Drv8825ThermalCopper />
      <ChipDescriptions />
      <PdVoltageControlSection />
      {/* Append new hardware after the validated layout so legacy route IDs remain stable. */}
      <PdBusVoltageMonitorSection />
      <PdPowerGoodSection />
      <MotorControllerSystemDiagram />
		</board>
	);
}
