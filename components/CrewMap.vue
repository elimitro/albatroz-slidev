<script setup lang="ts">
/**
 * CrewMap — interactive architecture of the Navegador crew.
 *
 * Two ways to drive it during the pitch:
 *  1. Arrow keys / clicker: bind `:step="$clicks"` and set `clicks: 8` in the slide
 *     frontmatter → each click advances one pipeline phase (S0 → S8).
 *  2. Mouse: Prev/Next buttons, phase dots, or click any node for its "character card".
 *
 * All content lives in the two arrays below (NODES, PHASES) — edit text there,
 * the drawing re-lays itself out. Coordinates are in a 760×420 viewBox.
 */
import { computed, ref, watch } from 'vue'

const props = defineProps<{ step?: number }>()

type Kind = 'io' | 'tool' | 'agent' | 'human'
interface Node {
  id: string; x: number; y: number; kind: Kind
  name: string; aka?: string; line: string
  input: string; output: string; badge?: string
}

// ---- the crew ------------------------------------------------------------
const NODES: Node[] = [
  { id: 'pano', x: 62, y: 210, kind: 'io', name: '360° Panorama', aka: '6080×3040 · timestamp · label',
    line: 'One sphere of pixels. No street names. No metadata.',
    input: 'equirectangular JPG + YYYYMMDDhhmmss + urban / non_urban', output: 'the job' },
  { id: 'lupa', x: 186, y: 210, kind: 'tool', name: 'Magnifier', aka: 'Lupa',
    line: 'Unwraps the world into 13 undistorted views — and zooms to 8° on demand.',
    input: 'panorama', output: '8 horizon + 4 ground views + overview, zoom crops' },
  { id: 'astro', x: 186, y: 345, kind: 'tool', name: 'Astrolabe', aka: 'Astrolábio',
    line: 'Finds the sun. Knows where north is. Checks local AND UTC time.',
    input: 'panorama + timestamp + candidate (lat, lng)', output: 'sun elevation residual, north offset' },
  { id: 'reader', x: 318, y: 118, kind: 'agent', name: 'Reader', aka: 'Leitor',
    line: 'Reads every sign, shop, phone prefix and plate format. Two passes, with zoom.',
    input: '8 views (+ the crops it asked for)', output: 'texts, language verdict, search terms' },
  { id: 'geo', x: 318, y: 302, kind: 'agent', name: 'Geographer', aka: 'Geógrafo',
    line: 'Vegetation, soil, roofs, poles, chimneys. Absence of a clue is also a clue.',
    input: '8 views + regional_cues.md checklist', output: 'country & region probabilities' },
  { id: 'detective', x: 450, y: 210, kind: 'agent', name: 'Detective', aka: 'Detetive',
    line: 'Turns clues into coordinates. Every pin comes with a receipt.',
    input: 'Reader + Geographer + sun + human answers', output: 'weighted hypotheses with provenance ids' },
  { id: 'tools', x: 450, y: 352, kind: 'tool', name: 'Geo toolbelt', aka: 'Nominatim · Overpass · Wikipedia',
    line: 'Real-world lookups, cached and rate-limited. The model never invents a coordinate.',
    input: 'place names, POI tags, bounding boxes', output: 'coordinates + call_id' },
  { id: 'advocate', x: 450, y: 62, kind: 'agent', name: 'Advocate', aka: 'Advogado', badge: 'night shift',
    line: 'The devil’s advocate. Hunts contradictions in the top 3 hypotheses.',
    input: 'top hypotheses + evidence', output: 'objections, weight multipliers' },
  { id: 'nav', x: 580, y: 210, kind: 'agent', name: 'Navigator', aka: 'Navegador',
    line: 'The captain. Clusters hypotheses and asks a human only when the math says it pays.',
    input: 'all hypotheses', output: 'SUBMIT or a ≤4-option question' },
  { id: 'human', x: 580, y: 352, kind: 'human', name: 'Human click', aka: 'MCQ ×0.95',
    line: 'Buttons only. No free text. Every click is priced in.',
    input: 'agent-generated question', output: 'one option id' },
  { id: 'strat', x: 700, y: 150, kind: 'tool', name: 'Strategist', aka: 'Estratega',
    line: 'Monte-Carlo over the hypotheses, picks the max-expected-score point, fills 10 ranks.',
    input: 'hypotheses + penalty ledger', output: '10 × (lat, lng) + expected score' },
  { id: 'scribe', x: 700, y: 290, kind: 'tool', name: 'Scribe', aka: 'Escrivão',
    line: 'Every prompt, tool call and click — on the record, human-readable.',
    input: 'every event', output: 'log.json + report.md' },
]

const EDGES: [string, string][] = [
  ['pano', 'lupa'], ['pano', 'astro'],
  ['lupa', 'reader'], ['lupa', 'geo'],
  ['reader', 'detective'], ['geo', 'detective'], ['astro', 'detective'],
  ['detective', 'tools'], ['detective', 'advocate'], ['advocate', 'nav'],
  ['detective', 'nav'], ['nav', 'human'],
  ['nav', 'strat'], ['strat', 'scribe'], ['nav', 'scribe'],
]

