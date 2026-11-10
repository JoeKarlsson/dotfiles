import type { EngineInterface, Register } from 'claude-code'

import { BLOG_COMMAND, registerBlogCheck } from './blog-check'
import { registerCommitFormat } from './commit-format'
import { registerDesignCheck } from './design-check'
import { registerKeystrokeGuard } from './keystroke-guard'
import { registerParallelSessions, sharedLabel } from './parallel-sessions'
import { startPrivateSync, toastLastSyncFailure } from './private-sync'
import { registerSensitiveShell } from './sensitive-shell'
import { notifyUnpushedAtEnd, registerUnpushed, unpushedLabel } from './unpushed'
import { registerWordGuard } from './word-guard'

// Guards fail open on purpose: a hook that throws is skipped, so a bug here lets
// a call through instead of blocking every call.

async function updateStatus($: EngineInterface) {
  const cwd = await $.session.cwd()
  const parts = (await Promise.all([sharedLabel($, cwd), unpushedLabel($, cwd)])).filter(Boolean)
  $.ui.status(parts.length ? parts.join(' · ') : undefined)
}

export const register: Register = on => {
  registerParallelSessions(on)
  registerCommitFormat(on)
  registerKeystrokeGuard(on)
  registerWordGuard(on)
  registerSensitiveShell(on)
  registerUnpushed(on)
  registerBlogCheck(on)
  registerDesignCheck(on)

  on('session.start', async ($, e, next) => {
    const started = await next(e)
    await $.command.register(BLOG_COMMAND)
    void updateStatus($)
    void toastLastSyncFailure($).catch(() => undefined)
    $.clock.every(30_000, () => void updateStatus($))
    return started
  })

  // The one session.end hook: features export what they do at the end.
  on('session.end', async ($, e, next) => {
    await Promise.all([notifyUnpushedAtEnd($), startPrivateSync($)])
    return next(e)
  })

  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    const ran = await next(e)
    if (/\bgit\b/.test(e.command)) void updateStatus($)
    return ran
  })
}
