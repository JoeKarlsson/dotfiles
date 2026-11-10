---
type: Rule
title: "UX laws: what each one means and how to build for it"
description: "Read before designing or auditing any website, web page, HTML artifact, form, nav or UI: 19 UX laws (Hick, Fitts, Jakob, proximity, Miller, Doherty, Von Restorff, target distance, serial position, peak-end, Zeigarnik, Pragnanz, similarity, uniform connectedness, Tesler, Postel, Parkinson, Occam, Pareto), each with what it says, how to build for it, and how to check it; plus how they bend on Joe's own sites"
tags: [design, web, ux, frontend, artifacts, forms, navigation]
sources: [{resource: "Joe, 2026-11-10: '20 UX Laws to tell Claude for better design' list (Postel's law was listed twice, so 19 distinct)"}, {resource: "lawsofux.com"}]
generated: {by: claude-code, at: "2026-11-10T00:00:00-06:00"}
stale_after: "2027-11-10T00:00:00-06:00"
---

# UX laws

These apply to every site, page, artifact and UI I build. They're about how people find, decide and finish things, so they sit beside [the AI-slop rules](/web-design-no-ai-slop.md) (how it looks) and [the motion rules](/web-motion.md) (how it moves). When a law and a concept page disagree, the concept can win on decoration but never on finding the nav, reading the text or finishing a form.

Each law: what it says, how to build for it, how to check it.

## Choices and memory

1. **Hick's law.** Decision time grows with the number and complexity of choices.
   - Build: one primary action per screen. Keep top nav to about 5-7 items; put the rest in the footer. Long lists get search, filters or grouping instead of more buttons. Hide advanced options until asked for.
   - Check: count the clickable choices above the fold. If two buttons compete for "the main thing," demote one.

2. **Miller's law.** People hold about 7 (plus or minus 2) things in working memory.
   - Build: chunk. Phone numbers, codes and long forms come in groups; long pages get headings every screen or so; long posts get a table of contents. Never make someone remember something from a previous screen.
   - Check: any list, form or menu over ~9 flat items gets grouped. Don't use "7" as a hard cap on nav; it's about chunking, not a magic number.

3. **Jakob's law.** People spend most of their time on other sites, so they expect yours to work the same way.
   - Build: logo top-left links home, nav at the top (or a Menu button top-right on phones), search looks like a search box, links look like links, the cart/subscribe/contact live where everyone puts them. Be weird in the art, not in the controls.
   - Check: could a first-time visitor find home, nav, search and contact without thinking? Every unconventional control needs a reason.

4. **Tesler's law** (conservation of complexity). Every system has complexity that can't be removed, only moved. Move it to the code, not the visitor.
   - Build: sensible defaults, auto-detect what you can (time zone, dark mode, country from locale), prefill, accept pasted input as-is, do the sorting and formatting yourself.
   - Check: for every form field and setting, ask "could the site figure this out?" If yes, delete the field.

5. **Occam's razor.** Of two designs that both work, pick the one with fewer parts.
   - Build: remove elements until removing one more would hurt. No duplicate CTAs, no decorative labels, no copy that repeats a heading.
   - Check: delete each element in your head. If nobody would miss it, delete it for real.

6. **Pareto principle** (80/20). Most use comes from a small share of features and content.
   - Build: find the 20% from analytics (top pages, top clicks, top searches) and make those the fastest to reach. Don't give rarely used pages equal billing in the nav.
   - Check: compare the nav and homepage order against Plausible's top pages before reordering anything.

7. **Parkinson's law.** A task expands to fill the time available.
   - Build: make tasks short by design. Autofill (`autocomplete` attributes), one-field forms, show reading time on posts, cut steps from checkout/signup flows.
   - Check: time the main task (subscribe, contact, find a post). Every step that isn't needed comes out.

## Pointing and tapping

8. **Fitts's law.** Time to hit a target depends on its size and distance.
   - Build: tap targets at least 44x44px on phones (24px is the WCAG AA floor), generous padding on links and buttons, the whole card clickable rather than just its title, screen edges and corners for important controls on desktop.
   - Check: run a script over every `a`, `button` and `input` on a phone viewport and list anything under 44px tall that isn't an inline text link.

9. **Minimize target distance.** Fitts's other half: put the next action where the pointer or thumb already is.
   - Build: submit buttons right after the last field, related actions next to the thing they act on, primary phone actions in the thumb zone (bottom and right for right-handed reach), "next post" at the end of the post, not back at the top.
   - Check: trace the pointer path through the main task. Long jumps across the screen are the cue.

