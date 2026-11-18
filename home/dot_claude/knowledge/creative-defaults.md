---
type: Guide
title: "Creative defaults: name the obvious pick, then leave it"
description: "Read before pitching or choosing anything creative that's left to you (names, project or post ideas, angles, logos, thumbnails, a site's palette, type or concept, memes, slogans): write down the default first and move off it with a reason from the project; make options different in kind with one recommendation; check the new piece against my recent work so an escape doesn't become the new default; a little randomness, always tied to the project; chaotic hand-drawn marks"
tags: [design, ideas, naming, visual-work]
---

# Creative defaults

Adapted from [mankidev/antialgorithm](https://github.com/mankidev/antialgorithm) (MIT), 2026-11-17. Design rules stay in [web-design-no-ai-slop.md](/web-design-no-ai-slop.md) and writing tells in the `humanizer` skill; this covers the step before either: picking.

## 1. Name the default, then leave it

Before pitching names, ideas, post angles, a logo, a thumbnail or a site's look, write one line on the plan: "the default here is X." X is what any model or designer would hand anyone for this brief. Don't use X unless the project truly asks for it, and say why if it does.

- Move off it with something only this project has: its subject, its audience, its odd details, its constraints. A choice that could belong to any project is still the default.
- Flipping the cliche ("dark instead of bright", "minimal instead of busy") is the second most common answer, not an escape.
- Strange isn't the goal. Every choice gets a one-sentence reason that names a fact about this project. My themes have to relate to the project (the bechdel.io verdict: a joke has to tie to the subject, a logo has to mean something obvious).
- Options differ in kind, not as variations of one idea. One may be the safe one if it's labeled as such. End with one recommendation and its reason.
- If I ask for the plain or standard version, give it.

## 2. An escape that worked becomes the new default

What got away from the default last time turns into the next default when it's reused. By November 2026 joekarlsson.com, Punc and bechdel.io had all drifted into the same pink-and-black look. Pink and black is now reserved for joekarlsson.com alone (2026-11-17).

Before showing a new piece, compare its main move against the registry in [web-design-no-ai-slop.md](/web-design-no-ai-slop.md) and the last few pieces you made for me: the palette, the texture, the concept, the naming stock, the joke shape. If it shares the main move, pick a different kind of move or say why this project needs the same one. Watch for these reflexes:

- A handmade, printed or analog look picked because it reads as "not AI" rather than because the subject asks for it.
- The same palette, paper, texture or scrawl from one project to the next.
- Names all drawn from one stock of words.
- A clever frame borrowed from another domain (a form, a map, a schedule, a video store) laid over a subject it doesn't come from.

## 3. A little randomness, tied to the project

I like some chance in where a design starts, so two similar briefs don't land in the same place. When a brief leaves the look open, list four to six options for one or two axes (a making method, a color approach, a layout, a type treatment) that each fit the project, then roll with `python3 -c 'import random; print(random.choice([...]))'` rather than picking by taste (a model's own "random" pick lands in the same place every time), then keep a roll only if you can tie it to the project in one sentence. Say on the plan what was rolled and how it ties in. The roll is a starting point; the project still decides.

## 4. Chaotic hand-drawn marks

I like scrawled, chaotic hand-drawn elements (the Twombly scrawls and crayon marks in my own voice). When a piece uses them, the hand has to be in the geometry, not only a texture on top:

- No line exactly straight, no curve a clean math function; strokes swell and thin, ends overshoot.
- Repeated marks (hatching, dots, scribbles) vary in spacing, length and angle.
- Shapes sit slightly off the grid and off each other; fills miss their outlines.
- Generate the marks with a short script instead of typing coordinates, and stop at the number the eye needs (keep an SVG under about 200 KB).
- Hand-drawn marks only where the method is made by hand. A wobble on a screen, render or data look is a second default.
- The parts the page needs to work (text to read, things to press) stay whole and clear; the chaos goes around them.
