<template>
  <v-card max-width="auto" class="mx-auto">
    <v-row justify="center">
<!--
      <v-btn color="success" class="mt-12" @click="overlay = !overlay">Show Overlay</v-btn> 
-->

      <v-overlay opacity="0.88" :absolute="absolute" :value="overlay">
        <v-btn color="warning" @click="disenable(false)">No Export</v-btn>
      </v-overlay>
    </v-row>

    <v-toolbar flat dense color="blue-grey lighten-5">
      <v-toolbar-title>
        <span class="subheading">Export</span>
      </v-toolbar-title>
    </v-toolbar>
    <v-divider class="mx-4"></v-divider>

    <v-simple-table fixed-header height="auto">
      <thead>
        <tr>
          <th class="text-left">Instruction</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in strategies" v-bind:key="row.ticker">
          <td>
              <p>Export all your trade, deposits and withdrawal in csv format</p>
            <div class="text-left">
              <v-chip class="ma-2" color="success" dark @click="doExport(128)">
                <v-icon left>mdi-server-plus</v-icon>Export
              </v-chip>
            </div>
          </td>
        </tr>
      </tbody>
    </v-simple-table>
  </v-card>
</template>
<script>
import axios from 'axios'
// import StrategyProvider from "../lib/strategy.js";
export default {
  // props: ["strategies"],
  data: function() {
    return {
      absolute: true,
      overlay: true,
      strategies: [{}]
    };
  },
  methods: {
    doExport: function(){
      console.log("do export")
    },
    getServiceConfig: function() {
      axios
        .get("http://" + process.env.VUE_APP_WEBHOST + ":7780/config2")
        .then(response => {
          // console.log(response.data);
          // JSON responses are automatically parsed.
          if (response.data !== undefined) {
            // console.log(response.data.result)
            this.configService = response.data;
            console.log(
              "getServiceConfig(): configService: " +
                JSON.stringify(this.configService)
            );
            this.supportedCoins = this.configService;
            // this.supportedCoins = Object.keys(this.configService)
            console.log(this.supportedCoins);
          }
        })
        .catch(e => {
          this.customerrors.push(e);
        });
    }
  },
  created: function() {
    console.log("Export Created");
  }
};
</script>
<style scoped>
</style>
