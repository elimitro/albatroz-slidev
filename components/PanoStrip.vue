<script setup lang="ts">
/**
 * PanoStrip — an endlessly panning 360° panorama.
 * Equirectangular images wrap seamlessly left↔right, so a repeating background
 * that slides by exactly one image width loops without a visible seam.
 *
 *   <PanoStrip src="/panos/village-granite.jpg" :height="220" />          inline strip
 *   <PanoStrip src="/panos/praca-arcades.jpg" fill shade />               full-bleed slide background
 *
 * src:      path inside public/ (base URL is added automatically)
 * height:   strip height in px (ignored with `fill`)
 * seconds:  time for one full 360° turn (bigger = slower)
 * fill:     cover the whole parent (position absolute, inset 0)
 * shade:    dark gradient on top so text stays readable
 * crop:     vertical crop 0–1, how much of the sphere height to show (0.62 hides most sky + tripod)
 */
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  src: string; height?: number; seconds?: number; fill?: boolean; shade?: boolean; crop?: number; reverse?: boolean
}>(), { height: 220, seconds: 90, fill: false, shade: false, crop: 0.62, reverse: false })

const url = computed(() => (props.src.startsWith('/') ? import.meta.env.BASE_URL + props.src.slice(1) : props.src))
// at full-bleed height 552 px, one 2:1 image tile shown with `crop` is (h / crop) * 2 px wide
const style = computed(() => {
  const h = props.fill ? 552 : props.height
  const tileW = Math.round((h / props.crop) * 2)
  return {
    height: props.fill ? undefined : `${h}px`,
    backgroundImage: `url(${url.value})`,
    backgroundSize: `${tileW}px ${Math.round(h / props.crop)}px`,
    '--tile': `${props.reverse ? tileW : -tileW}px`,
    animationDuration: `${props.seconds}s`,
  }
})
</script>

<template>
  <div class="ps" :class="{ fill, shade }" :style="style" />
</template>

<style scoped>
.ps { width: 100%; border-radius: 14px; background-repeat: repeat-x; background-position: 0 50%;
  animation: pan linear infinite; position: relative; box-shadow: 0 0 0 1px var(--nav-line); }
.ps.fill { position: absolute; inset: 0; border-radius: 0; box-shadow: none; }
.ps.shade::after { content: ''; position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(10,23,36,.35) 0%, rgba(10,23,36,.55) 45%, rgba(10,23,36,.94) 100%); }
@keyframes pan { from { background-position-x: 0; } to { background-position-x: var(--tile); } }
</style>
