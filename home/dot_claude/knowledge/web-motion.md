---
type: Concept
description: "Read before adding any transition or animation to a website, web app or HTML artifact: 36 timing, easing and choreography rules for UI motion, including Disney's animation principles and the motion side of Fitts, Doherty and frequency of use (ease-out entrances, accelerating exits, 150-250ms dropdowns, 30ms staggers, press scale, origin-aware popovers, shorter exits, instant-closing menus and tooltips, nothing animating on page load, no bounce on everyday UI...), reduced motion split by mouse and touch, plus how they bend on Joe's own sites"
---
# Web motion rules

UI motion should explain a change the visitor caused, then get out of the way. These apply to every site and artifact I build. They sit under [the AI-slop rules](/web-design-no-ai-slop.md): scroll-triggered entrances stay banned (#26) no matter how good the easing is.

## Timing and easing

1. **Ease-out for entrances.** Things arriving decelerate into place (`cubic-bezier(0.22, 1, 0.36, 1)` or similar). Never `linear` for UI.
2. **Dropdowns, menus and popovers: 150-250ms.** Longer feels sluggish on something opened twenty times a visit.
3. **Stagger list rows by ~30ms.** Cap the total: past ~8 rows, the rest arrive together.
4. **Scale to 0.97 on press.** A small squash on `:active`, applied instantly (~60ms), so the button feels physical.
5. **Stretch moving knobs ~12%.** A toggle or slider thumb elongates in its direction of travel, then settles back.
6. **Stagger as details settle.** When a panel opens, its container lands first and the contents follow a beat later.
7. **Arcs for object movement.** Something travelling across the screen (an item flying to a cart) follows a curve, not a straight line.
8. **Pulse to confirm success.** A short scale or color pulse on the thing that changed (copied, saved, subscribed), once.
9. **Ease-in-out for moves.** Something already on screen that changes position accelerates and decelerates.
10. **Start popovers at 0.95.** Scale from 0.95 + opacity 0, not from 0. Nothing grows out of a dot.

## Direction and origin

11. **Enter from the trigger.** Set `transform-origin` to the button or link that opened it.
12. **Exit to the trigger.** Closing reverses into the same origin, for the things that animate out at all (#22).
13. **No bounce on everyday UI.** Overshoot springs are for playful moments, not menus, forms or modals.
14. **Don't tween while held.** While a pointer is dragging, the element follows 1:1 with no transition; animate only on release.
15. **Make exits ~20% shorter than entrances.** The visitor has already decided; don't make them wait. About 175ms against a 220ms entrance.

## Exits, page load and hover

These four come from Meta's Astryx design system (`ui-component-libraries.md`), read 2026-11-11.

21. **Exits accelerate away.** Something leaving the screen starts slowly and speeds off: `cubic-bezier(0.3, 0, 0.6, 0.6)`, never the entrance curve played backwards. A decelerating exit covers most of its distance before the eye can follow it, so it reads as a jump. Something that moves and stays (a morph back into the page, a row sliding into place) is a move, not an exit, and keeps #9 or #1. So is a closing fold or disclosure: its height is the content below moving, and an exit curve stops it at full speed, so `block-size` and `grid-template-rows` close on `ease-in-out` while the fold's opacity takes the exit curve.
22. **Small popups close at once.** Tooltips, hover cards and dropdown menus vanish with no animation: they're dismissed many times a visit as attention moves on. Only what someone closes on purpose and whose exit shows what's underneath (dialogs, the lightbox, drawers, panels) animates out.
23. **Nothing animates on first paint.** Entrance transitions run only for things that appear after the page has loaded. Watch `@starting-style`: it also fires on page load for every element already in the HTML, so gate it (and any transition on a state JavaScript sets at load) behind a marker set once the first state is styled.
24. **Hover reveals respect the pointer.** Anything a hover shows also shows on `:focus-within` (or has a keyboard toggle), applies only under `@media (hover: hover)` (a tap's sticky `:hover` holds things open), hides with opacity and position rather than `display: none` when it holds controls, and waits ~100-250ms before opening on long lists, so a pointer sweeping past doesn't open every row.

## State changes

16. **Overlap old and new states.** Start the incoming state before the outgoing one finishes, so there's never an empty frame.
17. **Masks for reveals and color changes.** Wipe with `clip-path` or a mask instead of fading whole blocks.
18. **Crossfade icons with blur.** Swapping icons (menu to close, copy to check): crossfade with a slight scale and 2-4px blur.
19. **Rubber band past bounds.** Dragging past the end resists with diminishing movement, then springs back.
20. **Reuse the same layout ID.** One element moving between two places should be the same element (View Transitions `view-transition-name`, Framer `layoutId`), not a fade-out and fade-in.

## Animation principles and UX laws

These bring Disney's animation principles and the UX laws that bear on motion into the rules, added 2026-11-13. Rules already cover some of them: #5 and #6 are squash & stretch and follow-through for knobs and panels, #1, #9 and #21 are slow in & slow out, #7 is arcs, and #2, #4, #15 and #22 are timing.

25. **Squash and stretch keeps its volume.** When something squashes on one axis it widens on the other (`scale(1.06, 0.88)`, not `scale(1, 0.88)`), and it returns to exactly 1. Use it only on things that feel like objects (buttons, stickers, knobs), never on text blocks, images or layout.
26. **Anticipate with hover and focus.** Before a click, the hover or focus state hints at what the click will do: a card lifts, an arrow nudges toward where the link goes, a drawer handle shifts the way it opens. A real wind-up (a 2-4% move the opposite way, 60ms or less, before the main move) is only for large or playful moves like a lightbox or something thrown across the screen. Never on menus, presses or forms, where it only adds delay.
27. **Stage one thing at a time.** When something moves, nothing else on screen competes with it. The thing that moves is the thing the visitor caused or needs to look at next. Two unrelated animations at once, or ambient motion right next to the control the visitor just used, splits their attention.
28. **Pose to pose: design both ends.** Every animation runs between two designed states that each look right held still (closed and open, before and after), and the browser does the in-betweens. Motion can be interrupted: a transition reversed halfway goes back from where it is, never jumping to an end state first. Prefer CSS transitions (which retarget) over keyframe animations for anything a visitor can toggle quickly.
29. **Follow through by lagging, not bouncing.** When something stops, its loose parts (shadow, label, contents, badge) settle 30-60ms after the main body, inside the same total duration. On everyday UI that lag is the follow-through; overshoot stays banned (#13).
30. **Secondary action supports the main one.** A smaller motion can back up the main one: a shadow deepens as a card lifts, an icon nudges as its button presses, a count ticks as an item lands. It's smaller, starts with or after the main motion and ends no later. If you'd notice it on its own, it's competing (#27), not supporting.
31. **Keep depth consistent.** Things that lift get a bigger, softer shadow and a slight scale up together; things that sink do the reverse. Every shadow falls the same way, from one light source. No 3D flips, rotations or perspective tilts on everyday UI.
32. **Exaggerate only the payoff.** Big scales, long travel and strong squash belong to the one moment that matters (a success, a reveal, the end of a game). Everyday UI stays small: scales between 0.95 and 1.05, moves of a few pixels.
33. **Motion has one character.** Every UI transition uses the same motion tokens (see Patterns), so the site moves like one thing. A library default (everything fades up 20px) is a finding on a site with its own look.
34. **The more often it's used, the less it animates.** Something used constantly (keyboard shortcuts, a command palette, typing, a nav used on every visit, toggles flipped in a row) changes instantly or close to it. Rare moments (a first success, a one-time reveal) can take longer and do more. #2 and #22 are this rule applied to menus and popups.
35. **Don't move a target while someone aims at it (Fitts).** A hover effect never shifts or shrinks the thing under the pointer: a hover lift keeps the original hit area (animate an inner layer or a pseudo-element, or pad the hit area). Elements can be clicked while they animate in, with no `pointer-events: none` waiting for an entrance to finish. Nothing jumps into the spot a visitor is about to tap.
36. **Respond inside the Doherty threshold.** Visible feedback starts within ~100ms of a press or keystroke, and no animation holds back the result: from input to usable state stays under ~400ms. Anything slower shows progress right away instead of a long animation covering the wait.

## Always

- Under `prefers-reduced-motion: reduce`, a mouse gets instant state changes. A finger (`and (pointer: coarse)`) gets an opacity-only fade of 200ms or less for things that appear or go, since a change that just happens under a thumb reads as a glitch: nothing moves, scales or grows, and anything that changes size or place lands while it's transparent. #22 still holds: menus close at once.
- Animate `transform`, `opacity`, `clip-path` and `filter` only. Never `width`, `height`, `top` or `left` (grid `0fr`/`1fr` rows are the exception for expanding sections).

## Patterns that worked

- **Crossfade by stacking, not swapping.** Put both states (icons, labels, +/–) in one grid cell (`display: inline-grid; > * { grid-area: 1/1 }`) and fade one out as the other fades in, keyed off `aria-expanded`, `aria-pressed`, `[open]` or a data attribute. Changing `textContent` or toggling `display` can never crossfade. It also stops the button changing width.
- **Height to `auto`:** `::details-content` or `[hidden]` with `interpolate-size: allow-keywords`, `display` / `content-visibility` `allow-discrete` and `@starting-style`. Gate it with `@supports (interpolate-size: allow-keywords)` so browsers that can't animate it don't get the `overflow: clip` for nothing. Keep padding and margins *inside* the clipped part, or they snap in when the height lands.
- **Shared element into a dialog:** a same-document View Transition with one `view-transition-name` moved from the source to the enlarged copy inside the update callback; the 0.95 scale-from-origin is the fallback.
- **Reduced-motion overrides need matching specificity**, or they silently lose. Measure, don't assume. Override with `transition-duration: 0s`, not `transition: none`: `none` also drops `transition-delay`, so a hover rest (#24) is lost and a passing pointer flashes rows open.
- **Progress bars** use `scale` on a full-width bar with `transform-origin: left`, never `width`.
- **Motion tokens:** `--ease-enter`, `--ease-exit`, `--duration-enter` (~220ms), `--duration-exit` (~175ms) on `:root`, used by every UI transition, so one edit retimes the site. Decorative paper motion keeps its own timing.
- **Fade in from 0.001, not 0** (`--fade-from`): Chromium skips drawing a layer that starts its animation at exactly 0, so the first frames come up empty. 0.001 changes no pixel. Use it in `@starting-style` and entrance keyframes; closed states stay at 0.
- **A dialog's `::backdrop` is rebuilt on every `showModal()`.** Set its starting style in CSS (`@starting-style`) or right after `showModal()` in the same task; anything set before lands on the old backdrop.
- **Gate on-load state with a ready marker:** after JavaScript sets a component's first state (folds closed, menus shut), force one style read (`element.getBoundingClientRect()`) and then set a `data-*-ready` attribute; put the transitions and `@starting-style` behind it. joekarlsson.com's Talks and Uses folds grew from zero height on every load until 2026-11-11. Where a marker is overkill (one button's remembered state, a bar shown because the scroll was restored), finish them right after setting the state: `el.getAnimations().forEach((a) => a.finish())`, on the elements themselves, never a subtree that may hold looping animations (`finish()` throws on an infinite one). Keep margins that change with the state (a `data-collapsed:mb-*` variant, a margin that collapses through only while the body is `display: none`) out of folds, or the content below jumps at both ends.

## On my own sites

joekarlsson.com and my art sites are cut-paper and stop-motion, not polished app UI. There:

- Ambient and hero motion comes from the paper kit (boil on `steps()`, crayon redraws, tape), not these easing rules. Stepped timing beats smooth easing for anything decorative.
- Hover reactions can have personality. The nav's sticker peel uses a deliberate overshoot; #13 still applies to dialogs, menus, forms and the lightbox.
- #4 is already done as the sticker squash (`scale(1.06, 0.88)`); don't add a second press effect.
- One-time draw-ins (margin doodles, a scribble that draws once and stays) may start when scrolled into view, or I miss them. That's the only scroll-triggered motion allowed, and only for decoration that draws itself: never for fading or sliding in content.
- #5, #7, #14, #19 and #20 only matter where something is dragged or travels, like the drawing board. Skip them on plain pages.
- #25 is already done as the sticker squash. Wind-ups (#26) and exaggeration (#32) fit the paper kit and the games. The stepped boil and crayon redraws are the site's character (#33), not library defaults; they're ambient, so #27 only asks that they don't sit right next to the control a visitor is using.

## Review

The `motion-reviewer` agent (`~/.claude/agents/motion-reviewer.md`) checks a site or page against these rules, measuring real timings in Chromium and WebKit when it can. Run it after adding or changing UI motion.
