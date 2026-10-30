<!-- chezmoi deploys this as a copy, not a symlink, because Cowork skips a symlinked
     ~/.claude/CLAUDE.md. Edit ~/dotfiles/home/dot_claude/private_CLAUDE.md, then run
     `chezmoi apply ~/.claude/CLAUDE.md`. Block HTML comments are stripped from context.
     Only rules that apply in every repo on every machine and that Claude can't work out
     itself belong here. Tool- or file-type-specific rules go in that tool's skill;
     situational ones in ~/.claude/knowledge/; zero-exception rules in a hook
     (~/dotfiles/claude-mods/global: commit format, parallel sessions, keystrokes, Word). -->
# Global instructions

## Testing

- Run the change once and confirm it works before calling it done. Don't ask me to check what you can check.
- Scale testing to risk: the changed area's tests, not the whole suite.
- Check once; don't confirm the same thing several ways.
- Report briefly what you ran. Text-only edits need no test run.

## Code design

- Build only what was asked: no speculative options or abstractions.
- Don't hide failures: no swallowed errors or silent fallbacks.
- Extract a helper at the third copy, not before.
- Delete what your change made dead, in the same change.
- Descriptive names (`waitUntilObjectIsSaved`, not `wait`).

## Git

- Fetch before making changes.
- Ship by repo owner (`git remote get-url origin`):
  - Mine (`github.com/JoeKarlsson/*`): commit to main and push without being asked. PRs only when I ask, as drafts.
  - Anyone else's: never push to main; push a branch and open a draft PR.
  - No remote: commit only.

Situational rules: `~/.claude/knowledge/index.md`.
