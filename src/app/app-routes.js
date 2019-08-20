// vue core
import Vue from 'vue'
import Router from 'vue-router'
// modules
import AppHome from '@/app/home/AppHome.vue'
import AppConsole from '@/app/console/AppConsole.vue'
import AppCoins from '@/app/coins/AppCoins.vue'
import AppWithdraw from '@/app/withdraw/AppWithdraw.vue'
import AppOrderbooks from '@/app/orderbooks/AppOrderbooks.vue'
import AppHistory from '@/app/history/AppHistory.vue'
import AppSettings from '@/app/settings/AppSettings.vue'
import AppBinance from '@/app/cexprices/AppBinance.vue'
import AppPaprika from '@/app/aggregators/AppPaprika.vue'

Vue.use(Router)

export default new Router({
  routes: [{
      path: '/',
      name: 'AppHome',
      component: AppHome
    },
    {
      path: '/console',
      name: 'Console',
      component: AppConsole
    },
    {
      path: '/coins',
      name: 'Coins',
      component: AppCoins
    },
    {
      path: '/withdraw',
      name: 'Withdraw',
      component: AppWithdraw
    },
    {
      path: '/orderbooks',
      name: 'Orderbooks',
      component: AppOrderbooks
    },
    {
      path: '/completedswaps',
      name: 'History',
      component: AppHistory
    },
    {
      path: '/settings',
      name: 'Settings',
      component: AppSettings
    },
    {
      path: '/cexprices',
      name: 'Binance',
      component: AppBinance
    },
    {
      path: '/aggregatorprices',
      name: 'Paprika',
      component: AppPaprika
    },
    {
      path: '/api',
      name: 'API',
      component: AppHome
    },
    {
      path: '/help',
      name: 'Help',
      component: AppHome
    }
  ]
})