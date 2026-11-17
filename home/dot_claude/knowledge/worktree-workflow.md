---
type: Runbook
title: "Parallel sessions: one worktree each"
description: "Why parallel Claude sessions in one repo need a worktree each, how to ship from one (rebase, push HEAD:main), gitignored files via .worktreeinclude, and removing it when done (ExitWorktree discard_changes rule)"
tags: [git, worktree, parallel-sessions]
sources: [{resource: "~/.claude/CLAUDE.md"}]
generated: {by: claude-code/okf-restructure, at: "2026-10-30T17:00:00-05:00"}
stale_after: "2027-04-28T00:00:00-05:00"
---

# Parallel sessions: one worktree each

I often run several Claude sessions in the same repo at once. They share one git index and working tree, so a plain `git commit` can sweep in another session's staged files, and edits collide (2026-10-01: my commit landed under another session's message, and pushes carried each other's commits).

The parallel-sessions hook (`~/dotfiles/claude-mods/global`) refuses edits in a main checkout another live session shares, and commits there without `-- <paths>`; when it fires, call EnterWorktree. To start a parallel session yourself: `claude -w <short-name>`.

- **Ship from the worktree:** commit on its branch, then `git fetch && git rebase origin/main`. In my repos, `git push origin HEAD:main`; in anyone else's, push the branch and open a draft PR (Git in `~/.claude/CLAUDE.md`). Push promptly; an unpushed worktree drifts.
- **Gitignored files** (credentials, tfvars) are snapshots copied in from the main checkout via the repo's `.worktreeinclude`. Change them only in the main checkout.
- **When done,** remove the worktree, don't keep it. ExitWorktree `remove` refuses when the branch's commits are on `origin/main` but not on local `main` (always true after `push origin HEAD:main`); once `git branch -r --contains HEAD` lists `origin/main` and `git status` is clean, nothing can be lost, so pass `discard_changes: true`. The SessionStart hook `worktree-hygiene.sh` removes any finished worktree left behind after an hour idle.
- **Shared machine state:** dev-server ports are shared too, so check `lsof -iTCP:<port> -sTCP:LISTEN` and that process's cwd before trusting what a port serves; a build output folder in the main checkout can vanish mid-run (2026-11-05, joekarlsson.com's `dist/`). Another session may edit your worktree by mistake: ask it (SendMessage), don't revert. Repo-specific setup (e.g. joekarlsson.com's `node_modules` and e2e `PORT`) is in that repo's CLAUDE.md.
- **Pushing while main moves:** in a push retry loop, keep the push output and stop on `pre-push script failed`; a loop that hid it reported four "lost races" that were a failing test. After a rebase, check that conventions you changed weren't reintroduced by the new commits.
- **Hooks in a worktree:** if a repo sets `core.hooksPath` to an absolute path, commits and pushes from a worktree run the main checkout's hooks, which are stale until main is pulled. Pull the main checkout after pushing a hook change.
