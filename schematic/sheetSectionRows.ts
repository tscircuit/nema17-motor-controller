type SectionRow = readonly string[] | {
	sections: readonly string[];
	justify: "center" | "space-between";
	gapAfter?: number;
};

/** Left-to-right schematic section order within each sheet row. */
export const sheetSectionRows: Readonly<
	Record<string, readonly SectionRow[]>
> = {
	controller: [
		{ sections: ["MCU__rp2040", "MCU__clock"], justify: "center", gapAfter: 1 },
		{ sections: ["MCU__analog_supply", "MCU__io_bypass"], justify: "space-between" },
	],
	controller_programming: [
		["MCU__usb", "MCU__programming_supply", "MCU__programming_flash"],
		["MCU__programming_bypass"],
	],
	motor_driver: [
		{ sections: ["driver_enable", "motor_driver_core", "motor_driver_outputs"], justify: "center", gapAfter: 4 },
		["driver_supply", "driver_reference", "driver_current_limit"],
	],
	motor_power: [
		["motor_pd_connector", "motor_power_pd_negotiation", "motor_power_filtering"],
		["motor_power_monitor", "mounting_ground"],
	],
	thermal_protection: [["thermal_protection", "enable_default"]],
	position_alarm: [["encoder", "alarm", "feedback_supply"]],
	current_telemetry: [
		{ sections: ["phase_A", "phase_B"], justify: "center", gapAfter: 3.8 },
		{ sections: ["current_supply"], justify: "center" },
	],
	status_led: [["rgb_red", "rgb_green", "rgb_blue", "rgb"]],
	pd_voltage_control: [["pd_gpio_buffers", "pd_power_good", "pd_supply_discharge"]],
	controller_controls: [["MCU__controls"]],
};
