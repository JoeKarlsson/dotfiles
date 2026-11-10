---
type: Rule
title: "Web design: banned AI-slop patterns, and what Joe likes"
description: "Read before designing or styling any website, web page, HTML artifact, landing page, dashboard or UI: 27 banned AI-design tells (pills, Instrument Serif, eyebrows, ALL CAPS subtitles, gradients, gradient text, bordered cards, glassmorphism, glows, indigo accents, scroll animations, mono overuse, periods in titles...) and what to do instead; when a concept may break them; Joe's taste for his own sites (video store, punk, handmade, Twombly, Rothko, dark mode) with references"
tags: [design, web, css, frontend, artifacts]
sources: [{resource: "Joe, 2026-11-04: '20 AI Design Slop Indicators' list"}]
generated: {by: claude-code, at: "2026-11-04T21:30:00-06:00"}
stale_after: "2027-11-04T00:00:00-06:00"
---

# Web design: banned AI-slop patterns

Applies to every site, page, HTML artifact and UI I ask for, and overrides any design skill or template default that says otherwise. These patterns mark a page as AI-made. Don't use them. If a page you're editing already has them, remove them in the same change.

The goal is a page with one idea behind it (see "Aim for"). When there's no idea yet, the fallback is plain and confident: one good typeface, real hierarchy from size and weight, generous whitespace, a small flat palette, and copy that says each thing once.

## First: what is the page for?

Pick the kind of page from the job before any styling. The bans below apply to all of them.

- **Text document** (notes, a write-up, a runbook): reads like a well-set document. One readable face, ~65-character lines, headings and lists, almost no decoration.
- **Rich document** (a report or explainer with images, tables, callouts, maybe a chart): still a document first; richness comes from real figures and tables, not chrome.
- **Data visualization or dashboard:** clarity over personality. Load the `dataviz` skill; color encodes data, not mood; the hook's "opacity" and "border" flags can be legitimate here.
- **Clean site** (a homepage, a project or product page): the clean references in "Aim for".
- **Concept page** (something personal and expressive, like a review page): the concept direction in "Aim for", with the concept exception.

Then pick the tone, which is separate from the kind:

- **Professional** (work, talks, anything a client or employer reads): clean and restrained. Clean references, at most one accent color, no scribbles or concept tricks. Company work follows the company brand.
- **Personal and weird** (my own projects, reviews, homelab pages): loud pinks, scribbles, a concept, surprises.
- Many of my own pages sit in between: a clean base with one or two personal touches (a pink accent, a scribble, a now-playing widget).

When the kind or the tone isn't obvious, ask me.

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

## Exception: a named concept

A page built around one clear concept that comes from its subject may use a banned pattern when the concept calls for it. Example: a music-scene site styled as a photocopied gig flyer can use halftone photos (#14), ALL CAPS poster type (#18) and rules between listings (#6). Name the concept and the patterns it unlocks before designing, and tell me. Decoration with no concept behind it is still slop. Never unlocked: gradients (#19, #24), glassmorphism (#22), glows (#23), indigo/violet (#21), decorative emoji (#25), scroll animations (#26).

## Aim for (my own sites)

For my personal sites (joekarlsson.com, side projects, homelab pages). Work sites follow the company brand instead.

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

### A normal, clean site

Not every page needs a concept. For professional pages, I like the clean, confident look of these (2026-11-04). For my own site they're too plain: a light, Kalkbrenner-style joekarlsson.com mockup looked bad to me (2026-11-04).

- [paulkalkbrenner.net](https://www.paulkalkbrenner.net/): the model. White space everywhere, big black grotesque type, a tiny photo set inline inside his name, a "now playing" music widget with a sound toggle, and large real photos.
- [mobbin.com](https://mobbin.com/): bold black headline with small app icons set inline between the words; lots of white space.
- [syntetica.co](https://www.syntetica.co/): headlines that mix a light serif with heavy sans words for emphasis ("Nylon that goes **on** and **on**"), and big close-up photos of the actual material. Skip its scroll-triggered blur-in and pill button.
- [privy.io](https://www.privy.io/): clean type and strong hierarchy. Take only that: its purple gradients, fake dashboard mockups, centered two-button hero and gray-faded headline words are all on the banned list.

What carries over: generous white space, one big confident grotesque typeface, small playful details (inline images or icons in a headline, a serif/sans mix inside one headline, a now-playing widget), and real photos instead of illustration.

## Page copy

The same rules apply to the words. Run all page copy (headings, buttons, body) through the `humanizer` skill, and avoid the phrases in my banned-phrases list (`~/.claude/projects/-Users-joekarlsson-claude-skills/memory/feedback-banned-phrases.md`).

## Checking a page

Before calling a page done, scan it against the table: look at the rendered page, and grep the CSS and markup for `letter-spacing: -`, `text-transform: uppercase`, `gradient`, `opacity`, `rgba(`, `border:` on containers, `monospace`/mono families outside `code`/`pre`, `Instrument Serif`, `#6366f1`/`indigo`/`violet`, `backdrop-filter`, `box-shadow`, `background-clip: text`, scroll-triggered animation (`IntersectionObserver`, `data-aos`), emoji in markup, and headings ending in `.`. Check body text contrast.
