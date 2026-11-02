import type { EngineInterface } from 'claude-code'

// ~/.claude/skills and Joe's memory folders are symlinks into the private
// claude-private repo (chezmoi external). Sessions write memory there, so each
// session end commits and pushes it: the repo is the off-Mac backup.
//
// Session end has a ~1.5 s budget, so the sync runs as a backgrounded shell the
// session lets go of. It writes its outcome to .git/claude-sync-status, and the
// next session start toasts a failure instead of letting it pass silently.

const REPO = (home: string) => `${home}/Documents/dev/joe/claude-private`
const STATUS = '.git/claude-sync-status'

export const SYNC_SCRIPT = `
cd "$1" || exit 0
log() { printf '%s %s\\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$1" > ${STATUS}; }
if [ -x fix-skill-links.sh ]; then ./fix-skill-links.sh >/dev/null || { log "failed: fix-skill-links.sh"; exit 1; }; fi
git add -A || { log "failed: git add"; exit 1; }
if ! git diff --cached --quiet; then
  git commit -q -m "chore: Sync Claude memory and skills" || { log "failed: git commit"; exit 1; }
fi
[ "$(git rev-list --count @{u}..HEAD 2>/dev/null || echo 1)" = 0 ] && { log ok; exit 0; }
out=$(git pull -q --rebase 2>&1 && git push -q 2>&1) || { log "failed: $(printf '%s\\n' "$out" | grep -m1 -E 'fatal|error|rejected' || printf '%s\\n' "$out" | tail -1)"; exit 1; }
log ok
`

async function repoDir($: EngineInterface) {
  const home = await $.env.get('HOME')
  const dir = home && REPO(home)
  return dir && (await $.fs.exists(`${dir}/.git`)) ? dir : null
}

// Called from register.ts's session.start hook.
export async function toastLastSyncFailure($: EngineInterface) {
  const dir = await repoDir($)
  if (!dir || !(await $.fs.exists(`${dir}/${STATUS}`))) return
  const status = (await $.fs.read(`${dir}/${STATUS}`)).trim()
  if (/ failed: /.test(status)) $.ui.toast(`claude-private sync ${status.replace(/^\S+ \S+ /, '')} (${status.slice(0, 16)}): skills/memory not backed up`)
}

// Called from register.ts's one session.end hook.
export async function startPrivateSync($: EngineInterface) {
  const dir = await repoDir($).catch(() => null)
  if (!dir) return
  await $.process
    .run(['sh', '-c', `nohup sh -c '${SYNC_SCRIPT.replace(/'/g, `'\\''`)}' sync "$0" >/dev/null 2>&1 &`, dir], { timeoutMs: 1000 })
    .catch(() => undefined)
}
