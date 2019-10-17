<template>
  <div>
    <v-card class="mx-auto" max-width="auto" outlined>
      <v-toolbar flat dense color="blue-grey lighten-5">
        <v-toolbar-title>
          <span class="subheading">Single Order</span>
        </v-toolbar-title>
        <div class="flex-grow-1"></div>
      </v-toolbar>

      <v-divider class="mx-4"></v-divider>

      <v-form ref="form">
        <v-text-field v-model="price" label="Price" required></v-text-field>
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
    ordersize_pc: function(pc) {
      console.log(pc);
    },
    sellBase: function(base) {
      console.log(
        "SingleOrder sell base: " +
          base +
          ", amount: " +
          this.amount +
          " @ " +
          this.price +
          " = " +
          this.total
      );
      this.orderSentOverlay = true 
      let requestData = {}
      requestData["base"] = this.wallets.base.ticker
      requestData["rel"] = this.wallets.rel.ticker
      requestData["method"] = "setprice"
      requestData["volume"] = this.amount
      requestData["price"] = this.price
      requestData["userpass"] = "YOUR_PASSWORD_HERE"
      console.log("Sell BASE: " + JSON.stringify(requestData, null, 4))

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
            "/api/v1/legacy/mm2/setprice",
          requestData
        )
        .then(response => {
          console.log(JSON.stringify(response.data))
          this.$emit("orderResponse", response.data.result)
          this.price = ""
          this.amount = ""
          this.orderSentOverlay = false
        })
        .catch(e => {
          this.customerrors.push(e);
        });
    },
    buyBase: function(base) {
      console.log(
        "SingleOrder buy base: " +
          base +
          ", amount: " +
          this.amount +
          " @ " +
          this.price +
          " = " +
          this.total
      )
      this.orderSentOverlay = true 
      let requestData = {}
      requestData["rel"] = this.wallets.base.ticker //flipped for a buy because of underlying mm2 mechanism
      requestData["base"] = this.wallets.rel.ticker //flipped for a buy because of underlying mm2 mechanism
      requestData["method"] = "setprice"
      requestData["volume"] = this.total.toString()
      requestData["price"] = (1/this.price).toString()  // 1/price for a buy & needs to be a string for the makerbot api
      requestData["userpass"] = "YOUR_PASSWORD_HERE"

      console.log("Buy BASE: " + JSON.stringify(requestData, null, 4))
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
            "/api/v1/legacy/mm2/setprice",
          requestData
        )
        .then(response => {
          console.log(JSON.stringify(response.data))
          this.$emit("orderResponse", response.data.result)
          this.price = ""
          this.amount = ""
          this.orderSentOverlay = false
        })
        .catch(e => {
          this.customerrors.push(e);
        })
    }
  },
  created: function() {
    console.log("SingleOrder Created");
    console.log("wallets: " + JSON.stringify(this.wallets))
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