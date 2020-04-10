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
        @click="showDEXMarket(wallets.base.ticker, wallets.rel.ticker)"
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
<!--               
              <template v-slot:item.price="{ item }">
                {{ Number(Math.round(item.price+'e8')+'e-8') }}
                <v-chip v-if="item.myOrder" color="purple" dark>*</v-chip>
              </template> 
 -->

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
    <h2 class="pl-3">CEX Price: {{ cexprice }}</h2>

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
<!--               
              <template v-slot:item.price="{ item }">
                {{ Number(Math.round(item.price+'e8')+'e-8') }}
                <v-chip v-if="item.myOrder" color="purple" dark>*</v-chip>
              </template> 
-->
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
  props: ["base", "rel", "wallets"],
  data: function() {
    return {
      cexprice: "",
      myOrders: "",
      takerDialog: false,
      makerDialog: false,
      activeCoins: [],
      walletBalance: { base: 0, rel: 0 },
      marketdata: {},
      marketdataraw: {},
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
      ]//,
      // fakeData: {
      //   askdepth: 0,
      //   asks: [
      //     {
      //       address: "R9ViegsR8qrthx81NJdANfnkLoQxomzHAM",
      //       age: 21,
      //       coin: "RICK",
      //       max_volume_rat: [[1, [3751360449, 17509]], [1, [78125000]]],
      //       maxvolume: 962615.4719502465,
      //       price: "3.6",
      //       price_rat: [[1, [1]], [1, [1]]],
      //       pubkey:
      //         "b86508ab996ca87d863c907e44fe495d96adf7e95ad0823bac16c3e55758f902",
      //       zcredits: 0
      //     },
      //     {
      //       address: "RT9MpMyucqXiX8bZLimXBnrrn2ofmdGNKd",
      //       age: 3,
      //       coin: "RICK",
      //       max_volume_rat: [[1, [1000]], [1, [1]]],
      //       maxvolume: 1000,
      //       price: "3.6",
      //       price_rat: [[1, [2]], [1, [1]]],
      //       pubkey:
      //         "1bb83b58ec130e28e0a6d5d2acf2eb01b0d3f1670e021d47d31db8a858219da8",
      //       zcredits: 0
      //     },
      //     {
      //       address: "R9ViegsR8qrthx81NJdANfnkLoQxomzHAM",
      //       age: 25,
      //       coin: "RICK",
      //       max_volume_rat: [[1, [4241140441, 140078]], [1, [625000000]]],
      //       maxvolume: 962615.4720472464,
      //       price: "3.6",
      //       price_rat: [[1, [1]], [1, [1]]],
      //       pubkey:
      //         "b86508ab996ca87d863c907e44fe495d96adf7e95ad0823bac16c3e55758f902",
      //       zcredits: 0
      //     },
      //     {
      //       address: "RTpwruinq4GLbkGZg8NrJw5YPWUvMWnHYR",
      //       age: 2,
      //       coin: "RICK",
      //       max_volume_rat: [[1, [7987]], [1, [8]]],
      //       maxvolume: 998.375,
      //       price: "2",
      //       price_rat: [[1, [2]], [1, [1]]],
      //       pubkey:
      //         "9727ffa665389a4fed0a2b75687d1a7ad23a430f0aa06dfbf9edb9b972da7808",
      //       zcredits: 0
      //     }
      //   ],
      //   base: "RICK",
      //   biddepth: 0,
      //   bids: [
      //     {
      //       address: "RT9MpMyucqXiX8bZLimXBnrrn2ofmdGNKd",
      //       age: 3,
      //       coin: "MORTY",
      //       max_volume_rat: [[1, [1000]], [1, [1]]],
      //       maxvolume: 1000,
      //       price: "0.5",
      //       price_rat: [[1, [1]], [1, [2]]],
      //       pubkey:
      //         "1bb83b58ec130e28e0a6d5d2acf2eb01b0d3f1670e021d47d31db8a858219da8",
      //       zcredits: 0
      //     },
      //     {
      //       address: "RTpwruinq4GLbkGZg8NrJw5YPWUvMWnHYR",
      //       age: 2,
      //       coin: "MORTY",
      //       max_volume_rat: [[1, [2394874817, 11]], [1, [50000000]]],
      //       maxvolume: 992.79030146,
      //       price: "0.5",
      //       price_rat: [[1, [1]], [1, [2]]],
      //       pubkey:
      //         "9727ffa665389a4fed0a2b75687d1a7ad23a430f0aa06dfbf9edb9b972da7808",
      //       zcredits: 0
      //     },
      //     {
      //       address: "RFaYHBEZrFVfVxcg9TCzxupmKBwd8Rv5Y4",
      //       age: 6,
      //       coin: "MORTY",
      //       max_volume_rat: [
      //         [1, [3553673217, 1746229]],
      //         [1, [392331264, 5820766]]
      //       ],
      //       maxvolume: 0.30000000000000004,
      //       price: "0.1",
      //       price_rat: [[1, [1]], [1, [10]]],
      //       pubkey:
      //         "c00fb5010c5319035a43ed2ea1a7bf40f36b761d7e7e912173b094e0ecebcd39",
      //       zcredits: 0
      //     },
      //     {
      //       address: "RRGKTckWwrZWq73vNekoLxqCJLHS4UKTyk",
      //       age: 10,
      //       coin: "MORTY",
      //       max_volume_rat: [[1, [5]], [1, [2]]],
      //       maxvolume: 2.5,
      //       price: "0.25",
      //       price_rat: [[1, [1]], [1, [4]]],
      //       pubkey:
      //         "e52560d1ce0ccf12a4d38aa0f141ae269697c45830b1337995917fdf00bdb58c",
      //       zcredits: 0
      //     }
      //   ],
      //   netid: 9999,
      //   numasks: 4,
      //   numbids: 4,
      //   rel: "MORTY",
      //   timestamp: 1571303370
      // }
    };
  },
  methods: {
    showDEXMarket: function(base, rel) {
      console.log("Show market:" + base + "/" + rel);
      axios
        .post(
            process.env.VUE_APP_MMBOTURL +
            "/getMarket?base=" +
            base +
            "&rel=" +
            rel
        )
        .then(response => {
          this.marketdataraw = response.data;
          let tmpmarketdata = this.marketdataraw
          tmpmarketdata.asks = this.groupByPrice2(this.marketdataraw.asks, "price");
          tmpmarketdata.bids = this.groupByPrice2(this.marketdataraw.bids, "price");
          this.marketdata = tmpmarketdata

          console.log(JSON.stringify(this.marketdata, null, 4))

        })
        .catch(e => {
          this.customerrors.push(e);
        });
    },
    NOTUSEDgetCEXprice: function(base, rel) {
      console.log("Getting CEX Price:" + base + "/" + rel);
      axios
        .get(
          "http://" +
            process.env.VUE_APP_WEBHOST +
            ":" +
            process.env.VUE_APP_WEBPORT +
            "/" +
            process.env.VUE_APP_MMBOTHOST +
            ":" +
            process.env.VUE_APP_MMBOTPORT +
            "/api/v1/getprice?base_currency=" +
            base +
            "&quote_currency=" +
            rel
        )
        .then(response => {
          this.cexprice = response.data.price;
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
    groupByPrice1: function(raw, groupBy) {
      // from https://stackoverflow.com/questions/21776389/javascript-object-grouping
      let i = 0,
        val,
        index,
        values = [],
        result = [];
      for (; i < raw.length; i++) { // for every "ask" or "bid" in the respective arrays
        console.log("LOOP:" + JSON.stringify(result, null, 2))
        val = raw[i][groupBy]; // this object val for the groupBy attribute
        index = values.indexOf(val);// has this val already been processed in a previous iteration
        console.log("val:" + val + " & index: " + index )
        if (index > -1){
          // this matches an already processed groupBy item
          console.log("Adding maxvolume: " + result[val.toString()].maxvolume + " and " + raw[i].maxvolume)
          result[val.toString()].maxvolume += raw[i].maxvolume
          // result[index].push(raw[i]);
        }
        else {
          // first val for this groupBy attribute
          values.push(val);
          // result.push([raw[i]]);
          result[val.toString()] = raw[i]
          console.log("NEW PRICE: " +  JSON.stringify(result[val.toString()],null,2) )
        }
      }
      console.log(JSON.stringify(result, null, 4))
    },
    groupByPrice2: function(raw, groupBy) {
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
            console.log("First grouped price to add maxvolume: " + interim[i][j].price)
            orderTemplate = interim[i][j]
            orderTemplate.address = ''
            orderTemplate.pubkey = ''
            // for highlighting my orders in the OB, set prices within these ranges to activate
            // if( orderTemplate.price < 100 && orderTemplate.price > 15 || orderTemplate.price < 0.05 ){
            //   orderTemplate.myOrder = true
            // }
          }
          else {
            orderTemplate.maxvolume += interim[i][j].maxvolume
          }
        }
        result.push(orderTemplate)
      }
      // console.log(JSON.stringify(result, null, 4))
      return result
    }
  },
  created: function() {
    console.log(this.appName + " Created");
    // original prod code
    this.showDEXMarket(this.wallets.base.ticker, this.wallets.rel.ticker)
    // working fake data
    // this.marketdata = this.fakeData
    // test grouping
    // this.marketdata.asks = this.groupByPrice2(this.fakeData.asks, "price");
    // this.marketdata.bids = this.groupByPrice2(this.fakeData.bids, "price");
    this.getCEXprice(this.wallets.base.ticker, this.wallets.rel.ticker);
    console.log(this.appName + " Finished Created");
  },
  computed: {
    coinCount: function() {
      return this.activeCoins.length;
    }
  }
};
</script>