// ---- the story, one phase per click -------------------------------------
const PHASES = [
  { tag: 'The crew', title: 'Ten specialists. One pin.',
    text: 'Agents think (yellow), tools compute (blue), humans click (terracotta). Plain Python orchestration, Gemini on Vertex AI.',
    nodes: NODES.map(n => n.id) },
  { tag: 'S0–S1 · See', title: 'Unwrap the world',
    text: 'The sphere becomes 13 flat views a model can actually read.',
    nodes: ['pano', 'lupa'] },
  { tag: 'S2 · Sun', title: 'The sky is a compass',
    text: 'Sun position + timestamp = where north is, and which places are physically possible.',
    nodes: ['pano', 'astro'] },
  { tag: 'S3 · Perceive', title: 'Two experts, in parallel',
    text: 'The Reader reads, the Geographer looks. Observation strictly separated from conclusion.',
    nodes: ['lupa', 'reader', 'geo'] },
  { tag: 'S4 · Investigate', title: 'Clues → coordinates',
    text: 'The Detective runs a tool loop. No receipt (call_id), no pin.',
    nodes: ['reader', 'geo', 'astro', 'detective', 'tools'] },
  { tag: 'S5 · Critic', title: 'Someone has to disagree',
    text: 'The Advocate attacks the favourite before reality does.',
    nodes: ['detective', 'advocate'] },
  { tag: 'S6 · Decide', title: 'Ask only when it pays',
    text: 'Far-apart clusters, no clear winner → one multiple-choice question. Otherwise: go.',
    nodes: ['advocate', 'detective', 'nav', 'human'] },
  { tag: 'S7 · Commit', title: 'Ten pins, max expected score',
    text: 'Ranks are locked in order, so penalties only hit what comes after.',
    nodes: ['nav', 'strat'] },
  { tag: 'S8 · Record', title: 'Every thought on the record',
    text: 'A readable deduction trace — the story of how we got there.',
    nodes: ['nav', 'strat', 'scribe'] },
]

// ---- state ---------------------------------------------------------------
const manual = ref<number | null>(null)          // set by buttons; reset when Slidev clicks move
watch(() => props.step, () => { manual.value = null })
const phase = computed(() => {
  const p = manual.value ?? props.step ?? 0
  return Math.max(0, Math.min(PHASES.length - 1, p))
})
const selected = ref<string | null>(null)

const current = computed(() => PHASES[phase.value])
const active = computed(() => new Set(current.value.nodes))
const byId = Object.fromEntries(NODES.map(n => [n.id, n]))
const detail = computed(() => (selected.value ? byId[selected.value] : null))

const edgeOn = (a: string, b: string) => active.value.has(a) && active.value.has(b)
const go = (d: number) => { selected.value = null; manual.value = Math.max(0, Math.min(PHASES.length - 1, phase.value + d)) }
const jump = (i: number) => { selected.value = null; manual.value = i }
const pick = (id: string) => { selected.value = selected.value === id ? null : id }

const W = 116, H = 50 // node box size
const KIND_LABEL: Record<Kind, string> = { io: 'input', tool: 'tool', agent: 'agent', human: 'human' }
</script>

<template>
  <div class="crew">
    <!-- ======== the map ======== -->
    <svg viewBox="0 0 760 420" class="map" role="img" aria-label="Navegador architecture">
      <!-- edges first so nodes paint on top -->
      <g v-for="[a, b] in EDGES" :key="a + b">
        <line :x1="byId[a].x" :y1="byId[a].y" :x2="byId[b].x" :y2="byId[b].y"
              class="edge" :class="{ on: edgeOn(a, b) }" />
      </g>

      <g v-for="n in NODES" :key="n.id" class="node" :class="[n.kind, { on: active.has(n.id), sel: selected === n.id }]"
         :transform="`translate(${n.x - W / 2}, ${n.y - H / 2})`" @click="pick(n.id)">
        <rect :width="W" :height="H" rx="11" />
        <text :x="W / 2" y="22" class="name">{{ n.name }}</text>
        <text :x="W / 2" y="38" class="aka">{{ n.aka }}</text>
        <g v-if="n.badge">
          <rect :x="W - 62" y="-9" width="66" height="16" rx="8" class="badge" />
          <text :x="W - 29" y="2.5" class="badge-t">{{ n.badge }}</text>
        </g>
      </g>
    </svg>

    <!-- ======== the side panel: story or character card ======== -->
    <div class="panel">
      <transition name="fade" mode="out-in">
        <div v-if="detail" :key="detail.id" class="card-in">
          <div class="tag" :class="detail.kind">{{ KIND_LABEL[detail.kind] }} · {{ detail.aka }}</div>
          <h3>{{ detail.name }}</h3>
          <p class="line">{{ detail.line }}</p>
          <dl>
            <dt>in</dt><dd>{{ detail.input }}</dd>
            <dt>out</dt><dd>{{ detail.output }}</dd>
          </dl>
          <button class="ghost" @click="selected = null">← back to the story</button>
        </div>
        <div v-else :key="'p' + phase" class="card-in">
          <div class="tag">{{ current.tag }}</div>
          <h3>{{ current.title }}</h3>
          <p class="line">{{ current.text }}</p>
          <p class="hint">Tip: click any box for its character card.</p>
        </div>
      </transition>

      <div class="controls">
        <button @click="go(-1)" :disabled="phase === 0">‹</button>
        <div class="dots">
          <span v-for="(p, i) in PHASES" :key="i" :class="{ on: i === phase }" @click="jump(i)" :title="p.tag" />
        </div>
        <button @click="go(1)" :disabled="phase === PHASES.length - 1">›</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.crew { display: grid; grid-template-columns: 1fr 250px; gap: 18px; align-items: stretch; height: 100%; }
