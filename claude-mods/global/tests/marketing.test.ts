import { expect, test } from 'claude-code/testing'

import { GRILL, HANDOFF, isAgentOutput, isCdata, note, REPURPOSE, repurposeNote, topicsFor } from '../hooks/marketing'

test('a subagent report is not a prompt from Joe', async () => {
  expect(isAgentOutput('<task-notification>\n<summary>launch plan for the talk</summary>')).toBe(true)
  expect(isAgentOutput('help me plan the launch of my talk')).toBe(false)
})

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

test('asking for follow-up posts loads /social repurpose mode', async () => {
  expect(REPURPOSE.test('repurpose my Doom post')).toBe(true)
  expect(REPURPOSE.test('can you get more posts out of the MCP servers post')).toBe(true)
  expect(REPURPOSE.test('write some follow-up posts for the DBeaver launch')).toBe(true)
  expect(REPURPOSE.test('turn this blog post into a week of posts')).toBe(true)
  expect(REPURPOSE.test('follow up on the PR')).toBe(false)
  expect(REPURPOSE.test('repurpose the old NUC as a Proxmox node')).toBe(false)
  expect(REPURPOSE.test('repurpose this https://www.joekarlsson.com/blog/doom/')).toBe(true)
  expect(REPURPOSE.test('fix the Postiz scheduler')).toBe(false)
  expect(REPURPOSE.test('how many posts are queued this week')).toBe(false)
  expect(repurposeNote).toContain('skill "social"')
})

test('handoff: closing or resuming a session loads the handoff skill', async () => {
  for (const t of ['I am going to have to close this session and work on this again tomorrow', 'Can you pull and figure out what was left', 'pick up where we left off', 'let us hand this off']) expect(HANDOFF.test(t)).toBe(true)
  for (const t of ['close the garage door', 'continue', 'what is left in the queue']) expect(HANDOFF.test(t)).toBe(false)
})

test('grill: asking to stress-test a plan loads the grill-me skill', async () => {
  for (const t of ['grill me on the NAS migration plan', 'can you poke holes in this', 'stress test this plan before I start', 'run a pre-mortem on the site rebuild', 'what could go wrong with this plan?']) expect(GRILL.test(t)).toBe(true)
  for (const t of ['grill the burgers at 6', 'run the stress test on the UPS', 'what went wrong with the backup?']) expect(GRILL.test(t)).toBe(false)
})
