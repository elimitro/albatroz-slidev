<script setup lang="ts">
/**
 * CrewStory — the architecture as an animated short film.
 *
 * One Lisbon panorama travels through the crew. Each click = one agent walks on stage,
 * gets introduced (card on the right) and shows its job directly on the panorama / map.
 * Click 10 = overview of the whole crew.
 *
 * Usage in slides.md:   clicks: 10   +   <CrewStory :step="$clicks" />
 * The rail at the bottom is clickable too (jump to any agent with the mouse).
 *
 * All overlay coordinates are in % of the 2000×1000 panorama, so they stay glued to the
 * picture at any screen size. To swap the panorama, re-measure the boxes in READER / GEO.
 */
import { computed, ref, watch } from 'vue'

const props = defineProps<{ step?: number }>()
const BASE = import.meta.env.BASE_URL
const PANO = `${BASE}panos/lisbon-marvila.jpg`

type Kind = 'agent' | 'tool' | 'story'
const SCENES: { emoji: string; name: string; role: string; line: string; kind: Kind }[] = [
  { emoji: '🎬', name: 'One panorama', role: '360° · one timestamp', line: 'Nine specialists. One pin.', kind: 'story' },
  { emoji: '🔍', name: 'Lens', role: 'The Magnifier', line: 'One sphere. Thirteen views.', kind: 'tool' },
  { emoji: '☀️', name: 'Astrolabe', role: 'The Astrolabe', line: 'The sun hides. Its shadows don’t.', kind: 'tool' },
  { emoji: '📖', name: 'Reader', role: 'The Reader', line: 'Every sign is a clue.', kind: 'agent' },
  { emoji: '🌿', name: 'Geographer', role: 'The Geographer', line: 'Stones and façades speak, too.', kind: 'agent' },
  { emoji: '🕵️', name: 'Detective', role: 'The Detective', line: 'No receipt, no pin.', kind: 'agent' },
  { emoji: '⚖️', name: 'Advocate', role: "The Devil's Advocate", line: 'Attacks the favourite.', kind: 'agent' },
  { emoji: '🧭', name: 'Navigator', role: 'The Captain', line: 'Asks only when it pays.', kind: 'agent' },
  { emoji: '♟️', name: 'Strategist', role: 'The Strategist', line: 'Ten pins. One spot.', kind: 'tool' },
  { emoji: '✍️', name: 'Scribe', role: 'The Scribe', line: 'Every thought on the record.', kind: 'tool' },
  { emoji: '🗺️', name: 'The crew', role: 'end to end', line: 'Panorama in. Ten pins out.', kind: 'story' },
]
const LAST = SCENES.length - 1

// ---- step handling: Slidev clicks drive it, the rail can override ----------
const manual = ref<number | null>(null)
watch(() => props.step, () => { manual.value = null })
const s = computed(() => Math.max(0, Math.min(LAST, manual.value ?? props.step ?? 0)))
const scene = computed(() => SCENES[s.value])

// ---- overlay data (percent of panorama) -----------------------------------
const READER = [
  { l: 16, t: 33, w: 8, h: 8, label: 'ABEL PEREIRA DA FONSECA', pos: 'above' },
  { l: 15.9, t: 53.3, w: 2.2, h: 3.2, label: 'PORTO DE LISBOA', pos: 'above' },
]
const GEO = [
  { l: 35, t: 58, w: 23, h: 19, label: 'mosaic pavement', pos: 'below' },
  { l: 67.5, t: 19.5, w: 16.5, h: 39, label: 'Art Nouveau façade', pos: 'above' },
  { l: 70.5, t: 62, w: 17.5, h: 28, label: 'tram rails', pos: 'below' },
]

