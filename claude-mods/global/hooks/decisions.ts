import type { On } from 'claude-code'

import { git } from './git'

// Joe's design verdicts kept getting lost in long iterative sessions ("This is the
// fourth time I've told you", "the second time I told you I hate them": 17 such
// messages, 2026-10-13 to 2026-11-12, mostly joekarlsson.com and screencast-director).
// A repo's DECISIONS.md holds them, one line each; it is put in context at session
// start and again after every compaction, which is where they were being lost.

const MAX_CHARS = 6000

export const decisionsNote = (path: string, text: string) =>
  `Joe's standing decisions for this repo (${path}, global mod). Follow them; when Joe gives a new verdict ` +
  `("I hate X", "always Y", "we agreed Z"), add one dated line to that file right away.\n\n${text.slice(0, MAX_CHARS)}`

export function registerDecisions(on: On) {
  on('classic.SessionStart', async ($, e, next) => {
    const result = await next(e)
    const top = await git($, await $.session.cwd(), 'rev-parse', '--show-toplevel')
    if (top.exitCode !== 0) return result
    const path = `${top.stdout.trim()}/DECISIONS.md`
    if (!(await $.fs.exists(path))) return result
    return { ...result, additionalContext: [...(result.additionalContext ?? []), decisionsNote(path, await $.fs.read(path))] }
  })
}
