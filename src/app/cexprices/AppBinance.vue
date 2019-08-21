<template>
  <div>
    <h2>{{ appName }}</h2>
    <h3>Binance (quoted price)</h3>
    {{ binanceMarketData }}
    <div v-if="activeCoins !== undefined && activeCoins.length > 0">
      <div>
        <h2>Enabled Coin Markets</h2>
        <v-simple-table>
          <thead>
            <tr>
              <th class="text-left">Base</th>
              <th class="text-left">Fetch Binance /BTC</th>
              <th class="text-left">Latest</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in activeCoins" v-bind:key="row.id">
              <td>
                <a href="#">{{ row.ticker }}</a>
              </td>
              <td>
                <!-- {{getMarkets(row)}} -->
                <v-chip class="ma-2" @click="showCEXMarket(row.ticker)">{{row.ticker}}/BTC</v-chip>
              </td>
              <td>0.00</td>
            </tr>
          </tbody>
        </v-simple-table>
      </div>
    </div>
    <h3>Bittrex (last price)</h3>
    {{ bittrexMarketData }}
    <div v-if="activeCoins !== undefined && activeCoins.length > 0">
      <div>
        <h2>Enabled Coin Markets</h2>
        <v-simple-table>
          <thead>
            <tr>
              <th class="text-left">Base</th>
              <th class="text-left">Fetch Bittrex /BTC</th>
              <th class="text-left">Latest</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in activeCoins" v-bind:key="row.id">
              <td>
                <a href="#">{{ row.ticker }}</a>
              </td>
              <td>
                <!-- {{getMarkets(row)}} -->
                <v-chip class="ma-2" @click="showBITTREXMarket(row.ticker)">{{row.ticker}}/BTC</v-chip>
              </td>
              <td>0.00</td>
            </tr>
          </tbody>
        </v-simple-table>
      </div>
    </div>
  </div>
</template>
<script>
import axios from "axios";

export default {
  name: "AppCEXPrices",
  data: function() {
    return {
      activeCoins: "",
      binanceMarketData: "",
      bittrexMarketData: "",
      market: null,
      appName: "CEX Prices",
      customerrors: []
    };
  },
  methods: {
    showCEXMarket: function(base, rel) {
      console.log("Binance market:" + base + "/BTC");
      this.binanceMarketData = base + "/BTC";
      axios
        .get(
          "http://" + process.env.VUE_APP_WEBHOST + ":7780/getbinancemarketprice?base=" +
            base +
            "&rel=BTC"
        )
        .then(response => {
          // if response.data.result == "success"
          console.log(response.data);
          this.binanceMarketData += " :" + response.data.price;
        })
        .catch(e => {
          this.customerrors.push(e);
        });
    },
    showBITTREXMarket: function(base, rel) {
      this.bittrexMarketData = base + "/BTC";
      axios
        .get(
          "http://" + process.env.VUE_APP_WEBHOST + ":7780/getbittrexmarketprice?base=" +
            base +
            "&rel=BTC"
        )
        .then(response => {
          // if response.data.result == "success"
          console.log(response.data);
          this.bittrexMarketData += " :" + parseFloat(response.data.result.Last);
        })
        .catch(e => {
          this.customerrors.push(e);
        });
    },
    getCEXMarkets: function() {
      return "binance";
    }
  },
  created: function() {
    console.log(this.appName + " Created");
    axios
      .get("http://" + process.env.VUE_APP_WEBHOST + ":7780/coinsenabled")
      .then(response => {
        // console.log(response.data);
        // JSON responses are automatically parsed.
        if (response.data !== undefined) {
          // console.log(response.data.result)
          this.activeCoins = response.data.result;
          console.log("ACTIVE COINS: " + JSON.stringify(this.activeCoins));
        }
      })
      .catch(e => {
        this.customerrors.push(e);
      });
    // this.showMarket("RICK", "MORTY");
    console.log(this.appName + " Finished Created");
  },
  computed: {
    coinCount: function(row) {
      return this.activeCoins.length;
    }
  }
};
</script>