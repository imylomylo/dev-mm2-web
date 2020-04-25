<template>
  <div>
    <v-card max-width="auto" class="mx-auto" outlined>
      <v-toolbar flat dense color="blue-grey lighten-5">
        <v-toolbar-title>
          <span class="subheading">Orders For {{ meName || "This Node"}}</span>
        </v-toolbar-title>
        <div class="flex-grow-1"></div>
<!-- mePrivate and mePublic are set in .env* files of the root of the webapp project and read in at runtime -->
<div v-if="mePrivate == 'true' && mePublic == 'false'">
        <v-chip class="ma-2" color="error" outlined @click="cancelAllOrders()">
          <v-icon left>mdi-server-plus</v-icon>Cancel All
        </v-chip>
</div>
      </v-toolbar>
      <v-divider class="mx-4"></v-divider>
      <div v-if="myOrders !== undefined && Object.keys(myOrders).length > 0">
        <v-simple-table fixed-header height="auto">
          <thead>
            <tr>
              <th class="text-left">Pair</th>
              <th class="text-left">Status</th>
              <th class="text-left">Order Price</th>
              <th class="text-left">Amount</th>
<!-- mePrivate and mePublic are set in .env* files of the root of the webapp project and read in at runtime -->
<div v-if="mePrivate == 'true' && mePublic == 'false'">
              <th class="text-left">Shortcut</th>
</div>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in Object.keys(myOrders)" v-bind:key="row.ticker">
              <td>
                <a @click="gotoMarket(myOrders[row].base,myOrders[row].rel)">{{ myOrders[row].base }} / {{ myOrders[row].rel }}</a>              
              </td>
              <td>Not implemented yet</td>
              <td>{{ myOrders[row].price }}</td>
              <td>{{myOrders[row].max_base_vol }}</td>
              <td>
                <div class="text-right">
                  <!-- <v-chip class="ma-2" color="success" @click="gotoMarket(row.base, row.rel)">
                <v-icon left>mdi-server-plus</v-icon>Go to market
                  </v-chip>-->
<!-- mePrivate and mePublic are set in .env* files of the root of the webapp project and read in at runtime -->
<div v-if="mePrivate == 'true' && mePublic == 'false'">
                  <v-chip class="ma-2" color="red" dark @click="cancelOrder(myOrders[row].uuid)">
                    <v-icon left>mdi-server-plus</v-icon>Cancel
                  </v-chip>
</div>
                </div>
              </td>
            </tr>
          </tbody>
        </v-simple-table>
      </div>
      <div v-else>Not implemented fully yet. Place a single order.</div>
    </v-card>
  </div>
</template>
<script>
import axios from "axios";

export default {
  props: ["myOrders"],
  data: function() {
    return {
      meName: process.env.VUE_APP_MENAME,
      mePrivate: process.env.VUE_APP_MEPRIVATE,
      mePublic: process.env.VUE_APP_MEPUBLIC,
      customerrors: []
    };
  },
  methods: {
    gotoMarket: function(base, rel) {
      console.log("Go to market");
      window.location.href = "/#/traderview/" + base + "/" + rel
      this.$router.go(this.$router.currentRoute);
    },
    cancelAllOrders: function() {
      this.$emit("cancel-all-orders")
    },
    cancelOrder: function(uuid) {
      console.log("Cancel order: " + uuid)
      this.$emit("cancel-order", uuid)
    }
  },
  created: function() {
    console.log("MyOrders Created");
    console.log("MyOrders Finished");
  }
};
</script>
<style scoped>
</style>
