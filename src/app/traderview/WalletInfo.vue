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
          <td>{{ row.address }}</td>
          <td>
            <div class="text-left">
              <v-chip class="ma-2" color="success" @click="deposit(121)">
                <v-icon left>mdi-server-plus</v-icon>Deposit
              </v-chip>
              <v-chip class="ma-2" color="red" dark @click="withdraw(122)">
                <v-icon left>mdi-server-plus</v-icon>Withdraw
              </v-chip>
            </div>
          </td>
        </tr>
      </tbody>
    </v-simple-table>
  </v-card>
</template>
<script>
import axios from 'axios'
import WalletActions from "./lib/wallet.js";
export default {
  props: ["base", "rel", "wallets"],
  data: function() {
    return {
    };
  },
  methods: {
    isEnabled: function(coin) {
      console.log("isEnabled(): Checking " + coin);
      if (this.activeCoins.some(e => e.ticker === coin)) {
        return true;
      }
    },
    deposit: function(rel) {
      console.log("Deposit: " + rel);
    },
    withdraw: function(rel) {
      console.log("Withdraw: " + rel);
    },
    myBalance: function(base, rel) {
      console.log("My balance");
      axios
        .get(
          "http://" +
            process.env.VUE_APP_WEBHOST +
            ":7780/getBalance?coin=" +
            base
        )
        .then(response => {
          console.log(response.data);
          this.wallets.base.balance = response.data.balance;
        })
        .catch(e => {
          this.customerrors.push(e);
        });

      axios
        .get(
          "http://" +
            process.env.VUE_APP_WEBHOST +
            ":7780/getBalance?coin=" +
            rel
        )
        .then(response => {
          console.log(response.data);
          this.wallets.rel.balance = response.data.balance;
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
    },
    getServiceConfig: function() {
      axios
        .get("http://" + process.env.VUE_APP_WEBHOST + ":7780/config2")
        .then(response => {
          // console.log(response.data);
          // JSON responses are automatically parsed.
          if (response.data !== undefined) {
            // console.log(response.data.result)
            this.configService = response.data;
            console.log(
              "getServiceConfig(): configService: " +
                JSON.stringify(this.configService)
            );
            this.supportedCoins = this.configService;
            // this.supportedCoins = Object.keys(this.configService)
            console.log(this.supportedCoins);
          }
        })
        .catch(e => {
          this.customerrors.push(e);
        });
    }
  },
  created: function() {
    console.log("WalletInfo Created");
  }
};
</script>
<style scoped>
</style>