// Evidence for the design-reviewer agent: screenshots and measurements of each page at
// desktop (1440), phone (iPhone 13), narrow phone (320) and big-screen (2560) widths.
//
//   node ~/.claude/scripts/design-review.mjs <outDir> <url> [url...]
//
// Writes <outDir>/<slug>-<width>.png (viewport) and -full.png (whole page), plus
// <outDir>/report.json. Playwright and axe-core come from the current repo when it has
// them, otherwise from joekarlsson.com's node_modules.
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const FALLBACK_REPO = '/Users/joekarlsson/Documents/dev/joe/joekarlsson.com/package.json';
function requireFromRepo(name) {
	for (const base of [join(process.cwd(), 'package.json'), FALLBACK_REPO]) {
		try {
			return createRequire(base)(name);
		} catch {}
	}
	throw new Error(`${name} not found in this repo or ${FALLBACK_REPO}`);
}
function resolveFromRepo(name) {
	for (const base of [join(process.cwd(), 'package.json'), FALLBACK_REPO]) {
		try {
			return createRequire(base).resolve(name);
		} catch {}
	}
	return null;
}

const [outDir, ...urls] = process.argv.slice(2);
if (!outDir || urls.length === 0) {
	console.error('usage: node design-review.mjs <outDir> <url> [url...]');
	process.exit(2);
}
mkdirSync(outDir, { recursive: true });
const { chromium, devices } = requireFromRepo('playwright');
const axePath = resolveFromRepo('axe-core/axe.min.js');

