<template>
  <div class="flex-grow-1">
    <v-divider class="mx-4" vertical></v-divider>
    <v-btn depressed small @click=refresh()>Coin Gecko {{ fiat.toUpperCase() }}: {{ this.wallets.base.ticker }}: {{ this.wallets.base.fiat }} | {{ this.wallets.rel.ticker }}: {{ this.wallets.rel.fiat }}</v-btn>
  </div>
</template>
<script>
import axios from 'axios'
export default {
  components: {
    // CurrentStrategies
  },
  props: ["wallets"],
  data: function() {
    return {
      currentStrategyInfo: "ONLY BUY KMD, 1.8% SPREAD WITH 10% ORDER SIZE",
      overlay: false,
      // base: '',
      // rel: '',
      fiat: 'usd',
      market: { base: { ticker: "RICK", price: 'none'} , rel: { ticker: "MORTY", price: "none" } },
      customerrors: []
    };
  },
  methods: {
    refresh: function() {
      this.$emit("refresh-fiat")
    }
  },
  created: function() {
    console.log("Fiat.created")
  }
}
</script>
<style scoped>
</style>
