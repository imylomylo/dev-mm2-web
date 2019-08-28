<template>
  <v-card max-width="auto" class="mx-auto" outlined>
    <v-toolbar flat dense color="blue-grey lighten-5">
      <v-toolbar-title>
        <span class="subheading">AtomicDEX order book</span>
      </v-toolbar-title>
      <div class="flex-grow-1"></div>
    </v-toolbar>
    <div v-if="myOrders.maker">
      <div>
        <v-layout>
          <v-flex md lg>
            <v-data-table
            disable-pagination
                hide-default-footer
              :headers="orderHeaders"
              :items="myOrders.maker"
              :items-per-page="5"
              class="elevation-1"
            >
            </v-data-table>
          </v-flex>
        </v-layout>
      </div>
    </div>
    <div v-else>No current maker orders to display.</div>
    <div v-if="myOrders.taker">
      <div>
        <v-layout>
          <v-flex md lg>
            <h2>LAST TRADED PRICE: 000255211</h2>
            <v-data-table
                            hide-default-header
disable-pagination
              :headers="takerOrderHeaders"
              :items="myOrders.taker"
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
    <div v-else>No current taker orders to display.</div>
  </v-card>
</template>
<script>
import axios from "axios";

export default {
  // name: "MarketData",
  props: ["myOrders"],
  data: function() {
    return {
      takerDialog: false,
      makerDialog: false,
      activeCoins: [],
      walletBalance: { base: 0, rel: 0 },
      marketData: "",
      trade: { base: "", rel: "", price: "", amount: "0" },
      appName: "MarketData",
      customerrors: [],
      headers: [
        {
          text: "Price (rel)",
          align: "left",
          sortable: true,
          value: "price"
        },
        { text: "Max Volume (base)", value: "maxvolume" },
        { text: "Age", value: "age" },
        { text: "Coin", value: "coin" },
        { text: "Trade As", value: "taker" }
      ],
      orderHeaders: [
        {
          text: "Price (rel)",
          align: "left",
          sortable: true,
          value: "price"
        },
        { text: "Amount (base)", value: "available_amount" },
        { text: "Total (rel))", value: "cancellable" }
      ],
      takerOrderHeaders: [
        {
          text: "Price (rel)",
          align: "left",
          sortable: true,
          value: "price"
        },
        { text: "Base Amount", value: "request.base_amount" },
        { text: "Can Cancel", value: "cancellable" }
      ]
    };
  },
  methods: {
    myBalance: function(base, rel) {
      console.log("My balance");
      axios
        .get(
          "http://" +
            process.env.VUE_APP_WEBHOST +
            ":7780/getBalance?coin=" +
            base
        )
        .then(response => {
          console.log(response.data);
          this.walletBalance.base = response.data.balance;
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
          this.walletBalance.rel = response.data.balance;
        })
        .catch(e => {
          this.customerrors.push(e);
        });
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
            "MY TAKER ORDERS: " + JSON.stringify(this.myOrders.taker)
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
    }
  },
  created: function() {
    console.log(this.appName + " Created");
    this.getMyOrders();
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
  computed: {
    coinCount: function() {
      return this.activeCoins.length;
    }
  }
};
</script>