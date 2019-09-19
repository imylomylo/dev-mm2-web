<template>
  <v-card max-width="auto" class="mx-auto" outlined>
    <v-toolbar flat dense color="blue-grey lighten-5">
      <v-toolbar-title>
        <span class="subheading">AtomicDEX order book</span>
      </v-toolbar-title>
      <div class="flex-grow-1"></div>
    </v-toolbar>
    <div v-if="marketdata.asks">
      <div>
        <v-layout>
          <v-flex md lg>
            <v-card-title>Asks</v-card-title>
            <v-data-table
              disable-pagination
              hide-default-footer
              :headers="orderHeaders"
              :items="marketdata.asks"
              :items-per-page="5"
            >
              <template
                v-slot:header.price="{ header }"
              >{{ header.text.toUpperCase() }} Price ({{wallets.rel.ticker }})</template>

              <template
                v-slot:header.maxvolume="{ header }"
              >{{ header.text.toUpperCase() }} Amount ({{wallets.base.ticker }})</template>
            </v-data-table>
          </v-flex>
        </v-layout>
      </div>
    </div>
    <div v-else>No current maker orders to display.</div>
    <h2 class="pl-3">0.00255211 Last Traded Price</h2>

    <div v-if="marketdata.bids">
      <div>
        <v-layout>
          <v-flex md lg>
            <v-card-title>Bids</v-card-title>
            <v-data-table
              disable-pagination
              hide-default-header
              hide-default-footer
              :headers="takerOrderHeaders"
              :items="marketdata.bids"
              :items-per-page="15"
            ></v-data-table>
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
  props: ["base", "rel", "wallets"],
  data: function() {
    return {
      myOrders: "",
      takerDialog: false,
      makerDialog: false,
      activeCoins: [],
      walletBalance: { base: 0, rel: 0 },
      marketdata: "",
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
        { text: "Amount (base)", align: "left", value: "maxvolume" },
        { text: "Total (rel))", align: "right", value: "relamount" }
      ],
      takerOrderHeaders: [
        {
          text: "Price (rel)",
          align: "left",
          sortable: true,
          value: "price"
        },
        { text: "Base Amount", align: "left", value: "relamount" },
        { text: "Can Cancel", align: "right", value: "maxvolume" }
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
    soon: function() {
      console.log("Placeholder");
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
          this.marketdata = response.data;

          console.log(
            "Asks: " +
              this.marketdata.numasks +
              " | Bids: " +
              this.marketdata.numbids +
              JSON.stringify(this.marketdata.asks, null, 2) +
              JSON.stringify(this.marketdata.bids, null, 2)
          );

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
    this.showDEXMarket(this.wallets.base.ticker, this.wallets.rel.ticker);
    console.log(this.appName + " Finished Created");
  },
  computed: {
    coinCount: function() {
      return this.activeCoins.length;
    }
  }
};
</script>