<template>
  <v-card max-width="auto" class="mx-auto">
    <v-toolbar flat dense color="blue-grey lighten-5">
      <v-toolbar-title>
        <span class="subheading">Wallets</span>
      </v-toolbar-title>
    </v-toolbar>
    <v-divider class="mx-4"></v-divider>

    <v-simple-table fixed-header height="auto">
      <thead>
        <tr>
          <th class="text-left">TICKER</th>
          <th class="text-left">Balance</th>
          <th class="text-left">Address</th>
          <th class="text-left">Actions</th>
        </tr>
      </thead>
      <tbody v-if="allwallets">
        <tr v-for="row in allwallets" v-bind:key="row.ticker">
          <td>{{ row.ticker }}</td>
          <td>{{ row.balance }}</td>
          <td>{{ row.address }}</td>
          <td>
            <div class="text-left">
              <v-chip class="ma-2" color="success" @click="deposit(row.ticker, row.address)">
                <v-icon left>mdi-server-plus</v-icon>Deposit
              </v-chip>
              <v-chip class="ma-2" color="red" dark @click="withdraw(122)">
                <v-icon left>mdi-server-plus</v-icon>Withdraw
              </v-chip>
            </div>
          </td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr>
          <td>Waiting for wallet info</td>
        </tr>
      </tbody>
    </v-simple-table>
    <v-overlay opacity="0.88" :absolute="absoluteOverlay" :value="depositOverlay" z-index="6">
      {{ depositTicker }}: {{ depositAddress }}
      <qrcode-vue :value="depositAddress" :size="depositOverlaySize" level="L"></qrcode-vue>
      <v-btn color="success" @click="hideDepositOverlay">Dismiss</v-btn>
    </v-overlay>
  </v-card>
</template>
<script>
import axios from "axios";
import QrcodeVue from "qrcode.vue";

export default {
  components: { QrcodeVue },
  data: function() {
    return {
      absoluteOverlay: false,
      depositOverlay: false,
      depositOverlaySize: 400,
      depositTicker: "",
      depositAddress: "",
      customerrors: [],
      allwallets: []
    };
  },
  methods: {
    isEnabled: function(ticker) {
      console.log("isEnabled(): Checking " + ticker);
      if (this.activeCoins.some(e => e.ticker === ticker)) {
        return true;
      }
    },
    updateBalances: function() {
      console.log("Update balances");
      this.allwallets.forEach(function(item, index) {
        this.myBalance(item, index);
      });
    },
    hideDepositOverlay: function() {
      (this.depositOverlay = false),
        (this.depositTicker = ""),
        (this.depositAddress = "");
    },
    deposit: function(ticker, address) {
      console.log("Deposit: " + ticker + " @ " + address);
      this.depositTicker = ticker;
      this.depositAddress = address;
      this.depositOverlay = true;
    },
    withdraw: function(ticker) {
      console.log("Withdraw: " + ticker);
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
          this.wallets[index].balance = response.data.balance;
          this.wallets[index].address = response.data.address;
        })
        .catch(e => {
          this.customerrors.push(e);
        });
    }
  },
  created: function() {
    console.log("DashboardWalletInfo Created");
    console.log("DashboardWalletInfo Finished");
  },
  watch: {
    allwallets: function(newval, oldval) {
      console.log(
        "Old val & new val: " +
          JSON.stringify(oldval + " *** " + JSON.stringify(newval))
      );
      this.updateBalances();
    }
  }
};
</script>
<style scoped>
</style>
