<template>
  <div id="app">
    <div v-if="!siteInMaintenance">
      <div class="meLoading" v-if="loading">
        <van-loading size="24px" vertical color="#0094ff" text-color="#0094ff">加载中...</van-loading>
      </div>
      <keep-alive>
        <router-view v-if="$route.meta.keepAlive" :key="$route.name" />
      </keep-alive>
      <router-view v-if="!$route.meta.keepAlive" :key="$route.name" />
    </div>
    <div v-else style="box-sizing: border-box; padding: 30px; font-size: 26px">{{ $store.state.appInfo.repair_tips }}</div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      daoTime: null,
      loading: false,
      pid: '',
    };
  },
  computed: {
    // 仅当后端明确返回维护状态(0 / '0')时才显示维护页;
    // 空值/未配置(如 site_state 为 '' 或 undefined)一律正常显示 app,避免误判为维护中导致白屏。
    siteInMaintenance() {
      let state = this.$store.state.appInfo.site_state;
      return state === 0 || state === '0';
    },
  },
  created() {
    let that = this;
    var query = that.$route.query;

    that.getApp();
    that.getGameList();
    that.getPlatList();

    if (sessionStorage.getItem('token')) {
      that.openDaoTime();
      that.getUserInfo();
    }
    if (query.pid) {
      that.pid = query.pid;
      that.$router.push({ path: `/login?type=1&pid=${query.pid}` });
    }
    that.getVisitUrl();
  },
  methods: {
    // 访问地址跳转:仅当后端确实返回了非空 url 才跳转(url 为空则不跳,避免跳成空白)
    getVisitUrl() {
      let that = this;
      that.$apiFun
        .get('/api/getVisitUrl', {})
        .then(res => {
          if (res.code == 200 && res.data && res.data.url) {
            let url = that.pid ? res.data.url + 'register?pid=' + that.pid : res.data.url;
            window.open(url, '_self');
          }
        })
        .catch(() => {});
    },
    // 获取游戏列表
    getGameList() {
      let that = this;

      that.$apiFun.get('/api/game/list', {}).then(res => {
        if (res.code == 200) {
          let list = Array.isArray(res.data) ? res.data : [];
          // category_id 为 NG 数字游戏类型(字符串"1"-"7":1视讯/2老虎机/3彩票/4体育/5电竞/6捕鱼/7棋牌),
          // 同时兼容旧字符串分类码(realbet/joker/...)。
          // 彩票(3)/体育(4)/电竞(5)无子游戏行,由 getPlatList 从 /api/all/plat 取平台大厅,这里不写
          let cateBucket = {
            1: 'realbetList', realbet: 'realbetList',
            2: 'conciseList', concise: 'conciseList',
            7: 'jokerList', joker: 'jokerList',
          };
          let buckets = { realbetList: [], jokerList: [], conciseList: [] };
          // game_lists 现为子游戏粒度(5000+行),首页磁贴是平台粒度:按(分类,平台)去重,
          // game_code 置空表示点击进平台大厅;子游戏列表由 concise 页按需拉取
          let seen = {};
          list.forEach(el => {
            let name = cateBucket[el.category_id];
            if (!name || el.app_state != 1) {
              return;
            }
            let key = name + ':' + el.platform_name;
            if (seen[key]) {
              return;
            }
            seen[key] = 1;
            buckets[name].push({ platform_name: el.platform_name, category_id: el.category_id, game_code: '' });
          });

          for (let name in buckets) {
            localStorage.setItem(name, JSON.stringify(buckets[name]));
          }
          that.$store.commit('changGameList');
        }
      });
    },
    // 彩票/体育/电竞为平台大厅粒度,数据源为启用平台列表 /api/all/plat
    // (方案A:依赖后端补齐 apis.game_type,NG 编号 3彩票/4体育/5电竞;未补齐前对应分区为空)
    getPlatList() {
      let that = this;
      that.$apiFun.get('/api/all/plat', {}).then(res => {
        if (res.code != 200) {
          return;
        }
        let rows = Array.isArray(res.data) ? res.data : [];
        let buckets = { lotteryList: '3', sportList: '4', gamingList: '5' };
        for (let name in buckets) {
          let digit = buckets[name];
          let list = rows
            .filter(el => {
              if (el.app_state != 1) {
                return false;
              }
              // game_type 兼容整型/字符串/逗号多值
              let gt = el.game_type == null ? '' : String(el.game_type);
              return gt.split(',').indexOf(digit) >= 0;
            })
            .map(el => ({
              platform_name: (el.plat_type || el.api_code || '').toLowerCase(),
              name: el.api_name,
              category_id: digit,
              game_code: '',
            }));
          localStorage.setItem(name, JSON.stringify(list));
        }
        that.$store.commit('changGameList');
      });
    },
    // 获取app
    getApp() {
      let that = this;
      that.$apiFun.post('/api/app', {}).then(res => {
        if (res.code == 200) {
          localStorage.setItem('appInfo', JSON.stringify(res.data));
          that.$store.commit('changappInfo');
          document.getElementsByTagName('title')[0].innerText = that.$store.state.appInfo.title;
        }
      });
    },
    // 退出登录
    outLogin() {
      let that = this;

      that.$dialog
        .confirm({
          title: '提示',
          message: '您确定要退出登录吗?',
        })
        .then(() => {
          that.showLoading();

          that.$apiFun
            .post('/api/logoff', {})
            .then(res => {
              localStorage.clear();
              sessionStorage.clear();
              that.$store.commit('changUserInfo');
              that.$store.commit('changToken');
              that.closeDaoTime();
              that.hideLoading();
              that.$router.push({ path: '/login' });
            })
            .catch(() => {
              localStorage.clear();
              sessionStorage.clear();
              // that.$cookies.remove('token' )/
              that.$store.commit('changUserInfo');
              that.$store.commit('changToken');
              that.closeDaoTime();
              that.hideLoading();
              that.$router.push({ path: '/login' });
            });
        })
        .catch(() => {});
    },
    // 打开游戏
    openGamePage(name, type, code) {
      let that = this;
      let token = sessionStorage.getItem('token') ? sessionStorage.getItem('token') : '';
      if (!token) {
        that.showTost(0, '请登录！');

        return;
      }
      that.goNav(`/gamePage?name=${name}&type=${type}&code=${code}`);
    },
    doCopy(msg) {
      let cInput = document.createElement('input');
      cInput.style.opacity = '0';
      cInput.value = msg;
      document.body.appendChild(cInput);
      // 选取文本框内容
      cInput.select();
      document.execCommand('copy');
      this.showTost(1, '复制成功！');
    },
    goNav(url) {
      let that = this;

      if (url == '/mine') {
        if (!that.$store.state.token) {
          this.$router.push({ path: '/login' });
        }
      }
      if (url == '/hongbao' || url == '/transfer') {
        if (!that.$store.state.token) {
          that.$dialog
            .confirm({
              message: '精彩内容等你来体验，快来登录吧！',
            })
            .then(() => {
              this.$router.push({ path: '/login' });
            });

          return;
        }
        if (url == '/hongbao' && that.$store.state.appInfo.redpacket_switch == 0) {
          that.showTost(0, '红包已关闭');
          return;
        }
      }
      if (url == this.$route.fullPath) {
        that.showTost(0, '已在当前页面！');
        return;
      }

      this.$router.push({ path: url });
    },
    closeDaoTime() {
      let that = this;
      if (that.daoTime != null) {
        clearInterval(that.daoTime);
      }
      that.daoTime = null;
    },
    // 不刷新页面更新用户余额
    getBalance() {
      let that = this;
      that.$apiFun
        .post('/api/balance', {})
        .then(res => {
          if (res.code == 200) {
            let userInfo = JSON.parse(localStorage.getItem('userInfo'));
            userInfo.balance = res.data.balance;
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
            that.$store.commit('changUserInfo');
          }
          if (res.code == 401) {
            localStorage.clear();
            sessionStorage.clear();
            that.$store.commit('changUserInfo');
            that.$store.commit('changToken');
            that.closeDaoTime();
            that.$router.push({ path: '/login' });
          }
        })
        .catch(res => {});
    },
    openDaoTime() {
      let that = this;
      that.daoTime = setInterval(() => {
        that.getBalance();
      }, 4300);
    },
    // 不刷新页面跟新用户信息
    getUserInfo() {
      let that = this;
      that.$apiFun.get('/api/me', {}).then(res => {
        if (res.code === 200) {
          let userInfo = res.data;
          let str = userInfo.current_vip || '';
          let index = str.indexOf('P');
          let vip = index >= 0 ? str.substr(index + 1) : userInfo.vip || 0; //04
          userInfo.vip = vip;
          localStorage.setItem('userInfo', JSON.stringify(userInfo));
          that.userInfo = userInfo;
          that.$store.commit('changUserInfo');
        }
      });
    },
    // 刷新页面更新信息
    getUserInfoShowLoding() {
      let that = this;
      that.showLoading();
      that.$apiFun.get('/api/me', {}).then(res => {
        if (res.code === 200) {
          let userInfo = res.data;
          let str = userInfo.current_vip || '';
          let index = str.indexOf('P');
          let vip = index >= 0 ? str.substr(index + 1) : userInfo.vip || 0; //04
          userInfo.vip = vip;
          localStorage.setItem('userInfo', JSON.stringify(userInfo));
          that.userInfo = userInfo;
          that.$store.commit('changUserInfo');
          that.hideLoading();
        }
      });
    },
    // 获取代理:跳外部代理系统(地址由后端 /api/getAgentLoginUrl 返回)
    getAgentLoginUrl() {
      let that = this;
      that.$parent.goNav(`/gamePage?dailiD=1`);
    },
    openKefu() {
      let that = this;
      that.goNav(`/kefu`);
    },
    showTost(type, title) {
      let str = type ? 'success' : 'danger';
      this.$notify({ type: str, message: title });
    },
    showLoading() {
      this.loading = true;
    },
    hideLoading() {
      this.loading = false;
    },
  },
  mounted() {},
  beforeDestroy() {
    let that = this;
    if (that.daoTime) {
      clearInterval(that.daoTime);
    }
    that.daoTime = null;
  },
};
</script>

