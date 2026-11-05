---
type: Rule
title: "Web design: banned AI-slop patterns"
description: "Read before designing or styling any website, web page, HTML artifact, landing page, dashboard or UI: 28 banned AI-design tells (pills, Instrument Serif, eyebrows, ALL CAPS subtitles, gradients, gradient text, squircles, bordered cards, glassmorphism, glows, indigo accents, scroll animations, mono overuse, periods in titles...) and what to do instead"
tags: [design, web, css, frontend, artifacts]
sources: [{resource: "Joe, 2026-11-04: '20 AI Design Slop Indicators' list"}]
generated: {by: claude-code, at: "2026-11-04T21:30:00-06:00"}
stale_after: "2027-11-04T00:00:00-06:00"
---

# Web design: banned AI-slop patterns

Applies to every site, page, HTML artifact and UI I ask for, and overrides any design skill or template default that says otherwise. These patterns mark a page as AI-made. Don't use them. If a page you're editing already has them, remove them in the same change.

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
| 21 | **Indigo/violet accent**: Tailwind's `#6366f1` family and its purple neighbors | Pick an accent that fits the subject; one accent color. |
| 22 | **Glassmorphism**: frosted `backdrop-filter: blur` panels | Opaque surfaces. |
| 23 | **Glows and shadows everywhere**: shadows on every card, glowing borders, hover lift | No shadows by default; at most one subtle shadow for things that truly float (menus, dialogs). |
| 24 | **Gradient text**: gradient-filled headlines (`background-clip: text`) | Solid text color. |
| 25 | **Decorative emoji and sparkle icons**: ✨🚀 in headings, bullets, buttons | No emoji in UI chrome. Icons only where they aid recognition. |
| 26 | **Scroll animations**: fade-in or slide-up on every section | Content is just there. Motion only for state changes the user caused. |
| 27 | **Inter or the system stack as an unchosen default** | Choose a typeface on purpose for the page's subject and tone. |
| 28 | **Low-contrast gray text**: light gray body copy | Body text meets WCAG AA (4.5:1) at minimum; aim for near-black on light, near-white on dark. |

## Checking a page

Before calling a page done, scan it against the table: look at the rendered page, and grep the CSS and markup for `letter-spacing: -`, `text-transform: uppercase`, `gradient`, `opacity`, `rgba(`, `border:` on containers, `border-radius` above 8px, `monospace`/mono families outside `code`/`pre`, `Instrument Serif`, `Inter`, `#6366f1`/`indigo`/`violet`, `backdrop-filter`, `box-shadow`, `background-clip: text`, scroll-triggered animation (`IntersectionObserver`, `data-aos`), emoji in markup, and headings ending in `.`. Check body text contrast.
