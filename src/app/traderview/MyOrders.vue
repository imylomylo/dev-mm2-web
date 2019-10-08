<template>
  <div>
    <v-card max-width="auto" class="mx-auto" outlined>
      <v-toolbar flat dense color="blue-grey lighten-5">
        <v-toolbar-title>
          <span class="subheading">My Orders</span>
        </v-toolbar-title>
      </v-toolbar>
      <v-divider class="mx-4"></v-divider>
      <div v-if="myOrders !== undefined && myOrders.length > 0">
        <v-simple-table fixed-header height="auto">
          <thead>
            <tr>
              <th class="text-left">Pair</th>
              <th class="text-left">Type</th>
              <th class="text-left">Status</th>
              <th class="text-left">Order Price</th>
              <th class="text-left">Market Price</th>
              <th class="text-left">Shortcut</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in myOrders" v-bind:key="row.ticker">
              <td>
                <a href="#">KMD {{ row.base }} / {{ row.rel }} BTC</a>
              </td>
              <td>Ask</td>
              <td>{{ row.status }} Unmatched</td>
              <td>0.00005555</td>
              <td>0.00004567</td>
              <td>
                <div class="text-right">
                  <!-- <v-chip class="ma-2" color="success" @click="gotoMarket(row.base, row.rel)">
                <v-icon left>mdi-server-plus</v-icon>Go to market
                  </v-chip>-->
                  <v-chip class="ma-2" color="red" dark @click="cancelOrder(row.uuid)">
                    <v-icon left>mdi-server-plus</v-icon>Cancel
                  </v-chip>
                </div>
              </td>
            </tr>
          </tbody>
        </v-simple-table>
      </div>
      <div v-else>Nothing to show</div>
    </v-card>
  </div>
</template>
<script>
import axios from "axios";

export default {
  data: function() {
    return {
      myOrders: [{ example: "1" }],
      customerrors: []
    };
  },
  methods: {
    gotoMarket: function(base, rel) {
      console.log("Go to market");
    },
    cancelOrder: function(uuid) {
      console.log("Cancel order: " + uuid);
    },
    getMyOrders: function() {
      console.log("My Orders");
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
            "/api/v1/legacy/mm2/my_orders"
        )
        .then(response => {
          console.log(response.data);
          this.myOrders = response.data;
        })
        .catch(e => {
          this.customerrors.push(e);
        });
    }
  },
  created: function() {
    console.log("MyOrders Created");
    this.getMyOrders();
    console.log("MyOrders Finished");
  }
};
</script>
<style scoped>
</style>