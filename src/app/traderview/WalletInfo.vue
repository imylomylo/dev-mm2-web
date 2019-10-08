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
          <th class="text-left">24h Delta</th>
          <th class="text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in wallets" v-bind:key="row.ticker">
          <td>{{ row.ticker }}</td>
          <td>{{ row.balance }}</td>
          <td>n/a</td>
          <td>
            <div class="text-left">
              <v-chip class="ma-2" color="success" @click="deposit(row.ticker, row.address)">
                <v-icon left>mdi-server-plus</v-icon>Deposit
              </v-chip>
              <v-chip class="ma-2" color="red" dark @click="withdraw(row.ticker)">
                <v-icon left>mdi-server-plus</v-icon>Withdraw
              </v-chip>
            </div>
          </td>
        </tr>
      </tbody>
    </v-simple-table>
    <v-overlay opacity="0.88" :absolute="absoluteOverlay" :value="depositOverlay">
      {{ depositTicker }}: {{ depositAddress }}
      <qrcode-vue :value="depositAddress" :size="depositOverlaySize" level="L"></qrcode-vue>
      <v-btn color="success" @click="hideDepositOverlay">Dismiss</v-btn>
    </v-overlay>
    <v-overlay opacity="0.88" :absolute="absoluteOverlay" :value="withdrawOverlay">
      <v-card class="mx-auto" min-width="400">
        <v-form ref="form">
          <v-text-field v-model="withdrawAddress" label="Address" required></v-text-field>
          <v-text-field v-model="withdrawAmount" label="Amount" required></v-text-field>
        </v-form>
        <v-btn color="success" @click="hideWithdrawOverlay">Send</v-btn>
        <v-btn color="error" @click="hideWithdrawOverlay">Cancel</v-btn>
      </v-card>
    </v-overlay>
  </v-card>
</template>
<script>
import axios from "axios";
import WalletActions from "./lib/wallet.js";
import QrcodeVue from "qrcode.vue";

export default {
  props: ["wallets"],
  components: { QrcodeVue },
  data: function() {
    return {
      absoluteOverlay: true,
      depositOverlay: false,
      depositOverlaySize: 100,
      depositTicker: "",
      depositAddress: "",
      withdrawOverlay: false,
      withdrawTicker: "",
      withdrawAddress: "",
      withdrawAmount: 0,
      customerrors: []
    };
  },
  methods: {
    isEnabled: function(ticker) {
      console.log("isEnabled(): Checking " + ticker);
      if (this.activeCoins.some(e => e.ticker === ticker)) {
        return true;
      }
    },
    hideDepositOverlay: function() {
      (this.depositOverlay = false),
        (this.depositTicker = ""),
        (this.depositAddress = "");
    },
    hideWithdrawOverlay: function() {
      (this.withdrawOverlay = false),
        (this.withdrawAddress = ""),
        (this.withdrawAmount = 0);
    },
    deposit: function(ticker, address) {
      console.log("Deposit: " + ticker + " @ " + address);
      this.depositTicker = ticker;
      this.depositAddress = address;
      this.depositOverlay = true;
    },
    withdraw: function(ticker) {
      console.log("Withdraw: " + ticker);
      this.withdrawTicker = ticker;
      this.withdrawAddress = "";
      this.withdrawOverlay = true;
    },
    myBalance: function(base, rel) {
      console.log("My balance");
      axios
        .get(
          "http://" +
            process.env.VUE_APP_WEBHOST +
            ":" +
            process.env.VUE_APP_WEBPORT +
            "/" +
            process.env.VUE_APP_MMBOTHOST +
            ":" +
            process.env.VUE_APP_MMBOTPORT +
            "/api/v1/legacy/mm2/my_balance?currency=" +
            base
        )
        .then(response => {
          console.log(response.data);
          this.wallets.base.balance = response.data.balance;
          this.wallets.base.address = response.data.address;
        })
        .catch(e => {
          this.customerrors.push(e);
        });

      axios
        .get(
          "http://" +
            process.env.VUE_APP_WEBHOST +
            ":" +
            process.env.VUE_APP_WEBPORT +
            "/" +
            process.env.VUE_APP_MMBOTHOST +
            ":" +
            process.env.VUE_APP_MMBOTPORT +
            "/api/v1/legacy/mm2/my_balance?currency=" +
            rel
        )
        .then(response => {
          console.log(response.data);
          this.wallets.rel.balance = response.data.balance;
          this.wallets.rel.address = response.data.address;
        })
        .catch(e => {
          this.customerrors.push(e);
        });
      console.log(this.wallets.base.balance);
      console.log(this.wallets.rel.balance);
    },
    enableCoin: function(coin) {
      console.log("Enable " + JSON.stringify(this.supportedCoins[coin].ticker));
      console.log(JSON.stringify(this.supportedCoins[coin].servers));
      let coinservers = this.supportedCoins[coin].servers;
      axios
        .post(
          "http://" +
            process.env.VUE_APP_WEBHOST +
            ":7780/connectcoin?coin=" +
            this.supportedCoins[coin].ticker +
            "&servers=" +
            JSON.stringify(coinservers)
        )
        .then(response => {
          // if response.data.result == "success"
          console.log("enableCoin() response data: " + response.data);
          let newCoin = response.data;
          newCoin.papid = this.supportedCoins[coin].ticker;
          console.log("New PAPID: " + newCoin);
          this.activeCoins.push(newCoin);
          this.$parent.$forceUpdate();
        })
        .catch(e => {
          this.customerrors.push(e);
        });
    }
  },
  created: function() {
    console.log("WalletInfo Created");
    this.myBalance(this.wallets.base.ticker, this.wallets.rel.ticker);
    console.log("WalletInfo Finished");
  }
};
</script>
<style scoped>
</style>