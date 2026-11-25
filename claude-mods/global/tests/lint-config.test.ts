import { expect, test } from 'claude-code/testing'

import { isLintConfig } from '../hooks/lint-config'

test('lint config: config and ignore files match, look-alikes do not', async () => {
  for (const p of ['/r/.eslintrc.json', '/r/eslint.config.mjs', '/r/packages/a/eslint.config.base.mjs', '/r/ruff.toml',
    '/r/.vale.ini', '/r/.pre-commit-config.yaml', '/r/.prettierignore', '/r/biome.json', '/r/.markdownlint-cli2.jsonc']) {
    expect(isLintConfig(p)).toBe(true)
  }
  for (const p of ['/r/pyproject.toml', '/r/package.json', '/r/src/eslint.ts', '/r/docs/vale.md', '/r/tsconfig.json']) {
    expect(isLintConfig(p)).toBe(false)
  }
})

const existing = '/r/ruff.toml'

for (const [path, asks] of [
  [existing, true],
  ['/r/.eslintrc.json', false], // a new config is not loosening anything
  ['/r/app.py', false],
] as const) {
  test(`writing ${path.split('/').pop()} ${asks ? 'asks, and a dismissed ask stops it' : 'goes through'}`, async ($, on) => {
    on('session.cwd', async () => ({ value: '/r' }) as never)
    on('process.run', async () => ({ value: { exitCode: 1, stdout: '', stderr: '' } }) as never) // other guards: no git repo
    on('fs.exists', async (_$, e) => ({ value: (e as { path: string }).path === existing }) as never)
    let asked = false
    on('tool.call', { tool: 'AskUserQuestion' }, async () => {
      asked = true
      throw new Error('dismissed')
    })
    let wrote = false
    on('tool.call', { tool: 'Write' }, async () => {
      wrote = true
      return { result: '' } as never
    })
    await $.tool.call({ tool: 'Write', file_path: path, content: 'x' })
    expect(asked).toBe(asks)
    expect(wrote).toBe(!asks)
  })
}
