import type { EngineInterface, On } from 'claude-code'

import { segments, words } from './shell'

// Sessions kept making folders straight in Joe's home directory (social-drafts,
// newsletter-drafts, mockups, .health-reports, a git worktree, a cloned tool...).
// Joe, 2026-11-19: "They shouldn't be just like willy-nilly in my home directory."
// This blocks a Write/Edit, mkdir, git clone or git worktree add that would create
// a new top-level entry in $HOME. Existing folders (Documents, .config, .local...)
// are untouched.

export const REASON = (entry: string) =>
  `Home folder guard (global mod): this would create ${entry}, a new folder in Joe's home directory. ` +
  'Put it where it belongs: in the repo it is for (gitignored; drafts in ~/claude-skills/drafts/, mockups in ' +
  "<repo>/.mockups/), a tool's state in ~/.local/state/<tool>/, other Claude output in ~/.local/share/claude/, " +
  'scratch files in the session scratchpad, worktrees in <repo>/.claude/worktrees/ (EnterWorktree), clones of ' +
  'third-party tools in the scratchpad or ~/Documents/dev/. If Joe named this exact folder, ask him first.'

// Lexical absolute path: ~ and $HOME expanded, relative paths joined to cwd, . and .. folded.
export function resolvePath(path: string, cwd: string, home: string): string {
  let p = path.replace(/^(~|\$HOME|\$\{HOME\})(?=\/|$)/, home)
  if (!p.startsWith('/')) p = `${cwd}/${p}`
  const parts: string[] = []
  for (const part of p.split('/')) {
    if (part === '' || part === '.') continue
    if (part === '..') parts.pop()
    else parts.push(part)
  }
  return '/' + parts.join('/')
}

// The top-level home entry a path lives in, or null when it is outside $HOME or is $HOME itself.
export function homeEntry(path: string, home: string): string | null {
  if (!path.startsWith(home + '/')) return null
  return `${home}/${path.slice(home.length + 1).split('/')[0]}`
}

const positionals = (w: string[]) => w.filter(a => !a.startsWith('-'))

// Paths a shell line would create: mkdir targets, git clone destinations, git worktree add paths.
export function createdPaths(command: string, cwd: string, home: string): string[] {
  const out: string[] = []
  let dir = cwd
  for (const segment of segments(command)) {
    const w = words(segment)
    const cmd = (w[0] ?? '').split('/').pop()
    if (cmd === 'ssh') continue
    if (cmd === 'cd') {
      dir = resolvePath(w[1] ?? home, dir, home)
      continue
    }
    if (cmd === 'mkdir') out.push(...positionals(w.slice(1)).map(a => resolvePath(a, dir, home)))
    if (cmd !== 'git') continue
    let i = 1
    let gitDir = dir
    while (w[i]?.startsWith('-')) {
      if (w[i] === '-C' && w[i + 1]) gitDir = resolvePath(w[++i]!, gitDir, home)
      i++
    }
    if (w[i] === 'clone') {
      const [url, dest] = positionals(w.slice(i + 1))
      const name = dest ?? url?.replace(/\/+$/, '').split(/[/:]/).pop()?.replace(/\.git$/, '')
      if (name) out.push(resolvePath(name, gitDir, home))
    } else if (w[i] === 'worktree' && w[i + 1] === 'add') {
      const [path] = positionals(w.slice(i + 2))
      if (path) out.push(resolvePath(path, gitDir, home))
    }
  }
  return out
}

// Matched on the path, like sensitive-shell: most test engines do not answer env.get.
const HOME_OF = /^(\/Users\/[^/]+|\/home\/[^/]+|\/root)(?=\/|$)/

async function firstNewEntry($: EngineInterface, paths: string[]) {
  for (const path of paths) {
    const home = HOME_OF.exec(path)?.[1]
    const entry = home ? homeEntry(path, home) : null
    if (entry && !(await $.fs.exists(entry))) return entry
  }
  return null
}

export function registerHomeClutter(on: On) {
  on('tool.call', { tool: ['Write', 'Edit'] }, async ($, e, next) => {
    const entry = await firstNewEntry($, [e.file_path])
    return entry ? { deny: REASON(entry) } : next(e)
  })

  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    const cwd = await $.session.cwd()
    const home = HOME_OF.exec(cwd)?.[1] ?? (/~|\$\{?HOME/.test(e.command) ? await $.env.get('HOME') : undefined)
    const entry = home ? await firstNewEntry($, createdPaths(e.command, cwd, home)) : null
    return entry ? { deny: REASON(entry) } : next(e)
  })
}
