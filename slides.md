---
# ===== DECK-WIDE SETTINGS (headmatter) =====
theme: default
title: Navegador — Erasmus Team
info: |
  Navegador · a crew of AI agents that geolocates 360° panoramas.
  Erasmus Team · Three Nations. One Goal. · Albatroz Engenharia Challenge, JunctionX Lisbon 2026
colorSchema: dark
transition: fade-out
mdc: true
fonts:
  sans: Space Grotesk
  serif: Fraunces
  mono: JetBrains Mono
layout: full
---

<PanoStrip src="/panos/praca-arcades.jpg" fill shade :seconds="140" />

<div class="absolute left-16 bottom-14 right-16 z-10">
  <div class="kicker mb-3">Albatroz Challenge · JunctionX Lisbon 2026</div>
  <h1 class="hero">NAVEGADOR</h1>
  <p class="catch text-3xl mt-2">One panorama. One crew. Ten pins.</p>
  <div class="flex items-center gap-4 mt-10">
    <div class="tile-stripe w-16"></div>
    <span class="font-bold tracking-wide">Erasmus Team</span>
    <span class="muted">Three Nations. One Goal.</span>
  </div>
</div>

<!--
Open with a question: "If we drop you somewhere in Portugal with your eyes closed — how fast do you know where you are?"
-->

---
transition: slide-left
---

<div class="kicker">The problem</div>

# Where in the world could <span class="tram">here</span> be?

<PanoStrip src="/panos/village-granite.jpg" :height="250" :seconds="70" class="mt-8" />

<div class="flex gap-3 mt-6">
  <span v-click class="pill">🌐 360°</span>
  <span v-click class="pill">🇵🇹 🇪🇸 🇫🇷 + islands</span>
  <span v-click class="pill">🚫 no street names</span>
  <span v-click class="pill tram-pill">📍 10 pins</span>
</div>

<p v-click class="catch text-2xl mt-8">Looks alike. Lives apart.</p>

<!--
GeoGuessr — but the map is Iberia + France, and 500 m off in a city already hurts.
The hardest part: far-apart places that look the same — north Portugal vs. Galicia, Alentejo vs. Extremadura.
-->

---
clicks: 9
transition: slide-left
---

<CrewStory :step="$clicks" />

<!--
One model guesses. So we built a crew — nine specialists, each with one job.
Clicker drives the film: one click = one crew member. One sentence per agent, let the animation do the talking.
0 intro · 1 Lupa · 2 Astrolábio · 3 Leitor · 4 Geógrafo · 5 Detetive · 6 Advogado · 7 Navegador · 8 Estratega · 9 overview (+ Escrivão).
At the Navegador click (7): "We only ask a human when the math says it pays — and we lock our best pin before we ask."
At the overview (9): the Escrivão sits at the end of the flow — every step is logged.
-->

---
clicks: 4
---

<div class="kicker">The Detective · under the hood</div>

# It never sees the photo. <span class="tram">It checks the map.</span>

<DetectiveDesk :step="$clicks" class="mt-6" />

<!--
The Detective never sees the photo. It only gets clues — and it checks every one. A street sign becomes a Nominatim search, "a castle on a hill" becomes every castle in the region from OpenStreetMap, and the sun flags places where it couldn't be. Every pin we submit traces back to its source.
-->

---
layout: center
class: text-center
clicks: 2
---

<script setup>
import batch from './data/batch1.json'

const errs = batch.panoramas.map(p => p.err_m).sort((a, b) => a - b)
const n = errs.length
const mid = Math.floor(n / 2)
const median = n % 2 ? errs[mid] : (errs[mid - 1] + errs[mid]) / 2
const under100 = errs.filter(e => e < 100).length
const exact = errs.filter(e => e === 0).length
</script>

<div class="kicker">Results · verified by Albatroz</div>

# {{ median }} metres. <span class="tram">Median.</span>

<div class="grid grid-cols-4 gap-10 mt-10">
  <BigNumber :value="median" suffix=" m" label="median distance" />
  <BigNumber :value="under100" :suffix="`/${n}`" label="under 100 m" />
  <BigNumber :value="exact" label="dead on" />
  <BigNumber :value="20" suffix="/20" label="right country" />
</div>

<DistanceStrip :step="$clicks" class="mt-8" />

<p class="muted text-sm mt-4">Batch 1 · {{ n }} panoramas · distances measured by the organisers</p>

<!--
These aren't our numbers — the organisers measured them.
Two panoramas got the organisers' verdict "Right on the spot!" (170 and 683, both under 10 m).
Everything on this slide is computed from data/batch1.json; edit the JSON, not the slide.
"Right country 20/20" is hardcoded: inferred — no miss is large enough to cross a border.
Click 1: the 20 dots drop in. Click 2: the yellow bracket marks the 13 under 100 m.
Look left: most pins land in the yellow. Look right: six misses over 1 km — the next slide shows three of them.
TODO (not on the slide yet): score vs. baseline and time per panorama, from eval/compare.py.
-->

