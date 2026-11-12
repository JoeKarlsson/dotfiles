<!-- chezmoi deploys this as a copy, not a symlink, because Cowork skips a symlinked
     ~/.claude/CLAUDE.md. Edit ~/dotfiles/home/dot_claude/private_CLAUDE.md, then run
     `chezmoi apply ~/.claude/CLAUDE.md`. Block HTML comments are stripped from context.
     Only rules that apply in every repo on every machine and that Claude can't work out
     itself belong here. Tool- or file-type-specific rules go in that tool's skill;
     situational ones in ~/.claude/knowledge/; zero-exception rules in a hook
     (~/dotfiles/claude-mods/global: commit format, parallel sessions, keystrokes, Word). -->
# Global instructions

## Testing

- Run the change once and confirm it works before calling it done. Don't ask me to check what you can check.
- Scale testing to risk: the changed area's tests, not the whole suite.
- Check once; don't confirm the same thing several ways.
- Report briefly what you ran. Text-only edits need no test run.
- New logic with a branch, loop, parser, money or security leaves one small test behind.

## Code design

- Build only what was asked: no speculative options or abstractions.
- Before writing new code, reuse in this order: what the codebase already has, the standard library or a platform feature, an installed dependency. Never add a dependency for a few lines.
- Bug fix: find every caller of the function you touch, then fix the root cause once in the shared code.
- Don't hide failures: no swallowed errors or silent fallbacks.
- Extract a helper at the third copy, not before.
- Delete what your change made dead, in the same change.
- Descriptive names (`waitUntilObjectIsSaved`, not `wait`).

## Working with me

<!-- Condensed 2026-11-12 from feedback memories that lived only in the homelab project, while
     the repeat complaints came from the other repos. Hooks enforce opening outputs, humanizing
     GitHub comments, no keychain and no Mac schedulers (global mod). -->
- Don't ask before tests, routine updates or the obvious next step of what I asked. When something truly needs me, end with one yes/no question naming the exact action.
- Offer an optional extra once. If I don't answer it, the answer is no.
- Every ask stands on its own: what you found, the exact question, your recommendation. Label every image or option you show me (before/after, A/B).
- Visual work: show me mockups or the result (opened on my screen) before it goes live. My verdicts on a design stand: when a repo has a `DECISIONS.md`, read it first and add each new verdict the moment I give it.
- Writing for me: lead with what it is and why the reader should care. Cut implementation detail that doesn't serve them. Text in quotation marks must match its source exactly; otherwise paraphrase. Run the humanizer on every text I could paste, every revision.
- What I tell you in confidence (family, friends, work politics) is context, never copy.
- Stay in this session's repo. Work in another repo or system only when I ask; say so first.

## Git

- Fetch before making changes.
- Ship by repo owner (`git remote get-url origin`):
  - Mine (`github.com/JoeKarlsson/*`): commit to main and push without being asked. PRs only when I ask, as drafts.
  - Anyone else's: never push to main; push a branch and open a draft PR.
  - No remote: commit only.

Situational rules (incl. web design, UX laws and the site launch checklist: read before building or shipping any page or UI): `~/.claude/knowledge/index.md`.
