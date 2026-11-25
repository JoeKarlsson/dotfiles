import type { On } from 'claude-code'

// Agents loosen a linter or formatter config to make a check pass instead of fixing
// the code (ECC's config-protection hook, adopted 2026-11-24). Editing an existing
// config, or its ignore file, asks Joe first; creating a new one passes. When no
// one answers (dismissed, or a -p run), the edit is refused.

const LINT_CONFIG = new RegExp(
  '^(' +
    [
      String.raw`\.eslintrc(\.(js|cjs|json|ya?ml))?`,
      String.raw`eslint\.config(\.[\w-]+)?\.(js|mjs|cjs|ts|mts|cts)`,
      String.raw`\.prettierrc(\.(js|cjs|mjs|json|ya?ml|toml))?`,
      String.raw`prettier\.config\.(js|cjs|mjs|ts)`,
      String.raw`\.?biome\.jsonc?`,
      String.raw`\.?ruff\.toml`,
      String.raw`\.flake8|\.pylintrc|mypy\.ini`,
      String.raw`\.shellcheckrc`,
      String.raw`\.stylelintrc(\.(json|ya?ml|js|cjs|mjs))?`,
      String.raw`stylelint\.config\.(js|cjs|mjs|ts|mts|cts)`,
      String.raw`\.markdownlint(-cli2)?(\.(jsonc?|ya?ml|cjs|mjs))?|\.markdownlintrc`,
      String.raw`\.vale\.ini`,
      String.raw`\.yamllint(\.ya?ml)?`,
      String.raw`\.hadolint\.ya?ml`,
      String.raw`\.tflint\.hcl`,
      String.raw`\.gitleaks\.toml|\.gitleaksignore|\.semgrepignore`,
      String.raw`\.pre-commit-config\.ya?ml`,
      String.raw`\.(eslint|prettier|stylelint|markdownlint)ignore`,
    ].join('|') +
    ')$',
)

export const isLintConfig = (path: string) => LINT_CONFIG.test(path.split('/').pop() ?? '')

export const LINT_REASON =
  'Lint config guard (global mod): this edits an existing linter/formatter config or its ignore list. ' +
  'Fix the code the check flagged instead of loosening the check. Change the config only when Joe asked for that exact change.'

const ALLOW = 'Allow this config edit'

export function registerLintConfig(on: On) {
  on('tool.call', { tool: ['Write', 'Edit'] }, async ($, e, next) => {
    if (!isLintConfig(e.file_path) || !(await $.fs.exists(e.file_path))) return next(e)
    let answer: string
    try {
      answer = await $.ui.ask(`${LINT_REASON} Allow the edit to \`${e.file_path}\`?`, {
        header: 'Lint config',
        options: [ALLOW, 'Fix the code instead'],
      })
    } catch {
      return { deny: `${LINT_REASON} No one approved it, so it was not written.` }
    }
    return answer === ALLOW ? next(e) : { deny: `Joe said no. ${LINT_REASON}` }
  })
}
