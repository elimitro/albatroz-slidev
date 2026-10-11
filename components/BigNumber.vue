<script setup lang="ts">
/**
 * BigNumber — a count-up KPI that animates every time the slide is entered.
 * Usage:  <BigNumber :value="16050" label="max points per panorama" />
 *         <BigNumber value="??" label="TODO: fill in after the scoring run" />   ← placeholder
 * A non-numeric value is shown as-is (handy for placeholders like "??").
 */
import { computed, ref } from 'vue'
import { onSlideEnter } from '@slidev/client'

const props = withDefaults(defineProps<{
  value: number | string; label: string
  prefix?: string; suffix?: string; decimals?: number; duration?: number
}>(), { prefix: '', suffix: '', decimals: 0, duration: 1200 })

const isNum = computed(() => typeof props.value === 'number')
const shown = ref(isNum.value ? (props.value as number) : 0)

function run() {
  if (!isNum.value) return
  const target = props.value as number
  const t0 = performance.now()
  const tick = (t: number) => {
    const p = Math.min(1, (t - t0) / props.duration)
    shown.value = target * (1 - (1 - p) ** 3) // ease-out cubic
    if (p < 1) requestAnimationFrame(tick)
  }
  shown.value = 0
  requestAnimationFrame(tick)
}
onSlideEnter(run)

const text = computed(() => isNum.value
  ? shown.value.toLocaleString('en-US', { minimumFractionDigits: props.decimals, maximumFractionDigits: props.decimals })
  : String(props.value))
</script>

<template>
  <div class="bn">
    <div class="v" :class="{ todo: !isNum }">{{ prefix }}{{ text }}<span class="s">{{ suffix }}</span></div>
    <div class="l">{{ label }}</div>
  </div>
</template>

<style scoped>
.v { font-size: 3.4rem; font-weight: 700; letter-spacing: -0.04em; line-height: 1; color: var(--nav-tram); font-variant-numeric: tabular-nums; }
.v.todo { color: var(--nav-terracotta); }
.s { font-size: 1.6rem; margin-left: 2px; }
.l { margin-top: .5rem; font-size: .8rem; color: var(--nav-muted); line-height: 1.35; }
</style>
