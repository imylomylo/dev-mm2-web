<template>
  <div>
    <div>
      <!-- <Description v-on:mmenable="mmenable()" v-bind="wallets" /> -->

      <div class="top-spaced">
        <div>
          <v-row no-gutters>
            <v-toolbar color="white" flat>
              <v-toolbar-title>Trading</v-toolbar-title>

              <v-divider class="mx-4" vertical></v-divider>
              <h2>{{ wallets.base.ticker + " / " + wallets.rel.ticker}}</h2>
              <v-chip
                class="ma-2"
                color="success"
                outlined
                @click="invertbase(wallets.base.ticker, wallets.rel.ticker)"
              >
                <v-icon left>mdi-server-plus</v-icon>BASE PAIR
              </v-chip>
              <v-btn v-if="!ammdisabled" depressed small color="success">Enabled</v-btn>
              <v-btn v-else depressed small color="error">Disabled</v-btn>
              <div class="flex-grow-1">
                <v-divider class="mx-4" vertical></v-divider>
                <v-btn depressed small>Global Average Price: 777</v-btn>
              </div>

              <v-toolbar-items class="hidden-sm-and-down">
                <v-divider vertical></v-divider>
                <template v-if="!ammdisabled">
                <v-btn rounded depressed dark large color="red" @click="mmenable">
                  <h3>Disable Automation</h3>
                </v-btn>
                </template>
                <template v-else>
                  <v-btn rounded depressed dark large color="green" @click="mmenable">
                    <h3>Enable Automation</h3>
                  </v-btn>
                </template>
                <v-divider vertical></v-divider>
              </v-toolbar-items>

              <v-app-bar-nav-icon></v-app-bar-nav-icon>
            </v-toolbar>
          </v-row>
        </div>
        <v-card-text color="blue">
          <div>
            CURRENT STRATEGY: {{ currentStrategyInfo}}
            <!-- <v-btn text color="deep-purple accent-4">Learn More</v-btn> -->
          </div>
          <!-- <v-card-title> {{ currentStrategyInfo }} </v-card-title>
          <p class="display-1 text--primary">{{currentStrategyInfo}}</p>-->
        </v-card-text>
        <!-- <CurrentStrategies /> -->
      </div>

      <v-divider class="mx-4 pb-5"></v-divider>
      <v-layout>
        <v-flex md6 lg6>
          <v-row class="px-4">
            <v-col>
              <WalletInfo v-bind:wallets="wallets" />
            </v-col>
          </v-row>

          <v-row class="px-4">
            <v-col>
              <AutomatedMarketMaking v-bind:overlay="ammdisabled" ref="amm" />
            </v-col>
          </v-row>

          <v-row class="px-4 mb-6">
            <v-col>
              <SingleOrder v-on:sendorder="sendorder" />
            </v-col>
          </v-row>
        </v-flex>
        <v-flex md6 lg6>
          <v-row class="px-4">
            <v-col>
              <MarketData v-bind:wallets="wallets" />
            </v-col>
          </v-row>
        </v-flex>



        <v-flex md6 lg6>
          <v-row class="px-4">
            <v-col>



    <h2>My Market Maker Orders</h2>

    <div v-if="myOrders.maker">
      <div>
        <v-layout>
          <v-flex md6 lg6>
            <v-data-table
              :headers="orderHeaders"
              :items="myOrders.maker"
              :items-per-page="5"
              class="elevation-1"
            >
              <template v-slot:item.taker="{ item }">
                <v-chip color="green" dark @click.stop.prevent="soon()">
                  Cancel
                  <v-icon left>swap_horiz</v-icon>Cancel
                </v-chip>
              </template>
            </v-data-table>
          </v-flex>
        </v-layout>
      </div>
    </div>
    <div v-else>No current maker orders to display.</div>


            </v-col>
          </v-row>
        </v-flex>


      </v-layout>
    </div>
  </div>
</template>
<script>
import axios from "axios";
import Description from "./Description";
import WalletInfo from "./WalletInfo";
import AutomatedMarketMaking from "./AutomatedMarketMaking";
import SingleOrder from "./SingleOrder";
import MarketData from "./MarketData";
import { log } from "util";

