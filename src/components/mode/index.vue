<template>
  <div v-if="bannerList.length > 0">
    <div id="redPacket" v-if="$store.state.appInfo.redpacket_switch == 1 && hongbashow">
      <i @click="$parent.goNav('/hongbao')" class="grab"></i>
      <img @click="changhongbashow" src="/static/image/hongbaocolse.png" />
    </div>
    <div class="appbox" v-if="appshow">
      <img class="colse" @click="appshow = false" src="/static/image/hongbaocolse.png" alt="" />
      <img class="logo" v-if="$store.state.appInfo.site_logo" :src="$store.state.appInfo.site_logo" alt="" />
      <img class="logo" v-else src="/static/image/app-logo.png" alt="" />
      <div class="testz">
        <div class="tit">{{ $store.state.appInfo.title }}app</div>
        <div class="cx">真人娱乐，体育投注，电子游艺等尽在一手掌握</div>
      </div>
      <van-button type="info" style="background: url(/static/image/btnBg.png) no-repeat; background-size: 100% 100%; font-size: 0.24rem; border: none; border-radius: 6px; height: 0.6rem" @click="$parent.goNav('/app')">立即下载</van-button>
      <!-- btnBg.png -->
    </div>
    <div style="position: relative">
      <div class="homeHeder">
        <img class="leftImg" @click="changleftshow" src="/static/image/home_muen.png" alt="" />
        <div class="rbox" @click="$parent.openKefu">
          <img src="/static/image/home_service.png" alt="" />
          客服
        </div>
      </div>
      <van-swipe @change="onChange">
        <van-swipe-item v-for="(item, index) in bannerList" :key="index">
          <img :src="item.src" style="width: 100%" alt="" />
        </van-swipe-item>
        <template #indicator>
          <div class="swiper-dots">
            <div class="num">{{ current + 1 }}</div>
            <div class="sign">/</div>
            <div class="num">4</div>
          </div>
        </template>
      </van-swipe>
    </div>

    <!-- 公告 -->
    <div style="background-color: #ede9e7; padding: 6px 0 0" v-if="homenoticelis.length > 0">
      <div class="gonggao">
        <img style="width: 20px" src="/static/image/home_notice.66939586521463adbe87e2a72aa8ecad.png" alt="" />
        <div style="flex: 1">
          <van-notice-bar color="#cf866b" background="#ede9e7" scrollable
            ><span v-for="(item, index) in homenoticelis" @click="openGogao(item)" :key="index">{{ item }}</span></van-notice-bar
          >
        </div>
        <img @click="$parent.goNav('/message')" style="width: 68px" src="/static/image/home_hotsports.718f002d63ddbf2c3902907f2226a28b.png" alt="" />
      </div>
    </div>
    <!-- 公告 -->
    <div class="domainModal_domainView__FWCzg" v-if="goInfo">
      <div class="domainModal_mask__24Y2m domainModal_fadeIn__1I3AS false" @click="goInfo = null"></div>
      <div class="domainModal_content__1nBgc" style="width: 80%">
        <img src="/static/image/hongbaocolse.png" @click="goInfo = null" style="position: absolute; top: 5px; right: 13px; width: 0.7rem" alt="" />

        <div class="domainModal_middle__3gQPm" style="padding: 35px 10px 15px">
          {{ goInfo }}

          <van-button type="info" style="margin: 0 auto; margin-top: 20px; width: 120px; border-radius: 10px; height: 35px" @click="$parent.goNav('/message')">更多公告</van-button>
        </div>
      </div>
    </div>
    <!-- 用户信息栏 -->
    <div class="xiding">
      <div class="caosuo">
        <div class="lefsg" v-if="$store.state.token">
          <div class="name">{{ $store.state.userInfo.username }}</div>
          <div class="mey"><span>￥</span>{{ $store.state.userInfo.balance }}</div>
        </div>
        <div v-else class="lefsg" @click="$parent.goNav('/login')">
          <div class="name">未登录</div>
          <div class="mey">登录后查看</div>
        </div>
        <div class="riggs">
          <div class="lisImg" @click="$parent.goNav('/recharge')">
            <img src="/static/style/feature_moneydraw.cbeb513bc9fd00ecc5372fc0e54a84c0.png" alt="" />
            存款
          </div>
          <div class="lisImg" @click="$parent.goNav('/transfer')">
            <img src="/static/style/feature_moneytransfer.bbfbe4e344c0e5f91eabadd9e20b1613.png" alt="" />
            转账
          </div>
          <div class="lisImg" @click="$parent.goNav('/withdrawal')">
            <img src="/static/style/feature_moneysave.4b60fbaf4ee368d1e7060133f62690c9.png" alt="" />
            取款
          </div>
          <div class="lisImg" @click="$parent.goNav('/vip')">
            <img src="/static/style/feature_vip.16d90880db727a342209f4439a9b3a12.png" alt="" />
            VIP
          </div>
        </div>
      </div>
    </div>
    <!-- 游戏栏 -->
    <div class="gameBoxs">
      <div class="lfst">
        <div :class="gameType == 0 ? 'ls active' : 'ls'" @click="changGameType(0)">
          <img :src="`/static/style/${gameType == 0 ? 'sidebar_casino_icon_select' : 'sidebar_casino_icon_nor'}.png`" alt="" />
          <span>真人</span>
        </div>
        <div :class="gameType == 1 ? 'ls active' : 'ls'" @click="changGameType(1)">
          <img :src="`/static/style/${gameType == 1 ? 'sidebar_sports_icon_select' : 'sidebar_sports_icon_nor'}.png`" alt="" />

          <span>体育</span>
        </div>
        <div :class="gameType == 2 ? 'ls active' : 'ls'" @click="changGameType(2)">
          <img :src="`/static/style/${gameType == 2 ? 'sidebar_esports_icon_select' : 'sidebar_esports_icon_nor'}.png`" alt="" />

          <span>电竞</span>
        </div>
        <div :class="gameType == 3 ? 'ls active' : 'ls'" @click="changGameType(3)">
          <img :src="`/static/style/${gameType == 3 ? 'sidebar_board_icon_select' : 'sidebar_board_icon_nor'}.png`" alt="" />

          <span>棋牌</span>
        </div>
        <div :class="gameType == 4 ? 'ls active' : 'ls'" @click="changGameType(4)">
          <img :src="`/static/style/${gameType == 4 ? 'sidebar_slot_icon_select' : 'sidebar_slot_icon_nor'}.png`" alt="" />

          <span>电子</span>
        </div>
        <div :class="gameType == 5 ? 'ls active' : 'ls'" @click="changGameType(5)">
          <img :src="`/static/style/${gameType == 5 ? 'sidebar_lottery_icon_select' : 'sidebar_lottery_icon_nor'}.png`" alt="" />

          <span>彩票</span>
        </div>
      </div>
      <!-- 天美社区源码网 timibbs.net timibbs.com timibbs.vip -->
      <div class="rigts" v-if="gameType == 0">
        <img class="" v-for="(item, index) in $store.state.realbetList" :key="index" @click="$parent.openGamePage(item.platform_name, item.game_code, '')" :src="`/static/image/realbet/${item.platform_name}.png`" alt="" />
      </div>
      <div class="rigts" v-if="gameType == 1">
        <img class="" v-for="(item, index) in $store.state.sportList" :key="index" @click="$parent.openGamePage(item.platform_name, item.game_code, '')" :src="`/static/image/sport/${item.platform_name}.png`" alt="" />
      </div>
      <div class="rigts" v-if="gameType == 2">
        <img class="" v-for="(item, index) in $store.state.gamingList" :key="index" @click="$parent.openGamePage(item.platform_name, item.game_code, '')" :src="`/static/image/gaming/${item.platform_name}.png`" alt="" />
      </div>
      <div class="rigts" v-if="gameType == 3">
        <img class="" v-for="(item, index) in $store.state.jokerList" :key="index" @click="$parent.openGamePage(item.platform_name, item.game_code, '')" :src="`/static/image/joker/${item.platform_name}.png`" alt="" />
      </div>
      <div class="rigts" v-if="gameType == 4">
        <img class="" @click="$parent.goNav('/concise?type=obgdy')" src="/static/image/concise/obgdy.png" alt="" />
        <img class="" @click="$parent.goNav('/concise?type=fgdz')" src="/static/image/concise/fgdz.png" alt="" />
        <img class="" @click="$parent.goNav('/concise?type=pp')" src="/static/image/concise/pp.png" alt="" />
        <img class="" @click="$parent.goNav('/concise?type=ae')" src="/static/image/concise/ae.png" alt="" />
        <img class="" v-for="(item, index) in $store.state.conciseList" :key="index" @click="$parent.openGamePage(item.platform_name, item.game_code, '')" :src="`/static/image/concise/${item.platform_name}.png`" alt="" />
      </div>
      <div class="rigts" v-if="gameType == 5">
        <img
          class=""
          v-for="(item, index) in $store.state.lotteryList"
          :key="index"
          @click="$parent.openGamePage(item.platform_name, item.game_code, '')"
          :style="item.platform_name == 'vrbet' ? 'width:100%' : ''"
          :src="`/static/image/lottery/${item.platform_name == 'ig' ? item.game_code : item.platform_name}.png`"
          alt=""
        />
      </div>
    </div>

    <!-- 弹出层 -->
    <van-popup v-model="leftshow" position="left" :style="{ height: '100%' }">
      <div class="leftbox">
        <div class="side__main__1NhyG">
          <h3>Hi，欢迎进入{{ $store.state.appInfo.title }}</h3>
          <dl class="side__vip__1dW8w">
            <div class="topxs">专属VIP体验</div>
            <p>立享会员特权</p>
            <p>享受只属于你的与众不同</p>
            <dd @click="$parent.goNav('/vip')">会员中心</dd>
          </dl>
          <ul>
            <li v-if="$store.state.token" @click="$parent.goNav('/message')"><img src="/static/image/meunIcon.39f38dc98ad956615952d485d0e6af04.svg" />消息中心<span class="side__subtitle__3QtYC"></span></li>
            <li @click="$parent.openKefu"><img src="/static/image/meunIcon2.5d0d78496889fb8b027f603254286fdf.svg" />意见反馈<span class="side__subtitle__3QtYC"></span></li>
            <li @click="doCopy($store.state.appInfo.h5_url)">
              <img src="/static/image/menuIcon5.5687ef4d1512d53aa3535e3b1088fe70.png" />永久域名<span class="side__subtitle__3QtYC">{{ $store.state.appInfo.h5_url }}</span>
            </li>
            <li @click="$parent.goNav('/abouts')"><img src="/static/image/meunIcon3.c51bbb9ebece978f1976397ab12acba7.svg" />关于我们<span class="side__subtitle__3QtYC"></span></li>
          </ul>
          <div class="nisd" v-if="!$store.state.token" @click="$parent.goNav('/login')">立即登录</div>
          <div class="nisd" v-else @click="$parent.outLogin"><img src="/static/image/tuichu.93c1b9e3d4b4a7772481916ca32c074f.svg" />安全退出</div>
        </div>
      </div>
    </van-popup>

    <!-- 官网弹窗 -->
    <div class="domainModal_domainView__FWCzg" v-if="$store.state.appInfo.index_modal == 1 && tanshow">
      <div class="domainModal_mask__24Y2m domainModal_fadeIn__1I3AS false" @click="changtanshow"></div>
      <div class="domainModal_content__1nBgc" style="width: 80%">
        <div id="domain" class="domainModal_contentTop__2C4jc">
          <img src="/static/image/hongbaocolse.png" @click="changtanshow" style="position: absolute; top: 5px; right: 13px; width: 0.6rem" alt="" />

          <div class="domainModal_top__1omYS">欢迎来到{{ $store.state.appInfo.title }}</div>
          <div class="domainModal_middle__3gQPm" v-html="$store.state.appInfo.webcontent"></div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'index',
  data() {
    return {
      hongbashow: true,
      appShow: true,
      current: 0,
      bannerList: [],
      homenoticelis: [],
      // 弹出层
      leftshow: false,
      activeKey: 0,
      gameType: 0,
      tanshow: true,
      appshow: true,
      goInfo: null,
    };
  },
  created() {
    let that = this;
    that.getBanList();
    that.homenotice(); //获取公告
  },
  methods: {
    openGogao(val) {
      this.goInfo = val;
    },
    changtanshow() {
      this.tanshow = !this.tanshow;
    },
    changGameType(type) {
      this.gameType = type;
    },
    doCopy(msg) {
      let cInput = document.createElement('input');
      cInput.style.opacity = '0';
      cInput.value = msg;
      document.body.appendChild(cInput);
      // 选取文本框内容
      cInput.select();

      // 执行浏览器复制命令
      // 复制命令会将当前选中的内容复制到剪切板中（这里就是创建的input标签）
      // Input要在正常的编辑状态下原生复制方法才会生效
      document.execCommand('copy');

      // 复制成功后再将构造的标签 移除
      this.$parent.showTost(1, '复制成功！');
    },
    changleftshow() {
      this.leftshow = !this.leftshow;
    },
    getBanList() {
      let that = this;
      that.$parent.showLoading();
      that.$apiFun
        .post('/api/bannerList', { type: 2 })
        .then(res => {
          if (res.code != 200) {
            that.showTost(0, res.message);
          }
          if (res.code == 200) {
            that.bannerList = res.data;
          }
          that.$parent.hideLoading();
        })
        .catch(res => {
          that.$parent.hideLoading();
        });
    },
    homenotice() {
      let that = this;
      that.$apiFun.post('/api/homenotice', {}).then(res => {
        if (res.code != 200) {
          that.showTost(0, res.message);
        }
        if (res.code == 200) {
          that.homenoticelis = res.data;
          that.ok = true;
        }
      });
    },
    onChange(index) {
      this.current = index;
    },
    changhongbashow() {
      this.hongbashow = false;
    },
    changappShow() {
      this.appShow = false;
    },
  },
  mounted() {
    let that = this;
  },
  updated() {
    let that = this;
  },
  beforeDestroy() {},
};
</script>
<style lang="scss" scoped>
@import '../../../static/css/2d87bbdbffeb4734e5c7.css';
.domainModal_content__1nBgc {
  overflow: auto;
}
// 轮播样式
.swiper-dots {
  display: flex;
  position: absolute;
  left: 40px;
  bottom: 10px;
  width: 48px;
  height: 24px;
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAABkCAYAAADDhn8LAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTMyIDc5LjE1OTI4NCwgMjAxNi8wNC8xOS0xMzoxMzo0MCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OTk4MzlBNjE0NjU1MTFFOUExNjRFQ0I3RTQ0NEExQjMiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OTk4MzlBNjA0NjU1MTFFOUExNjRFQ0I3RTQ0NEExQjMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbmRvd3MpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6Q0E3RUNERkE0NjExMTFFOTg5NzI4MTM2Rjg0OUQwOEUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6Q0E3RUNERkI0NjExMTFFOTg5NzI4MTM2Rjg0OUQwOEUiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4Gh5BPAAACTUlEQVR42uzcQW7jQAwFUdN306l1uWwNww5kqdsmm6/2MwtVCp8CosQtP9vg/2+/gY+DRAMBgqnjIp2PaCxCLLldpPARRIiFj1yBbMV+cHZh9PURRLQNhY8kgWyL/WDtwujjI8hoE8rKLqb5CDJaRMJHokC6yKgSCR9JAukmokIknCQJpLOIrJFwMsBJELFcKHwM9BFkLBMKFxNcBCHlQ+FhoocgpVwwnv0Xn30QBJGMC0QcaBVJiAMiec/dcwKuL4j1QMsVCXFAJE4s4NQA3K/8Y6DzO4g40P7UcmIBJxbEesCKWBDg8wWxHrAiFgT4fEGsB/CwIhYE+AeBAAdPLOcV8HRmWRDAiQVcO7GcV8CLM8uCAE4sQCDAlHcQ7x+ABQEEAggEEAggEEAggEAAgQACASAQQCCAQACBAAIBBAIIBBAIIBBAIABe4e9iAe/xd7EAJxYgEGDeO4j3EODp/cOCAE4sYMyJ5cwCHs4rCwI4sYBxJ5YzC84rCwKcXxArAuthQYDzC2JF0H49LAhwYUGsCFqvx5EF2T07dMaJBetx4cRyaqFtHJ8EIhK0i8OJBQxcECuCVutxJhCRoE0cZwMRyRcFefa/ffZBVPogePihhyCnbBhcfMFFEFM+DD4m+ghSlgmDkwlOgpAl4+BkkJMgZdk4+EgaSCcpVX7bmY9kgXQQU+1TgE0c+QJZUUz1b2T4SBbIKmJW+3iMj2SBVBWz+leVfCQLpIqYbp8b85EskIxyfIOfK5Sf+wiCRJEsllQ+oqEkQfBxmD8BBgA5hVjXyrBNUQAAAABJRU5ErkJggg==);
  background-size: 100% 100%;
}
.swiper-dots .num {
  width: 24px;
  height: 24px;
  border-radius: 50px;
  font-size: 16px;
  color: #fff;
  text-align: center;
  line-height: 24px;
}
.swiper-dots .sign {
  position: absolute;
  top: 0;
  left: 50%;
  line-height: 24px;
  font-size: 8px;
  color: #fff;
  -webkit-transform: translateX(-50%);
  transform: translateX(-50%);
}
// 主页头部标题

