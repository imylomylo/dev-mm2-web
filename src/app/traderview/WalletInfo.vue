<template>
  <v-card max-width="auto" class="mx-auto">
    <v-toolbar flat dense color="blue-grey lighten-5">
      <v-toolbar-title>
        <span class="subheading">Wallets</span>
      </v-toolbar-title>
    </v-toolbar>
    <v-divider class="mx-4"></v-divider>

    <v-simple-table fixed-header height="auto">
      <thead>
        <tr>
          <th class="text-left">TICKER</th>
          <th class="text-left">Balance</th>
          <th class="text-left">24h Delta</th>
          <th class="text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{{ base.ticker }}</td>
          <td>{{ base.balance }}</td>
          <td>{{ base.delta24h }}</td>
          <td>
            <div class="text-left">
              <v-chip class="ma-2" color="success" @click="deposit(121)">
                <v-icon left>mdi-server-plus</v-icon>Deposit
              </v-chip>
              <v-chip class="ma-2" color="red" dark @click="withdraw(122)">
                <v-icon left>mdi-server-plus</v-icon>Withdraw
              </v-chip>
            </div>
          </td>
        </tr>
        <tr>
          <td>{{ rel.ticker }}</td>
          <td>{{ rel.balance }}</td>
          <td>{{ rel.delta24h }}</td>
          <td>
            <div class="text-left">
              <v-chip class="ma-2" color="success" @click="deposit(123)">
                <v-icon left>mdi-server-plus</v-icon>Deposit
              </v-chip>
              <v-chip class="ma-2" color="red" dark @click="withdraw(124)">
                <v-icon left>mdi-server-plus</v-icon>Withdraw
              </v-chip>
            </div>
          </td>
        </tr>
      </tbody>
    </v-simple-table>
  </v-card>
</template>
<script>
export default {
  data: function() {
    return {
      base: { ticker: "KMD", balance: "105.2429", delta24h: "+9.59%" },
      rel: { ticker: "BTC", balance: "0.0891", delta24h: "+12.59%" },

      extra: "Some extra description"
    };
  },
  methods: {
    deposit: function(rel){
      console.log("Deposit: " + rel)
    },
    withdraw: function(rel){
      console.log("Withdraw: " + rel)
    }
  }
};
</script>
<style scoped>
</style>