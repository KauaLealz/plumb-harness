import type { JournalEvent } from "./journal.js";

export interface JournalStats {
  totalEvents: number;
  byEvent: Record<string, number>;
  rejectionsByPhase: Record<string, number>;
  flakyCount: number;
  verifyGapCount: number;
  escapedDefectCount: number;
}

export function summarize(events: JournalEvent[]): JournalStats {
  const byEvent: Record<string, number> = {};
  const rejectionsByPhase: Record<string, number> = {};

  for (const event of events) {
    byEvent[event.event] = (byEvent[event.event] ?? 0) + 1;
    if (event.event === "gate" && event.result === "reject" && event.phase) {
      rejectionsByPhase[event.phase] = (rejectionsByPhase[event.phase] ?? 0) + 1;
    }
  }

  return {
    totalEvents: events.length,
    byEvent,
    rejectionsByPhase,
    flakyCount: byEvent.flaky ?? 0,
    verifyGapCount: byEvent["verify-gap"] ?? 0,
    escapedDefectCount: byEvent["escaped-defect"] ?? 0,
  };
}

/** How many `delivery` events happened since the last dream cycle
 * (dream-start/dream-end), and whether that meets the project's threshold. */
export function deliveriesSinceLastDream(events: JournalEvent[]): number {
  let count = 0;
  for (let i = events.length - 1; i >= 0; i--) {
    const event = events[i];
    if (event.event === "dream-start" || event.event === "dream-end") break;
    if (event.event === "delivery") count++;
  }
  return count;
}

export function isDreamDue(events: JournalEvent[], everyNDeliveries: number): boolean {
  if (everyNDeliveries <= 0) return false;
  return deliveriesSinceLastDream(events) >= everyNDeliveries;
}