.homeHeder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  display: flex;
  box-sizing: border-box;
  padding: 0 30px;
  z-index: 999;
  align-items: center;
  justify-content: space-between;
  .leftImg {
    width: 19px;
    height: 19px;
  }
  .rbox {
    display: flex;
    height: 100%;
    align-items: center;
    font-size: 0.24rem;
    font-family: PingFangSC-Regular, sans-serif;
    img {
      width: 32px;
      height: 32px;
    }
  }
}
.leftbox {
  width: 7.5rem;
  height: 100%;
  background-color: #ede9e7;
  color: #cf866b;
  .side__main__1NhyG {
    box-sizing: border-box;
    padding: 0 20px;
    h3 {
      font-size: 20px;
      font-weight: 400;
      margin: 0;
      padding-top: 72px;
    }
    .side__vip__1dW8w {
      background: url(/static/style/sidebr_vip_card.1ce7485811699286f87aae1827de7acf.png) no-repeat;
      background-size: 100% 100%;
      box-sizing: border-box;
      padding: 20px;
      color: #fff;
      position: relative;
      p {
        color: hsla(0, 0%, 100%, 0.6);
        font-size: 12px;
        margin: 5px 0 0 0;
      }
      .topxs {
        font-size: 16px;
      }
      dd {
        float: right;
        border: 0.02rem solid #fff;
        border-radius: 0.24rem;
        height: 0.48rem;
        line-height: 0.48rem;
        width: 1.88rem;
        text-align: center;
        font-size: 10px;
        position: absolute;
        top: 20px;
        right: 20px;
      }
    }
  }
  ul {
    list-style: none;
    margin-top: 0.36rem;
    li {
      display: block;
      line-height: 0.96rem;
      height: 0.96rem;
      border-bottom: 0.02rem solid #e6ebf6;
      color: #4e6693;
      font-size: 0.28rem;
      padding: 0 0.14rem;
      img {
        width: 0.36rem;
        vertical-align: middle;
        margin: -0.04rem 0.24rem 0 0;
      }
      span {
        float: right;
      }
    }
  }
  .nisd {
    position: absolute;
    width: 4.72rem;
    height: 0.8rem;
    line-height: 0.8rem;
    left: 0.9rem;
    bottom: 1rem;
    background: #dfe5ff;
    border-radius: 0.4rem;
    border: 0;
    color: #4e6693;
    font-size: 0.28rem;
    display: flex;
    justify-content: center;
    align-items: center;
    img {
      vertical-align: middle;
      margin: -0.04rem 0.08rem 0 -0.08rem;
      width: 0.32rem;
    }
  }
}
.gonggao {
  width: 90%;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.caosuo {
  color: #cf866b;
  width: 90%;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .lefsg {
    flex: 1;
    .name {
      font-size: 12px;
    }
    .mey {
      margin-top: 3px;
      font-size: 16px;
      font-weight: 700;
      span {
        font-size: 10px;
        font-weight: 400;
      }
    }
  }
  .riggs {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .lisImg {
      width: 56px;
      text-align: center;
      font-size: 12px;
      img {
        width: 60%;
        display: block;
        margin: 0 auto;
      }
    }
  }
}
.xiding {
  background-color: #ede9e7;
  padding: 6px 0;
  position: sticky;
  position: -webkit-sticky;
  top: 0;
}

// 游戏
.gameBoxs {
  background: #ede9e7;
  -webkit-box-shadow: inset 0 0.08rem 0.16rem rgb(227 170 150 / 50%);
  box-shadow: inset 0 0.08rem 0.16rem rgb(227 170 150 / 50%);
  box-sizing: border-box;
  padding: 10px;
  color: #cf866b;
  height: 518px;
  display: flex;
  justify-content: space-between;
  .lfst {
    width: 36px;
    height: 400px;
    background: #eff3ff;
    border-radius: 20px;
    border: 1px solid #fff;
    .ls.active {
      color: #fff;
      background: #cf866b;
    }
    .ls {
      text-align: center;
      border-radius: 20px;
      padding: 7px 0;
      img {
        width: 30px;
        display: block;
        margin: 0 auto;
      }
      span {
        font-size: 12px;
        display: block;
      }
    }
  }
  .rigts {
    flex: 1;
    overflow: auto;
    height: 420px;
    box-sizing: border-box;
    padding: 0 12px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    img {
      width: 48%;
      border-radius: 10px;
      margin-top: 10px;
    }
  }
}
// app下载
.appbox {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 1.8rem;
  box-sizing: border-box;
  padding-right: 15px;
  .colse {
    width: 0.4rem;
    margin-left: 0.1rem;
  }
  .logo {
    width: 1rem;
    margin: 0 0.2rem;
  }
  .testz {
    flex: 1;
    .tit {
      font-size: 0.23rem;
      font-weight: 700;
    }
    .cx {
      font-size: 0.2rem;
      color: #ccc;
    }
  }
}
</style>
