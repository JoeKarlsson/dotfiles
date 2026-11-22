---
type: Rule
title: "Web performance: fast and smooth on phones and desktops"
description: "Read before reviewing, building or re-architecting any website for speed (Core Web Vitals, LCP, INP, CLS, TTFB, page weight, images, fonts, JS, caching, compression, bfcache, prefetch and Speculation Rules, animation cost, iPhone Safari memory crashes, Lighthouse and Lighthouse CI budgets, CrUX field data): the evidence-graded standard the performance-reviewer agent applies, with each practice's status, how to measure it, and its primary source; the signals that justify a re-architecture; and the popular tips to skip."
tags: [web, performance, core-web-vitals, lcp, inp, cls, lighthouse, crux, images, fonts, caching, mobile, ios-safari]
sources:
  - {resource: "Research 2026-11-22: three passes restricted to primary sources (web.dev, developer.chrome.com, MDN and browser-compat-data, webkit.org, Mozilla, RFCs, HTTP Archive Web Almanac 2024/2025, Lighthouse and web-vitals repos, Caddy and Cloudflare docs for their own behavior); ten key claims re-fetched and confirmed"}
  - {resource: "Joe, 2026-11-22: research modern web performance from first-party sources and independent research only, build a performance reviewer for the website toolkit, with tests that keep the sites fast on desktop and mobile"}
  - {resource: "Lessons from joekarlsson.com, 2026 (moved here from the launch checklist)"}
generated: {by: claude-code, at: "2026-11-22T13:00:00-06:00"}
stale_after: "2027-05-22T00:00:00-06:00"
---
# Web performance

What makes a site fast and smooth for real visitors in late 2026, graded by evidence. The `performance-reviewer` agent applies this. Refresh it when `stale_after` passes, or sooner when soft-navigation metrics go stable in CrUX (planned May 2027).

## Evidence rules

