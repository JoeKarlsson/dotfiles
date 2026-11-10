# Claude Code mods

`global/` is the one mod that applies in every repo, on every machine. Mods tied
to one repo live in that repo instead (the homelab mod is
`.claude/mods/homelab` in the homelab repo: `~/claude` on the laptop, `~/claude-skills` on the work Mac). New global behaviour goes in `global/`
as another `hooks/<feature>.ts` registered from `hooks/register.ts`, so the list
of mod folders in settings never changes.

| Feature | File | What it does |
|---------|------|--------------|
| Parallel sessions | `parallel-sessions.ts` | While another live session is in a repo's main checkout: refuses edits there (gitignored files exempt) and `git commit` without `-- <paths>` |
| Commit format | `commit-format.ts` | Refuses `git commit -m` unless the subject is `feat:`/`fix:`/`chore:` plus an uppercase summary (git's own Merge/Revert subjects pass) |
| Unpushed work | `unpushed.ts` | Status line and a line under each answer when commits aren't pushed; "remove it" for a worktree whose work is all on the remote; a macOS notification if a session ends with commits unpushed |
| Keystroke guard | `keystroke-guard.ts` | Refuses commands that send System Events `keystroke`/`key code` (they type into whatever app is frontmost); AX actions and menu clicks pass |
| Word guard | `word-guard.ts` | Refuses writing a `.docx` (Write/Edit, `cp`, `pack.py`, `pandoc -o`, redirects) while Word has a document of that name open; reads pass |
| Sensitive shell | `sensitive-shell.ts` | Refuses reading a `.env` file with Read; asks before `cat`/`curl`/`base64`/`cp` on one; asks before `ssh`, `scp`, `rsync` and `tofu apply`/`destroy`/`import`/`state` outside the homelab repo (from the joekarlsson.com security audit: sessions that read web content shouldn't reach the homelab or secrets unasked) |
| Private sync | `private-sync.ts` | At session end, runs its `fix-skill-links.sh`, then commits and pushes `~/Documents/dev/joe/claude-private` (the private repo `~/.claude/skills` and the memory folders link into) in a background shell; the next session start toasts if that sync failed |
| Blog checks | `blog-check.ts` | After each write to a blog post (joekarlsson.com blog and newsletter, CData `drafts/`), tells the model what Vale, the humanizer's `ai_tells.py` and the banned-phrase check (em dash, "That's real information") found. `/blog-check <post>` lists everything and starts the full review: humanizer, the repo's voice guide, its review command |

The status line shows only when there's something to act on.

**Guards fail open.** A hook that throws is skipped, so a bug lets a call through
instead of blocking every call. Don't remove a classic hook that a mod overlaps.

**Loading.** `CLAUDE_CODE_PLUGIN_DIRS` in `home/dot_claude/private_settings.json.tmpl` (Macs)
lists the mod folders, `:`-separated, one homelab path per machine (work Mac `~/claude-skills`, personal Mac `~/claude`;
on the work Mac `~/claude` is a symlink to it, and listing both loads the mod twice). Windows sets it in
`home/.chezmoitemplates/claude-settings-windows.json`, `;`-separated: there `:`
is read as part of one path and neither mod loads. claude-dev gets it from the same template,
with its own paths. A folder that doesn't exist on a machine is skipped silently.
Saving a file in a listed folder hot-reloads the mod in running sessions.

**Why outside `home/`.** chezmoi's symlink mode would make every file here a
symlink, and the plugin loader refuses symlinked hook files. Sessions load these
folders straight from this checkout instead, so a `git pull` is the whole deploy.

**Checking a mod.** `claude plugin validate <folder>` and `claude plugin test <folder>`
(the pre-commit hook runs the tests when a mod's files are staged), plus
`tsc -p <folder>` once a session has loaded it (it writes the types into
`.claude-plugin/types/`, which is gitignored).
