import type { On } from 'claude-code'

// Context audit 2026-11-22: 6 sessions retried a failing Chrome call 7 to 20 times
// (c2eb5438: 20) though the prompt already says to stop after 2-3 failures. So on
// the 3rd failed Chrome call in a row, the agent gets told to stop, by cause.
export const CHROME_STREAK = 3

export function chromeStopNote(errorText: string): string {
  const why = /permission denied/i.test(errorText)
    ? 'The extension has no permission on this site. Retrying cannot fix it: ask Joe to allow the domain in the Claude in Chrome extension, or do it another way.'
    : /not in claude's tab group|couldn't determine which page|tab \d+ is not|no tab\b/i.test(errorText)
      ? 'The tab is gone or outside your group: call tabs_context_mcp once and use a tab it lists, or open a new one.'
      : /timed out|frozen|unresponsive|detached/i.test(errorText)
        ? 'The page is frozen or detached: open the URL in a new tab once; if that fails too, stop.'
        : 'Read the error before retrying; do not repeat the same call.'
  return `Chrome (global mod): ${CHROME_STREAK} failed browser calls in a row. ${why} If the next attempt fails, stop and tell Joe what you tried and what went wrong.`
}

// Every Chrome tool that acts on a page (a matcher is required: one matcher-less tool.call hook per mod).
const CHROME_PAGE_TOOLS = ['browser_batch', 'computer', 'find', 'form_input', 'get_page_text', 'javascript_tool',
  'navigate', 'read_page', 'file_upload', 'upload_image'].map(t => `mcp__claude-in-chrome__${t}`)

const streaks = new Map<string, number>()

export function registerChromeErrors(on: On) {
  on('tool.call', { tool: CHROME_PAGE_TOOLS }, async ($, e, next) => {
    const ran = await next(e)
    if (ran.deny !== undefined) return ran
    const who = e.agentId ?? 'main'
    const streak = ran.isError ? (streaks.get(who) ?? 0) + 1 : 0
    streaks.set(who, streak)
    if (streak !== CHROME_STREAK) return ran
    return { ...ran, context: [...(ran.context ?? []), chromeStopNote(ran.text ?? '')] }
  })
}
