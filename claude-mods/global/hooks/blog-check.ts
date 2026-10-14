import type { EngineInterface, On } from 'claude-code'

// Joe's blog posts: joekarlsson.com posts and newsletter issues, CData drafts
// (worktrees included). After each write the model gets what the linters found;
// /blog-check runs them all and starts the full review.

const SITE = /\/joekarlsson\.com\/(?:.+\/)?src\/content\/(?:blog|newsletter)\/.+\.mdx?$/
const CDATA = /\/cdata\/skills[^/]*\/(?:.+\/)?drafts\/.+\.mdx?$/

export const isPost = (path: string) => SITE.test(path) || CDATA.test(path)

// Banned in all of Joe's writing. Vale misses both on joekarlsson.com (its em
// dash rule covers headings only), so they are checked here everywhere.
const PHRASES: [RegExp, string][] = [
  [/—/, 'em dash: never, no exceptions (use a comma, colon or semicolon, or rewrite)'],
  [/that['’]s real information/i, 'banned phrase "That\'s real information."'],
]

export function phraseFindings(text: string): string[] {
  const out: string[] = []
  let fenced = false
  text.split('\n').forEach((line, i) => {
    if (/^\s*(```|~~~)/.test(line)) fenced = !fenced
    if (fenced) return
    for (const [re, what] of PHRASES) if (re.test(line)) out.push(`L${i + 1} ${what}`)
  })
  return out
}

type ValeAlert = { Line: number; Severity: string; Check: string; Message: string }

async function vale($: EngineInterface, path: string): Promise<string[] | null> {
  const dir = path.replace(/\/[^/]*$/, '')
  const out = await $.process.run(['vale', '--output=JSON', path], { cwd: dir, timeoutMs: 30000 }).catch(() => null)
  if (!out || out.exitCode > 1) return null
  const alerts = (Object.values(JSON.parse(out.stdout || '{}'))[0] ?? []) as ValeAlert[]
  return alerts
    .filter(a => a.Severity !== 'suggestion')
    .sort((a, b) => (a.Severity === 'error' ? 0 : 1) - (b.Severity === 'error' ? 0 : 1) || a.Line - b.Line)
    .map(a => `L${a.Line} ${a.Severity} ${a.Check}: ${a.Message}`)
}

type Tells = { total: number; per_100_words: number; hits: Record<string, string[]> }

async function aiTells($: EngineInterface, path: string): Promise<string[] | null> {
  const script = `${await $.env.get('HOME')}/.claude/skills/humanizer/scripts/ai_tells.py`
  if (!(await $.fs.exists(script))) return null
  const out = await $.process.run(['python3', '-I', script, path, '--json'], { timeoutMs: 30000 }).catch(() => null)
  if (!out || out.exitCode !== 0) return null
  const r = Object.values(JSON.parse(out.stdout) as Record<string, Tells>)[0]
  if (!r?.total) return []
  return [
    `${r.total} AI tells (${r.per_100_words} per 100 words)`,
    ...Object.entries(r.hits).flatMap(([kind, hits]) => hits.slice(0, 3).map(h => `${kind}: "${h.slice(0, 120)}"`)),
  ]
}

async function repoTop($: EngineInterface, path: string): Promise<string | null> {
  const out = await $.process.run(['git', '-C', path.replace(/\/[^/]*$/, ''), 'rev-parse', '--show-toplevel'])
  return out.exitCode === 0 ? out.stdout.trim() : null
}

// The CData repo's own PostToolUse hook already sends Vale's findings after a write.
async function repoRunsVale($: EngineInterface, top: string | null): Promise<boolean> {
  const settings = `${top}/.claude/settings.json`
  return !!top && (await $.fs.exists(settings)) && /vale-lint/.test(await $.fs.read(settings))
}

export type Report = { sections: string[]; count: number }

export async function checkPost($: EngineInterface, path: string, opts: { vale: boolean; cap?: number }): Promise<Report> {
  const [lint, tells, text] = await Promise.all([
    opts.vale ? vale($, path) : Promise.resolve(null),
    aiTells($, path),
    $.fs.read(path),
  ])
  const phrases = phraseFindings(text)
  const sections: string[] = []
  let count = phrases.length
  const add = (title: string, lines: string[]) => {
    if (!lines.length) return
    const shown = opts.cap ? lines.slice(0, opts.cap) : lines
    const more = lines.length - shown.length
    sections.push([`${title}:`, ...shown.map(l => `  ${l}`), ...(more ? [`  … ${more} more (/blog-check lists them all)`] : [])].join('\n'))
  }
  add('Banned (fix every one)', phrases)
  if (lint) {
    count += lint.length
    add('Vale', lint)
  }
  if (tells?.length) {
    count += tells.length - 1
    add("Humanizer's ai_tells.py (judge each; cut the ones that read as AI)", tells)
  }
  return { sections, count }
}

function reviewSteps(path: string, top: string | null): string {
  const site = SITE.test(path)
  const guides = site
    ? `${top}/STYLE_GUIDE.md`
    : `${top}/.claude/rules/brand-voice.md, ai-writing-safeguards.md and blog-post-spec.md`
  const review = site ? `/write-post --review ${path}` : `/blog-review ${path}`
  return [
    `Run the full review of the blog post ${path}:`,
    '1. Fix the linter findings below that apply. Never use an em dash.',
    '2. Run the humanizer skill on the post and apply what it finds.',
    `3. Check the post against the voice guide: ${guides}.`,
    `4. Run the repo's review (${review}) and apply what it finds.`,
    `5. Re-run the checks (vale --output=line ${path}; python3 ~/.claude/skills/humanizer/scripts/ai_tells.py ${path}; grep -n '—' ${path}) and tell me what's left and why each one stays.`,
  ].join('\n')
}

export const BLOG_COMMAND = {
  name: 'blog-check',
  description: 'Lint a blog post (Vale, humanizer tells, banned phrases), then run the full voice and humanizer review',
  argumentHint: '<post path>',
}

export function registerBlogCheck(on: On) {
  let lastPost: string | null = null

  on('tool.call', { tool: ['Edit', 'Write'] }, async ($, e, next) => {
    const ran = await next(e)
    if (ran.deny !== undefined || ran.isError || !isPost(e.file_path)) return ran
    lastPost = e.file_path
    const top = await repoTop($, e.file_path)
    const report = await checkPost($, e.file_path, { vale: !(await repoRunsVale($, top)), cap: 15 })
    if (!report.sections.length) return ran
    const note = [`Blog post checks on ${e.file_path} (global mod). Fix what applies before calling the post done.`, ...report.sections].join('\n\n')
    return { ...ran, context: [...(ran.context ?? []), note] }
  })

  on('command.run', { command: 'blog-check' }, async ($, e) => {
    const cwd = await $.session.cwd()
    const arg = e.args.trim()
    const path = arg ? (arg.startsWith('/') ? arg : `${cwd}/${arg}`) : lastPost
    if (!path) return { text: 'Usage: /blog-check <post path>' }
    if (!(await $.fs.exists(path))) return { text: `No file at ${path}` }
    const report = await checkPost($, path, { vale: true })
    const findings = report.sections.join('\n\n') || 'No findings.'
    void $.prompt.submit({ text: `${reviewSteps(path, await repoTop($, path))}\n\nFindings:\n\n${findings}` })
    return { text: `${report.count} findings in ${path.split('/').pop()}. Starting the full review.\n\n${findings}` }
  })
}
