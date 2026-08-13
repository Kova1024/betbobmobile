<template>
  <div style="width: 100%; min-height: 100vh; background: rgb(237, 241, 255)">
    <van-nav-bar style="position: fixed; top: 0; left: 0; width: 100%; background-color: #ede9e7" :title="title" left-arrow @click-left="$router.back()" />
    <div style="height: 46px"></div>
    <!-- 两层结构第二层:平台子游戏列表(game/list?platform&category),点游戏进 getGameUrl -->
    <div class="gameGrid" v-if="list.length > 0">
      <div class="gameCard" v-for="(item, index) in list" :key="index" @click="$parent.openGamePage(platform, category, item.game_code)">
        <img v-if="item.game_icon" :src="item.game_icon" alt="" />
        <div v-else class="noIcon">{{ item.name }}</div>
        <p>{{ item.name }}</p>
      </div>
    </div>
    <div v-else style="margin-top: 60px; text-align: center">
      <img src="/static/image/mescroll-empty.png" style="width: 35%" alt="" />
      <van-divider dashed :style="{ color: '#ccc', borderColor: '#ccc', padding: '20px ' }">空空如也</van-divider>
    </div>
  </div>
</template>
<script>
export default {
  name: 'gameList',
  data() {
    return { list: [], platform: '', category: '', title: '' };
  },
  created() {
    let that = this;
    let query = that.$route.query;
    that.platform = query.platform || '';
    that.category = query.category || '';
    that.title = query.title || (query.platform || '').toUpperCase();
    that.getList();
  },
  methods: {
    getList() {
      let that = this;
      that.$parent.showLoading();
      that.$apiFun
        .get('/api/game/list', { platform: that.platform, category: that.category })
        .then(res => {
          if (res.code != 200) {
            that.$parent.showTost(0, res.message);
          }
          if (res.code == 200) {
            let list = Array.isArray(res.data) ? res.data : [];
            that.list = list.filter(el => el.app_state == 1);
          }
          that.$parent.hideLoading();
        })
        .catch(() => {
          that.$parent.hideLoading();
        });
    },
  },
};
</script>
<style lang="scss" scoped>
.gameGrid {
  display: flex;
  flex-wrap: wrap;
  box-sizing: border-box;
  padding: 8px 8px 30px;
}
.gameCard {
  width: 31%;
  margin: 1.16%;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  img {
    width: 100%;
    display: block;
    min-height: 60px;
  }
  .noIcon {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 90px;
    color: #cf866b;
    font-size: 13px;
    font-weight: 700;
    background: linear-gradient(135deg, #fdf6f1, #f3e3d7);
    padding: 4px;
    text-align: center;
    box-sizing: border-box;
  }
  p {
    font-size: 12px;
    text-align: center;
    color: #333;
    padding: 4px 2px;
    margin: 0 !important;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
