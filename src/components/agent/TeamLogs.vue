<template>
  <div class="ag-page">
    <van-nav-bar class="ag-nav" title="团队日志" left-arrow @click-left="$router.back()" />
    <div style="height: 46px"></div>

    <van-tabs v-model="tab" color="#cf866b" title-active-color="#cf866b" @change="onTab" sticky offset-top="46">
      <van-tab title="投注"></van-tab>
      <van-tab title="充值"></van-tab>
      <van-tab title="提现"></van-tab>
      <van-tab title="转账"></van-tab>
      <van-tab title="返水"></van-tab>
    </van-tabs>

    <div class="ag-presets">
      <div v-for="p in presets" :key="p.days" :class="['ag-preset', active === p.days ? 'on' : '']" @click="pick(p.days)">{{ p.label }}</div>
    </div>

    <van-list v-model="loading" :finished="finished" finished-text="没有更多了" @load="onLoad" :immediate-check="false">
      <div class="ag-item" v-for="(item, i) in list" :key="i">
        <!-- 投注 -->
        <template v-if="tab === 0">
          <div class="ag-item-hd">
            <span class="name">{{ item.username }}</span>
            <span :class="win(item.win_loss)">{{ n(item.win_loss) }}</span>
          </div>
          <div class="ag-row"><span class="k">平台 / 类型</span><span>{{ item.platform_type }} · {{ item.game_type }}</span></div>
          <div class="ag-row"><span class="k">投注 / 有效</span><span>{{ n(item.bet_amount) }} / {{ n(item.valid_amount) }}</span></div>
          <div class="ag-row"><span class="k">{{ item.bet_time || item.created_at }}</span><span>{{ betStatus(item.status) }}</span></div>
        </template>
        <!-- 充值 -->
        <template v-else-if="tab === 1">
          <div class="ag-item-hd">
            <span class="name">￥{{ n(item.amount) }}</span>
            <span>{{ rechargeState(item.state) }}</span>
          </div>
          <div class="ag-row"><span class="k">方式</span><span>{{ payWay(item.pay_way) }}</span></div>
          <div class="ag-row"><span class="k">实到</span><span>{{ n(item.real_money) }}</span></div>
          <div class="ag-row"><span class="k">{{ item.created_at }}</span><span>{{ item.order_no }}</span></div>
        </template>
        <!-- 提现 -->
        <template v-else-if="tab === 2">
          <div class="ag-item-hd">
            <span class="name">￥{{ n(item.amount) }}</span>
            <span>{{ withdrawState(item.state) }}</span>
          </div>
          <div class="ag-row"><span class="k">实到</span><span>{{ n(item.real_money) }}</span></div>
          <div class="ag-row"><span class="k">{{ item.created_at }}</span><span>{{ item.order_no }}</span></div>
        </template>
        <!-- 转账 -->
        <template v-else-if="tab === 3">
          <div class="ag-item-hd">
            <span class="name">{{ transType(item.transfer_type) }}</span>
            <span>{{ n(item.money) }}</span>
          </div>
          <div class="ag-row"><span class="k">{{ item.created_at }}</span><span>{{ item.remark }}</span></div>
        </template>
        <!-- 返水 -->
        <template v-else>
          <div class="ag-item-hd">
            <span class="name ag-up">+{{ n(item.money) }}</span>
            <span style="color:#999">返水</span>
          </div>
          <div class="ag-row"><span class="k">{{ item.created_at }}</span><span>{{ item.remark }}</span></div>
        </template>
      </div>
    </van-list>

    <div v-if="!loading && list.length === 0" class="ag-empty">暂无记录</div>
  </div>
</template>

<script>
import agentList from './agentList';
export default {
  name: 'AgentTeamLogs',
  mixins: [agentList],
  data() {
    return {
      tab: 0,
      active: 30,
      urls: ['/api/agent/bet-log', '/api/agent/recharge-log', '/api/agent/withdraw-log', '/api/agent/transfer-log', '/api/agent/rebate'],
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
    betStatus(s) {
      return { 0: '无效', 1: '已结算', 2: '未结算' }[s] || '';
    },
    rechargeState(s) {
      return { 1: '待审', 2: '成功', 3: '拒绝' }[s] || '';
    },
    withdrawState(s) {
      return { 1: '待审', 2: '完成', 3: '拒绝' }[s] || '';
    },
    payWay(w) {
      return { 1: '银行卡', 3: '支付宝', 4: '微信', 5: 'USDT-TRC', 6: 'USDT-ERC', 7: 'ebpay', 10: '充值送', 11: '代理充' }[w] || '其他';
    },
    transType(t) {
      return { 0: '上分', 1: '下分', 5: '红包', 6: '会员返水', 20: '代理返佣' }[t] || '转账';
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
    onTab() {
      this.resetList();
      this.onLoad();
    },
    pick(days) {
      this.active = days;
      this.resetList();
      this.onLoad();
    },
    onLoad() {
      this.fetchPage(this.urls[this.tab], this.range());
    },
  },
};
</script>

<style lang="scss" scoped>
@import './agentCommon.scss';
</style>