const VIEWPORTS = {
	desktop: { viewport: { width: 1440, height: 900 } },
	phone: devices['iPhone 13'],
	// the smallest phones still in use (iPhone SE 1st gen, small Androids at large text)
	narrow: { viewport: { width: 320, height: 640 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
	wide: { viewport: { width: 2560, height: 1440 } },
};

// Runs inside the page. Keep it self-contained.
function measurePage(isPhone) {
	const visible = (el) => {
		const s = getComputedStyle(el);
		const r = el.getBoundingClientRect();
		// Off-canvas elements (a skip link until focused) don't count as visible
		return s.display !== 'none' && s.visibility !== 'hidden' && r.width > 1 && r.height > 1 && r.top + scrollY >= 0 && r.right > 0;
	};
	// Text a screen reader would read: aria-label, else the text minus aria-hidden parts
	const spokenText = (el) => {
		const copy = el.cloneNode(true);
		for (const hidden of copy.querySelectorAll('[aria-hidden="true"]')) hidden.remove();
		return copy.textContent;
	};
	const label = (el) =>
		(el.getAttribute('aria-label') || spokenText(el) || el.value || el.name || '').trim().replace(/\s+/g, ' ').slice(0, 40);
	const interactive = [...document.querySelectorAll('a[href], button, input:not([type=hidden]), select, textarea, [role=button]')].filter(visible);

	// Fitts: targets under 44px (phone) / 24px (WCAG floor). Links inside running text are exempt.
	const minSize = isPhone ? 44 : 24;
	const smallTargets = interactive
		.filter((el) => !(el.tagName === 'A' && el.closest('p, li, td, blockquote, figcaption') && el.parentElement.textContent.trim().length > el.textContent.trim().length + 20))
		.map((el) => ({ el, r: el.getBoundingClientRect() }))
		.filter(({ r }) => r.height < minSize || r.width < minSize)
		.map(({ el, r }) => `${el.tagName.toLowerCase()} "${label(el)}" ${Math.round(r.width)}x${Math.round(r.height)} at y=${Math.round(r.top + scrollY)}`);

	// Hick: choices on the first screen
	const aboveFold = interactive.filter((el) => el.getBoundingClientRect().top < innerHeight).map(label);

	const navs = [...document.querySelectorAll('nav')].filter(visible).map((n) => ({
		label: n.getAttribute('aria-label') || '',
		items: [...n.querySelectorAll('a[href], button')].filter(visible).map(label),
		top: Math.round(n.getBoundingClientRect().top + scrollY),
	}));

	// Tesler / Postel / Parkinson: form fields
	const fields = [...document.querySelectorAll('input:not([type=hidden]), select, textarea')].map((f) => ({
		name: f.name || f.id,
		type: f.type,
		autocomplete: f.getAttribute('autocomplete'),
		required: f.required,
		pattern: f.getAttribute('pattern'),
		labelled: Boolean(f.labels?.length || f.getAttribute('aria-label') || f.getAttribute('aria-labelledby')),
		hiddenFromView: !visible(f),
	}));
	const forms = [...document.querySelectorAll('form')].map((f) => ({ action: f.action, method: f.method, fields: f.elements.length }));

	// Miller: structure of long pages
	const headings = [...document.querySelectorAll('h1, h2, h3')].filter(visible).map((h) => `${h.tagName} ${label(h)}`);

	// Similarity: distinct link and button looks
	const look = (el) => {
		const s = getComputedStyle(el);
		return [s.color, s.backgroundColor, s.textDecorationLine, s.fontWeight, s.borderRadius].join(' | ');
	};
	const tally = (els) => {
		const m = {};
		for (const el of els) m[look(el)] = (m[look(el)] || 0) + 1;
		return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 8);
	};

	// Header consistency: where the page's own header sits, to compare across pages
	const pageHeader = document.querySelector('main header');
	const headerBox = pageHeader
		? (({ left, top, width }) => ({ left: Math.round(left), top: Math.round(top + scrollY), width: Math.round(width) }))(pageHeader.getBoundingClientRect())
		: null;

	// Pragnanz: display titles whose text runs past the box that holds them
	const titleOverflow = [...document.querySelectorAll('h1, h2')]
		.filter(visible)
		.map((h) => {
			const range = document.createRange();
			range.selectNodeContents(h);
			const text = range.getBoundingClientRect();
			let box = h.parentElement;
			while (box && getComputedStyle(box).display === 'contents') box = box.parentElement;
			const limit = box ? box.getBoundingClientRect().right - parseFloat(getComputedStyle(box).paddingRight) : innerWidth;
			return { h, over: Math.round(text.right - Math.min(limit, innerWidth)) };
		})
		.filter(({ over }) => over > 2)
		.map(({ h, over }) => `${h.tagName} "${label(h)}" runs ${over}px past its container`);

	// Line length: running text wider than about 75 characters a line
	const longLines = [...document.querySelectorAll('main p, main li')]
		.filter((el) => visible(el) && el.textContent.trim().length > 160 && !el.closest('nav, pre, table'))
		.map((el) => {
			const probe = document.createElement('span');
			probe.textContent = '0'.repeat(20);
			probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap';
			el.appendChild(probe);
			const ch = probe.getBoundingClientRect().width / 20;
			probe.remove();
			return { el, chars: Math.round(el.getBoundingClientRect().width / ch) };
		})
		.filter(({ chars }) => chars > 75)
		.map(({ el, chars }) => `${el.tagName.toLowerCase()} "${label(el)}" ~${chars}ch a line`);

	// Big screens: top-level blocks that run edge to edge
	const wideSections =
		innerWidth >= 2000
			? [...document.querySelectorAll('main > *, main > * > section, body > * > section')]
					.filter((el) => visible(el) && !['absolute', 'fixed'].includes(getComputedStyle(el).position) && label(el))
					.map((el) => ({ el, w: el.getBoundingClientRect().width }))
					.filter(({ w }) => w > 1600)
					.map(({ el, w }) => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''} "${label(el)}" ${Math.round(w)}px wide`)
			: [];

	// Fitts: links and buttons on the first screen whose middle is covered by something
	// else (a big title's line box, an overlay), so a click there misses them
	const coveredTargets = interactive
		.filter((el) => {
			const r = el.getBoundingClientRect();
			if (r.top < 0 || r.bottom > innerHeight || r.right > innerWidth) return false;
			const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
			return hit && hit !== el && !el.contains(hit) && !hit.contains(el);
		})
		.map((el) => {
			const r = el.getBoundingClientRect();
			const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
			return `${el.tagName.toLowerCase()} "${label(el)}" is under ${hit.tagName.toLowerCase()} "${label(hit)}"`;
		});

	// Focus visible: focusable things that are see-through until hover
	const hiddenFocusables = interactive
		.filter((el) => Number(getComputedStyle(el).opacity) === 0)
		.map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].join('.')} "${label(el)}"`);

	// Phones: things that run past the right edge, and text or controls lying on each other
	const offViewport = isPhone
		? [...document.querySelectorAll('body *')]
				.filter((el) => visible(el) && el.checkVisibility({ opacityProperty: true, visibilityProperty: true }) && !el.closest('[aria-hidden="true"], pre, table'))
				.filter((el) => {
					const r = el.getBoundingClientRect();
					if (r.right <= innerWidth + 1) return false;
					// inside a box that scrolls or clips sideways on purpose
					for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
						const ox = getComputedStyle(p).overflowX;
						if (['auto', 'scroll', 'hidden', 'clip'].includes(ox)) return false;
					}
					return true;
				})
				.filter((el, _, all) => !all.some((o) => o !== el && o.contains(el)))
				.map((el) => `${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/)[0] : ''} "${label(el)}" right edge at ${Math.round(el.getBoundingClientRect().right)}px of ${innerWidth}`)
		: [];
	const blocks = isPhone
		? [...document.querySelectorAll('h1, h2, h3, p, li, a[href], button, input, select, textarea')].filter(
				// checkVisibility drops a closed <details>, opacity 0 and content-visibility: hidden
				(el) => visible(el) && el.checkVisibility({ contentVisibilityAuto: true, opacityProperty: true, visibilityProperty: true }) && !el.closest('[aria-hidden="true"]') && label(el),
			)
		: [];
	// a link that wraps has one box per line; its bounding box would cover the lines between
	const boxes = (el) => (getComputedStyle(el).display === 'inline' ? [...el.getClientRects()] : [el.getBoundingClientRect()]);
	const collisions = [];
	for (let i = 0; i < blocks.length && collisions.length < 15; i++) {
		const as = boxes(blocks[i]);
		for (let j = i + 1; j < blocks.length; j++) {
			if (blocks[i].contains(blocks[j]) || blocks[j].contains(blocks[i])) continue;
			let hit = null;
			for (const a of as)
				for (const b of boxes(blocks[j])) {
					const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
					const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
					// over 8px both ways: line boxes of neighbouring lines touch by a few px
					if (w > 8 && h > 8) hit ??= { w, h, y: a.top };
				}
			if (hit) {
				collisions.push(`${blocks[i].tagName.toLowerCase()} "${label(blocks[i])}" overlaps ${blocks[j].tagName.toLowerCase()} "${label(blocks[j])}" by ${Math.round(hit.w)}x${Math.round(hit.h)} at y=${Math.round(hit.y + scrollY)}`);
				break;
			}
		}
	}

	return {
		title: document.title,
		offViewport: offViewport.slice(0, 15),
		collisions,
		coveredTargets: coveredTargets.slice(0, 15),
		hiddenFocusables: [...new Set(hiddenFocusables)].slice(0, 10),
		hiddenFocusableCount: hiddenFocusables.length,
		headerBox,
		titleOverflow,
		longLines: longLines.slice(0, 15),
		longLineCount: longLines.length,
		wideSections: wideSections.slice(0, 10),
		pageHeight: document.documentElement.scrollHeight,
		horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 1,
		h1Count: document.querySelectorAll('h1').length,
		headings: headings.slice(0, 40),
		headingCount: headings.length,
		navs,
		choicesAboveFold: aboveFold.length,
		choicesAboveFoldSample: aboveFold.slice(0, 25),
		smallTargets: smallTargets.slice(0, 30),
		smallTargetCount: smallTargets.length,
		forms,
		fields,
		linkLooks: tally(interactive.filter((el) => el.tagName === 'A' && el.closest('main'))),
		buttonLooks: tally(interactive.filter((el) => el.tagName === 'BUTTON')),
	};
}

