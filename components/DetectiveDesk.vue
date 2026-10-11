<script setup lang="ts">
/**
 * DetectiveDesk — "The Detective · under the hood".
 *
 * The Detective never sees the photo. It gets clues (Reader, Geographer, sun observation),
 * checks each one against a real source and drops pins on a mini map.
 * Lanes run left → right:  clue card → Detective → source (+ logo) → mini map.
 *
 * Usage in slides.md:   clicks: 4   +   <DetectiveDesk :step="$clicks" />
 * 0 clues only · 1 Nominatim · 2 Overpass + Wikipedia · 3 pvlib sun check · 4 best pin + receipt.
 * The dots at the bottom left are clickable too (same pattern as CrewStory).
 *
 * All lane data lives in LANES below. Map pins are (lng, lat) and get projected onto the
 * simplified mainland Portugal outline.
 */
import { computed, ref, watch } from 'vue'

const props = defineProps<{ step?: number }>()

type Pin = { id: string; lng: number; lat: number; p: number; p2?: number; struck?: boolean; best?: boolean }
type Logo = 'osm' | 'wiki' | 'sun'
type Lane = {
  n: number
  y: number
  clue: { icon: string; text: string }
  src: { logo: Logo; name: string; cap: string; w: number }
  extra: { logo: Logo; name: string; w: number } | null
  query: string
  pins: Pin[]
}

// TODO: replace with a real run from runs/<id>/detective.json
// p = confidence in % when the pin lands, p2 = after the sun check re-weights; struck = flagged by the sun.
const LANES: Lane[] = [
  {
    n: 1, y: 50,
    clue: { icon: '📖', text: 'Rua …' }, // TODO: replace with a real run from runs/<id>/detective.json
    src: { logo: 'osm', name: 'Nominatim', cap: 'geocoder', w: 138 },
    extra: null,
    query: 'geocode("Rua …, PT")',
    pins: [{ id: 'rua', lng: -9.10, lat: 38.74, p: 62, p2: 72, best: true }],
  },
  {
    n: 2, y: 150,
    clue: { icon: '🏰', text: 'castle on a hill' }, // TODO: replace with a real run from runs/<id>/detective.json
    src: { logo: 'osm', name: 'Overpass', cap: 'POIs by tag', w: 130 },
    extra: { logo: 'wiki', name: 'Wikipedia', w: 86 },
    query: '[historic=castle] in bbox',
    pins: [
      { id: 'guimaraes', lng: -8.29, lat: 41.45, p: 10, p2: 14 },
      { id: 'obidos', lng: -9.16, lat: 39.36, p: 10, p2: 14 },
      { id: 'marvao', lng: -7.38, lat: 39.39, p: 9, struck: true },
      { id: 'silves', lng: -8.44, lat: 37.19, p: 9, struck: true },
    ],
  },
  {
    n: 3, y: 250,
    clue: { icon: '☀️', text: 'sun 20°' }, // TODO: replace with a real run from runs/<id>/detective.json
    src: { logo: 'sun', name: 'pvlib', cap: 'sun physics', w: 138 },
    extra: null,
    query: 'sun_check(lat, lng, t)',
    pins: [],
  },
]

// ---- step handling: Slidev clicks drive it, the dots can override ------------
const LAST = 4
const manual = ref<number | null>(null)
watch(() => props.step, () => { manual.value = null })
const s = computed(() => Math.max(0, Math.min(LAST, manual.value ?? props.step ?? 0)))

// ---- layout (px inside the 868×300 stage) -----------------------------------
const CLUE_W = 156
const DET = { l: 224, r: 300, y: 150 }
const SRC_X = 358
const MAP = { x: 608, w: 260, h: 288 }

const curve = (x1: number, y1: number, x2: number, y2: number) => {
  const m = (x1 + x2) / 2
  return `M${x1} ${y1} C${m} ${y1} ${m} ${y2} ${x2} ${y2}`
}
const wires = LANES.map(l => {
  const right = SRC_X + l.src.w + (l.extra ? 8 + l.extra.w : 0)
  return {
    n: l.n,
    inn: curve(CLUE_W, l.y, DET.l, DET.y),
    out: curve(DET.r, DET.y, SRC_X, l.y),
    map: `M${right} ${l.y} L${MAP.x} ${l.y}`,
  }
})

