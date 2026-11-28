import type { On } from 'claude-code'

// Context audit 2026-11-25: worktree subagents re-ran the same refused write 13 to 17 times
// (joekarlsson.com agent-a63979ad: 17). The refusal never changes on retry, so the first one
// gets told what works instead.
const REFUSAL = /This session is isolated in the worktree (\S+?),/

export function worktreeRefusalNote(errorText: string): string | null {
  const worktree = REFUSAL.exec(errorText)?.[1]
  if (!worktree) return null
  return `Worktree isolation (global mod): retrying this exact call is refused every time. ` +
    `Run plain, single commands inside ${worktree} (no cd, no && chains, no paths outside it), ` +
    `write files there with the Write tool, or put the content in your final report instead of a scratch file.`
}

export function registerWorktreeRefusal(on: On) {
  on('tool.call', { tool: /^(Bash|Write|Edit)$/ }, async ($, e, next) => {
    const ran = await next(e)
    if (ran.deny !== undefined) return ran
    const note = ran.isError ? worktreeRefusalNote(ran.text ?? '') : null
    return note ? { ...ran, context: [...(ran.context ?? []), note] } : ran
  })
}
