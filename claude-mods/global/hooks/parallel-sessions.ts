import type { EngineInterface, On } from 'claude-code'

import { checkout, inMain } from './git'
import type { Checkout } from './git'

// ~/.claude/knowledge/worktree-workflow.md: sessions in one
// checkout share its index and working tree, so their edits collide and a plain
// `git commit` sweeps in each other's staged files. While another live session
// sits in a repo's main checkout, edits there and commits without `-- <paths>`
// are refused. Every check fails open: a bug here must never block every edit.

type Peer = { name: string; cwd: string; pid: number }

// The directory a `git commit` runs in: the last `cd <dir>` before it, joined with
// its `-C <dir>`, else null for the session's cwd. Returns undefined when the
// command makes no path-less commit, or when that directory hides behind a `$var`
// or backtick and can't be read from the text (fail open).
export function pathlessCommit(command: string): string | null | undefined {
  for (const m of command.matchAll(/\bgit\b((?:\s+-C\s+\S+|\s+-c\s+\S+|\s+--?[\w-]+(?:=\S+)?)*)\s+commit\b([^;&|\n]*)/g)) {
    if (/(^|\s)--(\s|$)/.test(m[2] ?? '')) continue
    const cd = [...command.slice(0, m.index).matchAll(/(?:^|[;&|(]\s*)cd\s+([^\s;&|)]+)/g)].at(-1)?.[1]
    const c = /-C\s+(\S+)/.exec(m[1] ?? '')?.[1]
    const parts = [cd, c].filter((p): p is string => !!p).map(p => p.replace(/^['"]|['"]$/g, ''))
    if (parts.some(p => /[$`]/.test(p))) return undefined
    if (parts.length === 0) return null
    return parts.reduce((base, p) => (p.startsWith('/') || p.startsWith('~') ? p : `${base}/${p}`))
  }
  return undefined
}

export async function peersIn($: EngineInterface, co: Checkout): Promise<Peer[]> {
  const dir = `${await $.env.get('HOME')}/.claude/sessions`
  const me = await $.session.id()
  const peers: Peer[] = []
  for (const { name } of await $.fs.list(dir)) {
    if (!name.endsWith('.json')) continue
    try {
      const s = JSON.parse(await $.fs.read(`${dir}/${name}`))
      if (s.sessionId === me || s.kind !== 'interactive' || !inMain(s.cwd, co)) continue
      peers.push({ name: s.name ?? String(s.pid), cwd: s.cwd, pid: s.pid })
    } catch {
      // a file being rewritten; skip it this time
    }
  }
  if (peers.length === 0) return peers
  const alive = await $.process.run(['/bin/ps', '-o', 'pid=', '-p', peers.map(p => p.pid).join(',')])
  const pids = new Set(alive.stdout.split(/\s+/).filter(Boolean).map(Number))
  return peers.filter(p => pids.has(p.pid))
}

const names = (peers: Peer[]) => `${peers.map(p => p.name).join(', ')} ${peers.length === 1 ? 'is' : 'are'}`

async function editDenial($: EngineInterface, path: string): Promise<string | null> {
  const co = await checkout($, path)
  if (!co || !inMain(path, co)) return null
  const peers = await peersIn($, co)
  if (peers.length === 0) return null
  const ignored = await $.process.run(['git', '-C', co.main, 'check-ignore', '-q', path])
  if (ignored.exitCode === 0) return null
  return (
    `${names(peers)} also working in ${co.main}. Call EnterWorktree first and make this edit there ` +
    `(how to ship from it: ~/.claude/knowledge/worktree-workflow.md).`
  )
}

async function commitDenial($: EngineInterface, command: string): Promise<string | null> {
  const dir = pathlessCommit(command)
  if (dir === undefined) return null
  const cwd = await $.session.cwd()
  const abs = dir === null ? cwd : dir.replace(/^~(?=\/|$)/, (await $.env.get('HOME')) ?? '~')
  const where = abs.startsWith('/') ? abs : `${cwd}/${abs}`
  const co = await checkout($, where)
  if (!co || !inMain(where, co)) return null
  const peers = await peersIn($, co)
  if (peers.length === 0) return null
  return (
    `${names(peers)} also in ${co.main}, so a plain git commit can sweep in their staged files. ` +
    `Commit with explicit paths: git commit -m "..." -- <paths>.`
  )
}

// The status line part: whom this session's checkout is shared with, if anyone.
export async function sharedLabel($: EngineInterface, cwd: string): Promise<string | null> {
  const co = await checkout($, cwd)
  const peers = co && inMain(cwd, co) ? await peersIn($, co) : []
  return peers.length ? `checkout shared with ${peers.map(p => p.name).join(', ')}: use a worktree` : null
}

export function registerParallelSessions(on: On) {
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    const denial = await commitDenial($, e.command)
    return denial ? { deny: denial } : next(e)
  })

  on('tool.call', { tool: ['Edit', 'Write', 'NotebookEdit'] }, async ($, e, next) => {
    const path = e.tool === 'NotebookEdit' ? e.notebook_path : e.file_path
    const denial = path ? await editDenial($, path) : null
    return denial ? { deny: denial } : next(e)
  })

}
