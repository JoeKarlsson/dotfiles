---
type: Rule
title: "Agent readiness: can AI agents reach, read and use a site"
description: "Read before reviewing or building any website for AI agents and AI crawlers (agent readiness, AI crawlers, robots.txt for AI, llms.txt, Markdown for agents, WebMCP, MCP, browser agents using forms): the evidence-graded standard the agent-readiness-reviewer applies, with each practice's status (ratified, platform-documented, draft, unproven), which sites it applies to, how to check it, and its primary sources. Also the popular claims the evidence doesn't support."
tags: [web, ai-agents, crawlers, robots-txt, llms-txt, markdown, webmcp, mcp, accessibility, seo]
sources:
  - {resource: "Research 2026-11-18: three passes restricted to primary sources (specs, platform docs) and independent research; key quotes re-fetched and confirmed"}
  - {resource: "Joe, 2026-11-18: research agent readiness from first- and third-party sources only, corroborate, build a reviewer for the website toolkit"}
generated: {by: claude-code, at: "2026-11-18T12:00:00-06:00"}
stale_after: "2027-05-18T00:00:00-06:00"
---
# Agent readiness

What an AI agent or AI crawler needs from a site in late 2026, graded by evidence. The `agent-readiness-reviewer` agent applies this. Refresh it when `stale_after` passes: WebMCP, AIPREF and the shared training token were all moving at the time of writing.

## Evidence rules

- Count only **primary sources** (the spec, a standards body, the AI platform's or browser's own docs) and **independent research** (peer-reviewed or academic papers, CDN telemetry, independent log studies). SEO-agency posts, GEO vendors and score-selling tools (Is Agentic, Frase, AgentReady.org, Ahrefs) are leads, never proof. AgentReady.org and the "AX is the New AEO" preprint (arXiv 2609.34951) are both Ora's own work: one startup, self-described as a standard, not peer reviewed.
- Every practice carries a status: **ratified** (RFC, W3C Rec, sitemaps.org), **platform-documented** (the vendor says so about its own product), **draft** (IETF I-D, W3C CG report, origin trial), **emerging** (convention with some adoption), **unproven** (no primary evidence it does anything).
- Grade findings by status and reach. Never fail a site for lacking a draft or emerging item.

## Tier 1: Essential, every site

**1. Main content and key facts are in the initial HTML.** Ratified practice + independent study. None of the major AI crawlers render JavaScript: GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, PerplexityBot, Meta-ExternalAgent, Bytespider, CCBot (Vercel/MERJ log study, 2024-12-17; no newer primary study found). Googlebot (and so Gemini) and Applebot do render. Google: make "important content available in textual form" (AI features page, 2025-12-10). Check: `curl -s -A GPTBot URL` and grep the stripped text for the page's key facts; load with JS off.

**2. robots.txt says what the owner means, per crawler purpose.** Ratified (RFC 9309, 2022-09) + platform-documented tokens. A crawler that matches a named group obeys only that group, and its rules are not merged with `*`, so a `User-agent: GPTBot` group must repeat any `*` rules still wanted. Groups naming the same crawler merge. A 5xx on robots.txt means "disallow all"; 4xx means "allow all". Applebot follows the Googlebot group when no group names it (Apple, 2026-09-04). The tokens split by purpose:

