<template>
  <v-card max-width="auto" class="mx-auto">
    <v-toolbar flat dense color="blue-grey lighten-5">
      <v-toolbar-title>
        <span class="subheading">Wallets</span>
      </v-toolbar-title>
      <div class="flex-grow-1"></div>
      <span class="ma-5 mt-11"><v-checkbox v-model="hideZero" :disabled="hideZeroDisable" label="Hide Zero Balance"></v-checkbox></span>
      <v-chip
        class="ma-2"
        color="purple"
        :disabled="hideZeroDisable"
        outlined
        @click="updateBalances()"
      >
        <v-icon left>mdi-server-plus</v-icon>
        <template v-if="hideZeroDisable">Loading {{allwallets.length}} Wallets</template>
        <template v-else>Refresh</template>
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
          <th class="text-left">Market</th>
        </tr>
      </thead>
      <tbody v-if="allwallets">
        <template v-if="hideZero">
        <tr v-for="(row, key) in visible">
<td>{{row.ticker}}</td>
<td>{{row.balance}}</td>
<td>{{row.address}}</td>
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
          <td>
              <v-chip
                class="ma-2"
                color="purple"
                outlined
                @click="toTraderView(myCoin, row.ticker)"
              >
                <v-icon left>mdi-server-plus</v-icon>{{ myCoin }}/{{row.ticker}}
              </v-chip>

          </td>
        </tr>
        </template>
        <template v-else >
        <tr v-for="row in allwallets" v-bind:key="row.ticker">
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
          <td>
              <v-chip
                class="ma-2"
                color="purple"
                outlined
                @click="toTraderView(myCoin, row.ticker)"
              >
                <v-icon left>mdi-server-plus</v-icon>{{ myCoin }}/{{row.ticker}}
              </v-chip>
          </td>
        </tr>
        </template>
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
  props: [ 'wallets', 'myCoin' ],
  data: function() {
    return {
      mePrivate: process.env.VUE_APP_MEPRIVATE,
      mePublic: process.env.VUE_APP_MEPUBLIC,
      absoluteOverlay: false,
      depositOverlay: false,
      depositOverlaySize: 400,
      depositTicker: "",
      depositAddress: "",
      hideZero: false,
      hideZeroDisable: true,
      customerrors: []
    }
  },
  methods: {
    isEnabled: function(ticker) {
      console.log("isEnabled(): Checking " + ticker);
      if (this.activeCoins.some(e => e.ticker === ticker)) {
        return true;
      }
    },
    updateBalances: function() {
      this.hideZeroDisable = true
      let lastticker=this.allwallets[this.allwallets.length-1].ticker
      this.allwallets.forEach(function(item, index) {
        console.log("Updating [" + index + "]" + item.ticker)
      axios
        .get(
            process.env.VUE_APP_MMBOTURL +
            "/getBalance?coin=" +
            item.ticker
        )
        .then((response) => {
          item.balance = response.data.balance;
          item.address = response.data.address;
          this.allwallets[index].balance = item.balance
          console.log(JSON.stringify(this.allwallets[index], null, 2))
          if( lastticker == item.ticker ){
            console.log("All updated")
            this.hideZeroDisable = false
          }
        })
        .catch(function(e) {
          console.log("update balance error" + e)
        })
      }.bind(this))
      this.$forceUpdate()
      //this.hideZeroDisable = false
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
    toTraderView: function(base, rel){
      console.log("Invert base " + base);
      window.location.href = "/#/traderview/" + base + "/" + rel
      this.$router.go(this.$router.currentRoute);
    }
  },
  computed:  {
    allwallets: function(){
      return this.wallets
    },
    visible() {
      let result = {}
      for( let i in this.allwallets) {
        if(this.allwallets[i].balance == 0){
          continue
        }
        else {
          result[i] = this.allwallets[i]
        }
      }
      return result
    }
  },
  created: function() {
    console.log("DashboardWalletInfo Created");
    console.log("DashboardWalletInfo Finished");
  },
  watch: {
    allwallets: {
      deep: true,
      handler(newval, oldval) {
      console.log(
        "Old val & new val: " +
          JSON.stringify(oldval + " *** " + JSON.stringify(newval))
      )
      this.updateBalances()
      }
    }
  }
}
</script>
<style scoped>
</style>
