<template>
  <div>
    <h2>{{ appName }}</h2>
  </div>
</template>
<script>
export default {
  name: "AppConsole",
  data: function() {
    return {
      appName: "Console",
      customerrors: []
    };
  },
  methods: {},
  created: function() {}
};
</script>