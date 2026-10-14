import type { EngineInterface } from 'claude-code'

export type Checkout = { main: string; worktrees: string[] }

export const within = (path: string, dir: string) => path === dir || path.startsWith(`${dir.replace(/\/$/, '')}/`)

export const inMain = (path: string, co: Checkout) =>
  within(path, co.main) && !co.worktrees.some(w => within(path, w))

export function parseWorktrees(porcelain: string): Checkout | null {
  const [main, ...worktrees] = [...porcelain.matchAll(/^worktree (.+)$/gm)].map(m => m[1] ?? '')
  return main ? { main, worktrees } : null
}

export function git($: EngineInterface, dir: string, ...args: string[]) {
  return $.process.run(['git', '-C', dir, ...args])
}

// The checkout holding `path` (a file that may not exist yet), or null outside git.
export async function checkout($: EngineInterface, path: string): Promise<Checkout | null> {
  let dir = path
  while (dir.length > 1 && !(await $.fs.exists(dir))) dir = dir.replace(/\/[^/]*$/, '') || '/'
  const out = await git($, dir, 'worktree', 'list', '--porcelain')
  return out.exitCode === 0 ? parseWorktrees(out.stdout) : null
}
