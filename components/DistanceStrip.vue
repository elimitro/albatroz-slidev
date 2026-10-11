<script setup lang="ts">
/**
 * DistanceStrip — every panorama as one dot on a log-scale distance axis (1 m … 200 km).
 * Data comes straight from data/batch1.json (err_m 0 means "< 10 m" and is drawn at ~5 m).
 *
 * Usage in slides.md:   clicks: 2   +   <DistanceStrip :step="$clicks" />
 *   step 0  axis only
 *   step 1  dots drop in, left to right (staggered)
 *   step 2  yellow bracket over the < 100 m group
 *
 * Dots closer than one diameter stack vertically, so nothing overlaps.
 * Colours: < 100 m tram yellow · 100 m–1 km muted · > 1 km terracotta.
 */
import { computed } from 'vue'
import batch from '../data/batch1.json'

defineProps<{ step?: number }>()

const W = 800, H = 140
const PAD = 20, AXIS_Y = 108
const MIN_LOG = 0                  // 1 m
const MAX_LOG = Math.log10(200_000) // 200 km
const R = 5, GAP = 1.5
const EXACT_AS = 5                 // err_m 0 → drawn at ~5 m
const X = (d: number) => PAD + ((Math.log10(d) - MIN_LOG) / (MAX_LOG - MIN_LOG)) * (W - 2 * PAD)

const TICKS: [number, string][] = [[10, '10 m'], [100, '100 m'], [1_000, '1 km'], [10_000, '10 km'], [100_000, '100 km']]

const colour = (e: number) => (e < 100 ? 'near' : e <= 1_000 ? 'mid' : 'far')

// place each dot at its x; if it would touch a dot already in that row, lift it one row
const dots = computed(() => {
  const sorted = batch.panoramas
    .map(p => ({ id: p.id, err: p.err_m, d: p.err_m === 0 ? EXACT_AS : p.err_m }))
    .sort((a, b) => a.d - b.d)
  const rows: number[][] = []
  return sorted.map((p, i) => {
    const x = X(p.d)
    let row = 0
    while ((rows[row] ?? []).some(rx => Math.abs(rx - x) < 2 * R + GAP)) row++
    ;(rows[row] ??= []).push(x)
    return { ...p, i, x, y: AXIS_Y - R - 3 - row * (2 * R + GAP), cls: colour(p.err) }
  })
})

// bracket over the < 100 m group
const near = computed(() => dots.value.filter(d => d.cls === 'near'))
const bracket = computed(() => {
  const x1 = Math.min(...near.value.map(d => d.x)) - R - 2
  const x2 = Math.max(...near.value.map(d => d.x)) + R + 2
  const top = Math.min(...near.value.map(d => d.y)) - R - 8
  return { x1, x2, top, mid: (x1 + x2) / 2, d: `M${x1},${top + 6} V${top} H${x2} V${top + 6}` }
})
const label = computed(() => `${near.value.length} of ${dots.value.length}`)
</script>

<template>
  <svg :viewBox="`0 0 ${W} ${H}`" class="strip" role="img" aria-label="Distance of each pin to the true location, log scale">
    <!-- axis + tick labels -->
    <line :x1="PAD" :x2="W - PAD" :y1="AXIS_Y" :y2="AXIS_Y" class="axis" />
    <g v-for="[d, t] in TICKS" :key="t">
      <line :x1="X(d)" :x2="X(d)" :y1="AXIS_Y" :y2="AXIS_Y + 5" class="tick" />
      <text :x="X(d)" :y="AXIS_Y + 20" class="tl">{{ t }}</text>
    </g>

    <!-- bracket -->
    <g :class="{ on: (step ?? 0) >= 2 }" class="brk">
      <path :d="bracket.d" pathLength="1" class="bline" />
      <text :x="bracket.mid" :y="bracket.top - 6" class="btxt">{{ label }}</text>
    </g>

    <!-- dots -->
    <circle v-for="p in dots" :key="p.id" :cx="p.x" :cy="p.y" :r="R" class="dot" :class="[p.cls, { on: (step ?? 0) >= 1 }]"
            :style="{ '--d': p.i }">
      <title>{{ p.id }} · {{ p.err === 0 ? '< 10' : p.err.toLocaleString('en-US') }} m</title>
    </circle>
  </svg>
</template>

<style scoped>
.strip { display: block; width: 800px; height: 140px; margin-left: auto; margin-right: auto; overflow: visible;
  --ease: cubic-bezier(.22, .9, .25, 1); }
.axis { stroke: var(--nav-line); stroke-width: 2; stroke-linecap: round; }
.tick { stroke: var(--nav-muted); stroke-width: 1.5; }
.tl { fill: var(--nav-muted); font: 11px var(--slidev-code-font-family, monospace); text-anchor: middle; }

.dot { opacity: 0; transform: translateY(-26px); transition: transform .5s cubic-bezier(.3, 1.4, .5, 1), opacity .3s;
  transition-delay: calc(var(--d) * 40ms); }
.dot.on { opacity: 1; transform: none; }
.dot.near { fill: var(--nav-tram); }
.dot.mid { fill: var(--nav-muted); }
.dot.far { fill: var(--nav-terracotta); }

.bline { fill: none; stroke: var(--nav-tram); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;
  stroke-dasharray: 1; stroke-dashoffset: 1; transition: stroke-dashoffset .6s var(--ease); }
.btxt { fill: var(--nav-tram); font: italic 400 18px 'Fraunces', serif; text-anchor: middle; opacity: 0; transition: opacity .4s .35s; }
.brk.on .bline { stroke-dashoffset: 0; }
.brk.on .btxt { opacity: 1; }
</style>
