# Claude Code mods

`global/` is the one mod that applies in every repo, on every machine. Mods tied
to one repo live in that repo instead (the homelab mod is
`~/claude-skills/.claude/mods/homelab`). New global behaviour goes in `global/`
as another `hooks/<feature>.ts` registered from `hooks/register.ts`, so the list
of mod folders in settings never changes.

| Feature | File | What it does |
|---------|------|--------------|
| Parallel sessions | `parallel-sessions.ts` | While another live session is in a repo's main checkout: refuses edits there (gitignored files exempt) and `git commit` without `-- <paths>` |
| Commit format | `commit-format.ts` | Refuses `git commit -m` unless the subject is `feat:`/`fix:`/`chore:` plus an uppercase summary (git's own Merge/Revert subjects pass) |
| Unpushed work | `unpushed.ts` | Status line and a line under each answer when commits aren't pushed; "remove it" for a worktree whose work is all on the remote; a macOS notification if a session ends with commits unpushed |
| Word guard | `word-guard.ts` | Refuses writing a `.docx` (Write/Edit, `cp`, `pack.py`, `pandoc -o`, redirects) while Word has a document of that name open; reads pass |
| Blog checks | `blog-check.ts` | After each write to a blog post (joekarlsson.com blog and newsletter, CData `drafts/`), tells the model what Vale, the humanizer's `ai_tells.py` and the banned-phrase check (em dash, "That's real information") found. `/blog-check <post>` lists everything and starts the full review: humanizer, the repo's voice guide, its review command |

The status line shows only when there's something to act on.

**Guards fail open.** A hook that throws is skipped, so a bug lets a call through
instead of blocking every call. Don't remove a classic hook that a mod overlaps.

**Loading.** `CLAUDE_CODE_PLUGIN_DIRS` in `home/dot_claude/settings.json` (Macs)
lists the mod folders, `:`-separated. claude-dev sets the same variable from its
OpenTofu provisioning. A folder that doesn't exist on a machine is skipped silently.
Saving a file in a listed folder hot-reloads the mod in running sessions.

**Why outside `home/`.** chezmoi's symlink mode would make every file here a
symlink, and the plugin loader refuses symlinked hook files. Sessions load these
folders straight from this checkout instead, so a `git pull` is the whole deploy.

**Checking a mod.** `claude plugin validate <folder>` and `claude plugin test <folder>`
(the pre-commit hook runs the tests when a mod's files are staged), plus
`tsc -p <folder>` once a session has loaded it (it writes the types into
`.claude-plugin/types/`, which is gitignored).
