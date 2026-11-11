---
type: Rule
title: "Modern web platform standards (Google's Modern Web Guidance)"
description: "Read before writing or changing any HTML, CSS or client-side JS on a website, web app or HTML artifact: look up the browser teams' guide for the feature (dialog, menu, form, images, fonts, view transitions, CSP, dark mode...) in the local copy of Google's Modern Web Guidance, follow its native-first pattern and fallbacks, and apply Joe's Baseline support policy. Also how to refresh the guides and when the web-standards-reviewer agent runs."
tags: [web, html, css, javascript, accessibility, performance, security, baseline, standards]
sources:
  - {resource: "https://github.com/GoogleChrome/modern-web-guidance"}
  - {resource: "https://developer.chrome.com/docs/modern-web-guidance"}
  - {resource: "Joe, 2026-11-11: review the site against these and make a standards reviewer agent"}
generated: {by: claude-code, at: "2026-11-11T11:00:00-06:00"}
stale_after: "2027-05-11T00:00:00-06:00"
---

# Modern web platform standards

Google's Modern Web Guidance is 208 short guides written with the Chrome, Edge, Firefox and MDN teams: the current native way to build a dialog, a menu, a form, an image priority, a CSP, a dark mode, a view transition, and the fallback for each. Models default to older patterns from their training data (a JS focus trap where `<dialog>` does it, a `max-height` hack where `interpolate-size` works). These guides are the correction, and they're the standard for every site I build.

## Where they are

A local copy, markdown only, at `~/.claude/vendor/modern-web-guidance/`:

- `INDEX.md`: every guide's path, size and one-line description, grouped by area. Grep it for the widget or feature.
- `guides/<area>/<id>.md`: the guides. Each area has a discipline guide (`accessibility`, `html`, `css`, `css-layout`, `performance`, `security`, `privacy`, `forms`, `motion`, `color`, `typography`, `dark-mode`).
- `LEGACY-RULES.md`: the 33 legacy patterns Google's scanner flags, with its rubric for real hits vs. fallbacks.

Refresh with `~/.claude/scripts/update-modern-web-guidance.sh` (add a version to pin one; it keeps the guides only, never the package's code). Run it when this file goes stale or when Google announces new guides. Google's own plugin and `npx modern-web-guidance` CLI run unpinned remote code on every lookup, so we read the files instead.

## While building

Before writing HTML, CSS or client JS for a feature, grep `INDEX.md` for it, read the matching guide (plus the area's discipline guide on first use in a session), and build what it says. Adapt the vanilla examples to the framework without dropping the native feature. When a guide shaped the code, say which one in the reply.

## Browser support policy

The guides assume Baseline Widely available needs no fallback. For my sites:

- **Widely available:** use freely.
- **Newly available:** use behind feature detection (`@supports`, `'x' in el`) when the page still works without it. No polyfill dependency; a fallback of more than about 20 lines means pick the older pattern instead.
- **Limited availability:** progressive enhancement only, never the only way something works.

A repo can override this in its `CLAUDE.md`.

## Reviews

The `web-standards-reviewer` agent (`~/.claude/agents/web-standards-reviewer.md`) checks a diff or a whole site against these guides and returns numbered findings with evidence. It complements the other two reviewers rather than repeating them: `design-reviewer` covers UX laws, slop and layout; `motion-reviewer` covers motion timing.

- **Before shipping a UI code change** (a layout, component, script, style, form, nav or new page): run it in diff mode, alongside `design-reviewer`. Fix its High and Medium findings. Plain content changes (posts, newsletter text) skip it.
- **Before a new site launches, and after each guide refresh:** run it in full mode on the built site.
- **Not on every deploy.** Deploys are mostly content and already wait on CI; an LLM review there would be slow and would rarely see a code change. What it finds that can be tested (a header, a `fetchpriority`, a focus return) becomes an e2e or unit test, so CI keeps it true.

## How it fits my own rules

Where a guide and one of my rules disagree, my rule wins on taste and the guide wins on platform mechanics. A guide can't overrule the cut-paper look, dark-only themes or the motion exceptions in [web-motion](/web-motion.md); it can and should replace a hand-rolled widget with the native element underneath that look.
