// 代理列表页通用分页逻辑(配合 vant van-list)
// 用法:组件里定义 onLoad() 调用 this.fetchPage(url, extraParams);切换筛选/tab 时调用 this.resetList() 再 onLoad()
export default {
  data() {
    return {
      list: [],
      page: 1,
      lastPage: 1,
      total: 0,
      loading: false,
      finished: false,
    };
  },
  methods: {
    resetList() {
      this.list = [];
      this.page = 1;
      this.lastPage = 1;
      this.total = 0;
      this.finished = false;
      this.loading = false;
    },
    // 拉取当前 page,追加到 list;返回 Promise
    fetchPage(url, params) {
      let that = this;
      that.loading = true;
      return that.$apiFun
        .post(url, Object.assign({ page: that.page, size: 10 }, params || {}))
        .then(res => {
          if (res.code == 200 && res.data) {
            let d = res.data;
            let rows = d.data || [];
            that.total = d.total || 0;
            that.lastPage = d.last_page || 1;
            that.list = that.page == 1 ? rows : that.list.concat(rows);
            if (that.page >= that.lastPage || rows.length == 0) {
              that.finished = true;
            } else {
              that.page++;
            }
          } else {
            that.finished = true;
            if (res.code != 200) that.$notify({ type: 'warning', message: res.message || '加载失败' });
          }
          that.loading = false;
        })
        .catch(() => {
          that.loading = false;
          that.finished = true;
        });
    },
  },
};
