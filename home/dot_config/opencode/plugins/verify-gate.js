// verify-gate: if the agent edits code and then finishes without running anything,
// send it one follow-up telling it to run the change and report PASS/FAIL.
// Prompting alone does not make open models verify; this makes "stop without
// running it" cost a turn instead of being free. OpenCode v2 plugin API.

import { appendFileSync } from "node:fs"

// Set VERIFY_GATE_DEBUG=/path/to/file to log every tool call and session event the gate sees
const dbg = (...a) =>
  process.env.VERIFY_GATE_DEBUG &&
  appendFileSync(process.env.VERIFY_GATE_DEBUG, a.map((x) => (typeof x === "string" ? x : JSON.stringify(x))).join(" ") + "\n")

const EDIT_TOOLS = new Set(["edit", "write", "patch", "multiedit", "apply_patch"])
// Docs need no run (same rule as AGENTS.md): editing only these never arms the gate
const TEXT_ONLY = /\.(md|mdx|txt|rst)$/i
// A shell segment that only reads or does git bookkeeping is not a verification run
const NOT_A_RUN = /^\s*(ls|cat|head|tail|less|grep|rg|find|fd|pwd|echo|printf|wc|which|file|stat|tree|sed\s+-n|git)\b/

function editedFiles(tool, input) {
  const direct = input?.filePath ?? input?.path ?? input?.file_path
  if (direct) return [direct]
  const patch = input?.patchText ?? input?.patch ?? input?.input
  if (typeof patch === "string") {
    const found = [...patch.matchAll(/^\*\*\* (?:Add|Update) File: (.+)$/gm)].map((m) => m[1].trim())
    if (found.length) return found
  }
  return [`(files changed by ${tool})`]
}

function isRun(command) {
  if (typeof command !== "string" || !command.trim()) return false
  const segments = command.split(/&&|\|\||;|\|/).filter((s) => s.trim() && !/^\s*cd\b/.test(s))
  return segments.some((s) => !NOT_A_RUN.test(s))
}

export default {
  id: "joe.verify-gate",
  async setup(ctx) {
    const sessions = new Map()
    const state = (id) => {
      if (!sessions.has(id)) sessions.set(id, { pending: new Set(), nudged: false })
      return sessions.get(id)
    }

    await ctx.tool.hook("execute.after", (e) => {
      dbg("tool", e.tool, e.status, e.sessionID, e.input)
      if (e.status !== "completed") return
      const st = state(e.sessionID)
      if (EDIT_TOOLS.has(e.tool)) {
        for (const f of editedFiles(e.tool, e.input)) if (!TEXT_ONLY.test(f)) st.pending.add(f)
      } else if ((e.tool === "shell" || e.tool === "bash") && isRun(e.input?.command)) {
        st.pending.clear()
        st.nudged = false
      }
    })

    // A real user turn re-arms the gate; our own follow-up is tagged in metadata
    await ctx.session.hook("prompt", (e) => {
      if (!e.metadata?.verifyGate) state(e.sessionID).nudged = false
    })

    const controller = new AbortController()
    void (async () => {
      for await (const event of ctx.event.subscribe({ signal: controller.signal })) {
        if (String(event.type).startsWith("session.") && !/delta|step\.streamed|usage/.test(event.type)) dbg("event", event.type, event.data?.sessionID)
        const id = event.data?.sessionID
        if (!id) continue
        // Esc or a provider error: never nag, just forget the pending edits
        if (event.type === "session.execution.interrupted" || event.type === "session.execution.failed") {
          sessions.get(id)?.pending.clear()
          continue
        }
        if (event.type !== "session.execution.succeeded") continue

        const st = sessions.get(id)
        if (!st || st.pending.size === 0) continue
        if (st.nudged) {
          st.pending.clear()
          continue
        }
        // Subagents report back to their parent; only gate the top-level session
        const info = await ctx.session.get({ sessionID: id }).catch(() => undefined)
        if (info?.parentID) continue

        st.nudged = true
        const files = [...st.pending].slice(0, 8).join(", ")
        console.log(`[verify-gate] nudging ${id}: unverified edits to ${files}`)
        await ctx.session
          .prompt({
            sessionID: id,
            metadata: { verifyGate: true },
            text:
              `[verify-gate] You edited ${files} but ran nothing afterwards. Your work is judged by running it. ` +
              `Run the specific test or command that exercises this change now, paste the 1 to 5 output lines ` +
              `that matter, and end with PASS or FAIL. If it fails, fix it and run it again. ` +
              `If it truly cannot be run, say exactly why in one line.`,
          })
          .catch((err) => console.log(`[verify-gate] nudge failed for ${id}: ${err?.message ?? err}`))
      }
    })().catch((err) => console.log(`[verify-gate] event loop stopped: ${err?.message ?? err}`))

    return () => controller.abort()
  },
}