// ---- map: simplified mainland Portugal, (lng, lat) → map-card px -------------
const PT: [number, number][] = [
  [-8.87, 41.87], [-8.6, 42.05], [-8.2, 42.15], [-8.1, 41.82], [-7.2, 41.88], [-6.6, 41.95], [-6.2, 41.6],
  [-6.55, 41.25], [-6.9, 41.0], [-6.85, 40.3], [-7.0, 39.67], [-7.53, 39.66], [-7.25, 39.3], [-7.0, 38.9],
  [-7.3, 38.45], [-7.1, 38.15], [-7.5, 37.55], [-7.42, 37.18], [-7.9, 37.0], [-8.6, 37.1], [-8.99, 37.02],
  [-8.8, 37.4], [-8.8, 37.95], [-8.75, 38.3], [-8.98, 38.45], [-9.2, 38.42], [-9.25, 38.66], [-9.49, 38.71],
  [-9.42, 39.0], [-9.35, 39.37], [-9.05, 39.75], [-8.9, 40.15], [-8.65, 40.9], [-8.75, 41.4],
]
const K = 51
const px = (lng: number) => 14 + (lng + 9.55) * K
const py = (lat: number) => 12 + (42.2 - lat) * K
const ptPath = 'M' + PT.map(([g, a]) => `${px(g).toFixed(1)},${py(a).toFixed(1)}`).join(' L') + ' Z'
const PIN = 'M0 0 C -5 -9 -9 -13 -9 -19 A9 9 0 1 1 9 -19 C9 -13 5 -9 0 0 Z'

const pins = LANES.flatMap(l => l.pins.map((p, k) => ({ ...p, lane: l.n, k, x: px(p.lng), y: py(p.lat) })))
const bestPin = pins.find(p => p.best)!

// transition delays (s) inside a lane, measured from the moment the lane lights up
const D = { wireIn: .15, src: .35, wireOut: .45, extra: .55, chip: .8, wireMap: .9, pin: 1.1, pinStep: .25, strike: 1.1, fade: 1.9, weigh: 2.3 }
</script>

