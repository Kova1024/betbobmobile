<template>
  <div class="agent-page">
    <van-nav-bar class="agent-nav" title="代理中心" left-arrow @click-left="$router.back()" />
    <div style="height: 46px"></div>

    <!-- 今日团队概览(渐变头卡) -->
    <div class="hero">
      <div class="hero-title">今日团队概览</div>
      <div class="hero-grid">
        <div class="hero-cell">
          <div class="hero-num">{{ fmt(today.all_recharge) }}</div>
          <div class="hero-label">今日充值</div>
        </div>
        <div class="hero-cell">
          <div class="hero-num">{{ fmt(today.all_withdraw) }}</div>
          <div class="hero-label">今日提现</div>
        </div>
        <div class="hero-cell">
          <div class="hero-num">{{ fmt(today.all_bet) }}</div>
          <div class="hero-label">今日投注</div>
        </div>
        <div class="hero-cell">
          <div class="hero-num">{{ fmt(today.all_valid_bet) }}</div>
          <div class="hero-label">有效投注</div>
        </div>
        <div class="hero-cell">
          <div class="hero-num" :class="{ up: num(today.win_loss) >= 0, down: num(today.win_loss) < 0 }">{{ fmt(today.win_loss) }}</div>
          <div class="hero-label">今日输赢</div>
        </div>
        <div class="hero-cell">
          <div class="hero-num">{{ num(today.add_member_count) }}</div>
          <div class="hero-label">今日新增</div>
        </div>
      </div>
    </div>

    <!-- 团队人数 -->
    <div class="card">
      <div class="card-title">团队人数</div>
      <div class="count-row">
        <div class="count-cell">
          <div class="count-num">{{ num(today.directly_member_count) }}</div>
          <div class="count-label">直属会员</div>
        </div>
        <div class="count-cell">
          <div class="count-num">{{ num(today.directly_agent_count) }}</div>
          <div class="count-label">直属代理</div>
        </div>
        <div class="count-cell">
          <div class="count-num">{{ num(today.child_member_count) }}</div>
          <div class="count-label">团队会员</div>
        </div>
        <div class="count-cell">
          <div class="count-num">{{ num(today.child_agent_count) }}</div>
          <div class="count-label">团队代理</div>
        </div>
      </div>
    </div>

    <!-- 功能入口 -->
    <div class="card">
      <div class="card-title">代理功能</div>
      <div class="grid">
        <div class="grid-item" v-for="(m, i) in menus" :key="i" @click="go(m)">
          <div class="grid-icon" :style="{ background: m.color }">
            <van-icon :name="m.icon" />
          </div>
          <div class="grid-label">{{ m.label }}</div>
        </div>
      </div>
    </div>

    <div style="height: 30px"></div>
  </div>
</template>

<script>
export default {
  name: 'AgentCenter',
  data() {
    return {
      today: {},
      // 已建成的页面放进 built,未建的点击提示“即将上线”
      built: ['/agent'],
      menus: [
        { label: '佣金', icon: 'gold-coin-o', color: '#f5a623', path: '/agent/commission' },
        { label: '盈亏', icon: 'bar-chart-o', color: '#e64340', path: '/agent/profit' },
        { label: '下线', icon: 'friends-o', color: '#1989fa', path: '/agent/downline' },
        { label: '代开会员', icon: 'add-o', color: '#07c160', path: '/agent/add-member' },
        { label: '代充', icon: 'balance-o', color: '#ff976a', path: '/agent/recharge' },
        { label: '改返水', icon: 'exchange', color: '#7232dd', path: '/agent/rebate-set' },
        { label: '团队日志', icon: 'orders-o', color: '#00b8d4', path: '/agent/logs' },
      ],
    };
  },
  created() {
    this.getToday();
  },
  methods: {
    num(v) {
      return v == null || v === '' ? 0 : v;
    },
    // 金额类保留原样显示(后端已是数值),空值显示 0
    fmt(v) {
      return v == null || v === '' ? 0 : v;
    },
    getToday() {
      this.$apiFun
        .post('/api/agent/today', {})
        .then(res => {
          if (res.code == 200) {
            this.today = res.data || {};
          } else {
            this.$notify({ type: 'warning', message: res.message || '获取概览失败' });
          }
        })
        .catch(() => {});
    },
    go(m) {
      if (this.built.indexOf(m.path) !== -1) {
        this.$router.push(m.path);
      } else {
        this.$notify({ type: 'primary', message: m.label + ' · 即将上线' });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.agent-page {
  width: 100%;
  min-height: 100vh;
  background: #f3f4f7;
  padding-bottom: 20px;
}
.agent-nav {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #ede9e7;
  z-index: 20;
}

/* 渐变头卡 */
.hero {
  margin: 12px;
  border-radius: 14px;
  padding: 18px 14px 8px;
  color: #fff;
  background: linear-gradient(135deg, #d9977a 0%, #cf866b 100%);
  box-shadow: 0 6px 16px rgba(207, 134, 107, 0.3);
}
.hero-title {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 12px;
}
.hero-grid {
  display: flex;
  flex-wrap: wrap;
}
.hero-cell {
  width: 33.33%;
  text-align: center;
  margin-bottom: 14px;
}
.hero-num {
  font-size: 17px;
  font-weight: 700;
  line-height: 1.2;
}
.hero-num.up {
  color: #fff2c2;
}
.hero-num.down {
  color: #ffd7d2;
}
.hero-label {
  font-size: 11px;
  opacity: 0.85;
  margin-top: 3px;
}

/* 白卡片 */
.card {
  margin: 12px;
  background: #fff;
  border-radius: 12px;
  padding: 14px;
}
.card-title {
  font-size: 14px;
  font-weight: 700;
  color: #333;
  margin-bottom: 12px;
}

.count-row {
  display: flex;
}
.count-cell {
  flex: 1;
  text-align: center;
}
.count-num {
  font-size: 18px;
  font-weight: 700;
  color: #cf866b;
}
.count-label {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
}

/* 功能九宫格 */
.grid {
  display: flex;
  flex-wrap: wrap;
}
.grid-item {
  width: 25%;
  text-align: center;
  margin-bottom: 8px;
}
.grid-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  margin: 0 auto 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 22px;
}
.grid-label {
  font-size: 12px;
  color: #555;
}
</style>
