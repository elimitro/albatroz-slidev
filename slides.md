---
# ===== DECK-WIDE SETTINGS (headmatter) =====
theme: default
title: Navegador — Erasmus Team
info: |
  Navegador · a crew of AI agents that geolocates 360° panoramas.
  Erasmus Team · Three Nations. One Goal. · Albatroz Challenge, JunctionX Lisbon 2026
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

<div class="kicker">The challenge</div>

# Where in the world is <span class="tram">here?</span>

<PanoStrip src="/panos/village-granite.jpg" :height="250" :seconds="70" class="mt-8" />

<div class="flex gap-3 mt-6">
  <span v-click class="pill">🌐 360°</span>
  <span v-click class="pill">🇵🇹 🇪🇸 🇫🇷 + islands</span>
  <span v-click class="pill">🚫 no street names</span>
  <span v-click class="pill tram-pill">📍 10 pins</span>
</div>

<!--
GeoGuessr — but the map is Iberia + France, and 500 m off in a city already hurts.
-->

---

<div class="kicker">The boss level</div>

# Looks alike. <span class="tram">Lives apart.</span>

<div class="grid grid-cols-2 gap-6 mt-10">
  <div v-click class="relative">
    <PanoStrip src="/panos/village-granite.jpg" :height="230" :seconds="80" />
    <span class="letter">A</span>
  </div>
  <div v-click class="relative">
    <PanoStrip src="/panos/park-church.jpg" :height="230" :seconds="80" reverse />
    <span class="letter">B</span>
  </div>
</div>

<p v-click class="catch text-2xl mt-10 text-center">Old stone. Quiet square. Which country?</p>

<!--
Let the room guess for 3 seconds. TODO: reveal the answer you're sure about.
Briefing theme: far-apart places that look alike.
-->

---

<div class="kicker">The idea</div>

# One brain guesses. <span class="tram">A crew investigates.</span>

<div class="grid grid-cols-5 gap-10 mt-14 items-center">
  <div class="col-span-2 text-center opacity-60">
    <div class="solo">🤖<span class="scribble">?!?</span></div>
    <div class="muted mt-4 text-sm">one look · one guess</div>
  </div>
  <div v-click class="col-span-3">
    <div class="crew-grid">
      <div><span>🔍</span>Lupa</div><div><span>☀️</span>Astrolábio</div><div><span>📖</span>Leitor</div>
      <div><span>🌿</span>Geógrafo</div><div><span>🕵️</span>Detetive</div><div><span>⚖️</span>Advogado</div>
      <div><span>🧭</span>Navegador</div><div><span>♟️</span>Estratega</div><div><span>✍️</span>Escrivão</div>
    </div>
  </div>
</div>

<!--
Same lesson as our summer project: one chatbot is smart but chaotic — a crew with roles is reliable.
"And yes, they all have Portuguese names."
-->

---
clicks: 10
transition: slide-left
---

<CrewStory :step="$clicks" />

<!--
Clicker drives the film: one click = one crew member.
0 intro · 1 Lupa · 2 Astrolábio · 3 Leitor · 4 Geógrafo · 5 Detetive · 6 Advogado · 7 Navegador · 8 Estratega · 9 Escrivão · 10 overview.
One sentence per agent, let the animation do the talking.
-->

---

<div class="kicker">Rule #1</div>

# No receipt, <span class="tram">no pin.</span>

<div class="flex items-center justify-center gap-16 mt-12">
  <div class="bigpin">📍</div>
  <div v-click class="receipt">
    <div class="r-head">RECEIPT</div>
    <div class="r-row"><span>source</span><b>OpenStreetMap</b></div>
    <div class="r-row"><span>call_id</span><b>geo:7f3a9c</b></div>
    <div class="r-row"><span>status</span><b class="tram">verified ✓</b></div>
  </div>
</div>

<p v-click class="catch text-2xl mt-12 text-center">The model reasons. The map answers.</p>

<!--
LLMs love to invent coordinates. Ours can't: a pin only exists if a real lookup produced it.
-->

---

<div class="kicker">Humans in the loop</div>

# Ask smart. <span class="tram">Not often.</span>

<div class="grid grid-cols-2 gap-14 mt-10 items-center">
  <div class="mcq-mock">
    <div class="flex justify-between items-baseline"><b>Which zone fits?</b><span class="terracotta text-xs font-mono">×0.95</span></div>
    <div class="opt pick">A · Tagus estuary</div>
    <div class="opt">B · Douro valley</div>
    <div class="opt">C · Neither</div>
  </div>
  <div>
    <div v-click class="flex gap-1.5">
      <div class="lockpin first">🔒</div>
      <div v-for="i in 9" :key="i" class="lockpin">📍</div>
    </div>
    <p v-after class="muted text-sm mt-3">Commit first. Then ask.</p>
    <div v-click class="flex gap-3 mt-8">
      <span class="pill">🖱️ click</span><span class="pill">max 2 questions</span><span class="pill">🛡️ cue guard</span>
    </div>
  </div>
</div>

<!--
The agent writes the question, we only click. Penalties only hit pins committed after the question — so we lock the best guess first.
-->

---
layout: center
class: text-center
---

<div class="kicker">Results</div>

# Crew <span class="tram">vs.</span> single model

<div class="grid grid-cols-4 gap-10 mt-14">
  <BigNumber value="??" label="score vs. baseline" />
  <BigNumber value="??" label="right country" />
  <BigNumber value="??" label="median distance" />
  <BigNumber value="??" label="per panorama" />
</div>

<!--
TODO: real numbers from eval/compare.py, e.g.
  <BigNumber :value="2.4" :decimals="1" suffix="×" label="score vs. baseline" />
  <BigNumber :value="90" suffix="%" label="right country" />
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

<!--
No ground truth? We review runs ourselves. The Professor turns them into general rules ("red CTT mailbox ⇒ Portugal"), never "panorama X was in Y". Frozen before the scored run.
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
  <h1 class="hero">Obrigado.</h1>
  <div class="flex items-center gap-4 mt-6">
    <div class="tile-stripe w-16"></div>
    <span class="font-bold tracking-wide">Erasmus Team</span>
    <span class="muted">Three Nations. One Goal.</span>
  </div>
</div>
