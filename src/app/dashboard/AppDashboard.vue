<template>
  <div>
    <h2>{{ appName }}</h2>
    <v-layout>
      <v-flex md6 lg6>
        <v-row class="px-4">
          <v-col>
            <WalletInfo v-bind:wallets="allwallets" />
          </v-col>
        </v-row>
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
import WalletInfo from "../traderview/WalletInfo";
import AppStrategy from "../strategy/AppStrategy";
import AppExport from "../export/AppExport";

export default {
  components: { WalletInfo, AppStrategy, AppExport },
  data: function() {
    return {
      appName: "Dashboard",
      customerrors: [],
      allwallets: []
    };
  },
  methods: {
    setAllWallets: function() {
      this.allwallets = [
        { ticker: "BTC", balance: 5 },
        { ticker: "KMD", balance: 11 },
        { ticker: "DOGE", balance: 123 }
      ];
    }
  },
  created: function() {
    console.log(this.appName + " Created");
    this.setAllWallets();
    console.log(this.appName + " Finished Created");
  }
};
</script>