<template>
  <div class="desk">
    <div class="stage">
      <!-- wires -->
      <svg class="wires" :viewBox="`0 0 868 300`">
        <g v-for="(w, i) in wires" :key="w.n" class="lane-w" :class="{ lit: s >= w.n, active: s === w.n }">
          <path :d="w.inn" class="wire" :style="{ '--d': D.wireIn + 's' }" />
          <path :d="w.out" class="wire" :style="{ '--d': D.wireOut + 's' }" />
          <path :d="w.map" class="wire" :style="{ '--d': D.wireMap + 's' }" />
        </g>
      </svg>

      <!-- clue cards -->
      <div v-for="l in LANES" :key="'c' + l.n" class="clue" :class="{ lit: s >= l.n, active: s === l.n }"
           :style="{ top: l.y - 22 + 'px', width: CLUE_W + 'px' }">
        <span class="e">{{ l.clue.icon }}</span><span>{{ l.clue.text }}</span>
      </div>

      <!-- the Detective -->
      <div class="det" :class="{ busy: s >= 1 && s <= 3 }" :style="{ left: DET.l + 'px', top: DET.y - 38 + 'px' }">🕵️</div>
      <div class="det-label" :style="{ left: DET.l - 12 + 'px', top: DET.y + 44 + 'px' }">clues only —<br>no pixels</div>

      <!-- sources + query chips -->
      <template v-for="l in LANES" :key="'s' + l.n">
        <div class="src" :class="{ lit: s >= l.n, active: s === l.n }"
             :style="{ left: SRC_X + 'px', top: l.y - 24 + 'px', '--d': D.src + 's' }">
          <div class="scard" :style="{ width: l.src.w + 'px' }">
            <span class="logo">
              <simple-icons-openstreetmap v-if="l.src.logo === 'osm'" />
              <carbon-sun v-else-if="l.src.logo === 'sun'" />
            </span>
            <span class="txt"><b>{{ l.src.name }}</b><i>{{ l.src.cap }}</i></span>
          </div>
          <div v-if="l.extra" class="scard small" :style="{ width: l.extra.w + 'px', '--d': D.extra + 's' }">
            <span class="logo"><simple-icons-wikipedia /></span>
            <b>{{ l.extra.name }}</b>
          </div>
        </div>
        <div class="chip-q" :class="{ lit: s >= l.n }" :style="{ left: SRC_X + 'px', top: l.y + 30 + 'px', '--d': D.chip + 's' }">{{ l.query }}</div>
      </template>

      <!-- mini map -->
      <div class="map" :style="{ left: MAP.x + 'px', width: MAP.w + 'px', height: MAP.h + 'px' }">
        <svg :viewBox="`0 0 ${MAP.w} ${MAP.h}`" class="mapsvg">
          <path :d="ptPath" class="land" />
          <g v-for="p in pins" :key="p.id" :transform="`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`">
            <circle r="13" class="ripple" :class="{ on: s >= 4 && p.best }" />
            <g class="drop" :class="[`l${p.lane}`, { on: s >= p.lane, struck: s >= 3 && p.struck, best: s >= 4 && p.best }]"
               :style="{ '--d': (D.pin + p.k * D.pinStep) + 's', '--sd': (D.strike + p.k * .15) + 's', '--fd': (D.fade + p.k * .12) + 's' }">
              <g class="body">
                <path :d="PIN" transform="scale(.8)" class="pin" />
                <circle cy="-15.2" r="2.8" class="hole" />
              </g>
              <g class="strike"><path d="M-6 -21 L6 -9 M6 -21 L-6 -9" /></g>
              <g class="pct" :class="{ re: s >= 3 }">
                <text x="13" y="-11" class="a">{{ p.p }}%</text>
                <text v-if="p.p2" x="13" y="-11" class="b" :style="{ '--wd': D.weigh + 's' }">{{ p.p2 }}%</text>
              </g>
            </g>
          </g>
        </svg>
        <div class="rwrap" :class="{ on: s >= 4 }" :style="{ top: py(bestPin.lat) - 76 + 'px' }">
          <div class="receipt mini">
            <div class="r-head">RECEIPT</div>
            <div class="r-row"><span>source</span><b>OpenStreetMap</b></div>
            <div class="r-row"><span>call_id</span><b>geo:7f3a9c</b></div>
            <div class="r-row"><span>status</span><b class="tram">verified ✓</b></div>
          </div>
        </div>
      </div>
    </div>

    <!-- bottom row: step dots · catch line · attribution -->
    <div class="foot">
      <div class="dots">
        <button v-for="i in LAST + 1" :key="i" class="dot" :class="{ lit: i - 1 <= s, cur: i - 1 === s }"
                :aria-label="`step ${i - 1}`" @click="manual = i - 1" />
      </div>
      <p class="catch line" :class="{ on: s >= 4 }">No receipt, no pin.</p>
      <div class="attr">Map data © OpenStreetMap contributors</div>
    </div>
  </div>
</template>

<style scoped>
.desk { --ease: cubic-bezier(.22, .9, .25, 1); width: 868px; margin: 0 auto; }
.stage { position: relative; width: 868px; height: 300px; }

/* ---------- wires ---------- */
.wires { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; }
.wire { fill: none; stroke: var(--nav-tram); stroke-width: 1.6; stroke-dasharray: 4 6; stroke-linecap: round; opacity: 0;
  transition: opacity .6s var(--ease); transition-delay: var(--d, 0s); }
.lane-w.lit .wire { opacity: .38; }
.lane-w.active .wire { opacity: .95; animation: flow 1s linear infinite; }
@keyframes flow { to { stroke-dashoffset: -20; } }

/* ---------- clue cards ---------- */
.clue { position: absolute; left: 0; height: 44px; display: flex; align-items: center; gap: 10px; padding: 0 14px; border-radius: 12px;
  background: var(--nav-deep); border: 1px solid var(--nav-line); font-size: 14px; white-space: nowrap; opacity: .32;
  transition: opacity .6s var(--ease); }
