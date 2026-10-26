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

test('a cd before the commit sets its directory; unreadable paths fail open', async () => {
  expect(pathlessCommit('cd /tmp/clones && git -C repo commit -am wip')).toBe('/tmp/clones/repo')
  expect(pathlessCommit('cd /tmp/clones/repo && git commit -m y')).toBe('/tmp/clones/repo')
  expect(pathlessCommit('cd /a && git -C /b commit -m y')).toBe('/b')
  expect(pathlessCommit('cd sub; git commit -m y')).toBe('sub')
  expect(pathlessCommit('cd /a && git commit -m y -- x; cd /b')).toBe(undefined)
  expect(pathlessCommit('git -C $r commit -am wip')).toBe(undefined)
  expect(pathlessCommit('cd "$B" && git commit -m y')).toBe(undefined)
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
