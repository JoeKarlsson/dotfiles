import type { EngineInterface, On } from 'claude-code'

import { git } from './git'

// Joe's design verdicts kept getting lost in long iterative sessions ("This is the
// fourth time I've told you", "the second time I told you I hate them": 17 such
// messages, 2026-10-13 to 2026-11-12, mostly joekarlsson.com and screencast-director).
// A repo's DECISIONS.md holds them, one line each; it is put in context at session
// start and again after every compaction, which is where they were being lost.
// On the first prompt and the first after each compaction or /clear, through
// prompt.submit: Claude Code's built-in security plugin answers classic.SessionStart
// and prompt.context first and skipped this hook in every session until 2026-11-24.

const MAX_CHARS = 6000

export const decisionsNote = (path: string, text: string) =>
  `Joe's standing decisions for this repo (${path}, global mod). Follow them; when Joe gives a new verdict ` +
  `("I hate X", "always Y", "we agreed Z"), add one dated line to that file right away.\n\n${text.slice(0, MAX_CHARS)}`

let needsDecisions = true
// Called from register.ts's one session.end hook on /clear.
export const resendDecisions = () => { needsDecisions = true }

export function registerDecisions(on: On) {
  on('session.compact', async ($, e, next) => {
    const compacted = await next(e)
    if (e.agentId === undefined) needsDecisions = true
    return compacted
  })
}

// Called from marketing.ts's one prompt.submit hook, for each prompt Joe types.
export async function decisionsForPrompt($: EngineInterface): Promise<string | undefined> {
  if (!needsDecisions) return undefined
  needsDecisions = false
  const top = await git($, await $.session.cwd(), 'rev-parse', '--show-toplevel')
  if (top.exitCode !== 0) return undefined
  const path = `${top.stdout.trim()}/DECISIONS.md`
  return (await $.fs.exists(path)) ? decisionsNote(path, await $.fs.read(path)) : undefined
}
