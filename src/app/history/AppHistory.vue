<template>
  <div>
    <h2>{{ appName }}</h2>
    <div v-if="history.swaps !== undefined && history.swaps.length > 0">
      <div>
        <v-simple-table>
          <thead>
            <tr>
              <th class="text-left">Type</th>
              <th class="text-left">UUID</th>
              <th class="text-left">Other Coin</th>
              <th class="text-left">My Coin</th>
              <th class="text-left">My Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in history.swaps" v-bind:key="row.ticker">
              <td>{{ row.type }}</td>
              <td>{{ row.uuid }}</td>
              <td>{{ row.my_info.other_coin }}</td>
              <td>{{ row.my_info.my_coin }}</td>
              <td>{{ row.my_info.my_amount }}</td>
            </tr>
          </tbody>
        </v-simple-table>
      </div>
    </div>
    <div v-else>Nothing to show</div>
    <v-layout justify-center>
      <v-dialog v-model="dialog" width="600px">
        <template v-slot:activator="{ on }">
          <v-btn color="primary" dark v-on="on">Show Raw Data</v-btn>
        </template>
        <v-card>
          <v-card-title>
            <span class="headline">Up To Last 10 Last Swaps Raw Data</span>
          </v-card-title>
          <v-card-text>
              <pre>
                  {{ history }}
              </pre>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green darken-1" text @click="dialog = false">Save As</v-btn>
            <v-btn color="green darken-1" text @click="dialog = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-layout>
  </div>
</template>
<script>
import axios from "axios";

export default {
  name: "AppHistory",
  data: function() {
    return {
      appName: "Recent Swaps",
      history: {},
      dialog: false,
      customerrors: []
    };
  },
  methods: {},
  created: function() {

      let requestData = {}
      requestData['from_uuid'] = ""
      requestData['limit'] = 10
      // requestData['userpass'] = 'YOUR_PASSWORD_HERE'

      axios
        .post(
          "http://" +
            process.env.VUE_APP_WEBHOST +
            ":" +
            process.env.VUE_APP_WEBPORT +
            "/" +
            process.env.VUE_APP_MMBOTHOST +
            ":" +
            process.env.VUE_APP_MMBOTPORT +
            "/api/v1/legacy/mm2/my_recent_swaps",
            requestData
        )
        .then(response => {
          console.log(JSON.stringify(response.data))
        })
        .catch(e => {
          this.customerrors.push(e);
        });

    console.log(this.appName + " Created");

    // axios
    //   .get( "http://" + process.env.VUE_APP_WEBHOST + ":7780/recentswaps")
    //   .then(response => {
    //     // console.log(response.data);
    //     // JSON responses are automatically parsed.
    //     if (response.data !== undefined) {
    //       // console.log(response.data.result)
    //       this.history = response.data.result;
    //       console.log("RECENT SWAPS: " + JSON.stringify(this.history));
    //     }
    //   })
    //   .catch(e => {
    //     this.customerrors.push(e);
    //   });

    console.log(this.appName + " Finished Created");
  }
};
</script>