.clue .e { font-size: 18px; }
.clue::before, .clue::after { content: ''; position: absolute; inset: -1px; border-radius: 12px; pointer-events: none; opacity: 0;
  transition: opacity .6s var(--ease); }
.clue::before { border: 1px solid var(--nav-tram); }
.clue::after { box-shadow: 0 0 22px rgba(246, 196, 67, .38); }
.clue.lit { opacity: 1; }
.clue.lit::before { opacity: 1; }
.clue.active::after { opacity: 1; }

/* ---------- the Detective ---------- */
.det { position: absolute; width: 76px; height: 76px; border-radius: 50%; display: grid; place-items: center; font-size: 38px;
  background: var(--nav-deep); box-shadow: 0 0 0 2px var(--nav-tram); }
.det::after { content: ''; position: absolute; inset: 0; border-radius: 50%; box-shadow: 0 0 34px rgba(246, 196, 67, .45); opacity: .35; }
.det.busy::after { animation: breathe 1.8s ease-in-out infinite; }
@keyframes breathe { 0%, 100% { opacity: .25; } 50% { opacity: 1; } }
.det-label { position: absolute; width: 100px; text-align: center; font: 10px/1.35 var(--slidev-code-font-family, monospace);
  letter-spacing: .04em; color: var(--nav-muted); }

/* ---------- sources ---------- */
.src { position: absolute; display: flex; gap: 8px; opacity: 0; transform: translateX(-14px);
  transition: opacity .6s var(--ease), transform .7s var(--ease); transition-delay: var(--d); }
.src.lit { opacity: 1; transform: none; }
.scard { position: relative; height: 48px; display: flex; align-items: center; gap: 10px; padding: 0 12px; border-radius: 12px;
  background: var(--nav-deep); border: 1px solid var(--nav-line); color: var(--nav-cream); box-sizing: border-box; }
.scard::after { content: ''; position: absolute; inset: -1px; border-radius: 12px; border: 1px solid var(--nav-tram);
  box-shadow: 0 0 24px rgba(246, 196, 67, .4); opacity: 0; pointer-events: none; transition: opacity .6s var(--ease) .2s; }
.src.active .scard::after { opacity: 1; }
.logo { font-size: 22px; line-height: 0; flex: none; color: var(--nav-cream); }
.txt { display: flex; flex-direction: column; line-height: 1.15; }
.txt b { font-size: 14px; font-weight: 600; }
.txt i { font: 10px var(--slidev-code-font-family, monospace); font-style: normal; color: var(--nav-muted); margin-top: 1px; white-space: nowrap; }
.scard.small { padding: 0 10px; gap: 6px; opacity: 0; transition: opacity .6s var(--ease); transition-delay: var(--d); }
.scard.small .logo { font-size: 15px; }
.scard.small b { font-size: 11px; font-weight: 600; }
.src.lit .scard.small { opacity: 1; }
.chip-q { position: absolute; padding: 2px 8px; border-radius: 6px; border: 1px solid var(--nav-line); background: rgba(7, 17, 27, .75);
  font: 10px var(--slidev-code-font-family, monospace); color: var(--nav-azulejo-soft); white-space: nowrap; opacity: 0; transform: translateY(5px);
  transition: opacity .5s var(--ease), transform .6s var(--ease); transition-delay: var(--d); }
.chip-q.lit { opacity: 1; transform: none; }

/* ---------- mini map ---------- */
.map { position: absolute; top: 6px; border-radius: 16px; overflow: hidden; background: #07111b;
  box-shadow: 0 20px 60px rgba(0, 0, 0, .4), 0 0 0 1px var(--nav-line);
  background-image: linear-gradient(rgba(155, 188, 255, .05) 1px, transparent 1px), linear-gradient(90deg, rgba(155, 188, 255, .05) 1px, transparent 1px);
  background-size: 26px 26px; }
