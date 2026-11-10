---
type: Rule
title: "Website launch checklist"
description: "Run before calling any new site or page ready to ship, and again before a redesign ships: head metadata, social cards, dark mode, security, consistency (spacing, headers, type), phones, big screens (centered column, capped grids), accessibility, performance, SEO, tests (e2e, visual, axe, coverage), analytics. Check each item on the built site, not from memory."
tags: [web, launch, seo, metadata, mobile, security, accessibility, testing, checklist]
sources:
  - {resource: "Joe, 2026-11-06: Punc review, 'you've been missing some basic stuff for getting a site ready'"}
  - {resource: "Joe, 2026-11-06: Punc on a 4K ultra-wide, 'the site looks terrible on my ultra-wide 4K monitor'; content ran edge to edge, hero covers were huge, two rows of books a page, a cramped pager"}
  - {resource: "https://github.com/thedaviddias/Front-End-Checklist"}
  - {resource: "https://web.dev/articles/vitals"}
  - {resource: "https://scotthelme.co.uk/launching-report-uri-js/ (CSP on GitHub Pages)"}
  - {resource: "https://www.w3.org/TR/WCAG22/"}
generated: {by: claude-code, at: "2026-11-06T08:30:00-06:00"}
stale_after: "2027-11-06T00:00:00-06:00"
---

# Website launch checklist

Use this for every new site, and again before a big redesign ships. Check each item against the built output (view source, fetch the files, screenshot at phone width), not from memory. Report each section as pass, fail, not tested, or doesn't apply (with the reason). Anything you can automate goes in the site's tests so it stays true after launch; see "Tests".

## Head metadata (every page)

- `<meta charset="utf-8">` and `<meta name="viewport" content="width=device-width, initial-scale=1">` first in `<head>`; `<html lang>` set
- A unique `<title>` and `<meta name="description">` per page (under ~155 characters), written for that page
- `<link rel="canonical">` with the full https URL
- `<meta name="theme-color">` matching the background (or one per scheme with `media="(prefers-color-scheme: …)"`)
- `<meta name="author">`
- No leftover `noindex` from development, unless the page should be hidden (404, drafts)

## Social sharing

- Open Graph: `og:type`, `og:site_name`, `og:url`, `og:title`, `og:description`, `og:image` (absolute URL, 1200x630), `og:image:width`, `og:image:height`, `og:image:alt`, `og:locale`
- Twitter: `twitter:card` = `summary_large_image`, title, description, image, image alt, `twitter:site` / `twitter:creator` (@joekarlsson1)
- Pages people share on their own (posts, items, books) get their own share image, not just the site-wide one. Render them from the site's own markup with Playwright, at build or by script.
- Test a real share: opengraph.xyz, the Bluesky composer, the LinkedIn Post Inspector
- Share links (Bluesky, Threads, LinkedIn, Reddit, HN, X, copy link) where the page is worth sharing
- A GitHub repo's social preview image (1280x640) when the site has a public repo

## Icons and app

- `favicon.svg` plus a 32px PNG, `apple-touch-icon.png` (180px), `site.webmanifest` with 192 and 512 icons, `theme_color` and `background_color`

## Files and URLs

