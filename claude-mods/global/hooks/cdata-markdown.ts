import type { On } from 'claude-code'

import { segments, words } from './shell'

// www.cdata.com serves every page as Markdown to agents (Cloudflare Markdown for Agents):
// `curl -s -H 'Accept: text/markdown' <url>`. Anything else (plain curl, WebFetch, a headless
// Playwright script, Chrome) gets Cloudflare's "Just a moment..." bot check. Joe has had to say
// this again and again (memory reference-cdata-site-markdown); the 2026-11-18 /social session
// still pointed Playwright at a CData blog post for a screenshot, so now it's a guard.

export const REASON =
  "cdata.com guard (global mod): every www.cdata.com page is served as Markdown to agents. Read it with " +
  "`curl -s -H 'Accept: text/markdown' <url>`; plain curl, WebFetch, Playwright and Chrome hit Cloudflare's bot check. " +
  'For post media, build cards from the Markdown (code-card.mjs) or download the images it links. ' +
  "To show Joe a page, `open -a Firefox <url>`."

// A cdata.com page URL; images, video and other files it links are fine to download directly.
const PAGE_URL = /https?:\/\/(www\.)?cdata\.com(\/[^\s'"<>)]*)?/gi
const FILE_EXT = /\.(webp|png|jpe?g|gif|svg|mp4|webm|pdf|zip|txt|xml|css|js)(\?[^\s'"]*)?$/i
const pageUrls = (text: string) => (text.match(PAGE_URL) ?? []).filter(u => !FILE_EXT.test(u))

const MARKDOWN_ACCEPT = /accept:\s*text\/markdown/i
// Fetchers, and scripts handed a page URL (a headless browser or a plain fetch). `open`, grep and
// friends only show or mention the URL, so they pass.
const FETCHERS = /^(curl|wget|node|npx|bun|deno|python3?|playwright|chromium|lynx|w3m|http)$/

export function bashDenial(command: string): string | null {
  for (const segment of segments(command)) {
    const cmd = (words(segment)[0] ?? '').split('/').pop() ?? ''
    if (FETCHERS.test(cmd) && pageUrls(segment).length && !MARKDOWN_ACCEPT.test(segment)) return REASON
  }
  return null
}

export const urlDenial = (url: string) => (pageUrls(url).length ? REASON : null)

export function registerCdataMarkdown(on: On) {
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    const reason = bashDenial(e.command)
    return reason ? { deny: reason } : next(e)
  })
  on('tool.call', { tool: 'WebFetch' }, async ($, e, next) => {
    const reason = urlDenial(e.url)
    return reason ? { deny: reason } : next(e)
  })
  on('tool.call', { tool: 'mcp__claude-in-chrome__navigate' }, async ($, e, next) => {
    const url = (e as { url?: unknown }).url
    const reason = typeof url === 'string' ? urlDenial(url) : null
    return reason ? { deny: reason } : next(e)
  })
}
