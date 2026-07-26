<template>
  <div class="ag-page">
    <van-nav-bar class="ag-nav" title="改返水" left-arrow @click-left="$router.back()" />
    <div style="height: 46px"></div>

    <div class="ag-card" style="margin-top: 12px; padding: 4px 0">
      <van-field v-model="form.uid" type="number" label="下线ID" placeholder="下线会员的 user_id" clearable />
      <van-field v-model="form.fanshui" type="number" label="返水比例" placeholder="如 0.5 表示 0.5%" clearable />
    </div>
    <div class="ag-tip">· 调整下线会员的返水比例;不能超过你自己的返水比例。</div>

    <div class="ag-submit">
      <van-button block round color="#cf866b" :loading="submitting" @click="submit">确认修改</van-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AgentRebateSet',
  data() {
    return {
      form: { uid: '', fanshui: '' },
      submitting: false,
    };
  },
  methods: {
    submit() {
      let that = this;
      let f = that.form;
      if (!f.uid) return that.$notify({ type: 'warning', message: '请输入下线ID' });
      if (f.fanshui === '' || Number(f.fanshui) < 0) return that.$notify({ type: 'warning', message: '请输入正确的返水比例' });
      that.submitting = true;
      that.$apiFun
        .post('/api/agent/changefanshui', { uid: f.uid, fanshui: f.fanshui })
        .then(res => {
          that.submitting = false;
          if (res.code == 200) {
            that.$notify({ type: 'success', message: '修改成功' });
          } else {
            that.$notify({ type: 'danger', message: res.message || '修改失败' });
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
