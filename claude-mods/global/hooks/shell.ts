// Quote-aware shell splitting, good enough for the one-line commands an agent runs.

export function segments(command: string): string[] {
  const out: string[] = []
  let cur = ''
  let quote: string | null = null
  for (let i = 0; i < command.length; i++) {
    const c = command[i]
    if (quote) {
      if (c === '\\' && quote === '"') {
        cur += c + (command[++i] ?? '')
        continue
      }
      if (c === quote) quote = null
      cur += c
      continue
    }
    if (c === "'" || c === '"') {
      quote = c
      cur += c
      continue
    }
    if (c === '\\') {
      cur += c + (command[++i] ?? '')
      continue
    }
    const two = command.slice(i, i + 2)
    if (two === '&&' || two === '||') {
      out.push(cur)
      cur = ''
      i++
      continue
    }
    if (c === ';' || c === '|' || c === '\n' || c === '&') {
      out.push(cur)
      cur = ''
      continue
    }
    cur += c
  }
  out.push(cur)
  return out.map(s => s.trim()).filter(Boolean)
}

export function words(segment: string): string[] {
  const out: string[] = []
  let cur = ''
  let quote: string | null = null
  let has = false
  for (let i = 0; i < segment.length; i++) {
    const c = segment[i]
    if (quote) {
      if (c === quote) quote = null
      else if (c === '\\' && quote === '"' && i + 1 < segment.length) cur += segment[++i]
      else cur += c
      continue
    }
    if (c === "'" || c === '"') {
      quote = c
      has = true
      continue
    }
    if (c === '\\' && i + 1 < segment.length) {
      cur += segment[++i] ?? ''
      has = true
      continue
    }
    if (/\s/.test(c ?? '')) {
      if (has || cur) out.push(cur)
      cur = ''
      has = false
      continue
    }
    cur += c
    has = true
  }
  if (has || cur) out.push(cur)
  return out
}

// The words after `git [global options] <sub>`, or null when the segment is not that subcommand.
export function gitSubcommand(segment: string, sub: string): string[] | null {
  const w = words(segment)
  let i = w.findIndex(x => x === 'git' || x.endsWith('/git'))
  if (i < 0) return null
  i++
  while (i < w.length && w[i]?.startsWith('-')) i += ['-C', '-c', '--git-dir', '--work-tree'].includes(w[i] ?? '') ? 2 : 1
  return w[i] === sub ? w.slice(i + 1) : null
}
