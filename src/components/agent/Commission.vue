<template>
  <div class="ag-page">
    <van-nav-bar class="ag-nav" title="佣金" left-arrow @click-left="$router.back()" />
    <div style="height: 46px"></div>

    <!-- 日期快捷 -->
    <div class="ag-presets">
      <div v-for="p in presets" :key="p.days" :class="['ag-preset', active === p.days ? 'on' : '']" @click="pick(p.days)">{{ p.label }}</div>
    </div>

    <!-- 佣金头卡 -->
    <div class="hero">
      <div class="hero-cell">
        <div class="hero-num">{{ n(d.yongjinsum) }}</div>
        <div class="hero-label">已发佣金</div>
      </div>
      <div class="hero-split"></div>
      <div class="hero-cell">
        <div class="hero-num">{{ n(d.waityongjinsum) }}</div>
        <div class="hero-label">待发佣金</div>
      </div>
    </div>

    <div class="ag-card">
      <div class="ag-card-title">团队规模</div>
      <div class="ag-row"><span class="k">团队会员数</span><span>{{ n(d.usersum) }}</span></div>
      <div class="ag-row"><span class="k">团队代理数</span><span>{{ n(d.agentsum) }}</span></div>
    </div>

    <div class="ag-card">
      <div class="ag-card-title">资金 / 投注</div>
      <div class="ag-row"><span class="k">充值金额 / 笔数</span><span>{{ n(d.all_recharge) }} / {{ n(d.rechage_times) }}</span></div>
      <div class="ag-row"><span class="k">提现金额 / 笔数</span><span>{{ n(d.all_withdraw) }} / {{ n(d.withdraw_times) }}</span></div>
      <div class="ag-row"><span class="k">有效投注</span><span>{{ n(d.all_valid_bet) }}</span></div>
      <div class="ag-row"><span class="k">团队输赢</span><span :class="win(d.all_win_loss)">{{ n(d.all_win_loss) }}</span></div>
      <div class="ag-row"><span class="k">返水</span><span>{{ n(d.all_fanshui) }}</span></div>
      <div class="ag-row"><span class="k">红包</span><span>{{ n(d.all_redpacket) }}</span></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AgentCommission',
  data() {
    return {
      d: {},
      active: -1, // -1 全部
      presets: [
        { label: '全部', days: -1 },
        { label: '今日', days: 0 },
        { label: '近7天', days: 7 },
        { label: '近30天', days: 30 },
      ],
    };
  },
  created() {
    this.load();
  },
  methods: {
    n(v) {
      return v == null || v === '' ? 0 : v;
    },
    win(v) {
      return Number(v) >= 0 ? 'ag-up' : 'ag-down';
    },
    fmt(dt) {
      return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0');
    },
    range(days) {
      if (days < 0) return { start: '', end: '' };
      let end = new Date();
      let start = new Date();
      start.setDate(start.getDate() - days);
      return { start: this.fmt(days === 0 ? end : start), end: this.fmt(end) };
    },
    pick(days) {
      this.active = days;
      this.load();
    },
    load() {
      let that = this;
      let r = that.range(that.active);
      that.$apiFun.post('/api/agent/commission', { start: r.start, end: r.end }).then(res => {
        if (res.code == 200) that.d = res.data || {};
        else that.$notify({ type: 'warning', message: res.message || '加载失败' });
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import './agentCommon.scss';
.hero {
  margin: 12px;
  border-radius: 14px;
  padding: 20px 14px;
  color: #fff;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #d9977a 0%, #cf866b 100%);
  box-shadow: 0 6px 16px rgba(207, 134, 107, 0.3);
}
.hero-cell {
  flex: 1;
  text-align: center;
}
.hero-split {
  width: 1px;
  height: 34px;
  background: rgba(255, 255, 255, 0.4);
}
.hero-num {
  font-size: 22px;
  font-weight: 700;
}
.hero-label {
  font-size: 12px;
  opacity: 0.85;
  margin-top: 4px;
}
</style>
