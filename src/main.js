import Vue from 'vue'
import router from './app/app-routes'
import App from './app/App.vue'
import vuetify from './plugins/vuetify';
// import 'vuetify/dist/vuetify.min.css'

Vue.config.productionTip = false
new Vue({
  vuetify,
  router,
  render: h => h(App)
}).$mount('#app')
