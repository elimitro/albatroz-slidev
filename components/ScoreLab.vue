<script setup lang="ts">
/**
 * ScoreLab — live playground for the official Albatroz scoring formula.
 *   score = Σ_{R=1..10} 1000 · 0.95^(R-1) · θ(d_R) · penalties
 *   θ_urban(d) = 2/(1+d/100)   θ_non_urban(d) = 2/(1+d/10000)   (d < 10 m → d = 0)
 * Slider is logarithmic (1 m … 100 km) because θ lives on a log scale.
 * Assumes our strategy: the same best pin on all 10 ranks.
 */
import { computed, ref } from 'vue'

const label = ref<'urban' | 'non_urban'>('urban')
const logD = ref(2.7)          // log10(metres) → default ≈ 500 m
const mcq = ref(0)             // number of multiple-choice questions asked
const cues = ref(0)            // number of free-text cues given

const RANK_SUM = Array.from({ length: 10 }, (_, k) => 0.95 ** k).reduce((a, b) => a + b) // 8.0253
const theta = (d: number, l: string) => {
  const dd = d < 10 ? 0 : d
  return l === 'urban' ? 2 / (1 + dd / 100) : 2 / (1 + dd / 10000)
}

const d = computed(() => 10 ** logD.value)
const th = computed(() => theta(d.value, label.value))
const penalty = computed(() => 0.95 ** mcq.value * 0.8 ** cues.value)
const total = computed(() => 1000 * th.value * RANK_SUM * penalty.value)
const maxTotal = 1000 * 2 * RANK_SUM // 16 050.5

const fmtD = computed(() => (d.value >= 1000 ? `${(d.value / 1000).toFixed(d.value < 10000 ? 1 : 0)} km` : `${Math.round(d.value)} m`))

// ---- curve geometry (SVG 420×170, x = log10 d ∈ [0,5], y = θ ∈ [0,2]) ----
const X = (lg: number) => 30 + (lg / 5) * 380
const Y = (t: number) => 150 - (t / 2) * 130
const path = (l: string) => {
  let s = ''
  for (let i = 0; i <= 100; i++) {
    const lg = (i / 100) * 5
    s += `${i ? 'L' : 'M'}${X(lg).toFixed(1)},${Y(theta(10 ** lg, l)).toFixed(1)}`
  }
  return s
}
const TICKS = [[0, '1 m'], [1, '10 m'], [2, '100 m'], [3, '1 km'], [4, '10 km'], [5, '100 km']] as const
</script>

<template>
  <div class="lab">
    <div class="left">
      <div class="seg">
        <button :class="{ on: label === 'urban' }" @click="label = 'urban'">urban</button>
        <button :class="{ on: label === 'non_urban' }" @click="label = 'non_urban'">non-urban</button>
      </div>

      <svg viewBox="0 0 420 175" class="curve">
        <line v-for="t in TICKS" :key="t[0]" :x1="X(t[0])" :x2="X(t[0])" y1="20" y2="150" class="grid" />
        <text v-for="t in TICKS" :key="'l' + t[0]" :x="X(t[0])" y="166" class="tick">{{ t[1] }}</text>
        <path :d="path('non_urban')" class="c nu" :class="{ dim: label === 'urban' }" />
        <path :d="path('urban')" class="c u" :class="{ dim: label !== 'urban' }" />
        <line :x1="X(logD)" :x2="X(logD)" y1="20" y2="150" class="cursor" />
        <circle :cx="X(logD)" :cy="Y(th)" r="6" class="dot" />
      </svg>

      <label class="slider">
        <span>distance to truth</span>
        <input type="range" min="0" max="5" step="0.01" v-model.number="logD" />
        <b>{{ fmtD }}</b>
      </label>

      <div class="pen">
        <div>
          <span class="h">MCQs <i>×0.95</i></span>
          <button @click="mcq = Math.max(0, mcq - 1)">−</button><b>{{ mcq }}</b><button @click="mcq = Math.min(2, mcq + 1)">+</button>
        </div>
        <div>
          <span class="h">Cues <i>×0.8</i></span>
          <button @click="cues = Math.max(0, cues - 1)">−</button><b>{{ cues }}</b><button @click="cues = Math.min(3, cues + 1)">+</button>
        </div>
      </div>
    </div>

    <div class="right">
      <div class="k">θ (distance factor)</div>
      <div class="big">{{ th.toFixed(3) }}</div>
      <div class="k">10 × same pin → panorama score</div>
      <div class="big tram">{{ Math.round(total).toLocaleString('en-US') }}</div>
      <div class="bar"><div :style="{ width: (total / maxTotal * 100) + '%' }" /></div>
      <div class="small">of {{ Math.round(maxTotal).toLocaleString('en-US') }} max · penalty ×{{ penalty.toFixed(3) }}</div>
    </div>
  </div>
</template>

<style scoped>
.lab { display: grid; grid-template-columns: 1.35fr 1fr; gap: 26px; align-items: center; }
.seg { display: inline-flex; border: 1px solid var(--nav-line); border-radius: 999px; padding: 3px; margin-bottom: 6px; }
.seg button { font-size: 12px; padding: 4px 14px; border-radius: 999px; color: var(--nav-muted); background: none; border: none; cursor: pointer; }
.seg button.on { background: var(--nav-tram); color: var(--nav-night); font-weight: 700; }
.curve { width: 100%; }
.grid { stroke: var(--nav-line); stroke-width: 1; }
.tick { fill: var(--nav-muted); font-size: 9px; text-anchor: middle; font-family: var(--slidev-code-font-family, monospace); }
.c { fill: none; stroke-width: 3; transition: opacity .3s; }
.c.u { stroke: var(--nav-tram); } .c.nu { stroke: var(--nav-azulejo-soft); }
.c.dim { opacity: .2; }
.cursor { stroke: var(--nav-cream); stroke-dasharray: 3 4; opacity: .5; }
.dot { fill: var(--nav-cream); stroke: var(--nav-night); stroke-width: 2; }
.slider { display: grid; grid-template-columns: auto 1fr 64px; gap: 10px; align-items: center; font-size: 12px; color: var(--nav-muted); }
.slider input { accent-color: var(--nav-tram); width: 100%; }
.slider b { color: var(--nav-cream); text-align: right; font-family: var(--slidev-code-font-family, monospace); }
.pen { display: flex; gap: 22px; margin-top: 12px; font-size: 12px; }
.pen > div { display: flex; align-items: center; gap: 6px; }
.pen .h { color: var(--nav-muted); margin-right: 4px; } .pen i { color: var(--nav-terracotta); font-style: normal; }
.pen button { width: 22px; height: 22px; border-radius: 50%; border: 1px solid var(--nav-line); background: var(--nav-deep); color: var(--nav-cream); cursor: pointer; line-height: 1; }
.pen b { min-width: 14px; text-align: center; }
.right { border-left: 1px solid var(--nav-line); padding-left: 24px; }
.k { font-size: 10px; letter-spacing: .16em; text-transform: uppercase; color: var(--nav-muted); font-family: var(--slidev-code-font-family, monospace); }
.big { font-size: 44px; font-weight: 700; letter-spacing: -.03em; line-height: 1.05; margin-bottom: 14px; font-variant-numeric: tabular-nums; }
.tram { color: var(--nav-tram); }
.bar { height: 6px; background: var(--nav-line); border-radius: 3px; overflow: hidden; }
.bar div { height: 100%; background: linear-gradient(90deg, var(--nav-azulejo), var(--nav-tram)); transition: width .3s; }
.small { font-size: 11px; color: var(--nav-muted); margin-top: 6px; }
</style>
