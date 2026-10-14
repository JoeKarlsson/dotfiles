import type { EngineInterface, Register } from 'claude-code'

// Global CLAUDE.md, "Parallel sessions: one worktree each": sessions in one
// checkout share its index and working tree, so their edits collide and a plain
// `git commit` sweeps in each other's staged files. While another live session
// sits in a repo's main checkout, edits there and commits without `-- <paths>`
// are refused. Every check fails open: a bug here must never block every edit.

type Checkout = { main: string; worktrees: string[] }
type Peer = { name: string; cwd: string; pid: number }

export const within = (path: string, dir: string) => path === dir || path.startsWith(`${dir.replace(/\/$/, '')}/`)

export const inMain = (path: string, co: Checkout) =>
  within(path, co.main) && !co.worktrees.some(w => within(path, w))

export function parseWorktrees(porcelain: string): Checkout | null {
  const [main, ...worktrees] = [...porcelain.matchAll(/^worktree (.+)$/gm)].map(m => m[1] ?? '')
  return main ? { main, worktrees } : null
}

// The directory a `git commit` runs in: its `-C <dir>`, else null for the session's cwd.
// Returns undefined when the command makes no path-less commit.
export function pathlessCommit(command: string): string | null | undefined {
  for (const m of command.matchAll(/\bgit\b((?:\s+-C\s+\S+|\s+-c\s+\S+|\s+--?[\w-]+(?:=\S+)?)*)\s+commit\b([^;&|\n]*)/g)) {
    if (/(^|\s)--(\s|$)/.test(m[2] ?? '')) continue
    const dir = /-C\s+(\S+)/.exec(m[1] ?? '')?.[1]
    return dir ? dir.replace(/^['"]|['"]$/g, '') : null
  }
  return undefined
}

async function checkout($: EngineInterface, path: string): Promise<Checkout | null> {
  let dir = path
  while (dir.length > 1 && !(await $.fs.exists(dir))) dir = dir.replace(/\/[^/]*$/, '') || '/'
  const out = await $.process.run(['git', '-C', dir, 'worktree', 'list', '--porcelain'])
  return out.exitCode === 0 ? parseWorktrees(out.stdout) : null
}

async function peersIn($: EngineInterface, co: Checkout): Promise<Peer[]> {
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
    `(global CLAUDE.md, "Parallel sessions: one worktree each").`
  )
}

async function commitDenial($: EngineInterface, command: string): Promise<string | null> {
  const dir = pathlessCommit(command)
  if (dir === undefined) return null
  const cwd = await $.session.cwd()
  const where = dir === null ? cwd : dir.startsWith('/') ? dir : `${cwd}/${dir}`
  const co = await checkout($, where)
  if (!co || !inMain(where, co)) return null
  const peers = await peersIn($, co)
  if (peers.length === 0) return null
  return (
    `${names(peers)} also in ${co.main}, so a plain git commit can sweep in their staged files. ` +
    `Commit with explicit paths: git commit -m "..." -- <paths>.`
  )
}

async function updateStatus($: EngineInterface) {
  const cwd = await $.session.cwd()
  const co = await checkout($, cwd)
  const peers = co && inMain(cwd, co) ? await peersIn($, co) : []
  $.ui.status(peers.length ? `checkout shared with ${peers.map(p => p.name).join(', ')}: use a worktree` : undefined)
}

export const register: Register = on => {
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    const denial = await commitDenial($, e.command)
    return denial ? { deny: `parallel-sessions: ${denial}` } : next(e)
  })

  on('tool.call', { tool: ['Edit', 'Write', 'NotebookEdit'] }, async ($, e, next) => {
    const path = e.tool === 'NotebookEdit' ? e.notebook_path : e.file_path
    const denial = path ? await editDenial($, path) : null
    return denial ? { deny: `parallel-sessions: ${denial}` } : next(e)
  })

  on('session.start', async ($, e, next) => {
    const started = await next(e)
    void updateStatus($)
    $.clock.every(30_000, () => void updateStatus($))
    return started
  })
}
