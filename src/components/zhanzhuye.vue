<template>
  <div  style="height: 100vh; overflow-y: scroll; -webkit-overflow-scrolling: touch">
    <!--  -->
    <img class="bancgs" @click="$router.back()" src="/static/image/bank_020021515.png" alt="">
    <iframe v-if="type == 1" style="height: calc(100% - 6px); width: 100%" :src="sponsorBaseUrl + '/h5/1.html'" ref="iframe" scrolling="auto" frameborder="0" id="iframe"></iframe>
    <iframe v-if="type == 2" style="height: calc(100% - 6px); width: 100%" :src="sponsorBaseUrl + '/h5/2.html'" ref="iframe" scrolling="auto" frameborder="0" id="iframe"></iframe>
  </div>
</template>
<script>
export default {
  name: 'zhanzhuye',
  data() {
    return {
      type: 1,
      sponsorBaseUrl: process.env.SPONSOR_BASE_URL || 'https://devops.8888880.vip',
    };
  },
  created() {
    let that = this;
    var query = that.$route.query;
    that.type = query.type;
  },
  methods: {},
  mounted() {
    let that = this;
  },
  updated() {},
};
</script>

<style lang="scss" scoped>

</style>
