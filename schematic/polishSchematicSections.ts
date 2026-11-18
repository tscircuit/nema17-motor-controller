import type { CircuitJsonUtilObjects } from "@tscircuit/circuit-json-util";
import type { SchematicComponent } from "circuit-json";

type FindComponent = (name: string) => SchematicComponent | undefined;
type Place = (part: SchematicComponent, x: number, y: number, facing: "up" | "down" | "left") => void;
type Move = (part: SchematicComponent, x: number, y: number) => void;

/** Align related symbols before the sheet packs the groups and routes their wires. */
export function polishSchematicSections(
	db: CircuitJsonUtilObjects,
	find: FindComponent,
	place: Place,
	move: Move,
) {
	const pin = (part: SchematicComponent, label: string) =>
		db.schematic_port.list({ schematic_component_id: part.schematic_component_id })
			.find((port) => port.display_pin_label === label)?.center;

	const crystal = find("Y1");
	const xinCap = find("C_XIN");
	const xoutCap = find("C_XOUT");
	const xoutSeries = find("R_XOUT");
	if (crystal && xinCap && xoutCap && xoutSeries) {
		const { x, y } = crystal.center;
		place(xinCap, x - 1.6, y - 1.22, "up");
		place(xoutCap, x + 1.6, y - 1.22, "up");
		place(xoutSeries, x + 2.9, y, "left");
	}

	const adcBead = find("L_AVDD");
	const adcBypass = find("C_ADC");
	if (adcBead && adcBypass) {
		const { x, y } = adcBead.center;
		place(adcBead, x, y, "left");
		place(adcBypass, x + 1.9, y - 1.25, "up");
	}

	const flashBypass = find("C_FLASH");
	if (flashBypass) {
		for (const [index, name] of ["C_FLASH", "C_USB_VDD", "C_USB", "C_3V3"].entries()) {
			const capacitor = find(name);
			if (capacitor) place(capacitor, flashBypass.center.x + index * 1.75, flashBypass.center.y, "up");
		}
	}

	const regulator = find("U3");
	const usbDiode = find("D_VBUS");
	const usbCap = find("C_VBUS");
	const enableR = find("R_3V3_EN");
	if (regulator && usbDiode && usbCap && enableR) {
		const input = pin(regulator, "VIN");
		const enable = pin(regulator, "EN");
		if (input && enable) {
			const x = input.x - 1.85;
			place(usbDiode, x, input.y + 1.4, "down");
			place(usbCap, x - 1.85, input.y + 0.9, "up");
			place(enableR, x, (input.y + enable.y) / 2, "up");
		}
	}

	const boot = find("SW_BOOT");
	const run = find("SW_RUN");
	const bootPullup = find("R_BOOT");
	const runPullup = find("R_RUN");
	const powerLed = find("D_PWR");
	const powerLedR = find("R_PWR_LED");
	if (boot && run && bootPullup && runPullup && powerLed && powerLedR) {
		const { x, y } = boot.center;
		place(boot, x, y, "up");
		place(run, x + 2.5, y, "up");
		place(bootPullup, x, y + 1.65, "down");
		place(runPullup, x + 2.5, y + 1.65, "down");
		move(powerLed, x + 5, y);
		place(powerLedR, x + 5, y + 1.65, "up");
	}

	const encoder = find("U_ENCODER");
	const encSda = find("R_ENC_SDA");
	const encScl = find("R_ENC_SCL");
	if (encoder && encSda && encScl) {
		const sda = pin(encoder, "SDA");
		const scl = pin(encoder, "SCL");
		const supply = pin(encoder, "VDD3V3");
		if (sda && scl && supply) {
			place(encSda, sda.x - 1.55, supply.y - 0.4, "down");
			place(encScl, scl.x - 3.25, supply.y - 0.4, "down");
		}
	}

	const buzzerSwitch = find("Q_BUZZER");
	const gateR = find("R_BUZZER_GATE");
	const gatePullDown = find("R_BUZZER_PD");
	if (buzzerSwitch && gateR && gatePullDown) {
		const gate = pin(buzzerSwitch, "G");
		if (gate) {
			place(gateR, gate.x - 2.65, gate.y, "left");
			place(gatePullDown, gate.x - 1.1, buzzerSwitch.center.y - 1.65, "up");
		}
	}

	const top = find("R_DRV_REF_TOP");
	const bottom = find("R_DRV_REF_BOTTOM");
	const referenceCap = find("C_DRV_REF");
	const referenceSupplyCap = find("C_DRV_3V3");
	if (top && bottom && referenceCap && referenceSupplyCap) {
		const { x, y } = top.center;
		place(top, x, y, "up");
		place(bottom, x, y - 1.45, "up");
		place(referenceSupplyCap, x - 1.95, y, "up");
		place(referenceCap, x + 2.65, y - 1.45, "up");
	}

	const driver = find("DRIVER");
	const pumpCap = find("C_VCP");
	const pumpResistor = find("R_VCP");
	if (driver && pumpCap && pumpResistor) {
		for (const caption of db.schematic_text.list({ schematic_component_id: driver.schematic_component_id })) {
			const { x, y } = caption.position;
			db.schematic_text.update(caption.schematic_text_id, { position: { x: x + 0.30, y } });
		}
		const motorSupply = pin(driver, "VMA");
		const pump = pin(driver, "VCP");
		if (motorSupply && pump) {
			place(pumpCap, pump.x - 4.45, motorSupply.y - 1.35, "down");
			place(pumpResistor, pump.x - 2.55, motorSupply.y - 1.35, "down");
		}
	}

	const pdSink = find("U_PD");
	const pdBias = find("R_PD_VDD");
	const pdBiasCap = find("C_PD_VDD");
	if (pdSink && pdBias && pdBiasCap) {
		const supply = pin(pdSink, "VDD");
		if (supply) {
			place(pdBias, supply.x, supply.y + 1.7, "up");
			place(pdBiasCap, supply.x + 2.25, supply.y + 0.53, "up");
		}
	}

	const diode = find("D_MOTOR_BLOCK");
	const filter = find("C_PD_VBUS");
	const bulk = find("C_MOTOR_BULK");
	const tvs = find("D_MOTOR_TVS");
	if (diode && filter && bulk && tvs) {
		const rail = pin(diode, "cathode");
		if (rail) {
			const y = rail.y - 0.98;
			place(filter, rail.x + 1.25, y, "up");
			move(bulk, rail.x + 3.45, y);
			move(tvs, rail.x + 5.55, y);
		}
	}

	const firstHole = find("MH1");
	if (firstHole) {
		for (const number of [2, 3, 4]) {
			const hole = find(`MH${number}`);
			if (hole) move(hole, firstHole.center.x, firstHole.center.y - (number - 1) * 1.35);
		}
	}

	for (const color of ["R", "G", "B"]) {
		const sink = find(`Q_STATUS_${color}`);
		const resistor = find(`R_STATUS_${color}`);
		const collector = sink && pin(sink, "C");
		if (resistor && collector) place(resistor, collector.x, collector.y + 1.30, "up");
	}

	const pdBuffer = find("Q_PD_CFG1");
	if (pdBuffer) {
		const { x, y } = pdBuffer.center;
		for (const number of [1, 2, 3]) {
			const buffer = find(`Q_PD_CFG${number}`);
			const pullup = find(`R_PD_CFG${number}_PU`);
			if (!buffer || !pullup) continue;
			move(buffer, x + (number - 1) * 3.25, y);
			const output = pin(buffer, "OUT");
			if (output) place(pullup, output.x, output.y + 1.38, "down");
		}
	}
}
