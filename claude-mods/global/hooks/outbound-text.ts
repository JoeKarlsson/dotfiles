import type { On } from 'claude-code'

import { segments, words } from './shell'

// Memory feedback-humanizer-every-paste-ready-text: everything that goes out in
// Joe's name gets the humanizer first. blog-check covers draft files; text posted
// straight from the shell did not, and "run that comment through my humanizer
// again" kept coming (48 humanizer asks, 2026-10-13 to 2026-11-12). So a GitHub
// comment or review with a body is refused until the humanizer skill has run in
// this turn. Text already humanized in an earlier turn goes out with `HUMANIZED=1`
// in front of the command.

// `gh pr|issue comment`, `gh pr review` with a body, `gh api` writing a body to a comments endpoint.
export function postsJoesWords(command: string): boolean {
  for (const segment of segments(command)) {
    const w = words(segment)
    if (w.some(x => x === 'HUMANIZED=1')) return false
    while (w.length && /^\w+=/.test(w[0]!)) w.shift()
    if ((w[0] ?? '').split('/').pop() !== 'gh') continue
    const hasBody = w.some(x => /^(-b|--body|--body-file|-F|-f)$/.test(x) || /^--body(-file)?=/.test(x))
    if ((w[1] === 'pr' || w[1] === 'issue') && w[2] === 'comment' && hasBody) return true
    if (w[1] === 'pr' && w[2] === 'review' && hasBody) return true
    if (w[1] === 'api' && w.some(x => /\/comments\b|\/reviews\b/.test(x)) && w.some(x => /^body=/.test(x))) return true
  }
  return false
}

// Text agents post for other people says so: PR and issue bodies, comments and
// reviews carry the signature line (Joe, 2026-11-17). Commit messages are not covered.
export const SIGNATURE = 'Drafted with Claude Code.'

const SIGNED_POSTS = /^(pr (create|comment|review)|issue (create|comment))$/

// Bodies a `gh pr|issue create|comment` or `gh pr review` command posts: inline text, or a file to read.
export function postedBodies(command: string): ({ text: string } | { file: string })[] {
  const out: ({ text: string } | { file: string })[] = []
  for (const segment of segments(command)) {
    const w = words(segment)
    while (w.length && /^\w+=/.test(w[0]!)) w.shift()
    if ((w[0] ?? '').split('/').pop() !== 'gh' || !SIGNED_POSTS.test(`${w[1]} ${w[2]}`)) continue
    w.forEach((x, i) => {
      const [flag, inline] = x.startsWith('--') && x.includes('=') ? [x.slice(0, x.indexOf('=')), x.slice(x.indexOf('=') + 1)] : [x, w[i + 1]]
      if (inline === undefined) return
      if (flag === '-b' || flag === '--body') out.push({ text: inline })
      // `--body-file -` reads stdin, a heredoc in the command itself
      if (flag === '-F' || flag === '--body-file') out.push(inline === '-' ? { text: command } : { file: inline })
    })
  }
  return out
}

export const SIGN_IT =
  `Sign it (global mod): text an agent posts for other people ends with the line "${SIGNATURE}". ` +
  'Add that line at the end of the body, then rerun the command.'

export const HUMANIZE_FIRST =
  "Humanize first (global mod): this posts text in Joe's name. Run the humanizer skill on it (Skill tool, " +
  '"humanizer", its full process), then post. If this exact text already went through the humanizer in an ' +
  'earlier turn, rerun the command with `HUMANIZED=1 ` in front.'

let humanizedThisTurn = false
export const resetOutboundText = () => { humanizedThisTurn = false }

export function registerOutboundText(on: On) {
  on('tool.call', { tool: 'Skill' }, async ($, e, next) => {
    if (e.skill.replace(/^.*:/, '') === 'humanizer') humanizedThisTurn = true
    return next(e)
  })

  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    for (const body of postedBodies(e.command)) {
      const text = 'text' in body ? body.text : await $.fs.read(body.file.startsWith('/') ? body.file : `${await $.session.cwd()}/${body.file}`)
      if (!text.includes(SIGNATURE)) return { deny: SIGN_IT }
    }
    if (humanizedThisTurn || !postsJoesWords(e.command)) return next(e)
    return { deny: HUMANIZE_FIRST }
  })
}
