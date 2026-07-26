<template>
  <div class="ag-page">
    <van-nav-bar class="ag-nav" title="代充" left-arrow @click-left="$router.back()" />
    <div style="height: 46px"></div>

    <div class="ag-card" style="margin-top: 12px; padding: 4px 0">
      <van-field v-model="form.user_id" type="number" label="下线ID" placeholder="下线会员的 user_id" clearable />
      <van-field v-model="form.amount" type="number" label="充值金额" placeholder="请输入金额" clearable />
    </div>
    <div class="ag-tip">· 给你团队下的会员直接充值(user_id 可在「下线」页查看)。</div>

    <div class="ag-submit">
      <van-button block round color="#cf866b" :loading="submitting" @click="submit">确认代充</van-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AgentRecharge',
  data() {
    return {
      form: { user_id: '', amount: '' },
      submitting: false,
    };
  },
  methods: {
    submit() {
      let that = this;
      let f = that.form;
      if (!f.user_id) return that.$notify({ type: 'warning', message: '请输入下线ID' });
      if (!f.amount || Number(f.amount) <= 0) return that.$notify({ type: 'warning', message: '请输入正确的金额' });
      that.submitting = true;
      that.$apiFun
        .post('/api/agent/recharge', { user_id: f.user_id, amount: f.amount })
        .then(res => {
          that.submitting = false;
          if (res.code == 200) {
            that.$notify({ type: 'success', message: '代充成功' });
            that.form = { user_id: '', amount: '' };
          } else {
            that.$notify({ type: 'danger', message: res.message || '代充失败' });
          }
        })
        .catch(() => {
          that.submitting = false;
          that.$notify({ type: 'danger', message: '网络异常' });
        });
    },
  },
};
</script>

<style lang="scss" scoped>
@import './agentCommon.scss';
</style>
