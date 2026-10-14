import { expect, test } from 'claude-code/testing'

import { inMain, parseWorktrees } from '../hooks/git'
import { pathlessCommit } from '../hooks/parallel-sessions'

test('path-less commits are caught, commits with -- are not', async () => {
  expect(pathlessCommit('git commit -m "fix: X"')).toBe(null)
  expect(pathlessCommit('git -C ~/repo commit -am wip')).toBe('~/repo')
  expect(pathlessCommit('git commit -m "fix: X" -- a.ts b.ts')).toBe(undefined)
  expect(pathlessCommit('git log --grep commit')).toBe(undefined)
  expect(pathlessCommit('git add x && git commit -m y; git push')).toBe(null)
})

test('worktrees under the main checkout are not the main checkout', async () => {
  const co = parseWorktrees(
    'worktree /r\nHEAD abc\nbranch refs/heads/main\n\nworktree /r/.claude/worktrees/a\nHEAD def\nbranch refs/heads/a\n',
  )
  expect(co).toEqual({ main: '/r', worktrees: ['/r/.claude/worktrees/a'] })
  expect(inMain('/r/src/x.ts', co!)).toBe(true)
  expect(inMain('/r/.claude/worktrees/a/src/x.ts', co!)).toBe(false)
  expect(inMain('/rx/y', co!)).toBe(false)
})
