import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/esc-log-video/',  // the repo name, this is needed to deploy with GitHub pages
  plugins: [
    vue(),
    {
      name: 'static-js',
      apply: 'serve',
      enforce: 'pre',
      resolveId(source, importer) {
        if (source.endsWith('coi-serviceworker.min.js')) {
          return '\ufeff' + source;
        }
      }
    }
  ],
})
