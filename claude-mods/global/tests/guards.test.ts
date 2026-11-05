import { expect, test } from 'claude-code/testing'

import { isPost, phraseFindings } from '../hooks/blog-check'
import { commitSubject, formatDenial } from '../hooks/commit-format'
import { designFindings, isWebFile } from '../hooks/design-check'
import { keystrokeDenial } from '../hooks/keystroke-guard'
import { unpushedText } from '../hooks/unpushed'
import { openNames, writesDoc } from '../hooks/word-guard'

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

test('Word guard: the docx skill wrapper runs its checks on an open document', async () => {
  const name = 'Q3 Plan.docx'
  expect(writesDoc('~/.agents/skills/docx/scripts/py ~/.agents/skills/docx/scripts/word_guard.py check "Q3 Plan.docx"', name)).toBe(false)
  expect(writesDoc('$SKILL/scripts/py $SKILL/scripts/word_guard.py close "Q3 Plan.docx"', name)).toBe(false)
  expect(writesDoc('$SKILL/scripts/py $SKILL/scripts/preserve_check.py orig.docx "Q3 Plan.docx"', name)).toBe(false)
  expect(writesDoc('$SKILL/scripts/py $SKILL/scripts/pack.py out/ "Q3 Plan.docx"', name)).toBe(true)
})

test('Word guard: Compatibility Mode windows count as open documents', async () => {
  // Word can't name a Compatibility Mode document; only its window title shows it.
  const names = openNames('Q3 Plan.docx\nQ3 Plan\nBrief_V1  -  Compatibility Mode\n')
  expect(names).toEqual(['Q3 Plan.docx', 'Q3 Plan', 'Brief_V1'])
  expect(writesDoc('cp /tmp/x.doc ~/OneDrive/Brief_V1.doc', 'Brief_V1')).toBe(true)
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

test('keystroke guard: System Events keystrokes are refused, AX actions pass', async () => {
  expect(keystrokeDenial(`osascript -e 'tell application "System Events" to keystroke "v" using command down'`)).toContain('frontmost')
  expect(keystrokeDenial(`osascript -e 'tell application "System Events" to key code 44'`)).toContain('postToPid')
  expect(keystrokeDenial(`osascript -e 'tell application "System Events" to perform action "AXPress" of button 1'`)).toBe(null)
  expect(keystrokeDenial('grep -rn keystroke macos/')).toBe(null)
})

test('design check: web files, not build output', async () => {
  expect(isWebFile('/r/src/pages/index.astro')).toBe(true)
  expect(isWebFile('/tmp/scratch/page.html')).toBe(true)
  expect(isWebFile('/r/node_modules/x/a.css')).toBe(false)
  expect(isWebFile('/r/public/app.min.css')).toBe(false)
  expect(isWebFile('/r/README.md')).toBe(false)
})

test('design check: banned patterns are found, plain styles pass', async () => {
  const bad = [
    'body { background: linear-gradient(90deg, #6366f1, #a855f7); }',
    'h1 { letter-spacing: -0.02em; }',
    '<p class="text-xs uppercase tracking-wide">Features</p>',
    '.card { backdrop-filter: blur(8px); box-shadow: 0 4px 12px rgba(0,0,0,.1); border-radius: 24px; }',
    '<h2>Build faster.</h2>',
    '<h2>01 / Features</h2>',
    '<span>✨ New</span>',
    '.label { font-family: "JetBrains Mono", monospace; }',
  ].join('\n')
  const found = designFindings(bad).join('\n')
  for (const n of ['#19', '#21', '#4', '#22', '#23', '#16', '#7', '#20', '#12', '#25', '#17']) expect(found).toContain(n)
  const good = [
    'body { background: #fafaf7; color: #1a1a1a; font-family: "Source Serif 4", Georgia, serif; }',
    '.ui { font-family: "Inter", system-ui, sans-serif; }',
    'pre, code { font-family: ui-monospace, monospace; }',
    '.btn { border-radius: 4px; }',
    '<h2>Build faster</h2>',
    '<p>© 2026 Joe Karlsson. Version 1.2.</p>',
    'const shadowRoot = el.attachShadow({ mode: "open" })',
  ].join('\n')
  expect(designFindings(good)).toEqual([])
})
