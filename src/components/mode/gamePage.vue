<template>
  <div>
    <van-nav-bar style="position: fixed; top: 0; left: 0; width: 100%; background-color: #ede9e7" title="" left-arrow @click-left="$router.back()" />
    <div style="height: 46px"></div>
    <div v-if="url" style="height: calc(100vh - 46px); overflow-y: scroll; -webkit-overflow-scrolling: touch">

      <iframe style="height: 100%; width: 100%"  ref="iframe" scrolling="auto" frameborder="0"  id="iframe"></iframe>
    </div>
  </div>
</template>
<script>
export default {
  name: 'gamePage',
  data() {
    return {
      url: null,
    };
  },
  created() {
    let that = this;
    var query = that.$route.query;
    // 打开代理
    console.log(query)
    if (query.dailiD == 1) {
      that.getAgentLoginUrl();
      return;
    }
    // 打开客服
    if (query.dailiD == 2) {
      that.getservicerurl();
      return;
    }
    if (query.app == 1) {
     that.url = that.$store.state.appInfo.ios_download_url;
      return;
    }
    if (query.name) {
      that.goGamePage(query.name, query.type, query.code);
    }
  },
  methods: {
    // 打开客服
    getservicerurl() {
      let that = this;
      that.$apiFun.post('/api/getservicerurl', {}).then(res => {
        if (res.code != 200) {
          that.showTost(0, res.message);
        }
        if (res.code == 200) {
          that.url = res.data.url;
        }
      });
    },
    // 打开代理
    getAgentLoginUrl() {
      let that = this;
      that.$apiFun.get('/api/getAgentLoginUrl', {}).then(res => {
        if (res.code != 200) {
          that.showTost(0, res.message);
        }
        if (res.code == 200) {
          that.url = res.data.url;
        }
      });
    },
    // 打开游戏
    goGamePage(name, type, code) {
      let that = this;

      // 新后端 game_type 用 NG 数字编号:1视讯/2老虎机/3彩票/4体育/5电竞/6捕鱼/7棋牌;
      // 兼容旧字符串分类码(realbet/concise/...)统一映射。
      // 注意实测后端绑定:game_type 必须是【字符串】,is_mobile_url 必须是【数字】,传错类型报"缺少参数"
      const NG_GAME_TYPE = { realbet: 1, concise: 2, lottery: 3, sport: 4, gaming: 5, fishing: 6, joker: 7 };
      let gameType = NG_GAME_TYPE[type] || Number(type) || 0;

      that.$apiFun
        .post('/api/getGameUrl', { plat_name: name, game_type: String(gameType), game_code: code || '', is_mobile_url: 1 })
        .then(res => {
          console.log(res);
          if (res.code != 200) {
            that.$parent.showTost(0, res.message);
          }
          if (res.code == 200) {
            that.url = res.data.url;
          }
        })
        .catch(res => {});
    },
  },
  mounted() {
    let that = this;
  },
  updated() {
    let that = this;
    that.$refs.iframe.contentWindow.location.replace(that.url);
  },
};
</script>

<style lang="scss" scoped>
// @import '../../../static/css/chunk-099d4415.690b75b1.css';
</style>
