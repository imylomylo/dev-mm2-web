<template>
  <div>
    <h2>Marketmakers {{ appName }}</h2>
    <!-- {{ marketData }} -->
    <div v-if="marketData">
      {{ marketData.base }} balance: {{ walletBalance.base }}
      {{ marketData.rel }} balance: {{ walletBalance.rel }}
    </div>

    <div v-if="marketData">
      <div>
        <v-layout>
          <v-flex md6 lg6>
            <h2>
              {{ marketData.base }} / {{ marketData.rel }} - Asks
              <v-chip
                class="ma-2"
                color="red"
                outlined
                @click.stop="newAsk(marketData.base, marketData.rel)"
              >
                <v-icon left>mdi-server-plus</v-icon>
                SELL {{ marketData.base}}
              </v-chip>
              <v-chip v-if="marketData" class="ma-2" color="blue" outlined @click="soon">
                <v-icon left>vertical_align_center</v-icon>Spread
              </v-chip>
              <v-chip v-if="marketData" class="ma-2" color="blue" outlined @click="soon">
                <v-icon left>vertical_align_bottom</v-icon>Layer
              </v-chip>
              <v-chip v-if="marketData" class="ma-2" color="blue" outlined @click="soon">
                <v-icon left>vertical_align_top</v-icon>Layer
              </v-chip>
            </h2>
            <v-data-table
              :headers="headers"
              :items="marketData.asks"
              :items-per-page="5"
              class="elevation-1"
            >
              <!-- for more options in the single column, this example works -->
              <!-- <template v-slot:item.taker="{ item }">
      <v-icon
        small
        class="mr-2"
        @click="soon(item)"
      >
        edit
      </v-icon>
      <v-icon
        small
        @click="soon(item)"
      >
        delete
      </v-icon>
              </template>-->

              <template v-slot:item.taker="{ item }">
                <v-chip
                  color="green"
                  dark
                  @click.stop.prevent="takerAsk(marketData.base, marketData.rel, item.price)"
                >
                  {{ item.taker }}
                  <v-icon left>swap_horiz</v-icon>
                  Taker (buy {{marketData.base}})
                </v-chip>
              </template>
            </v-data-table>
          </v-flex>

          <v-flex md6 lg6>
            <h2>
              {{ marketData.base }} / {{ marketData.rel }} - Bids
              <v-chip
                class="ma-2"
                color="success"
                outlined
                @click.stop="newBid(marketData.base, marketData.rel)"
              >
                <v-icon left>mdi-server-plus</v-icon>
                BUY {{ marketData.base}}
              </v-chip>
              <v-chip v-if="marketData" class="ma-2" color="blue" outlined @click="soon">
                <v-icon left>vertical_align_center</v-icon>Spread
              </v-chip>
              <v-chip v-if="marketData" class="ma-2" color="blue" outlined @click="soon">
                <v-icon left>vertical_align_bottom</v-icon>Layer
              </v-chip>
              <v-chip v-if="marketData" class="ma-2" color="blue" outlined @click="soon">
                <v-icon left>vertical_align_top</v-icon>Layer
              </v-chip>
            </h2>
            <v-data-table
              :headers="headers"
              :items="marketData.bids"
              :items-per-page="5"
              class="elevation-1"
            >
              <template v-slot:item.taker="{ item }">
                <v-chip
                  color="red"
                  dark
                  @click="takerBid(marketData.base, marketData.rel, item.price)"
                >
                  {{ item.taker }}
                  <v-icon left>swap_horiz</v-icon>
                  Taker (sell {{marketData.base}})
                </v-chip>
              </template>
            </v-data-table>
          </v-flex>
        </v-layout>
      </div>
    </div>
    <div
      v-else
    >Here lists the current orders. Select a market pair to view the current DEX orderbooks</div>
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
                <a href="#">{{ row.ticker }}</a>
              </td>
              <td>
                <!-- {{getMarkets(row)}} -->
                <v-chip
                  class="ma-2"
                  v-for="market in getAvailableMarkets(row.ticker)"
                  v-bind:key="row.id"
                  @click="showDEXMarket(row.ticker, market.ticker)"
                >{{ market.ticker }}</v-chip>
              </td>
            </tr>
          </tbody>
        </v-simple-table>
      </div>
    </div>
    <div v-else>Enable two coins to view the market data for that pair.</div>

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
    <div v-if="myOrders.taker">
      <div>
        <v-layout>
          <v-flex md6 lg6>
            <h2>My Market Taker Orders</h2>
            <v-data-table
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

    <v-layout justify-center>
      <v-dialog v-model="makerDialog" persistent max-width="600px">
        <v-card>
          <v-card-title>
            <span class="headline">Maker Order Creation</span>
          </v-card-title>
          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex xs12 sm6>
                  <v-text-field v-bind:value="trade.base" label="Base*" required>{{ trade.base }}</v-text-field>
                </v-flex>
                <v-flex xs12 sm6>
                  <v-text-field
                    v-bind:value="trade.rel"
                    label="Rel*"
                    hint="example of helper text only on focus"
                  >{{ trade.rel }}</v-text-field>
                </v-flex>
                <v-flex xs12 sm6>
                  <v-text-field
                    v-model="trade.price"
                    label="Price* 1 base = this price rel"
                    type="text"
                    required
                  >{{ trade.price}}</v-text-field>
                </v-flex>
                <v-flex xs12 sm6>
                  <v-text-field
                    v-model="trade.amount"
                    label="Amount*"
                    hint="Max Available"
                    persistent-hint
                    required
                  >{{ trade.amount }}</v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
            <small>*indicates required field</small>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="makerDialog = false">No, Go Back</v-btn>
            <v-btn
              color="blue darken-1"
              text
              @click="doMarketMaker(trade.base, trade.rel, trade.price, trade.amount)"
            >Yes! Send Order</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-layout>

    <v-layout justify-center>
      <v-dialog v-model="takerDialog" persistent max-width="600px">
        <v-card>
          <v-card-title>
            <span class="headline">Taker Order Creation</span>
          </v-card-title>
          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex xs12 sm6>
                  <v-text-field v-bind:value="trade.base" label="Base*" required>{{ trade.base }}</v-text-field>
                </v-flex>
                <v-flex xs12 sm6>
                  <v-text-field
                    v-bind:value="trade.rel"
                    label="Rel*"
                    hint="example of helper text only on focus"
                  >{{ trade.rel }}</v-text-field>
                </v-flex>
                <v-flex xs12 sm6>
                  <v-text-field
                    v-model="trade.price"
                    label="Price* 1 base = this price rel"
                    type="text"
                    required
                  >{{ trade.price}}</v-text-field>
                </v-flex>
                <v-flex xs12 sm6>
                  <v-text-field
                    v-model="trade.amount"
                    label="Amount*"
                    hint="Max Available"
                    persistent-hint
                    required
                  >{{ trade.amount }}</v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
            <small>*indicates required field</small>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="takerDialog = false">No, Go Back</v-btn>
            <v-btn
              color="blue darken-1"
              text
              @click="doMarketTaker(trade.base, trade.rel, trade.price, trade.amount)"
            >Yes! Send Order</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-layout>
  </div>
