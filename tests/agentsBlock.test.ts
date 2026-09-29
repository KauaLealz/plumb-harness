import { describe, expect, it } from "vitest";
import { extractProjectFacts, renderPlumbBlock, upsertPlumbBlock } from "../src/lib/agentsBlock.js";

describe("upsertPlumbBlock", () => {
  it("appends the block to an empty file", () => {
    const result = upsertPlumbBlock("", "");
    expect(result).toContain("<!-- plumb:begin");
    expect(result).toContain("<!-- plumb:end -->");
    expect(result).toContain("Use skill `plumb` for any code change");
  });

  it("preserves existing content and appends after it", () => {
    const result = upsertPlumbBlock("# My project\n\nSome existing rules.\n", "");
    expect(result).toContain("# My project");
    expect(result).toContain("Some existing rules.");
    expect(result.indexOf("Some existing rules.")).toBeLessThan(result.indexOf("<!-- plumb:begin"));
  });

  it("replaces only the managed block on a second run, keeping the rest", () => {
    const first = upsertPlumbBlock("# My project\n\nSome existing rules.\n", "");
    const second = upsertPlumbBlock(first, "Stack: Node/TypeScript.");
    expect(second).toContain("# My project");
    expect(second).toContain("Some existing rules.");
    expect(second).toContain("Stack: Node/TypeScript.");
    expect(second.match(/plumb:begin/g)).toHaveLength(1);
  });
});

describe("extractProjectFacts", () => {
  it("returns empty string when there is no managed block yet", () => {
    expect(extractProjectFacts("# My project\n")).toBe("");
  });

  it("returns empty string for the placeholder facts text", () => {
    const block = renderPlumbBlock("");
    expect(extractProjectFacts(block)).toBe("");
  });

  it("round-trips real project facts written by a previous run", () => {
    const withFacts = upsertPlumbBlock("", "Stack: Node/TypeScript.\nBoard: Jira.");
    expect(extractProjectFacts(withFacts)).toBe("Stack: Node/TypeScript.\nBoard: Jira.");
  });
});
