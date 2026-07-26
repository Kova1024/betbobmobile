<template>
  <div class="ag-page">
    <van-nav-bar class="ag-nav" title="代开会员" left-arrow @click-left="$router.back()" />
    <div style="height: 46px"></div>

    <div class="ag-card" style="margin-top: 12px; padding: 4px 0">
      <van-field v-model="form.username" label="用户名" placeholder="6~16位字母或数字" clearable />
      <van-field v-model="form.password" type="password" label="登录密码" placeholder="至少6位" clearable />
      <van-field v-model="form.realname" label="真实姓名" placeholder="请输入真实姓名" clearable />
    </div>
    <div class="ag-tip">· 为下级开设会员账号,开设后归属在你的团队下。</div>

    <div class="ag-submit">
      <van-button block round color="#cf866b" :loading="submitting" @click="submit">立即开设</van-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AgentAddMember',
  data() {
    return {
      form: { username: '', password: '', realname: '' },
      submitting: false,
    };
  },
  methods: {
    submit() {
      let that = this;
      let f = that.form;
      if (!f.username || f.username.length < 6) return that.$notify({ type: 'warning', message: '用户名至少6位' });
      if (!f.password || f.password.length < 6) return that.$notify({ type: 'warning', message: '密码至少6位' });
      if (!f.realname) return that.$notify({ type: 'warning', message: '请输入真实姓名' });
      that.submitting = true;
      that.$apiFun
        .post('/api/agent/add-member', { username: f.username, password: f.password, realname: f.realname })
        .then(res => {
          that.submitting = false;
          if (res.code == 200) {
            that.$notify({ type: 'success', message: '开设成功' });
            that.form = { username: '', password: '', realname: '' };
          } else {
            that.$notify({ type: 'danger', message: res.message || '开设失败' });
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