// ---- map: simplified mainland Portugal, (lng, lat) → svg units -------------
const PT: [number, number][] = [
  [-8.87, 41.87], [-8.6, 42.05], [-8.2, 42.15], [-8.1, 41.82], [-7.2, 41.88], [-6.6, 41.95], [-6.2, 41.6],
  [-6.55, 41.25], [-6.9, 41.0], [-6.85, 40.3], [-7.0, 39.67], [-7.53, 39.66], [-7.25, 39.3], [-7.0, 38.9],
  [-7.3, 38.45], [-7.1, 38.15], [-7.5, 37.55], [-7.42, 37.18], [-7.9, 37.0], [-8.6, 37.1], [-8.99, 37.02],
  [-8.8, 37.4], [-8.8, 37.95], [-8.75, 38.3], [-8.98, 38.45], [-9.2, 38.42], [-9.25, 38.66], [-9.49, 38.71],
  [-9.42, 39.0], [-9.35, 39.37], [-9.05, 39.75], [-8.9, 40.15], [-8.65, 40.9], [-8.75, 41.4],
]
const OX = 215, OY = 20 // where the map sits inside the 600×300 stage
const px = (lng: number) => OX + (lng + 9.6) * 50
const py = (lat: number) => OY + (42.2 - lat) * 50
const ptPath = 'M' + PT.map(([g, a]) => `${px(g).toFixed(1)},${py(a).toFixed(1)}`).join(' L') + ' Z'
const LIS = { x: px(-9.1022), y: py(38.7424) } // Marvila, Lisbon
const OPO = { x: px(-8.61), y: py(41.15) }
const PIN = 'M0 0 C -5 -9 -9 -13 -9 -19 A9 9 0 1 1 9 -19 C9 -13 5 -9 0 0 Z'
const CLUES = ['📖  Portuguese signage', '🌿  mosaic + Art Nouveau', '☀️  shadow bearing ✓']

// ---- overview graph ---------------------------------------------------------
const FLOW = [
  { e: '🔍', n: 'Lens', x: 45, y: 150 }, { e: '☀️', n: 'Astrolabe', x: 115, y: 150 },
  { e: '📖', n: 'Reader', x: 190, y: 100 }, { e: '🌿', n: 'Geographer', x: 190, y: 200 },
  { e: '🕵️', n: 'Detective', x: 265, y: 150 }, { e: '⚖️', n: 'Advocate', x: 335, y: 150 },
  { e: '🧭', n: 'Navigator', x: 405, y: 150 }, { e: '♟️', n: 'Strategist', x: 475, y: 150 },
  { e: '✍️', n: 'Scribe', x: 545, y: 150 },
]
const FLOW_EDGES = [[0, 1], [1, 2], [1, 3], [2, 4], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8]]

const LOG = [
  ['+00:04', 'lens', '13 views cut'],
  ['+00:31', 'reader', 'read “ABEL PEREIRA DA FONSECA”'],
  ['+00:52', 'geographer', 'mosaic pavement + Art Nouveau'],
  ['+01:12', 'detective', 'Marvila, Lisbon · receipt geo:7f3a9c'],
  ['+01:40', 'human', 'MCQ → A (×0.95)'],
  ['+02:05', 'strategist', '10 pins committed'],
  ['+02:31', 'scribe', 'verified by organisers: 43 m'],
]

const dimPano = computed(() => s.value === 1 || s.value >= 5)
const pad = (n: number) => String(n).padStart(2, '0')
</script>

