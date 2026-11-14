---
type: Concept
description: "Read when picking a chart or graph for a page, post, dashboard or artifact, or when a chart looks plain and needs an idea: bklit.com's chart catalog (funnel halos, 24-hour radial clocks, contribution heatmaps, sparklines with springy crosshairs, projection lines, weekend shading, deadline regions, marker fan-outs, brushes, sunbursts...) as an idea bank, how to read any component's source, and what not to copy"
---
# Chart and graph ideas

When a chart needs an idea, browse a reference before inventing one. The `dataviz` skill still sets the method (form, color, marks); this is the idea bank. Saved 2026-11-13.

## bklit.com

[Bklit UI](https://bklit.com/) is an open-source (MIT) React chart library on d3, Motion and Tailwind. Use it for ideas and treatments, not as a dependency on Joe's static sites. Browse the [charts gallery](https://bklit.com/docs/components), the [Studio](https://bklit.com/studio) (tune a chart's props, palette and motion live), [blocks](https://bklit.com/blocks) (dashboard layouts) and the [showcase](https://bklit.com/showcase). The source of any component is at `https://bklit.com/r/{name}.json`, e.g. `funnel-chart`, `sparkline`, `chart-animation`.

Ideas worth stealing:

- **Funnel with halo rings:** each stage carries 3 fainter outlines behind it that swell on hover, so the shape reads as layers.
- **Radial 24-hour clock:** ring bars or dot bars around a clock face, for "when in the day" data (commits, listening, sleep, posts).
- **Contribution heatmap:** a GitHub-style day grid; hovering a cell dims the rest.
- **Sparkline:** a tiny line, area or bar chart inline with text; on hover a crosshair and dot glide to the nearest point and the rest of the series fades to half.
- **Projection line:** the series continues dashed past the last real point, for a forecast or a goal pace.
- **Weekend shading and deadline regions:** diagonal stripes on weekends; a due-date line with the area past it fading out.
- **Reference band:** a shaded Y range marking a threshold or "normal" range.
- **Markers with fan-out:** icon badges on points that fan out radially when they overlap.
- **Profit/loss line:** one line colored by sign around a zero baseline.
- **Bar squares:** bars built from stacked squares that cascade up, with a faint track behind showing the maximum.
- **Live line:** a streaming line that scrolls smoothly with animated axes.
- **Brush:** a mini strip under a time series for dragging a zoom window.
- **Sunburst drill-down, sankey flows, ring progress arcs, gauge with zones and needle, candlestick, radar, choropleth with zoom.**
- **Patterns as fills** (stripes, dots) instead of extra colors, which keeps a palette small and works in print.
- **Loading skeletons** shaped like the chart, with a diagonal shimmer, instead of a spinner.

## Motion on charts

What bklit does well: a line reveals with a left-to-right `clip-path` (not `scaleX`, which grows from the center), hovering one series dims the others to ~0.4 opacity over 150ms, crosshairs spring to the nearest point (stiffness 300, damping 30), data changes morph the path over 500ms. Don't copy its timing: its enters run 0.9-1.1s on a strong ease-in-out and play on page load, which breaks the [motion rules](/web-motion.md) (#1, #23, #34).
