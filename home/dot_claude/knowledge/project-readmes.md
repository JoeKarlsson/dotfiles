---
type: Concept
description: How to write the README for one of Joe's GitHub project repos (art pieces, games, web toys and tools): the artist statement adapted from the works page up top, then a normal developer README
---
# Project READMEs

A README is for someone who just landed on the repo: they want to know what the thing is, see it, and get it running. It is not a blog post and not a tour of the website.

## Order

1. `# Name`, then working badges only (build, live site, license).
2. The GIF or screenshot, alt text only. No caption, no "recorded in November 2026", no heading.
3. **The artist statement, adapted.** Take the project's statement from its works page (`intro` in joekarlsson.com's `src/data/projects.ts`) and condense it to two or three sentences that keep its idea and its strongest lines in Joe's words. Don't write new copy from posts, page text or code. If the works statement undersells the piece, fix the statement first. Tool projects with no statement get one plain sentence saying what the tool does.
4. A link line: `[Try it](<live site>) · [Read the full statement](<works page>)`.
5. A normal README: Quick start (prerequisites, clone, install, run, as copy-pasteable commands checked against package.json or the Makefile), Usage if someone runs it as a tool or library, Development (test, lint, build, how it deploys in one line), Contributing if relevant, Credits, License.

## Never in the opening

- Credits or collaborators (they go in Credits at the bottom).
- Dates, events, hackathons, game jams, history.
- Tech stack or repo contents ("a static Astro site", "this repo has").
- Limitations, what never got built, anything that undercuts the piece. Real gotchas go in Quick start or Development as plain instructions.
- Counts of talks, stars or users.

## Never anywhere

- Feature tours of the website or app, UI walkthroughs, screenshot galleries.
- Changelogs ("in 2026 I rebuilt...").

## Process

Do one README, show Joe, and only then do the rest. Run the adapted statement past the art critic (`.claude/agents/art-critic.md` in joekarlsson.com). Statement voice rules live in the humanizer's `voice-samples/README.md` ("Artist statements"); that file is for the statements themselves, this one is for READMEs.
