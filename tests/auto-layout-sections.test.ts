import { expect, test } from "bun:test";
import { createElement, type ReactElement } from "react";
import { autoLayoutSections } from "../schematic/AutoLayoutSections";

function findByName(node: any, name: string): any {
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findByName(child, name);
      if (found) return found;
    }
    return undefined;
  }
  if (node && typeof node === "object") {
    if (node.props?.name === name) return node;
    return findByName(node.props?.children, name);
  }
  return undefined;
}

test("function components returning arrays still get section assignment", () => {
  const ArrayReturning = () => [
    createElement("chip", { name: "R_STATUS_R", key: "a" }),
    createElement("chip", { name: "R_STATUS_G", key: "b" }),
  ];
  const tree = createElement(
    "board",
    {},
    createElement(ArrayReturning, {}),
  );
  const result = autoLayoutSections(tree) as ReactElement;
  const red = findByName(result, "R_STATUS_R");
  const green = findByName(result, "R_STATUS_G");
  expect(red?.props?.schSectionName).toBe("rgb_red");
  expect(green?.props?.schSectionName).toBe("rgb_green");
});
