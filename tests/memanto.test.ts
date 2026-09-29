import { describe, expect, it, vi, beforeEach } from "vitest";
import { spawnSync } from "node:child_process";

vi.mock("node:child_process", () => ({ spawnSync: vi.fn() }));

const mockSpawnSync = vi.mocked(spawnSync);

function mockOk(stdout = "") {
  mockSpawnSync.mockReturnValueOnce({
    status: 0,
    stdout,
    stderr: "",
    error: undefined,
  } as unknown as ReturnType<typeof spawnSync>);
}

function mockFail(stderr = "boom") {
  mockSpawnSync.mockReturnValueOnce({
    status: 1,
    stdout: "",
    stderr,
    error: undefined,
  } as unknown as ReturnType<typeof spawnSync>);
}

describe("memanto wrapper", () => {
  beforeEach(() => {
    mockSpawnSync.mockReset();
  });

  it("remember activates the agent before storing the fact", async () => {
    const { remember } = await import("../src/lib/memanto.js");
    mockOk(); // activate
    mockOk("stored"); // remember

    const result = remember("proj-agent", "Auth uses JWT now", { type: "decision" });

    expect(result.ok).toBe(true);
    expect(mockSpawnSync).toHaveBeenNthCalledWith(
      1,
      "memanto",
      ["agent", "activate", "proj-agent"],
      expect.anything(),
    );
    expect(mockSpawnSync).toHaveBeenNthCalledWith(
      2,
      "memanto",
      ["remember", "Auth uses JWT now", "--type", "decision"],
      expect.anything(),
    );
  });

  it("stops and surfaces the error when activation fails", async () => {
    const { remember } = await import("../src/lib/memanto.js");
    mockFail("agent not found");

    const result = remember("missing-agent", "fact", { type: "fact" });

    expect(result.ok).toBe(false);
    expect(result.stderr).toBe("agent not found");
    expect(mockSpawnSync).toHaveBeenCalledTimes(1);
  });

  it("recall with --recent omits the query argument", async () => {
    const { recall } = await import("../src/lib/memanto.js");
    mockOk();
    mockOk("[]");

    recall("proj-agent", "", { recent: true, type: "learning", limit: 5 });

    expect(mockSpawnSync).toHaveBeenNthCalledWith(
      2,
      "memanto",
      ["recall", "--recent", "--type", "learning", "--limit", "5", "--active"],
      expect.anything(),
    );
  });
});
