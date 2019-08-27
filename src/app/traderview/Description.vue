<template>
  <div class="top-spaced">
    <div>
      <v-row no-gutters>
        <v-toolbar color="white" flat>
          <v-toolbar-title>Trading</v-toolbar-title>

          <v-divider class="mx-4" vertical></v-divider>
          <h2>{{ market.base + " / " + market.rel }}</h2>
          <v-chip class="ma-2" color="success" outlined @click="invertbase(market.base)">
            <v-icon left>mdi-server-plus</v-icon>BASE PAIR
          </v-chip>
          <v-btn depressed small color="success">Enabled</v-btn>

          <div class="flex-grow-1">
            <v-divider class="mx-4" vertical></v-divider>
            <v-btn depressed small>Global Average Price: {{ market.price }}</v-btn>
          </div>

          <v-toolbar-items class="hidden-sm-and-down">
            <v-divider vertical></v-divider>
            <v-btn rounded depressed dark large color="red">
              <h3>Disable Asset Pair</h3>
            </v-btn>
            <v-divider vertical></v-divider>
          </v-toolbar-items>

          <v-app-bar-nav-icon></v-app-bar-nav-icon>
        </v-toolbar>
      </v-row>
    </div>
    <CurrentStrategies />
  </div>
</template>
<script>
import CurrentStrategies from "./CurrentStrategies";
// import ToggleBot from "./ToggleBot";

export default {
  components: {
    // ToggleBot,
    CurrentStrategies
  },
  data: function() {
    return {
      market: { base: "RICK", rel: "MORTY", price: "1.557" }
    };
  },
  methods: {
    invertbase: function(base) {
      console.log("Invert base " + base )
    }
  }
};
</script>
<style scoped>
.top-spaced {
  margin-top: 50px;
}
</style>