<style>
/* @import '../static/css/registermember.css';
 @import '../static/css/registermember.css';
 @import '../static/css/registermember.css';
 @import '../static/css/registermember.css'; */

.meLoading {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
}
.van-dialog__confirm,
.van-dialog__confirm:active {
  color: #069b71;
}

.step .van-tab--active {
  color: #fff;
  background: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUwIiBoZWlnaHQ9IjM2IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0wIDB2MzZoMjQwLjgzN0wyNTAgMThsLTkuMTYzLTE4eiIgZmlsbD0iIzA2OUI3MSIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+) no-repeat 100% / cover;
}

.step .van-tabs--line .van-tabs__wrap {
  height: 27px;
}
.metransRecord .van-tabs__nav--card .van-tab.van-tab--active {
  color: #fff;
  background-color: #069b71;
  border-radius: 22px;
}
.metransRecord .van-tabs__nav--card {
  border: none;
}
.metransRecord .van-tabs__nav--card .van-tab {
  border: none;
}
.metransRecord .van-tabs__nav--card .van-tab {
  color: #000;
}

/* 页眉 */

.pageTop {
  background-color: #ede9e7;
  color: rgb(0, 0, 0);
  text-align: center;
  font-size: 16px;
  font-weight: 700;
  height: 40px;
  line-height: 40px;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 200;
  /* 刘海屏/全屏(PWA)安全区:普通浏览器 env()=0,不影响现有布局 */
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
}

