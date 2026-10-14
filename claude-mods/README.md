# Claude Code mods

Global mods: ones that apply in every repo, on every machine. Mods tied to one
repo live in that repo instead (the homelab mod is `~/claude-skills/.claude/mods/homelab`).

| Mod | What it does |
|-----|--------------|
| `parallel-sessions` | While another live session is in a repo's main checkout: refuses edits there (gitignored files exempt) and `git commit` without `-- <paths>`, and shows a status line saying to use a worktree |

**Loading.** `CLAUDE_CODE_PLUGIN_DIRS` in `home/dot_claude/settings.json` (Macs only)
lists each mod folder, `:`-separated. A folder that doesn't exist on a machine is
skipped silently. Saving a file in a listed folder hot-reloads the mod in running sessions.

**Why outside `home/`.** chezmoi's symlink mode would make every file here a
symlink, and the plugin loader refuses symlinked hook files. Sessions load these
folders straight from this checkout instead, so a `git pull` is the whole deploy.

**Checking a mod.** `claude plugin validate <folder>`, `claude plugin test <folder>`,
and `tsc -p <folder>` once a session has loaded it (it writes the types into
`.claude-plugin/types/`, which is gitignored).
