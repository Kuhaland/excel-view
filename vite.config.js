import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: { port: 5173 },
  build: {
    // exceljs(~940KB)·echarts(~545KB)는 분리된 단일 vendor 청크로, 더 쪼갤 수 없는 크기라 한계치를 올림
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // 대형 의존성을 별도 vendor 청크로 분리해 메인 번들을 가볍게 유지
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // echarts + zrender(렌더 엔진) + vue-echarts 래퍼
            if (id.includes('echarts') || id.includes('zrender') || id.includes('vue-echarts')) {
              return 'echarts'
            }
            // 엑셀 파싱 (exceljs)
            if (id.includes('exceljs')) {
              return 'exceljs'
            }
            // Vue 프레임워크 (vue / @vue / vue-router)
            if (id.includes('/vue/') || id.includes('@vue') || id.includes('vue-router')) {
              return 'vue'
            }
          }
        },
      },
    },
  },
})
