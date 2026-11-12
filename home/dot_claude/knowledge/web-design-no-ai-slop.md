---
type: Rule
title: "Web design: banned AI-slop patterns, and what Joe likes"
description: "Read before designing or styling any website, web page, HTML artifact, landing page, dashboard or UI: 31 banned AI-design tells (pills, Instrument Serif, eyebrows, ALL CAPS subtitles, gradients, gradient text, bordered cards, glassmorphism, glows, indigo accents, scroll animations, mono overuse, periods in titles, cream and terracotta, arrows on links...) and what to do instead; when a concept may break them; the goal-first brief and direction table, the palette and type library, the registry of Joe's sites, and the pink punk direction for his own sites"
tags: [design, web, css, frontend, artifacts]
sources: [{resource: "Joe, 2026-11-04: '20 AI Design Slop Indicators' list"}, {resource: "anthropics/skills frontend-design, adopted by Joe 2026-11-12 (#29-33, plan check, interface text)"}]
generated: {by: claude-code, at: "2026-11-04T21:30:00-06:00"}
stale_after: "2027-11-04T00:00:00-06:00"
---

# Web design: banned AI-slop patterns

Applies to every site, page, HTML artifact and UI I ask for, and overrides any design skill or template default that says otherwise. These patterns mark a page as AI-made. Don't use them. If a page you're editing already has them, remove them in the same change.

The goal is a page with one idea behind it, and the idea comes from what the site is for. When there's no idea yet, the fallback is plain and confident: one good typeface, real hierarchy from size and weight, generous whitespace, a small flat palette, and copy that says each thing once.

## First: the goal, then the direction, then the style

My pink-and-black punk look is one direction, for things that are plainly me. It is not the default. By November 2026 joekarlsson.com, Punc and bechdel.io had all drifted into the same pink-and-black look, and I want sites that look made for their own job (2026-11-12). So no color or font gets picked until the site's goal is written down.

### 1. Write the brief (five lines, on the plan, shown to me with the first mockups)

1. **Goal:** what the site has to get done, in one sentence: get a film checked, get someone to subscribe, sell a ticket, be an art piece, show my work to a hiring manager.
2. **Reader:** who arrives, from where, and what they already know.
3. **The one action** they should take.
4. **The subject's own concept,** if it has one, taken from the subject itself (a film checker's subject is films and feminist film theory, not me). Write "none" when there isn't one. A plain site is fine.
5. **Neighbors:** which of my sites it sits beside (the registry below), and how it will look different from them.

If I can't answer line 1, question it with me before designing anything: what the site is for decides everything after it.

### 2. Pick the direction from the goal

The kind of page still matters: a text document reads like a well-set document (one readable face, ~65-character lines, almost no decoration); a rich document gets its richness from real figures and tables, not chrome; a dashboard loads the `dataviz` skill and color encodes data, not mood. Within that, the goal picks the direction:

| Goal | Direction | Start from (palette families on the board) | Type |
|---|---|---|---|
| Reading and reference: docs, a runbook, a long explainer | **Plain document.** Almost no decoration; the words and figures carry it | Light and plain; Quiet, for photo-led pages | One text serif or one sober grotesk |
| A tool or data product: a checker, a tracker, a calculator, a dashboard | **Clear instrument.** Neutral ground, one accent that means "act" or marks data; real charts | Neutral plus one accent; Light and plain; Dark grounds | A sober grotesk with good figures |
| Professional profile, talks, anything an employer or client reads | **Clean site** (references below). One big confident face, white space, real photos | Light and plain; Neutral plus one accent | One grotesk, two weights |
| An art project, a community or an event | **Concept from the subject** (gig flyer, record sleeve, zine, field guide), with the concept exception | Flat and loud; One big color field; Two colors only | A poster or display face plus a readable text face |
| Things that are plainly me: joekarlsson.com, hello.joekarlsson.io, my homelab pages | **My own voice:** the pink-and-black punk below | Black and hot pink only | Anton plus the site's text face |

A site can mix, say a clear instrument with one concept touch. Name the direction on the plan right under the brief. Company work follows the company brand.

### 3. Pick the style inside the direction

