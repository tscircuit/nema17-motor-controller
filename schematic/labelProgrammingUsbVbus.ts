import type { CircuitJsonUtilObjects } from "@tscircuit/circuit-json-util";
import type { SchematicPort } from "circuit-json";

/** Replace the routed VBUS loop around the connector with a label on its right pin. */
export function labelProgrammingUsbVbus(db: CircuitJsonUtilObjects, ports: SchematicPort[]) {
	const top = ports.find((port) => port.display_pin_label === "A4B9");
	const right = ports.find((port) => port.display_pin_label === "B4A9");
	if (!top || !right) return;
	const topTrace = db.source_trace.list({ name: "VBUS_A" })
		.find((trace) => trace.connected_source_port_ids.includes(top.source_port_id));
	const rightTrace = db.source_trace.list({ name: "VBUS_B" })
		.find((trace) => trace.connected_source_port_ids.includes(right.source_port_id));
	if (!topTrace || !rightTrace) return;

	const sheet = { schematic_sheet_id: top.schematic_sheet_id };
	const rail = db.schematic_net_label.list({ ...sheet, text: "VBUS", symbol_name: "rail_up" })
		.find((label) => label.anchor_position &&
			Math.abs(label.anchor_position.x - top.center.x) < 1e-6 &&
			label.anchor_position.y >= top.center.y);
	if (!rail?.anchor_position) return;
	const loop = db.schematic_trace.list({
		...sheet,
		subcircuit_connectivity_map_key: topTrace.subcircuit_connectivity_map_key,
	}).find(({ edges }) => {
		const ends = [edges[0]?.from, edges.at(-1)?.to];
		return [top.center, right.center].every((point) => ends.some((end) =>
			end && Math.hypot(end.x - point.x, end.y - point.y) < 1e-6));
	});
	if (!loop) return;
	db.schematic_trace.update(loop.schematic_trace_id, {
		source_trace_id: topTrace.source_trace_id,
		edges: [{ from: top.center, to: rail.anchor_position }],
		junctions: [],
	});
	db.schematic_net_label.insert({
		...sheet,
		text: "VBUS",
		source_net_id: rail.source_net_id,
		source_trace_id: rightTrace.source_trace_id,
		anchor_side: "left",
		anchor_position: right.center,
		center: { ...right.center, x: right.center.x + 0.3 },
	});
}