- A `404.html` in the site's look, with a way back and `noindex`. It uses the same page header as every other page, not a one-off layout, and it offers the closest real page for the missed path (joekarlsson.com matches the slug by edit distance, `src/scripts/closest-post.ts`). After launch, pull the 404 paths from analytics and add a 301 for each one that a real visitor hit more than once. Test the 404 with a conditional request too (`curl -H 'If-None-Match: <etag>'` against the origin): Caddy's `handle_errors` + `rewrite * /404.html` + `file_server` answers a revalidation with a 404 and an empty body, and Cloudflare then serves that blank page (joekarlsson.com, 2026-11-10). Strip `If-None-Match` and `If-Modified-Since` inside the error handler. On a GitHub Pages project site it's served at any missing path, so set `<base href="/repo/">` or use absolute links.
- `sitemap.xml` listing every public page. `robots.txt` pointing at it, at the domain root, with only directives crawlers know (Lighthouse's SEO score drops for unknown lines, so put extras like `llms.txt` pointers in comments) (a GitHub Pages project site can't have one; submit the sitemap in Search Console instead).
- Structured data (JSON-LD) when the content is a known type: a person, article, event, book, product. Check it with Google's Rich Results Test.
- The sitemap leaves out every `noindex` page, redirect stub and tool-only page (PDF render sources, previews), and every indexable page is in it. Cross-check the two lists over the built output.
- One URL per page: http goes to https, www and bare domain go to one of them, trailing slashes are consistent, and old URLs redirect
- `curl -I` all four of `http://` and `https://` on the bare and `www` hosts. Each must end on the canonical https URL. joekarlsson.com (2026-11-06) redirected the bare domain but served `http://www.` as a plain 200, so the "http goes to https" check passed on the host that was tried and failed on the canonical one. HSTS sent over http is ignored by browsers. A browser that visited the site before upgrades http itself, so test with curl or a fresh profile, not your own browser. Behind Cloudflare, origin redirects (NPM "Force SSL", Caddy) never see the http request; turn on "Always Use HTTPS", then purge the cache, since pages already cached for http keep coming back as plain 200s until purged.
- Redirects land in one hop: an old URL goes straight to the final URL, trailing slash included, not through a second slash redirect
- Old URLs redirect with a server 301, not only a meta-refresh page
- `/.well-known/security.txt` with a contact and an `Expires` date, plus a test that fails before it lapses
- RSS or Atom for anything with posts, with `<link rel="alternate">` autodiscovery, and a validator run on it
- Cache-busting on CSS and JS (a content hash in the URL), and long `Cache-Control` on hashed assets, images and video (check the headers; video often comes back with none)

## Dark and light

- Decide: dark only, light only, or both.
- A dark-only site sets `color-scheme: only dark` in `:root` and `<meta name="color-scheme" content="only dark">`, plus `<meta name="darkreader-lock">`. Plain `dark` didn't stop iPhone browsers with their own dark mode (Firefox and Brave for iOS run on Dark Reader) from turning paper-white boxes brown and black text white, on joekarlsson.com (2026-11-05) and Punc (2026-11-06).
- A site with both themes uses `light dark` and real `prefers-color-scheme` styles, with every color from tokens redefined for each scheme
- Test with the system set to light and to dark, and with forced dark mode on (Chromium `--enable-features=WebContentsForceDark`). Emulation is not enough: open it on a real iPhone in Safari and in one browser with its own dark mode.
- Form controls, scrollbars and autofill take the right scheme
- Check images, SVGs and the favicon on both backgrounds

## Security

Static sites have a small attack surface, but these are cheap:

