import { expect, test } from 'claude-code/testing'

import { bashDenial, urlDenial } from '../hooks/cdata-markdown'

const post = 'https://www.cdata.com/blog/best-mcp-server-frameworks'

test('cdata.com pages are read as Markdown, never fetched plain or headless', async () => {
  expect(bashDenial(`curl -s -H 'Accept: text/markdown' ${post}`)).toBe(null)
  expect(bashDenial(`curl -s ${post}`)).toContain('text/markdown')
  // The 2026-11-18 miss: a Playwright screenshot script handed a CData blog post
  expect(bashDenial(`cd /tmp && node table-shot.mjs ${post} "FastMCP" shots/mcp.png`)).toContain('Markdown')
  expect(bashDenial(`open -a Firefox ${post}`)).toBe(null)
  expect(bashDenial('curl -s -o a.webp https://www.cdata.com/kb/articles/beyond-the-backlog-linear-roadmap-1.webp')).toBe(null)
  expect(bashDenial('python3 scripts/social/cdata-content-check.py --days 30')).toBe(null)
})

test('WebFetch and Chrome on a cdata.com page are refused', async () => {
  expect(urlDenial(post)).toContain('Markdown')
  expect(urlDenial('https://cdata.com/kb/articles/x.rst')).toContain('Markdown')
  expect(urlDenial('https://www.joekarlsson.com/blog/x/')).toBe(null)
})
