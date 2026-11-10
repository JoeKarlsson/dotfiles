---
okf_version: "0.2"
---
# Global knowledge (all repos)

Open Knowledge Format bundle for rules that matter only in some sessions; `~/.claude/CLAUDE.md` keeps the always-on rules and points here.

## Concepts

- [Parallel sessions: one worktree each](/worktree-workflow.md): Why parallel Claude sessions in one repo need a worktree each, how to ship from one (rebase, push HEAD:main), gitignored files via .worktreeinclude, and removing it when done (ExitWorktree discard_changes rule)
- [Web design: banned AI-slop patterns](/web-design-no-ai-slop.md): Read before designing or styling any website, web page, HTML artifact, landing page, dashboard or UI: 28 banned AI-design tells (pills, Instrument Serif, eyebrows, ALL CAPS subtitles, gradients, gradient text, squircles, bordered cards, glassmorphism, glows, indigo accents, scroll animations, mono overuse, periods in titles...) and what to do instead; when a concept may break them; Joe's taste for his own sites (video store, punk, handmade, Twombly, Rothko, dark mode) with references
- [Web motion rules](/web-motion.md): Read before adding any transition or animation to a website, web app or HTML artifact: 20 timing, easing and choreography rules (ease-out entrances, 150-250ms dropdowns, 30ms staggers, press scale, origin-aware popovers, shorter exits, no bounce on everyday UI...) and how they bend on Joe's cut-paper sites
- [UX laws](/ux-laws.md): Read before designing or auditing any website, page, artifact, form or nav: 19 UX laws (Hick, Fitts, Jakob, proximity, Miller, Doherty, Von Restorff, target distance, serial position, peak-end, Zeigarnik, Pragnanz, similarity, uniform connectedness, Tesler, Postel, Parkinson, Occam, Pareto), each with what it means, how to build for it and how to check it, and how they bend on Joe's loud cut-paper sites
- [Website launch checklist](/site-launch-checklist.md): Run before calling any new site or page ready to ship: metadata, social cards, dark mode (only dark + darkreader-lock), security headers and CSP limits on GitHub Pages, consistency (tokens, spacing scale, one page header), phones, big screens (centered max-width column, capped grids, dense pagination; check at 2560px), accessibility (axe + manual), Core Web Vitals, SEO, tests (e2e, visual, header consistency, links, coverage), analytics
- [Project READMEs](/project-readmes.md): Read before writing or editing the README of any of Joe's project repos: the works-page artist statement adapted to two or three sentences under the GIF, then a normal developer README (quick start, usage, development, credits, license); no credits, dates, tech or limits in the opening, no site tours or recording captions