.mapsvg { position: absolute; inset: 0; width: 100%; height: 100%; }
.land { fill: rgba(61, 123, 240, .12); stroke: var(--nav-azulejo-soft); stroke-width: 1.2; }

.drop { opacity: 0; transform: translateY(-34px); transition: transform .7s cubic-bezier(.3, 1.5, .5, 1), opacity .4s; transition-delay: var(--d); }
.drop.on { opacity: 1; transform: none; }
.pin { fill: var(--nav-azulejo-soft); stroke: var(--nav-night); stroke-width: 1.4; }
.drop.l1 .pin { fill: var(--nav-tram); }
.hole { fill: var(--nav-night); }

.body { transform-box: fill-box; transform-origin: 50% 100%; opacity: 1; transition: transform .6s var(--ease), opacity .6s var(--ease); }
.drop.best .body { transform: scale(1.3); }
.drop.struck .body { opacity: 0; transition-delay: var(--fd); }

.strike { opacity: 0; transform: scale(0); transform-box: fill-box; transform-origin: center;
  transition: transform .5s cubic-bezier(.3, 1.6, .5, 1), opacity .5s var(--ease); }
.strike path { fill: none; stroke: var(--nav-terracotta); stroke-width: 3; stroke-linecap: round; }
.drop.struck .strike { opacity: 1; transform: scale(1.35); transition-delay: var(--sd); }
.drop.struck .strike { animation: strikeout .01s linear var(--fd) forwards; }
@keyframes strikeout { to { opacity: 0; } }

.pct text { font: 700 11px var(--slidev-code-font-family, monospace); fill: var(--nav-cream); paint-order: stroke; stroke: var(--nav-night);
  stroke-width: 3px; stroke-linejoin: round; transition: opacity .6s var(--ease); }
.drop.l1 .pct text { fill: var(--nav-tram); }
.pct .b { opacity: 0; }
.pct.re .a { opacity: 0; transition-delay: var(--wd, 2.3s); }
.pct.re .b { opacity: 1; transition-delay: var(--wd, 2.3s); }
.drop.struck .pct { opacity: 0; transition: opacity .6s var(--ease); transition-delay: var(--fd); }

.ripple { fill: none; stroke: var(--nav-tram); stroke-width: 1.5; opacity: 0; transform-box: fill-box; transform-origin: center; }
.ripple.on { animation: ripple 2s ease-out .5s infinite; }
@keyframes ripple { 0% { opacity: .9; transform: scale(.2); } 100% { opacity: 0; transform: scale(2.8); } }

/* receipt slides in next to the best pin */
.rwrap { position: absolute; left: 88px; opacity: 0; transform: translateX(26px); pointer-events: none;
  transition: opacity .6s var(--ease), transform .8s var(--ease); }
.rwrap.on { opacity: 1; transform: none; transition-delay: .35s; }
.receipt.mini { width: 164px; padding: 10px 12px 20px; box-sizing: border-box; }
.receipt.mini .r-head { font-size: .6rem; padding-bottom: 6px; margin-bottom: 6px; }
.receipt.mini .r-row { font-size: .6rem; padding: 2px 0; gap: 8px; }

/* ---------- bottom row ---------- */
.foot { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; height: 42px; margin-top: 8px; }
.line { margin: 0; font-size: 26px; opacity: 0; transform: translateY(8px); transition: opacity .7s var(--ease), transform .8s var(--ease); }
.line.on { opacity: 1; transform: none; transition-delay: .9s; }
.attr { justify-self: end; font: 10px var(--slidev-code-font-family, monospace); color: var(--nav-muted); }
.dots { display: flex; gap: 4px; }
.dot { width: 16px; height: 16px; padding: 0; background: none; border: 0; cursor: pointer; position: relative; }
.dot::after { content: ''; position: absolute; left: 4px; top: 4px; width: 8px; height: 8px; border-radius: 50%; background: var(--nav-line);
  transition: transform .4s var(--ease), background-color .4s var(--ease); }
.dot.lit::after { background: var(--nav-azulejo); }
.dot.cur::after { background: var(--nav-tram); transform: scale(1.3); }
</style>
