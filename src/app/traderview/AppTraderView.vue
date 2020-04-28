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
              <v-btn v-if="!ammdisabled" depressed small color="success">Automated</v-btn>
              <v-btn v-else depressed small color="error">No Automation</v-btn>
              <FiatPrice v-bind:wallets="wallets" v-on:refresh-fiat="handleRefreshFiat" ref="refFiatInfo"></FiatPrice>

              <v-toolbar-items class="hidden-sm-and-down">
                <v-divider vertical></v-divider>
                <template v-if="!ammdisabled">
                  <v-btn rounded depressed dark large color="red" > <!-- @click="dismmenable"> -->
                    <h3>Disable Automation</h3>
                  </v-btn>
                </template>
                <template v-else>
                  <v-btn rounded depressed dark large color="green" > <!-- @click="dismmenable"> -->
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
              <WalletInfo v-bind:wallets="wallets" v-on:refresh-balances="handleRefreshBalances" ref="refWalletInfo" />
            </v-col>
          </v-row>
          <v-row class="px-4 pb-6">
            <v-col>
              <MyOrders v-bind:myOrders="myOrders" v-bind:myOrdersThisMarket="myOrdersThisMarket" v-on:refresh-myorders="handleRefreshMyOrders" 
                        v-on:cancel-order="handleCancelOrder" 
                        v-on:cancel-all-orders="handleCancelAllOrders" 
                        v-on:myOrdersResponse="handleMyOrders" ref="myordersref" />
            </v-col>
          </v-row>
<!-- mePrivate and mePublic are set in .env* files of the root of the webapp project and read in at runtime -->
<div v-if="mePrivate == 'true' && mePublic == 'false'">
          <v-row class="px-4 pb-6">
            <v-col>
              <SingleOrder
                v-on:orderResponse="orderResponse"
                v-bind:wallets="wallets"
                v-on:sell-base="handleSellBase"
                v-on:buy-base="handleBuyBase"
                v-on:ordersize-pc="handleOrdersizePC"
                ref="refSingleOrder"
              />
            </v-col>
          </v-row>
</div>
        </v-flex>
        <v-flex md6 lg6>
          <v-row class="px-4">
            <v-col>
              <MarketData v-bind:wallets="wallets" v-bind:marketdata="marketOrders" v-bind:myOrdersThisMarket="myOrdersThisMarket" ref="refMarketData" v-on:refresh-market="handleRefreshMarket" />
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
import axios from "axios"
import mm2 from './lib/mm2MiddlewareClient'
import Description from "./Description"
import FiatPrice from './FiatPrice'
import MyOrders from "./MyOrders"
import WalletInfo from "./WalletInfo"
import AutomatedMarketMaking from "./AutomatedMarketMaking"
import SingleOrder from "./SingleOrder"
import MarketData from "./MarketData"
import { log } from "util"

