<template>
  <v-card max-width="auto" class="mx-auto" outlined>
    <v-toolbar flat dense color="blue-grey lighten-5">
      <v-toolbar-title>
        <span class="subheading">AtomicDEX order book</span>
      </v-toolbar-title>
      <div class="flex-grow-1"></div>
      <v-chip
        class="ma-2"
        color="purple"
        outlined
        @click="refreshMarket()"
      >
        <v-icon left>mdi-server-plus</v-icon>Refresh
      </v-chip>
    </v-toolbar>
    <div v-if="marketdata.asks">
      <div>
        <v-layout>
          <v-flex md lg>
            <v-card-title>Asks</v-card-title>
            <v-data-table
              dense
              :sort-by="['price']"
              :sort-desc="[true]"
              disable-pagination
              hide-default-footer
              :headers="asksHeaders"
              :items="marketdata.asks"
              :items-per-page="5"
            >
              <template v-slot:header.price="{ header }">
                <!-- {{ header.text.toUpperCase() }} -->
                Price ({{wallets.rel.ticker }})
              </template>

              <template v-slot:header.maxvolume="{ header }">
                <!-- {{ header.text.toUpperCase() }} -->
                Amount ({{wallets.base.ticker }})
              </template>

              <template v-slot:header.relamount="{ header }">
                <!-- {{ header.text.toUpperCase() }} -->
                Total ({{wallets.rel.ticker }})
              </template>

              <!-- Rounding from https://www.jacklmoore.com/notes/rounding-in-javascript/ -->
              <!-- Better to move to computed function for maintainability/non-repetitive -->
              <template v-slot:item.price="{ item }">{{ Number(Math.round(item.price+'e8')+'e-8') }}</template>

              <!-- For highlighting my orders               -->
              <template v-slot:item.price="{ item }">
                {{ Number(Math.round(item.price+'e8')+'e-8') }}
                <v-chip v-if="hasMyOrder(item.price)" color="purple" dark>me</v-chip>
              </template> 

              <template
                v-slot:item.maxvolume="{ item }"
              >{{ Number(Math.round(item.maxvolume+'e8')+'e-8') }}</template>
              <template
                v-slot:item.relamount="{ item }"
              >{{ Number(Math.round(item.price*item.maxvolume+'e8')+'e-8') }}</template>
            </v-data-table>
          </v-flex>
        </v-layout>
      </div>
    </div>
    <div v-else>No current asks to display.</div>
    <h2 class="pl-3">{{ middlePriceSpreadData.middle }} Middle Price (Spread: {{ middlePriceSpreadData.spread}} %)</h2>

    <div v-if="marketdata.bids">
      <div>
        <v-layout>
          <v-flex md lg>
            <v-card-title>Bids</v-card-title>
            <v-data-table
              dense
              :sort-by="['price']"
              :sort-desc="[true]"
              disable-pagination
              hide-default-footer
              :headers="bidsHeaders"
              :items="marketdata.bids"
              :items-per-page="15"
            >

              <template v-slot:header.price="{ header }">
                <!-- {{ header.text.toUpperCase() }} -->
                Price ({{wallets.rel.ticker }})
              </template>

              <template v-slot:header.baseamount="{ header }">
                <!-- {{ header.text.toUpperCase() }} -->
                Amount ({{wallets.base.ticker }})
              </template>

              <template v-slot:header.maxvolume="{ header }">
                <!-- {{ header.text.toUpperCase() }} -->
                Total ({{wallets.rel.ticker }})
              </template>

              <!-- Rounding from https://www.jacklmoore.com/notes/rounding-in-javascript/ -->
              <!-- Better to move to computed function for maintainability/non-repetitive -->
              <template v-slot:item.price="{ item }">{{ Number(Math.round(item.price+'e8')+'e-8') }}</template>
              
              <!-- for highlighting my order -->
              <template v-slot:item.price="{ item }">
                {{ Number(Math.round(item.price+'e8')+'e-8') }}
                <v-chip v-if="hasMyOrder(item.price)" color="purple" dark>me</v-chip>
              </template> 
              <template
                v-slot:item.baseamount="{ item }"
              >{{ Number(Math.round(item.maxvolume/item.price+'e8')+'e-8') }}</template>
              <template
                v-slot:item.maxvolume="{ item }"
              >{{ Number(Math.round(item.maxvolume+'e8')+'e-8') }}</template>
            </v-data-table>
          </v-flex>
        </v-layout>
      </div>
    </div>
    <div v-else>No current bids to display.</div>
  </v-card>