<template>
  <div class="story">
    <!-- header -->
    <div class="head">
      <span class="kick">Follow one panorama</span>
      <span class="count" v-if="s > 0 && s < LAST">{{ pad(s) }} / {{ pad(LAST - 1) }}</span>
    </div>

    <div class="main">
      <!-- ================= STAGE ================= -->
      <div class="stage">
        <img :src="PANO" class="pano" :class="{ dim: dimPano, map: s >= 5 }" alt="" />

        <!-- 1 · Lens: the sphere unfolds into views -->
        <div class="layer" :class="{ on: s === 1 }">
          <div v-for="i in 8" :key="i" class="tile"
               :style="{ '--i': i - 1, '--gl': `${4 + ((i - 1) % 4) * 23.4}%`, '--gt': `${8 + Math.floor((i - 1) / 4) * 46}%`,
                        backgroundImage: `url(${PANO})`, backgroundPosition: `${((i - 1) / 7) * 100}% 52%` }">
            <span>h{{ String((i - 1) * 45).padStart(3, '0') }}</span>
          </div>
        </div>

        <!-- 2 · Astrolabe: hard shadows point back to the hidden sun, then north -->
        <svg class="layer" :class="{ on: s === 2 }" viewBox="0 0 200 100">
          <rect x="60" y="62" width="96" height="30" rx="3" class="shade" />
          <g class="slabel"><rect x="60" y="55.5" width="27" height="6" rx="1.5" /><text x="62" y="59.8">hard shadows</text></g>
          <path d="M 106 70 C 100 50 78 36 60 19" pathLength="1" class="arc-bg" />
          <path d="M 106 70 C 100 50 78 36 60 19" pathLength="1" class="arc" />
          <polygon points="0,0 -4.4,-2.4 -4.4,2.4" transform="translate(60 19) rotate(-137)" class="ahead" />
          <g class="sun"><circle cx="58.5" cy="12.5" r="9" class="glow" /><circle cx="58.5" cy="12.5" r="3.6" class="core" /></g>
          <line x1="124" y1="29" x2="124" y2="60" class="north" />
          <g class="nlabel"><circle cx="124" cy="23" r="6" /><text x="124" y="25.2">N</text></g>
          <g transform="translate(182 82)"><circle r="11" class="dial" /><g class="needle"><polygon points="0,-9 2.5,0 0,2 -2.5,0" /></g></g>
        </svg>

        <!-- 3 · Reader: text boxes -->
        <div class="layer" :class="{ on: s === 3 }">
          <div v-for="(b, i) in READER" :key="b.label" class="box reader" :style="{ left: b.l + '%', top: b.t + '%', width: b.w + '%', height: b.h + '%', '--d': i }">
            <span class="lbl" :class="b.pos">{{ b.label }}</span>
          </div>
        </div>

        <!-- 4 · Geographer: landscape & architecture -->
        <div class="layer" :class="{ on: s === 4 }">
          <div v-for="(b, i) in GEO" :key="b.label" class="box geo" :style="{ left: b.l + '%', top: b.t + '%', width: b.w + '%', height: b.h + '%', '--d': i }">
            <span class="lbl" :class="b.pos">{{ b.label }}</span>
          </div>
        </div>

        <!-- 5–8 · the map acts -->
        <svg class="layer mapl" :class="{ on: s >= 5 && s <= 8 }" viewBox="0 0 600 300">
          <path :d="ptPath" class="land" />

          <!-- 5 Detective: clues fly in, pin drops, receipt -->
          <g :class="['clues', { on: s === 5 }]">
            <g v-for="(c, i) in CLUES" :key="i" class="clue" :style="{ '--d': i }">
              <rect x="16" :y="72 + i * 44" width="186" height="30" rx="15" />
              <text x="30" :y="92 + i * 44">{{ c }}</text>
              <path :d="`M202 ${87 + i * 44} Q 222 ${87 + i * 44} ${LIS.x} ${LIS.y - 22}`" pathLength="1" class="wire" />
            </g>
          </g>
          <g :transform="`translate(${LIS.x} ${LIS.y})`">
            <circle r="14" class="ripple" :class="{ on: s >= 5 }" />
            <g class="drop" :class="{ on: s >= 5 && s <= 7 }" style="--d: 3"><path :d="PIN" class="pin" /><circle cy="-19" r="3.5" class="hole" /></g>
          </g>
          <g class="tag" :class="{ on: s === 5 }" style="--d: 4">
            <rect :x="LIS.x + 26" :y="LIS.y - 4" width="146" height="24" rx="6" />
            <text :x="LIS.x + 36" :y="LIS.y + 12">🧾 receipt · geo:7f3a9c ✓</text>
          </g>

          <!-- 6 Advocate: a rival appears -->
          <g :transform="`translate(${OPO.x} ${OPO.y})`">
            <g class="drop rival" :class="{ on: s === 6 || s === 7, gone: s === 7 }" :style="{ '--d': 1 }"><path :d="PIN" class="pin2" /><circle cy="-19" r="3.5" class="hole" /></g>
          </g>
          <g class="tag bubble" :class="{ on: s === 6 }" style="--d: 3">
            <rect :x="OPO.x + 16" :y="OPO.y - 44" width="138" height="26" rx="13" />
            <text :x="OPO.x + 28" :y="OPO.y - 27">“Porto has tiles too.”</text>
          </g>
          <g class="tag" :class="{ on: s === 6 }" style="--d: 5">
            <text :x="OPO.x + 16" :y="OPO.y - 2" class="pct">45%</text>
            <text :x="LIS.x + 26" :y="LIS.y + 4" class="pct">55%</text>
          </g>

          <!-- 7 Navigator: one smart question -->
          <g class="tag mcq" :class="{ on: s === 7 }" style="--d: 1">
            <rect x="398" y="92" width="184" height="124" rx="12" class="card" />
            <text x="414" y="116" class="q">Which zone fits?</text>
            <text x="566" y="116" class="price">×0.95</text>
            <rect x="414" y="128" width="152" height="30" rx="8" class="opt pick" />
            <text x="426" y="148">A · Tagus estuary</text>
            <rect x="414" y="168" width="152" height="30" rx="8" class="opt" />
            <text x="426" y="188">B · Douro valley</text>
          </g>

          <!-- 8 Strategist: ten pins, one spot -->
          <g :transform="`translate(${LIS.x} ${LIS.y})`">
            <g v-for="i in 10" :key="i" class="drop stack" :class="{ on: s === 8 }" :style="{ '--d': i * 0.6 }">
              <g :transform="`translate(${(i - 1) * 1.2 - 5} ${-(i - 1) * 3.5})`"><path :d="PIN" class="pin" /></g>
            </g>
          </g>
          <g class="tag" :class="{ on: s === 8 }" style="--d: 7.5">
            <rect :x="LIS.x + 18" :y="LIS.y - 58" width="54" height="28" rx="14" class="badge" />
            <text :x="LIS.x + 45" :y="LIS.y - 39" class="x10">×10</text>
          </g>
        </svg>

        <!-- 9 · Scribe: the log writes itself -->
        <div class="layer logl" :class="{ on: s === 9 }">
          <div class="term">
            <div v-for="(r, i) in LOG" :key="i" class="row" :style="{ '--d': i }">
              <span class="t">{{ r[0] }}</span><span class="a">{{ r[1] }}</span><span>{{ r[2] }}</span>
            </div>
            <div class="row cursor" :style="{ '--d': LOG.length }">▍</div>
          </div>
        </div>

        <!-- 10 · overview -->
        <svg class="layer ovl" :class="{ on: s === LAST }" viewBox="0 0 600 300">
          <line v-for="([a, b], i) in FLOW_EDGES" :key="'e' + i" :x1="FLOW[a].x" :y1="FLOW[a].y" :x2="FLOW[b].x" :y2="FLOW[b].y"
                pathLength="1" class="fedge" :style="{ '--d': i }" />
          <g v-for="(f, i) in FLOW" :key="f.n" :transform="`translate(${f.x} ${f.y})`">
            <g class="fnode" :style="{ '--d': i }">
              <circle r="22" /><text y="7" class="fe">{{ f.e }}</text>
              <text y="40" class="fn">{{ f.n }}</text>
            </g>
          </g>
          <text x="300" y="282" class="fcap">360° in  →  10 pins out  ·  every step logged</text>
        </svg>
      </div>

      <!-- ================= CARD ================= -->
      <div class="cardcol">
        <transition name="card" mode="out-in">
          <div :key="s" class="who">
            <div class="avatar" :class="scene.kind">{{ scene.emoji }}</div>
            <div class="role">{{ scene.role }}</div>
            <div class="name">{{ scene.name }}</div>
            <div class="line">{{ scene.line }}</div>
          </div>
        </transition>
      </div>
    </div>

    <!-- ================= RAIL ================= -->
    <div class="rail">
      <button v-for="(sc, i) in SCENES.slice(1)" :key="i" class="dot"
              :class="{ lit: i + 1 <= s, cur: i + 1 === s }" :title="sc.name" @click="manual = i + 1">{{ sc.emoji }}</button>
    </div>
  </div>