.map { width: 100%; height: auto; overflow: visible; }

/* edges: dim by default, animated "data flow" dashes when active */
.edge { stroke: var(--nav-line); stroke-width: 1.5; transition: stroke 0.4s, opacity 0.4s; }
.edge.on { stroke: var(--nav-azulejo-soft); stroke-width: 2; stroke-dasharray: 6 6; animation: flow 1.1s linear infinite; }
@keyframes flow { to { stroke-dashoffset: -24; } }

/* nodes: colour = kind, brightness = active in current phase */
.node { cursor: pointer; transition: opacity 0.4s; opacity: 0.28; }
.node.on { opacity: 1; }
.node rect:first-child { fill: var(--nav-deep); stroke-width: 1.5; transition: fill 0.3s, stroke-width 0.3s; }
.node.agent rect:first-child { stroke: var(--nav-tram); }
.node.tool rect:first-child { stroke: var(--nav-azulejo); }
.node.human rect:first-child { stroke: var(--nav-terracotta); }
.node.io rect:first-child { stroke: var(--nav-cream); stroke-dasharray: 4 3; }
.node.on.agent rect:first-child { fill: rgba(246, 196, 67, 0.12); }
.node.on.tool rect:first-child { fill: rgba(61, 123, 240, 0.14); }
.node.on.human rect:first-child { fill: rgba(232, 121, 90, 0.14); }
.node:hover rect:first-child, .node.sel rect:first-child { stroke-width: 3; }
.name { fill: var(--nav-cream); font-size: 13px; font-weight: 600; text-anchor: middle; }
.aka { fill: var(--nav-muted); font-size: 8.5px; text-anchor: middle; font-family: var(--slidev-code-font-family, monospace); }
.badge { fill: var(--nav-terracotta); }
.badge-t { fill: var(--nav-night); font-size: 8px; font-weight: 700; text-anchor: middle; }

/* panel */
.panel { display: flex; flex-direction: column; justify-content: space-between; background: rgba(255,255,255,0.03);
  border: 1px solid var(--nav-line); border-radius: 14px; padding: 16px; }
.tag { font-family: var(--slidev-code-font-family, monospace); font-size: 10px; letter-spacing: .18em; text-transform: uppercase; color: var(--nav-azulejo-soft); }
.tag.agent { color: var(--nav-tram); } .tag.human { color: var(--nav-terracotta); }
h3 { margin: 6px 0 8px; font-size: 22px; line-height: 1.1; font-weight: 700; }
.line { font-size: 13px; line-height: 1.45; color: var(--nav-cream); margin: 0; }
.hint { font-size: 10.5px; color: var(--nav-muted); margin-top: 14px; }
dl { display: grid; grid-template-columns: 30px 1fr; gap: 4px 8px; margin: 12px 0 0; font-size: 11px; }
dt { color: var(--nav-muted); font-family: var(--slidev-code-font-family, monospace); }
dd { margin: 0; color: var(--nav-cream); }
.ghost { margin-top: 12px; font-size: 11px; color: var(--nav-azulejo-soft); background: none; border: none; padding: 0; cursor: pointer; }

.controls { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 12px; }
.controls button { width: 30px; height: 30px; border-radius: 50%; border: 1px solid var(--nav-line); color: var(--nav-cream); background: var(--nav-deep); font-size: 18px; line-height: 1; cursor: pointer; }
.controls button:disabled { opacity: .3; cursor: default; }
.dots { display: flex; gap: 6px; }
.dots span { width: 8px; height: 8px; border-radius: 50%; background: var(--nav-line); cursor: pointer; transition: all .3s; }
.dots span.on { background: var(--nav-tram); width: 20px; border-radius: 4px; }

.fade-enter-active, .fade-leave-active { transition: opacity .25s, transform .25s; }
.fade-enter-from { opacity: 0; transform: translateY(6px); } .fade-leave-to { opacity: 0; }
</style>
