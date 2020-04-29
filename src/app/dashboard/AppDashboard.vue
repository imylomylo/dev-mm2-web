<template>
  <div>
    <h2>{{ appName }}  {{ myCoin }} </h2>
    <v-layout>
      <v-flex md6 lg6>
        <v-row class="px-4">
          <v-col>
            <DashboardWalletInfo v-bind:wallets="allwallets" ref="dashboardWallets" v-bind:myCoin="myCoin"/>
          </v-col>
        </v-row>
      </v-flex>
      <v-flex md6 lg6>
        <v-row class="px-4">
          <v-col>
            <AppStrategy />
          </v-col>
        </v-row>
        <v-row class="px-4">
          <v-col>
            <AppExport v-bind:swapHistory="recentSwaps" v-on:get-swap-history="handleGetSwapHistory" v-on:hide-swap-history="handleHideSwapHistory" v-on:save-json="handleSaveJSON"/>
          </v-col>
        </v-row>
        <v-row class="px-4">
          <v-col>
<!--
not sure if something needed from this definition of component, keeping as comment for now
              <MyOrders v-bind:myOrders="myOrders" v-bind:myOrdersThisMarket="myOrdersThisMarket" v-on:refresh-myorders="handleRefreshMyOrders" 
                        v-on:cancel-order="handleCancelOrder" 
                        v-on:cancel-all-orders="handleCancelAllOrders" 
                        v-on:myOrdersResponse="handleMyOrders" ref="myordersref" />
-->
              <MyOrders v-bind:myOrders="myOrders" v-bind:myOrdersThisMarket="[]" v-on:refresh-myorders="handleRefreshMyOrders" 
                        v-on:cancel-order="handleCancelOrder" 
                        v-on:cancel-all-orders="handleCancelAllOrders" 
                        ref="myordersref" />
          </v-col>
        </v-row>
<!--
        <v-row class="px-4">
          <v-col>
            <NewComponent />
          </v-col>
        </v-row>
-->
      </v-flex>
    </v-layout>
  </div>
</template>
<script>
import axios from 'axios'
import mm2 from '../traderview/lib/mm2MiddlewareClient'
import DashboardWalletInfo from "./DashboardWalletInfo"
import AppStrategy from "../strategy/AppStrategy"
import AppExport from "../export/AppExport"
import MyOrders from '../traderview/MyOrders'
import RecentSwaps from '../history/RecentSwaps'

export default {
  components: { DashboardWalletInfo, AppStrategy, AppExport, MyOrders, RecentSwaps },
  data: function() {
    return {
      appName: "Dashboard",
      recentSwaps: [],
      myCoin: process.env.VUE_APP_MYCOIN,
      customerrors: [],
      allwallets: [],
      myOrders: []
    };
  },
  methods: {
    handleSaveJSON: function(contentObject) {
// from https://www.4codev.com/javascript/download-save-json-content-to-local-file-in-javascript-idpx473668115863369846.html
      const a = document.createElement("a")
      const file = new Blob([JSON.stringify(contentObject,null,4)], { type: 'application/json'})
      a.href = URL.createObjectURL(file)
      a.download = contentObject.my_info.my_coin + "-" + contentObject.my_info.other_coin + "-" + contentObject.uuid + ".json"
      a.click()
    },
    handleHideSwapHistory: function() {
      this.recentSwaps = []
    },
    handleGetSwapHistory: function() {
       console.log("AppDashboard.handleGetSwapHistory")
       mm2.recentSwaps().then( response => {
         this.recentSwaps = response.data.result
       })
    },
    handleRefreshMyOrders: function() {
      console.log("AppTraderView.handleRefreshMyOrders")
      this.handleMyOrders
    },
    handleCancelOrder: function(uuid) {
      console.log("AppTraderView.handleCancelOrder: " + uuid)
      mm2.cancelOrder(uuid).then( response => {
         console.log("Cancel order response: " + response)
      }).catch((reason) => {
        console.log("Could not cancel order " + uuid)
      })
      this.handleMyOrders()
    },
    handleCancelAllOrders: function() {
      console.log("AppTraderView.handleCancelAllOrders")
    },
    handleMyOrders: function(){
      mm2.getMyOrders().then( response => {
        // because working with an object of objects in js sucks, convert to array
        this.myOrders = Object.values(response.data.result.maker_orders)
      }).then( () => {
        console.log("AppDashboard.myOrders -> highlightOrders")
      })
    },
    setAllWallets: function() {
      console.log("Getting enabled coins with MMBOTURL")
      axios
        .get(
            process.env.VUE_APP_MMBOTURL +
            "/coinsenabled"
        )
        .then(response => {
          console.log(JSON.stringify(response.data.result))
          this.allwallets = response.data.result.sort((a,b) => a.ticker.localeCompare(b.ticker))
          this.updateBalances()
          this.$refs.dashboardWallets.allwallets = this.allwallets
        })
        .catch(e => {
          this.customerrors.push(e);
        });
    },
    updateBalances: function() {
      console.log("Update balances");
      this.allwallets.forEach(function(item, index) {
        console.log("Updating " + item.ticker)
        this.myBalance(item, index);
      });
    },
    myBalance: function(wallet, index) {
      console.log("Fetch myBalance: " + JSON.stringify(wallet));
      axios
        .get(
            process.env.VUE_APP_MMBOTURL +
            "/getBalance?coin=" +
            wallet.ticker
        )
        .then(response => {
          console.log(response.data);
          this.allwallets[index].balance = response.data.balance;
          this.allwallets[index].address = response.data.address;
        })
        .catch(e => {
          this.customerrors.push(e);
        });
    }
  },
  created: function() {
    console.log(this.appName + " Created")
    this.setAllWallets()
    this.handleMyOrders()
    console.log(this.appName + " Finished Created")
  }
};
</script>
