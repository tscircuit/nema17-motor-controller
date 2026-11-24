import { functionalGroupFor, functionalGroups } from "./functionalGroups";
import { installSchematicStyleRefinement } from "./refineSchematicStyle";
import {
	Children,
	Fragment,
	cloneElement,
	isValidElement,
	type ReactElement,
	type ReactNode,
} from "react";

/** Keep physical PCB placement intact; give each schematic section its own layout scope. */
export function autoLayoutSections(tree: ReactNode): ReactNode {
	let elementKey = 0;
	const sectionTitles = new Map<string, string>(functionalGroups.map(group => [group.name, group.title]));
	const notes: Array<{
		text: string;
		ref?: string;
		sectionName?: string;
		fontSize: number;
		color: string;
	}> = [];
	const textHeadings: Record<string, string> = {
		"3.3 V Supply": "MCU__programming_supply",
		"3.3 V Bypass": "MCU__programming_bypass",
		"Programming USB-C": "MCU__usb",
		"USB-C PD Negotiation": "motor_power_pd_negotiation",
		"Power Filtering": "motor_power_filtering",
		"Temperature Sensing & MCU Alert": "thermal_protection",
		"RP2040-selectable USB-PD voltage": "pd_gpio_buffers",
	};
	const selectorProps = (value: any): any => {
		if (typeof value === "string") {
			if (value === "MCU__power") return "MCU__rp2040";
			if (["MCU__status", "MCU__debug"].includes(value)) return "MCU__controls";
			return value.replace(
				/\.MCU > \.(U1|L_AVDD|J_USB)(?= |$)/g,
				(_, ref) =>
					`.MCU > .layout_${functionalGroupFor(ref)?.name ?? (ref === "J_USB" ? "MCU__usb" : "MCU__rp2040")} > .${ref}`,
			);
		}
		if (isValidElement(value)) return value;
		if (Array.isArray(value)) return value.map(selectorProps);
		if (value && typeof value === "object")
			return Object.fromEntries(
				Object.entries(value).map(([k, v]) => [k, selectorProps(v)]),
			);
		return value;
	};
	
	function expand(input: ReactNode): ReactNode[] {
		if (Array.isArray(input)) return input.flatMap(expand);
		if (!isValidElement(input)) return input == null ? [] : [input];
		const node = input as ReactElement<any>;
		if (typeof node.type === "function")
			return expand((node.type as any)(node.props));
		if ((node.type as unknown) === Fragment)
			return Children.toArray(node.props.children).flatMap(expand);
		if (node.type === "schematicsection") {
			if (node.props.displayName)
				sectionTitles.set(
					selectorProps(node.props.name),
					node.props.displayName,
				);
			return [];
		}
		if (node.type === "schematictext") {
			const headingSection = textHeadings[node.props.text];
			if (headingSection) sectionTitles.set(headingSection, node.props.text);
			else {
				const ref = node.props.name?.match(/^description_(.+)_\d+$/)?.[1];
				notes.push({
					text: node.props.text,
					ref,
					sectionName: ref ? undefined : "pd_gpio_buffers",
					fontSize: node.props.fontSize ?? 0.23,
					color: node.props.color ?? "#31576b",
				});
			}
			return [];
		}
		const children = Children.toArray(node.props.children).flatMap(expand);
		return [
			cloneElement(
				node,
				{
					...selectorProps(node.props),
          ...(functionalGroupFor(node.props.name) ? { schSectionName: functionalGroupFor(node.props.name)!.name } : {}),
					...(node.type === "schematicsheet"
						? { sheetWidth: undefined, sheetHeight: undefined }
						: {}),
					key: `layout-element-${elementKey++}`,
				},
				children,
			),
		];
	}
	function arrange(node: any, inheritedSheet = "controller"): any {
		if (!isValidElement<any>(node)) return node;
		const sheet = node.props.schSheetName ?? inheritedSheet;
		let children = Children.toArray(node.props.children).map((c) =>
			arrange(c, sheet),
		);
		if (node.type !== "group" && node.type !== "board")
			return cloneElement(node, {}, children);
		const sections = new Map<string, any[]>();
		for (const child of children) {
			if (
				!isValidElement<any>(child) ||
				!child.props.schSectionName ||
				!child.props.name
			)
				continue;
			const key = `${child.props.schSheetName ?? sheet}:${child.props.schSectionName}`;
			const members = sections.get(key) ?? [];
			members.push(child);
			sections.set(key, members);
		}
		children = children.filter(
			(c) => ![...sections.values()].some((m) => m.includes(c)),
		);
		for (const [key, members] of sections) {
			const sectionSheet =
				members[0].props.schSectionName === "MCU__controls"
					? "controller_controls"
					: (members[0].props.schSheetName ?? sheet);
			const sectionName = members[0].props.schSectionName;
			children.push(
				<group
					key={key}
					name={`layout_${sectionName}`}
					pcbX={0}
					pcbY={0}
					schSheetName={sectionSheet}
					schAutoLayoutEnabled
				>
					<schematicsection
						name={sectionName}
						displayName={
							functionalGroups.find(group => group.name === sectionName)?.title ?? sectionTitles.get(sectionName) ??
							(sectionName === "MCU__controls"
								? "Controls, Status & SWD"
								: sectionName.replace(/^MCU__/, "").replaceAll("_", " "))
						}
					/>
					{members.map((m) =>
						cloneElement(m, {
							schX: undefined,
							schY: undefined,
							schSheetName: sectionSheet,
						}),
					)}
				</group>,
			);
		}
		return cloneElement(
			node,
			node.type === "group"
				? { schX: undefined, schY: undefined, ...(node.props.name === "MCU" ? {schAutoLayoutEnabled: false} : {}) }
				: {
						ref: (board: any) => {
							if (typeof node.props.ref === "function") node.props.ref(board);
							installSchematicStyleRefinement(board, notes);
						},
					},
			children,
		);
	}
	const result = arrange(expand(tree)[0]);
	return cloneElement(
		result,
		{},
		result.props.children,
		<schematicsheet
			name="controller_controls"
			displayName="Controller Controls, Status & SWD"
			sheetIndex={10}
		/>,
	);
}
