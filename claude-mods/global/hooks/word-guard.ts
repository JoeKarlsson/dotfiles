import type { EngineInterface, On } from 'claude-code'

import { segments, words } from './shell'

// Global CLAUDE.md, "Editing Word documents": a document open in Word must not
// be written on disk. Word (and OneDrive) silently replace the file with their
// copy and AutoSave over it (2026-09-25: edits that passed every check vanished).

const DOC = /\.(docx|docm|doc|dotx)$/i
const READERS = new Set(['ls', 'stat', 'cat', 'file', 'md5', 'shasum', 'mdls', 'open', 'osascript', 'unzip', 'qlmanage', 'du', 'head', 'tail', 'grep', 'strings', 'xxd', 'xattr', 'echo', 'test', 'find'])
const RUNNERS = /^(python3?(\.\d+)?|node|bash|sh|zsh|uv|uvx|ruby|bun|npx)$/
const READ_SCRIPT = /unpack|read|validate|inspect|extract|thumbnail|dump|list|to_?(md|text|markdown)/i
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

async function openDocuments($: EngineInterface): Promise<string[]> {
  const running = await $.process.run(['/usr/bin/pgrep', '-x', 'Microsoft Word'])
  if (running.exitCode !== 0) return []
  const out = await $.process.run(
    [
      '/usr/bin/osascript',
      '-e', 'tell application "Microsoft Word" to set n to name of every document',
      '-e', 'set AppleScript\'s text item delimiters to linefeed',
      '-e', 'return n as text',
    ],
    { timeoutMs: 5000 },
  )
  return out.exitCode === 0 ? out.stdout.split('\n').map(s => s.trim()).filter(s => DOC.test(s)) : []
}

const denial = (name: string) =>
  `${name} is open in Word. A file written on disk now gets replaced when Word or OneDrive saves its own copy ` +
  `(the 2026-09-25 loss). Make the change through Word itself (AppleScript or do Visual Basic) so Word is ` +
  `the writer, or ask Joe whether to close it first, every time (global CLAUDE.md, "Editing Word documents").`

export function registerWordGuard(on: On) {
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    if (!/\.(docx|docm|doc|dotx)\b/i.test(e.command)) return next(e)
    const open = (await openDocuments($)).find(name => writesDoc(e.command, name))
    return open ? { deny: denial(open) } : next(e)
  })

  on('tool.call', { tool: ['Edit', 'Write'] }, async ($, e, next) => {
    const name = e.file_path.split('/').pop() ?? ''
    if (!DOC.test(name)) return next(e)
    return (await openDocuments($)).includes(name) ? { deny: denial(name) } : next(e)
  })
}
