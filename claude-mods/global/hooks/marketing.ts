import type { On } from 'claude-code'

// personal-marketing (~/.claude/skills/personal-marketing) merges six personal-brand
// skills that were never loaded in 60 days (2026-09-11 to 2026-11-10). A prompt
// about ideas, launches, talks, audience growth or positioning now gets a note
// naming the skill and the one reference to read. Personal brand only: prompts
// in CData repos are skipped, its marketing skills are separate.

export type Topic = { key: string; ref: string; re: RegExp }

export const TOPICS: Topic[] = [
  {
    key: 'talks',
    ref: 'talks.md',
    re: /\b(cfp|call for (papers|proposals|speakers)|conference talk|talk (abstract|proposal|outline|slides)|my talk|speaking (slot|proposal|gig)|keynote|meetup talk|lightning talk|rehears\w+)\b/i,
  },
  {
    key: 'launches',
    ref: 'launches.md',
    re: /\b(launch\w*|announc\w*|ship\w*)\b[^.?!\n]{0,40}\b(project|post|series|repo|tool|site|newsletter|talk|course|app|library|plugin)\b/i,
  },
  {
    key: 'ideas',
    ref: 'ideas.md',
    re: /\b(blog|post|newsletter|article|video|content) ideas?\b|\bwhat should i (write|blog|post) about\b|\bideas? for (a |my |the )?(blog|post|newsletter|article)\b/i,
  },
  {
    key: 'audience',
    ref: 'audience.md',
    re: /\b(grow\w*|more|get|gain\w*)\b[^.?!\n]{0,30}\b(subscribers|audience|followers|readers|signups)\b/i,
  },
  {
    key: 'positioning',
    ref: 'positioning.md',
    re: /\b(positioning|differentiat\w+|stand out|my niche|personal brand)\b/i,
  },
]

export const isCdata = (cwd: string) => /\/dev\/cdata(\/|$)/.test(cwd)

export function topicsFor(text: string): Topic[] {
  return TOPICS.filter(t => t.re.test(text))
}

export const note = (topics: Topic[]) =>
  `Personal marketing (global mod): load the personal-marketing skill (Skill tool, skill "personal-marketing") and read only ` +
  `${topics.map(t => `references/${t.ref}`).join(' and ')} for this. For a full plan (launch plan, talk plan, idea slate, ` +
  'audience or positioning review), hand it to the marketing-strategist subagent instead of doing it inline.'

export function registerMarketing(on: On) {
  const sent = new Set<string>()
  on('prompt.submit', async ($, e, next) => {
    if (e.command || e.isMeta) return next(e)
    const fresh = topicsFor(e.text).filter(t => !sent.has(t.key))
    if (!fresh.length || isCdata(await $.session.cwd())) return next(e)
    for (const t of fresh) sent.add(t.key)
    return next({ ...e, context: [...(e.context ?? []), note(fresh)] })
  })
}