</template>

<style scoped>
.story { --ease: cubic-bezier(.22, .9, .25, 1); display: flex; flex-direction: column; gap: 14px; }
.head { display: flex; justify-content: space-between; align-items: baseline; }
.kick { font-family: var(--slidev-code-font-family, monospace); font-size: 11px; letter-spacing: .22em; text-transform: uppercase; color: var(--nav-azulejo-soft); }
.count { font-family: var(--slidev-code-font-family, monospace); font-size: 12px; color: var(--nav-muted); }
.main { display: grid; grid-template-columns: 600px 1fr; gap: 28px; align-items: center; }

/* ---------- stage ---------- */
.stage { position: relative; width: 600px; height: 300px; border-radius: 16px; overflow: hidden; background: #07111b;
  box-shadow: 0 20px 60px rgba(0,0,0,.45), 0 0 0 1px var(--nav-line); }
.pano { position: absolute; inset: 0; width: 100%; height: 100%; transition: opacity 1s var(--ease), filter 1s var(--ease), transform 6s linear; }
.pano.dim { opacity: .22; filter: blur(1px) saturate(.6); }
.pano.map { opacity: .1; filter: blur(4px) saturate(.3); transform: scale(1.08); }
.layer { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; pointer-events: none; transition: opacity .6s var(--ease); }
.layer.on { opacity: 1; }