.acts .van-tabs__line {
  background-color: #cf886b !important;
}
.acts .van-tab--active {
  color: #cf886b !important;
}

.van-nav-bar .van-icon {
  color: #000;
}
.van-nav-bar {
  background-color: #ede9e7;
  /* 刘海屏/全屏(PWA)安全区,等效 vant 的 safe-area-inset-top;普通浏览器 env()=0,不影响现有布局 */
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
}
.van-nav-bar__arrow {
  font-size: 24px;
}
.van-nav-bar__title {
  font-weight: 700;
}

.bancgs {
  position: fixed;
  top: 10px;
  left: 10px;
  width: 30px;
  opacity: 0.8;
  z-index: 200;
}
p {
  margin-block-start: 5px !important;
  margin-block-end: 5px !important;
}
.inputsw {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  z-index: 999;
  cursor: pointer;
}
.van-tab--active {
  color: #108ee9;
}
.van-tabs__line {
  background-color: #108ee9;
}
.van-cell {
  padding: 5px 8px;
}
.sdg .van-field__label {
  width: 0.2rem;
}
[class*='van-hairline']:after {
  border: none;
}
.sdgg .van-popup {
  border-radius: 15px 15px 0 0;
}

.stddss .van-field__control {
  font-size: 0.5rem;
}

.van-button--info {
  color: #fff;
  background-color: #cf866b;
  border: 1px solid #cf866b;
}
</style>
