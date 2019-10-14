<template>
  <v-card max-width="auto" class="mx-auto" outlined>
    <v-toolbar flat dense color="blue-grey lighten-5">
      <v-toolbar-title>
        <span class="subheading">AtomicDEX order book</span>
      </v-toolbar-title>
      <div class="flex-grow-1">


      </div>
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
              <template
                v-slot:header.price="{ header }"
              ><!-- {{ header.text.toUpperCase() }} --> Price ({{wallets.rel.ticker }})</template>

              <template
                v-slot:header.maxvolume="{ header }"
              ><!-- {{ header.text.toUpperCase() }} --> Amount ({{wallets.base.ticker }})</template>

              <template
                v-slot:header.relamount="{ header }"
              ><!-- {{ header.text.toUpperCase() }} --> Total ({{wallets.rel.ticker }})</template>

              <!-- Rounding from https://www.jacklmoore.com/notes/rounding-in-javascript/ -->
              <!-- Better to move to computed function for maintainability/non-repetitive -->
              <template v-slot:item.price="{ item }">{{ Number(Math.round(item.price+'e8')+'e-8') }}</template>
              <template v-slot:item.maxvolume="{ item }">{{ Number(Math.round(item.maxvolume+'e8')+'e-8') }}</template>
              <template v-slot:item.relamount="{ item }">{{ Number(Math.round(item.price*item.maxvolume+'e8')+'e-8') }}</template>
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
              hide-default-header
              hide-default-footer
              :headers="bidsHeaders"
              :items="marketdata.bids"
              :items-per-page="15"
            >
              <!-- Rounding from https://www.jacklmoore.com/notes/rounding-in-javascript/ -->
              <!-- Better to move to computed function for maintainability/non-repetitive -->
              <template v-slot:item.price="{ item }">{{ Number(Math.round(item.price+'e8')+'e-8') }}</template>
              <template v-slot:item.baseamount="{ item }">{{ Number(Math.round(item.maxvolume/item.price+'e8')+'e-8') }}</template>
              <template v-slot:item.maxvolume="{ item }">{{ Number(Math.round(item.maxvolume+'e8')+'e-8') }}</template>
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
      marketdata: "",
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
    };
  },
  methods: {
    showDEXMarket: function(base, rel) {
      console.log("Show market:" + base + "/" + rel);
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
          "/api/v1/legacy/mm2/getorderbook?base_currency=" +
          base +
            "&quote_currency=" +
          rel
        )
        .then(response => {
          this.marketdata = response.data;
          // console.log(JSON.stringify(this.marketdata, null, 4));
        })
        .catch(e => {
          this.customerrors.push(e);
        });
    },
    getCEXprice: function(base, rel) {
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
    }
  },
  created: function() {
    console.log(this.appName + " Created");
    this.showDEXMarket(this.wallets.base.ticker, this.wallets.rel.ticker)
    this.getCEXprice(this.wallets.base.ticker, this.wallets.rel.ticker)
    console.log(this.appName + " Finished Created");
  },
  computed: {
    coinCount: function() {
      return this.activeCoins.length;
    }
  }
};
</script>