/* Lens tiles: start as the 8 vertical slices of the sphere, glide into a 4×2 grid */
.tile { position: absolute; top: 0; height: 100%; width: 12.5%; left: calc(var(--i) * 12.5%); opacity: 0;
  background-size: 800% 420%; border-radius: 10px; box-shadow: 0 0 0 1.5px var(--nav-azulejo);
  transition: all .9s var(--ease); transition-delay: calc(var(--i) * 90ms); }
.layer.on .tile { opacity: 1; width: 21%; height: 39%;
  left: var(--gl); top: var(--gt); }
.tile span { position: absolute; left: 6px; bottom: 5px; font: 600 9px var(--slidev-code-font-family, monospace); color: var(--nav-cream);
  background: rgba(7,17,27,.75); padding: 1px 5px; border-radius: 4px; }

/* Astrolabe */
.shade { fill: rgba(246,196,67,.12); stroke: var(--nav-tram); stroke-width: .5; stroke-dasharray: 2 1.5; opacity: 0; transition: opacity .6s var(--ease) .2s; }
.slabel { opacity: 0; transition: opacity .5s var(--ease) .5s; }
.slabel rect { fill: var(--nav-tram); }
.slabel text { fill: var(--nav-night); font: 700 3.4px var(--slidev-font-family, sans-serif); }
.on .shade, .on .slabel { opacity: 1; }
.arc, .arc-bg { fill: none; stroke-dasharray: 1; stroke-dashoffset: 1; transition: stroke-dashoffset 1.4s var(--ease) .9s; }
.arc { stroke: var(--nav-tram); stroke-width: 1.3; }
.arc-bg { stroke: rgba(7,17,27,.8); stroke-width: 2.8; }
.on .arc, .on .arc-bg { stroke-dashoffset: 0; }
.ahead { fill: var(--nav-tram); stroke: var(--nav-night); stroke-width: .5; opacity: 0; transition: opacity .3s 2.2s; }
.on .ahead { opacity: 1; }
.sun { opacity: 0; transform: scale(.3); transform-box: fill-box; transform-origin: center; transition: all .8s var(--ease) 2.2s; }
.on .sun { opacity: 1; transform: scale(1); }
.glow { fill: var(--nav-tram); opacity: .4; } .core { fill: var(--nav-tram); stroke: var(--nav-night); stroke-width: .6; }
.north { stroke: var(--nav-cream); stroke-width: .7; stroke-dasharray: 2 2; opacity: 0; filter: drop-shadow(0 0 .6px rgba(7,17,27,.95)); transition: opacity .6s 3s; }
.nlabel { opacity: 0; transition: opacity .6s 3.1s; }
.nlabel circle { fill: rgba(7,17,27,.85); stroke: var(--nav-azulejo-soft); stroke-width: .6; }
.nlabel text { fill: var(--nav-cream); font: 700 6px var(--slidev-code-font-family, monospace); text-anchor: middle; }
.on .north, .on .nlabel { opacity: 1; }
.dial { fill: rgba(7,17,27,.7); stroke: var(--nav-line); stroke-width: .6; }
.needle { fill: var(--nav-tram); transform: rotate(150deg); transition: transform 1.8s var(--ease) 3s; }
.on .needle { transform: rotate(-38deg); }

