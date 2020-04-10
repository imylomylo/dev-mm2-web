<template>
  <div class="top-spaced">
    <div>
      <v-row no-gutters>
        <v-toolbar color="white" flat>
          <v-toolbar-title>Trading</v-toolbar-title>

          <v-divider class="mx-4" vertical></v-divider>
          <h2>{{ base.ticker + " / " + rel.ticker}}</h2>
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
            <v-btn rounded depressed dark large color="red" @click="enable">
              <h3>Disable Automation</h3>
            </v-btn>
            <v-divider vertical></v-divider>
          </v-toolbar-items>

          <v-app-bar-nav-icon></v-app-bar-nav-icon>
        </v-toolbar>
      </v-row>
    </div>
          <v-card-text color="blue">
        <div>
          CURRENT STRATEGY: {{ currentStrategyInfo}}
          <!-- <v-btn text color="deep-purple accent-4">Learn More</v-btn> -->
        </div>
        <!-- <v-card-title> {{ currentStrategyInfo }} </v-card-title>
        <p class="display-1 text--primary">{{currentStrategyInfo}}</p> -->
      </v-card-text>
    <!-- <CurrentStrategies /> -->
  </div>
</template>
<script>
// import CurrentStrategies from "./CurrentStrategies";
// import ToggleBot from "./ToggleBot";

export default {
  components: {
    // ToggleBot,
    // CurrentStrategies
  },
  props: ["base", "rel"],
  data: function() {
    return {
      currentStrategyInfo: "ONLY BUY KMD, 1.8% SPREAD WITH 10% ORDER SIZE",
      overlay: false,
      // base: '',
      // rel: '',
      market: { base: "RICK", rel: "MORTY", price: "1.557" }
    };
  },
  methods: {
    invertbase: function(base) {
      console.log("Invert base " + base);
    },
    enable: function() {
      this.$emit("mmenable");
      this.overlay = false;
    }
  }
};
</script>
<style scoped>
.top-spaced {
  margin-top: 50px;
}
</style>