10. **Doherty threshold.** People stay engaged when the system responds in under ~400ms.
    - Build: static pages, small JS, preloaded fonts and hero images, instant visual feedback on every click (pressed state, spinner, optimistic update) even when the real work takes longer.
    - Check: LCP under 2.5s and INP under 200ms on a phone. Anything over 400ms needs a visible "working on it" state.

11. **Postel's law** (robustness principle). Be liberal in what you accept, conservative in what you send.
    - Build: accept phone numbers with or without dashes, emails with stray spaces, search with typos and any case; redirect old URLs instead of 404ing; output consistent, clean, predictable markup and data. Don't block a form for a format you could have fixed.
    - Check: try a messy input in every field and an old URL. The site should either accept it or say exactly what to change.

## Grouping and perception (Gestalt)

12. **Law of Prägnanz.** People read complex images in the simplest form they can.
    - Build: simple shapes, clear outlines, one obvious focal point per section. Busy art behind text turns to noise.
    - Check: squint or blur the screenshot. You should still see the main shapes and the one thing to look at.

13. **Law of proximity.** Things close together read as a group.
    - Build: space between groups clearly larger than space within them (labels sit on their fields, captions on their images, a card's title and meta touch, sections get big gaps). Use spacing before borders or boxes to group.
    - Check: any label equidistant from two fields, or a caption floating between two images, is a bug.

14. **Law of similarity.** Things that look alike read as related and as doing the same job.
    - Build: every link styled the same, every button of one type styled the same, one card style per kind of content. Something that does a different job must look different.
    - Check: inventory link and button styles across pages. Two looks for one job, or one look for two jobs, gets fixed.

15. **Law of uniform connectedness.** Things that are visually connected (shared background, enclosing line, connecting line) read as more related than things that are just near each other.
    - Build: put a filter bar and its results-count in one panel, a step indicator on one line, related controls on one shared surface. Strongest grouping cue, so use it sparingly.
    - Check: things that are connected must actually belong together; nothing unrelated shares a panel.

16. **Von Restorff effect** (isolation effect). The one thing that differs is the one people remember.
    - Build: one accent per screen, on the primary action or the most important item. If everything is pink and bold, nothing is.
    - Check: count accent-colored elements on a screen. More than one or two competing for attention dilutes it. Never rely on color alone (add weight, shape or a label) for accessibility.

## Order, memory and feelings

17. **Serial position effect.** People remember the first and last items in a series best.
    - Build: put the most important nav items first and last (home/logo first, contact or the main CTA last). On a page, the opening and closing sections carry the message; the middle carries the browsing.
    - Check: are the first and last items in the nav, the homepage and each post the ones you most want remembered?

18. **Peak-end rule.** People judge an experience by its most intense moment and its end, not the average.
    - Build: design the emotional high (the demo, the reveal, the success message) and the ending (thank-you page, end of a post, confirmation email). A form's success screen matters more than its fields. Errors are peaks too: make them kind and fixable.
    - Check: walk the main task to its last screen. If the last thing a visitor sees is a stock page, a raw JSON response or a dead end, fix that first.

19. **Zeigarnik effect.** People remember unfinished tasks better than finished ones, and want to finish them.
    - Build: progress indicators on long reads and multi-step forms, "continue reading" and "part 2 of 3" cues, saved drafts. Use it to help people finish, never to nag (no fake "profile 80% complete" pressure).
    - Check: long flows and long posts show where you are and how much is left.

## On my own sites

joekarlsson.com and my art sites are deliberately loud: cut-paper, scribbles, giant type. The laws still apply to the working parts.

- **Concept wins on decoration, laws win on controls.** Scribbles can cross the hero title (Prägnanz is bent on purpose there), but never a nav link, button, form field or body text.
- **Pink is the Von Restorff color.** Current nav item, primary button, the one accent per section. Don't add a second accent to compete.
- **Jakob's law covers the nav and forms.** The sticker nav, Menu button, search box and subscribe form stay conventional in placement and behavior even when they're styled like stickers.
- **Fitts on phones:** keep the 44px targets the header already uses; inline text links inside prose are exempt.
- **Peak-end:** every task ends somewhere designed (the end of a post, the 404, newsletter confirmation), never on a third-party default page.
