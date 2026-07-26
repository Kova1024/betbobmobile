<template>
  <div class="ag-page">
    <van-nav-bar class="ag-nav" title="下线" left-arrow @click-left="$router.back()" />
    <div style="height: 46px"></div>

    <van-tabs v-model="tab" color="#cf866b" title-active-color="#cf866b" @change="onTab" sticky offset-top="46">
      <van-tab title="下线会员"></van-tab>
      <van-tab title="下线代理"></van-tab>
    </van-tabs>

    <!-- 会员搜索 -->
    <div v-if="tab === 0" style="margin: 10px 12px 0">
      <van-search v-model="keyword" placeholder="搜索用户名" @search="doSearch" @clear="doSearch" />
    </div>

    <van-list v-model="loading" :finished="finished" finished-text="没有更多了" @load="onLoad" :immediate-check="false">
      <!-- 下线会员 -->
      <template v-if="tab === 0">
        <div class="ag-item" v-for="(item, i) in list" :key="i">
          <div class="ag-item-hd">
            <span class="name">{{ item.username }} <small style="color:#999">{{ item.realname }}</small></span>
            <span :style="{ color: item.isagent == 1 ? '#1989fa' : '#999' }">{{ item.isagent == 1 ? '代理' : '会员' }}</span>
          </div>
          <div class="ag-row"><span class="k">ID</span><span>{{ item.id }}</span></div>
          <div class="ag-row"><span class="k">余额</span><span>{{ n(item.balance) }}</span></div>
          <div class="ag-row"><span class="k">VIP / 归属</span><span>V{{ n(item.vip) }} · {{ item.is_direct == 1 ? '直属' : '非直属' }}</span></div>
        </div>
      </template>
      <!-- 下线代理 -->
      <template v-else>
        <div class="ag-item" v-for="(item, i) in list" :key="i">
          <div class="ag-item-hd">
            <span class="name">{{ item.username }}</span>
            <span :class="win(item.all_win_loss)">输赢 {{ n(item.all_win_loss) }}</span>
          </div>
          <div class="ag-row"><span class="k">充值 / 提现</span><span>{{ n(item.all_recharge) }} / {{ n(item.all_withdraw) }}</span></div>
          <div class="ag-row"><span class="k">有效投注</span><span>{{ n(item.all_valid_bet) }}</span></div>
          <div class="ag-row"><span class="k">待发佣金</span><span>{{ n(item.waityongjinsum) }}</span></div>
        </div>
      </template>
    </van-list>

    <div v-if="!loading && list.length === 0" class="ag-empty">暂无数据</div>
  </div>
</template>

<script>
import agentList from './agentList';
export default {
  name: 'AgentDownline',
  mixins: [agentList],
  data() {
    return { tab: 0, keyword: '' };
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
    onTab() {
      this.resetList();
      this.onLoad();
    },
    doSearch() {
      this.resetList();
      this.onLoad();
    },
    onLoad() {
      if (this.tab === 0) {
        this.fetchPage('/api/agent/memberlist', { username: this.keyword });
      } else {
        this.fetchPage('/api/agent/subordinate', { start: '', end: '' });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import './agentCommon.scss';
</style>
