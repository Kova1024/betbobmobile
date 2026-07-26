<template>
  <div class="ag-page">
    <van-nav-bar class="ag-nav" title="盈亏" left-arrow @click-left="$router.back()" />
    <div style="height: 46px"></div>

    <div class="ag-presets">
      <div v-for="p in presets" :key="p.days" :class="['ag-preset', active === p.days ? 'on' : '']" @click="pick(p.days)">{{ p.label }}</div>
    </div>

    <van-list v-model="loading" :finished="finished" finished-text="没有更多了" @load="onLoad" :immediate-check="false">
      <div class="ag-item" v-for="(item, i) in list" :key="i">
        <div class="ag-item-hd">
          <span class="name">{{ item.username }}</span>
          <span :class="win(item.all_win_loss)">输赢 {{ n(item.all_win_loss) }}</span>
        </div>
        <div class="ag-row"><span class="k">充值 / 提现</span><span>{{ n(item.all_recharge) }} / {{ n(item.all_withdraw) }}</span></div>
        <div class="ag-row"><span class="k">有效投注</span><span>{{ n(item.all_valid_bet) }}</span></div>
        <div class="ag-row"><span class="k">返水 / 红包</span><span>{{ n(item.all_fanshui) }} / {{ n(item.all_redpacket) }}</span></div>
      </div>
    </van-list>

    <div v-if="!loading && list.length === 0" class="ag-empty">暂无盈亏数据</div>
  </div>
</template>

<script>
import agentList from './agentList';
export default {
  name: 'AgentProfit',
  mixins: [agentList],
  data() {
    return {
      active: 30,
      presets: [
        { label: '今日', days: 0 },
        { label: '近7天', days: 7 },
        { label: '近30天', days: 30 },
      ],
    };
  },
  created() {
    this.onLoad();
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
    range() {
      let end = new Date();
      let start = new Date();
      start.setDate(start.getDate() - this.active);
      return { start: this.fmt(this.active === 0 ? end : start), end: this.fmt(end) };
    },
    pick(days) {
      this.active = days;
      this.resetList();
      this.onLoad();
    },
    onLoad() {
      this.fetchPage('/api/agent/profit', this.range());
    },
  },
};
</script>

<style lang="scss" scoped>
@import './agentCommon.scss';
</style>
