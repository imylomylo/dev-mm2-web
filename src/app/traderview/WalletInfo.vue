<template>
  <v-card max-width="auto" class="mx-auto" outlined>
    <v-toolbar flat dense color="blue-grey lighten-5">
      <v-toolbar-title>
        <span class="subheading">Wallets</span>
      </v-toolbar-title>
      <div class="flex-grow-1"></div>
      <v-chip
        class="ma-2"
        color="purple"
        outlined
        @click="myBalance(wallets.base.ticker, wallets.rel.ticker)"
      >
        <v-icon left>mdi-server-plus</v-icon>Refresh
      </v-chip>
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
      <tbody>
        <tr v-for="row in wallets" v-bind:key="row.ticker">
          <td>{{ row.ticker }}</td>
          <td>{{ row.balance }}</td>
          <td>{{ row.address }}</td>
          <td>
            <div class="text-left">
              <v-chip class="ma-2" color="success" @click="deposit(row.ticker, row.address)">
                <v-icon left>mdi-server-plus</v-icon>Deposit
              </v-chip>
              <v-chip class="ma-2" color="red" dark @click="showWithdrawOverlay(row.ticker)">
                <v-icon left>mdi-server-plus</v-icon>Withdraw
              </v-chip>
            </div>
          </td>
        </tr>
      </tbody>
    </v-simple-table>
    <v-overlay opacity="0.88" :absolute="absoluteOverlay" :value="depositOverlay" z-index="6">
      {{ depositTicker }}: {{ depositAddress }}
      <qrcode-vue :value="depositAddress" :size="depositOverlaySize" level="L"></qrcode-vue>
      <v-btn color="success" @click="hideDepositOverlay">Dismiss</v-btn>
    </v-overlay>
    <v-overlay opacity="0.88" :absolute="absoluteOverlay" :value="withdrawOverlay" z-index="6">
      <v-card class="mx-auto" min-width="400">
        <v-form ref="form">
          <v-text-field v-model="withdrawAddress" label="Address" required></v-text-field>
          <v-text-field v-model="withdrawAmount" label="Amount" required></v-text-field>
        </v-form>
        <v-btn color="success" @click="withdraw()">Send</v-btn>
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
      absoluteOverlay: false,
      depositOverlay: false,
      depositOverlaySize: 400,
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
        //add 1 or 2 seconds of delay
      this.myBalance(this.wallets.base.ticker, this.wallets.rel.ticker);
    },
    showWithdrawOverlay: function(ticker) {
      console.log("Withdraw Overlay: " + ticker);
      this.withdrawTicker = ticker;
      this.withdrawAddress = "";
      this.withdrawOverlay = true;
    },
    deposit: function(ticker, address) {
      console.log("Deposit: " + ticker + " @ " + address);
      this.depositTicker = ticker;
      this.depositAddress = address;
      this.depositOverlay = true;
    },
    withdraw: function(ticker, amount) {
      console.log("Withdraw: " + ticker);
      let requestData = {};
      requestData["coin"] = this.withdrawTicker;
      requestData["to"] = this.withdrawAddress;
      requestData["amount"] = this.withdrawAmount;
      requestData["method"] = "withdraw";
      requestData["userpass"] = process.env.VUE_APP_USERPASS;

      axios
        .post(
          "http://" +
            process.env.VUE_APP_WEBHOST +
            ":" +
            process.env.VUE_APP_WEBPORT +
            "/" +
            process.env.VUE_APP_MMBOTHOST +
            ":" +
            process.env.VUE_APP_MMBOTPORT +
            "/api/v1/legacy/mm2/withdraw",
          requestData
        )
        .then(response => {
          console.log(JSON.stringify(response.data, null, 4));
          let requestData = {};
          requestData["coin"] = this.withdrawTicker;
          requestData["tx_hex"] = response.data.tx_hex;
          requestData["method"] = "send_raw_transaction";
          requestData["userpass"] = process.env.VUE_APP_USERPASS;

          axios
            .post(
              "http://" +
                process.env.VUE_APP_MMBOTHOST +
                ":" +
                process.env.VUE_APP_MMBOTPORT +
                "/api/v1/legacy/mm2/send_raw_transaction",
              requestData
            )
            .then(response => {
              console.log(JSON.stringify(response, null, 4));
              this.hideWithdrawOverlay();
            })
            .catch(e => {
              this.customerrors.push(e);
            });
        })
        .catch(e => {
          this.customerrors.push(e);
        });
    },
    myBalance: function(base, rel) {
      console.log("My balance");
      axios
        .get(
            process.env.VUE_APP_MMBOTURL +
            "/getBalance?coin=" +
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
            process.env.VUE_APP_MMBOTURL +
            "/getBalance?coin=" +
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