- HTTPS only, with "Enforce HTTPS" on (GitHub Pages) and no mixed content (every `http://` asset is a failure)
- Response headers where the host lets you set them (Netlify `_headers`, Cloudflare, Vercel): `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (deny camera, microphone, geolocation unless used), and `frame-ancestors 'none'` or `X-Frame-Options: DENY`
- GitHub Pages can't set headers. Use a CSP `<meta http-equiv>` as early in `<head>` as possible (it only covers what comes after it), plus `<meta name="referrer" content="strict-origin-when-cross-origin">`. `frame-ancestors`, `report-uri`, `X-Frame-Options` and `Permissions-Policy` don't work from a meta tag; say so rather than claiming clickjacking protection. Put a CDN or worker in front if the site needs them.
- The CSP lists the real third parties (fonts, analytics, CDNs) and nothing wider. No `unsafe-inline` for scripts when it can be avoided (move inline scripts to files, or use hashes).
- Third-party scripts and styles: pinned exact versions, with `integrity` (SRI) and `crossorigin` where the CDN supports it; as few as possible
- `target="_blank"` links carry `rel="noopener noreferrer"`
- No secrets, tokens or private URLs in the client bundle or the repo (`git grep` for keys before the first public push)
- `npm audit --omit=dev` clean for what ships; Dependabot (or Renovate) on. Open `.github/dependabot.yml` and check it names a real `package-ecosystem`: GitHub's starter template leaves it `''`, which looks like it's on and updates nothing.
- User input (search, uploads, forms, URL params) is never written into the page as HTML without escaping. Uploaded files are parsed as data and never executed. Forms post over HTTPS and are validated on the server.
- Scan the live site: Mozilla HTTP Observatory and securityheaders.com. Explain any grade that a static host keeps from being better.
- Source audit: before a site's first launch, and again after it gains a backend, form, upload or other visitor input, run the `security-audit` skill ("security audit this repo, quick profile"; "standard" once there's a backend). Reports go to `~/security-audit-skill/<repo>/run-N`, never into the repo, since most of Joe's repos are public. Fix confirmed High/Medium findings before shipping. `/security-review` covers single diffs between audits.

## Consistency

The page should look like one system: every page shares the same building blocks.

- Tokens in `:root` for colors, font families, type sizes, the gutter and a spacing scale (for example 0.25, 0.5, 1, 1.5, 2, 3, 4, 6rem). Grep the CSS for raw hex values and one-off `px`/`rem` margins outside the tokens and fold them in.
- One page header for every major page, sub-pages and the 404 included: same nav position, same page-title style, same column, and the same distance from the top of the viewport to the `h1`. A back link above the header on some pages counts as a second pattern (joekarlsson.com, 2026-11-10: Talks and Resume dropped theirs and light up their parent in the nav instead). Check it by screenshotting the top of each major page at the same viewport side by side, and by a test that measures each page's `h1` top and font size (see "Tests").
- One gutter: every page's content lines up on the same left edge at every width, including full-bleed sections that break out on purpose
- One button style, one link style, one form-field style, one caption style
- Headings use one case convention, with no terminal periods. Nav labels match the page titles they lead to.
- Vertical rhythm: the same space before every section heading and after every page title, from the spacing scale
- Fonts: only the families the design names, each in its job. Grep for `font-family` values outside the tokens.
- Run the slop scan in [web-design-no-ai-slop](web-design-no-ai-slop.md)

## Phones

- Screenshot every page type at 390px and 320px wide, full length, and look at it. Also check landscape.
- No sideways scroll (`scrollWidth === innerWidth`). Anything wider scrolls in its own frame and says so.
- Tap targets of at least 24px (WCAG 2.2), 44px for primary actions, with space between them
- Copy works for touch: "tap", not "click" or "drop" on its own; nothing that only works on hover
- Text at least 16px; form inputs at least 16px so iOS Safari doesn't zoom on focus
- Use `svh`/`dvh`, not `vh`, for screen-height layouts (iOS toolbars). Respect `env(safe-area-inset-*)` for anything fixed to an edge.
- A canvas or map with `touch-action: none` must leave page above and below it to scroll by, and the wheel only zooms with Ctrl or a pinch
- Long lists and pages: a phone shouldn't have to scroll through everything (a "show more", pagination or shorter sections)
- Anything shown only above a breakpoint (a sidebar table of contents, a filter rail, hover previews) gets a stand-in below it. joekarlsson.com hid its post contents at `xl` only, so phones and laptops under 1280px had none on a 23-minute post; it now folds into an "On this page" `<details>` above the text.
- Padding that makes a tap target big on phones often gets stripped at `md:` (`md:p-0`), leaving a 22px icon on desktop. Measure targets at every width, not just the phone one.
- Real device pass: iPhone Safari and one other browser (Chrome or Firefox), dark mode on

## Big screens

Joe works on a 4K ultra-wide. A layout that only looked right at 1280px fails there, so check the top end as hard as the phone end.

- Screenshot every page type at 2560px wide (and 1280px), and look at it. At 2560 nothing should run from screen edge to screen edge except deliberate full-bleed bands (a footer color, a background).
- One centered column for the whole site, the way joekarlsson.com does it: a `--page-max` token (about 1440px) and padding of `max(var(--gutter), calc((100% - var(--page-max)) / 2))` on the header, `main` and footer. Every page uses it, set once in the shared CSS, never per page. Background bands stay full width; their content sits in the column.
- Grids of images or cards don't stretch without limit. `repeat(auto-fit, minmax(X, 1fr))` with a handful of items blows each one up on a wide screen (four book covers became posters). Cap the column (`minmax(230px, 300px)`) or the item's `max-width`.
- Use the room: on a computer, show more per page than a phone does (Punc: 72 books a page on a computer, 24 on a phone; pick a count that divides evenly into the likely column counts).
- Pagination lists many page numbers on a computer (all of them when they fit in a row or two) with compact buttons (about 2.5rem), not "1 2 3 … 41" with huge buttons. A phone gets a few either side of the current page.
- Measure line length: body text stays under about 70ch even inside the wide column. Résumés, gear lists and section intros are where it slips (joekarlsson.com /resume/ ran 115 characters a line until capped at `max-w-[65ch]`).
- The homepage is the page most likely to skip the column: its sections get written outside the shared container. At 2560 check that the nav is still on the first screen and every section sits in the column.
- Huge display titles sized to fill a panel (`100cqw / ratio`) need a measured ratio: wide letters (W, M) overflow an estimate. Compare the title's text box to its panel at 1440 and 390.

## Accessibility

- Automated: axe (`@axe-core/playwright`, tags `wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa`) on every page type, in the e2e suite, with zero violations. Pin the axe version. It catches only about a third of problems, so the manual pass still matters.
- A skip link, landmarks (`header`, `nav`, `main`, `footer`), one `h1` per page, headings in order
- Keyboard only: every control reachable in a sensible order, visible focus, nothing trapped, and focus never hidden under a sticky header (WCAG 2.2, 2.4.11)
- Anything shown on hover is also shown on `:focus-visible` (heading `#` anchors at opacity 0 were ~30 invisible Tab stops a post). A menu closes when focus leaves it.
- Nothing transparent sits over a link: a huge display title's line box can swallow clicks on the back link above it. Hit-test the middle of each link with `elementFromPoint`.
- Run the `design-reviewer` agent (`~/.claude/agents/design-reviewer.md`) on every page type before launch: it covers the UX laws (`ux-laws.md`), the slop rules and this checklist's phone, big-screen and accessibility items with measurements, and turns up what a single-page review misses. Turn each of its measurable findings (tap targets, header position, overflow) into an e2e assertion so it stays fixed; the joekarlsson.com tap-target test caught a 42px contents link the same day it was added.
- Screen reader pass with VoiceOver on the main flow (iPhone and Mac)
- Alt text that says what the image means, `alt=""` on decoration; canvases and charts get a text description or a table
- Body text contrast at least 4.5:1, large text and UI parts at least 3:1, in every theme
- Zoom to 200% and reflow at 320px without losing content
- `prefers-reduced-motion` stops ambient animation; nothing flashes
- Form fields have labels; errors are announced; status changes use `aria-live`

