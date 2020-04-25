<template>
  <div>
    <v-card class="mx-auto" max-width="auto" outlined>
      <v-toolbar flat dense color="red lighten-1">
        <v-toolbar-title>
          <span class="subheading">Single Order {{wallets.base.ticker}}</span>
        </v-toolbar-title>
        <div class="flex-grow-1"></div>
      </v-toolbar>

      <v-divider class="mx-4"></v-divider>

      <v-form ref="form">
        <v-text-field v-model="price" :label="priceInOtherCoinLabel()" required></v-text-field>
        <v-text-field v-model="amount" label="Amount" required></v-text-field>
        <v-card-text>
          <v-chip-group
            class="justify-space-around"
            active-class="deep-purple accent-4 white--text"
            column
          >
            <v-chip @click="ordersize_pc(5)">5%</v-chip>
            <v-chip @click="ordersize_pc(10)">10%</v-chip>
            <v-chip @click="ordersize_pc(125)">25%</v-chip>
            <v-chip @click="ordersize_pc(50)">50%</v-chip>
            <v-chip @click="ordersize_pc(100)">100%</v-chip>
          </v-chip-group>
        </v-card-text>
        <v-text-field v-model="total" label="Total" required></v-text-field>
        <div class="text-center">
          <v-chip class="ma-2" color="success" @click="buyBase(wallets.base.ticker)">
            <v-icon left>mdi-server-plus</v-icon>
            Buy {{ wallets.base.ticker }}
          </v-chip>
          <v-chip class="ma-2" color="red" dark @click="sellBase(wallets.base.ticker)">
            <v-icon left>mdi-server-plus</v-icon>
            Sell {{ wallets.base.ticker }}
          </v-chip>
        </div>
      </v-form>
      <v-overlay :opacity="0.88" :absolute="absoluteOverlay" :value="orderSentOverlay">
          <v-progress-circular :size="70" :width="7" color="purple" indeterminate></v-progress-circular>
      </v-overlay>
    </v-card>
  </div>
</template>
<script>
import axios from "axios";

export default {
  name: "SingleOrder",
  components: {},
  props: { wallets: { type: Object } },
  data: function() {
    return {
      absoluteOverlay: true,
      orderSentOverlay: false,
      currentStrategyInfo: "na...",
      price: "",
      amount: "",
      trade: { base: "", rel: "", price: "", amount: "0" }
    };
  },
  methods: {
    priceInOtherCoinLabel: function() {
      return "Price in other coin (" + this.wallets.rel.ticker + ")"
    },
    ordersize_pc: function(pc) {
      console.log(pc);
    },
    handleOrderResponse: function(){
      this.orderSentOverlay = false
    },
    sellBase: function() {
      console.log("SingleOrder sell (base): " + this.wallets.base.ticker )
      let orderDetails = {}
      orderDetails.price = this.price
      orderDetails.amount = this.amount
      this.orderSentOverlay = true 
      this.$emit("sell-base", orderDetails)
      this.price = ""
      this.amount = ""
    },
    buyBase: function() {
      console.log("SingleOrder buy base: " + this.wallets.base.ticker )
      let orderDetails = {}
      orderDetails.price = this.price
      orderDetails.amount = this.amount
      this.orderSentOverlay = true 
      this.$emit("buy-base", orderDetails)
      this.price = ""
      this.amount = ""
    }
  },
  created: function() {
    console.log("SingleOrder Created");
  },
  computed: {
    total: function() {
      return this.price * this.amount;
    }
  }
};
</script>
<style scoped>
.v-progress-circular {
  margin: 1rem;
}
</style>
