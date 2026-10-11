# Navegador — Pitch Deck (Slidev)

> One panorama. One crew. Ten pins.  
> **Erasmus Team** · Three Nations. One Goal.

The pitch deck for the Albatroz Challenge, written in Markdown with [Slidev](https://sli.dev).

---

## 1 · Start it (2 minutes)

```bash
# needs Node.js >= 22.12  (check: node -v)
npm install
npm run dev          # opens http://localhost:3030
```

| Key | What it does |
|---|---|
| `Space` / `→` | next click / next slide |
| `←` | back |
| `o` | overview of all slides |
| `g` | go to slide number |
| `f` | fullscreen |
| `d` | toggle dark/light |

**Presenter mode:** open `http://localhost:3030/presenter` on your laptop screen, the normal URL on the projector. You get speaker notes, next slide and a timer.

**Recommended:** VS Code extension "Slidev" (live preview next to the editor).

---

## 2 · What's where

```
slides.md                ← the whole deck (12 slides, ~5 words per slide)
components/
  CrewStory.vue          ← the architecture as an animated short film (10 clicks)
  PanoStrip.vue          ← endlessly panning 360° panorama (inline strip or full-bleed background)
  BigNumber.vue          ← count-up KPI, accepts "??" as placeholder
  DistanceStrip.vue      ← log-scale dot strip of every panorama's error, reads data/batch1.json (2 clicks)
public/panos/*.jpg       ← the panoramas (2000×1000)
styles/index.css         ← colours + reusable classes (.kicker .catch .pill .hero …)
vite.config.ts           ← build workaround, see "Known issue"
```

Components in `components/` are auto-imported — just write `<PanoStrip src="/panos/x.jpg" />` in `slides.md`.

**Design rule of this deck:** one headline, one visual, at most one catch line. If you need a sentence, put it in the speaker notes.

---

## 3 · Anatomy of a slide

```md
---
layout: default          # default (auto-centred) · center · full (edge to edge)
clicks: 10               # optional: how many clicks this slide has
---

<div class="kicker">Small label</div>

# Headline with a <span class="tram">yellow accent.</span>

<PanoStrip src="/panos/village-granite.jpg" :height="250" />

<span v-click class="pill">🌐 appears on click 1</span>

<!--
Speaker notes: the LAST comment of a slide. Only visible in presenter mode.
-->
```

---

## 4 · The film (CrewStory) & TODOs

- One click = one crew member walks on stage: card on the right, their job animated on the panorama/map, rail at the bottom fills up. Click 10 = overview.
- All texts live in `SCENES` at the top of `CrewStory.vue`; box positions in `READER` / `GEO` are % of the panorama.
- Swap the demo panorama: change `PANO` and re-measure the boxes.
- Full-bleed panorama on any slide: `layout: full` + `<PanoStrip src="..." fill shade />`.

```bash
grep -n "TODO" slides.md
```

- **Results slide:** numbers are computed from `data/batch1.json` (median, under 100 m, exact). "Right country 20/20" is hardcoded; baseline score and time per panorama are still missing
- **Boss level slide:** decide how you reveal A vs B
- The log lines in the film are illustrative — swap in real ones from `runs/<id>/log.json` if you like

---

## 5 · Export & share

```bash
npx playwright install chromium   # once, needed for PDF/PNG export
npm run export                    # → slides-export.pdf
npm run export:pptx               # → .pptx (slides become images)
npm run build                     # → dist/ : static website with all interactivity
```

Host `dist/` anywhere static (Netlify, Vercel, GitHub Pages, your own server).
For a sub-folder on your own site:

```bash
npx slidev build --base /junctionx/
```

The PDF is a backup only — **present from the browser**, otherwise CrewMap and ScoreLab lose their interactivity.

---

## Known issue

Slidev 53.0.0 + the current Vite toolchain fails `slidev build` with a `lightningcss minify` error (even on an empty deck). `vite.config.ts` disables CSS minification to work around it. The dev server is unaffected. Delete the file once a fixed Slidev version is out.
