<template>
  <v-card max-width="auto" class="mx-auto">
    <v-row justify="center">
<!--
      <v-btn color="success" class="mt-12" @click="overlay = !overlay">Show Overlay</v-btn> 
-->

      <v-overlay opacity="0.88" :absolute="absolute" :value="overlay">
        <v-btn color="warning" @click="show(true)">Swap History</v-btn>
      </v-overlay>
    </v-row>

    <v-toolbar flat dense color="blue-grey lighten-5">
      <v-toolbar-title>
        <span class="subheading">Recent Swaps</span>
      </v-toolbar-title>
    </v-toolbar>
    <v-divider class="mx-4"></v-divider>

    <div v-if="swapHistory.swaps !== undefined && swapHistory.swaps.length > 0">
      <div>
        <v-simple-table>
          <thead>
            <tr>
              <th class="text-left">Type</th>
              <th class="text-left">My Coin</th>
              <th class="text-left">My Amount</th>
              <th class="text-left">Other Coin</th>
              <th class="text-left">Other Amount</th>
              <th class="text-left">Trade UUID</th>
              <th class="text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in swapHistory.swaps" v-bind:key="row.ticker">
              <td>{{ row.type }}</td>
              <td>{{ row.my_info.my_coin }}</td>
              <td>{{ row.my_info.my_amount }}</td>
              <td>{{ row.my_info.other_coin }}</td>
              <td>{{ row.my_info.other_amount }}</td>
              <td>{{ row.uuid }}</td>
              <td>
                <v-chip class="ma-2" color="blue" dark @click="showDetails(row.uuid)">
                  <v-icon left>mdi-server-plus</v-icon>Details
                </v-chip>
              </td>
            </tr>
          </tbody>
        </v-simple-table>
      </div>
    </div>
    <div v-else>Nothing to show</div>



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
              <v-chip class="ma-2" color="success" dark disabled @click="doExport(128)">
                <v-icon left>mdi-server-plus</v-icon>Export All
              </v-chip>
              <v-chip class="ma-2" color="warning" dark @click="show(false)">
                <v-icon left>mdi-server-plus</v-icon>Hide
              </v-chip>
            </div>
          </td>
        </tr>
      </tbody>
    </v-simple-table>
    <v-layout justify-center>
      <v-dialog v-model="dialog" width="600px">
<!--
        <template v-slot:activator="{ on }">
          <v-btn color="primary" dark v-on="on">Swap Details</v-btn>
        </template>
-->
        <v-card>
          <v-card-title>
            <span class="headline">Swap Raw Data</span>
          </v-card-title>
          <v-card-text>
              <pre>
{{ swapDetail }}
              </pre>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green darken-1" text @click="save()">Save As</v-btn>
            <v-btn color="green darken-1" text @click="dialog = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-layout>
  </v-card>
</template>
<script>
export default {
  props: ["swapHistory"],
  data: function() {
    return {
      appName: "Recent Swaps",
      dialog: false,
      absolute: true,
      overlay: true,
      swapDetail: {},
      strategies: [{}]
    };
  },
  methods: {
    save: function() {
      console.log("Export.save")
      this.$emit('save-json', this.swapDetail)
// from https://stackoverflow.com/a/16329419
//      let blob = new Blob([JSON.stringify(this.swapDetail,null,4)], {type: "application/json"});
//      let url  = URL.createObjectURL(blob);
//      window.location=url

// from https://www.4codev.com/javascript/download-save-json-content-to-local-file-in-javascript-idpx473668115863369846.html
// const a = document.createElement("a")
// const file = new Blob([JSON.stringify(this.swapDetail,null,4)], { type: 'application/json'})
// a.href = URL.createObjectURL(file)
// a.download = this.swapDetail.uuid + ".json"
// a.click()

    },
    showDetails: function(uuid) {
//      console.log("Export.showDetails: " + uuid)
// from https://stackoverflow.com/questions/2722159/how-to-filter-object-array-based-on-attributes
// filter the array of swap history finding the one with this UUID
        this.swapDetail = this.swapHistory.swaps.filter(function (x) {
//          console.log(JSON.stringify(x.uuid,null,3))
          if ( x.uuid == uuid ){
//            console.log("MATCH")
            delete x.success_events
            delete x.error_events
            return x
          }
        }).shift()
      this.dialog = true
    },
    show: function(showHide) {
      this.overlay = !showHide
      if( showHide ){
        this.$emit('get-swap-history')
      } else {
        this.$emit('hide-swap-history')
      }
    },
    doExport: function(){
      console.log("do export")
    }
  },
  created: function() {
    console.log("Export Created");
  }
};
</script>
<style scoped>
</style>
