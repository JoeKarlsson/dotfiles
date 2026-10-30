# Global instructions

## Testing

**Test the change you made.** Before calling it done, run the specific feature, fix, or test once and confirm it works. Don't claim something works without running it. If it fails, fix it and run it again. Don't ask me to check something you could check yourself.

**Past that, use your judgment.** Match the effort to the risk. Speed matters, so don't be cautious just for the sake of it.
- **Tests:** run the tests for the area you changed, not the whole suite by default. If existing tests check behavior you changed, update them. Add a test for new logic that's non-trivial and likely to break later; skip it for small or obvious changes.
- **End-to-end and downstream checks:** do these when the change touches something shared (a module, schema, template, or config other things read), or when a failure would be silent or costly. Skip them for contained changes.
- Check once. Don't confirm the same thing several different ways.

**Reporting:** briefly say what you ran and what happened. **Text-only edits** (skills, CLAUDE.md, docs, READMEs, comments) need no test runs: re-read the section you edited and report what changed.

## Code design

- **Build only what was asked.** No speculative options, flags, or abstractions. Write the obvious solution; optimize only when there's a measured need.
- **Don't hide failures.** No swallowed errors, silent fallbacks, or `|| true` without a stated reason. An explicit error beats a silent success.
- **Rule of three.** Duplicate once; extract a shared helper when the third copy appears.
- **Clean up as you go.** In the same change, delete code your change made dead or replaced: unused functions, variables, imports, files, stale comments, and debug leftovers. If you spot other clearly dead code nearby, grep for callers and remove it too. Less code is better; don't leave cleanup for later.
- **Descriptive names over short ones.** Name variables, functions, parameters, and endpoints so they explain themselves to a human or an LLM (`waitUntilObjectIsSaved`, not `wait`). Keep the file's casing convention.

## Git Workflow

This is my personal computer: do NOT open pull requests by default.

1. Always fetch the latest changes from the remote repository before making any changes.
2. Commit messages (and any PR titles) should follow the format `feat: <Summary>`, `fix: <Summary>`, or `chore: <Summary>`, where the summary starts with an uppercase letter. Use `chore:` for non user-facing changes.
3. When a change is ready, commit it directly **and push**; always keep the remote up to date without being asked. Don't create a PR unless I explicitly request one.
4. Only when I explicitly ask for a PR: open it as a draft with a concise single-sentence description.

## Parallel sessions: one worktree each

- **Before the first edit in a git repo, run ListAgents.** If another session is working in the same repo (session names start with the repo's directory name), call **EnterWorktree** and do all the work there.
- **Never touch another session's files or staged changes.** Outside a worktree, always commit with explicit paths: `git commit -- <paths>`.
- **Working in a worktree** (shipping with `push origin HEAD:main`, gitignored files, removing it when done): read `~/.claude/knowledge/worktree-workflow.md` first.

Other situational rules live in `~/.claude/knowledge/index.md` (an Open Knowledge Format bundle): read the index line, open only the concept you need.

## Word documents (.docx)

Before reading or editing any .docx, load the local `docx` skill (`~/.agents/skills/docx`), not the `anthropic-skills:docx` plugin variant, which lacks the Word workflow. An edit isn't done until you've read it back from Word.
