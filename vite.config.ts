import { defineConfig } from 'vite'

// Workaround: Slidev 53.0.0 emits a CSS rule that the default minifier (lightningcss)
// rejects during `slidev build` / `slidev export`. Skipping CSS minification avoids it (a few KB larger, irrelevant for slides).
// The dev server (`npm run dev`) is not affected. Remove once Slidev ships a fix.
export default defineConfig({
  build: {
    cssMinify: false,
  },
})
