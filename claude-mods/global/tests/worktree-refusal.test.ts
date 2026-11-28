import { expect, test } from 'claude-code/testing'

import { worktreeRefusalNote } from '../hooks/worktree-refusal'

// The refusal agent-acb2999054a2a0c1f (cdata skills video-craft worktree) got, verbatim.
const REFUSED = 'This session is isolated in the worktree /Users/j/skills/.claude/worktrees/video-craft, but this command is too complex to verify that it stays inside the worktree. Refusing to run it.'

test('a worktree refusal says what works instead of retrying', async () => {
  const note = worktreeRefusalNote(REFUSED)!
  expect(note).toContain('retrying this exact call is refused every time')
  expect(note).toContain('/Users/j/skills/.claude/worktrees/video-craft')
  expect(worktreeRefusalNote('Exit code 1')).toBe(null)
})

test('the note rides along on the refused call only', async ($, on) => {
  let text = REFUSED
  on('session.cwd', async () => ({ value: '/Users/j/skills/.claude/worktrees/video-craft' }) as never)
  on('tool.call', { tool: 'Bash' }, async () => ({ result: { content: [], isError: true }, isError: true, text }) as never)
  const call = async () => ((await $.tool.call({ tool: 'Bash', command: 'cat > /tmp/x' } as never)) as { context?: string[] }).context ?? []
  expect((await call()).join()).toContain('Worktree isolation')
  text = 'Exit code 1'
  expect(await call()).toEqual([])
})
