import type { On } from 'claude-code'
import { expect, mock, test } from 'claude-code/testing'

import { followUpLabel, isOpenCommand, isViewableOutput } from '../hooks/open-outputs'
import { postsJoesWords } from '../hooks/outbound-text'
import { keychainDenial } from '../hooks/sensitive-shell'

test('keychain writes are refused, reads pass', async () => {
  expect(keychainDenial('security add-generic-password -s x -a y -w z')).toContain('1Password')
  expect(keychainDenial('security find-generic-password -s x')).toBe(null)
  expect(keychainDenial('keyring set svc user')).toContain('.env.local')
})

test('viewable outputs: deliverables yes, source and scratch no', async () => {
  expect(isViewableOutput('/private/tmp/claude-502/x/scratchpad/report.html')).toBe(true)
  expect(isViewableOutput('/Users/j/Downloads/proposal.docx')).toBe(true)
  expect(isViewableOutput('/Users/j/Desktop/thumb.png')).toBe(true)
  expect(isViewableOutput('/Users/j/claude-skills/drafts/social/doom.md')).toBe(true)
  expect(isViewableOutput('/Users/j/site/public/og.png')).toBe(false)
  expect(isViewableOutput('/Users/j/site/src/pages/index.html')).toBe(false)
  expect(isViewableOutput('/Users/j/claude/knowledge/x.md')).toBe(false)
  expect(isViewableOutput('/Users/j/.claude/projects/p/memory/x.md')).toBe(false)
  expect(isOpenCommand('open -a Firefox /tmp/x.html')).toBe(true)
  expect(isOpenCommand('cd /x && code README.md')).toBe(true)
  expect(isOpenCommand('git show HEAD --stat')).toBe(false)
})

// The follow-up prompts the turn.complete hook submitted.
let followUps: string[] = []
// What the chat shows of each follow-up: its text alone, without the context.
let visible: string[] = []
// Ends a main-loop turn the way the engine does; returns the follow-up it caused, if any.
const endTurn = async ($: { turn: { complete: (e: never) => Promise<unknown> } }) => {
  const before = followUps.length
  await $.turn.complete({ answer: 'done', durationMs: 1, isAborted: false, turnId: 't', reason: 'answer' } as never)
  return followUps.length > before ? followUps.at(-1) : undefined
}

// What a session answers for the mod's other hooks (cwd, file checks, turn ends, prompts).
const sessionBase = (on: On) => {
  followUps = []
  visible = []
  on('session.cwd', async () => ({ value: '/Users/j/Documents/dev/joe/site' }) as never)
  // Home's top-level folders exist (home-clutter guard); nothing else does.
  on('fs.exists', async (_$, e) => ({ value: /^\/Users\/j\/[^/]+$/.test((e as { path: string }).path) }) as never)
  on('fs.read', async () => ({ value: '' }) as never)
  on('turn.complete', async (_$, e) => ({ text: (e as { answer: string }).answer }) as never)
  on('prompt.submit', async (_$, e) => {
    const { text, context = [] } = e as { text: string; context?: string[] }
    visible.push(text)
    followUps.push([text, ...context].join('\n\n'))
    return { text } as never
  })
  on('process.run', async () => ({ value: { exitCode: 1, stdout: '', stderr: '' } }) as never)
}

test('a turn that wrote a page and never opened it gets one follow-up naming it', async ($, on) => {
  sessionBase(on)
  on('tool.call', { tool: 'Write' }, async () => ({ result: 'ok' }) as never)
  await $.tool.call({ tool: 'Write', file_path: '/Users/j/Downloads/report.html', content: '<p>x</p>' })
  expect(await endTurn($)).toContain('/Users/j/Downloads/report.html')
  expect(await endTurn($)).toBe(undefined) // the follow-up's own turn
  expect(await endTurn($)).toBe(undefined)
})

test('opening it clears the follow-up', async ($, on) => {
  sessionBase(on)
  on('tool.call', { tool: 'Write' }, async () => ({ result: 'ok' }) as never)
  on('tool.call', { tool: 'Bash' }, async () => ({ result: '' }) as never)
  await $.tool.call({ tool: 'Write', file_path: '/Users/j/Downloads/report.html', content: '<p>x</p>' })
  await $.tool.call({ tool: 'Bash', command: 'open /Users/j/Downloads/report.html' })
  // the finish check still asks for cleanup after a Write; only the open note must be gone
  expect((await endTurn($)) ?? '').not.toContain('feedback-open-outputs')
})

