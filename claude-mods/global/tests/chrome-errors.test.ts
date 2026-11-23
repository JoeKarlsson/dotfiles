import { expect, test } from 'claude-code/testing'

import { chromeStopNote } from '../hooks/chrome-errors'

// The error texts from the sessions that kept retrying (context audit 2026-11-22).
test('chrome stop note names the cause', async () => {
  expect(chromeStopNote('actions[3] (computer:screenshot) failed: Permission denied for this action on this domain')).toContain('ask Joe to allow the domain')
  expect(chromeStopNote("Tab 1234 is not in Claude's tab group for this session.")).toContain('tabs_context_mcp')
  expect(chromeStopNote("Couldn't determine which page this action targets.")).toContain('tabs_context_mcp')
  expect(chromeStopNote('CDP sendCommand "Runtime.evaluate" timed out after 30000ms on tab 5. The renderer may be frozen')).toContain('new tab')
  expect(chromeStopNote('TypeError: x is undefined')).toContain('do not repeat the same call')
  expect(chromeStopNote('Error: there is no table named sites')).toContain('do not repeat the same call')
})

// Session c2eb5438 retried browser_batch 20 times; now the 3rd failure in a row says stop.
test('the 3rd failed Chrome call in a row tells the agent to stop, a success resets it', async ($, on) => {
  let fail = true
  on('tool.call', { tool: 'mcp__claude-in-chrome__browser_batch' }, async () =>
    (fail ? { result: { content: [], isError: true }, isError: true, text: 'Permission denied for this action on this domain' }
      : { result: { content: [], isError: false }, text: 'ok' }) as never)
  const call = async () => ((await $.tool.call({ tool: 'mcp__claude-in-chrome__browser_batch', actions: [] } as never)) as { context?: string[] }).context ?? []
  expect(await call()).toEqual([])
  expect(await call()).toEqual([])
  expect((await call()).join()).toContain('ask Joe to allow the domain')
  expect(await call()).toEqual([])
  fail = false
  await call()
  fail = true
  expect(await call()).toEqual([])
})
