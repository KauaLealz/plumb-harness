# TDD here

Minimal means: the smallest change that makes the failing test pass without
breaking an existing one. Not the smallest change that looks clever — a
straightforward if/else beats a generic abstraction built for a
hypothetical second case that isn't in this task.

Don't write the implementation and the test in the same pass "to save
time" — the test written after the code tends to test what the code does,
not what the AC requires. Red, then green, then move on; no separate
refactor pass unless the task's AC specifically calls for one.