/* Reader + Geographer boxes */
.box { position: absolute; border-radius: 4px; opacity: 0; transform: scale(1.4);
  transition: all .55s var(--ease); transition-delay: calc(.25s + var(--d) * .35s); }
.layer.on .box { opacity: 1; transform: scale(1); }
.box.reader { border: 2px solid var(--nav-tram); box-shadow: 0 0 0 3px rgba(246,196,67,.2); }
.box.geo { border: 2px solid #6fd6a8; box-shadow: 0 0 0 3px rgba(111,214,168,.2); }
.lbl { position: absolute; left: -2px; white-space: nowrap; font: 600 9.5px var(--slidev-font-family, sans-serif); color: var(--nav-night);
  padding: 2px 6px; border-radius: 4px; }
.reader .lbl { background: var(--nav-tram); } .geo .lbl { background: #6fd6a8; }
.lbl.above { bottom: calc(100% + 4px); } .lbl.below { top: calc(100% + 4px); }
.lbl.above-r { bottom: calc(100% + 4px); left: auto; right: -2px; }

/* map */
.land { fill: rgba(61,123,240,.12); stroke: var(--nav-azulejo-soft); stroke-width: 1.2; }
.clue { opacity: 0; transform: translateX(-30px); transition: all .6s var(--ease); transition-delay: calc(.2s + var(--d) * .3s); }
.clues.on .clue { opacity: 1; transform: none; }
.clue rect { fill: var(--nav-deep); stroke: var(--nav-line); }
.clue text { fill: var(--nav-cream); font-size: 11px; }
.wire { fill: none; stroke: var(--nav-tram); stroke-width: 1.2; stroke-dasharray: 1; stroke-dashoffset: 1; opacity: .7;
  transition: stroke-dashoffset .8s var(--ease); transition-delay: calc(.9s + var(--d) * .2s); }
.clues.on .wire { stroke-dashoffset: 0; }
.drop { opacity: 0; transform: translateY(-46px); transition: transform .7s cubic-bezier(.3,1.5,.5,1), opacity .4s; transition-delay: calc(var(--d) * .25s + .2s); }
.drop.on { opacity: 1; transform: none; }
.drop.gone { opacity: 0; transform: translateY(8px) scale(.6); transition-delay: 1.6s; }
.pin { fill: var(--nav-tram); stroke: var(--nav-night); stroke-width: 1.2; }
.pin2 { fill: var(--nav-muted); stroke: var(--nav-night); stroke-width: 1.2; }
.hole { fill: var(--nav-night); }
.stack { transition-delay: calc(var(--d) * .25s); }
.ripple { fill: none; stroke: var(--nav-tram); opacity: 0; }
.ripple.on { animation: ripple 2.2s ease-out 1.1s infinite; }
@keyframes ripple { 0% { opacity: .8; transform: scale(.2); } 100% { opacity: 0; transform: scale(2.6); } }
.ripple { transform-box: fill-box; transform-origin: center; }
.tag { opacity: 0; transform: translateY(6px); transition: all .5s var(--ease); transition-delay: calc(var(--d) * .25s + .2s); }
.tag.on { opacity: 1; transform: none; }
.tag rect { fill: var(--nav-deep); stroke: var(--nav-tram); }
.tag text { fill: var(--nav-cream); font-size: 11px; }
.bubble rect { stroke: var(--nav-terracotta); } .bubble text { font-style: italic; }
.pct { font: 700 12px var(--slidev-code-font-family, monospace); fill: var(--nav-azulejo-soft) !important; }
.mcq .card { fill: var(--nav-deep); stroke: var(--nav-line); }
.mcq .q { font-weight: 700; font-size: 13px; }
.mcq .price { fill: var(--nav-terracotta) !important; font: 700 10px var(--slidev-code-font-family, monospace); text-anchor: end; }
.mcq .opt { fill: transparent; stroke: var(--nav-line); transition: all .4s 1.3s; }
.mcq.on .opt.pick { fill: rgba(246,196,67,.18); stroke: var(--nav-tram); }
.badge { fill: var(--nav-tram) !important; stroke: none !important; }
.x10 { fill: var(--nav-night) !important; font-weight: 800; font-size: 14px !important; text-anchor: middle; }

/* log */
.logl { display: grid; place-items: center; }
.term { width: 84%; background: rgba(7,17,27,.92); border: 1px solid var(--nav-line); border-radius: 12px; padding: 16px 18px;
  font: 12px/1.9 var(--slidev-code-font-family, monospace); color: var(--nav-cream); }
.row { opacity: 0; transform: translateY(6px); transition: all .4s var(--ease); transition-delay: calc(.3s + var(--d) * .45s); display: flex; gap: 14px; }
.logl.on .row { opacity: 1; transform: none; }
.row .t { color: var(--nav-muted); } .row .a { color: var(--nav-tram); width: 86px; flex: none; white-space: nowrap; }
.cursor { color: var(--nav-tram); animation: blink 1s steps(1) infinite; }
@keyframes blink { 50% { opacity: 0; } }

/* overview */
.fedge { stroke: var(--nav-azulejo-soft); stroke-width: 1.5; stroke-dasharray: 1; stroke-dashoffset: 1;
  transition: stroke-dashoffset .5s var(--ease); transition-delay: calc(.4s + var(--d) * .12s); }
.ovl.on .fedge { stroke-dashoffset: 0; }
.fnode { opacity: 0; transform: scale(.4); transform-box: fill-box; transform-origin: center;
  transition: all .5s cubic-bezier(.3,1.5,.5,1); transition-delay: calc(var(--d) * .12s); }
.ovl.on .fnode { opacity: 1; transform: scale(1); }
.fnode circle { fill: var(--nav-deep); stroke: var(--nav-tram); stroke-width: 1.5; }
.fe { font-size: 19px; text-anchor: middle; }
.fn { font-size: 10px; fill: var(--nav-cream); text-anchor: middle; font-weight: 600; }
.fcap { fill: var(--nav-muted); font: 11px var(--slidev-code-font-family, monospace); text-anchor: middle; opacity: 0; transition: opacity .6s 1.6s; }
.ovl.on .fcap { opacity: 1; }

/* ---------- card ---------- */
.cardcol { min-height: 260px; display: flex; align-items: center; }
.who { display: flex; flex-direction: column; align-items: flex-start; }
.avatar { width: 76px; height: 76px; border-radius: 50%; display: grid; place-items: center; font-size: 36px;
  background: var(--nav-deep); box-shadow: 0 0 0 2px var(--nav-line); margin-bottom: 18px; }
.avatar.agent { box-shadow: 0 0 0 2px var(--nav-tram), 0 0 30px rgba(246,196,67,.25); }
.avatar.tool { box-shadow: 0 0 0 2px var(--nav-azulejo), 0 0 30px rgba(61,123,240,.3); }
.role { font: 11px var(--slidev-code-font-family, monospace); letter-spacing: .18em; text-transform: uppercase; color: var(--nav-muted); }
.name { font-size: 34px; font-weight: 700; letter-spacing: -.03em; line-height: 1.1; margin: 4px 0 12px; }
.line { font-family: 'Fraunces', serif; font-style: italic; font-size: 21px; line-height: 1.25; color: var(--nav-tram); }
.card-enter-active { transition: all .55s var(--ease); } .card-leave-active { transition: all .25s ease-in; }
.card-enter-from { opacity: 0; transform: translateX(24px); } .card-leave-to { opacity: 0; transform: translateX(-12px); }
.card-enter-active .avatar { transition: transform .6s cubic-bezier(.3,1.6,.5,1) .1s; }
.card-enter-from .avatar { transform: scale(.4) rotate(-20deg); }

/* ---------- rail ---------- */
.rail { display: flex; justify-content: center; gap: 12px; }
.dot { width: 36px; height: 36px; border-radius: 50%; font-size: 16px; background: var(--nav-deep); border: 1px solid var(--nav-line);
  opacity: .3; cursor: pointer; transition: all .4s var(--ease); }
.dot.lit { opacity: 1; border-color: var(--nav-azulejo); }
.dot.cur { transform: scale(1.18); border-color: var(--nav-tram); box-shadow: 0 0 16px rgba(246,196,67,.35); }
</style>
