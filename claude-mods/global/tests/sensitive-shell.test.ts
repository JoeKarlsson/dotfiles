import { expect, test } from 'claude-code/testing'

// End to end: the mod's hooks, raised as a session raises them.
test('a Read of a .env file is refused before it runs', async ($, on) => {
  let ran = false
  on('tool.call', { tool: 'Read' }, async () => {
    ran = true
    return { result: 'TOKEN=x' } as never
  })
  const result = await $.tool.call({ tool: 'Read', file_path: '/tmp/site/.env' })
  expect(ran).toBe(false)
  expect(JSON.stringify(result)).toContain('secrets')
})

// The guard asks Joe through the AskUserQuestion dialog before these run. A test
// stubs the dialog: dismissing it must keep the command from running.
for (const [cwd, command, asks] of [
  ['/Users/j/Documents/dev/joe/joekarlsson.com', 'ssh root@192.168.0.216 uptime', false],
  ['/Users/j/Documents/dev/joe/joekarlsson.com', 'tofu -chdir=x apply', true],
  ['/Users/j/Documents/dev/joe/joekarlsson.com', 'cat .env', true],
  ['/Users/j/Documents/dev/joe/joekarlsson.com', 'npm run deploy', false],
  ['/Users/j/claude-skills/opentofu', 'ssh root@192.168.0.216 uptime', false],
] as const) {
  test(`${command} in ${cwd.split('/').pop()} ${asks ? 'asks, and a dismissed ask stops it' : 'runs without asking'}`, async ($, on) => {
    on('session.cwd', async () => ({ value: cwd }) as never)
    let asked = false
    on('tool.call', { tool: 'AskUserQuestion' }, async () => {
      asked = true
      throw new Error('dismissed')
    })
    let ran = false
    on('tool.call', { tool: 'Bash' }, async () => {
      ran = true
      return { result: '' } as never
    })
    await $.tool.call({ tool: 'Bash', command })
    expect(asked).toBe(asks)
    expect(ran).toBe(!asks)
  })
}