export default {
  name: "TraderView",
  components: {
    Description,
    WalletInfo,
    AutomatedMarketMaking,
    SingleOrder,
    MarketData
  },
  // props: ['rows'],
  data: function() {
    return {
      myOrders: "",
      wallets: {
        base: {
          ticker: "base1",
          balance: 0
        },
        rel: {
          ticker: "rel1",
          balance: 0
        }
      },
      allwallets: [],
      ammdisabled: true,
      currentStrategyInfo: "ONLY BUY KMD, 1.8% SPREAD WITH 10% ORDER SIZE",
      activeCoins: [],
      walletBalance: { base: 0, rel: 0 },
      marketData: "",
      trade: { base: "", rel: "", price: "", amount: "0" },
      appName: "VueCryptoTrader",
      customerrors: [],
      headers: [
        {
          text: "Price",
          align: "left",
          sortable: true,
          value: "price"
        },
        { text: "Max Volume", value: "maxvolume" },
        { text: "Age", value: "age" },
        { text: "Coin", value: "coin" },
        { text: "Trade As", value: "taker" }
      ],
      orderHeaders: [
        {
          text: "Base",
          align: "left",
          sortable: true,
          value: "base"
        },
        {
          text: "Rel",
          align: "left",
          sortable: true,
          value: "rel"
        },
        {
          text: "Price",
          align: "left",
          sortable: true,
          value: "price"
        },
        { text: "Created At", value: "created_at" },
        { text: "Avail. Amount", value: "available_amount" },
        { text: "Can Cancel", value: "cancellable" }
      ],
      takerOrderHeaders: [
        {
          text: "Base",
          align: "left",
          sortable: true,
          value: "base"
        },
        {
          text: "Rel",
          align: "left",
          sortable: true,
          value: "rel"
        },
        {
          text: "Price",
          align: "left",
          sortable: true,
          value: "price"
        },
        { text: "Created At", value: "created_at" },
        { text: "Base Amount", value: "request.base_amount" },
        { text: "Can Cancel", value: "cancellable" }
      ]
    };
  },
  methods: {
    // base: function() {
    //   console.log("base");
    //   return "BTC";
    // },
    // rel: function(rel) {
    //   console.log("rel -" + rel);
    //   return "KMD";
    // },
    sendorder: function(something1, something2){
      console.log("traderview sendorder: " + something1 + ", " + something2 )
    },
    invertbase: function(base, rel) {
      console.log("Invert base " + base);
      window.location.href = "#/traderview?base=" + rel + "&rel=" + base;
      this.$router.go(this.$router.currentRoute);
    },
    mmenable: function() {
      console.log("mmenable received: toggle from current state this.ammdisabled = " + this.ammdisabled);
      this.$refs.amm.enable(!this.ammdisabled);
      this.ammdisabled = !this.ammdisabled
    },
    myBalance: function(base, rel) {
      console.log(
        "My balance: " +
          this.wallets.base.ticker +
          " & " +
          this.wallets.rel.ticker
      );
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
    doMarketTaker: function(base, rel, price, volume) {
      console.log("base/rel: " + base + "/" + rel + " " + volume + "@" + price);
      axios
        .post(
          "http://" +
            process.env.VUE_APP_WEBHOST +
            ":7780/doTaker?base=" +
            base +
            "&rel=" +
            rel +
            "&price=" +
            price +
            "&volume=" +
            volume
        )
        .then(response => {
          this.makerDialog = false;
          // if response.data.result == "success"
          // console.log(response.data);
          buyResponse = response.data;
          console.log("Buy Response: " + buyResponse);
        })
        .catch(e => {
          this.takerDialog = false;

          this.customerrors.push(e);
        });
    },
    doMarketMaker: function(base, rel, price, volume) {
      console.log("base/rel: " + base + "/" + rel + " " + volume + "@" + price);
      axios
        .post(
          "http://" +
            process.env.VUE_APP_WEBHOST +
            ":7780/doMaker?base=" +
            base +
            "&rel=" +
            rel +
            "&price=" +
            price +
            "&volume=" +
            volume
        )
        .then(response => {
          this.makerDialog = false;
          // if response.data.result == "success"
          // console.log(response.data);
          makerResponse = response.data;
          console.log("Maker Response: " + makerResponse);
        })
        .catch(e => {
          this.makerDialog = false;

          this.customerrors.push(e);
        });
    },
    takerBid: function(base, rel, price) {
      console.log("Taker Bid" + base + "/" + rel + " price: " + price);
      this.trade.base = base;
      this.trade.rel = rel;
      this.trade.price = price;
      this.takerDialog = true;
    },
    takerAsk: function(base, rel, price) {
      console.log("Taker Ask" + base + "/" + rel + " price: " + price);
      this.trade.base = base;
      this.trade.rel = rel;
      this.trade.price = price;
      this.takerDialog = true;
    },
    soon: function() {
      console.log("Placeholder");
    },
    newAsk: function(base, rel) {
      console.log("new ask " + base + "/" + rel);
      this.trade.base = base;
      this.trade.rel = rel;
      this.makerDialog = true;
    },
    newBid: function(base, rel) {
      console.log("new bid " + base + "/" + rel);
      this.trade.base = base;
      this.trade.rel = rel;
      this.makerDialog = true;
    },
    getAvailableMarkets: function(ticker) {
      console.log("Making links for orderbooks of coin: " + ticker);
      return this.activeCoins.filter(function(obj) {
        return obj.ticker !== ticker;
      });
    },
    getDEXMarket: function(base, rel) {
      console.log("Getting dex market");

      axios
        .post(
          "http://" +
            process.env.VUE_APP_WEBHOST +
            ":7780/getMarket?base=" +
            base +
            "&rel=" +
            rel
        )
        .then(response => {
          this.marketData = response.data;

          // console.log(
          //   "Asks: " +
          //     this.marketData.numasks +
          //     " | Bids: " +
          //     this.marketData.numbids
          // );

          // ** TO DO **
          // to even out the columns nicely, pad
          // while( this.marketData.numasks % 5 !== 0){
          //   this.marketData.asks.push({})
          // }
          // while( this.marketData.numbids % 5 !== 0){
          //   this.marketData.bids.push({})
          // }
        })
        .catch(e => {
          this.customerrors.push(e);
        });
    },
    showDEXMarket: function(base, rel) {
      console.log("Show market:" + base + "/" + rel);
      axios
        .post(
          "http://" +
            process.env.VUE_APP_WEBHOST +
            ":7780/getMarket?base=" +
            base +
            "&rel=" +
            rel
        )
        .then(response => {
          this.marketData = response.data;

          // console.log(
          //   "Asks: " +
          //     this.marketData.numasks +
          //     " | Bids: " +
          //     this.marketData.numbids
          // );

          // ** TO DO **
          // to even out the columns nicely, pad
          // while( this.marketData.numasks % 5 !== 0){
          //   this.marketData.asks.push({})
          // }
          // while( this.marketData.numbids % 5 !== 0){
          //   this.marketData.bids.push({})
          // }
        })
        .catch(e => {
          this.customerrors.push(e);
        });
      this.myBalance(base, rel);
    },
    getMyOrders: function() {
      console.log("Getting orders");
      
      axios
        .get("http://" + process.env.VUE_APP_WEBHOST + ":7780/getOrders")
        .then(response => {
          // if response.data.result == "success"
          // console.log(response.data);
          this.myOrders.maker = this.objectArrayByKeys(
            response.data.result.maker_orders
          );
          this.myOrders.taker = this.objectArrayByKeys(
            response.data.result.taker_orders
          );
          console.log(
            "MY TAKER ORDERS: " + JSON.stringify(this.myOrders.taker,null,2) + "\nMY MAKER ORDERS: " + JSON.stringify(this.myOrders.maker,null,2)
          );
        })
        .catch(e => {
          this.customerrors.push(e);
        });
    },
    objectArrayByKeys: function(obj) {
      let toArray = [];
      Object.keys(obj).forEach(function(key) {
        toArray.push(obj[key]);
      });
      return toArray;
    },
    setAllWallets: function() {
      this.allwallets = [{ticker: 'BTC', balance: 5 }, {ticker: 'KMD', balance: 11}, {ticker: 'DOGE', balance: 123 }]
    }
  },
  created: function() {
    console.log(this.appName + " Created");
    console.log(this.$route.query.base);
    console.log(this.$route.query.rel);
    this.wallets.base.ticker = this.$route.query.base;
    this.wallets.rel.ticker = this.$route.query.rel;
    this.myBalance(this.wallets.base.ticker, this.wallets.rel.ticker);
    this.getDEXMarket(this.wallets.base.ticker, this.wallets.rel.ticker);
    this.getMyOrders();
    this.setAllWallets();
    // axios
    //   .get("http://" + process.env.VUE_APP_WEBHOST + ":7780/coinsenabled")
    //   .then(response => {
    //     // console.log(response.data);
    //     // JSON responses are automatically parsed.
    //     if (response.data !== undefined) {
    //       // console.log(response.data.result)
    //       this.activeCoins = response.data.result;
    //       console.log("ACTIVE COINS: " + JSON.stringify(this.activeCoins));
    //     }
    //   })
    //   .catch(e => {
    //     this.customerrors.push(e);
    //   });
    // this.showMarket("RICK", "MORTY");
    console.log(this.appName + " Finished Created");
  },
  beforeRouteUpdate(to, from, next) {
    // just use `this`
    console.log("before route update " + this.wallets.base);
    // this.base = to.params.base
  },
  computed: {
    coinCount: function(row) {
      return this.activeCoins.length;
    }
  }
};
</script>
<style scoped>
.top-spaced {
  margin-top: 50px;
}
</style>