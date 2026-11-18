import { Fragment } from "react";

/** Text content is retained; the section layout places these notes with their owner. */
export const descriptions = [
  {
    ref: "U_PD_PG", sheet: "pd_voltage_control",
    lines: ["Protected CH224K power-good input.", "GPIO7 high = PD supply present", "and CH224K PG asserted low.", "PWR USB absent = GPIO7 low."],
  },
	{
		ref: "U1",
		sheet: "controller",
		lines: [
			"Main application controller.",
			"Generates STEP/DIR control,",
			"reads current and temperature,",
			"and drives status outputs.",
			"No firmware is included.",
		],
	},
	{
		ref: "U2",
		sheet: "controller_programming",
		lines: ["External QSPI flash.", "Stores RP2040", "application code."],
	},
	{
		ref: "U3",
		sheet: "controller_programming",
		lines: ["3.3 V regulator.", "Powers the MCU", "and board logic."],
	},
	{
		ref: "DRIVER",
		sheet: "motor_driver",
		lines: [
			"Dual H-bridge stepper driver.",
			"STEP/DIR controls both windings.",
			"Regulates winding current.",
			"1/16 microsteps; ~1 A peak.",
		],
	},
	{
		ref: "U_PD",
		sheet: "motor_power",
		lines: [
			"USB-PD voltage controller.",
			"GPIO selects 5/9/12/15/20 V.",
			"Power-good gates motor enable.",
		],
	},
	{
		ref: "U_TEMP",
		sheet: "thermal_protection",
		lines: [
			"TMP102 measures temperature",
			"near the motor driver.",
			"RP2040 reads temperature over I2C.",
			"Software decides alerts/shutdown.",
		],
	},
	{
		ref: "U_CURRENT_A",
		sheet: "current_telemetry",
		lines: [
			"Measures winding A current",
			"across its 0.05 ohm shunt.",
			"Filtered output feeds ADC2.",
			"1.65 V at zero; 1 V per amp.",
		],
	},
	{
		ref: "U_CURRENT_B",
		sheet: "current_telemetry",
		lines: [
			"Measures winding B current",
			"across its 0.05 ohm shunt.",
			"Filtered output feeds ADC3.",
			"1.65 V at zero; 1 V per amp.",
		],
	},
	{
		ref: "U_ENCODER",
		sheet: "position_alarm",
		lines: [
			"Optional magnetic angle sensor.",
			"Reads shaft position over I2C.",
			"Requires an aligned shaft magnet.",
			"Not fitted in factory assembly.",
		],
	},
  {
    ref: "U_PD_MON",
    sheet: "motor_power",
    lines: [
      "Reads actual USB-PD voltage.",
      "I2C address 0x40.",
      "Check the requested voltage",
      "before enabling the motor.",
    ],
  },
] as const;

export const ChipDescriptions = () => (
	<>
		{descriptions.flatMap(({ ref, sheet, lines }) =>
			lines.map((text, line) => (
				<Fragment key={`${ref}-${line}`}>
					<schematictext
						{...{ name: `description_${ref}_${line}`, schSheetName: sheet }}
						text={text}
						anchor="top_left"
						fontSize={0.26}
						color="#31576b"
					/>
				</Fragment>
			)),
		)}
	</>
);
