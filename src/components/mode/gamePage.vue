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
      that.goGamePage(query.name, query.type, query.code, query.api);
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
    // 打开游戏:统一走 /api/gamelogin(文档两层结构)
    // - 列表型平台:带 game_code 进具体游戏
    // - 大厅型平台(has_games=false):不传 game_code,直接进厅
    // game_type 传 NG 编号仅作参考(后端按平台真实类型覆盖);实测绑定类型敏感:game_type【字符串】,is_mobile【数字】
    goGamePage(name, type, code, api) {
      let that = this;

      const NG_GAME_TYPE = { realbet: 1, concise: 2, lottery: 3, sport: 4, gaming: 5, fishing: 6, joker: 7 };
      let gameType = NG_GAME_TYPE[type] || Number(type) || 0;

      // api_code 为 apis 表大写业务码(BBIN/PG/OBCP...),由平台卡片一路透传;
      // 旧路由没带 api 时用 plat_type 大写兜底(多数平台二者一致)
      let info = { api_code: api || (name || '').toUpperCase(), game_type: String(gameType), is_mobile: 1 };
      if (code && code !== '0') {
        info.game_code = String(code);
      }

      that.$apiFun
        .post('/api/gamelogin', info)
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
