import type { EngineInterface, On } from 'claude-code'

import { git } from './git'

// Ponytail (~/.claude/skills/ponytail) is meant for every coding task, but its
// "use on any coding task" trigger never fired: 0 loads in 1,550 sessions
// (2026-09-11 to 2026-11-10). So the first code edit in each agent loop gets a
// note to load it, and a commit with real code changes gets a note to run
// ponytail-review on it.

const CODE = /\.(py|ts|tsx|js|jsx|mjs|cjs|sh|bash|zsh|go|rs|swift|kt|java|rb|php|c|h|cc|cpp|hpp|cs|sql|tf|hcl|tpl|lua|astro|vue|svelte)$/i
const SKIP = /\/(node_modules|dist|build|vendor|\.next|\.astro|\.terraform)\//
export const REVIEW_MIN_LINES = 25

export const isCodeFile = (path: string) => CODE.test(path) && !SKIP.test(path)

export const skillName = (skill: string) => skill.replace(/^.*:/, '')

// `git commit` that makes a commit (not `git log --grep commit`, not a dry run).
export const isCommit = (command: string) =>
  /\bgit\b(\s+-C\s+\S+)*\s+commit\b/.test(command) && !/--dry-run\b/.test(command)

// The repo a command runs git in: `git -C <dir>`, else a leading `cd <dir> &&`, else cwd.
export function commitDir(command: string, cwd: string): string {
  const dashC = command.match(/\bgit\s+-C\s+("[^"]+"|'[^']+'|\S+)/)?.[1]
  const cd = command.match(/^\s*cd\s+("[^"]+"|'[^']+'|\S+)\s*&&/)?.[1]
  const dir = (dashC ?? cd ?? cwd).replace(/^["']|["']$/g, '')
  return dir.startsWith('/') ? dir : `${cwd}/${dir}`
}

// Lines changed in code files, from `git show --numstat --format= HEAD`.
export function codeLines(numstat: string): { lines: number; files: number } {
  let lines = 0
  let files = 0
  for (const row of numstat.split('\n')) {
    const [added, deleted, path] = row.split('\t')
    if (!path || !isCodeFile(`/${path}`) || added === '-') continue
    lines += Number(added) + Number(deleted)
    files += 1
  }
  return { lines, files }
}

type Loop = { loaded: boolean; nudges: number; reviewPending: boolean }
const loops = new Map<string, Loop>()
const loop = (agentId?: string) => {
  const key = agentId ?? 'main'
  if (!loops.has(key)) loops.set(key, { loaded: false, nudges: 0, reviewPending: false })
  return loops.get(key)!
}

const LOAD_NOTE =
  'Code change (global mod): load the ponytail skill now (Skill tool, skill "ponytail") and follow it for the rest of this coding work. Joe wants it on for all code.'

const reviewNote = (lines: number, files: number, sha: string) =>
  `Commit ${sha} changed ${lines} lines of code in ${files} file${files > 1 ? 's' : ''} (global mod). ` +
  'Before you report this done, run the ponytail-review skill on it, then fix what it finds in a follow-up commit.'

async function head($: EngineInterface, dir: string): Promise<string | null> {
  const out = await git($, dir, 'rev-parse', '--short', 'HEAD').catch(() => null)
  return out?.exitCode === 0 ? out.stdout.trim() : null
}

export function registerPonytail(on: On) {
  on('tool.call', { tool: 'Skill' }, async ($, e, next) => {
    const name = skillName(e.skill)
    if (name === 'ponytail') loop(e.agentId).loaded = true
    if (name === 'ponytail-review' || name === 'code-review') loop(e.agentId).reviewPending = false
    return next(e)
  })

  on('tool.call', { tool: ['Edit', 'Write', 'NotebookEdit'] }, async ($, e, next) => {
    const ran = await next(e)
    const path = 'file_path' in e ? e.file_path : 'notebook_path' in e ? e.notebook_path : ''
    const l = loop(e.agentId)
    if (ran.deny !== undefined || ran.isError || l.loaded || l.nudges >= 2 || !isCodeFile(path)) return ran
    l.nudges += 1
    return { ...ran, context: [...(ran.context ?? []), LOAD_NOTE] }
  })

  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    if (!isCommit(e.command)) return next(e)
    const dir = commitDir(e.command, await $.session.cwd())
    const before = await head($, dir)
    const ran = await next(e)
    const after = await head($, dir)
    const l = loop(e.agentId)
    if (ran.deny !== undefined || ran.isError || !after || after === before || l.reviewPending) return ran
    const stat = await git($, dir, 'show', '--numstat', '--format=', 'HEAD').catch(() => null)
    if (!stat || stat.exitCode !== 0) return ran
    const { lines, files } = codeLines(stat.stdout)
    if (lines < REVIEW_MIN_LINES) return ran
    l.reviewPending = true
    return { ...ran, context: [...(ran.context ?? []), reviewNote(lines, files, after)] }
  })
}
