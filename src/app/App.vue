<template>
  <v-app id="inspire">
    <v-navigation-drawer v-model="drawer" :clipped="$vuetify.breakpoint.lgAndUp" app>
      <v-list dense>
        <template v-for="item in items">
          <v-layout v-if="item.heading" :key="item.heading" align-center>
            <v-flex xs6>
              <v-subheader v-if="item.heading">{{ item.heading }}</v-subheader>
            </v-flex>
            <v-flex xs6 class="text-center">
              <a href="#!" class="body-2 black--text">EDIT</a>
            </v-flex>
          </v-layout>

          <v-list-group
            v-else-if="item.children"
            :key="item.text"
            v-model="item.model"
            :prepend-icon="item.model ? item.icon : item['icon-alt']"
            append-icon
          >
            <template v-slot:activator>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>{{ item.text }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </template>
            <v-list-item v-for="(child, i) in item.children" :key="i" @click="doAction(child.text)">
              <v-list-item-action v-if="child.icon">
                <v-icon>{{ child.icon }}</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>{{ child.text }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-group>
          <v-list-item v-else :key="item.text" @click="doAction(item.text)">
            <v-list-item-action>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>{{ item.text }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar :clipped-left="$vuetify.breakpoint.lgAndUp" app color="indigo" dark>
      <v-toolbar-title style="width: 300px" class="ml-0 pl-4">
        <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
        <span class="hidden-sm-and-down">{{ appName }}</span>
      </v-toolbar-title>

      <v-spacer></v-spacer>
      <v-btn rounded depressed dark large color="indigo" href="/#/dashboard">
        <h3>Dashboard</h3>
        <v-icon class="px-2">ballot</v-icon>
      </v-btn>
      <v-btn rounded depressed dark large color="indigo" @click="dialog = !dialog">
        <h3>Markets</h3>
        <v-icon class="px-2">apps</v-icon>
      </v-btn>
    </v-app-bar>

    <v-dialog v-model="dialog" fullscreen hide-overlay transition="dialog-bottom-transition">
      <v-card>
        <v-toolbar dark color="indigo">
          <v-btn icon dark @click="dialog = false">
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title>Markets</v-toolbar-title>
          <div class="flex-grow-1"></div>
          <v-toolbar-items>
            <v-btn dark text @click="dialog = false">back</v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-list three-line subheader>
          <v-subheader>Go to markets</v-subheader>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>Informational Section</v-list-item-title>
              <v-list-item-subtitle>Please wait for the available market links to load</v-list-item-subtitle>


              <AppMarkets v-on:closeDialog="gotoMarket" :key="componentKey" />


            </v-list-item-content>
          </v-list-item>
          <v-divider></v-divider>
        </v-list>
      </v-card>
    </v-dialog>

    <v-content>
      <router-view></router-view>
    </v-content>
  </v-app>
</template>

<script>
import AppMarkets from "./orderbooks/AppMarkets";

export default {
  name: "App",
  components: { AppMarkets },
  props: {
    source: String
  },
  methods: {
    gotoMarket: function() {
      // console.log("Going to new market..." + base + "/")// + rel)
      console.log(this.componentKey)
      this.componentKey += 1
      this.dialog = !this.dialog
      // this.$router.push("#")
      // this.$router.push("/traderview?base=" + base + "&rel=KMD")// + rel);

// window.location.href = "#/" + command.toLowerCase().replace(/ /g, "");
    },
    doAction: function(command) {
      window.location.href = "#/" + command.toLowerCase().replace(/ /g, "");
    }
  },
  data: () => ({
    appName: "Marketmaker Club",
    base: '',
    componentKey: 0,
    dialog: false,
    drawer: null,
    items: [
      { icon: "play_circle_outline", text: "Coins" },
      { icon: "blur_linear", text: "Orderbooks" },
      { icon: "swap_horiz", text: "Completed Swaps" },
      { icon: "swap_horizontal_circle", text: "Current Swap Status" },
      { icon: "save_alt", text: "Refill" },
      { icon: "eject", text: "Withdraw" },
      { icon: "control_camera", text: "Marketmaking" },
      { icon: "settings", text: "Settings" },
      { icon: "account_balance", text: "Antara Market Cap" },
      { icon: "trending_up", text: "CEX Prices" },
      { icon: "timeline", text: "Aggregator Prices" },
      { icon: "chat_bubble", text: "Send feedback" },
      { icon: "help", text: "Help" },
      { icon: "phonelink", text: "App downloads" }
    ]
  })
};
</script>

<style>
/* global styles */
</style>