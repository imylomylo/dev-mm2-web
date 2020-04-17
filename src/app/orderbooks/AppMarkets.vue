<template>
  <div>
    <v-row>
<!--
<v-col class="text-center" cols="12" sm="4">
      <v-btn
        v-if="newmarket.rel != 0"
        width="256"
        depressed
        color="primary"
        outlined
        @click="gotoMarketView(newmarket.base.ticker, newmarket.rel.ticker)"
      >Go to market {{ newmarket.base.ticker }} / {{ newmarket.rel.ticker }}</v-btn>
</v-col>
-->
    </v-row>
    <v-row align="center">
      <v-col class="text-center" cols="12" sm="4">
        <!-- <div v-for="coin in mmccoins" v-bind:key="coin.id"> -->
BASE COIN (e.g. KMD)
        <div v-for="coin in activeCoins" v-bind:key="coin.id">
          <div class="my-2">
            <v-btn width="128" depressed color="primary" outlined @click="base(coin)">{{coin.ticker}}</v-btn>
          </div>
        </div>
      </v-col>
      <v-col v-if="newmarket.base != 0" class="text-center" cols="12" sm="4">
REL COIN (e.g. BTC)
        <div v-for="coin in activeCoins" v-bind:key="coin.id">
          <div class="my-2">
            <v-btn width="128" depressed color="primary" outlined @click="rel(coin)">{{coin.ticker}}</v-btn>
          </div>
        </div>
      </v-col>
<v-col class="text-center" cols="12" sm="4">
(e.g. KMD / BTC)
<div>
      <v-btn
        v-if="newmarket.rel != 0"
        width="256"
        depressed
        color="primary"
        outlined
        @click="gotoMarketView(newmarket.base.ticker, newmarket.rel.ticker)"
      >Go to market {{ newmarket.base.ticker }} / {{ newmarket.rel.ticker }}</v-btn>
</div>
</v-col>
    </v-row>

<!-- this is for a REL column with all the base in other column, one click solution.  e.g. KMD  then LTC,BTC,RVN,DGB, click on 1 of 4 base for KMD.
    <div>
      <div v-if="activeCoins !== undefined && activeCoins.length > 0">
        <div>
          <h2>
            Enabled Coin Markets
            <v-chip
              v-if="marketData"
              class="ma-2"
              color="blue"
              outlined
              @click="showDEXMarket(marketData.rel, marketData.base)"
            >
              <v-icon left>shuffle</v-icon>Inverse
            </v-chip>
          </h2>
          <v-simple-table>
            <thead>
              <tr>
                <th class="text-left">Base</th>
                <th class="text-left">Rel</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in activeCoins" v-bind:key="row.id">
                <td>
                  <v-btn depressed color="primary" outlined>{{ row.ticker }}</v-btn>
                </td>
                <td>
                  <v-btn
                    depressed
                    color="primary"
                    outlined
                    v-for="market in getAvailableMarkets(row.ticker)"
                    v-bind:key="row.id"
                    @click="gotoMarketView(row.ticker, market.ticker)"
                  >{{ market.ticker }}</v-btn>
                </td>
              </tr>
            </tbody>
          </v-simple-table>
        </div>
      </div>
      <div v-else>Enable two coins to view the market data for that pair.</div>
    </div>
-->
  </div>
</template>
<script>
import axios from "axios";

export default {
  name: "Markets",
  // props: ['rows'],
  data: function() {
    return {
      componentKey: 0,
      newmarket: { 
        base: { 
          ticker: '',
          balance: 0
        },
        rel: {
          ticker: '',
          balance: 0
        }
      },
      mmccoins: ["KMD", "BTC", "DGB", "DOGE", "LTC", "BAT", "RICK", "MORTY"],
      takerDialog: false,
      makerDialog: false,
      activeCoins: [],
      walletBalance: { base: 0, rel: 0 },
      marketData: "",
      myOrders: {},
      trade: { base: "", rel: "", price: "", amount: "0" },
      appName: "Markets",
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
    base: function(base) {
      this.newmarket.base.ticker = base.ticker;
      console.log("base: " + this.newmarket.base);
    },
    rel: function(rel) {
      this.newmarket.rel.ticker = rel.ticker;
      console.log("rel -" + rel);
    },
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
    gotoMarketView: function(base, rel) {
      this.newmarket.base.ticker = base
      this.newmarket.rel.ticker = rel
      console.log("market se.eect going to trader view: " + this.newmarket.base.ticker + "/" + this.newmarket.rel.ticker);
      this.$emit("closeDialog");
      // window.location.href = "/#/traderview?base=" + base + "&rel=" + rel;
      // this.$router.push("/traderview?base=" + base + "&rel=" + rel);
      // this.$router.push({
      //   name: "TraderView",
      //   query: {
      //     base: base,
      //     rel: rel
      //   }
      // });
      // window.location.href='#/traderview?base='+base+'&rel='+rel
      // window.location.href='/#/traderview/'+base+'/'+rel
      this.$router.push({name: "TraderView", params: {base: base, rel: rel}})
      //this.$forceUpdate()
      this.$router.go(this.$router.currentRoute)

      // this.forceRerender();
      // "http://" +
      //   process.env.VUE_APP_WEBHOST +
      //   // "localhost:8000/#/traderview?base="+
      //   ":8000/#/traderview?base=" +
      //   base +
      //   "&rel=" +
      //   rel
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
    },
    forceRerender: function() {
      this.componentKey += 1;
    }
  },
  created: function() {
    console.log(this.appName + " Created");
    axios
      .get(process.env.VUE_APP_MMBOTURL + "/coinsenabled")
      .then(response => {
        console.log("MYLO" + JSON.stringify(response.data.result));
        // JSON responses are automatically parsed.
        if (response !== undefined) {
          console.log(response)
          this.activeCoins = response.data.result;
          console.log("this.activeCoins: " + this.activeCoins)
        }
      })
      .catch(e => {
        this.customerrors.push(e);
      });
    // default values for GUI
    this.newmarket.base.ticker = "KMD"
    this.newmarket.rel.ticker = "BTC"
    console.log(this.appName + " Finished Created");
  },
  computed: {
    coinCount: function(row) {
      return this.activeCoins.length;
    }
  },
  watch: {
    "this.$route"(to, from) {
      // react to route changes...
    }
  }
};
</script>
