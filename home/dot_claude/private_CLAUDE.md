<!-- chezmoi deploys this as a copy, not a symlink, because Cowork skips a symlinked
     ~/.claude/CLAUDE.md. Edit ~/dotfiles/home/dot_claude/private_CLAUDE.md, then run
     `chezmoi apply ~/.claude/CLAUDE.md`. Block HTML comments are stripped from context.
     Only rules that apply in every repo on every machine belong here. Tool- or
     file-type-specific rules go in that tool's skill; situational ones in ~/.claude/knowledge/. -->
# Global instructions

## Testing

- Run the change you made once and confirm it works before calling it done. Don't ask me to check what you can check yourself.
- Match effort to risk: run the tests for the area you changed, update tests that cover changed behavior, add one only for non-trivial logic likely to break. Do end-to-end checks only when the change touches something shared or could fail silently.
- Check once; don't confirm the same thing several ways.
- Report briefly what you ran and what happened. Text-only edits (docs, skills, CLAUDE.md) need no test run: re-read what you changed.

## Code design

- Build only what was asked: no speculative options, flags, or abstractions.
- Don't hide failures: no swallowed errors, silent fallbacks, or unexplained `|| true`.
- Duplicate once; extract a helper at the third copy.
- In the same change, delete what it made dead (functions, imports, files, stale comments, debug leftovers).
- Use descriptive names (`waitUntilObjectIsSaved`, not `wait`) in the file's casing convention.

## Git

- Fetch before making changes.
- Commit messages: `feat:`, `fix:`, or `chore:` (non user-facing) plus a summary starting with an uppercase letter.
- Ship by repo owner (`git remote get-url origin`):
  - My repos (`github.com/JoeKarlsson/*`): commit to main and push without being asked. No PRs unless I ask; then a draft with a one-sentence description.
  - Anyone else's (CDataSoftware, Azure DevOps, cloudquery, colleagues): never push to main. Push a branch and open a draft PR with a one-sentence description.
  - No remote: commit only.
- Before the first edit in a repo, run ListAgents. If another session is in the same repo (names start with the repo's directory name), use EnterWorktree. Outside a worktree, commit with explicit paths (`git commit -- <paths>`) and never touch another session's changes.

Situational rules (like shipping from a worktree) live in `~/.claude/knowledge/index.md`: read the index, open only the concept you need.