</template>
<script>
import axios from "axios";

export default {
  name: "Orderbooks",
  // props: ['rows'],
  data: function() {
    return {
      takerDialog: false,
      makerDialog: false,
      activeCoins: "",
      walletBalance: { base: 0, rel: 0 },
      marketData: "",
      myOrders: {},
      trade: { base: "", rel: "", price: "", amount: "0" },
      appName: "Orderbooks",
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
    myBalance: function(base, rel) {
      console.log("My balance");
      axios
        .get("http://127.0.0.1:7780/getBalance?coin=" + base)
        .then(response => {
          console.log(response.data);
          this.walletBalance.base = response.data.balance;
        })
        .catch(e => {
          this.customerrors.push(e);
        });

      axios
        .get("http://127.0.0.1:7780/getBalance?coin=" + rel)
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
          "http://127.0.0.1:7780/doTaker?base=" +
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
          "http://127.0.0.1:7780/doMaker?base=" +
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
        .post("http://127.0.0.1:7780/getMarket?base=" + base + "&rel=" + rel)
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
        .get("http://127.0.0.1:7780/getOrders")
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
    axios
      .get(`http://127.0.0.1:7780/coinsenabled`)
      .then(response => {
        // console.log(response.data);
        // JSON responses are automatically parsed.
        if (response.data !== undefined) {
          // console.log(response.data.result)
          this.activeCoins = response.data.result;
          console.log("ACTIVE COINS: " + JSON.stringify(this.activeCoins));
        }
      })
      .catch(e => {
        this.customerrors.push(e);
      });
    // this.showMarket("RICK", "MORTY");
    console.log(this.appName + " Finished Created");
  },
  computed: {
    coinCount: function(row) {
      return this.activeCoins.length;
    }
  }
};
</script>