test('outbound text: comments and reviews with a body, not reads or marked text', async () => {
  expect(postsJoesWords('gh pr comment 12 --body "Fixed the header"')).toBe(true)
  expect(postsJoesWords('gh issue comment 187 -R mjcumming/wiim -b "thanks"')).toBe(true)
  expect(postsJoesWords('gh pr review 5 --comment -b "LGTM"')).toBe(true)
  expect(postsJoesWords('gh api repos/o/r/pulls/5/comments/9/replies -f body="done"')).toBe(true)
  expect(postsJoesWords('gh api repos/o/r/issues/5/comments')).toBe(false)
  expect(postsJoesWords('gh pr view 12 --comments')).toBe(false)
  expect(postsJoesWords('HUMANIZED=1 gh pr comment 12 --body "x"')).toBe(false)
})

test('a comment is refused until the humanizer runs in the turn', async ($, on) => {
  sessionBase(on)
  let posted = 0
  on('tool.call', { tool: 'Bash' }, async () => {
    posted++
    return { result: '' } as never
  })
  on('tool.call', { tool: 'Skill' }, async () => ({ result: 'loaded' }) as never)
  await $.tool.call({ tool: 'Bash', command: 'gh pr comment 12 --body "Fixed it"' })
  expect(posted).toBe(0)
  await $.tool.call({ tool: 'Skill', skill: 'humanizer' })
  await $.tool.call({ tool: 'Bash', command: 'gh pr comment 12 --body "Fixed it"' })
  expect(posted).toBe(1)
})

test("a repo's DECISIONS.md rides the first prompt and the first after a compaction", async ($, on) => {
  on('session.cwd', async () => ({ value: '/Users/j/Documents/dev/joe/site' }) as never)
  on('process.run', async () => ({ value: { exitCode: 0, stdout: '/Users/j/Documents/dev/joe/site\n', stderr: '' } }) as never)
  on('fs.exists', async () => ({ value: true }) as never)
  on('fs.read', async () => ({ value: '- 2026-11-04: no blue corner bars' }) as never)
  const seen: string[] = []
  on('prompt.submit', async (_$, e) => {
    seen.push(((e as { context?: string[] }).context ?? []).join('\n'))
    return { text: (e as { text: string }).text } as never
  })
  const summary = [{ role: 'user', text: 'summary', toolUses: [] }]
  on('session.compact', async () => ({ messages: summary }) as never)
  await $.prompt.submit({ text: 'fix the header' })
  await $.prompt.submit({ text: 'now the footer' })
  await $.session.compact({ trigger: 'auto', messages: summary } as never)
  await $.prompt.submit({ text: 'and the nav' })
  expect(seen.map(c => c.includes('no blue corner bars'))).toEqual([true, false, true])
})

test('finish check: a turn that committed gets one cleanup follow-up, a read-only turn does not', async ($, on) => {
  sessionBase(on)
  on('ui.status', async () => ({ value: undefined }) as never)
  on('tool.call', { tool: 'Bash' }, async () => ({ result: '' }) as never)
  await $.tool.call({ tool: 'Bash', command: 'git status' })
  expect(await endTurn($)).toBe(undefined)
  await $.tool.call({ tool: 'Bash', command: 'git commit -m "fix: Header lines up with the grid"' })
  expect(await endTurn($)).toContain('Anything else?')
  expect(visible.at(-1)).toBe(followUpLabel) // the checklist stays out of the chat
  expect(await endTurn($)).toBe(undefined) // the follow-up's own turn
  expect(await endTurn($)).toBe(undefined)
})

test('/blog-check shows its findings once, sends the steps hidden, and starts the review', async ($, on) => {
  const shown: string[] = []
  on('session.cwd', async () => ({ value: '/Users/j' }) as never)
  on('fs.exists', async () => ({ value: true }) as never)
  on('fs.read', async () => ({ value: '# Post\n\nIt is worth noting that this works.\n' }) as never)
  on('process.run', async () => ({ value: { exitCode: 1, stdout: '', stderr: '' } }) as never)
  on('command.run', async () => ({ text: '' }) as never)
  mock.env(on, {})
  const clock = mock.clock(on)
  on('prompt.submit', async (_$, e) => {
    shown.push((e as { text: string }).text)
    return { text: (e as { text: string }).text } as never
  })
  const ran = await $.command.run({ command: 'blog-check', args: '/Users/j/Documents/dev/joe/joekarlsson.com/src/content/blog/post.md' })
  expect(ran.context?.join('')).toContain('post.md')
  expect(shown).toEqual([]) // a command.run hook can't submit; the review starts after it returns
  await clock.advance(1)
  expect(shown).toEqual(['Review post.md (/blog-check)'])
})
