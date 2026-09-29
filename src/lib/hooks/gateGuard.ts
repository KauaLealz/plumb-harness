import type { JournalEvent } from "../journal.js";

// Commands that write outside the repo (board, PR) and must never run
// without a recorded gate approval (plan §9.2, §12.7).
const GUARDED_COMMAND_PATTERNS = [/\bgit\s+push\b/, /\bgh\s+pr\s+create\b/];

export function isGuardedCommand(command: string): boolean {
  return GUARDED_COMMAND_PATTERNS.some((pattern) => pattern.test(command));
}

/** True if the journal has at least one recorded pass/pass-with-risks gate
 * for the `review` phase — the last gate before a push/PR is meaningful. */
export function hasApprovedReviewGate(events: JournalEvent[]): boolean {
  return events.some(
    (e) => e.event === "gate" && e.phase === "review" && (e.result === "pass" || e.result === "pass-with-risks"),
  );
}

export const GATE_GUARD_MESSAGE =
  "Blocked: no approved `review` gate recorded in the journal yet. " +
  "Run the review phase gate (`plumb log gate --phase review --result pass`, from an explicit human yes) before pushing or opening a PR.";
