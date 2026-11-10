import { expect, test } from 'claude-code/testing'

import { isCdata, note, topicsFor } from '../hooks/marketing'

const keys = (text: string) => topicsFor(text).map(t => t.key)

test('marketing prompts route to the right reference', async () => {
  expect(keys('help me write a CFP for KubeCon')).toEqual(['talks'])
  expect(keys("I'm launching the new homelab series next week")).toEqual(['launches'])
  expect(keys('give me some blog ideas about MCP')).toEqual(['ideas'])
  expect(keys('what should I write about next?')).toEqual(['ideas'])
  expect(keys('how do I grow my newsletter subscribers')).toEqual(['audience'])
  expect(keys('how do I differentiate from other DevRel voices')).toEqual(['positioning'])
})

test('everyday prompts do not trigger it', async () => {
  expect(keys('fix the failing test in slugify.py')).toEqual([])
  expect(keys('restart the plex container')).toEqual([])
  expect(keys('ship it')).toEqual([])
  expect(keys('push the commit')).toEqual([])
})

test('CData repos are skipped, personal ones are not', async () => {
  expect(isCdata('/Users/j/Documents/dev/cdata/skills')).toBe(true)
  expect(isCdata('/Users/j/Documents/dev/joe/joekarlsson.com')).toBe(false)
})

test('the note names the skill, each reference and the subagent', async () => {
  const n = note(topicsFor('launch my talk at the meetup talk night'))
  expect(n).toContain('personal-marketing')
  expect(n).toContain('references/talks.md')
  expect(n).toContain('references/launches.md')
  expect(n).toContain('marketing-strategist')
})
