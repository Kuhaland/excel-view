import { createApp } from 'vue'
import App from './App.vue'
import './assets/scss/style.scss'
import OverlayScrollbarsPlugin from './plugins/overlay-scrollbars.js'

createApp(App).use(OverlayScrollbarsPlugin).mount('#app')
