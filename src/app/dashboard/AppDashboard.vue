<template>
  <div>
    <h2>{{ appName }}</h2>
    <v-layout>
      <v-flex md6 lg6>
        <v-row class="px-4">
          <v-col>
            <DashboardWalletInfo v-bind:wallets="allwallets" ref="dashboardWallets" />
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
            <AppExport />
          </v-col>
        </v-row>
        <v-row class="px-4">
          <v-col>
            <MyOrders />
          </v-col>
        </v-row>
      </v-flex>
    </v-layout>
  </div>
</template>
<script>
import axios from 'axios'
import DashboardWalletInfo from "./DashboardWalletInfo"
import AppStrategy from "../strategy/AppStrategy"
import AppExport from "../export/AppExport"
import MyOrders from '../traderview/MyOrders'

export default {
  components: { DashboardWalletInfo, AppStrategy, AppExport, MyOrders },
  data: function() {
    return {
      appName: "Dashboard",
      customerrors: [],
      allwallets: []
    };
  },
  methods: {
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
          this.$refs.dashboardWallets.allwallets = this.allwallets
        })
        .catch(e => {
          this.customerrors.push(e);
        });
    }
  },
  created: function() {
    console.log(this.appName + " Created");
    this.setAllWallets();
    console.log(this.appName + " Finished Created");
  }
};
</script>
