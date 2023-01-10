import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/vesc-log-video/',  // the repo name, this is needed to deploy with GitHub pages
  plugins: [vue()],
})
