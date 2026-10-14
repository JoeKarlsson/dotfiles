import { expect, test } from 'claude-code/testing'

import { isPost, phraseFindings } from '../hooks/blog-check'
import { commitSubject, formatDenial } from '../hooks/commit-format'
import { unpushedText } from '../hooks/unpushed'
import { writesDoc } from '../hooks/word-guard'

test('commit subjects come from -m, -am, --message= and heredocs', async () => {
  expect(commitSubject('git commit -m "feat: Add X"')).toBe('feat: Add X')
  expect(commitSubject("git -C ~/r commit -am 'fix: Y' -- a.ts")).toBe('fix: Y')
  expect(commitSubject('git commit --message=chore:\\ Z')).toBe('chore: Z')
  expect(commitSubject(`git commit -m "$(cat <<'EOF'\nfeat: Heredoc subject\n\nBody line\nEOF\n)"`)).toBe('feat: Heredoc subject')
  expect(commitSubject('git commit --amend --no-edit')).toBe(null)
  expect(commitSubject('git log --grep "commit -m x"')).toBe(null)
})

test('commit format: prefix and an uppercase summary', async () => {
  expect(formatDenial('git commit -m "feat: Add X"')).toBe(null)
  expect(formatDenial('git commit -m "Merge branch \'main\'"')).toBe(null)
  expect(formatDenial('git commit -m "feat: add x"')).toContain('uppercase')
  expect(formatDenial('git commit -m "Add x"')).toContain('"Add x"')
  expect(formatDenial('git commit -m "feat(ui): Add x"')).not.toBe(null)
})

test('Word guard: writes to the open document, not reads', async () => {
  const name = 'Q3 Plan.docx'
  expect(writesDoc('python3 /s/pack.py out/ "Q3 Plan.docx"', name)).toBe(true)
  expect(writesDoc('cp /tmp/x.docx ~/OneDrive/Q3\\ Plan.docx', name)).toBe(true)
  expect(writesDoc('pandoc notes.md -o "Q3 Plan.docx"', name)).toBe(true)
  expect(writesDoc('python3 /s/unpack.py "Q3 Plan.docx" out/', name)).toBe(false)
  expect(writesDoc('pandoc "Q3 Plan.docx" -o notes.md', name)).toBe(false)
  expect(writesDoc('unzip -p "Q3 Plan.docx" word/document.xml | grep foo', name)).toBe(false)
  expect(writesDoc('python3 /s/pack.py out/ other.docx', name)).toBe(false)
})

test('blog posts: site posts, newsletter, CData drafts, worktrees', async () => {
  expect(isPost('/Users/j/Documents/dev/joe/joekarlsson.com/src/content/blog/a.md')).toBe(true)
  expect(isPost('/Users/j/Documents/dev/joe/joekarlsson.com/.claude/worktrees/w/src/content/newsletter/b.md')).toBe(true)
  expect(isPost('/Users/j/Documents/dev/cdata/skills/drafts/x-2026/x.md')).toBe(true)
  expect(isPost('/Users/j/Documents/dev/cdata/skills-wt-humanizer/drafts/x.md')).toBe(true)
  expect(isPost('/Users/j/Documents/dev/joe/joekarlsson.com/README.md')).toBe(false)
})

test('banned phrases: em dash and "That\'s real information", not in code', async () => {
  const text = 'ok\nA — B\n```\nx — y\n```\nThat’s real information.\n'
  expect(phraseFindings(text)).toEqual([
    'L2 em dash: never, no exceptions (use a comma, colon or semicolon, or rewrite)',
    'L6 banned phrase "That\'s real information."',
  ])
})

test('unpushed text', async () => {
  expect(unpushedText({ repo: 'r', ahead: 2, isWorktree: false, isDone: false })).toBe('2 commits in r not pushed')
  expect(unpushedText({ repo: 'r', ahead: 0, isWorktree: true, isDone: true })).toContain('remove it')
  expect(unpushedText({ repo: 'r', ahead: 0, isWorktree: false, isDone: false })).toBe(null)
})
