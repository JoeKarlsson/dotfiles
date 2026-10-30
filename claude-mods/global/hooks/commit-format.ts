import type { On } from 'claude-code'

import { gitSubcommand, segments } from './shell'

// Joe's commit format: `feat: <Summary>`, `fix: <Summary>` or
// `chore: <Summary>`, the summary starting with an uppercase letter.
const FORMAT = /^(feat|fix|chore): [A-Z]/
// Subjects git writes itself.
const GIT_MADE = /^(Merge |Revert "|fixup! |squash! |amend! )/

function subjectOf(message: string): string {
  const heredoc = /^\$\(cat\s+<<-?\s*['"]?(\w+)['"]?\n([\s\S]*?)\n\s*\1\s*\)?/.exec(message)
  return (heredoc ? (heredoc[2] ?? '') : message).trim().split('\n')[0]?.trim() ?? ''
}

// The subject of the first `git commit` in the command given a message with -m, or null.
export function commitSubject(command: string): string | null {
  for (const seg of segments(command)) {
    const args = gitSubcommand(seg, 'commit')
    if (!args) continue
    for (let i = 0; i < args.length; i++) {
      const a = args[i] ?? ''
      if (a === '--') break
      let message: string | undefined
      if (a === '-m' || a === '--message' || /^-[a-zA-Z]*m$/.test(a)) message = args[i + 1]
      else if (a.startsWith('--message=')) message = a.slice('--message='.length)
      else if (/^-m./.test(a)) message = a.slice(2)
      if (message !== undefined) return subjectOf(message)
    }
  }
  return null
}

export function formatDenial(command: string): string | null {
  const subject = commitSubject(command)
  if (subject === null || FORMAT.test(subject) || GIT_MADE.test(subject)) return null
  return (
    `Commit message "${subject}" doesn't follow the format. Use feat: <Summary>, fix: <Summary> or ` +
    `chore: <Summary> (chore for changes that aren't user facing), the summary starting with an uppercase letter.`
  )
}

export function registerCommitFormat(on: On) {
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    const denial = formatDenial(e.command)
    return denial ? { deny: denial } : next(e)
  })
}
