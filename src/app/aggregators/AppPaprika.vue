<template>
  <div>
    <h2>{{ appName }} not working</h2>
    <h3>Paprika (quoted price)</h3>
    {{ paprikaMarketData }}
    <div v-if="activeCoins !== undefined && activeCoins.length > 0">
      <div>
        <h2>Enabled Coin Markets</h2>
        <v-simple-table>
          <thead>
            <tr>
              <th class="text-left">Base</th>
              <th class="text-left">Fetch Paprika /BTC</th>
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
                <v-chip class="ma-2" @click="showPaprikaMarket(row.papid)">{{row.ticker}}/BTC</v-chip>
              </td>
              <td>0.00</td>
            </tr>
          </tbody>
        </v-simple-table>
      </div>
    </div>
    <h3>CMC (last price)</h3>
    {{ cmcMarketData }}
    <div v-if="activeCoins !== undefined && activeCoins.length > 0">
      <div>
        <h2>Enabled Coin Markets</h2>
        <v-simple-table>
          <thead>
            <tr>
              <th class="text-left">Base</th>
              <th class="text-left">Fetch CMC /BTC</th>
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
                <v-chip class="ma-2" @click="showCMCMarket(row.papid)">{{row.ticker}}/BTC</v-chip>
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
  name: "AppAggregators",
  data: function() {
    return {
      activeCoins: "",
      paprikaMarketData: "",
      cmcMarketData: "",
      market: null,
      appName: "Aggregator Prices",
      customerrors: []
    };
  },
  methods: {
    showPaprikaMarket: function(base, rel) {
      console.log("Paprika market:" + base + "/BTC");
      this.paprikaMarketData = base + "/BTC";
      axios
        .get(
           "http://" + process.env.VUE_APP_WEBHOST + ":7780/getpaprkiamarketprice?base=" +
            base +
            "&rel=BTC"
        )
        .then(response => {
          // if response.data.result == "success"
          console.log(response.data);
          this.paprikaMarketData += " :" + response.data.price;
        })
        .catch(e => {
          this.customerrors.push(e);
        });
    },
    showCMCMarket: function(base, rel) {
      this.cmcMarketData = base + "/BTC";
      axios
        .get(
           "http://" + process.env.VUE_APP_WEBHOST + ":7780/getcmcmarketprice?base=" +
            base +
            "&rel=BTC"
        )
        .then(response => {
          // if response.data.result == "success"
          console.log(response.data);
          this.cmcMarketData += " :" + parseFloat(response.data.result.Last);
        })
        .catch(e => {
          this.customerrors.push(e);
        });
    }
  },
  created: function() {
    console.log(this.appName + " Created");
    axios
      .get( "http://" + process.env.VUE_APP_WEBHOST + ":7780/coinsenabled")
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