---

<script setup>
import batch from './data/batch1.json'
const km = id => Math.round(batch.panoramas.find(p => p.id === id).err_m / 1000)
</script>

<div class="kicker">Honest misses</div>

# The answer was <span class="tram">one panorama away.</span>

<div class="grid grid-cols-3 gap-6 mt-8">
  <div v-click class="card">
    <PanoStrip src="/panos/miss-castle.jpg" :height="150" :seconds="100" />
    <div class="mt-3 text-base font-semibold">A castle is a class.</div>
    <div class="terracotta text-5xl font-bold tabular-nums mt-1">{{ km('685') }} km</div>
  </div>
  <div v-click class="card">
    <PanoStrip src="/panos/miss-estuary.jpg" :height="150" :seconds="120" reverse />
    <div class="mt-3 text-base font-semibold">Estuary ≠ estuary.</div>
    <div class="terracotta text-5xl font-bold tabular-nums mt-1">{{ km('179') }} km</div>
  </div>
  <div v-click class="card">
    <PanoStrip src="/panos/miss-twoaddresses.jpg" :height="150" :seconds="110" />
    <div class="mt-3 text-base font-semibold">One name, two addresses.</div>
    <div class="terracotta text-5xl font-bold tabular-nums mt-1">{{ km('141') }} km</div>
  </div>
</div>

<p v-click class="catch text-3xl mt-10 text-center">Every miss became a rule.</p>

<!--
Three honest misses, one click each — then the catch line.
1) 82 km: a castle is a class, not a place — we picked the wrong castle.
2) 31 km: Tagus vs. Sado — two estuaries that look alike.
3) 7 km: we read the sign perfectly, but the geocoder picked the headquarters instead of the branch the panorama shows.
In all three cases a panorama taken minutes before or after was solved within metres. The distance from our wrong pin to that sibling matches the organisers' error almost exactly: 82.3 vs. 82.2 km, 30.9 vs. 30.6 km, 7.3 vs. 7.2 km. So these are not random misses — each one is a reproducible mistake, and each one became a rule for the Professor (next slide).
-->

---

<div class="kicker">Professor · overnight</div>

# Tonight's mistakes. <span class="tram">Tomorrow's instincts.</span>

<div class="flex justify-center mt-12">
  <svg viewBox="0 0 400 260" class="loop">
    <circle cx="200" cy="130" r="95" class="ring" />
    <circle cx="200" cy="130" r="95" class="ring-run" pathLength="1" />
    <g transform="translate(200 35)"><circle r="26" /><text y="7">▶️</text><text y="-36" class="cap">run</text></g>
    <g transform="translate(295 130)"><circle r="26" /><text y="7">👀</text><text x="38" y="5" class="cap r">review</text></g>
    <g transform="translate(200 225)"><circle r="26" /><text y="7">🎓</text><text y="48" class="cap">professor</text></g>
    <g transform="translate(105 130)"><circle r="26" /><text y="7">📚</text><text x="-38" y="5" class="cap l">knowledge</text></g>
  </svg>
</div>

<div class="flex flex-wrap justify-center gap-3 mt-10">
  <span v-click class="pill">🏰 A castle is a class, not a place</span>
  <span v-click class="pill">🏢 Institutions have more than one address</span>
  <span v-click class="pill">📍 Urban needs a street, not a region</span>
</div>

<!--
No ground truth? We review runs ourselves. The Professor turns the misses into general rules, e.g. from batch 1:
- A castle is a class, not a place.
- Institutions have more than one address.
- Urban needs a street, not a region.
Rules are general by design — the Professor never writes "panorama X was in Y". Knowledge was frozen before the scored run.
-->

---
layout: full
---

<PanoStrip src="/panos/railway-cut.jpg" fill shade :seconds="100" />

<div class="absolute inset-0 z-10 flex flex-col items-center justify-center text-center">
  <div class="kicker">Live</div>
  <h1 class="hero">Let's drop a pin.</h1>
  <p class="catch text-2xl mt-4">Fresh panorama. Real time.</p>
</div>

<!--
Switch to the Streamlit UI. Narrate the crew panel while it runs. Stalls? Force-submit — we always have 10 valid pins.
-->

---
layout: full
---

<PanoStrip src="/panos/praca-river.jpg" fill shade :seconds="140" />

<div class="absolute left-16 bottom-14 right-16 z-10">
  <h1 class="hero">Thank you.</h1>
  <div class="flex items-center gap-4 mt-6">
    <div class="tile-stripe w-16"></div>
    <span class="font-bold tracking-wide">Erasmus Team</span>
    <span class="muted">Three Nations. One Goal.</span>
  </div>
</div>
