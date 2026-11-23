---
type: Runbook
title: "Building a site: idea to launch"
description: "Read first when Joe asks for a new site, page or redesign: the eight steps in order (brief and real content, research from the idea banks, HTML mockups with the logo and social card, Joe's approval, build with a clean repo, every check, announce, retro), which concept or skill each step uses, and the two gates (nothing gets built before Joe approves a mockup; nothing ships before every reviewer and skill has run and its findings are fixed)"
tags: [web, design, workflow, mockups, launch, review]
sources: [{resource: "Joe, 2026-11-19: 'do some mock-ups based on the idea, do some research from some of our ideas, and then once approved, then go through and generate it. And then the final step is to run all of our checks that we have on them, all those skills'"}, {resource: "Joe, 2026-11-19: approved adding real content, logo and social card, repo hygiene, announce and retro steps"}]
generated: {by: claude-code, at: "2026-11-19T11:00:00-06:00"}
stale_after: "2027-11-19T00:00:00-06:00"
---

# Building a site: idea to launch

Every new site, page or redesign goes through these steps in order. Each step points to the concept that holds its rules; this page is only the order and the gates. Small fixes to a live page skip to step 5 and run only the checks for what changed.

## 1. Brief and real content

Write the five-line brief and pick the direction and the page's job: [web-design-no-ai-slop.md](/web-design-no-ai-slop.md), "First: the goal". Write down the obvious pick and move off it ([creative-defaults.md](/creative-defaults.md)). In a repo, read its `DECISIONS.md` first; Joe's earlier verdicts stand.

Ask Joe for the real content with the brief, in one list: the copy he has, photos, names, prices, dates, links and anything the page's job needs (the menu, the lineup, the archive). Mockups use it, so they don't stall on gaps or fill them with invented facts. Whatever is still missing gets marked as missing on the mockup ("Missing facts" in the web design rule), never made up.

## 2. Research

Look for ideas before drawing anything, and keep only what fits the brief:

- **Sites with the same job:** 3 to 5 real independent sites that do what this one does (book, subscribe, attend...). Note where the action sits, the category's own sections and how the page ends.
- **Joe's references:** the clean-site references and the punk references in [web-design-no-ai-slop.md](/web-design-no-ai-slop.md), and the registry of his sites, so the new one looks different from its neighbors.
- **Idea banks:** palettes and type pairings in `design-library/`; motion and hero effects from motion.dev and brik.space ([web-motion.md](/web-motion.md), "Reference sites"); charts from bklit.com ([chart-ideas.md](/chart-ideas.md)); widgets from [ui-component-libraries.md](/ui-component-libraries.md); how real apps and sites lay out a screen, flow or section from mobbin.com (same file, "Reference galleries").
- **The subject itself:** its history, its objects and its words, if the brief names a concept.

The result is a short list of ideas, each with its source and one line on why it fits this brief. It goes on the first mockup page, not in the chat.

## 3. Mockups

Turn the research into 2 or 3 directions that are different in kind, built as one local HTML page and opened in Joe's browser: [mockups.md](/mockups.md). Show the brief and the ideas list at the top, real copy (run through the `humanizer` skill), a recommendation, and the live version first when it's a redesign. Include the logo or wordmark, the favicon at 16 and 32px, and the social card (1200x630) for each direction, since these get their own verdict: a mark has to mean something obvious and appear on the site itself (the bechdel.io logo round, in the web design rule's punk section). Before showing it, screenshot it at desktop and phone width and scan it against the banned list.

## 4. Approval (gate)

Joe picks by label. Record each verdict in the repo's `DECISIONS.md` (and in the web design rule's registry or punk section when it's about his taste) as he gives it. Iterate on the same page until he approves one. **Nothing gets built before he does.** "Looks fine" on one part is not approval for the whole page; ask.

## 5. Build

Build the approved mockup, not a reinterpretation of it. Follow [modern-web-guidance.md](/modern-web-guidance.md) for the HTML, CSS and JS, [web-motion.md](/web-motion.md) for any motion, [ux-laws.md](/ux-laws.md) for layout and forms, and [project-readmes.md](/project-readmes.md) for the README. Write the tests from the launch checklist's "Tests" section as you go, not at the end.

Before the first push of a new repo (most of Joe's are public), search the files and the full history for secrets and for anything about his homelab: Plex, SABnzbd, usenet, the *arr apps, NAS paths, Proxmox, CT IDs, LAN IPs, and where media comes from. Run `gitleaks detect` over the history. Infrastructure detail belongs in claude-skills, never in a project repo; if it's already in a commit, rewrite that commit before pushing. The repo also gets its README and a license before the first push. If the build has to drift from the mockup, show Joe the difference before moving on.

## 6. Every check (gate)

Run all of them on the built site (and on the live URL once deployed, for the ones that need it). The reviewer agents are read-only, so start them together in one message:

| Check | What it covers |
|---|---|
| `design-reviewer` agent | UX laws, the banned slop patterns, phone, 320px, 2560px |
| `motion-reviewer` agent | the 36 motion rules, reduced motion (skip if the site has no motion) |
| `web-standards-reviewer` agent, full mode | HTML, CSS, accessibility, security headers, native widgets |
| `performance-reviewer` agent, full mode | Core Web Vitals on phone and desktop, WebKit crash run, page weight, caching; re-architecture calls (live URL + repo) |
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

## 7. Announce

- **Works page:** add the project to joekarlsson.com's `src/data/projects.ts` (the repo is in `~/Documents/dev/joe/`), with the same artist statement as the README.
- **Launch plan:** the `personal-marketing` skill for where and when to tell people; the `/social` skill drafts the posts. Nothing gets posted without Joe's OK on each post.

## 8. Retro

Look back at what the reviewers found. A problem found twice (on this site, or on this one and an earlier one) becomes a rule: a line in the web design rule, the motion rules or the launch checklist, or a test in the site's suite. Add Joe's verdicts on the finished site to the registry in the web design rule. Tell Joe what changed in the rules, in a line or two.