| Vendor | Training | Search / index | User-triggered (ignores robots.txt?) |
|---|---|---|---|
| OpenAI | GPTBot | OAI-SearchBot | ChatGPT-User ("may not apply") |
| Anthropic | ClaudeBot | Claude-SearchBot | Claude-User; Claude-Agent (hosted browser) |
| Google | Google-Extended (token only; covers Gemini training and grounding, not Search ranking) | Googlebot | Google-Agent and other user-triggered fetchers ("generally ignore") |
| Perplexity | none (doesn't train) | PerplexityBot | Perplexity-User ("generally ignores") |
| Apple | Applebot-Extended (token only) | Applebot | n/a |
| Meta | meta-externalagent | meta-webindexer | meta-externalfetcher ("may bypass") |
| Amazon | n/a | Amzn-SearchBot | Amzn-User |
| Common Crawl | CCBot | n/a | n/a |

Sources: developers.openai.com/api/docs/bots, support.claude.com/en/articles/8896518, developers.google.com/search/docs/crawling-indexing/google-common-crawlers, docs.perplexity.ai/guides/bots, support.apple.com/en-us/119829, developers.facebook.com/docs/sharing/webmasters/web-crawlers, developer.amazon.com/docs/amazonbot/amazonbot.html, commoncrawl.org/ccbot (all fetched 2026-11-18). Blocking a search token removes the site from that engine's answers; blocking a training token is a legitimate choice, not a failure. Report the stance and ask whether it's intended. A plain `User-agent: *` allow covers agent search APIs that run their own crawlers; an allowlist of named bots silently drops them.

**3. The CDN or WAF lets in what robots.txt lets in.** Platform-documented. A bot challenge or a 403 overrides any robots.txt. User-triggered fetchers can only be stopped there. Cloudflare blocks AI training crawlers by default on new domains (2026-07-01). Verify bots by published IP lists or reverse DNS, never by User-Agent alone (OpenAI gptbot.json/searchbot.json/chatgpt-user.json, Anthropic claude.com/crawling/bots.json, Perplexity, Google, Apple, Common Crawl all publish lists; Meta doesn't). Signed agents: ChatGPT agent signs with RFC 9421 HTTP Message Signatures (`Signature-Agent: "https://chatgpt.com"`); Cloudflare and Akamai verify Web Bot Auth automatically; Google is testing it for Google-Agent. The Web Bot Auth bot profile is still an IETF draft (draft-ietf-webbotauth-httpsig-protocol, 2026-10). Check: `curl` the home page with each search and user-agent token; a challenge page, a 403 or a 200 with a challenge body is a finding to confirm in the WAF log (a spoofed UA from the wrong IP may be blocked on purpose).

**4. Honest HTTP status codes.** Platform-documented (Google). A missing path returns 404, not 200 (soft 404); rate limits return 429 or 503, never 403 or a challenge page with 200. Vercel/MERJ found about 34% of ChatGPT and Claude fetches hit 404s, against 8% for Googlebot, so redirects for moved URLs matter. Check: `curl -so /dev/null -w '%{http_code}' URL/zz-random`.

**5. Visible text is the source of truth; structured data matches it.** Platform-documented (Google: structured data must match visible text and "isn't required for generative AI search"; Anthropic's browser tool reads the accessibility tree and visible text, not raw source). Tests of live fetchers disagree on whether JSON-LD survives (vendor experiments, 2025-26), so any fact only in JSON-LD, an image, a tab or a hover is at risk. Check: every fact in `application/ld+json` (name, author, dates, prices) also appears in the visible text.

**6. Semantic HTML and a clean accessibility tree.** Platform-documented by all three browser-agent vendors: Anthropic's browser-use tool works "through the accessibility tree… and through screenshots"; OpenAI says ChatGPT Atlas uses ARIA labels and roles (Publishers FAQ, quoted 2025-10-22); Google's web.dev "Build agent-friendly websites" (2026-04-01): real `<button>` and `<a>`, `<label for>`, stable layout, "Avoid transparent overlays that hide interactive elements". Independent: A11y-CUA (arXiv 2602.09310, CHI 2026) saw Claude's task success fall from 78% to 42% keyboard-only. Native HTML first; ARIA only where native can't do it (ARIA stuffing hurts screen readers and has no shown agent benefit). Check: every link, button and field has an accessible name; one `main`; one `h1`; headings in order; no clickable `div`; CLS under 0.1.

**7. No overlay between the agent and the task.** Platform-documented + independent research. Pop-ups distract agents badly: injected pop-ups were clicked 86% of the time and cut task success 47% (Zhang et al., ACL 2025, arXiv 2411.02391); BrowserArena (arXiv 2510.02418) lists pop-up removal and CAPTCHAs as consistent failure modes. Check: on first load at desktop and phone width, the main content and the primary action are reachable without dismissing anything (newsletter modal, cookie wall, interstitial).

**8. No hidden instructions to agents.** Platform-documented by Google (2025-12-08), Anthropic (2025-11-24) and OpenAI (2025-12-22): text aimed at agents in page content is treated as prompt injection and filtered or flagged. Check: grep for visually hidden or off-screen text addressed to "AI", "assistant", "LLM", "agent", "ignore previous". A site that has any is a High finding; it can get the site distrusted.

**9. Sitemap with true `lastmod`, canonical URLs, linked feed.** Ratified (sitemaps.org, RFC 6596) + platform-documented. Google uses `lastmod` only when "consistently and verifiably accurate" and ignores `priority` and `changefreq`; Bing says `lastmod` should be the content's real change time and recommends IndexNow (Bing Webmaster blog, 2025-07-31). RSS/Atom count as sitemaps for Google. Check: robots.txt has a `Sitemap:` line; `lastmod` differs between pages and isn't the build time on every URL; each page has an absolute self-canonical matching its sitemap URL; the feed is linked with `rel="alternate" type="application/rss+xml"`.

## Tier 2: Recommended, cheap and documented

**10. Markdown for agents that ask.** Emerging, platform-documented by Cloudflare (Markdown for Agents, 2026-02-12, Pro plans and up) and Vercel (docs). Serve `text/markdown` at the same URL when `Accept: text/markdown` is sent, with `Vary: Accept`; plain requests still get HTML. Measured senders (Checkly 2026-02-19, re-measured 2026-11-18): Claude Code, Cursor and OpenCode ask for Markdown; Codex, Gemini CLI, Copilot and Windsurf don't; nothing documented for ChatGPT, Perplexity or Claude.ai. Cloudflare's own post shrank from 16,180 to 3,150 tokens. Benefit is fewer tokens for coding agents, not ranking. Check: `curl -sI -H 'Accept: text/markdown' URL | grep -iE 'content-type|vary'`.

**11. Forms an agent can finish.** Platform-documented + independent research. No CAPTCHA or interactive challenge on low-risk forms (newsletter, contact): the best agent solved 40% of CAPTCHAs against 93% for humans (Open CaptchaWorld, NeurIPS 2025). Use a honeypot, rate limit or double opt-in instead (inference, not a vendor rule). Opt-ins start unchecked and button text says what happens: one dark pattern fooled agents 41% of the time (TrickyArena, arXiv 2510.18113; SusBench, arXiv 2510.11035). After submit, the page states the result in text and ties errors to fields (web.dev). Agents hand payment, sign-in and confirmation back to the user (Google, OpenAI), so the final step must be easy for a human; a double opt-in link must work without the original session. Autocomplete attributes are good practice but have no agent evidence; don't claim one.

**12. llms.txt, if the owner wants it.** Draft (llmstxt.org community proposal, 2024-09-03, revised 2026-08-10). Google: "you can ignore… unnecessary AI text files (like llms.txt)"; Search doesn't use it (AI optimization guide, 2026). Ahrefs' 2026 log data (vendor) found 97% of llms.txt files got no requests at all. Docs sites of Anthropic, OpenAI, Perplexity, Cloudflare and Vercel publish one; their main domains mostly don't. Cheap to keep, never a finding when absent, never a ranking lever. If present: 200, text/plain or text/markdown, H1 first line, links that resolve. `llms-full.txt` isn't in the spec; it's a tooling convention.

## Tier 3: Optional or emerging, never a failure

- **WebMCP declarative form tools** (`toolname`, `tooldescription`, `toolparamdescription` on a `<form>`). Draft: W3C Web Machine Learning CG report (2026-11-13, not Standards Track); Chrome origin trial (M149 onward), Edge origin trial to 2027-03-30. The API is `document.modelContext`, not `navigator.modelContext`. No agent is confirmed to consume it yet (Google said Gemini in Chrome "will soon", 2026-05-19). Unsupported browsers ignore the attributes, and the tool descriptions come from the form's `<label>` text, so good labels are the prerequisite. Suggest it only for a site's one or two highest-value forms, as an experiment.
- **AI-use preference signals**: IETF AIPREF `Content-Usage` (robots.txt line or HTTP header; drafts, vocab says it doesn't reflect consensus), Cloudflare `Content-signal` (vendor convention), a shared training opt-out token (Anthropic individual draft 2026-11-16; Google plans to support a shared control in 2027, 2026-10-30). Informational, not enforced. Mention when the owner wants a training opt-out beyond named tokens.
- **`<link rel="alternate" type="text/markdown">` and `.md` mirrors**: harmless, no evidence any agent follows them.
- **Lighthouse "Agentic Browsing" category** (experimental, Chrome 150+): useful as a second opinion if the installed Lighthouse has it; check before relying on it.

## Product and API sites only

Never recommend these to a blog, portfolio or newsletter site; a placeholder is noise.
- **MCP server** when there's an API or account features worth calling. Spec 2026-07-28. If it has auth: RFC 9728 protected resource metadata and RFC 8414 / OIDC discovery are MUSTs. Discovery: SEP-2127 server cards at `<endpoint>/server-card`, domain level delegated to the AI Catalog draft. `/.well-known/mcp/server-card.json` and `/.well-known/mcp-server` are superseded or individual drafts.
- **OpenAPI** for a public API; **A2A agent card** (`/.well-known/agent-card.json`, A2A v1.0) only if the site runs an A2A agent; **AI Catalog** (`/.well-known/ai-catalog.json`, Linux Foundation working draft, no release) only once there are several agent endpoints; **NLWeb** (single-vendor reference implementation); **ACP / UCP** agentic commerce (beta or draft) for stores only.

## Claims the evidence doesn't support

- llms.txt gets a site into ChatGPT, Google or Claude answers. No provider says so; Google says it ignores it.
- JSON-LD or schema raises AI citations, or LLM fetchers read it. Google says it isn't required; tests disagree.
- Google needs chunked content, Markdown or special markup for AI Overviews. Google says no, twice.
- All agents request Markdown. About 3 of 7 measured coding agents do.
- Agents follow `rel=alternate` Markdown links. No evidence.
- More ARIA helps agents. Native semantics does; ARIA stuffing hurts.
- WebMCP is a W3C standard or a ranking signal. It's a CG draft in origin trial.
- An agent-readiness score from a vendor scanner is a measure of anything beyond that vendor's checklist.

## Key sources

RFC 9309 (rfc-editor.org/rfc/rfc9309); Google AI optimization guide (developers.google.com/search/docs/fundamentals/ai-optimization-guide, 2026); Google AI features (developers.google.com/search/docs/appearance/ai-features, 2025-12-10); Google AI training control post (developers.google.com/search/blog/2026/10/ai-training-control); web.dev "Build agent-friendly websites" (web.dev/articles/ai-agent-site-ux, 2026-04-01); Chrome WebMCP docs (developer.chrome.com/docs/ai/webmcp, 2026-10-07); WebMCP draft (webmachinelearning.github.io/webmcp, 2026-11-13); Vercel/MERJ "The rise of the AI crawler" (vercel.com/blog/the-rise-of-the-ai-crawler, 2024-12-17); Cloudflare Markdown for Agents (blog.cloudflare.com/markdown-for-agents, 2026-02-12); Cloudflare agentic bot report (blog.cloudflare.com/agentic-internet-bot-report, 2026-07-01); Checkly content negotiation study (checklyhq.com/blog/state-of-ai-agent-content-negotation, 2026-02-19); IETF AIPREF and webbotauth document lists (datatracker.ietf.org/wg/aipref, /wg/webbotauth); OpenAI agent access (developers.openai.com/commerce/agent-access); MCP spec 2026-07-28 and SEP-2127 (modelcontextprotocol.io); A2A spec (a2a-protocol.org); Bing sitemaps in AI search (blogs.bing.com/webmaster, 2025-07-31); arXiv 2411.02391, 2510.02418, 2505.24878, 2510.18113, 2510.11035, 2602.09310, 2411.02959.
