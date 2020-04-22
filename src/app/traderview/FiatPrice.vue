<template>
  <div class="flex-grow-1">
    <v-divider class="mx-4" vertical></v-divider>
    <v-btn depressed small @click=refresh()>Coin Gecko {{ fiat.toUpperCase() }}: {{ base }}: {{ market.base.price }} | {{ rel }}: {{ market.rel.price }}</v-btn>
  </div>
</template>
<script>
import axios from 'axios'
export default {
  components: {
    // CurrentStrategies
  },
  props: ["base", "rel"],
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
      this.getCoinGeckoFiat(this.base, this.rel)
    },
    getCoinGeckoFiat: function(base, rel) {
      console.log("Coin Gecko fiat:" + base + "/BTC");
      axios
        .get(
            process.env.VUE_APP_MMBOTURL +
            "/getpricecoingecko?coin="+base
        )
        .then(response => {
          console.log(JSON.stringify(response.data, null, 4));
          this.market.base.price = response.data.current_prices.usd
        })
        .catch(e => {
          this.customerrors.push(e);
        })
      axios
        .get(
            process.env.VUE_APP_MMBOTURL +
            "/getpricecoingecko?coin="+rel
        )
        .then(response => {
          this.market.rel.price = response.data.current_prices.usd
          console.log(JSON.stringify(response.data, null, 4));
        })
        .catch(e => {
          this.customerrors.push(e);
        })
    }
  },
  created: function() {
    this.getCoinGeckoFiat(this.base, this.rel)
  }
}
</script>
<style scoped>
</style>
