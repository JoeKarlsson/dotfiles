import type { On } from 'claude-code'
import { expect, test } from 'claude-code/testing'

import { plistWrite, schedulerFinding } from '../hooks/mac-scheduler'
import { isOpenCommand, isViewableOutput } from '../hooks/open-outputs'
import { postsJoesWords } from '../hooks/outbound-text'
import { keychainDenial } from '../hooks/sensitive-shell'

// Split so the text of this file is not itself a launchd plist key.
const START_INTERVAL = '<key>Start' + 'Interval</key>'

test('scheduler: real scheduling is caught, reads and remote commands are not', async () => {
  expect(schedulerFinding('launchctl load ~/Library/LaunchAgents/x.plist')).toEqual({ deny: true })
  expect(schedulerFinding('sudo brew services start redis')).toEqual({ deny: true })
  expect(schedulerFinding('brew services restart ollama')).toEqual({ brewRestart: 'ollama' })
  expect(schedulerFinding('(crontab -l; echo "0 3 * * * x") | crontab -')).toEqual({ deny: true })
  expect(schedulerFinding('cp x.plist ~/Library/LaunchAgents/')).toEqual({ deny: true })
  expect(schedulerFinding('crontab -l')).toBe(null)
  expect(schedulerFinding('launchctl list | grep x')).toBe(null)
  expect(schedulerFinding('grep -rl "launchctl\\|crontab" hooks/')).toBe(null)
  expect(schedulerFinding('ssh root@192.168.0.224 "crontab -e"')).toBe(null)
  expect(schedulerFinding('ls ~/Library/LaunchAgents/')).toBe(null)
})

test('scheduler: plist writes', async () => {
  expect(plistWrite('/Users/j/Library/LaunchAgents/com.x.plist', '')).toBe(true)
  expect(plistWrite('/r/x.plist', `${START_INTERVAL}<integer>60</integer>`)).toBe(true)
  expect(plistWrite('/r/hooks/mac-scheduler.ts', START_INTERVAL)).toBe(false)
})

for (const [cwd, denied] of [['/Users/j/Documents/dev/cdata/skills', true], ['/root/claude-skills-joekarlsson', false]] as const) {
  test(`scheduler guard ${denied ? 'refuses on a Mac' : 'lets a CT schedule'} (${cwd})`, async ($, on) => {
    on('session.cwd', async () => ({ value: cwd }) as never)
    let ran = false
    on('tool.call', { tool: 'Bash' }, async () => {
      ran = true
      return { result: '' } as never
    })
    await $.tool.call({ tool: 'Bash', command: 'crontab /tmp/jobs' })
    expect(ran).toBe(!denied)
  })
}

test('keychain writes are refused, reads pass', async () => {
  expect(keychainDenial('security add-generic-password -s x -a y -w z')).toContain('1Password')
  expect(keychainDenial('security find-generic-password -s x')).toBe(null)
  expect(keychainDenial('keyring set svc user')).toContain('.env.local')
})

test('viewable outputs: deliverables yes, source and scratch no', async () => {
  expect(isViewableOutput('/private/tmp/claude-502/x/scratchpad/report.html')).toBe(true)
  expect(isViewableOutput('/Users/j/Downloads/proposal.docx')).toBe(true)
  expect(isViewableOutput('/Users/j/Desktop/thumb.png')).toBe(true)
  expect(isViewableOutput('/Users/j/social-drafts/doom.md')).toBe(true)
  expect(isViewableOutput('/Users/j/site/public/og.png')).toBe(false)
  expect(isViewableOutput('/Users/j/site/src/pages/index.html')).toBe(false)
  expect(isViewableOutput('/Users/j/claude/knowledge/x.md')).toBe(false)
  expect(isViewableOutput('/Users/j/.claude/projects/p/memory/x.md')).toBe(false)
  expect(isOpenCommand('open -a Firefox /tmp/x.html')).toBe(true)
  expect(isOpenCommand('cd /x && code README.md')).toBe(true)
  expect(isOpenCommand('git show HEAD --stat')).toBe(false)
})

// What a session answers for the mod's other hooks (cwd, file checks, the Stop event).
const sessionBase = (on: On) => {
  on('session.cwd', async () => ({ value: '/Users/j/Documents/dev/joe/site' }) as never)
  on('fs.exists', async () => ({ value: false }) as never)
  on('classic.Stop', async () => ({}) as never)
  on('process.run', async () => ({ value: { exitCode: 1, stdout: '', stderr: '' } }) as never)
}

test('a turn that wrote a page and never opened it is blocked once at stop', async ($, on) => {
  sessionBase(on)
  on('tool.call', { tool: 'Write' }, async () => ({ result: 'ok' }) as never)
  await $.tool.call({ tool: 'Write', file_path: '/Users/j/Downloads/report.html', content: '<p>x</p>' })
  const first = await $.classic.Stop({ stop_hook_active: false })
  expect(first.block).toContain('/Users/j/Downloads/report.html')
  const again = await $.classic.Stop({ stop_hook_active: false })
  expect(again.block).toBe(undefined)
})

test('opening it clears the stop', async ($, on) => {
  sessionBase(on)
  on('tool.call', { tool: 'Write' }, async () => ({ result: 'ok' }) as never)
  on('tool.call', { tool: 'Bash' }, async () => ({ result: '' }) as never)
  await $.tool.call({ tool: 'Write', file_path: '/Users/j/Downloads/report.html', content: '<p>x</p>' })
  await $.tool.call({ tool: 'Bash', command: 'open /Users/j/Downloads/report.html' })
  const stop = await $.classic.Stop({ stop_hook_active: false })
  expect(stop.block).toBe(undefined)
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

test("a repo's DECISIONS.md is put in context at session start and after compaction", async ($, on) => {
  on('session.cwd', async () => ({ value: '/Users/j/Documents/dev/joe/site' }) as never)
  on('process.run', async () => ({ value: { exitCode: 0, stdout: '/Users/j/Documents/dev/joe/site\n', stderr: '' } }) as never)
  on('fs.exists', async () => ({ value: true }) as never)
  on('fs.read', async () => ({ value: '- 2026-11-04: no blue corner bars' }) as never)
  on('classic.SessionStart', async () => ({}) as never)
  for (const source of ['startup', 'compact'] as const) {
    const started = await $.classic.SessionStart({ source })
    expect(started.additionalContext?.join('\n')).toContain('no blue corner bars')
  }
})
