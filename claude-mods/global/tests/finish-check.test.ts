import { expect, test } from 'claude-code/testing'

import { isChangeCommand } from '../hooks/finish-check'

test('finish check: commands that change things count, reads do not', async () => {
  for (const c of ['git commit -m "x"', 'git -C /r push', 'git worktree add ../w', 'make deploy-main-dashboard WORK=/t', 'tofu apply', 'scripts/utils/ha_git.sh commit "fix: x" dashboards/main', 'mkdir -p /tmp/x']) expect(isChangeCommand(c)).toBe(true)
  for (const c of ['git status', 'git log --oneline -3', 'git diff', 'cat README.md', 'make audit-dashboards', 'grep -n commit x.ts']) expect(isChangeCommand(c)).toBe(false)
})