</template>
<script>
import axios from "axios";

export default {
  // name: "MarketData",
  props: ["wallets", "marketdata", "myOrdersThisMarket"],
  data: function() {
    return {
      cexprice: "",
      myOrders: "",
      takerDialog: false,
      makerDialog: false,
      activeCoins: [],
      walletBalance: { base: 0, rel: 0 },
      trade: { base: "", rel: "", price: "", amount: "0" },
      appName: "MarketData",
      customerrors: [],
      asksHeaders: [
        {
          text: "Price (rel)",
          align: "left",
          sortable: true,
          value: "price"
        },
        { text: "Amount (base)", align: "left", value: "maxvolume" },
        { text: "Total (rel))", align: "right", value: "relamount" }
      ],
      bidsHeaders: [
        {
          text: "Price (rel)",
          align: "left",
          sortable: true,
          value: "price"
        },
        { text: "Base Amount", align: "left", value: "baseamount" },
        { text: "Can Cancel", align: "right", value: "maxvolume" }
      ]
    }
  },
  methods: {
    refreshMarket: function() {
      this.$emit("refresh-market")
    },
    objectArrayByKeys: function(obj) {
      let toArray = [];
      Object.keys(obj).forEach(function(key) {
        toArray.push(obj[key]);
      });
      return toArray;
    },
    hasMyOrder: function(price){
      return this.myOrdersThisMarket.find(x => x.price == price)
    }
  },
  created: function() {
    console.log(this.appName + " Created");
    // original prod code
//    this.showDEXMarket(this.wallets.base.ticker, this.wallets.rel.ticker)
    // working fake data
    // this.marketdata = this.fakeData
    // test grouping
    // this.marketdata.asks = this.groupByPrice2(this.fakeData.asks, "price");
    // this.marketdata.bids = this.groupByPrice2(this.fakeData.bids, "price");
    //this.getCEXprice(this.wallets.base.ticker, this.wallets.rel.ticker);
    console.log(this.appName + " Finished Created");
  },
  computed: {
    coinCount: function() {
      return this.activeCoins.length;
    },
    middlePriceSpreadData: function(lowAsk, highBid) {
      // middlePriceSpreadData.middle & middlePriceSpreadData.spread
      let middlePriceSpreadData = {}
      middlePriceSpreadData.middle = "No"
      middlePriceSpreadData.spread = 0
      if( this.marketdata.asks === undefined || this.marketdata.bids === undefined){
        return middlePriceSpreadData
      }
      if( this.marketdata.asks.length > 0 && this.marketdata.bids.length > 0) {
        let lowestAsk = this.marketdata.asks.sort((a,b) => a.price - b.price)[0].price 
        let highestBid = this.marketdata.bids.sort((a,b) => b.price - a.price)[0].price
        let spread = (parseFloat(lowestAsk) - parseFloat(highestBid))
        let middle = parseFloat(parseFloat(highestBid) + (parseFloat(lowestAsk) - parseFloat(highestBid))/2)
        middlePriceSpreadData.middle = middle.toFixed(8) + " Approx. "
        middlePriceSpreadData.spread = (parseFloat(spread/middle) * 100).toFixed(1)
        return middlePriceSpreadData 
      }
      else {
        return middlePriceSpreadData
      }
    }
  }
};
</script>