## Performance

- Core Web Vitals, good at the 75th percentile of real visits: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1. All three must pass.
- Lighthouse mobile run on each page type: performance, accessibility, best practices and SEO all above 90, or a reason why not. Lighthouse is a lab test (it uses Total Blocking Time instead of INP), so treat it as a regression guard; Lighthouse CI with budgets keeps it from slipping. Run it against the live URL too, not only `staticDistDir`: the CDN, compression and cache headers only show up there.
- Desktop scores hide phone problems. joekarlsson.com scored 99 on desktop and 82 on mobile with a 4.6s LCP on the same page. Always read the mobile run.
- Read the LCP phase breakdown, not just the number. A long **render delay** with no load delay means the LCP element was downloaded but something (usually JS) kept it from painting.
- Never gate the LCP element on JS. Hiding an image or video poster (`opacity: 0`) until a script, canvas or WebGL effect redraws it pushes LCP to after the script runs, which on a phone is seconds. Paint the plain or pre-rendered version first and let the effect replace it.
- Preload the LCP image (`<link rel="preload" as="image" fetchpriority="high">`). A video poster or CSS background isn't found by the preload scanner, so it needs this most.
- Fonts: `preconnect`, `display=swap`, only the families and weights used. Preload only the files the first screen renders: for an English site that's the `latin` subset, never `latin-ext`. A family used on one page type (a serif for blog prose) loads on that page type only; a cross-origin font stylesheet in a shared `<head>` is render-blocking on every page, used or not.
- Images: sized for the slot, modern formats (AVIF/WebP) with `srcset`, `loading="lazy"` and `decoding="async"` below the fold, `width`/`height` or `aspect-ratio` set so nothing jumps. Files in `public/` skip the framework's image pipeline, so card thumbnails and video posters there ship at full size to a 390px phone; generate widths for them or move them into the pipeline. Lighthouse's "properly size images" list is the check.
- Video: autoplay loops get a phone-sized encode (`<source media="(max-width: 767px)">`), `preload="none"` below the fold, and play only while on screen. Add up the video bytes a phone pulls scrolling the page once.
- JS: only what the page needs, split per page, nothing render-blocking in `<head>` except tiny inline scripts; a size budget for the bundle. Small isn't cheap: check **execution time** in Lighthouse's "JavaScript execution time", since a 12KB script that processes every image burned 800ms of main thread on a phone.
- Scripts that touch every image or video on load (effects, measuring, canvases) work only on what's near the screen (IntersectionObserver), and batch layout reads instead of calling `getComputedStyle`/`offsetWidth` per element in a loop.
- Video posters download at page load, whatever `preload` says, even on a `display: none` video. A clip hidden on phones or far down the page keeps its still in `data-poster` and gets `poster` set by an IntersectionObserver as it nears the screen.
- Check srcset choices in a real browser at phone size and DPR 3 (Playwright `deviceScaleFactor: 3`, read `img.currentSrc`), against the built site: a dev server skips build-time image steps.
- Heavy work (big canvases, parsing) doesn't freeze taps; check INP by clicking around on a mid-range phone
- HTML weight: check the raw and gzipped size of the biggest list page. Decoration repeated per item (an inline SVG on every card) multiplies; define it once (`<symbol>` + `<use>`, or CSS) and skip hover-only decoration on touch screens (`@media (hover: hover)`), where it never shows.
- Animated SVG filters (`feTurbulence`, `feDisplacementMap`) repaint on the CPU every frame. Keep them off looping animations, or pause the loop when offscreen and under reduced motion.
- Hashed build assets (`/_astro/`, `/assets/`) get `Cache-Control: public, max-age=31536000, immutable`; HTML gets a short cache or revalidation.

