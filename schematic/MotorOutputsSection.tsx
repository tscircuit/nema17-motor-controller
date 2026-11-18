import { motorTrace, schematicSections, schematicSheets } from "./config";

export const MotorOutputConnectors = () => (
	<connector
    cadModel={{
      // C265102 from the JLCEDA/EasyEDA Official Library (https://lceda.cn/, https://easyeda.com/).
      objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C265102.obj?uuid=b20262abc44c45d5b414bbc2d0b40d89",
      stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C265102.step?uuid=b20262abc44c45d5b414bbc2d0b40d89",
      rotationOffset: 180,
      // The model origin sits at the mounting tabs, toward the right edge.
      positionOffset: { x: 2.9875, y: 0, z: -0.05 },
    }}
    footprint={
      <footprint insertionDirection="from_top">
        {/* C265102 land pattern. The mating face opens toward +Y in footprint coordinates.
            https://www.jst.com/wp-content/uploads/2025/06/ePH.pdf */}
        <smtpad pcbX={3} pcbY={-2.9875} portHints={["1"]} shape="rect" width={1} height={3.5} />
        <smtpad pcbX={1} pcbY={-2.9875} portHints={["2"]} shape="rect" width={1} height={3.5} />
        <smtpad pcbX={-1} pcbY={-2.9875} portHints={["3"]} shape="rect" width={1} height={3.5} />
        <smtpad pcbX={-3} pcbY={-2.9875} portHints={["4"]} shape="rect" width={1} height={3.5} />
        {/* Mechanical reinforcement tabs are isolated copper. */}
        <smtpad pcbX={-5.35} pcbY={2.9875} portHints={[]} shape="rect" width={1.8} height={3.7} />
        <smtpad pcbX={5.35} pcbY={2.9875} portHints={[]} shape="rect" width={1.8} height={3.7} />
        <silkscreenpath route={[
          { x: -4.25, y: 0.8 }, { x: -4.25, y: -0.95 },
          { x: 4.25, y: -0.95 }, { x: 4.25, y: 0.8 },
        ]} strokeWidth={0.1} />
        <silkscreentext pcbX={4.05} pcbY={-2.4} text="1" fontSize={0.5} />
        <courtyardrect pcbX={0} pcbY={0.05} width={12.8} height={10.05} />
      </footprint>
    }
    manufacturerPartNumber="S4B-PH-SM4-TB(LF)(SN)"
    supplierPartNumbers={{ jlcpcb: ["C265102"] }}
    pinLabels={{pin1:["A_PLUS"],pin2:["A_MINUS"],pin3:["B_PLUS"],pin4:["B_MINUS"]}}
		name="J1"
		pcbPinLabels={{
			pin1: "A+",
			pin2: "A-",
			pin3: "B+",
			pin4: "B-",
		}}
		pcbX={21.725}
		pcbY={4.05}
		pcbRotation={270}
		schPinArrangement={{
			leftSide: { pins: [1, 2, 3, 4], direction: "top-to-bottom" },
		}}
		schSheetName={schematicSheets.motorDriver}
		schSectionName={schematicSections.motorOutputs}
	/>
);

export const MotorOutputTraces = () => (
	<>
		{/* Reserve room for the wider motor routes before the remaining signals. */}
		<trace
			name="MOTOR_A_PLUS"
			from=".DRIVER > .AOUT1"
			to=".R_PHASE_A > .pin1"
			schDisplayLabel="A_DRIVE"
			{...motorTrace}
		/>
		<trace
			name="MOTOR_A_MINUS"
			from=".DRIVER > .AOUT2"
			to=".J1 > .pin2"
			schDisplayLabel="A-"
			{...motorTrace}

		/>
		<trace
			name="MOTOR_B_PLUS"
			from=".DRIVER > .BOUT1"
			to=".R_PHASE_B > .pin1"
			schDisplayLabel="B_DRIVE"
			{...motorTrace}
		/>
		<trace
			name="MOTOR_B_MINUS"
			from=".DRIVER > .BOUT2"
			to=".J1 > .pin4"
			schDisplayLabel="B-"
			{...motorTrace}
		/>
	</>
);
