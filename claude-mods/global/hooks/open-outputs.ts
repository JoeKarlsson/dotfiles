import type { EngineInterface, On, PromptSubmitInput } from 'claude-code'

import { takeFinishNote } from './finish-check'
import { takeSubagentNote } from './verification'

// Memory `feedback-open-outputs-for-joe`: open any page, image, video or doc made
// for Joe before calling it done. It lived only in the homelab project's memory, and
// "open it again" / "you didn't open it" came up 41 times in a month of sessions
// (2026-10-13 to 2026-11-12), most in other repos. So: when the main loop wrote or
// edited such a file and the turn ends without opening anything, a follow-up
// prompt names the paths to open.

const DOCS = /\.(html?|pdf|docx|xlsx|pptx)$/i
const MEDIA = /\.(png|jpe?g|gif|webp|svg|mp4|mov|webm|m4a|mp3|wav)$/i
// Source trees: a page or asset written there is code, seen through a dev server or deploy.
const SOURCE = /\/(node_modules|dist|build|src|public|components|assets|static|tests?|fixtures|\.claude|\.git)\//
// Places files go for Joe to look at.
const HANDOFF = /\/(Downloads|Desktop|Movies|drafts)\/|^\/(private\/)?tmp\//
const SCRATCH_SKIP = /\/(tool-results|memory)\//

export function isViewableOutput(path: string): boolean {
  if (SCRATCH_SKIP.test(path)) return false
  if (DOCS.test(path)) return !SOURCE.test(path) || HANDOFF.test(path)
  if (MEDIA.test(path)) return HANDOFF.test(path)
  if (/\.md$/i.test(path)) return /\/(Downloads|Desktop|drafts\/social|drafts\/newsletter)\//.test(path)
  return false
}

// A shell command that shows Joe something: open (Finder, a browser, VS Code), code, cursor, qlmanage.
export const isOpenCommand = (command: string) => /(^|[\s;&|(])(open|code|cursor|qlmanage)\s/.test(command)

const OPENING_TOOLS = /^(Artifact|mcp__claude-in-chrome__(navigate|tabs_create_mcp))$/

let pending: string[] = []
export const resetOpenOutputs = () => { pending = [] }

export const openNote = (paths: string[]) =>
  `Before you stop (global mod, memory feedback-open-outputs-for-joe): you made ${paths.length > 1 ? 'these' : 'this'} for Joe ` +
  `and didn't open ${paths.length > 1 ? 'them' : 'it'}: ${paths.slice(0, 5).join(', ')}. ` +
  'Open it now (`open <path>`, or `code <path>` for text Joe reviews), then finish. If it truly is not for Joe to see, say so in one line.'

export function registerOpenOutputs(on: On) {
  on('tool.call', { tool: ['Write', 'Edit'] }, async ($, e, next) => {
    const ran = await next(e)
    if (!e.agentId && !ran.isError && ran.deny === undefined && isViewableOutput(e.file_path) && !pending.includes(e.file_path)) {
      pending.push(e.file_path)
    }
    return ran
  })

  on('tool.call', async ($, e, next) => {
    const ran = await next(e)
    if (e.agentId || ran.isError) return ran
    if (OPENING_TOOLS.test(e.tool) || (e.tool === 'Bash' && isOpenCommand((e as { command: string }).command))) pending = []
    return ran
  })
}

// turn.complete + a follow-up prompt, not classic.Stop: Claude Code's built-in security
// plugin answers Stop first and skipped the old Stop hook in every session until 2026-11-24.
let followingUp = false
let followUpNotes: string[] = []
// All Joe sees of the follow-up: the checklist itself filled his screen after every turn (2026-11-27).
export const followUpLabel = 'Finish check (global mod)'

// The follow-up's checklist rides as context: the model reads it, the chat shows one line.
// Called from the mod's one prompt.submit hook (marketing.ts).
export function takeFollowUpContext(e: PromptSubmitInput): string[] {
  if (!followUpNotes.length || e.origin?.kind !== 'plugin') return []
  const notes = followUpNotes
  followUpNotes = []
  return notes
}

// Called from register.ts's one turn.complete hook, for each main-loop turn's end.
export async function followUpAtTurnEnd($: EngineInterface, reason: string) {
  const wasFollowUp = followingUp
  followingUp = false
  // The follow-up's own turn ends without another one, as stop_hook_active did.
  if (wasFollowUp || reason !== 'answer') return
  const notes = [pending.length ? openNote(pending) : undefined, takeSubagentNote(), takeFinishNote()].filter((n): n is string => !!n)
  pending = []
  if (!notes.length) return
  followingUp = true
  followUpNotes = notes
  await $.prompt.submit({ text: followUpLabel })
}
