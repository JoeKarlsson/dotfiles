---
type: Concept
description: Read before reporting, or acting on, a number you measured (X is faster or slower than Y, a speedup, a latency, a model or tool comparison): the four checks a number must pass, and how to report it
---
# Vetting a measured number

A number that sounds right reads the same whether or not it measured the work. Before it goes in a commit, a reply or a decision, check these four. Adapted from `benchmark-checklist` in [cursor/plugins pstack](https://github.com/cursor/plugins/tree/main/pstack) (MIT).

1. **Was each side set up the way it really runs?** Same hardware, release build, production flags, warm or cold the way real use is, the right precision and device. If one side ran on defaults or fell back (a model that slipped off the GPU to the CPU, a debug build, a missing index), you compared setups, not options. Fix the setup and measure again before you pick a winner.
2. **Did it time what you think?** Name what bounds the number, from a profile or counters taken during a run, not from reading the code. A probe run from another host also times the network between them. Do the arithmetic: a part that takes 10% of the run can make the whole thing at most about 11% faster, and a result past a disk, network or core limit measured a cache or a no-op.
3. **Did the work happen, without errors?** Count failures, timeouts and non-success responses, and check that the output is correct, not just present. Rejections are fast. Lazy code that nobody consumed costs nothing.
4. **Does it repeat?** Run each side at least 5 times, alternating A, B, A, B, so warm-up and drift favor neither. A gap smaller than the run-to-run spread is no difference. Check what else is loading the machine (`uptime`), since other sessions share it.

A quick ballpark someone asked for can be one run: still check 2 and 3, and say it was one run. A choice between options is never a ballpark.

## Report

Lead with the verdict: faster, slower, no measurable difference, or inconclusive. Give the number with its unit, the run count, the range and what bounds it ("p50 41 ms → 33 ms, median of 7 runs each, bound by JSON parsing on one core"). If you couldn't name the limit, one side wasn't set up properly, or you couldn't check 3, the verdict is inconclusive. Say which check is missing.
