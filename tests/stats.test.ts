import { describe, expect, it } from "vitest";
import { summarize, deliveriesSinceLastDream, isDreamDue } from "../src/lib/stats.js";
import type { JournalEvent } from "../src/lib/journal.js";

function ev(partial: Partial<JournalEvent> & { event: JournalEvent["event"] }): JournalEvent {
  return { ts: "2026-01-01T00:00:00.000Z", ...partial };
}

describe("summarize", () => {
  it("counts events by type and rejections by phase", () => {
    const stats = summarize([
      ev({ event: "gate", phase: "ready", result: "pass" }),
      ev({ event: "gate", phase: "specify", result: "reject" }),
      ev({ event: "gate", phase: "specify", result: "reject" }),
      ev({ event: "flaky" }),
      ev({ event: "verify-gap" }),
    ]);

    expect(stats.totalEvents).toBe(5);
    expect(stats.byEvent.gate).toBe(3);
    expect(stats.rejectionsByPhase.specify).toBe(2);
    expect(stats.rejectionsByPhase.ready).toBeUndefined();
    expect(stats.flakyCount).toBe(1);
    expect(stats.verifyGapCount).toBe(1);
  });
});

describe("dream due", () => {
  it("counts deliveries since the last dream cycle only", () => {
    const events = [
      ev({ event: "delivery", id: "A" }),
      ev({ event: "dream-start" }),
      ev({ event: "dream-end" }),
      ev({ event: "delivery", id: "B" }),
      ev({ event: "delivery", id: "C" }),
    ];
    expect(deliveriesSinceLastDream(events)).toBe(2);
  });

  it("is due once the threshold is met, not before", () => {
    const events = [ev({ event: "delivery" }), ev({ event: "delivery" })];
    expect(isDreamDue(events, 3)).toBe(false);
    expect(isDreamDue(events, 2)).toBe(true);
  });

  it("is never due when the threshold is 0 or negative", () => {
    expect(isDreamDue([ev({ event: "delivery" })], 0)).toBe(false);
  });
});
