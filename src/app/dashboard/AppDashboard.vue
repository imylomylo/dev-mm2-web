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
      </v-flex>
    </v-layout>
  </div>
</template>
<script>
import axios from 'axios'
import DashboardWalletInfo from "./DashboardWalletInfo"
import AppStrategy from "../strategy/AppStrategy"
import AppExport from "../export/AppExport"

export default {
  components: { DashboardWalletInfo, AppStrategy, AppExport },
  data: function() {
    return {
      appName: "Dashboard",
      customerrors: [],
      allwallets: []
    };
  },
  methods: {
    setAllWallets: function() {
      console.log("Getting enabled coins")
      axios
        .get(
          "http://" +
            process.env.VUE_APP_MMBOTHOST +
            ":" +
            process.env.VUE_APP_MMBOTPORT +
            "/coinsenabled"
        )
        .then(response => {
          console.log(JSON.stringify(response.data.result))
          this.allwallets = response.data.result;
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
