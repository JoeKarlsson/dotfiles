---
type: Rule
title: "Web design: banned AI-slop patterns"
description: "Read before designing or styling any website, web page, HTML artifact, landing page, dashboard or UI: 20 banned AI-design tells (pills, Instrument Serif, eyebrows, ALL CAPS subtitles, gradients, squircles, bordered cards, mono overuse, section numbers, periods in titles...) and what to do instead"
tags: [design, web, css, frontend, artifacts]
sources: [{resource: "Joe, 2026-11-04: '20 AI Design Slop Indicators' list"}]
generated: {by: claude-code, at: "2026-11-04T21:30:00-06:00"}
stale_after: "2027-11-04T00:00:00-06:00"
---

# Web design: banned AI-slop patterns

Applies to every site, page, HTML artifact and UI I ask for, and overrides any design skill or template default that says otherwise. These 20 patterns mark a page as AI-made. Don't use them. If a page you're editing already has them, remove them in the same change.

The goal is plain and confident: one good typeface, real hierarchy from size and weight, generous whitespace, a small flat palette, and copy that says each thing once.

## Banned

| # | Banned | Do instead |
|---|--------|-----------|
| 1 | **Tags and pills**: rounded chips for categories, statuses, "New", tech stacks | Plain text, a comma list, or a simple label. A status can be a word in a color. |
| 2 | **Excessive italics** for emphasis or "voice" | Roman type. Italics only for titles of works and true emphasis, rarely. |
| 3 | **Instrument Serif** (and the trendy display-serif headline look it stands for) | A solid workhorse family; one family is usually enough. |
| 4 | **Negative kerning**: tight negative `letter-spacing` on headings | Default tracking (`letter-spacing: normal`). |
| 5 | **Over-the-top detailed UI**: fake windows, mock dashboards, decorative chrome | Show the real thing or nothing. Every element must do a job. |
| 6 | **Overusing dividers**: rules between every section or list item | Separate with whitespace. |
| 7 | **Color shades and opacities**: many tints of one hue, `opacity`/alpha text and fills for hierarchy | A few solid colors. Hierarchy comes from size and weight, not fading. |
| 8 | **Containers with borders**: everything in a bordered card or box | Content sits on the page. Group with spacing and headings. |
| 9 | **Overly detailed diagrams**: dense, decorative, many-node figures | A diagram only when it explains something words can't, with the fewest parts that do it. |
| 10 | **Verbose, redundant text**: intros restating the heading, subtitles restating the title, summaries of what's on screen | Say it once. Cut every line that repeats another. |
| 11 | **Code breadcrumbs**: `~/path/like/this`, `// comments`, `$ prompts`, `<tags>` used as decoration | Ordinary navigation and headings. Code formatting only for actual code. |
| 12 | **Section numbering**: "01 / Features", "§2", "[03]" | Unnumbered headings. |
| 13 | **Eyebrows**: the small kicker label above a heading | Just the heading. |
| 14 | **Dithering**: dithered/halftone images and textures | Real photos or plain images, or none. |
| 15 | **ASCII images**: ASCII art, box-drawing art, text-mode illustrations | Real images or none. |
| 16 | **Squircles**: superellipse/heavily rounded corners on cards, icons, buttons | Square corners or a small, consistent radius (2–6px). |
| 17 | **Excessive mono fonts**: monospace for labels, nav, metadata, body | Monospace only for code. |
| 18 | **ALL CAPS subtitles**: uppercase, letter-spaced labels and subheads | Sentence case. |
| 19 | **Gradient backgrounds**: gradient fills, mesh/aurora blobs, glows | Solid background colors. |
| 20 | **Periods in titles**: "Build faster." "Ship it." | No terminal period on headings, titles or buttons. |

## Checking a page

Before calling a page done, scan it against the table: look at the rendered page, and grep the CSS and markup for `letter-spacing: -`, `text-transform: uppercase`, `gradient`, `opacity`, `rgba(`, `border:` on containers, `border-radius` above 8px, `monospace`/mono families outside `code`/`pre`, `Instrument Serif`, and headings ending in `.`.
