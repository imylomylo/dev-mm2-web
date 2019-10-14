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
                <v-icon left>mdi-server-plus</v-icon>INVERT
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
          <v-row class="px-4 pb-6">
            <v-col>
              <MyOrders ref="myordersref" />
            </v-col>
          </v-row>
          <v-row class="px-4 pb-6">
            <v-col>
              <SingleOrder
                v-on:orderResponse="orderResponse"
                v-bind:wallets="wallets"
              />
            </v-col>
          </v-row>
        </v-flex>
        <v-flex md6 lg6>
          <v-row class="px-4">
            <v-col>
              <MarketData v-bind:wallets="wallets" />
            </v-col>
          </v-row>

          <v-row class="px-4">
            <v-col>
              <AutomatedMarketMaking v-bind:overlay="ammdisabled" ref="amm" />
            </v-col>
          </v-row>
        </v-flex>

        <!-- <v-flex md6 lg6>
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
        </v-flex>-->
      </v-layout>
    </div>
  </div>
</template>
<script>
import axios from "axios";
import Description from "./Description";
import MyOrders from "./MyOrders"
import WalletInfo from "./WalletInfo";
import AutomatedMarketMaking from "./AutomatedMarketMaking";
import SingleOrder from "./SingleOrder";
import MarketData from "./MarketData";
import { log } from "util";

export default {
  name: "TraderView",
  components: {
    Description,
    MyOrders,
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
    orderResponse: function(result) {
      console.log(JSON.stringify(result, null, 4));
      this.$refs.myordersref.newOrder(result)
    },
    invertbase: function(base, rel) {
      console.log("Invert base " + base);
      // window.location.href = "#/traderview?base=" + rel + "&rel=" + base;
      window.location.href = "/#/traderview/" + rel + "/" + base
      this.$router.go(this.$router.currentRoute);
    },
    mmenable: function() {
      console.log(
        "mmenable received: toggle from current state this.ammdisabled = " +
          this.ammdisabled
      );
      this.$refs.amm.enable(!this.ammdisabled);
      this.ammdisabled = !this.ammdisabled;
    },
    soon: function() {
      console.log("Placeholder");
    },
    objectArrayByKeys: function(obj) {
      let toArray = [];
      Object.keys(obj).forEach(function(key) {
        toArray.push(obj[key]);
      });
      return toArray;
    },
    setAllWallets: function() {
      this.allwallets = [
        { ticker: "BTC", balance: 5 },
        { ticker: "KMD", balance: 11 },
        { ticker: "DOGE", balance: 123 }
      ];
    }
  },
  created: function() {
    console.log(this.appName + " Created");
    // console.log(this.$route.query.base);
    // console.log(this.$route.query.rel);
    // this.wallets.base.ticker = this.$route.query.base;
    // this.wallets.rel.ticker = this.$route.query.rel;
    this.wallets.base.ticker = this.$route.params.base.toUpperCase()
    this.wallets.rel.ticker = this.$route.params.rel.toUpperCase()
    console.log(this.appName + " Finished Created");
  },
  beforeRouteUpdate(to, from, next) {
    // just use `this`
    // console.log("before route update going to " + this.wallets.base.ticker + "/" + this.wallets.rel.ticker + JSON.stringify(from) + JSON.stringify(to))
    // console.log("before route update going to " + JSON.stringify(from))
    // window.location.href='/#/traderview/'+this.wallets.base.ticker +'/'+ this.wallets.rel.ticker
    next()
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