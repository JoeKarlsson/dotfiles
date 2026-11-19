---
type: Runbook
title: "Building a site: idea to launch"
description: "Read first when Joe asks for a new site, page or redesign: the six steps in order (brief, research from the idea banks, HTML mockups, Joe's approval, build, every check), which concept or skill each step uses, and the two gates (nothing gets built before Joe approves a mockup; nothing ships before every reviewer and skill has run and its findings are fixed)"
tags: [web, design, workflow, mockups, launch, review]
sources: [{resource: "Joe, 2026-11-19: 'do some mock-ups based on the idea, do some research from some of our ideas, and then once approved, then go through and generate it. And then the final step is to run all of our checks that we have on them, all those skills'"}]
generated: {by: claude-code, at: "2026-11-19T11:00:00-06:00"}
stale_after: "2027-11-19T00:00:00-06:00"
---

# Building a site: idea to launch

Every new site, page or redesign goes through these steps in order. Each step points to the concept that holds its rules; this page is only the order and the gates. Small fixes to a live page skip to step 5 and run only the checks for what changed.

## 1. Brief

Write the five-line brief and pick the direction and the page's job: [web-design-no-ai-slop.md](/web-design-no-ai-slop.md), "First: the goal". Write down the obvious pick and move off it ([creative-defaults.md](/creative-defaults.md)). In a repo, read its `DECISIONS.md` first; Joe's earlier verdicts stand.

## 2. Research

Look for ideas before drawing anything, and keep only what fits the brief:

- **Sites with the same job:** 3 to 5 real independent sites that do what this one does (book, subscribe, attend...). Note where the action sits, the category's own sections and how the page ends.
- **Joe's references:** the clean-site references and the punk references in [web-design-no-ai-slop.md](/web-design-no-ai-slop.md), and the registry of his sites, so the new one looks different from its neighbors.
- **Idea banks:** palettes and type pairings in `design-library/`; motion and hero effects from motion.dev and brik.space ([web-motion.md](/web-motion.md), "Reference sites"); charts from bklit.com ([chart-ideas.md](/chart-ideas.md)); widgets from [ui-component-libraries.md](/ui-component-libraries.md).
- **The subject itself:** its history, its objects and its words, if the brief names a concept.

The result is a short list of ideas, each with its source and one line on why it fits this brief. It goes on the first mockup page, not in the chat.

## 3. Mockups

Turn the research into 2 or 3 directions that are different in kind, built as one local HTML page and opened in Joe's browser: [mockups.md](/mockups.md). Show the brief and the ideas list at the top, real copy (run through the `humanizer` skill), a recommendation, and the live version first when it's a redesign. Before showing it, screenshot it at desktop and phone width and scan it against the banned list.

## 4. Approval (gate)

Joe picks by label. Record each verdict in the repo's `DECISIONS.md` (and in the web design rule's registry or punk section when it's about his taste) as he gives it. Iterate on the same page until he approves one. **Nothing gets built before he does.** "Looks fine" on one part is not approval for the whole page; ask.

## 5. Build

Build the approved mockup, not a reinterpretation of it. Follow [modern-web-guidance.md](/modern-web-guidance.md) for the HTML, CSS and JS, [web-motion.md](/web-motion.md) for any motion, [ux-laws.md](/ux-laws.md) for layout and forms, and [project-readmes.md](/project-readmes.md) for the README. Write the tests from the launch checklist's "Tests" section as you go, not at the end. If the build has to drift from the mockup, show Joe the difference before moving on.

## 6. Every check (gate)

Run all of them on the built site (and on the live URL once deployed, for the ones that need it). The reviewer agents are read-only, so start them together in one message:

| Check | What it covers |
|---|---|
| `design-reviewer` agent | UX laws, the banned slop patterns, phone, 320px, 2560px |
| `motion-reviewer` agent | the 36 motion rules, reduced motion (skip if the site has no motion) |
| `web-standards-reviewer` agent, full mode | HTML, CSS, accessibility, performance, security headers, native widgets |
| `security-reviewer` agent | secrets, XSS, headers, exposed files; the `security-audit` skill (quick profile) before first launch or once it has a backend |
| `agent-readiness-reviewer` agent | AI crawlers, AI search and browser agents (live URL) |
| `seo-audit` skill | technical and on-page SEO |
| `schema` skill | JSON-LD that fits the page type |
| `ai-seo` skill | being cited in AI answers (content sites only) |
| `humanizer` skill | every word of page copy, plus the banned phrases |
| The site's own tests | e2e, axe, metadata, links, visual, phones, big screens |
| [site-launch-checklist.md](/site-launch-checklist.md) | everything else, each item reported pass, fail, not tested or doesn't apply |

Fix every High and Medium finding, turn the measurable ones into tests, and rerun the reviewers that found them until they come back clean. Low findings get fixed when cheap, else listed for Joe.

Then show Joe the built result (`open` it, or the preview URL) before it goes live, with a short report: which checks ran, what they found, what was fixed, and anything not tested and why. After launch, finish the checklist's "Search, analytics and indexing" and "After launch" steps.
