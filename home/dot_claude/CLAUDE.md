# Global instructions

## Testing

**Test the change you made.** Before calling it done, run the specific feature, fix, or test once and confirm it works. Don't claim something works without running it. If it fails, fix it and run it again. Don't ask me to check something you could check yourself.

**Past that, use your judgment.** Match the effort to the risk. Speed matters, so don't be cautious just for the sake of it.
- **Tests:** run the tests for the area you changed, not the whole suite by default. If existing tests check behavior you changed, update them. Add a test for new logic that's non-trivial and likely to break later; skip it for small or obvious changes.
- **End-to-end and downstream checks:** do these when the change touches something shared (a module, schema, template, or config other things read), or when a failure would be silent or costly. Skip them for contained changes.
- Check once. Don't confirm the same thing several different ways.

**Reporting:** briefly say what you ran and what happened. **Text-only edits** (skills, CLAUDE.md, docs, READMEs, comments) need no test runs: re-read the section you edited and report what changed.

## Git Workflow

This is my personal computer — do NOT open pull requests by default.

1. Always fetch the latest changes from the remote repository before making any changes.
2. Commit messages (and any PR titles) should follow the format `feat: <Summary>`, `fix: <Summary>`, or `chore: <Summary>`, where the summary starts with an uppercase letter. Use `chore:` for non user-facing changes.
3. When a change is ready, commit it directly **and push** — always keep the remote up to date without being asked. Don't create a PR unless I explicitly request one.
4. Only when I explicitly ask for a PR: open it as a draft with a concise single-sentence description.

## Parallel sessions: one worktree each

I often run several Claude sessions in the same repo at once. They share one git index and working tree, so a plain `git commit` can sweep in another session's staged files, and edits collide (2026-10-01: my commit landed under another session's message, and pushes carried each other's commits).

- **Before the first edit in a git repo, run ListAgents.** If another session is working in the same repo (session names start with the repo's directory name, e.g. `claude-skills-a2`), call **EnterWorktree** and do all the work there. To start a parallel session yourself: `claude -w <short-name>`.
- **Ship from the worktree:** commit on its branch, then `git fetch && git rebase origin/main && git push origin HEAD:main`. Still no PRs (see Git Workflow). Push promptly; an unpushed worktree drifts.
- **Gitignored files** (credentials, tfvars) are snapshots copied in from the main checkout via the repo's `.worktreeinclude`. Change them only in the main checkout.
- **Never touch another session's files or staged changes.** Outside a worktree, always commit with explicit paths: `git commit -- <paths>`.
- **When done,** remove the worktree, don't keep it. ExitWorktree `remove` refuses when the branch's commits are on `origin/main` but not on local `main` (always true after `push origin HEAD:main`); once `git branch -r --contains HEAD` lists `origin/main` and `git status` is clean, nothing can be lost, so pass `discard_changes: true`. The SessionStart hook `worktree-hygiene.sh` removes any finished worktree left behind after an hour idle.

## Editing Word documents (.docx): verify in Word, not just on disk

A .docx edit is not done until Joe can see it in Word. A correct file on disk proves nothing: Word and OneDrive can silently replace it (2026-09-25: edits and comment replies passed the validator and an md5 check, then vanished because Word reopened the stale OneDrive cloud copy and AutoSaved it over mine).

Every time:
1. **Before editing**, check whether the doc is open in Word: `osascript -e 'tell application "Microsoft Word" to get {name, saved} of every document'`.
2. **If it's open** (especially a OneDrive/SharePoint file), make the edits through Word itself (AppleScript/`do Visual Basic`) so Word is the writer, or ask Joe to close it first. Never overwrite a file on disk while Word has it open, and never close-overwrite-reopen.
3. **If it's closed**, edit the XML, then run the docx skill's `validate.py --original`. After writing it back, wait for OneDrive to finish syncing before opening it.
4. **Confirm in Word**: after opening, read the content back *from Word* (AppleScript: document text, comment count and text) and check that every change is present, including comments, replies, and hyperlinks.
5. **Report**: say what you verified in Word. If you only checked the file on disk, say exactly that, and never call it done.

## Machine-local

Imported only where the file exists (rtk is installed on the personal Mac).

@~/.claude/RTK.md
