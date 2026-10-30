---
okf_version: "0.2"
---
# Global knowledge (all repos)

Open Knowledge Format bundle for rules that matter only in some sessions; `~/.claude/CLAUDE.md` keeps the always-on rules and points here.

## Concepts

- [Parallel sessions: one worktree each](/worktree-workflow.md): Why parallel Claude sessions in one repo need a worktree each, how to ship from one (rebase, push HEAD:main), gitignored files via .worktreeinclude, and removing it when done (ExitWorktree discard_changes rule)