## SEO and content

- One `h1` per page that says what the page is; descriptive link text (not "click here")
- Internal links between related pages; no orphan pages
- Sitemap submitted in Google Search Console (and Bing Webmaster Tools); check the coverage report a few days after launch
- Spelling and grammar checked; no placeholder text; copy run through the `humanizer` skill
- A privacy note if the site collects anything (analytics, uploads, forms)

## Tests

Automate what can drift, so the checklist stays true after launch. Run them in CI before every deploy.

- **End to end (Playwright):** one smoke test per page type (it loads, no console errors, no failed requests, nav works), and one test per interactive feature (search, filters, uploads, downloads, share buttons, zoom). Run them in a desktop project and a phone project (an iPhone in WebKit and a Pixel in Chromium).
- **Metadata:** a test over every built page (not a sample of page types) that it has a title, a description under ~160 characters, a canonical, an og:image that exists, the color-scheme and darkreader-lock metas, and exactly one `h1`; that no two indexable pages share a title or description; and that the sitemap matches the indexable pages both ways. Content pages break these one at a time: a Markdown `# ` heading in a post body adds a second `h1`, and imported posts bring 200-character descriptions.
- **Images in content:** Markdown and CMS images get `width`/`height` too, not just images from components. Unsized images in post bodies are the usual source of CLS on a blog.
- **CI runs the browser tests:** the e2e, axe and header tests run in CI, not only on a laptop. A suite that only runs locally stops running.
- **Header consistency:** a test that loads each major page at one viewport and asserts the same `h1` font size, the same `h1` top offset and the same nav position
- **Visual regression:** `toHaveScreenshot` for each page type at phone and desktop width, with animations disabled, changing content masked, a small `maxDiffPixelRatio`, and baselines from one pinned browser. Prefer element screenshots (header, a card, the footer) to whole pages, so one change fails one test.
- **Accessibility:** the axe test above
- **Links:** a link checker over the built site (lychee, or a crawl in Playwright) for broken internal and external links
- **Phones:** the no-sideways-scroll test on every page type at 390px and 320px
- **Big screens:** at 2560px, a test that every page's `main` content stays inside the centered column (no element's box left of or right of it), and visual baselines at a wide viewport for the front page
- **Unit tests** for logic with branches, loops, parsing, math or money, next to the code
- **Coverage:** measure it (`jest --coverage`, `c8`, or Playwright's JS coverage) and read the report for untested risky code rather than chasing a percentage. Every bug fix leaves a test behind.

## Analytics and monitoring

- Plausible (self-hosted, `plausible.joekarlsson.io`) with the right `data-domain`, skipped for bots; outbound links, downloads and key buttons tagged as events
- 404s show up somewhere (a Plausible event on the 404 page)
- An uptime check on the live URL for anything people rely on
- JS errors on the live site get noticed (a `window.onerror` event to analytics, or an error tracker)

## After launch

- After every push, confirm the deploy that carries your commit finished (`gh run list`), then load the live page at 2560px and phone width before saying it shipped. GitHub Pages cancels an in-progress deploy when a newer push lands, so a pushed commit may not be live yet; the user may also need a hard refresh.
- Share a real link on one network and look at the card
- Open it on a real phone, in dark mode, on cellular
- Check Search Console and analytics after a few days
