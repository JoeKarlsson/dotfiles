import type { EngineInterface, On } from 'claude-code'

import { segments, words } from './shell'

// The docx skill, "Editing an existing .docx": a document open in Word must not
// be written on disk. Word (and OneDrive) silently replace the file with their
// copy and AutoSave over it (2026-09-25: edits that passed every check vanished).

const DOC = /\.(docx|docm|doc|dotx)$/i
const READERS = new Set(['ls', 'stat', 'cat', 'file', 'md5', 'shasum', 'mdls', 'open', 'osascript', 'unzip', 'qlmanage', 'du', 'head', 'tail', 'grep', 'strings', 'xxd', 'xattr', 'echo', 'test', 'find'])
// `py` is the docx skill's venv wrapper (scripts/py).
const RUNNERS = /^(python3?(\.\d+)?|py|node|bash|sh|zsh|uv|uvx|ruby|bun|npx)$/
// word_guard.py closes a document through Word itself, so it never writes the file on disk.
const READ_SCRIPT = /unpack|read|validate|check|word_guard|inspect|extract|thumbnail|dump|list|to_?(md|text|markdown)/i
const WRITE_SCRIPT = /(?<!un)pack|save|write|edit|apply|fix|update|insert|replace/i

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export function mentions(segment: string, name: string): boolean {
  return segment.includes(name) || segment.includes(name.replace(/ /g, '\\ '))
}

// Whether the command could write the document `name` (the file name Word shows).
export function writesDoc(command: string, name: string): boolean {
  for (const seg of segments(command)) {
    if (!mentions(seg, name)) continue
    if (new RegExp(`>\\s*['"]?[^\\s|;&]*${escape(name)}`).test(seg)) return true
    let w = words(seg)
    while (w.length && (/^\w+=/.test(w[0] ?? '') || w[0] === 'sudo' || w[0] === 'env')) w = w.slice(1)
    const tool = w[0]?.split('/').pop() ?? ''
    if (READERS.has(tool)) continue
    if (RUNNERS.test(tool)) {
      const script = w.slice(1).find(x => /\.(py|js|mjs|ts|sh|rb)$/.test(x))?.split('/').pop() ?? ''
      if (script && READ_SCRIPT.test(script) && !WRITE_SCRIPT.test(script)) continue
    }
    if (tool === 'pandoc') {
      const out = w.findIndex(x => x === '-o' || x === '--output')
      if (out < 0 || !mentions(w[out + 1] ?? '', name)) continue
    }
    return true
  }
  return false
}

// Document names one at a time, plus window titles: Word can't name a
// Compatibility Mode document, and `name of every document` then fails outright,
// which made this guard see nothing open (found 2026-10-28). A window title is the
// bare stem, which matches more commands, never fewer.
async function openDocuments($: EngineInterface): Promise<string[]> {
  const running = await $.process.run(['/usr/bin/pgrep', '-x', 'Microsoft Word'])
  if (running.exitCode !== 0) return []
  const out = await $.process.run(
    [
      '/usr/bin/osascript',
      '-e', 'set n to {}',
      '-e', 'tell application "Microsoft Word"',
      '-e', 'repeat with i from 1 to (count documents)',
      '-e', 'try',
      '-e', 'set end of n to (name of document i) as text',
      '-e', 'end try',
      '-e', 'end repeat',
      '-e', 'repeat with i from 1 to (count windows)',
      '-e', 'try',
      '-e', 'set end of n to (name of window i) as text',
      '-e', 'end try',
      '-e', 'end repeat',
      '-e', 'end tell',
      '-e', 'set AppleScript\'s text item delimiters to linefeed',
      '-e', 'return n as text',
    ],
    { timeoutMs: 5000 },
  )
  return out.exitCode === 0 ? openNames(out.stdout) : []
}

export function openNames(osascriptOutput: string): string[] {
  const names = osascriptOutput.split('\n').map(s => s.replace(/\s+-\s+Compatibility Mode$/, '').trim()).filter(Boolean)
  return [...new Set(names)]
}

const denial = (name: string) =>
  `${name} is open in Word. A file written on disk now gets replaced when Word or OneDrive saves its own copy ` +
  `(the 2026-09-25 loss). Make the change through Word itself (AppleScript or do Visual Basic) so Word is ` +
  `the writer, or follow the docx skill: read Word's copy, then close it with word_guard.py close (Joe's standing OK, 2026-10-26).`

export function registerWordGuard(on: On) {
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    if (!/\.(docx|docm|doc|dotx)\b/i.test(e.command)) return next(e)
    const open = (await openDocuments($)).find(name => writesDoc(e.command, name))
    return open ? { deny: denial(open) } : next(e)
  })

  on('tool.call', { tool: ['Edit', 'Write'] }, async ($, e, next) => {
    const name = e.file_path.split('/').pop() ?? ''
    if (!DOC.test(name)) return next(e)
    const stem = name.replace(DOC, '')
    return (await openDocuments($)).some(open => open === name || open === stem) ? { deny: denial(name) } : next(e)
  })
}
