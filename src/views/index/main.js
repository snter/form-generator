import Vue from 'vue'
import App from './App.vue'
import router from '@/router'
import '@/styles/index.scss'
import '@/icons'
import axios from 'axios'
import render from '@/components/render/render.vue'
import Tinymce from '@/components/tinymce/index.vue'

Vue.component('tinymce', Tinymce)
Vue.component('f-render',render)

Vue.config.productionTip = false
Vue.prototype.$axios = axios

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