export default {
  name: "TraderView",
  components: {
    Description,
    MyOrders,
    WalletInfo,
    AutomatedMarketMaking,
    SingleOrder,
    MarketData,
    FiatPrice
  },
  // props: ['rows'],
  data: function() {
    return {
      componentReadyOrders: false,
      componentReadyMarket: false,
      marketOrders: [],
      mePrivate: process.env.VUE_APP_MEPRIVATE,
      mePublic: process.env.VUE_APP_MEPUBLIC,
      myOrders: [],
      myOrdersThisMarket: [],
      priceuuid: [],
      wallets: {
        base: {
          ticker: "base1",
          balance: 0,
          address: 'loading...',
          fiat: 'NONE'
        },
        rel: {
          ticker: "rel1",
          balance: 0,
          address: 'loading...',
          fiat: 'NONE'
        }
      },
      ammdisabled: true,
      //currentStrategyInfo: "ONLY BUY KMD, 1.8% SPREAD WITH 10% ORDER SIZE",
      currentStrategyInfo: "NO AUTOMATION",
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
    handleOrdersizePC: function(pc) {
      console.log("AppTraderview.handleOrdersizePC: " + pc + "% on " + this.wallets.base.balance)
      this.$refs.refSingleOrder.ordersizeResponse(this.wallets.base.balance * (pc / 100))
    },
    handleRefreshMarket: function() {
      console.log("Refresh Market")
      mm2.getMarket(this.wallets.base.ticker, this.wallets.rel.ticker).then( response => {
//          console.log("Market data: " + JSON.stringify(response.data,null,2))
          let marketdataraw = response.data
          this.marketOrders = marketdataraw
          this.marketOrders.asks = this.groupByPrice(marketdataraw.asks, "price")
          this.marketOrders.bids = this.groupByPrice(marketdataraw.bids, "price")
      }).catch((reason) => {
        console.log(reason)
      })
    },
    handleBuyBase: function(orderDetails){
      console.log(
        "SingleOrder buy base: " +
          this.wallets.base.ticker +
          ", amount: " +
          orderDetails.amount +
          " @ " +
          orderDetails.price +
          " = " +
          orderDetails.amount * orderDetails.price
      )
      mm2.buyBase(this.wallets.base.ticker, this.wallets.rel.ticker, orderDetails.price, orderDetails.amount).then( response => {
        console.log("Response to buy base: " + JSON.stringify(response,null,2))
        this.$refs.refSingleOrder.handleOrderResponse()
        this.handleMyOrders()
      }).catch((reason) => {
          console.log(reason)
      })
    },
    handleSellBase: function(orderDetails) {
      console.log(
        "SingleOrder sell base: " +
          this.wallets.base.ticker +
          ", amount: " +
          orderDetails.amount +
          " @ " +
          orderDetails.price +
          " = " +
          orderDetails.amount * orderDetails.price
      )
      mm2.sellBase(this.wallets.base.ticker, this.wallets.rel.ticker, orderDetails.price, orderDetails.amount).then( response => {
        console.log("Response to sell base: " + JSON.stringify(response,null,2))
        this.$refs.refSingleOrder.handleOrderResponse()
        this.handleMyOrders()
      }).catch((reason) => {
          console.log(reason)
      })
    },
    handleRefreshMyOrders: function() {
      console.log("AppTraderView.handleRefreshMyOrders")
      this.handleMyOrders
    },
    handleCancelOrder: function(uuid) {
      console.log("AppTraderView.handleCancelOrder: " + uuid)
      mm2.cancelOrder(uuid).then( response => {
         console.log("Cancel order response: " + response)
      }).catch((reason) => {
        console.log("Could not cancel order " + uuid)
      })
      this.handleMyOrders()
    },
    handleCancelAllOrders: function() {
      console.log("AppTraderView.handleCancelAllOrders")
    },
    handleRefreshFiat: function() {
      console.log("AppTraderView.handleRefreshFiat")
      let refreshFiatBase = mm2.getFiatCoinGecko(this.wallets.base.ticker).then( response => {
        this.wallets.base.fiat = response.data.current_prices.usd
      }).catch((reason) => {
        console.log(reason)
      })
      let refreshFiatRel = mm2.getFiatCoinGecko(this.wallets.rel.ticker).then( response => {
        this.wallets.rel.fiat = response.data.current_prices.usd
      }).catch((reason) => {
        console.log("caught: " + reason)
      })
    },
    handleRefreshBalances: function() {
      console.log("AppTraderView.handleRefreshBalances")
      let refreshBase = mm2.getWalletBalance(this.wallets.base.ticker).then( response => {
        this.wallets.base.balance = response.data.balance 
        this.wallets.base.address = response.data.address
      })
      let refreshRel = mm2.getWalletBalance(this.wallets.rel.ticker).then( response => {
        this.wallets.rel.balance = response.data.balance 
        this.wallets.rel.address = response.data.address
      })
      Promise.all([refreshBase, refreshRel]).then( function() {
//        console.log("AppTraderView.handleRefreshBalance: Update child component")
//        this.$refs.refWalletInfo(balanceFromParent, this.wallets)
      })
    },
    handleMyOrders: function(){
      mm2.getMyOrders().then( response => {
        // because working with an object of objects in js sucks, convert to array
        this.myOrders = Object.values(response.data.result.maker_orders)
      }).then( () => {
        console.log("AppTraderview.myOrders -> highlightOrders")
        this.handleRefreshMarket()

// deprecated: when trying to use the output from mm2 (object with objects) it started to work but sucked
//  from https://stackoverflow.com/questions/2722159/how-to-filter-object-array-based-on-attributes
//for (let [key,value] of Object.entries(this.myOrders)) {
//  console.log(key + ":" + value.base + "/" + value.rel)
//  if((value.base == this.wallets.base.ticker && value.rel == this.wallets.rel.ticker) ||
//     (value.rel == this.wallets.base.ticker && value.rel == this.wallets.base.ticker) ){
//    //this.myOrders.key.thisMarket = true
//    console.log("Found! Order in this market: " + key)
//  }
//}


// from https://stackoverflow.com/questions/2722159/how-to-filter-object-array-based-on-attributes
// because passing data from this vue instance sucks in promises, create tmp var for comparisons
        let x_base = this.wallets.base.ticker
        let x_rel = this.wallets.rel.ticker
// filter the array of my orders finding the ones in this market, putting them into their own array
        this.myOrdersThisMarket = this.myOrders.filter(function (x_order) {
          if (( x_order.base == x_base &&
                    x_order.rel == x_rel ) ||
                  ( x_order.base == x_rel && 
                    x_order.rel == x_base )){
            x_order.highlight = true
            return x_order
          }
        })
//        console.log("AppTraderview.myOrdersThisMarket: " + JSON.stringify(this.myOrdersThisMarket,null,2))
      })
    },
    findOrderInMarket: function(result) {
      console.log("AppTraderView.handleMyOrders: " + JSON.stringify(result, null, 2))
      // filter orders for current market pair, orders comes in as [uuid: {.base .rel}, uuid: {.base .rel}]
      // wallet base matches orders base
      // wallet rel matches orders base
      // wallet base matches orders rel
      // wallet rel matches orders re.
      //let tmpArr = result.filter(function(ord){
      //  (ord.base == this.wallets.base.ticker && ord.rel == this.wallets.rel.ticker) || (ord.rel == this.wallets.base.ticker && ord.base == this.wallets.rel.ticker)
      //})

// from: https://stackoverflow.com/questions/44025984/how-to-filter-an-object-with-its-values-in-es6
let acceptedValues = [this.wallets.base.ticker, this.wallets.rel.ticker]
let tmpArr = Object.keys(result).reduce(function(r, e) {
  if (acceptedValues.includes(result[e])) r[e] = result[e]
  return r;
}, {})
      console.log("filtered orders this market: " + JSON.stringify(tmpArr, null, 2))
      // store uuid
      this.marketOrders = tmpArr
    },
    groupByPrice: function(raw, groupBy) {
      // from https://stackoverflow.com/questions/21776389/javascript-object-grouping
      let i = 0,
        val,
        index,
        values = [],
        result = [],
        interim = [];
      for (; i < raw.length; i++) { // for every "ask" or "bid" in the respective arrays
        val = raw[i][groupBy]; // this object val for the groupBy attribute
        index = values.indexOf(val);// has this val already been processed in a previous iteration
        if (index > -1){
          // this matches an already processed groupBy item
          interim[index].push(raw[i]);
        }
        else {
          // first val for this groupBy attribute
          values.push(val);
          interim.push([raw[i]]);
        }
      }
      // console.log(JSON.stringify(interim, null, 4))
      // we now have an array of arrays with orders of same price
      for(i = 0 ; i < interim.length; i++ ){
        // each array, reduce to 1 object
        let orderTemplate = {}
        for( let j = 0 ; j < interim[i].length ; j++ ){
          if( j == 0 ){
//            console.log("First grouped price to add maxvolume: " + interim[i][j].price)
            orderTemplate = interim[i][j]
            orderTemplate.address = ''
            orderTemplate.pubkey = ''
// for highlighting my orders in the OB, set example with prices within these ranges to activate
//            if( orderTemplate.price && orderTemplate.price > 8 || orderTemplate.price < 0.05 ){
//               orderTemplate.myOrder = true
//            }

console.log("Looking for match in MOTM: " + orderTemplate.uuid )
            let tmpz = this.myOrdersThisMarket.filter( x => x.uuid === orderTemplate.uuid )
//            console.log(JSON.stringify(tmpz, null, 1) + " AND " + orderTemplate)
            if( tmpz[0] != undefined){ // ugly but works
              console.log("UUID Match Found")
              orderTemplate.myOrder = true 
            }
          }
          else {
            orderTemplate.maxvolume += interim[i][j].maxvolume
          }
        }
        result.push(orderTemplate)
      }
      // console.log(JSON.stringify(result, null, 4))
      return result
    },
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
    // TODO can be done by passing props
    this.wallets.base.ticker = this.$route.params.base.toUpperCase()
    this.wallets.rel.ticker = this.$route.params.rel.toUpperCase()
    this.handleMyOrders()
    this.handleRefreshBalances()
    this.handleRefreshFiat()
// this is now handled in MyOrders promise
//    this.handleRefreshMarket()
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
