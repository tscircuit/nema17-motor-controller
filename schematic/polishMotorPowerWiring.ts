import type { CircuitJsonUtilObjects } from "@tscircuit/circuit-json-util";
import type { SchematicComponent, SchematicPort } from "circuit-json";

type FindPart = (name: string) => SchematicComponent | undefined;
const railPosition = (port: SchematicPort) => ({ ...port.center, y: port.center.y + 0.28 });
const samePoint = (a: { x: number; y: number }, b: { x: number; y: number }) =>
	Math.hypot(a.x - b.x, a.y - b.y) < 1e-6;

export function polishMotorPowerWiring(db: CircuitJsonUtilObjects, find: FindPart) {
	const ports = (name: string) => {
		const part = find(name);
		return part ? db.schematic_port.list({ schematic_component_id: part.schematic_component_id }) : [];
	};
	labelMotorUsbSupply(db, ports("J_MOTOR_USB"));
	labelPdBiasInputs(db, ports("R_PD_VDD").find((p) => p.pin_number === 1),
		ports("R_PD_VBUS").find((p) => p.pin_number === 1));
	const diode = ports("D_MOTOR_BLOCK").find((p) => p.display_pin_label === "cathode");
	const taps = ["C_PD_VBUS", "C_MOTOR_BULK", "D_MOTOR_TVS"]
		.map((name) => ports(name).find((p) => p.facing_direction === "up"));
	if (diode && taps.every((port): port is SchematicPort => port !== undefined))
		drawMotorFilterRail(db, diode, taps);
}

/** Show the tied raw-VBUS pins without looping a wire around the connector annotations. */
function labelMotorUsbSupply(db: CircuitJsonUtilObjects, ports: SchematicPort[]) {
	const top = ports.find((port) => port.display_pin_label === "A4B9");
	const right = ports.find((port) => port.display_pin_label === "B4A9");
	if (!top || !right) return;
	const join = db.source_trace.list({ name: "MOTOR_VBUS_JOIN" }).find((trace) =>
		[top, right].every((port) => trace.connected_source_port_ids.includes(port.source_port_id)));
	const connection = join?.subcircuit_connectivity_map_key;
	if (!join || !connection) return;
	const sheet = { schematic_sheet_id: top.schematic_sheet_id };
	const loop = db.schematic_trace.list({ ...sheet, subcircuit_connectivity_map_key: connection })
		.find(({ edges }) => {
			const ends = [edges[0]?.from, edges.at(-1)?.to];
			return [top.center, right.center].every((point) => ends.some((end) =>
				end && Math.hypot(end.x - point.x, end.y - point.y) < 1e-6));
		});
	if (!loop) return;

	const sources = { ...sheet, source_trace_id: join.source_trace_id };
	const anchor = railPosition(top);
	const label = { ...sources, text: "PD_VBUS_RAW", source_net_id: connection };
	for (const text of db.schematic_text.list({ ...sources, text: label.text })) {
		db.schematic_text.delete(text.schematic_text_id);
	}
	db.schematic_trace.update(loop.schematic_trace_id, {
		source_trace_id: join.source_trace_id,
		edges: [{ from: top.center, to: anchor }],
		junctions: [],
	});
	db.schematic_net_label.insert({
		...label,
		anchor_side: "bottom",
		anchor_position: anchor,
		center: { ...anchor, y: anchor.y + 0.09 },
		symbol_name: "rail_up",
	});
	db.schematic_net_label.insert({
		...label,
		anchor_side: "left",
		anchor_position: right.center,
		center: { ...right.center, x: right.center.x + 0.55 },
	});
}

