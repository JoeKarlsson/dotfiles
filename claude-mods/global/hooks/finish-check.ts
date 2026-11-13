import type { On } from 'claude-code'

// Joe (2026-11-13): when a task is finished, clean up everything (worktrees, temp files,
// tabs, background jobs), then ask "Anything else?" with recommendations, including the
// follow-ups he didn't think to ask for. So a main-loop turn that changed something gets
// its stop blocked once with this checklist (through open-outputs' Stop hook).

// A Bash command that changes things, beyond reading: commits, pushes, deploys, file surgery.
export const isChangeCommand = (command: string) =>
  /\bgit\b(\s+-C\s+\S+)*\s+(commit|push|worktree\s+add)\b|\b(make\s+deploy|tofu\s+apply|ansible-playbook|ha_git\.sh\s+commit|scp|rsync|mkdir|mktemp)\b/.test(command)

export const finishNote =
  'Before you stop (global mod, finish check: Joe 2026-11-13): this turn changed things. ' +
  '1) Clean up what you made: scratch and temp files, worktrees and branches whose work is on the remote ' +
  '(git worktree list), browser tabs you opened, background jobs still running, test data. Delete throwaway things; ' +
  'real data needs a backup or Joe\'s OK. ' +
  '2) Make sure the change is deployed, committed and pushed, and anything you restarted is back up. ' +
  '3) End your reply with "Anything else?" and your recommendations: follow-ups Joe may not think to ask for ' +
  '(the same bug elsewhere, a test, monitoring, docs or knowledge to update, a risk). Do the ones that are clearly ' +
  'part of the task; offer the rest once. If none, say so in one line. ' +
  'If this reply already did all of this, just stop.'

let changed = false
export const resetFinishCheck = () => { changed = false }

// The one classic.Stop hook lives in open-outputs.ts; it asks this.
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
