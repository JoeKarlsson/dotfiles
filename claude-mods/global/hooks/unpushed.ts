import type { EngineInterface, On } from 'claude-code'

import { checkout, git, inMain } from './git'

// Global CLAUDE.md, Git: commit and push, always keep the remote up to
// date. A worktree whose work is all on the remote should be removed.

export type RepoState = { repo: string; ahead: number; isWorktree: boolean; isDone: boolean }

export async function repoState($: EngineInterface, cwd: string): Promise<RepoState | null> {
  const co = await checkout($, cwd)
  if (!co) return null
  const upstream = await git($, cwd, 'rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}')
  let base = upstream.exitCode === 0 ? upstream.stdout.trim() : ''
  if (!base) {
    const head = await git($, cwd, 'rev-parse', '--abbrev-ref', 'origin/HEAD')
    base = head.exitCode === 0 ? head.stdout.trim() : 'origin/main'
  }
  const ahead = await git($, cwd, 'rev-list', '--count', `${base}..HEAD`)
  if (ahead.exitCode !== 0) return null
  const n = Number(ahead.stdout.trim() || 0)
  const isWorktree = !inMain(cwd, co)
  let isDone = false
  if (isWorktree && n === 0) {
    // Done: it made commits (more than the reflog's creation entry), they are all on
    // the remote, and nothing is left uncommitted.
    const [status, reflog] = await Promise.all([
      git($, cwd, 'status', '--porcelain'),
      git($, cwd, 'reflog', '--format=%H', 'HEAD'),
    ])
    isDone = status.stdout.trim() === '' && reflog.stdout.trim().split('\n').length > 1
  }
  return { repo: co.main.split('/').pop() ?? co.main, ahead: n, isWorktree, isDone }
}

export function unpushedText(s: RepoState): string | null {
  if (s.ahead) return `${s.ahead} commit${s.ahead > 1 ? 's' : ''} in ${s.repo} not pushed`
  if (s.isDone) return `worktree's work is all on the remote: remove it`
  return null
}

export async function unpushedLabel($: EngineInterface, cwd: string): Promise<string | null> {
  const s = await repoState($, cwd)
  return s ? unpushedText(s) : null
}

export function registerUnpushed(on: On) {
  // Under each answer that leaves commits behind.
  on('turn.complete', async ($, e, next) => {
    const answer = await next(e)
    if (e.agentId !== undefined || e.reason !== 'answer') return answer
    const s = await repoState($, await $.session.cwd())
    return s?.ahead ? { ...answer, text: `⚠ ${unpushedText(s)}` } : answer
  })

  on('session.end', async ($, e, next) => {
    const s = await repoState($, await $.session.cwd()).catch(() => null)
    if (s?.ahead) void $.ui.notify(`${unpushedText(s)}`, { title: 'Claude session ended' })
    return next(e)
  })
}
