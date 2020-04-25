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
        @click="refreshBalances()"
      >
        <!-- @click="myBalance(wallets.base.ticker, wallets.rel.ticker)" -->
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
<!-- mePrivate and mePublic are set in .env* files of the root of the webapp project and read in at runtime -->
<div v-if="mePrivate == 'true' && mePublic == 'false'">
              <v-chip class="ma-2" color="success" @click="deposit(row.ticker, row.address)">
                <v-icon left>mdi-server-plus</v-icon>Deposit
              </v-chip>
              <v-chip class="ma-2" color="red" dark @click="showWithdrawOverlay(row.ticker)">
                <v-icon left>mdi-server-plus</v-icon>Withdraw
              </v-chip>
</div>
<div v-else>
              <v-chip class="ma-2" color="success" @click="deposit(row.ticker, row.address)">
                <v-icon left>mdi-server-plus</v-icon>Donate
              </v-chip>
</div>
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
      mePrivate: process.env.VUE_APP_MEPRIVATE,
      mePublic: process.env.VUE_APP_MEPUBLIC,
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
    hideDepositOverlay: function() {
      (this.depositOverlay = false),
        (this.depositTicker = ""),
        (this.depositAddress = "");
    },
    hideWithdrawOverlay: function() {
      (this.withdrawOverlay = false),
        (this.withdrawAddress = ""),
        (this.withdrawAmount = 0);
       this.$emit("refresh-balances")
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
// TODO
//    withdraw: function(ticker, amount) {
//      console.log("Withdraw: " + ticker);
//      let requestData = {};
//      requestData["coin"] = this.withdrawTicker;
//      requestData["to"] = this.withdrawAddress;
//      requestData["amount"] = this.withdrawAmount;
//      requestData["method"] = "withdraw";
//      requestData["userpass"] = process.env.VUE_APP_USERPASS;
//
//      axios
//        .post(
//          "http://" +
//            process.env.VUE_APP_WEBHOST +
//            ":" +
//            process.env.VUE_APP_WEBPORT +
//            "/" +
//            process.env.VUE_APP_MMBOTHOST +
//            ":" +
//            process.env.VUE_APP_MMBOTPORT +
//            "/api/v1/legacy/mm2/withdraw",
//          requestData
//        )
//        .then(response => {
//          console.log(JSON.stringify(response.data, null, 4));
//          let requestData = {};
//          requestData["coin"] = this.withdrawTicker;
//          requestData["tx_hex"] = response.data.tx_hex;
//          requestData["method"] = "send_raw_transaction";
//          requestData["userpass"] = process.env.VUE_APP_USERPASS;
//
//          axios
//            .post(
//              "http://" +
//                process.env.VUE_APP_MMBOTHOST +
//                ":" +
//                process.env.VUE_APP_MMBOTPORT +
//                "/api/v1/legacy/mm2/send_raw_transaction",
//              requestData
//            )
//            .then(response => {
//              console.log(JSON.stringify(response, null, 4));
//              this.hideWithdrawOverlay();
//            })
//            .catch(e => {
//              this.customerrors.push(e);
//            });
//        })
//        .catch(e => {
//          this.customerrors.push(e);
//        });
//    },
    refreshBalances() {
       this.$emit("refresh-balances")
    }
  },
  created: function() {
    console.log("WalletInfo Created");
  }
};
</script>
<style scoped>
</style>
