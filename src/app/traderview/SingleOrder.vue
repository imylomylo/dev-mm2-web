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
          <v-chip class="ma-2" color="success" @click="onlybuyrel(wallets.rel.ticker)">
            <v-icon left>mdi-server-plus</v-icon> Only buy {{ wallets.rel.ticker }}
          </v-chip>
          <v-chip class="ma-2" color="red" dark @click="onlysellrel(wallets.rel.ticker)">
            <v-icon left>mdi-server-plus</v-icon>Only sell {{ wallets.rel.ticker }}
          </v-chip>
        </div>
      </v-form>
    </v-card>
  </div>
</template>
<script>
export default {
  name: "SingleOrder",
  components: {},
  props: { wallets: { type: Object } },
  data: function() {
    return {
      currentStrategyInfo: "na...",
      price: 1.224,
      amount: 777,
      trade: { base: "", rel: "", price: "", amount: "0" }
    };
  },
  methods: {
    ordersize_pc: function(pc) {
      console.log(pc);
    },
    onlybuyrel: function(rel) {
      console.log("SingleOrder buy rel: " + rel + ", amount: " + this.amount + " @ " + this.price + " = " + this.total);
      this.$emit("sendbuyorder", rel, this.amount, this.price, this.total);
    },
    onlysellrel: function(rel) {
      console.log("SingleOrder sell rel: " + rel + ", amount: " + this.amount + " @ " + this.price + " = " + this.total );
      this.$emit("sendsellorder", rel, this.amount, this.price, this.total)
    }
  },
  created: function() {
    console.log("SingleOrder Created")
    console.log("wallets: " + JSON.stringify(this.wallets))
  },
  computed: {
    total: function() {
      return this.price * this.amount;
    }
  }
};
</script>
