# Changes in test

An overlay/fact change that isn't obviously safe (unlike, say, fixing a
stale command in a project fact) gets tracked as an experiment instead of
applied outright — so its actual effect gets checked before it's kept.

## Recording one

`.plumb/dream/experiments/<slug>.md`:

```
# <slug>

- Applied: <date>, branch dream/<slug>
- Change: <one line — what changed and where>
- Target metric: <e.g. rejections in `ready` phase per delivery>
- Baseline: <value from `plumb stats` before the change>
- Status: testing
```

## Deciding the next cycle

At the start of the next dream cycle, for every experiment still `testing`:
compare `plumb stats` now against the recorded baseline, on that same
metric, over a comparable number of deliveries.

- Metric improved, no new problem introduced → **keep**: mark `Status:
  kept`, fold the change into the permanent overlay (it already is one;
  this just stops re-evaluating it).
- Metric didn't move, or got worse → **revert**: undo the branch, mark
  `Status: reverted`, and note why in the experiment file — a reverted
  experiment is still evidence for the next diagnosis pass.
- Directionally right but not enough data yet → **extend**: leave `Status:
  testing` for another cycle, don't re-decide on noise.

Never judge an experiment by anecdote ("felt like it helped") — the
recorded baseline and the current `plumb stats` output are the only inputs
to this decision.
