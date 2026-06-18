import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/excel-view/',
  plugins: [vue()],
  server: { port: 5173 },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('echarts') || id.includes('zrender') || id.includes('vue-echarts')) {
              return 'echarts'
            }
            if (id.includes('exceljs')) {
              return 'exceljs'
            }
            if (id.includes('/vue/') || id.includes('@vue') || id.includes('vue-router')) {
              return 'vue'
            }
          }
        },
      },
    },
  },
})
