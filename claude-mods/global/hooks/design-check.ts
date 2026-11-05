import type { On } from 'claude-code'

// Web pages: after each write to markup or styles, the model gets the banned
// AI-design patterns it can grep for. The full list, with what to do instead and
// the ones only a look at the rendered page catches, is the knowledge rule.

const RULE = '~/.claude/knowledge/web-design-no-ai-slop.md'
const WEB = /\.(html?|css|scss|sass|less|astro|jsx|tsx|vue|svelte)$/i
const SKIP = /\/(node_modules|dist|build|vendor|\.next|\.astro)\/|\.min\.(css|js)$/

export const isWebFile = (path: string) => WEB.test(path) && !SKIP.test(path)

// Monospace in a rule for code blocks is the allowed use.
const CODE_SELECTOR = /\b(code|pre|kbd|samp)\b/

const CHECKS: [RegExp, string, ((line: string) => boolean)?][] = [
  [/\b(linear|radial|conic)-gradient\(|\bbg-(gradient|linear|radial|conic)-/, 'gradient (#19): use a solid color'],
  [/background-clip:\s*text|\bbg-clip-text\b/, 'gradient text (#24): use a solid text color'],
  [/letter-spacing:\s*-|\btracking-(tight|tighter)\b|\btracking-\[-/, 'negative letter-spacing (#4): use normal tracking'],
  [/text-transform:\s*uppercase|(^|[\s"'`])uppercase([\s"'`]|$)/, 'ALL CAPS (#18): use sentence case'],
  [/Instrument Serif/i, 'Instrument Serif (#3)'],
  [/#(6366f1|4f46e5|818cf8|8b5cf6|7c3aed|a78bfa|a855f7|9333ea)\b|\b(indigo|violet|purple)-\d{2,3}\b/i, 'indigo/violet accent (#21)'],
  [/backdrop-filter|\bbackdrop-blur/, 'glassmorphism (#22): use opaque surfaces'],
  [/box-shadow|drop-shadow|\bshadow(-(sm|md|lg|xl|2xl|inner))?\b(?![-\w])/, 'shadow/glow (#23): none, except menus and dialogs'],
  [/IntersectionObserver|data-aos|animation-timeline:\s*view|\bwhileInView\b|ScrollTrigger/, 'scroll animation (#26): content is just there'],
  [/monospace|\bfont-mono\b|(JetBrains|IBM Plex|Space|Fira|SF|Geist|Roboto) Mono|Fira Code/, 'monospace (#17): code only', line => !CODE_SELECTOR.test(line)],
  [/border-radius:\s*(9\d*|[1-9]\d+)px|border-radius:\s*(0?\.[6-9]|[1-9])\d*rem|border-radius:\s*50%|\brounded-(xl|2xl|3xl|full)\b/, 'large radius (#16 squircles, #1 pills): 2-6px or square'],
  [/\bopacity:\s*0?\.\d|rgba?\([^)]*[,/]\s*0?\.\d+\s*\)|\b(text|bg|border)-[a-z]+(-\d+)?\/\d+\b/, 'opacity/alpha color (#7): use a solid color'],
  [/dither/i, 'dithering (#14)'],
  [/[─│┌┐└┘├┤┬┴┼═║╔╗╚╝]{3,}/, 'ASCII/box-drawing art (#15)'],
  [/<h[1-6]\b[^>]*>\s*(0\d\b|§|\[\d+\])/i, 'section numbering (#12)'],
  [/<(h[1-6]|title|button)\b[^>]*>[^<]*[a-z0-9]\.\s*<\/\1>/i, 'period at the end of a title (#20)'],
  [/(?![©®™])\p{Extended_Pictographic}/u, 'emoji (#25): none in UI'],
]

export function designFindings(text: string): string[] {
  const out: string[] = []
  text.split('\n').forEach((line, i) => {
    for (const [re, what, applies] of CHECKS) {
      if (re.test(line) && (!applies || applies(line))) out.push(`L${i + 1} ${what}: ${line.trim().slice(0, 100)}`)
    }
  })
  return out
}

export function registerDesignCheck(on: On) {
  on('tool.call', { tool: ['Edit', 'Write'] }, async ($, e, next) => {
    const ran = await next(e)
    if (ran.deny !== undefined || ran.isError || !isWebFile(e.file_path)) return ran
    const findings = designFindings(await $.fs.read(e.file_path))
    if (!findings.length) return ran
    const shown = findings.slice(0, 20)
    const more = findings.length - shown.length
    const note = [
      `Design check on ${e.file_path} (global mod). These match banned AI-design patterns in ${RULE}; read it if you haven't.`,
      'Fix each one, or leave it only if it is a real exception (for example a shadow on a dialog) and say so.',
      ...shown.map(f => `  ${f}`),
      ...(more ? [`  … ${more} more`] : []),
    ].join('\n')
    return { ...ran, context: [...(ran.context ?? []), note] }
  })
}
