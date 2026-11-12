import json, sys, html
lib = sys.argv[1]; out = sys.argv[2]
P = json.load(open(lib + '/palettes.json')); T = json.load(open(lib + '/type.json'))
T = [t for t in T if 'Instrument Serif' not in t['display']['family']]  # banned face
fams = sorted({t['display']['family'] for t in T} | {t['text']['family'] for t in T})
fonts = 'https://fonts.googleapis.com/css2?' + '&'.join('family=' + f.replace(' ', '+') + ':wght@400;600' for f in fams) + '&display=swap'
order = ['dark-neutral','flat-loud','single-field','two-tone','pastel-fields','mono-accent','earth','photographic-neutral','light-neutral']
label = {'dark-neutral':'Dark grounds','flat-loud':'Flat and loud','single-field':'One big color field','two-tone':'Two colors only','pastel-fields':'Pastel fields','mono-accent':'Neutral plus one accent','earth':'Earth tones','photographic-neutral':'Quiet, for photo-led pages','light-neutral':'Light and plain'}
groups = {k: [] for k in order}
for p in P: groups[p['tags'][0] if p['tags'][0] in groups else order[-1]].append(p)
e = html.escape; n = 0; cards = []
for g in order:
    if not groups[g]: continue
    cards.append(f'<h2>{label[g]}</h2><div class="grid">')
    for p in groups[g]:
        n += 1; t = T[n % len(T)]
        fields = ''.join(f'<span style="background:{f["bg"]};color:{f["ink"]}">Aa</span>' for f in p.get('fields', []))
        cards.append(f'''<article class="card" style="--bg:{p['bg']};--ink:{p['ink']};--muted:{p['muted']};--surface:{p['surface']};--acc:{p['accent']};--accInk:{p['accentInk']}">
<div class="spec"><p class="num">P{n}</p><h3 style="font-family:'{t['display']['family']}'">{e(p['name'])}</h3>
<p class="body" style="font-family:'{t['text']['family']}'">Body text in the muted color sits here, set in {e(t['text']['family'])}.</p>
<p class="row"><span class="btn">Do the thing</span><span class="tile">surface</span>{fields}</p></div>
<p class="note">{e(p['note'])}</p><p class="meta">{p['bg']} / {p['ink']} / {p['accent']}</p></article>''')
    cards.append('</div>')
types = []
for i, t in enumerate(T, 1):
    types.append(f'''<article class="type"><p class="num">T{i}</p><p class="disp" style="font-family:'{t['display']['family']}'">Who passes the test</p>
<p style="font-family:'{t['text']['family']}'">{e(t['display']['family'])} with {e(t['text']['family'])}. {e(t.get('suits',''))}</p></article>''')
page = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Palette and type board</title><link rel="stylesheet" href="{fonts}"><style>
:root{{--page:#f4f3f0;--text:#141414}}
body{{margin:0;background:var(--page);color:var(--text);font:16px/1.5 system-ui,sans-serif;padding:32px 16px}}
main{{max-width:1400px;margin:0 auto}} h1{{font-size:40px;margin:0 0 8px}} h2{{font-size:26px;margin:48px 0 16px}}
.intro{{max-width:46em}}
.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:24px}}
.card .spec{{background:var(--bg);color:var(--ink);padding:24px;border-radius:8px;min-height:190px}}
.card h3{{font-size:30px;line-height:1.1;margin:4px 0 10px;font-weight:600}}
.card .body{{color:var(--muted);margin:0 0 16px}}
.row{{display:flex;gap:8px;flex-wrap:wrap;margin:0}} .row span{{padding:8px 12px;border-radius:6px;font-size:14px}}
.btn{{background:var(--acc);color:var(--accInk)}} .tile{{background:var(--surface);color:var(--ink)}}
.num{{font-weight:700;margin:0;font-size:14px}} .note{{font-size:14px;margin:10px 0 2px}} .meta{{font:13px ui-monospace,monospace;margin:0;color:#444}}
.types{{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:28px}} .disp{{font-size:34px;line-height:1.1;margin:4px 0 8px;font-weight:600}}
</style></head><body><main><h1>Palette and type board</h1>
<p class="intro">{n} palettes and {len(T)} type pairings from taste-skill's library (MIT), grouped by how they spend color. Each palette card is set in a different pairing so you can see both at once. Answer by number: which palettes and faces to keep as starting points for new sites, and which to cut.</p>
{''.join(cards)}<h2>Type pairings</h2><div class="types">{''.join(types)}</div></main></body></html>'''
open(out, 'w').write(page); print(n, len(T))
