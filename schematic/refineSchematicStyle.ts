import { inlineSchematicNetLabels } from "./inlineSchematicNetLabels";
import { labelProgrammingUsbVbus } from "./labelProgrammingUsbVbus";
import { polishMotorPowerWiring } from "./polishMotorPowerWiring";
import { reconnectControllerSupplySymbol } from "./reconnectControllerSupplySymbol";
import { polishSchematicSections } from "./polishSchematicSections";
import { packMeasuredGroups } from "./packMeasuredGroups";
import { sheetSectionRows } from "./sheetSectionRows";
import { analyzeSchematicPlacement } from "../vendor/schematic-style-analysis";

/** Refine the generated layout from analyzer suggestions, without component coordinate overrides. */
export function installSchematicStyleRefinement(
	board: any,
	notes: Array<{
		text: string;
		ref?: string;
		sectionName?: string;
		fontSize: number;
		color: string;
	}> = [],
) {
	if (!board || board.__styleRefinementInstalled) return;
	board.__styleRefinementInstalled = true;
	function associateCustomSymbolAnnotations() {
		if (board.root.schematicDisabled) return;
		const db = board.root.db;
		for (const primitive of board.getDescendants()) {
			if (!primitive.schematic_text_id) continue;
			const text = db.schematic_text.get(primitive.schematic_text_id);
			let parent = primitive.parent;
			while (parent && !parent.schematic_component_id) parent = parent.parent;
			if (text && parent?.schematic_component_id)
				text.schematic_component_id = parent.schematic_component_id;
		}
	}
	// Core moves component-owned text during automatic layout. Associate custom
	// symbol annotations before that phase so labels follow their symbols.
	const originalSymbolResize = board.doInitialSchematicSymbolResize?.bind(board);
	board.doInitialSchematicSymbolResize = () => {
		originalSymbolResize?.();
		associateCustomSymbolAnnotations();
	};
	const original = board.doInitialSchematicSheetRender.bind(board);
	board.doInitialSchematicSheetRender = () => {
		if (board.root.schematicDisabled) return original();
		const db = board.root.db;
		const components = () => db.schematic_component.list();
		const byName = (name: string) => {
			const source = db.source_component
				.list()
				.find((e: any) => e.name === name);
			return components().find(
				(e: any) => e.source_component_id === source?.source_component_id,
			);
		};
		const fromBox = (box: any) =>
			box && db.schematic_component.get(box.schematicComponentId);
		function move(component: any, x: number, y: number, rotation = 0) {
			if (!component) return;
			const cx = component.center.x,
				cy = component.center.y;
			const angle = (rotation * Math.PI) / 180,
				cos = Math.cos(angle),
				sin = Math.sin(angle);
			const transform = (p: any) => ({
				x: x + (p.x - cx) * cos - (p.y - cy) * sin,
				y: y + (p.x - cx) * sin + (p.y - cy) * cos,
			});
			for (const port of db.schematic_port
				.list()
				.filter(
					(p: any) =>
						p.schematic_component_id === component.schematic_component_id,
				)) {
				port.center = transform(port.center);
				const dirs = ["right", "up", "left", "down"];
				for (const field of ["facing_direction", "side_of_component"]) {
					const index = dirs.indexOf(port[field]);
					if (index >= 0)
						port[field] = dirs[(index + Math.round(rotation / 90) + 4) % 4];
				}
			}
			for (const text of db.schematic_text
				.list()
				.filter(
					(t: any) =>
						t.schematic_component_id === component.schematic_component_id,
				))
				text.position = transform(text.position);
			if (rotation && component.symbol_name) {
				const dirs = ["right", "up", "left", "down"];
				if (Math.abs(rotation) % 180 === 90 && /^fuse_(vert|horz)$/.test(component.symbol_name))
					component.symbol_name = component.symbol_name === "fuse_vert" ? "fuse_horz" : "fuse_vert";
				component.symbol_name = component.symbol_name.replace(
					/_(right|up|left|down)$/,
					(_: any, dir: string) =>
						`_${dirs[(dirs.indexOf(dir) + Math.round(rotation / 90) + 4) % 4]}`,
				);
				if (Math.abs(rotation) % 180 === 90)
					component.size = {
						width: component.size.height,
						height: component.size.width,
					};
			}
			for (const type of [
				"schematic_path",
				"schematic_rect",
				"schematic_circle",
				"schematic_line",
				"schematic_arc",
			]) {
				for (const primitive of db[type]
					.list()
					.filter(
						(p: any) =>
							p.schematic_component_id === component.schematic_component_id,
					)) {
					if (primitive.center) primitive.center = transform(primitive.center);
					if (primitive.points)
						primitive.points = primitive.points.map(transform);
					if (typeof primitive.x1 === "number") {
						const a = transform({ x: primitive.x1, y: primitive.y1 }),
							b = transform({ x: primitive.x2, y: primitive.y2 });
						Object.assign(primitive, { x1: a.x, y1: a.y, x2: b.x, y2: b.y });
					}
				}
			}
			component.center = { x, y };
		}
		function reroute() {
			// Trace rendering also emits schematic_text labels; discard the old
			// generated text before rebuilding routes so moved labels do not accumulate.
			for (const text of db.schematic_text.list())
				if (text.source_trace_id)
					db.schematic_text.delete(text.schematic_text_id);

			for (const type of ["schematic_trace", "schematic_net_label"])
				for (const e of db[type].list()) db[type].delete(e[`${type}_id`]);
			for (const group of [...board.getDescendants(), board].filter(
				(g: any) => g.isSubcircuit && g.doInitialSchematicTraceRender,
			))
				group.doInitialSchematicTraceRender();
		}
		associateCustomSymbolAnnotations();
		const placeWithFirstPinFacing = (component: any, x: number, y: number, facing: "up" | "down" | "left") => {
			const terminal = db.schematic_port.list({
				schematic_component_id: component.schematic_component_id,
			}).find((port: any) => port.pin_number === 1);
			const directions = ["right", "up", "left", "down"];
			const current = directions.indexOf(terminal?.facing_direction);
			if (current >= 0) move(component, x, y, (directions.indexOf(facing) - current) * 90);
		};
		// Align the programming connector's resistors to its routed pin rows.
		// The surrounding section is packed from the resulting symbol bounds.
		const programmingUsb = byName("J_USB");
		const cc1 = byName("R_CC1");
		const cc2 = byName("R_CC2");
		const dataPlus = byName("R_USB2");
		const dataMinus = byName("R_USB1");
		const connectorPorts = programmingUsb ? db.schematic_port.list({
			schematic_component_id: programmingUsb.schematic_component_id,
		}) : [];
		if (programmingUsb && cc1 && cc2 && dataPlus && dataMinus) {
			const cc2Pin = connectorPorts.find((port: any) => port.display_pin_label === "B5");
			const plusPin = connectorPorts.find((port: any) => port.display_pin_label === "B6");
			const minusPin = connectorPorts.find((port: any) => port.display_pin_label === "B7");
			if (cc2Pin && plusPin && minusPin) {
				const dataX = plusPin.center.x + 1.55;
				const ccX = dataX + 1.9;
				const ccY = cc2Pin.center.y - 0.12 - cc2.size.height / 2;
				placeWithFirstPinFacing(cc2, ccX, ccY, "up");
				// A5 is above B5, so its branch reaches the farther resistor without crossing CC2.
				placeWithFirstPinFacing(cc1, ccX + cc2.size.width + 0.48, ccY, "up");
				placeWithFirstPinFacing(dataPlus, dataX, plusPin.center.y, "left");
				placeWithFirstPinFacing(dataMinus, dataX, minusPin.center.y, "left");
			}
		}
		const temperatureSensor = byName("U_TEMP");
		const tempSclPullup = byName("R_TEMP_SCL");
		const tempSdaPullup = byName("R_TEMP_SDA");
		const tempBypass = byName("C_TEMP");
		const sensorPorts = temperatureSensor ? db.schematic_port.list({
			schematic_component_id: temperatureSensor.schematic_component_id,
		}) : [];
		const tempSclPin = sensorPorts.find((port: any) => port.display_pin_label === "SCL");
		const tempSdaPin = sensorPorts.find((port: any) => port.display_pin_label === "SDA");
		const tempSupplyPin = sensorPorts.find((port: any) => port.display_pin_label === "V_POS");
		if (tempSclPin && tempSdaPin && tempSupplyPin && tempSclPullup && tempSdaPullup && tempBypass) {
			const passiveY = tempSupplyPin.center.y + 0.65;
			// The upper SCL input uses the nearer pull-up so the two signals do not cross.
			placeWithFirstPinFacing(tempSclPullup, tempSclPin.center.x - 1.55, passiveY, "down");
			placeWithFirstPinFacing(tempSdaPullup, tempSdaPin.center.x - 3.35, passiveY, "down");
			// Keep the bypass ground symbol above the sensor's reference and part number.
			placeWithFirstPinFacing(tempBypass, tempSupplyPin.center.x + 1.65,
				passiveY + tempBypass.size.height + 0.1, "up");
		}
		for (const phase of ["A", "B"]) {
			const amplifier = byName(`U_CURRENT_${phase}`);
			const shunt = byName(`R_PHASE_${phase}`);
			const filterResistor = byName(`R_ADC_${phase}`);
			const filterCapacitor = byName(`C_ADC_${phase}`);
			if (!amplifier || !shunt || !filterResistor || !filterCapacitor) continue;
			const ports = db.schematic_port.list({ schematic_component_id: amplifier.schematic_component_id });
			const positive = ports.find((port: any) => port.display_pin_label === "IN_POS");
			const negative = ports.find((port: any) => port.display_pin_label === "IN_NEG");
			const output = ports.find((port: any) => port.display_pin_label === "OUT");
			if (!positive || !negative || !output) continue;

			// Align the shunt to both sense inputs and lay out the filter along the output.
			placeWithFirstPinFacing(shunt, positive.center.x - 1.55,
				(positive.center.y + negative.center.y) / 2, "up");
			const filterX = output.center.x + 1.65;
			placeWithFirstPinFacing(filterResistor, filterX, output.center.y, "left");
			placeWithFirstPinFacing(filterCapacitor, filterX + 1.65, output.center.y - 1.3, "up");
		}
		polishSchematicSections(db, byName, placeWithFirstPinFacing, move);
		// Restore explanatory text above its own section and include it in section packing.
		const sectionNotes = new Map<string, { owner: any; notes: typeof notes }>();
		for (const note of notes) {
			const group = note.sectionName
				? db.schematic_group
						.list()
						.find((g: any) => g.name === `layout_${note.sectionName}`)
				: undefined;
			const owner = note.ref
				? byName(note.ref)
				: components().find(
						(c: any) => c.schematic_group_id === group?.schematic_group_id,
					);
			if (!owner)
				throw new Error(`No section for schematic text: ${note.text}`);
			const entry = sectionNotes.get(owner.schematic_group_id) ?? {
				owner,
				notes: [],
			};
			entry.notes.push(note);
			sectionNotes.set(owner.schematic_group_id, entry);
		}
		for (const [groupId, { owner, notes: groupNotes }] of sectionNotes) {
			const members = components().filter(
				(c: any) => c.schematic_group_id === groupId,
			);
			const left = Math.min(
				...members.map((c: any) => c.center.x - c.size.width / 2),
			);
			const top = Math.max(
				...members.map((c: any) => c.center.y + c.size.height / 2),
			);
			const lines = groupNotes.flatMap((note) => {
				const wrapped: string[] = [];
				let line = "";
				for (const word of note.text.split(" ")) {
					if ((line + " " + word).trim().length > 54) {
						wrapped.push(line);
						line = word;
					} else line = (line + " " + word).trim();
				}
				if (line) wrapped.push(line);
				return wrapped.map((text) => ({ ...note, text }));
			});
			lines.forEach((note, i) =>
				db.schematic_text.insert({
					text: note.text,
					position: { x: left, y: top + 1.4 + (lines.length - i) * 0.38 },
					anchor: "top_left",
					font_size: note.fontSize,
					color: note.color,
					rotation: 0,
					schematic_component_id: owner.schematic_component_id,
					schematic_sheet_id: owner.schematic_sheet_id,
				}),
			);
		}
		// Arrange the auto-placed sections in reading order using measured content bounds.
		const defaultRowGap = 2.4;
		const sheets = db.schematic_sheet.list();
		const sectionRowByKey = new Map<string, string>();
		for (const sheet of sheets) {
			const groups = new Map<string, any[]>();
			for (const c of components().filter(
				(c: any) => c.schematic_sheet_id === sheet.schematic_sheet_id,
			)) {
				const list = groups.get(c.schematic_group_id) ?? [];
				list.push(c);
				groups.set(c.schematic_group_id, list);
			}
			const blocks = [...groups.values()]
				.map((members) => {
					const texts = db.schematic_text
						.list()
						.filter((t: any) =>
							members.some(
								(c) => c.schematic_component_id === t.schematic_component_id,
							),
						);
					const minX = Math.min(
						...members.map((c) => c.center.x - c.size.width / 2),
						...texts.map((t: any) => t.position.x),
					);
					const maxX = Math.max(
						...members.map((c) => c.center.x + c.size.width / 2),
						...texts.map(
							(t: any) => t.position.x + t.text.length * t.font_size * 0.62,
						),
					);
					const minY = Math.min(
						...members.map((c) => c.center.y - c.size.height / 2),
					);
					const maxY = Math.max(
						...members.map((c) => c.center.y + c.size.height / 2),
						...texts.map((t: any) => t.position.y),
					);
          const sourceGroup = db.schematic_group.get(members[0].schematic_group_id);
          const sectionName = sourceGroup?.name?.replace(/^layout_/, "");
          const section = board.getDescendants().find((c: any) => c.componentName === "SchematicSection" && c._parsedProps.name === sectionName);
          const titleWidth = (section?._parsedProps.displayName?.length ?? 0) * 0.26 * 0.65;
					return {
						sectionName,
						members,
						minX,
						maxY,
						width: Math.max(maxX - minX, titleWidth) + 3,
						height: maxY - minY + defaultRowGap,
					};
				})
				.sort((a, b) => b.height - a.height);
      const availableWidth = ((sheet.sheet_width ?? 297) - 20) * 1.1 / 10.16;
      const rows = sheetSectionRows[sheet.name] ?? [];
      const bySection = new Map(blocks.map(block => [block.sectionName, block]));
      let nextY = 0;
      const placed: Array<(typeof blocks)[number] & { x: number; y: number }> = [];
      for (const row of rows) {
        const { sections, justify, gapAfter = defaultRowGap } = "sections" in row
          ? row
          : { sections: row, justify: "start" };
        const rowBlocks = sections.map(name => bySection.get(name)).filter(block => block !== undefined);
        const occupiedWidth = rowBlocks.reduce((width, block) => width + block.width, 0);
        const remainingWidth = Math.max(0, availableWidth - occupiedWidth);
        const gap = justify === "space-between" && rowBlocks.length > 1
          ? remainingWidth / (rowBlocks.length - 1)
          : 0;
        let x = justify === "center" ? remainingWidth / 2 : 0;
        let height = 0;
        for (const block of rowBlocks) {
          if (x > 0 && x + block.width > availableWidth + 1e-8) {
            nextY += height;
            x = 0;
            height = 0;
          }
          placed.push({ ...block, x, y: nextY });
          x += block.width + gap;
          height = Math.max(height, block.height);
          bySection.delete(block.sectionName);
        }
        if (height > 0) nextY += height + (gapAfter - defaultRowGap);
      }
      for (const block of packMeasuredGroups([...bySection.values()], availableWidth)) {
        placed.push({ ...block, y: block.y + nextY });
      }
      for (const block of placed) {
        sectionRowByKey.set(`${sheet.schematic_sheet_id}:${block.sectionName}`, `${sheet.schematic_sheet_id}:${block.y}`);
        for (const c of block.members)
          move(c, c.center.x - block.minX + block.x, c.center.y - block.maxY - block.y);
      }
		}
		const sections = board
			.getDescendants()
			.filter((c: any) => c.componentName === "SchematicSection");
		// Core's section bounds omit routed labels. Include labels owned by a
		// connected port in the section so a divider cannot cross their text.
		for (const section of sections) {
			const computeBounds = section._computeSectionBounds.bind(section);
			section._computeSectionBounds = (
				root: any,
				name: string,
				sheetId: string,
			) => {
				const bounds = computeBounds(root, name, sheetId);
				if (!bounds) return bounds;
				const memberIds = new Set(
					root
						.getDescendants()
						.filter((c: any) => c.getSchematicSectionName() === name)
						.map((c: any) => c.schematic_component_id)
						.filter(Boolean),
				);
				const memberPorts = db.schematic_port.list().filter((port: any) =>
					memberIds.has(port.schematic_component_id),
				);
				for (const trace of db.schematic_trace.list({ schematic_sheet_id: sheetId })) {
					const endpoints = [trace.edges[0]?.from, trace.edges.at(-1)?.to];
					if (!memberPorts.some((port: any) => endpoints.some((point: any) =>
						point && Math.hypot(port.center.x - point.x, port.center.y - point.y) < 1e-6,
					))) continue;
					for (const { from, to } of trace.edges)
						bounds.maxY = Math.max(bounds.maxY, from.y, to.y);
				}
				for (const label of db.schematic_net_label.list()) {
					if (label.schematic_sheet_id !== sheetId)
						continue;
					const trace = db.source_trace.get(label.source_trace_id);
					const anchor = label.anchor_position ?? label.center;
					const ports = db.schematic_port
						.list()
						.filter(
							(p: any) =>
								p.schematic_sheet_id === sheetId &&
								(!trace || trace.connected_source_port_ids.includes(p.source_port_id)),
						);
					const nearestPort = ports.sort(
						(a: any, b: any) =>
							Math.hypot(a.center.x - anchor.x, a.center.y - anchor.y) -
							Math.hypot(b.center.x - anchor.x, b.center.y - anchor.y),
					)[0];
					if (!memberIds.has(nearestPort?.schematic_component_id)) continue;
					const vertical =
						label.anchor_side === "top" || label.anchor_side === "bottom";
					const length = label.text.length * 0.13 + 0.2;
					const labelBounds = vertical
						? {
								minX: label.center.x - 0.1,
								maxX: label.center.x + 0.1,
								minY: anchor.y - (label.anchor_side === "top" ? length : 0),
								maxY: anchor.y + (label.anchor_side === "bottom" ? length : 0),
							}
						: {
								minX: Math.min(anchor.x, 2 * label.center.x - anchor.x) - 0.1,
								maxX: Math.max(anchor.x, 2 * label.center.x - anchor.x) + 0.1,
								minY: label.center.y - 0.1,
								maxY: label.center.y + 0.1,
							};
					bounds.minX = Math.min(bounds.minX, labelBounds.minX);
					bounds.maxX = Math.max(bounds.maxX, labelBounds.maxX);
					bounds.minY = Math.min(bounds.minY, labelBounds.minY);
					bounds.maxY = Math.max(bounds.maxY, labelBounds.maxY);
				}
				return bounds;
			};
		}
		function renderSections() {
			for (const e of db.schematic_line.list())
				if (e.is_dashed && !e.schematic_component_id)
					db.schematic_line.delete(e.schematic_line_id);
			for (const e of db.schematic_text.list())
				if (
					!e.schematic_component_id &&
					!e.schematic_symbol_id &&
					!e.source_trace_id
				)
					db.schematic_text.delete(e.schematic_text_id);
			// Use whitespace between sections and align headings above each row's routed content.
			const rowTops = new Map<string, number>();
			const headings = sections.flatMap((section: any) => {
				const { name, displayName } = section._parsedProps;
				const sheetId = section._resolveSchematicSheetId();
				const bounds = section._computeSectionBounds(board, name, sheetId);
				if (!displayName || !bounds) return [];
				const key = `${sheetId}:${name}`;
				const row = sectionRowByKey.get(key) ?? key;
				rowTops.set(row, Math.max(rowTops.get(row) ?? -Infinity, bounds.maxY));
				return [{ displayName, sheetId, row, x: bounds.minX }];
			});
			for (const { displayName, sheetId, row, x } of headings) {
				db.schematic_text.insert({
					text: displayName,
					position: { x, y: rowTops.get(row)! + 0.78 },
					anchor: "top_left",
					font_size: 0.32,
					color: "#244454",
					rotation: 0,
					schematic_sheet_id: sheetId,
				});
			}
		}
		function renderRoutedLabels(inline: boolean) {
			reroute();
			renderSections();
			if (!inline) return;
			// Rerouting recreates all flags before core assigns rail symbols.
			board.doInitialSchematicReplaceNetLabelsWithSymbols();
			labelProgrammingUsbVbus(db, connectorPorts);
			polishMotorPowerWiring(db, byName);
			const controller = byName("U1");
			if (controller?.schematic_sheet_id) {
				reconnectControllerSupplySymbol(db, controller.schematic_sheet_id, db.schematic_port.list({
					schematic_component_id: controller.schematic_component_id,
				}));
			}
			inlineSchematicNetLabels(db);
		}
		const history: any[] = [];
		// Settle the native routes first, then recheck with the inline text in place.
		for (const inline of [false, true]) {
			renderRoutedLabels(inline);
			const seenLayouts = new Set<string>();
			for (let iteration = 0; iteration < 60; iteration++) {
				const issues: any[] = analyzeSchematicPlacement(db.toArray()).getIssues();
				history.push(issues.map((i) => i.lineItemType));
				if (!issues.length) break;
				const layout = JSON.stringify({
					components: components().map((c: any) => [c.schematic_component_id, c.center, c.size, c.symbol_name]),
					texts: db.schematic_text.list().map((t: any) => [t.text, t.position, t.schematic_component_id]),
				}, (_key, value) => typeof value === "number" ? Math.round(value * 1e6) / 1e6 : value);
				if (seenLayouts.has(layout)) break;
				seenLayouts.add(layout);
				let changed = false;
				const moved = new Set<string>();
				const apply = (c: any, x: number, y: number, r = 0) => {
					if (!c || moved.has(c.schematic_component_id)) return;
					move(c, x, y, r);
					moved.add(c.schematic_component_id);
					changed = true;
				};
				for (const issue of issues) {
					const type = issue.lineItemType;
					if (type === "SchematicTextCollision") {
						const t = db.schematic_text.get(issue.schematicTextId);
						if (t && issue.suggestedMove) {
							t.position = {
								x: issue.suggestedMove.newSchX,
								y: issue.suggestedMove.newSchY,
							};
							changed = true;
						}
					} else if (type === "ComponentOverlap") {
						const suggestion = issue.correctionSuggestions[0];
						const c = byName(suggestion.targetComponentName);
						if (c)
							apply(
								c,
								suggestion.newSchX + Math.sign(suggestion.deltaSchX) * 0.25,
								suggestion.newSchY + Math.sign(suggestion.deltaSchY) * 0.25,
							);
					} else if (type === "NetLabelCollision") {
						for (const m of issue.moves ?? [])
							apply(byName(m.componentName), m.newSchX, m.newSchY);
					} else if (type === "TraceCanBeSimplifiedByMovingComponent") {
						apply(fromBox(issue.targetComponent), issue.newSchX, issue.newSchY);
					} else if (
						[
							"CapacitorSymbolHorizontal",
							"TwoPinComponentCouldBeFlipped",
							"TwoPinComponentHasInvertedRails",
							"TwoPinComponentShouldBeVertical",
							"DiodeResistorNotAligned",
						].includes(type)
					) {
						const c = fromBox(
							issue.schematicBox ??
								issue.targetComponent ??
								issue.diodeSchematicBox,
						);
						// A flying capacitor connects two nearby pins on the same chip.
						// Center it between those pins instead of repeatedly flipping it
						// to improve one of its two routes at the expense of the other.
						if (type === "TwoPinComponentCouldBeFlipped" && c) {
							const chip = fromBox(issue.connectedComponent);
							const ownPorts = db.schematic_port.list().filter((p: any) => p.schematic_component_id === c.schematic_component_id);
							const pairs = ownPorts.map((port: any) => {
								const trace = db.source_trace.list().find((t: any) => t.connected_source_port_ids.includes(port.source_port_id) &&
									db.schematic_port.list().some((p: any) => p.schematic_component_id === chip?.schematic_component_id && t.connected_source_port_ids.includes(p.source_port_id)));
								const other = db.schematic_port.list().find((p: any) => p.schematic_component_id === chip?.schematic_component_id && trace?.connected_source_port_ids.includes(p.source_port_id));
								return { port, other };
							});
							if (pairs.length === 2 && pairs.every((p: any) => p.other?.facing_direction === "left") &&
								Math.abs(pairs[0].other.center.y - pairs[1].other.center.y) >= c.size.height) {
								const y = (pairs[0].other.center.y + pairs[1].other.center.y) / 2;
								const first = pairs[0];
								const desired = first.other.center.y > y ? "up" : "down";
								apply(c, Math.min(...pairs.map((p: any) => p.other.center.x)) - 1.2, y,
									first.port.facing_direction === desired ? 0 : 180);
								continue;
							}
						}
						if (c)
							apply(
								c,
								c.center.x,
								c.center.y,
								issue.deltaSchRotation ??
									(type === "CapacitorSymbolHorizontal" ? 90 : 180),
							);
					} else if (type === "FuseDiodeNotAligned") {
						const fuse = fromBox(issue.fuseSchematicBox);
						const diode = fromBox(issue.diodeSchematicBox);
						const ports = db.schematic_port.list();
						const a = ports.find((p: any) => p.source_port_id === issue.fuseSourcePortId);
						const b = ports.find((p: any) => p.source_port_id === issue.diodeSourcePortId);
						if (fuse && diode && a && b) {
							const dirs = ["right", "up", "left", "down"];
							const target = (dirs.indexOf(b.facing_direction) + 2) % 4;
							const rotation = ((target - dirs.indexOf(a.facing_direction) + 4) % 4) * 90;
							const angle = rotation * Math.PI / 180;
							const dx = a.center.x - fuse.center.x, dy = a.center.y - fuse.center.y;
							const offset = [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 }][target];
							apply(fuse,
								b.center.x - offset.x * 1.2 - (dx * Math.cos(angle) - dy * Math.sin(angle)),
								b.center.y - offset.y * 1.2 - (dx * Math.sin(angle) + dy * Math.cos(angle)), rotation);
						}
					} else if (type === "RailPathTooSpreadOut") {
						const host = fromBox(issue.hostSchematicBox);
						if (host) (issue.supportSchematicBoxes ?? []).forEach((box: any, i: number) => {
							const c = fromBox(box);
							if (c) apply(c, host.center.x - 1 - i * 1.5, host.center.y + 2.5);
						});
					} else if (type === "DecouplingCapacitorsNotCloseTogether") {
						const caps = issue.capacitorSchematicBoxes
							.map(fromBox)
							.filter(Boolean)
							.sort((a: any, b: any) => a.center.x - b.center.x);
						// Two rows keep the entire same-rail bank compact without hand-placing any capacitor.
						const x = caps[0].center.x,
							y = caps[0].center.y;
	          const pitch = Math.min(Math.min(...caps.map((c: any) => c.size.width)) + issue.maxRecommendedBodyGap - 0.1, Math.max(1.25, ...caps.map((c: any) => {
	            const name = db.source_component.get(c.source_component_id)?.name ?? "";
	            return name.length * 0.12 + 0.3;
	          })));
						caps.forEach((c: any, i: number) =>
								apply(c, x + (i % 3) * pitch, y - Math.floor(i / 3) * 1.4),
						);
					}
				}
				if (!changed) break;
				if (moved.size) renderRoutedLabels(inline);
			}
		}
		const remaining = analyzeSchematicPlacement(db.toArray()).getIssues();
		board.__schematicStyleHistory = history;
		if (remaining.length)
			throw new Error(
				`Automatic schematic style refinement did not converge: ${JSON.stringify(remaining)}`,
			);
		// Sheet warnings must be recomputed after moving the automatic layout.
		for (const e of db.schematic_element_outside_sheet_warning.list())
			db.schematic_element_outside_sheet_warning.delete(
				e.schematic_element_outside_sheet_warning_id,
			);
		for (const c of board.getDescendants())
			if (c.componentName === "SchematicSheet")
				c.doInitialSchematicSheetRender();
		original();
	};
}
