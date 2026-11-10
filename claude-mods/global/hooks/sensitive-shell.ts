import type { On } from 'claude-code'

// Security audit of joekarlsson.com (2026-11-10): a session that reads web pages,
// scraped posts or visitor-set analytics strings could be talked into reaching the
// homelab or leaking secrets with the shell access every repo pre-approves. So, in
// every repo on every machine:
// - reading a .env file with Read is refused (scripts still load it themselves)
// - printing or sending a .env file from the shell asks first
// - ssh, scp, rsync and tofu apply/destroy/import/state ask first, except in the
//   homelab repo, where they're the daily work and its own guards apply
// The ask is Joe's own question dialog: a yes runs the command; nothing here blocks a deploy script, which
// runs these inside `npm run deploy`, not as the command itself.

const ENV_FILE = /(^|\/)\.env(\.[\w-]+)?$/
const ENV_TEMPLATE = /\.env\.(example|sample|template|dist)$/

export function isEnvFile(path: string): boolean {
  const clean = path.replace(/^['"@]+|['"]+$/g, '')
  return ENV_FILE.test(clean) && !ENV_TEMPLATE.test(clean)
}

// ~/claude on the laptop, ~/claude-skills on the work Mac, the checkout on claude-dev.
// Matched on the path: the mod runtime has no process.env to read HOME from.
const HOMELAB_REPO = /^(\/(Users|home)\/[^/]+\/(claude|claude-skills)|\/root\/claude-skills-joekarlsson)(\/|$)/

export function isHomelabRepo(cwd: string): boolean {
  return HOMELAB_REPO.test(cwd)
}

const WRAPPERS = new Set(['sudo', 'time', 'exec', 'nohup', 'command', 'env', 'xargs'])
const DUMPERS = new Set(['cat', 'less', 'more', 'head', 'tail', 'bat', 'base64', 'xxd', 'od', 'strings', 'curl', 'wget', 'nc', 'cp', 'scp', 'rsync'])

// The commands a shell line runs: the first word of each segment, past variable
// assignments and wrappers like sudo, with the rest of that segment's words.
function segments(command: string): { cmd: string, args: string[] }[] {
  return command
    .split(/\|\||&&|[;&|\n()]|\$\(|`/)
    .map(segment => segment.trim().split(/\s+/).filter(Boolean))
    .map(words => {
      while (words.length && (/^\w+=/.test(words[0]) || WRAPPERS.has(words[0]))) words.shift()
      return { cmd: (words[0] ?? '').split('/').pop() ?? '', args: words.slice(1) }
    })
    .filter(({ cmd }) => cmd)
}

export function sensitiveShellAsk(command: string, inHomelab: boolean): string | null {
  for (const { cmd, args } of segments(command)) {
    if (DUMPERS.has(cmd) && args.some(isEnvFile)) {
      return `${cmd} on a .env file prints or sends its secrets. Run it only if Joe asked for exactly this.`
    }
    if (inHomelab) continue
    if (cmd === 'ssh' || cmd === 'scp' || cmd === 'rsync') {
      return `${cmd} reaches another machine (the homelab, a NAS). Outside the homelab repo it asks first.`
    }
    if ((cmd === 'tofu' || cmd === 'terraform') && args.some(arg => /^(apply|destroy|import|state|taint)$/.test(arg))) {
      return `${cmd} ${args.find(arg => /^(apply|destroy|import|state|taint)$/.test(arg))} changes live infrastructure. Outside the homelab repo it asks first.`
    }
  }
  return null
}

export function envReadDenial(path: string): string | null {
  if (!isEnvFile(path)) return null
  return 'Reading a .env file puts its secrets in the conversation. Check which keys exist with `grep -c "^NAME=" .env`, or let the script that needs them load it.'
}

export const RUN_IT = 'Run it'

export function registerSensitiveShell(on: On) {
  // tool.call, not classic.PreToolUse: Claude Code's built-in security plugin answers
  // PreToolUse first and skips later hooks, so an ask there never fired. Here the
  // guard asks Joe itself, and refuses when no one answers (dismissed, or a -p run).
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    const reason = sensitiveShellAsk(e.command, isHomelabRepo(await $.session.cwd()))
    if (!reason) return next(e)
    let answer: string
    try {
      answer = await $.ui.ask(`${reason} Run \`${e.command.slice(0, 160)}\`?`, {
        header: 'Shell check',
        options: [RUN_IT, "Don't run it"],
      })
    } catch {
      return { deny: `${reason} No one approved it, so it didn't run.` }
    }
    return answer === RUN_IT ? next(e) : { deny: `Joe said no: ${reason}` }
  })
  on('tool.call', { tool: 'Read' }, async ($, e, next) => {
    const denial = envReadDenial(e.file_path)
    return denial ? { deny: denial } : next(e)
  })
}
