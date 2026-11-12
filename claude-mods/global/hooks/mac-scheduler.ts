import type { EngineInterface, On } from 'claude-code'

import { segments, words } from './shell'

// Joe's Macs shut off at night and are not servers: recurring work goes in a
// homelab CT through its provision (memory no-scheduled-jobs-on-mac). This was the
// homelab repo's mac-scheduler-guard.py until 2026-11-12, but the 2026-11-02 job
// ("This is my work laptop. That doesn't make any sense") was set up from cdata-skills,
// where that guard never ran. It is global now and reads command words only, quote
// aware: the Python one refused a read-only `grep` whose pattern named crontab.
// Only on a Mac (cwd under /Users); claude-dev and the CTs schedule for real.

export const REASON =
  "Mac scheduler guard (global mod): no scheduled or background jobs on Joe's Macs. They shut off at night " +
  "and are not servers. Put recurring homelab work in the service's own CT (provision.sh.tpl cron/systemd " +
  'timer + tofu apply), and tell Joe where it will run before building it.'

const WRAPPERS = new Set(['sudo', 'time', 'exec', 'nohup', 'command', 'env'])
const LAUNCHCTL_ADDS = new Set(['load', 'bootstrap', 'kickstart', 'enable', 'submit', 'start'])
const LAUNCH_DIR = /\/Library\/Launch(Agents|Daemons)\//
const PLIST_KEYS = /<key>(StartCalendarInterval|StartInterval|KeepAlive|WatchPaths)<\/key>/

const commandWords = (segment: string) => {
  const w = words(segment)
  while (w.length && (/^\w+=/.test(w[0]!) || WRAPPERS.has(w[0]!))) w.shift()
  return w
}

// What a shell line would schedule on this Mac: a reason, a brew service name to
// check for an existing LaunchAgent (restart of one already there adds no job), or null.
export function schedulerFinding(command: string): { deny: true } | { brewRestart: string } | null {
  for (const segment of segments(command)) {
    const w = commandWords(segment)
    const cmd = (w[0] ?? '').split('/').pop()
    if (cmd === 'ssh') continue // the rest of this segment runs on another machine
    if (cmd === 'launchctl' && LAUNCHCTL_ADDS.has(w[1] ?? '')) return { deny: true }
    if (cmd === 'brew' && w[1] === 'services') {
      if (w[2] === 'start' || w[2] === 'run') return { deny: true }
      if (w[2] === 'restart') return w[3] && !w[3].startsWith('-') ? { brewRestart: w[3] } : { deny: true }
    }
    if (cmd === 'crontab' && !(w.length === 2 && w[1] === '-l')) return { deny: true }
    if (LAUNCH_DIR.test(segment) && (['cp', 'mv', 'ln', 'tee', 'install', 'ditto'].includes(cmd ?? '') || />\s*\S*\/Library\/Launch(Agents|Daemons)\//.test(segment))) {
      return { deny: true }
    }
  }
  return null
}

export function plistWrite(path: string, text: string): boolean {
  return LAUNCH_DIR.test(path) || (/\.plist$/i.test(path) && PLIST_KEYS.test(text))
}

async function onMac($: EngineInterface) {
  return (await $.session.cwd()).startsWith('/Users/')
}

export function registerMacScheduler(on: On) {
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    const finding = schedulerFinding(e.command)
    if (!finding || !(await onMac($))) return next(e)
    if ('brewRestart' in finding) {
      const agents = `${await $.env.get('HOME')}/Library/LaunchAgents`
      for (const prefix of ['homebrew.mxcl', 'sh.brew']) {
        if (await $.fs.exists(`${agents}/${prefix}.${finding.brewRestart}.plist`)) return next(e)
      }
    }
    return { deny: REASON }
  })

  on('tool.call', { tool: ['Write', 'Edit'] }, async ($, e, next) => {
    const text = 'content' in e ? e.content : e.new_string
    if (plistWrite(e.file_path, text ?? '') && (await onMac($))) return { deny: REASON }
    return next(e)
  })
}
