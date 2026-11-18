import type { CircuitJsonUtilObjects } from "@tscircuit/circuit-json-util";
import type { SchematicTraceEdge } from "circuit-json";

type Point = { x: number; y: number };

const tolerance = 1e-6;
const fontSize = 0.12;
const textInset = 0.08;
const samePoint = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y) < tolerance;
const labelLength = (text: string) => fontSize * (1.5 + (2 / 3) * text.length);

function containsPoint({ from, to }: SchematicTraceEdge, point: Point) {
	const length = Math.hypot(from.x - to.x, from.y - to.y);
	return Math.hypot(from.x - point.x, from.y - point.y) +
		Math.hypot(to.x - point.x, to.y - point.y) - length < tolerance;
}

/** Render signal names against the router's wires, including schematic box ports. */
export function inlineSchematicNetLabels(db: CircuitJsonUtilObjects) {
	clearDriverSupplyLabel(db);
	const ports = db.schematic_port.list();
	const sourceTraces = db.source_trace.list();
	const schematicTraces = db.schematic_trace.list();
	for (const label of db.schematic_net_label.list()) {
		const labelAnchor = label.anchor_position;
		if (!labelAnchor || label.symbol_name) continue;

		const explicitTrace = label.source_trace_id ? db.source_trace.get(label.source_trace_id) : undefined;
		const connection = explicitTrace?.subcircuit_connectivity_map_key ??
			db.source_net.get(label.source_net_id)?.subcircuit_connectivity_map_key ??
			label.source_net_id;
		const candidates = sourceTraces.filter((trace) => trace.subcircuit_connectivity_map_key === connection);
		const matchingPorts = ports.filter((port) =>
			port.schematic_sheet_id === label.schematic_sheet_id &&
			candidates.some((trace) => trace.connected_source_port_ids.includes(port.source_port_id)));
		const touching = schematicTraces
			.filter((wire) => wire.schematic_sheet_id === label.schematic_sheet_id &&
				wire.subcircuit_connectivity_map_key === connection)
			.flatMap((wire) => wire.edges)
			.filter((edge) => containsPoint(edge, labelAnchor));
		// A label can be offset slightly from its port without a separate connector edge.
		const port = matchingPorts.find((port) => samePoint(port.center, labelAnchor)) ??
			(!touching.length && explicitTrace ? matchingPorts.find((port) => {
				if (!explicitTrace.connected_source_port_ids.includes(port.source_port_id)) return false;
				const dx = labelAnchor.x - port.center.x;
				const dy = labelAnchor.y - port.center.y;
				if (Math.hypot(dx, dy) < 0.1) return true;
				// The router can leave a label just outside its pin without drawing a wire.
				return Math.abs(dy) < tolerance && Math.abs(dx) < 0.6 &&
					(port.facing_direction === "left" && dx < 0 || port.facing_direction === "right" && dx > 0);
			}) : undefined);
		const anchor = port && !touching.length ? port.center : labelAnchor;
		const trace = explicitTrace ?? (port
			? candidates.find((trace) => trace.connected_source_port_ids.includes(port.source_port_id))
			: candidates[0]);
		if (!trace) continue;
		// Turn the encoder pull-up's stub sideways above the neighboring V3V3 wire.
		const turnEncoderStub = label.text === "ENC_SDA" && port?.facing_direction === "down";
		// Place the amplifier output names along their straight runs to the filter.
		const length = labelLength(label.text);
		const horizontalOutput = /^CURRENT_[AB]_OUT$/.test(label.text) && touching.some(({ from, to }) =>
			Math.abs(from.y - to.y) < tolerance && Math.abs(from.x - to.x) >= length &&
			!samePoint(from, anchor) && !samePoint(to, anchor));
		const vertical = !turnEncoderStub && !horizontalOutput &&
			(label.anchor_side === "top" || label.anchor_side === "bottom");
		const axis = vertical ? "y" : "x";
		const direction = !turnEncoderStub && (label.anchor_side === "right" || label.anchor_side === "top") ? -1 : 1;
		const along = (point: Point, distance: number) => ({
			...point,
			[axis]: point[axis] + distance,
		});
		const terminal = touching.length === 1 && touching.find(({ from, to }) =>
			samePoint(anchor, from) || samePoint(anchor, to));
		let start = anchor;
		let labelDirection = direction;
		let adjacentToWire = false;
		if (port && touching.length === 0 || terminal && !port) {
			// Use the existing end segment when it already runs toward the flag.
			const otherEnd = terminal && (samePoint(terminal.to, anchor) ? terminal.from : terminal.to);
			if (otherEnd && schematicTraces.some(({ edges }) => edges.length === 1 && edges[0] === terminal) &&
				samePoint(along(otherEnd, anchor[axis] - otherEnd[axis]), anchor) &&
				(anchor[axis] - otherEnd[axis]) * direction > 0) start = otherEnd;
			if (turnEncoderStub) start = { ...anchor, y: anchor.y - 0.24 };
			const end = along(start, direction * length);
			if ((end[axis] - anchor[axis]) * direction > tolerance) {
				db.schematic_trace.insert({
					source_trace_id: trace.source_trace_id,
					subcircuit_connectivity_map_key: connection,
					schematic_sheet_id: label.schematic_sheet_id,
					edges: turnEncoderStub ? [{ from: anchor, to: start }, { from: start, to: end }] :
						[{ from: anchor, to: end }],
					junctions: [],
				});
			}
		} else if (touching.length) {
			// For a through wire, prefer text over a straight segment with enough room.
			const segment = touching.find(({ from, to }) =>
				samePoint(along(from, to[axis] - from[axis]), to) &&
				Math.abs(to[axis] - from[axis]) >= length);
			if (segment) {
				const lo = Math.min(segment.from[axis], segment.to[axis]);
				const hi = Math.max(segment.from[axis], segment.to[axis]);
				labelDirection = hi - anchor[axis] >= anchor[axis] - lo ? 1 : -1;
				const contentStart = labelDirection === 1 ? Math.min(anchor[axis], hi - length) :
					Math.max(anchor[axis], lo + length);
				start = along(anchor, contentStart - anchor[axis]);
			} else adjacentToWire = true;
		} else {
			continue;
		}

		const textAnchor = labelDirection === 1 ? "left" : "right";
		// The gate wire runs beneath its resistor, leaving space for its name below.
		const baseline = label.text === "BUZZER_GATE" ? "top" : "bottom";
		db.schematic_text.insert({
			text: label.text,
			source_trace_id: trace.source_trace_id,
			schematic_sheet_id: label.schematic_sheet_id,
			position: along(start, labelDirection * textInset),
			anchor: adjacentToWire ? textAnchor : `${baseline}_${textAnchor}`,
			font_size: fontSize,
			color: "rgb(132, 0, 0)",
			rotation: vertical ? -90 : 0,
		});
		if (port) db.schematic_port.update(port.schematic_port_id, { is_connected: true });
		db.schematic_net_label.delete(label.schematic_net_label_id);
	}
}

