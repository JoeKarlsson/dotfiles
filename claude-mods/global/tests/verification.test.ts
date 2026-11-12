import { expect, test } from 'claude-code/testing'

import { isDiffCommand, raisedKnobs } from '../hooks/verification'

test('test timing: a raised timeout or an added retry in a test file is flagged', async () => {
  expect(raisedKnobs('/r/tests/api.test.ts', "it('x', async () => {}, { timeout: 5000 })", "it('x', async () => {}, { timeout: 30_000 })")).toEqual(['timeout'])
  expect(raisedKnobs('/r/src/login.spec.ts', 'await page.click(b)', 'test.describe.configure({ retries: 2 })')).toEqual(['retries'])
  expect(raisedKnobs('/r/tests/test_sync.py', 'time.sleep(1)', '@pytest.mark.flaky(reruns=3)')).toEqual(['reruns'])
  expect(raisedKnobs('/r/playwright.config.ts', 'timeout: 10000', 'timeout: 60000')).toEqual(['timeout'])
})

test('test timing: lowered or new timeouts, and non-test files, pass', async () => {
  expect(raisedKnobs('/r/tests/api.test.ts', '{ timeout: 30000 }', '{ timeout: 5000 }')).toEqual([])
  expect(raisedKnobs('/r/tests/new.test.ts', '', "it('x', fn, { timeout: 5000 })")).toEqual([])
  expect(raisedKnobs('/r/src/client.ts', 'timeout: 5000', 'timeout: 30000')).toEqual([])
  expect(raisedKnobs('/r/tests/api.test.ts', 'expect(a).toBe(1)', 'expect(a).toBe(2)')).toEqual([])
})

test('subagent check: diff commands count, other git commands do not', async () => {
  for (const c of ['git diff', 'git -C /r/.claude/worktrees/agent-x diff main', 'git show HEAD --stat', 'git log -p -3', 'git log --stat origin/main..HEAD']) expect(isDiffCommand(c)).toBe(true)
  for (const c of ['git status', 'git log --oneline -5', 'git commit -m "diff"', 'npm test']) expect(isDiffCommand(c)).toBe(false)
})