// After the screenshots (it scrolls). Shift+Tab scrolls the focused element just into
// view at the top of the screen, where a fixed or sticky header can hide it unless
// scroll-padding-top leaves room. Press Shift+Tab up from the bottom of the page and
// report each focused element the header covers.
async function focusUnderHeader(page) {
	const header = await page.evaluate(() => {
		document.documentElement.style.scrollBehavior = 'auto';
		// scrolled partway, a sticky bar has stuck to the top wherever it started
		window.scrollTo(0, document.documentElement.scrollHeight / 2);
		const bar = [...document.querySelectorAll('body *')].find((el) => {
			const s = getComputedStyle(el);
			const r = el.getBoundingClientRect();
			// a bar, not a full-screen decorative layer
			return ['fixed', 'sticky'].includes(s.position) && r.top <= 40 && r.bottom > 0 && r.height > 20 && r.height < innerHeight * 0.4 &&
				r.width > innerWidth / 2 && s.visibility !== 'hidden' && s.display !== 'none' && s.pointerEvents !== 'none' && !el.closest('[aria-hidden="true"]');
		});
		if (!bar) return null;
		bar.dataset.reviewBar = '';
		window.scrollTo(0, document.documentElement.scrollHeight);
		// start past the last focusable so the first Shift+Tab lands on it
		const end = document.createElement('span');
		end.tabIndex = 0;
		document.body.append(end);
		end.focus();
		end.dataset.reviewEnd = '';
		return { name: `${bar.tagName.toLowerCase()}${bar.id ? '#' + bar.id : ''} ${getComputedStyle(bar).position}`, height: Math.round(bar.getBoundingClientRect().height) };
	});
	if (!header) return { header: null, hidden: [] };
	const hidden = [];
	for (let i = 0; i < 80; i++) {
		await page.keyboard.press('Shift+Tab');
		const r = await page.evaluate(() => {
			const el = document.activeElement;
			const bar = document.querySelector('[data-review-bar]');
			if (!el || el === document.body || bar.contains(el)) return { stop: !el || el === document.body };
			const e = el.getBoundingClientRect();
			const b = bar.getBoundingClientRect();
			const covered = b.bottom > e.top + 2 && b.top < e.bottom;
			return { covered, at: window.scrollY, text: `${el.tagName.toLowerCase()} "${(el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40)}" top at ${Math.round(e.top)}px, header bottom at ${Math.round(b.bottom)}px` };
		});
		if (r.stop || r.at === 0) break;
		if (r.covered) hidden.push(r.text);
	}
	const scrollPaddingTop = await page.evaluate(() => {
		document.querySelector('[data-review-end]')?.remove();
		document.activeElement?.blur();
		return getComputedStyle(document.documentElement).scrollPaddingTop;
	});
	return {
		header: `${header.name}, ${header.height}px tall`,
		scrollPaddingTop,
		// Chromium centres an off-screen element on desktop, so the walk can pass where Safari
		// and Firefox (which scroll it just into view) hide it; the padding is the real test
		paddingShort: (parseFloat(scrollPaddingTop) || 0) < header.height,
		hidden: hidden.slice(0, 10),
		hiddenCount: hidden.length,
	};
}

