import type { On } from 'claude-code'

// Joe (2026-11-13): when a task is finished, clean up everything (worktrees, temp files,
// tabs, background jobs), then end on the open yes/no question when something needs him (2026-11-25), else
// an "Anything else:" line that tells him what else is worth doing, never a question asking him
// (2026-11-27: "it's supposed to be for you to tell me if there's anything else"), including the
// follow-ups he didn't think to ask for. So a main-loop turn that changed something gets
// one follow-up prompt with this checklist when its turn ends (open-outputs' turn.complete).

// A Bash command that changes things, beyond reading: commits, pushes, deploys, file surgery.
export const isChangeCommand = (command: string) =>
  /\bgit\b(\s+-C\s+\S+)*\s+(commit|push|worktree\s+add)\b|\b(make\s+deploy|tofu\s+apply|ansible-playbook|ha_git\.sh\s+commit|scp|rsync|mkdir|mktemp)\b/.test(command)

export const finishNote =
  'Before you stop (global mod, finish check: Joe 2026-11-13): this turn changed things. ' +
  '1) Clean up what you made: scratch and temp files, worktrees and branches whose work is on the remote ' +
  '(git worktree list), browser tabs you opened, background jobs still running, test data. Delete throwaway things; ' +
  'real data needs a backup or Joe\'s OK. ' +
  '2) Make sure the change is deployed, committed and pushed, and anything you restarted is back up. ' +
  '3) End your reply with the open yes/no question if something needs Joe; otherwise with an "Anything else:" line ' +
  'that TELLS Joe what else is worth doing (never ask him "Anything else?"): follow-ups he may not think to ask for ' +
  '(the same bug elsewhere, a test, monitoring, docs or knowledge to update, a risk). Do the ones that are clearly ' +
  'part of the task; offer the rest once. If none, write "Anything else: nothing from me." ' +
  'If this reply already did all of this, just stop.'

let changed = false
export const resetFinishCheck = () => { changed = false }

// The one turn.complete hook lives in open-outputs.ts; it asks this.
export function takeFinishNote(): string | undefined {
  if (!changed) return undefined
  changed = false
  return finishNote
}

export function registerFinishCheck(on: On) {
  on('tool.call', { tool: ['Edit', 'Write', 'NotebookEdit', 'EnterWorktree', 'Bash'] }, async ($, e, next) => {
    const ran = await next(e)
    if (e.agentId || ran.isError || ran.deny !== undefined) return ran
    if (e.tool !== 'Bash' || isChangeCommand((e as { command: string }).command)) changed = true
    return ran
  })
}