- **Palettes and type come from the library,** not from memory: `~/.claude/knowledge/design-library/` holds taste-skill's 64 palettes and 38 type pairings (MIT). Render the board with `python3 ~/.claude/knowledge/design-library/board.py ~/.claude/knowledge/design-library <scratchpad>/board.html`, then show me three palettes and two pairings that fit the direction, numbered, as mockups of the actual first screen. Follow each palette's note: it says how much of the page each color gets. Ignore the library's `tracking` values (ban #4) and its Instrument Serif pairing (ban #3).
- **Pink is reserved for my own voice.** Another site gets pink only when its subject calls for it, and then not on black.
- **Differ from the neighbors:** a new site uses a palette family and a display face that no site in the registry uses, unless it is part of joekarlsson.com.
- **Check the plan against the brief before building.** Ask whether a similar brief would have produced the same palette, type and layout. If it would, that part is a default, not a choice: revise it and say what changed and why.
- **A palette or face I reject gets cut from the library** and noted here, so it isn't offered again.

### Registry: my sites and their looks

Update this whenever a site's look changes.

| Site | Goal | Direction | Palette | Display face |
|---|---|---|---|---|
| joekarlsson.com | My work, writing and newsletter | My own voice | Black, hot pink (~#ff4fd8) | Anton |
| hello.joekarlsson.io | Link-in-bio | My own voice | Black, hot pink | Anton |
| Punc | Art project on public-domain books | Concept: punk band posters | Pink and black, dithered | Anton, Fraunces |
| bechdel.io | Check whether a film passes the Bechdel test | Leaving the video store; due a direction from its goal (a clear instrument with real charts fits) | Pink and black. Pink stays: it suits a feminist site, and the black stays too, an exception to the not-on-black rule (2026-11-12) | Anton, Fraunces |

When the kind, the goal or the direction isn't obvious, ask me.

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
| 16 | *Retired 2026-11-06: rounded corners are fine, any radius.* | |
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
| 28 | **Low-contrast gray text**: light gray body copy | Body text meets WCAG AA (4.5:1) at minimum; aim for near-black on light, near-white on dark. |
| 29 | **Cream and terracotta**: a warm cream ground (near `#F4F1EA`) with a high-contrast serif and a clay accent (near `#D97757`, Claude's own accent) | A palette from the library that fits the direction. |
| 30 | **Arrows appended to links and buttons**: "Read more →" | The label alone; it already says where it goes. |
| 31 | **Middle-dot meta strings**: "Nov 12 · 6 min read · Homelab" | Show only the meta the reader uses, in a plain sentence or separate lines. |
| 32 | **One acid accent on near-black**: acid green or vermilion on `#0B0B0B`/`#111` (my own voice's hot pink on black is the exception) | A palette from the library; true black when the design wants black. |
| 33 | **Broadsheet by default**: hairline rules, zero radius and dense newspaper columns with no newspaper reason | Use it only as a named concept (below). |

## Exception: a named concept

A page built around one clear concept that comes from its subject may use a banned pattern when the concept calls for it. Example: a music-scene site styled as a photocopied gig flyer can use halftone photos (#14), ALL CAPS poster type (#18) and rules between listings (#6). Name the concept and the patterns it unlocks before designing, and tell me. Decoration with no concept behind it is still slop. Never unlocked: gradients (#19, #24), glassmorphism (#22), glows (#23), indigo/violet (#21), decorative emoji (#25), scroll animations (#26).

## My own voice: the pink-and-black punk direction

For sites that are plainly me (joekarlsson.com, hello.joekarlsson.io, homelab pages), plus the verdicts I've given on my sites so far. Other sites pick their direction from their goal (above). From this list they keep only what holds everywhere: a concept from the subject, real photos and type over commissioned-looking illustration, handmade over slick, no tidy template grids. Work sites follow the company brand instead.

Keep this section current: whenever I react to a design, reference site or mockup (like it, dislike it, or a specific part), record it here with the date in the same session, and commit it.

- **One concept, pushed all the way, taken from my life.** A video-store look (rental cards, shelf tags, staff picks, VHS spines) is a favorite for anything about films and my Letterboxd reviews.
- **Dark mode first** for concept pages. A normal, clean site (below) may be light.
- **Loud color, pinks first:** hot pink, magenta, bubblegum, with tangerine as the second loud color. Dark, moody maroon/oxblood palettes fell flat (2026-11-04 mockup).
- **Punk and handmade:** cut-and-paste, tape, stickers, stamps, imperfect edges, things that look made by a person. Halftone works as hot pink duotone on my own photos and video (the joekarlsson.com mock-ups); a black-and-white xerox halftone of a film poster didn't (2026-11-04). Otherwise real photos go up as they are, taped or collaged.
- **Cy Twombly:** scrawled, gestural marks and handwriting over big quiet fields, and running over photos and across sections. I like these scrawls; use them generously. Use my own scanned handwriting or hand-drawn SVG strokes; never generate fake handwriting.
- **Rothko:** large stacked fields of loud color (hot pink over tangerine, say) on a near-black ground, with soft, uneven brushed edges, for heroes and section breaks. Use a real painted or scanned texture, not a CSS gradient.
- **Lean into the punk on art projects:** for the Punc site (2026-11-05) I asked for more punk than "clean and literary": ransom-note cut-out headline, taped and tilted book-jacket covers, Anton poster type with Fraunces for the literary side. Then (same day) I asked for the book covers as punk band posters: dithered hot pink and black, high contrast. Pink two-tone dithering is wanted on posters like these; it's the black-and-white xerox halftone that didn't work.
- **Not the old-web homepage look** (Melon Land style: dashed boxes, pixel fonts, 88x31 buttons, three busy columns). A mockup of it didn't work for me (2026-11-04).
- **Playful, alive motion:** "vibrancy" means motion with personality, like self-drawing crayon scribbles and text that warbles (line-boil) on hover, not more content or widgets. Hover-warbled links on joekarlsson.com landed well (2026-11-05). For the end-of-page "keep exploring" block, a self-drawing crayon arrow pointing from the heading to the one next link was the favorite of six heading animations (2026-11-05); the reused footer echo and nav-repeating link rows did not work.
- **Link-in-bio page (hello.joekarlsson.io, 2026-11-05):** picked a poster header (the name in Anton over a big, sharp, pink-dithered clip of me; a zoomed-in phone crop and an undithered clip both bothered me) over the homepage-stack and name-wall layouts. Cut the ticker and the tape. Links as huge Anton all-caps rows with a logo beside each, not an icon row. Post covers stay as they are on Instagram (no filter, no badges). A short bio that fits two lines, first sentence in pink. A slim footer, not the full site footer. Never my employer in a personal bio.
- **Photos need words and one look:** a wall of seven unlabeled clips in mixed halftones and shapes read as sloppy (2026-11-05). The fix I picked was a captioned strip: four clips, one flat pink-and-black photocopy look, one 4:5 shape, tape, a numbered caption linking each to its project. Spreading clips beside their sections was the runner-up.
- **/uses as marked-up photos (2026-11-05):** of five /uses layouts (big list, marked-up photos, liner notes, video store, zine) I picked real room photos with numbered crayon pins keyed to the list, where hovering either circles the gear. Photos you have to read detail in stay crystal clear: a smooth pink duotone is fine, halftone dots are not. I wanted more scribbles across the page, and no "the rack in the attic" style location captions.
- **bechdel.io redesign (2026-11-06):** of three directions (video store, Punc-style gig poster, plain scorecard) I picked the video store: the shelf of tape boxes, and the home page stating the question and the three rules right at the top. Keep the site's own name (bechdel.io), not a store name ("Bechdel Video" was out). "Be kind, rewind" was fun but a joke has to tie to the subject (feminist film theory), not just the concept. For the film page I liked the gig-poster version's giant pink-duotone hero image, but not re-explaining the rules there (too much preamble), and I want the data shown as real charts, not stripped down to sentences. Later the same day (logo round, 10 marks): the site is moving away from the video store, so tape, spine, rental-sticker and return-stamp marks are out. The tape favicon's three windows didn't read as the three rules, and a mark built from a motif the site doesn't use anywhere else is confusing. A logo has to mean something obvious and show up on the site itself.
- **Blog thumbnails for work posts (joekarlsson.com, 2026-11-06):** rejected text cards (poster titles, big words, key lines, paper cut-outs) and employer logos as "thin"; picked pictures: the post's own memes (not its diagrams: diagram thumbnails looked off in the feed), else a public-domain photo as a metaphor (a star fort for attack surfaces, a demolition for a deprecation), varied between pink halftone, flat pink and taped-on prints. Everything gets the pink grade, taped prints and memes included: real-color prints clashed with the feed (2026-11-06). Plain app screenshots are lame; big series part numbers were disliked.
- **A little subconscious and dreamlike:** odd juxtapositions and surprises, not tidy grids.
- **Doable without being an illustrator.** I'm not a visual artist: build it from real photos (as they are, cropped, collaged), type, color, texture scans and code, not commissioned-looking illustration.

References:
- **The joekarlsson.com redesign mock-ups** (mock-k and mock-l, built in that repo's session, 2026-11-04): the model for my own site. Black ground and one hot pink (about #ff4fd8); pink-duotone photos and video of me; huge Anton ALL CAPS lists for projects and blog topics; marquee tickers; crayon-textured scrawls that redraw themselves; a "make a mark" board visitors draw on; a tilted collage of photos; a warped poster footer. Motion is welcome when it's ambient or on hover, never scroll-triggered.
- [carrierescene.ca/evenements](https://carrierescene.ca/evenements): the model. A gig-flyer concept from the subject: halftone backstage photos, one loud color (hot pink on black), condensed poster type, a warped wordmark, a marquee ticker, and a plain readable event list underneath. All of it is photos, a font, one color and CSS. Take the concept-from-the-subject idea and the loud pink from it.

## The clean site direction: references

Not every page needs a concept. For the clean site direction (professional pages), I like the clean, confident look of these (2026-11-04). For my own site they're too plain: a light, Kalkbrenner-style joekarlsson.com mockup looked bad to me (2026-11-04).

- [paulkalkbrenner.net](https://www.paulkalkbrenner.net/): the model. White space everywhere, big black grotesque type, a tiny photo set inline inside his name, a "now playing" music widget with a sound toggle, and large real photos.
- [mobbin.com](https://mobbin.com/): bold black headline with small app icons set inline between the words; lots of white space.
- [syntetica.co](https://www.syntetica.co/): headlines that mix a light serif with heavy sans words for emphasis ("Nylon that goes **on** and **on**"), and big close-up photos of the actual material. Skip its scroll-triggered blur-in and pill button.
- [privy.io](https://www.privy.io/): clean type and strong hierarchy. Take only that: its purple gradients, fake dashboard mockups, centered two-button hero and gray-faded headline words are all on the banned list.

What carries over: generous white space, one big confident grotesque typeface, small playful details (inline images or icons in a headline, a serif/sans mix inside one headline, a now-playing widget), and real photos instead of illustration.

## Page copy

The same rules apply to the words. Run all page copy (headings, buttons, body) through the `humanizer` skill, and avoid the phrases in my banned-phrases list (`~/.claude/projects/-Users-joekarlsson-claude-skills/memory/feedback-banned-phrases.md`).

Interface text:
- Name things by what the reader understands, not how the system is built: "notifications", not "webhook config".
- A button says exactly what happens ("Save changes", not "Submit"), and an action keeps its name through the flow: a "Publish" button leads to a "Published" toast.
- Errors say what went wrong and how to fix it, plainly, without apologizing. An empty screen says what to do next.

## Checking a page

Before calling a page done, scan it against the table: look at the rendered page, and grep the CSS and markup for `letter-spacing: -`, `text-transform: uppercase`, `gradient`, `opacity`, `rgba(`, `border:` on containers, `monospace`/mono families outside `code`/`pre`, `Instrument Serif`, `#6366f1`/`indigo`/`violet`, `backdrop-filter`, `box-shadow`, `background-clip: text`, scroll-triggered animation (`IntersectionObserver`, `data-aos`), emoji in markup, and headings ending in `.`, `#F4F1EA`/`#D97757`, `→`/`&rarr;` at the end of link text, and ` · ` meta strings. Check body text contrast. Check that CSS rules don't cancel each other out: a class selector like `.section` and an element or second class like `.cta` fighting over the same padding or margin is the usual cause of uneven spacing between sections.
