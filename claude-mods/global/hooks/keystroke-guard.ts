import type { On } from 'claude-code'

// System Events `keystroke` / `key code` types into whatever app is frontmost, not
// the one the script names, and has typed into Joe's terminal. Refuse any command
// that sends them; scripts run from a file (`osascript test.scpt`) aren't seen.
const SYSTEM_EVENTS = /system events/i
const KEYS = /\b(keystroke|key code)\b/i

export function keystrokeDenial(command: string): string | null {
  if (!SYSTEM_EVENTS.test(command) || !KEYS.test(command)) return null
  return (
    'System Events keystroke/key code goes to whatever app is frontmost, not the target, and has typed ' +
    "into Joe's terminal. Use a CGEvent postToPid helper (events reach only that process), AX actions " +
    '(perform action "AXPress"/"AXIncrement"), or click the menu item instead.'
  )
}

export function registerKeystrokeGuard(on: On) {
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    const denial = keystrokeDenial(e.command)
    return denial ? { deny: denial } : next(e)
  })
}
