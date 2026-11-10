---
type: Concept
description: "Read before adding any transition or animation to a website, web app or HTML artifact: 20 timing, easing and choreography rules for UI motion (ease-out entrances, 150-250ms dropdowns, 30ms staggers, press scale, origin-aware popovers, shorter exits, no bounce on everyday UI...), plus how they bend on Joe's own sites"
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
12. **Exit to the trigger.** Closing reverses into the same origin.
13. **No bounce on everyday UI.** Overshoot springs are for playful moments, not menus, forms or modals.
14. **Don't tween while held.** While a pointer is dragging, the element follows 1:1 with no transition; animate only on release.
15. **Make exits ~20% shorter than entrances.** The visitor has already decided; don't make them wait.

## State changes

16. **Overlap old and new states.** Start the incoming state before the outgoing one finishes, so there's never an empty frame.
17. **Masks for reveals and color changes.** Wipe with `clip-path` or a mask instead of fading whole blocks.
18. **Crossfade icons with blur.** Swapping icons (menu to close, copy to check): crossfade with a slight scale and 2-4px blur.
19. **Rubber band past bounds.** Dragging past the end resists with diminishing movement, then springs back.
20. **Reuse the same layout ID.** One element moving between two places should be the same element (View Transitions `view-transition-name`, Framer `layoutId`), not a fade-out and fade-in.

## Always

- Every transition is off under `prefers-reduced-motion: reduce` (an instant state change, or opacity only).
- Animate `transform`, `opacity`, `clip-path` and `filter` only. Never `width`, `height`, `top` or `left` (grid `0fr`/`1fr` rows are the exception for expanding sections).

## Patterns that worked

- **Crossfade by stacking, not swapping.** Put both states (icons, labels, +/–) in one grid cell (`display: inline-grid; > * { grid-area: 1/1 }`) and fade one out as the other fades in, keyed off `aria-expanded`, `aria-pressed`, `[open]` or a data attribute. Changing `textContent` or toggling `display` can never crossfade. It also stops the button changing width.
- **Height to `auto`:** `::details-content` or `[hidden]` with `interpolate-size: allow-keywords`, `display` / `content-visibility` `allow-discrete` and `@starting-style`. Gate it with `@supports (interpolate-size: allow-keywords)` so browsers that can't animate it don't get the `overflow: clip` for nothing. Keep padding and margins *inside* the clipped part, or they snap in when the height lands.
- **Shared element into a dialog:** a same-document View Transition with one `view-transition-name` moved from the source to the enlarged copy inside the update callback; the 0.95 scale-from-origin is the fallback.
- **Reduced-motion overrides need matching specificity**, or they silently lose. Measure, don't assume.
- **Progress bars** use `scale` on a full-width bar with `transform-origin: left`, never `width`.

## On my own sites

joekarlsson.com and my art sites are cut-paper and stop-motion, not polished app UI. There:

- Ambient and hero motion comes from the paper kit (boil on `steps()`, crayon redraws, tape), not these easing rules. Stepped timing beats smooth easing for anything decorative.
- Hover reactions can have personality. The nav's sticker peel uses a deliberate overshoot; #13 still applies to dialogs, menus, forms and the lightbox.
- #4 is already done as the sticker squash (`scale(1.06, 0.88)`); don't add a second press effect.
- One-time draw-ins (margin doodles, a scribble that draws once and stays) may start when scrolled into view, or I miss them. That's the only scroll-triggered motion allowed, and only for decoration that draws itself: never for fading or sliding in content.
- #5, #7, #14, #19 and #20 only matter where something is dragged or travels, like the drawing board. Skip them on plain pages.

## Review

The `motion-reviewer` agent (`~/.claude/agents/motion-reviewer.md`) checks a site or page against these rules, measuring real timings in Chromium and WebKit when it can. Run it after adding or changing UI motion.
