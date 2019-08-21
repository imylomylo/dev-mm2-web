<template>
  <div>
    <h2>{{ coinCount }} Active Coins</h2>
    <div v-if="activeCoins !== undefined && activeCoins.length > 0">
      <div>
        <v-simple-table>
          <thead>
            <tr>
              <th class="text-left">Ticker</th>
              <th class="text-left">Address</th>
              <th class="text-left">Balance</th>
              <th class="text-left">Options</th>
              <th class="text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in activeCoins" v-bind:key="row.id">
              <td>{{ row.ticker }}</td>
              <td>{{ row.address }}</td>
              <td>{{ row.balance }}</td>
              <td>
                About
                <!-- <router-link :to="{ name: 'CoinDetail', params: { id: row.id }}">{{ row.ticker }}</router-link> -->
              </td>

              <td>
                <v-btn small class="mx-2" fab color="green">
                  <v-icon>check_circle_outline</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-simple-table>
      </div>
    </div>
    <div v-else>Nothing to show</div>
    <div>
      <h2>Supported Coins</h2>
      <v-simple-table>
        <thead>
          <tr>
            <th class="text-left">Coin</th>
            <th class="text-left">Activate</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in supportedCoins" :key="item.ticker">
            <td>{{ item.ticker }}</td>
            <td>
              <v-btn
                v-if="!isEnabled(item.ticker)"
                small
                class="mx-2"
                fab
                dark
                color="indigo"
                @click="enableCoin(index)"
              >
                <v-icon dark>add</v-icon>
              </v-btn>
              <v-btn v-else small class="mx-2" fab disabled>
                <v-icon>check_circle_outline</v-icon>
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-simple-table>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "Coins",
  // props: ['rows'],
  data: function() {
    return {
      activeCoins: [],
      supportedCoins: [], // reads from serviceConfig, in prod fill this with data from configService
      inactiveCoins: [],
      configService: "",
      appName: "Coins",
      customerrors: []
    };
  },
  methods: {
    isEnabled: function(coin) {
      console.log("Checking " + coin);
      if (this.activeCoins.some(e => e.ticker === coin)) {
        return true;
      }
    },
    getServiceConfig: function() {
      axios
        .get('http://' + process.env.VUE_APP_WEBHOST + ':7780/config2')
        .then(response => {
          // console.log(response.data);
          // JSON responses are automatically parsed.
          if (response.data !== undefined) {
            // console.log(response.data.result)
            this.configService = response.data;
            console.log("configService: " + JSON.stringify(this.configService));
            this.supportedCoins = this.configService;
            // this.supportedCoins = Object.keys(this.configService)
            console.log(this.supportedCoins);
          }
        })
        .catch(e => {
          this.customerrors.push(e);
        });
    },
    getBalance: function(coin) {
      console.log("getBalance " + coin);
      return axios
        .get("http://" + process.env.VUE_APP_WEBHOST + ":7780/getBalance?coin=" + coin)
        .then(response => {
          // if response.data.result == "success"
          console.log(response.data);
          return response.data.balance;
        })
        .catch(e => {
          this.customerrors.push(e);
        });
    },
    enableCoin: function(coin) {
      console.log("Enable " + JSON.stringify(this.supportedCoins[coin].ticker));
      console.log(JSON.stringify(this.supportedCoins[coin].servers));
      let coinservers = this.supportedCoins[coin].servers;
      axios
        .post(
          "http://" + process.env.VUE_APP_WEBHOST + ":7780/connectcoin?coin=" +
            this.supportedCoins[coin].ticker +
            "&servers=" +
            JSON.stringify(coinservers)
        )
        .then(response => {
          // if response.data.result == "success"
          console.log(response.data);
          let newCoin = response.data;
          newCoin.papid = this.supportedCoins[coin].papid;
          console.log("New PAPID: " + newCoin);
          this.activeCoins.push(newCoin);
          this.$parent.$forceUpdate();
        })
        .catch(e => {
          this.customerrors.push(e);
        });
    }
  },
  created: function() {
    console.log("AppCoins Created");
    axios
      .get("http://" + process.env.VUE_APP_WEBHOST + ":7780/coinsenabled")
      .then(response => {
        // console.log(response.data);
        // JSON responses are automatically parsed.
        if (response.data !== undefined) {
          console.log(response.data.result)
          this.activeCoins = response.data.result;
        }
      })
      .catch(e => {
        this.customerrors.push(e);
      });
    console.log("AppCoins Finished Created " + JSON.stringify(this.activeCoins))
    this.getServiceConfig();
  },
  computed: {
    coinCount: function() {
      return this.activeCoins.length;
    }
  }
  ,
  watch: {
    coinCount: function(newVal, oldVal) {
      // watch it
      console.log("Prop changed: ", newVal, " | was: ", oldVal);
    }
  }
};
</script>