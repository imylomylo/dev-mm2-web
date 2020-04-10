<template>
  <div>
    <!-- <h3>Current Strategies</h3>
    <div>{{ currentStrategyInfo}}</div>
    <div>
      slides
      orderbutton
    </div>-->
      <v-card-text color="blue">
        <div>
          CURRENT STRATEGY: {{ currentStrategyInfo}}
          <!-- <v-btn text color="deep-purple accent-4">Learn More</v-btn> -->
        </div>
        <!-- <v-card-title> {{ currentStrategyInfo }} </v-card-title>
        <p class="display-1 text--primary">{{currentStrategyInfo}}</p> -->
      </v-card-text>
  </div>
</template>
<script>
export default {
  components: {},
  data: function() {
    return {
      currentStrategyInfo: "ONLY BUY KMD, 1.8% SPREAD WITH 10% ORDER SIZE"
    };
  }
};
</script>