const browser = await chromium.launch();
const report = [];
try {
	for (const [vpName, opts] of Object.entries(VIEWPORTS)) {
		// bypassCSP: axe goes in by addScriptTag, which a site's script CSP or Trusted
		// Types (joekarlsson.com's per-page meta policy) would otherwise block
		const context = await browser.newContext({ ...opts, reducedMotion: 'reduce', bypassCSP: true });
		const page = await context.newPage();
		for (const url of urls) {
			const slug = new URL(url).pathname.replace(/^\/|\/$/g, '').replace(/\//g, '_') || 'home';
			const errors = [];
			page.removeAllListeners('pageerror');
			page.on('pageerror', (e) => errors.push(String(e)));
			await page.addInitScript(() => {
				window.__vitals = { lcp: 0, cls: 0 };
				new PerformanceObserver((l) => {
					for (const e of l.getEntries()) window.__vitals.lcp = e.startTime;
				}).observe({ type: 'largest-contentful-paint', buffered: true });
				new PerformanceObserver((l) => {
					for (const e of l.getEntries()) if (!e.hadRecentInput) window.__vitals.cls += e.value;
				}).observe({ type: 'layout-shift', buffered: true });
			});
			const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
			const shot = join(outDir, `${slug}-${vpName}`);
			await page.screenshot({ path: `${shot}.png` });
			if (vpName !== 'wide') await page.screenshot({ path: `${shot}-full.png`, fullPage: true });
			const isPhone = vpName === 'phone' || vpName === 'narrow';
			const measured = await page.evaluate(measurePage, isPhone);
			const vitals = await page.evaluate(() => window.__vitals);
			const nav = await page.evaluate(() => {
				const n = performance.getEntriesByType('navigation')[0];
				return { ttfb: Math.round(n.responseStart), domReady: Math.round(n.domContentLoadedEventEnd) };
			});
			let axe = 'not run at this width (desktop only)';
			if (vpName === 'desktop' && axePath && existsSync(axePath)) {
				await page.addScriptTag({ path: axePath });
				axe = await page.evaluate(async () => {
					const r = await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag22aa'] });
					return r.violations.map((v) => ({ id: v.id, impact: v.impact, count: v.nodes.length, example: v.nodes[0]?.target.join(' ') }));
				});
			}
			const focusHidden = vpName === 'wide' ? 'not run at this width' : await focusUnderHeader(page);
			report.push({
				url,
				viewport: vpName,
				status: response?.status(),
				screenshot: `${shot}.png`,
				...nav,
				lcp: Math.round(vitals.lcp),
				cls: Number(vitals.cls.toFixed(3)),
				scriptErrors: errors,
				...measured,
				focusUnderHeader: focusHidden,
				axe,
			});
		}
		await context.close();
	}
} finally {
	await browser.close();
}
writeFileSync(join(outDir, 'report.json'), JSON.stringify(report, null, 2));
console.log(`${report.length} page views measured; report at ${join(outDir, 'report.json')}`);
