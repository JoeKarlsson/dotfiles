---
type: Concept
title: "UI component libraries"
description: "Read before hand-building an interactive widget (dialog, drawer, menu, combobox, date input, data table, command palette, toast, chat UI) or starting a React app or tool: which library to reach for (Astryx, Meta's MIT React 19 + StyleX design system), when it fits, when it doesn't (Joe's static cut-paper sites), and how to borrow its behavior without its look"
tags: [web, react, components, design-system, accessibility, frontend]
sources:
  - {resource: "https://astryx.atmeta.com/ (read 2026-11-11: beta, @astryxdesign/core v0.7.0)"}
  - {resource: "https://github.com/meta/astryx (MIT, checked via GitHub API 2026-11-11)"}
  - {resource: "Joe, 2026-11-11: 'add these into the site building checklist ... as like a library we could use'"}
generated: {by: claude-code, at: "2026-11-11T00:00:00-06:00"}
stale_after: "2027-05-11T00:00:00-06:00"
---

# UI component libraries

Hard widgets (combobox, date picker, data table, nested menu, focus-trapped dialog) are where hand-rolled code fails keyboard and screen-reader users. Reuse a tested one before writing your own.

## Astryx (Meta)

- **What:** Meta's internal design system, open-sourced (MIT). Eight years inside Meta, "13,000 apps". Still beta (`@astryxdesign/core` 0.7.0, Oct 2026), so pin the version and expect breaking changes.
- **Needs:** React 19+ and StyleX (`xstyle` prop), plus `reset.css` and `astryx.css`. Works alongside plain CSS or Tailwind. Not web components, not CSS-only.
- **Install:** `npm install @astryxdesign/core @stylexjs/stylex @astryxdesign/theme-neutral @astryxdesign/cli`; import per component (`@astryxdesign/core/Button`).
- **Agent docs:** `npx @astryxdesign/cli component <Name>` prints a component's API; the CLI also writes AGENTS.md/CLAUDE.md notes and scaffolds templates. Use it instead of guessing props. There is an MCP option too.
- **Motion:** its rules are adopted in [web-motion](/web-motion.md) #21-24 and its patterns (accelerating exits, instant-closing menus, nothing animating on load, mouse vs touch reduced motion, the 0.001 fade floor). Its spring and gesture engine (`packages/core/src/motion/` in the repo, every constant measured from iOS 26.2 UIKit) is the reference for drag-and-throw UI; its rubber band is UIKit's (constant 0.55, scaled to the view's size).
- **Themes:** neutral, butter, chocolate, gothic (dark-only), matcha, stone, y2k. Tokens in cascade layers (`reset`, `astryx-base`), so site CSS overrides them without `!important`.

### Worth reaching for

| Need | Components |
| --- | --- |
| AI chat or agent UI | `ChatLayout`, `ChatMessageList`, `ChatComposer`, `ChatToolCalls`, `useStreamingText` |
| Data-heavy tools and dashboards | `Table` + hooks (sort, filter, virtualize, sticky columns, tree rows, resize), `TreeList`, `MetadataList` |
| Forms past the basics | `Typeahead`, `Multi Selector`, `Tokenizer`, `Date Range Input`, `Rich Text Editor`, `useCombobox` |
| Overlays | `Dialog`, `AlertDialog`, `Drawer`, `BottomSheet` (snap points), `CommandPalette`, `Popover`, `HoverCard`, `Lightbox` |
| App frame | `AppShell`, `SideNav`, `TopNav`, `MobileNav`, `Toast` |
| Gestures | `usePanGesture`, `useDragToSnapPoints`, `createReorderable`, `useLongPress`, `useHotkeys`, `useFocusTrap` |

## When it fits

- A React app or tool: an internal dashboard, a demo app for a talk or CData post, a chat front end for an agent, a homelab admin page.
- Anything where the job is getting work done, not looking like Joe.

## When it doesn't

- **joekarlsson.com and Joe's other static/Astro sites.** They have no React, and adding React + StyleX for a widget or two costs a build step and JavaScript on pages that ship almost none. Its default look (rounded bordered cards, pill badges, neutral app chrome) is the generic look [the slop rules](/web-design-no-ai-slop.md) ban on his own sites.
- There, borrow the **behavior**, not the components: read the Astryx source or docs for a widget (keyboard map, ARIA roles, focus return, Escape and outside-click handling, scroll lock) and match it in the site's own markup and cut-paper style. Native first: `<dialog>`, `popover`, `<details>`, `<input type="date">` cover most cases.
- A one-page artifact: plain HTML is lighter and the Artifact CDN rules make StyleX awkward.

## Checks when you use it

- Restyle to the project's tokens or pick a theme on purpose; never ship the neutral theme on a branded page.
- Still run axe and the keyboard pass from [the launch checklist](/site-launch-checklist.md): a library's widgets are accessible only if you wire labels and roles the way its docs say.
- Check the bundle: import per component, and measure the page's JS before and after.
