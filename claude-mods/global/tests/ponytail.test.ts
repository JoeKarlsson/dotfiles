import { expect, test } from 'claude-code/testing'

import { codeLines, commitDir, isCodeFile, isCommit, skillName } from '../hooks/ponytail'

test('code files: source yes, docs, data and vendored code no', async () => {
  expect(isCodeFile('/r/scripts/newsletter.py')).toBe(true)
  expect(isCodeFile('/r/opentofu/services/x/provision.sh.tpl')).toBe(true)
  expect(isCodeFile('/r/hooks/ponytail.ts')).toBe(true)
  expect(isCodeFile('/r/README.md')).toBe(false)
  expect(isCodeFile('/r/config.json')).toBe(false)
  expect(isCodeFile('/r/web/node_modules/x/index.js')).toBe(false)
})

test('commit detection: real commits only', async () => {
  expect(isCommit('git commit -m "feat: X"')).toBe(true)
  expect(isCommit('git -C ~/r commit -q -m "fix: Y" && git push')).toBe(true)
  expect(isCommit('git add a && git commit --only -m "x" -- a')).toBe(true)
  expect(isCommit('git log --grep commit')).toBe(false)
  expect(isCommit('git commit --dry-run')).toBe(false)
})

test('commit dir: -C, then a leading cd, then cwd', async () => {
  expect(commitDir('git -C /a/b commit -m x', '/cwd')).toBe('/a/b')
  expect(commitDir('cd /c/d && git commit -m x', '/cwd')).toBe('/c/d')
  expect(commitDir('git commit -m x', '/cwd')).toBe('/cwd')
  expect(commitDir('git -C sub commit -m x', '/cwd')).toBe('/cwd/sub')
})

test('code lines count code files and skip binaries and docs', async () => {
  const numstat = '10\t2\tsrc/a.py\n5\t5\tREADME.md\n-\t-\timg.png\n3\t0\thooks/b.ts\n'
  expect(codeLines(numstat)).toEqual({ lines: 15, files: 2 })
})

test('skill names drop a plugin prefix', async () => {
  expect(skillName('ponytail')).toBe('ponytail')
  expect(skillName('someplugin:ponytail-review')).toBe('ponytail-review')
})