- Count only **primary sources** (specs and RFCs, the browser teams: web.dev, developer.chrome.com, webkit.org, Mozilla, MDN and its browser-compat-data; a vendor's docs about its own product, such as Caddy or Cloudflare) and **independent research** (HTTP Archive Web Almanac, peer-reviewed studies). Perf blogs, CDN marketing and score-selling tools are leads, never proof.
- Status of each practice: **spec** (RFC, W3C/WHATWG), **browser-team guidance** (web.dev, Chrome, WebKit, Mozilla docs), **measured** (Almanac data, a published measurement), **platform-documented** (a vendor about its own product), **emerging** (shipping in one engine, draft, or experimental).
- Support follows Baseline (see [modern-web-guidance](/modern-web-guidance.md) for the policy). Safari is the engine that most often lacks a perf feature, and iPhones are where Joe's sites have crashed, so every recommendation states what Safari does.
- A number you report was measured, the way [benchmarks](/benchmarks.md) says: the real setup, several runs, the median.

## The targets

**Core Web Vitals** (stable set unchanged since INP replaced FID in 2024; stable metrics change at most once a year), judged at the **75th percentile of page loads, phone and desktop separately** (web.dev/articles/vitals):

| Metric | Good | Poor | What it is |
|---|---|---|---|
| LCP | ≤ 2.5 s | > 4 s | when the largest text or image in view paints |
| INP | ≤ 200 ms | > 500 ms | slowest interaction (one outlier dropped per 50), input to next paint |
| CLS | ≤ 0.1 | > 0.25 | largest burst of unexpected layout shift (shifts < 1 s apart, window ≤ 5 s) |

Diagnostics, not vitals: **TTFB** good ≤ 0.8 s, poor > 1.8 s ("rough guide", web.dev/articles/ttfb); **FCP** good ≤ 1.8 s, poor > 3 s; **TBT** under 200 ms on mid-range mobile in the lab.

For context, 48% of mobile sites and 56% of desktop sites pass all three (Web Almanac 2025, Performance). Median mobile TBT rose 58% in a year to 1,916 ms: phones are where sites fail.

## How to measure (and what each tool can't see)

- **Field first.** CrUX is what Google reports: real Chrome users, 28-day rolling, daily via the CrUX API (`PHONE`/`TABLET`/`DESKTOP`), weekly history for 40 weeks via the History API, CrUX Vis for charts (the Looker dashboard was retired November 2025). An origin or URL needs enough traffic, and the threshold isn't published: a small site often has origin data and no URL data, or none. CrUX excludes Chrome on iOS, so **it has no iPhone users at all**.
- **Your own field data.** The `web-vitals` library (v6, 2026; `web-vitals/attribution` adds about 1.5 KB and tells you the element, subpart and script). Since December 2025, LCP and INP are Baseline: Safari 26.2 and Firefox 144 report them, so a RUM beacon now sees iPhones. CLS is still Chromium-only: nobody can measure CLS on Safari users.
- **Lab, as a regression guard.** Lighthouse 13.6 (2026-10): simulated throttling (Lantern) on a Moto G Power profile, 412×823 at DPR 1.75, 150 ms RTT, 1.6 Mbps, 4× CPU slowdown; desktop is 40 ms, 10 Mbps, 1× CPU. One run is noise: "the median Lighthouse score of 5 runs is twice as stable as 1 run" (lighthouse docs/variability.md). TBT is a lab stand-in for INP, "not a substitute" (web.dev/articles/tbt). Lighthouse 13 replaced many audits with performance insights (removed: `uses-rel-preload`, `offscreen-images`, `third-party-facades`, the DOM node-count audit; LCP breakdown comes from the trace engine), so check an audit ID exists in the installed version before asserting on it.
- **Diagnose in a trace.** DevTools Performance panel shows live LCP, CLS and INP next to CrUX, interaction and layout-shift tables, LCP subparts and the layout-shift culprits insight. Long Animation Frames (LoAF, Chromium only) name the script behind a slow interaction (`sourceURL`, `invoker`, `forcedStyleAndLayoutDuration`).
- **iPhones need WebKit.** No Lighthouse profile is an iPhone and none models WebKit memory. Load heavy pages in Playwright WebKit and scroll them; for INP and LCP, Safari 26.2's Web Inspector Timelines.
- **Live, not only `dist/`.** Compression, cache headers, HTTP version, Early Hints and the CDN show up only on the real URL.

## Tier 1: Essential, every site

**1. The LCP element paints early and is never gated.** Browser-team guidance (web.dev/articles/optimize-lcp, 2025-03-31). Break LCP into four parts and fix the one out of proportion: TTFB ~40%, resource load delay < 10%, resource load duration ~40%, element render delay < 10%. The LCP image is in the initial HTML as an `<img>` (the preload scanner "only scans HTML"; a CSS background, a `data-src` swap or a JS-inserted image is invisible to it), has `fetchpriority="high"` (Chrome 102, Firefox 132, Safari 17.2), and is never `loading="lazy"` (lazy LCP cost 13-15% LCP in a web.dev lab test). A video poster or CSS background that is the LCP needs `<link rel="preload" as="image" fetchpriority="high">`. Never hide it (`opacity: 0`) until a script, canvas or WebGL effect redraws it: paint the plain version first and let the effect replace it. A long render delay with no load delay means something kept a downloaded image from painting, usually JS. Check: Lighthouse LCP breakdown and the LCP element on the mobile run.

**2. Fast, cacheable responses.** Browser-team guidance + platform-documented. Static HTML gives "a consistently fast TTFB" (web.dev/articles/rendering-on-the-web, 2026-01-05). Hashed assets: `Cache-Control: max-age=31536000` (add `immutable`, ignored by some browsers). HTML: `no-cache` with an ETag, so it revalidates. Never `no-store` (it blocks bfcache in every browser but Chrome). Text compressed with Brotli or zstd (zstd is Baseline since 2026-02, Safari 26.3 on current macOS only; gzip is the floor). HTTP/2 at least; HTTP/3 is a CDN default, not a guideline. On Caddy, `encode` does zstd and gzip only; Brotli needs `file_server precompressed br` with `.br` files from the build. Cloudflare doesn't cache HTML unless a rule says so, and re-encodes for visitors. Check: `curl -sI --compressed` on HTML, a hashed asset, a font and an image: status, `content-encoding`, `cache-control`, `alt-svc`, `cf-cache-status`, and TTFB from several runs.

**3. Images sized for the slot, in a modern format.** Browser-team guidance. AVIF (Baseline widely available since 2026-07-25) or WebP, through `srcset`/`sizes` so a 390 px phone at DPR 3 gets about 1170 px, not 2400. `width`/`height` or `aspect-ratio` on every image and video ("always include", web.dev/articles/optimize-cls). `loading="lazy"` below the fold only. Files in `public/` skip the framework's image pipeline and ship full size; give them widths or move them into the pipeline. Check `img.currentSrc` in a real browser at phone size and DPR 3 against the built site (a dev server skips build-time image steps). A decoded image costs width × height × 4 bytes of memory whatever its file size (web.dev/articles/compress-images), which matters on iPhones (practice 9).

**4. Nothing shifts.** Browser-team guidance (web.dev/articles/optimize-cls, debug-layout-shifts). Reserve space for media, embeds and late content; never insert content above what the reader sees; animate with `transform`, not layout properties. Web fonts are the other common cause (practice 5). Shifts within 500 ms of input don't count. The element Chrome names as shifted may not be the cause; look at what came just before it. Check: Lighthouse layout-shift culprits; a `PerformanceObserver` for `layout-shift` in a Chromium run.

**5. Fonts: few, self-hosted, early, swap without a jump.** Browser-team guidance + measured (web.dev/articles/font-best-practices; Almanac 2024 Fonts). WOFF2 only, subset to what the page uses (`unicode-range`), self-hosted: since cache partitioning (Chrome 86) "a shared font CDN is no longer beneficial", and a cross-origin font stylesheet in a shared `<head>` blocks rendering on every page whether it uses the font or not. Preload only the one or two files the first screen renders (an English site needs `latin`, not `latin-ext`); preload takes bandwidth from everything else. `font-display: swap` when the font arrives early, `optional` to rule out the swap shift. A fallback tuned with `size-adjust` and metric overrides removes the swap jump in Chrome and Firefox; Safari ignores `ascent-override`/`descent-override`/`line-gap-override` (blocked since 2021), so check Safari separately. A family used on one page type loads on that page type only. Variable fonts pay off only for several weights or styles.

**6. JavaScript: least, latest, and never blocking.** Browser-team guidance (web.dev/articles/optimize-long-tasks, 2024-12-19). Nothing render-blocking in `<head>` except tiny inline scripts; module scripts defer by default. Size is not the cost: execution is. A 12 KB script that touches every image burned 800 ms of main thread on a phone (joekarlsson.com). Any task over 50 ms is a long task: break it up and yield with `scheduler.yield()` where it exists (Chrome 129, Firefox 142; **Safari has neither it nor `requestIdleCallback`**), falling back to `setTimeout`. Work that touches every image or video runs only near the screen (IntersectionObserver), and batches layout reads instead of calling `getComputedStyle`/`offsetWidth` per element in a loop. On static sites, ship HTML and CSS and hydrate only the interactive islands (Astro islands strip client JS by default; `client:visible` over `client:load` for anything below the fold). Check: Lighthouse "JavaScript execution time" and TBT on mobile; LoAF attribution for slow interactions.

**7. Interactions answer within a frame or two (INP).** Browser-team guidance (web.dev/articles/inp, 2025-09-02). Split INP into input delay (main thread busy when tapped: long tasks from practice 6), processing (the handler: do the visible update first, defer the rest), and presentation delay (rendering a big DOM or expensive styles after the handler). Lighthouse can't measure INP; tap through the page's real controls in a trace on a 4× CPU slowdown and read the interaction table.

**8. Back/forward cache works.** Browser-team guidance (web.dev/articles/bfcache, 2026-10-16). Never use `unload`: Chrome finished removing it in Chrome 155 (2026-10), and in other browsers it still blocks bfcache; use `pagehide` or `visibilitychange`. Avoid `Cache-Control: no-store` on HTML. bfcache restores are instant and keep CLS low. Check: DevTools > Application > Back/forward cache > Run test; `notRestoredReasons` in the field.

**9. Heavy pages don't crash a phone.** Platform-documented (WebKit engineers on bugs.webkit.org; no official doc). iPhone Safari kills a tab's WebContent process past a soft limit of about 1.5 GB, less on lower-RAM models (bug 277848, 2024), and reloads it ("A problem repeatedly occurred"); the usual cause is graphics memory backing compositing layers (bug 279637). `will-change: opacity, transform` on many layers with running animations keeps that memory alive even off-screen, and crashed an iPhone 17 Pro in 2026 (bug 312727, Simon Fraser); his fix was `display: none` on off-screen scenes. So: `will-change` as a last resort, only while animating (MDN); stop or remove off-screen animated scenes; count decoded image memory (practice 3); keep canvases under 8192 × 8192 device pixels on iOS (WebKit `CanvasBase.cpp`). Check: load and scroll each heavy page as an iPhone in Playwright WebKit and fail on a crash, reload or script error. It can't reproduce the memory limit, so also budget layers, canvas area and decoded image bytes in tests.

**10. Video and animated media cost what they look like.** Browser-team guidance (web.dev/articles/replace-gifs-with-videos). Animated GIFs become `<video autoplay loop muted playsinline>` (one example went from 3.7 MB to 341 KB). Autoplay loops get a phone-sized encode (`<source media="(max-width: 767px)">`), `preload="none"` below the fold, and play only while on screen. Posters download at page load whatever `preload` says, even on a `display: none` video: a clip hidden on phones or far down the page keeps its still in `data-poster` and gets `poster` set as it nears the screen. Heavy embeds (YouTube, maps) get a facade: a static image that loads the real player on click. Add up the video bytes a phone pulls scrolling the page once.

## Tier 2: Recommended

**11. Budgets in CI, set from measured baselines.** Browser-team guidance + measured. Gate what can regress: Lighthouse CI `assert` with metric assertions (`largest-contentful-paint`, `cumulative-layout-shift`, `total-blocking-time`) and `resource-summary:*:size` next to the category scores, `aggregationMethod: median` over at least 3 runs (5 for anything close to the line). Lighthouse itself dropped `budget.json` in v12, and LHCI's `budgetsFile` can't be combined with assertions, so use assertions. Set each threshold just above today's measured median on the slowest page of its type, then lower it as fixes land; a threshold copied from a blog post is a guess. Also budget what Lighthouse can't see: per-page-type CSS and JS bytes, the phone page's total image and video bytes, and a WebKit smoke run. A budget that trips is a decision for the owner, never a quiet raise.

**12. Animate cheaply, and only when seen.** Browser-team guidance (web.dev/articles/animations-guide). Animate `transform` and `opacity` only; anything with blur (`filter: blur`, shadows, `backdrop-filter`) "takes longer to paint". SVG filters (`feTurbulence`, `feDisplacementMap`) have no published cost from any browser team, so measure them: frame time in a trace while they run, on 4× CPU. Off-screen elements in a visible tab still get `requestAnimationFrame` callbacks, so pause canvases and loops with IntersectionObserver, and on `visibilitychange`. `prefers-reduced-motion` stops ambient animation. Timing and choreography belong to [web-motion](/web-motion.md) and the motion-reviewer.

**13. Skip rendering what's far below.** Browser-team guidance + measured (web.dev/articles/content-visibility: 232 ms to 30 ms on a demo page). `content-visibility: auto` with `contain-intrinsic-size` on long pages' off-screen sections. Baseline newly available (Safari 26, Firefox 130); `contain-intrinsic-size` is widely available. Measure before and after: on a short page it does nothing.

**14. Keep HTML and the DOM lean.** Browser-team guidance. Lighthouse 13's DOM-size insight no longer counts nodes; it fails when a single layout or style recalculation takes over 40 ms. Decoration repeated per item (an inline SVG on every card) multiplies the HTML: define it once (`<symbol>` + `<use>`, or CSS), and skip hover-only decoration on touch screens (`@media (hover: hover)`). Check the raw and gzipped size of the biggest list page.

**15. Make the next page fast.** Platform-documented + browser-team guidance. Prefetch on intent: Astro's `prefetch` (default `hover`, falls back to `tap` on data saver or slow connections). Speculation Rules are a Chromium-only progressive enhancement (Safari behind a flag, Firefox Nightly only): prefetch broadly, prerender sparingly ("be careful not to over-prerender"), `moderate` or `conservative` eagerness for document rules. Chrome caps the hover-triggered eagerness levels at 2 speculations at a time on desktop. Astro's prefetch needs real cache headers on HTML for Firefox and Safari to reuse it.

**16. Third parties earn their place.** Browser-team guidance. Each third-party origin costs a connection and runs code you don't control: self-host what you can (fonts, analytics script), facade the rest (practice 10), and load the remainder `async` after the page's own content.

## Tier 3: Situational or emerging, never a failure

- **103 Early Hints.** Navigations only, HTTP/2+. Preconnect hints work in Chrome, Firefox and Safari 17; preload hints don't work in Safari. Cloudflare generates them from the origin's `Link` headers on every plan. Little adoption (2.9% of desktop sites, Almanac 2024). Worth it only when TTFB is long and the LCP or a font is known in advance.
- **Compression dictionaries** (RFC 9842, 2025-09). Chromium only; Cloudflare passes them through in beta and the origin builds them. For sites whose JS or HTML ships many small versions.
- **JPEG XL.** Chrome 155, Firefox 158 and Safari 17+ decode it, Edge doesn't, so it's not Baseline. Only inside `<picture>` with an AVIF/WebP fallback, and Safari doesn't render it progressively.
- **Cross-document view transitions** (`@view-transition`). Chrome 126, Safari 18.2, Firefox Nightly only. Snapshots are cheap ("a few frames"), but never add `blocking="render"` without measuring, and Chrome skips the transition when navigation takes over 4 s.
- **`sizes="auto"`** on lazy images. Chrome 126, Firefox 150, not Safari; keep a real `sizes` list after it.
- **Critical CSS inlining.** Under 14 KB compressed, only when render-blocking CSS dominates FCP; inlined CSS isn't cached across pages.
- **Soft-navigation vitals.** On by default in Chrome 151; CrUX publishes them as `experimental_*_with_softnavs` until May 2027. Relevant only to SPAs and sites with client-side routing.

## When to recommend re-architecting

A bigger change is justified when a measured cost points at structure, not a missing attribute. Recommend it with the measurement, the expected gain, the risk and a smaller first step:

- **Hydrated framework or SPA serving mostly static content** (high TBT, JS execution over ~1 s on mobile, content that needs JS): move to static rendering with islands. web.dev calls full rehydration "rarely the best option".
- **Images outside a pipeline** (most image bytes from un-resized originals): route every image through one build step that makes widths and AVIF/WebP.
- **Render delay dominated by an effect** (canvas, WebGL, filter, reveal script): render a pre-baked still in the HTML and let the effect upgrade it after load, on capable devices only.
- **TTFB over 0.8 s at p75 on HTML**: cache HTML at the CDN edge with a purge on deploy, or move the origin closer.
- **Fonts from a third-party CDN, or several families on every page**: self-host, subset, and scope each family to the page types that use it.
- **The same heavy decoration repeated per item, or one page carrying every item**: shared symbols, pagination or `content-visibility`.
- **Pages that crash or stutter on iPhones**: a phone-specific version of the heavy element (a still, a shorter clip, fewer layers), chosen by media query, not by UA sniffing.

## Claims the evidence doesn't support

- A Lighthouse score of 100, or a desktop score, means the site is fast. Real users are the target; read the mobile run, and field data when there is any. Desktop scores hide phone problems (joekarlsson.com: 99 desktop, 82 mobile, 4.6 s LCP on the same page).
- TBT is INP. It's a lab proxy.
- Preload everything important. Preload is "a mandatory fetch" that competes for bandwidth; it fixes discovery, not priority.
- `will-change` makes animation smooth. It's a last resort, and on iPhones it can crash the tab.
- A shared font CDN is probably cached already. Cache partitioning ended that in 2020.
- `requestIdleCallback` or `scheduler.yield` alone is enough. Safari has neither; ship the fallback.
- Variable fonts are always smaller. Only with several weights or styles.
- Lighthouse `budget.json`. Removed in Lighthouse 12; use LHCI assertions.
- `isInputPending`. No longer recommended.
- Any per-KB JS budget from a blog. The last browser-team figure (V8, 2019: split bundles over ~50-100 KB) is old; measure execution time instead.
- "Every 100 ms costs 1% of sales" and similar. The best-known study (Deloitte/55, "Milliseconds Make Millions", 2019) was commissioned by Google, covered retail and travel, and is correlational. It's a reason to care, not a forecast.

## Key sources

web.dev: vitals, optimize-lcp, inp, cls, optimize-cls, debug-layout-shifts, ttfb, fcp, tbt, optimize-long-tasks, http-cache, bfcache, fetch-priority, preload-scanner, font-best-practices, content-visibility, animations-guide, replace-gifs-with-videos, rendering-on-the-web, lcp-and-inp-are-now-baseline-newly-available (2025-12-17). developer.chrome.com: crux/methodology, crux/api, crux/history-api, crux/release-notes, web-platform/long-animation-frames, soft-navigations-experiment, deprecating-unload, early-hints, prerender-pages, blog/lighthouse-13-0, blog/jpeg-xl-in-chrome, performance/insights/dom-size. Lighthouse repo docs/throttling.md, docs/variability.md, core/config/constants.js; lighthouse-ci docs/configuration.md; web-vitals CHANGELOG. webkit.org blog: Safari 26.2 (17640), 26.3 (17798); bugs.webkit.org 277848, 279637, 312727. Mozilla performance blog (Firefox 144 interactionId). MDN and web-features (Baseline dates). RFC 9842. HTTP Archive Web Almanac 2024 (HTTP, Fonts), 2025 (Performance, Page weight). Caddy docs (encode, file_server); Cloudflare docs (default cache behavior, compression, Early Hints). Astro docs (islands, directives, prefetch, images).