/** The two bias resistors tap raw VBUS independently. Label their feed ends locally. */
function labelPdBiasInputs(db: CircuitJsonUtilObjects, top?: SchematicPort, right?: SchematicPort) {
	if (!top || !right || top.facing_direction !== "up" || right.facing_direction !== "right") return;
	const topTrace = db.source_trace.list({ name: "PD_VDD_FEED" }).find((trace) =>
		trace.connected_source_port_ids.includes(top.source_port_id));
	const rightTrace = db.source_trace.list({ name: "PD_VBUS_SENSE_FEED" }).find((trace) =>
		trace.connected_source_port_ids.includes(right.source_port_id));
	const connection = topTrace?.subcircuit_connectivity_map_key;
	if (!topTrace || !rightTrace || !connection || rightTrace.subcircuit_connectivity_map_key !== connection) return;
	const sheet = { schematic_sheet_id: top.schematic_sheet_id };
	const join = db.schematic_trace.list({ ...sheet, subcircuit_connectivity_map_key: connection }).find(({ edges }) => {
		const ends = [edges[0]?.from, edges.at(-1)?.to];
		return [top.center, right.center].every((point) => ends.some((end) => end && samePoint(end, point)));
	});
	if (!join) return;
	const anchor = railPosition(top);
	const label = { ...sheet, text: "PD_VBUS_RAW", source_net_id: connection };
	for (const trace of [topTrace, rightTrace]) {
		for (const text of db.schematic_text.list({ ...sheet, source_trace_id: trace.source_trace_id, text: label.text }))
			db.schematic_text.delete(text.schematic_text_id);
	}
	db.schematic_trace.update(join.schematic_trace_id, {
		source_trace_id: topTrace.source_trace_id,
		edges: [{ from: top.center, to: anchor }],
		junctions: [],
	});
	db.schematic_net_label.insert({
		...label, source_trace_id: topTrace.source_trace_id, anchor_side: "bottom", anchor_position: anchor,
		center: { ...anchor, y: anchor.y + 0.09 }, symbol_name: "rail_up",
	});
	db.schematic_net_label.insert({
		...label, source_trace_id: rightTrace.source_trace_id, anchor_side: "left", anchor_position: right.center,
		center: { ...right.center, x: right.center.x + 0.55 },
	});
}

/** Draw one protected rail above its three parallel shunt components. */
function drawMotorFilterRail(db: CircuitJsonUtilObjects, diode: SchematicPort, taps: SchematicPort[]) {
	const feeds = ["MOTOR_VBUS_CAP", "MOTOR_VBUS_BULK", "MOTOR_VBUS_TVS"].map((name, index) =>
		db.source_trace.list({ name }).find((trace) =>
			[diode, taps[index]!].every((port) => trace.connected_source_port_ids.includes(port.source_port_id))));
	const connection = feeds[0]?.subcircuit_connectivity_map_key;
	if (!connection || !feeds.every((trace) => trace?.subcircuit_connectivity_map_key === connection)) return;
	if (!taps.every(({ center }, index) =>
		center.y < diode.center.y && center.x > (taps[index - 1]?.center.x ?? diode.center.x))) return;

	const sheet = { schematic_sheet_id: diode.schematic_sheet_id };
	const ids = new Set(feeds.map((trace) => trace!.source_trace_id));
	for (const trace of db.schematic_trace.list({ ...sheet, subcircuit_connectivity_map_key: connection })) {
		db.schematic_trace.delete(trace.schematic_trace_id);
	}
	for (const label of db.schematic_net_label.list(sheet)) {
		if (label.source_net_id === connection || ids.has(label.source_trace_id ?? ""))
			db.schematic_net_label.delete(label.schematic_net_label_id);
	}
	for (const text of db.schematic_text.list(sheet)) {
		if (ids.has(text.source_trace_id ?? "")) db.schematic_text.delete(text.schematic_text_id);
	}

	const rail = { ...sheet, subcircuit_connectivity_map_key: connection };
	const junctions = taps.map(({ center }) => ({ x: center.x, y: diode.center.y }));
	db.schematic_trace.insert({
		...rail,
		source_trace_id: feeds[0]!.source_trace_id,
		edges: [{ from: diode.center, to: junctions.at(-1)! }],
		junctions: junctions.slice(0, -1),
	});
	for (const [index, port] of taps.entries()) {
		db.schematic_trace.insert({
			...rail,
			source_trace_id: feeds[index]!.source_trace_id,
			edges: [{ from: junctions[index]!, to: port.center }],
			junctions: [],
		});
	}
	db.schematic_text.insert({
		...sheet, source_trace_id: feeds[0]!.source_trace_id, text: "VMOTOR",
		position: { x: (taps[0]!.center.x + taps[1]!.center.x) / 2, y: diode.center.y },
		anchor: "bottom_center", font_size: 0.12, rotation: 0, color: "rgb(132, 0, 0)",
	});
}
