---
type: Runbook
title: "Mockups: HTML pages, opened in Joe's browser"
description: "Read before showing Joe any mockup, design option, redesign or visual comparison (sites, pages, emails, dashboards, TV or launcher themes, MagicMirror, anything visual): build it as a local HTML page, never only PNGs; options side by side labeled A/B/C next to the current version, with a recommendation; `open` it in his default browser every round before asking for a verdict"
tags: [design, mockups, visual-work]
sources: [{resource: "~/.claude/CLAUDE.md"}]
generated: {by: claude-code, at: "2026-11-13T10:00:00-06:00"}
stale_after: "2027-05-12T00:00:00-06:00"
---

# Mockups: HTML pages, opened in Joe's browser

Joe, 2026-11-13: "I want you to make HTML pages showing mock-ups, not just PNGs. And you always need to open them up for me by default browser."

## Build

- **One local HTML page per round**, at `~/mockups/<project>-<topic>/index.html`. Inline CSS, the real fonts, images and copy, no lorem ipsum.
- **Each option is real HTML and CSS**, so hover, focus, motion and phone-width reflow are part of what Joe judges. A PNG goes on the page only for what HTML can't show (a photo of the device, a screenshot of the live site).
- **Not a web thing? Still HTML.** A TV launcher theme, an email, an e-ink or MagicMirror screen is drawn at its real pixel size inside a frame, scaled to fit.
- **The page itself is plain**: a short title, then the options. Design rules for the mockup's content are in [web-design-no-ai-slop.md](/web-design-no-ai-slop.md).

## Lay it out

- **"Now" first**: a screenshot of the live version, so every option is judged against it (memory `feedback-visual-work-compare-to-live-reference`).
- **Options side by side** (stacked on a phone), labeled **A, B, C**, each with one line on what differs.
- **Mark the recommended one** and say why in a sentence.
- Next round updates the same page: drop the rejected options, keep the pick, add the new variations.

## Show it

- **`open ~/mockups/<project>-<topic>/index.html`** as the last step of every round, before asking for a verdict. That opens his default browser. Not a published Artifact, not only a screenshot in the chat, not the Chrome automation tab.
- Screenshot it yourself first and fix what's off; Joe is not the QA step.
- Ask for the verdict by label ("A, B or C?"). Record each verdict in the repo's `DECISIONS.md` the moment he gives it.
