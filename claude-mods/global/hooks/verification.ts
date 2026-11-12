import type { On } from 'claude-code'

// Two Testing rules from the global CLAUDE.md (2026-11-12) that a model forgets
// mid-task, so they get a nudge at the moment they apply:
// - A subagent's "done" is a claim: when a subagent edited files, the main loop's
//   stop is blocked once (through open-outputs' Stop hook) until it has looked at
//   them (a git diff/show/log -p, or a Read of one of the files).
// - A flaky or slow test gets its cause fixed: an edit to a test file that raises a
//   timeout or adds a retry gets a note.

const TEST_FILE =
  /(^|\/)(tests?|__tests__|spec|e2e)\/|[._-](test|spec)\.[a-z]+$|(^|\/)test_[^/]+\.py$|(^|\/)conftest\.py$|(jest|vitest|playwright|cypress)\.config\.[a-z]+$|(^|\/)pytest\.ini$/i

// `timeout: 5000`, `testTimeout = 30`, `retries: 2`, `setTimeout(fn, 500)`, `{ timeout: 10_000 }`, `@pytest.mark.flaky(reruns=3)`.
const KNOB = /\b(\w*timeout\w*|retries|retry|reruns|max_?attempts|attempts)\b["']?\s*[:=,(]\s*(?:[\w.]+\s*,\s*)?(\d[\d_]*(?:\.\d+)?)/gi

function knobs(text: string): Map<string, number> {
  const out = new Map<string, number>()
  for (const m of text.matchAll(KNOB)) {
    const key = m[1].toLowerCase()
    out.set(key, Math.max(out.get(key) ?? 0, Number(m[2].replace(/_/g, ''))))
  }
  return out
}

// The knobs an edit raised or added: `before` is the replaced text ('' for a new file).
export function raisedKnobs(path: string, before: string, after: string): string[] {
  if (!TEST_FILE.test(path)) return []
  const was = knobs(before)
  return [...knobs(after)].filter(([key, value]) => value > (was.get(key) ?? (/retr|rerun|attempt/.test(key) ? 0 : Infinity))).map(([key]) => key)
}

export const timeoutNote = (path: string, keys: string[]) =>
  `Test timing (global mod, global CLAUDE.md Testing): this edit to ${path} raises or adds ${keys.join(', ')}. ` +
  'Joe\'s rule: find why the test is slow or flaky and fix that; never just raise the timeout or add a retry. ' +
  'Fix the cause, or say in one line why the longer wait is the real fix (the operation truly takes longer now).'

// A main-loop command or read that looks at what a subagent changed.
export const isDiffCommand = (command: string) => /\bgit\b(\s+-C\s+\S+)*\s+(diff|show|log\s[^|;&]*(-p|--patch|--stat))\b/.test(command)

export const subagentNote = (paths: string[]) =>
  `Before you report this done (global mod, global CLAUDE.md Testing): subagents edited ${paths.length} file${paths.length > 1 ? 's' : ''} ` +
  `(${paths.slice(0, 5).join(', ')}${paths.length > 5 ? ', …' : ''}). Their "done" is a claim: read the diff (git diff / git show in their ` +
  'worktree or branch) and check it does what you asked, then report what you found.'

let unchecked: string[] = []

// The one classic.Stop hook lives in open-outputs.ts (a module may register it once); it asks this.
export function takeSubagentNote(): string | undefined {
  if (!unchecked.length) return undefined
  const note = subagentNote(unchecked)
  unchecked = []
  return note
}

export function registerVerification(on: On) {
  on('tool.call', { tool: ['Edit', 'Write'] }, async ($, e, next) => {
    const ran = await next(e)
    if (ran.deny !== undefined || ran.isError) return ran
    if (e.agentId && !unchecked.includes(e.file_path)) unchecked.push(e.file_path)
    const before = 'old_string' in e ? e.old_string : ''
    const after = 'new_string' in e ? e.new_string : 'content' in e ? e.content : ''
    const keys = raisedKnobs(e.file_path, before, after)
    if (!keys.length) return ran
    return { ...ran, context: [...(ran.context ?? []), timeoutNote(e.file_path, keys)] }
  })

  on('tool.call', { tool: ['Bash', 'Read'] }, async ($, e, next) => {
    const ran = await next(e)
    if (e.agentId || ran.isError || !unchecked.length) return ran
    if (e.tool === 'Bash' && isDiffCommand((e as { command: string }).command)) unchecked = []
    if (e.tool === 'Read') unchecked = unchecked.filter(p => p !== (e as { file_path: string }).file_path)
    return ran
  })
}