/** Keep the mode-pin ground drop outside the inline DRV_3V3 stub. */
function clearDriverSupplyLabel(db: CircuitJsonUtilObjects) {
	const supply = db.schematic_net_label.list({ text: "DRV_3V3" })[0];
	const anchor = supply?.anchor_position;
	if (!anchor) return;
	const endX = anchor.x + labelLength(supply.text);
	const sheet = { schematic_sheet_id: supply.schematic_sheet_id };
	for (const ground of db.schematic_net_label.list({ ...sheet, text: "GND", symbol_name: "rail_down" })) {
		const groundAnchor = ground.anchor_position;
		if (!groundAnchor || groundAnchor.x <= anchor.x || groundAnchor.x >= endX || groundAnchor.y >= anchor.y) continue;
		const wire = db.schematic_trace.list(sheet).find(({ edges }) =>
			edges.length === 2 && samePoint(edges[1]!.to, groundAnchor) &&
			edges[1]!.from.y > anchor.y && Math.abs(edges[1]!.from.x - groundAnchor.x) < tolerance);
		if (!wire) continue;
		const [first, last] = wire.edges;
		const x = endX + 0.22;
		const elbow = { ...last!.from, x };
		db.schematic_trace.update(wire.schematic_trace_id, {
			edges: [{ ...first!, to: elbow }, { from: elbow, to: { ...groundAnchor, x } }],
		});
		db.schematic_net_label.update(ground.schematic_net_label_id, {
			anchor_position: { ...groundAnchor, x },
			center: { ...ground.center, x },
		});
		break;
	}
}
