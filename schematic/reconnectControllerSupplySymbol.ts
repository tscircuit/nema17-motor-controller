import type { CircuitJsonUtilObjects } from "@tscircuit/circuit-json-util";
import type { SchematicPort } from "circuit-json";

/** Repair the detached V3V3 symbol beside the RP2040's right-side I/O supply pins. */
export function reconnectControllerSupplySymbol(db: CircuitJsonUtilObjects, sheetId: string, ports: SchematicPort[]) {
	const ioSupply = ports.find((port) => port.display_pin_label === "IOVDD2");
	const otherSupply = ports.find((port) => port.display_pin_label === "IOVDD3");
	if (!ioSupply || !otherSupply) return;
	const connection = db.source_port.get(ioSupply.source_port_id)?.subcircuit_connectivity_map_key;
	if (!connection) return;

	const traces = db.schematic_trace.list({
		schematic_sheet_id: sheetId,
		subcircuit_connectivity_map_key: connection,
	});
	const tolerance = 1e-6;
	const trunk = traces.flatMap((trace) => trace.edges).find(({ from, to }) =>
		Math.abs(from.x - to.x) < tolerance && from.x > ioSupply.center.x &&
		Math.max(from.y, to.y) >= ioSupply.center.y - tolerance &&
		Math.min(from.y, to.y) <= otherSupply.center.y + tolerance);
	if (!trunk) return;

	const rail = db.schematic_net_label.list({ schematic_sheet_id: sheetId, text: "V3V3" })
		.find(({ anchor_position }) => anchor_position &&
			anchor_position.x > ioSupply.center.x && anchor_position.x < trunk.from.x &&
			anchor_position.y < ioSupply.center.y && anchor_position.y > otherSupply.center.y);
	const oldAnchor = rail?.anchor_position;
	if (!rail || !oldAnchor) return;
	const branch = traces.find((trace) => {
		const endpoint = trace.edges.at(-1)?.to;
		return endpoint?.x === oldAnchor.x && endpoint.y === oldAnchor.y;
	});
	const first = branch?.edges[0]?.from;
	const elbow = branch?.edges.find(({ from, to }) => from.x !== to.x);
	if (!branch || !first || !elbow || first.x >= oldAnchor.x || branch.junctions?.length ||
		ports.some(({ center }) => Math.hypot(center.x - first.x, center.y - first.y) < tolerance)) return;

	const junction = { x: trunk.from.x, y: elbow.from.y };
	const anchor = { x: junction.x + 0.48, y: oldAnchor.y };
	const bend = { x: anchor.x, y: junction.y };
	db.schematic_trace.update(branch.schematic_trace_id, {
		edges: [{ from: junction, to: bend }, { from: bend, to: anchor }],
		junctions: [junction],
	});
	db.schematic_net_label.update(rail.schematic_net_label_id, {
		anchor_position: anchor,
		center: { x: anchor.x, y: rail.center.y },
	});
}
