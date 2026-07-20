# bob-go API 文档

Go(Gin) 重写版接口文档。对应原 Laravel `api.php`/`api2.php` + 代理自助后台 + 自建后台管理。

> 前半部分是**端点索引**（方法/路径/鉴权/参数）；文末附**请求/响应示例**、**数据结构（Schema）**、**错误码**。

## 通用约定

- **Base URL**：`http://<host>:8080`
- **数据格式**：请求/响应均为 JSON（部分公开接口兼容表单）。
- **响应信封**：
  ```json
  { "code": 200, "message": "成功", "data": <任意> }
  ```
  - `code=200` 成功（对应 errorcode.php `200=>成功`）；非 200 为业务错误码（202 用户不存在、208 余额不足、409 已处理…）。消息字段为 `message`。
  - 服务器间**支付回调**例外：直接返回纯文本 `success` / `error` / `sign error` / `order error`。
  - **注意**：业务错误一律 HTTP 200 + 响应体 `code`（沿用原 Laravel `returnMsg` 设计）——前端判 `body.code`，勿依赖 HTTP 状态码。
- **鉴权**：
  - 用户端 / 代理后台：`Authorization: Bearer <userJWT>`（`/api/login` 获取，有效期 7 天）。
  - 后台：`Authorization: Bearer <adminJWT>`（`/admin/login` 获取，有效期 1 天）。
  - 代理接口额外要求该用户 `isagent=1`（JWT 内含标记）。
  - 后台接口额外要求相应权限（`RequirePerm`）。
- **分页**：请求传 `page`（默认 1）+ `size`/`pagesize`（默认 10/20）。**分页响应 `data` 为 Laravel 兼容分页对象**：
  ```json
  { "current_page":1, "data":[...列表...], "last_page":5, "per_page":10, "total":48, "from":1, "to":10 }
  ```
  即：**列表在 `data.data`**，分页信息在 `data.current_page/last_page/per_page/total`。
- **健康检查**：`GET /healthz` → `{"ok":true}`

---

## 1. 认证 / 账号

| 方法 | 路径 | 鉴权 | 说明 |
|---|---|---|---|
| POST | `/api/register` | - | 注册。body: `username,password,realname,phone?` → `{token,user_id}` |
| POST | `/api/login` | - | 登录。body: `username,password` → `{token,user_id,username}` |
| POST | `/api/login_pc` | - | PC 登录（同 login）|
| GET | `/api/me` · POST `/api/user` · POST `/api/userblance` | 用户 | 当前用户信息（隐去密码）|
| POST | `/api/balance` | 用户 | 余额 `{balance,mbalance}` |
| GET | `/api/autogetusermoney` | 用户 | 轻量返回余额 |
| POST | `/api/logoff` | 用户 | 登出（标记离线）|
| POST | `/api/editPassword` | 用户 | 改登录密码。body: `password(旧),paypassword(新)` |
| POST | `/api/editPayPassword` | 用户 | 改支付密码。body: `password(登录密码),paypassword(新支付密码)` |
| POST | `/api/updateuserinfo` | 用户 | 改资料。body: `birthday,mobile,email` |
| POST | `/api/uptransferstatus` | 用户 | 转账模式。body: `transferstatus`（0转账/1免转）|
| POST | `/api/uploadimg` | 用户 | 上传图片（multipart `file`）→ `{path}` |

## 2. 资金：充值 / 提现 / 银行卡 / 转账

| 方法 | 路径 | 鉴权 | 说明 |
|---|---|---|---|
| POST | `/api/bindcard` | 用户 | 绑卡。body: `bank,bank_no,bank_owner,bank_address,pay_pass` |
| POST | `/api/delcard` | 用户 | 删卡。body: `id` |
| POST | `/api/getcard` | 用户 | 卡列表。body: `type`（1银行/2USDT/3ebpay/4antoken）|
| POST | `/api/recharge` | 用户 | 发起充值。body: `amount,paytype(bank/alipay/wxpay/usdt/ebpay),catepay?` → `{out_trade_no}` |
| POST/GET | `/api/getPayRange` | 用户 | 通道金额范围。`type` → `{min_price,max_price}` |
| POST | `/api/payinfo` | 用户 | 充值单收款账户。body: `deposit_no` |
| POST | `/api/withdraw` | 用户 | 提现。body: `amount,bank(卡id),password` |
| POST | `/api/getBetAmount` | 用户 | 距上次提现的有效打码量 |
| POST | `/api/transfer` | 用户 | 额度转换。body: `sourcetype,targettype,amount`（`userbalance`⇄平台code）|
| POST | `/api/transall` | 用户 | 一键回收（游戏余额转回）|
| POST | `/api/getrechargerecord` | 用户 | 充值记录 |
| POST | `/api/getwithdrawrecord` | 用户 | 提现记录 |
| POST | `/api/gettransrecord` | 用户 | 转账记录。body: `date(1/2/3/4),page,pagesize` |
| POST | `/api/userapimoney/:api_code` | 用户 | 刷新并返回某平台额度 |
| ANY | `/api/credit` | - | 平台商户额度。`api_code` → `{money}` |

## 3. 游戏

| 方法 | 路径 | 鉴权 | 说明 |
|---|---|---|---|
| POST | `/api/gamelist` · GET `/api/game/list` | - | 游戏列表。body: `category_id?,is_hot?,app?` |
| GET | `/api/all/plat` | - | 启用平台列表 |
| POST | `/api/gamelistBycode` | - | 按平台查游戏。body: `platform_name` |
| POST | `/api/getdogame` | - | 平台 code→name 映射 |
| POST | `/api/gamelogin` | 用户 | 进游戏。body: `api_code,game_type,is_mobile,game_code` → `{url}` |
| POST | `/api/getGameUrl` | 用户 | 进游戏（App 字段名 `plat_name/game_type/game_code/is_mobile_url`）|
| POST | `/api/refreshusermoney` | 用户 | 刷新各平台余额到 usersmoney → `{balance,gameblance,list}` |
| POST | `/api/app/getMoney` | 用户 | 网站余额 + 游戏总余额 |
| POST | `/api/betrecord` | 用户 | 投注记录。body: `date,api_type,page,pagesize` |
| POST | `/api/balancelist` · `/api/balancelist2` | 用户 | 各平台额度列表 |

## 4. 返水 / 返佣

| 方法 | 路径 | 鉴权 | 说明 |
|---|---|---|---|
| POST | `/api/getfanshui` | 用户 | 返水记录+汇总。body: `api_type,type,page,pagesize` |
| POST | `/api/dofanshui` | 用户 | 领取全部可领返水 |

> 返水/返佣的**产生**由投注回调 `/api/game/callback` 触发（见 §8）；代理返佣发放由 cron `agent-settlement`。

## 5. 营销：活动 / 红包 / 消息 / VIP / 反馈

| 方法 | 路径 | 鉴权 | 说明 |
|---|---|---|---|
| POST | `/api/activitytype` | - | 活动类型 |
| POST | `/api/activitylist` | - | 活动列表。body: `type?` |
| POST | `/api/activitydeatil` · `/api/activitydetail` | - | 活动详情(后者为正确拼写)。body: `id` |
| POST | `/api/doactivity` · `/api/doactivityapply` | 用户 | 申请活动。body: `activityid` |
| POST | `/api/activityapplylog` | 用户 | 活动申请记录 |
| POST | `/api/uservip` | - | VIP 等级列表 |
| GET | `/api/userredpacket` | 用户 | 红包状态/可领次数 |
| POST | `/api/douserredpacket` | 用户 | 抢红包（按今日充值×比例随机）|
| POST | `/api/getredpacket` | 用户 | 领取已生成红包。body: `id`（>0 指定，≤0 全部）|
| POST | `/api/redpacket` | 用户 | 红包领取记录 |
| POST | `/api/applyagentdo` | 用户 | 申请成为代理。body: `apply_info,mobile` |
| POST | `/api/suggestion` | 用户 | 意见反馈。body: `type,content,img?` |
| POST | `/api/suggestionlist` | 用户 | 反馈记录 |
| POST | `/api/mail` | 用户 | 站内信列表 |
| GET | `/api/mail_detail/:id` | 用户 | 站内信详情 |
| POST | `/api/noticelist` · `/api/message` · `/api/showmessage` | 用户 | 站内消息分页 |
| POST | `/api/article` | - | 文章。body: `type(cateid)` |
| ANY | `/api/homenotice` | - | 首页公告标题(3) |
| POST | `/api/homecontent` · `/api/homenoticelist` · `/api/homenoticedeatil`(=`/homenoticedetail`) | - | 公告内容/列表/详情 |

## 6. 站点信息 / 展示

| 方法 | 路径 | 鉴权 | 说明 |
|---|---|---|---|
| POST | `/api/app` | - | 站点聚合配置（标题/logo/下载/开关等）|
| POST | `/api/systemstatus` | - | 站点开关 |
| POST | `/api/banklist` · `/api/systembankcardinfo` | - | 充值银行列表 |
| POST | `/api/bannerList` | - | 轮播图。body: `type?` |
| ANY | `/api/getpaybank` | - | 收款账户列表 |
| GET | `/api/get_pay_way` | - | 各支付方式可用性 |
| GET/POST | `/api/getAppUrl` · `/api/getApiUrl` | - | 站点地址 |
| POST | `/api/getservicerurl` | - | 客服地址 |
| GET | `/api/getAgentLoginUrl` · `/api/getVisitUrl` | - | 代理登录/访问地址 |

## 7. 代理自助后台 `/api/agent/*`（需登录且为代理）

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/agent/today` | 团队今日概览（下线会员/代理数、今日充提投注输赢）|
| POST | `/api/agent/commission` | 佣金报表（自己+下线聚合）。body: `start?,end?` |
| POST | `/api/agent/profit` | 盈亏报表（逐下线）。body: `start,end,page,size` |
| POST | `/api/agent/subordinate` | 下线代理列表（含子树统计）|
| POST | `/api/agent/memberlist` | 下线会员列表。body: `username?,page,size` |
| POST | `/api/agent/bet-log` | 团队投注记录 |
| POST | `/api/agent/recharge-log` | 团队充值记录 |
| POST | `/api/agent/withdraw-log` | 团队提现记录 |
| POST | `/api/agent/transfer-log` | 团队转账记录 |
| POST | `/api/agent/rebate` | 团队返水记录 |
| POST | `/api/agent/add-member` | 代开下级会员。body: `username,password,realname` |
| POST | `/api/agent/recharge` | 给下线代充。body: `user_id,amount` |
| POST | `/api/agent/changefanshui` | 改下线返水比例。body: `uid,fanshui` |

## 8. 服务器间回调（无用户鉴权，验签）

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/game/callback` | 聚合器投注回调。body: `handle(creategamerecord/updategamerecord)+注单字段`；触发返水/返佣 |
| ANY | `/api/pay/cgpay_notify` | CGPay 充值回调（验签→到账，幂等）|
| ANY | `/api/pay/jc_notify` | JC 充值回调（验签→到账，幂等）|

> 返回纯文本 `success`/`sign error`/`order error`。

## 9. 后台管理 `/admin/*`（自建 RBAC，admin JWT）

| 方法 | 路径 | 权限 | 说明 |
|---|---|---|---|
| GET | `/admin/captcha` | - | 图片验证码 → `{captcha_id, captcha_img(base64 PNG)}` |
| POST | `/admin/login` | - | 管理员登录（默认 `admin`/`admin123`）→ `{token,admin}`；`system_config.admin_captcha=1` 时 body 需带 `captcha_id,captcha` |
| GET | `/admin/me` | 登录 | 管理员信息+角色+权限 |
| GET | `/admin/dashboard` | 登录 | 概览（今日/本月充提、会员数、今日投注）|
| GET | `/admin/report/finance` | recharge.audit | 财务报表。`?start&end` |
| GET | `/admin/report/bet` | user.manage | 投注报表（按平台）|
| GET | `/admin/report/agent-commission` | user.manage | 代理佣金报表（各代理下线树投注/盈利/佣金汇总）|
| GET | `/admin/report/bet-sum` | user.manage | 下注汇总（会员按平台投注分布）|
| GET | `/admin/report/fanshui-log` | user.manage | 返水记录明细。`?username&start&end` |
| GET | `/admin/recharges` | recharge.audit | 充值单列表。`?state&page&size` |
| POST | `/admin/recharges/:id/pass` | recharge.audit | 充值审核通过 |
| POST | `/admin/recharges/:id/refuse` | recharge.audit | 充值审核拒绝 |
| GET | `/admin/withdraws` | withdraw.audit | 提现单列表 |
| POST | `/admin/withdraws/:id/pass` | withdraw.audit | 提现审核通过 |
| POST | `/admin/withdraws/:id/refuse` | withdraw.audit | 提现审核拒绝（退款）|
| GET | `/admin/users` · `/users/:id` | user.manage | 会员列表/详情 |
| POST | `/admin/users/:id/balance` | user.manage | 加减款。body: `delta,memo` |
| POST | `/admin/users/:id/black` | user.manage | 拉黑/解黑。body: `black` |
| GET | `/admin/agent-applies` | agent.audit | 代理申请列表 |
| POST | `/admin/agent-applies/:id/audit` | agent.audit | 审核。body: `pass` |
| POST | `/admin/agents/:id/settle` | agent.audit | 单代理立即返佣 → `{settled}` |
| GET/POST | `/admin/admins` · `/roles` · `/permissions` | rbac.manage | 管理员/角色/权限管理 |

> 权限 slug：`recharge.audit` `withdraw.audit` `user.manage` `agent.audit` `rbac.manage`；超级管理员持通配 `*`。

## 10. 后台内容/配置管理 CRUD `/admin/*`（权限 `content.manage`）

通用 REST（泛型生成，24 个实体）：`GET /admin/<entity>?page&size&state&status`（列表）、`GET /admin/<entity>/:id`、`POST /admin/<entity>`（新建，**含必填字段校验**，缺失/空 → 422）、`PUT /admin/<entity>/:id`（改，部分字段）、`DELETE /admin/<entity>/:id`（删）。

**可增删改**：`game-lists` `game-lists-app` `apis` `activities` `activity-types` `banners` `red-envelopes` `messages` `templates` `banks` `pay-settings` `code-pays` `user-vips` `user-cards` `agent-settlements` `articles` `article-cates`
**只读（仅列表/详情）**：`game-records` `transfer-logs` `syslogs` `user-operate-logs` `userredpackets` `activity-applies`
**系统参数**：`GET /admin/system-configs`（全部）、`POST /admin/system-configs`（body `{key:value,...}` 批量 upsert）

## 11. 计划任务（`cmd/cron`）

| 命令 | 说明 |
|---|---|
| `cron agent-settlement` | 全部代理返佣结算（发放 transfer_type=20 待结算流水）|
| `cron crawl-records` | 从聚合器抓取投注记录（与 `/api/game/callback` 二选一）|

## 支付回调补充（§8 之外）

| 方法 | 路径 | 说明 |
|---|---|---|
| ANY | `/api/notify` | ZGPay 充值回调（md5 大写签名）|
| ANY | `/api/fourwaynotify` | 四方支付回调 |
| ANY | `/api/zgp-withdraw-callback` | ZGPay 代付结果回调（成功置完成/失败退款）|

## 编辑银行卡

| 方法 | 路径 | 鉴权 | 说明 |
|---|---|---|---|
| POST | `/api/editCard/:id` | 用户 | 编辑本人银行卡（白名单字段）|

---

## 一、形状怎么定的（机制）

- **请求体**：由 handler 里的绑定结构体决定，`json` tag 即字段名；`binding:"required"` 为必填。
- **响应**：统一信封
  ```json
  { "code": 200, "message": "成功", "data": <payload> }
  ```
  - `code=200` 成功，非 200 为业务错误码（错误时 `data` 通常为 `null`）。消息字段为 `message`(非 msg)。
  - **HTTP 状态恒为 200**（支付回调除外，返纯文本）——判成功看 `code`，不看 HTTP 状态。
  - `data` 有三种形态：**对象**（如 `{token,...}`）、**实体/实体数组**（见第三节 Schema）、**分页对象** `{list:[...], total:N}`。

---

## 二、核心接口示例（真实 JSON）

### 注册 `POST /api/register`
```jsonc
// 请求
{ "username": "alice001", "password": "secret123", "realname": "Alice", "phone": "13800000000" }
// 响应
{ "code": 200, "message": "成功", "data": { "token": "eyJhbGc...", "user_id": 1 } }
```

### 登录 `POST /api/login`
```jsonc
// 请求
{ "username": "alice001", "password": "secret123" }
// 响应
{ "code": 200, "message": "成功", "data": { "token": "eyJhbGc...", "user_id": 1, "username": "alice001" } }
```
> 之后所有需登录接口带 `Authorization: Bearer <token>`。

### 当前用户 `GET /api/me`
```jsonc
// 响应 data = Users 实体（password/paypwd/api_token 已置空）
{ "code": 200, "message": "成功", "data": {
    "id": 1, "username": "alice001", "realname": "Alice", "vip": 0, "balance": 0,
    "mbalance": 0, "paysum": 0, "phone": "13800000000", "isagent": 0, "status": 1, "..." : "…见 Users Schema" } }
```

### 发起充值 `POST /api/recharge`
```jsonc
// 请求（paytype: bank/alipay/wxpay/usdt/ebpay；usdt 时 catepay=TRC20/ERC20）
{ "amount": 500, "paytype": "alipay" }
// 响应
{ "code": 200, "message": "成功", "data": { "out_trade_no": "178438805614862" } }
```

### 绑卡 `POST /api/bindcard`
```jsonc
// 请求
{ "bank": "USDT", "bank_no": "TXaddr123", "bank_owner": "TRC20", "pay_pass": "secret123" }
// 响应
{ "code": 200, "message": "成功", "data": null }
```

### 提现 `POST /api/withdraw`
```jsonc
// 请求（bank = user_cards.id）
{ "amount": 300, "bank": 1, "password": "secret123" }
// 成功
{ "code": 200, "message": "成功", "data": null }
// 失败示例（余额不足）
{ "code": 208, "message": "提现金额不能大于账户余额哦", "data": null }
```

### 额度转换 `POST /api/transfer`
```jsonc
// 请求（userbalance ⇄ 平台 code，如 pg）
{ "sourcetype": "userbalance", "targettype": "pg", "amount": 200 }
// 响应（返回最新余额）
{ "code": 200, "message": "成功", "data": { "balance": 800 } }
```

### 返水记录 `POST /api/getfanshui`
```jsonc
// 请求
{ "api_type": "", "type": 0, "page": 1, "pagesize": 10 }
// 响应
{ "code": 200, "message": "成功", "data": {
    "list": { "current_page":1, "data":[ /* TransferLogs */ ], "last_page":1, "per_page":10, "total":3, "from":1, "to":3 },
    "jisuan": 0,      // 已领合计
    "nojisuan": 10    // 可领合计
} }
```

### 各平台额度 `POST /api/balancelist`
```jsonc
{ "code": 200, "message": "成功", "data": [
    { "balance": 0, "name": "PG电子", "platname": "pg" },
    { "balance": 0, "name": "AG真人", "platname": "ag" }
] }
```

### 代理团队概览 `POST /api/agent/today`（需为代理）
```jsonc
{ "code": 200, "message": "成功", "data": {
    "child_member_count": 2, "child_agent_count": 1,
    "directly_member_count": 1, "directly_agent_count": 1, "add_member_count": 0,
    "all_recharge": 800, "all_withdraw": 100, "all_bet": 350, "all_valid_bet": 350, "win_loss": -10 } }
```

---

## 三、后台接口示例

### 管理员登录 `POST /admin/login`
```jsonc
// 请求（admin_captcha=1 时需加 captcha_id, captcha）
{ "username": "admin", "password": "admin123" }
// 响应
{ "code": 200, "message": "成功", "data": { "token": "eyJhbGc...", "admin": { "id": 1, "username": "admin", "name": "超级管理员", "status": 1 } } }
```

### 充值单列表 `GET /admin/recharges?state=1&page=1&size=20`
```jsonc
{ "code": 200, "message": "成功", "data": {
    "list": [ /* Recharge 实体数组 */ ], "total": 42 } }
```

### 审核通过 `POST /admin/recharges/1/pass`
```jsonc
{ "code": 200, "message": "成功", "data": null }
// 重复处理
{ "code": 409, "message": "订单已处理", "data": null }
```

### 通用 CRUD 新建 `POST /admin/banks`
```jsonc
// 请求（缺必填 → 422）
{ "bank_name": "工商银行", "order": 1, "state": 1 }
// 成功返回创建后的实体
{ "code": 200, "message": "成功", "data": { "id": 1, "bank_name": "工商银行", "order": 1, "state": 1, "..." : "…" } }
// 缺必填
{ "code": 422, "message": "缺少必填字段: bank_name", "data": null }
```

### 通用 CRUD 更新 `PUT /admin/banks/1`
```jsonc
// 请求（部分字段）
{ "state": 0 }
// 响应
{ "code": 200, "message": "成功", "data": null }
```

---

## 四、主要数据结构（Schema）

> 字段名 = 数据库列名（下划线），来自 `internal/model/models_gen.go`，与生产库逐字段一致。

### Users（会员）
`id, fid(上级), username, realname, vip, level, exp, isonline, avatar, allowagent, balance(余额), mbalance(码量), totalgame(累计流水), phone, mail, paysum(累计充值), status(1正常), isdel, isblack, lastip, last_login_ip_address, logintime, sourceurl, loginsum, birthday, isagent(1代理), pid(父级), settlement_id, fanshuifee(返水比例), settlementday, reg_ip, transferstatus(0转账/1免转), created_at, updated_at`
> `password/paypwd/api_token` 在响应中不返回。

### Recharge（充值单）
`id, order_no(系统单号), out_trade_no(商户单号), user_id, amount(金额), cash_fee(手续费), real_money(实到), pay_way(1银行卡/3支付宝/4微信/5USDT-TRC/6USDT-ERC/7ebpay/10充值送/11代理充), bank, bank_no, bank_address, bank_owner, info, usdt_rate, state(1待审/2成功/3拒绝), created_at, updated_at`

### Withdraws（提现单）
`id, order_no, type(1普通/2USDT-TRC/3USDT-ERC/4ebpay), card_id, user_id, amount, cash_fee, real_money(实到), usdt_rate, info, state(1待审/2完成/3拒绝), created_at, updated_at`

### GameRecords（投注记录）
`id, user_id, username, bet_id(注单号), bet_time, platform_type(平台), game_type(游戏类型), game_code, bet_amount(下注), valid_amount(有效投注), win_loss(输赢), is_back(1已返水), status(1已结算/2未结算/0无效), created_at, updated_at`

### TransferLogs（转账/返水/返佣流水）
`id, order_no, api_type, user_id, transfer_type(0上分/1下分/5红包/6会员返水/20代理返佣), money, cash_fee, real_money, before_money, after_money, state, platform_type, betid, settlementsday, addtime, remark, created_at, updated_at`

### UserCards（银行卡）
`id, user_id, bank(银行名/USDT/ebpay), bank_no(卡号/地址), bank_address, bank_owner(持卡人/链类型), created_at, updated_at`

> 其余实体（Activities/Banners/UserVIP/CodePay/…）字段见 `internal/model/models_gen.go` 对应 struct 的 `json` tag——所有后台 CRUD 接口的 data 就是该实体。

---

## 五、业务错误码（节选，沿用原 errorcode.php）

| code | 含义 | code | 含义 |
|---|---|---|---|
| 0 | 成功 | 210 | 余额不足 |
| 1 | 通用失败/账密错误 | 214/215 | 提款金额过低/过高 |
| 202 | 用户不存在/无数据 | 216 | 日提款次数达上限 |
| 205 | 密码错误 | 251 | 请先设置支付密码 |
| 207 | 银行卡超限 | 409 | 订单已处理(幂等) |
| 208 | 提现超余额 | 422 | 参数/必填校验失败 |
| 209 | 转账失败 | 500 | 服务器错误 |

## 六、后台 CRUD 实体字段（补充 Schema）

> 供后台管理前端建表单用。字段=数据库列名；主要 CRUD 实体（其余见 models_gen.go）。

- **`game-lists`**（GameLists）: `id, platform_name, name, name_en, keywords, game_code, game_icon, game_title_img, category_id, order_by, is_hot, is_new, is_recommend, is_pc, is_mobile, site_state, app_state, is_top, created_at, updated_at, check_yes_img, check_no_img, api_logo_img, mobile_img, app_img, app_icon, header_logo`
- **`activities`**（Activities）: `id, type, title, entitle, content, encontent, memo, enmemo, apply_count, banner, can_apply, state, app_state, created_at, updated_at, app_img`
- **`activity-types`**（ActivityTypes）: `id, name, state, created_at, updated_at`
- **`banners`**（Banners）: `id, type, title, pic, jump_url, order, state, created_at, updated_at`
- **`red-envelopes`**（RedEnvelopes）: `id, day_flow, recharge, flow_money, money, start_time, end_time, status, created_at, updated_at`
- **`messages`**（Messages）: `id, user_id, vip_id, isagent, type, title, content, created_at, updated_at`
- **`templates`**（Templates）: `id, name, pic, client_type, sort, template_id, state, created_at, updated_at`
- **`pay-settings`**（PaySetting）: `id, bank_id, bank_no, bank_owner, bank_address, info, state, created_at, updated_at`
- **`code-pays`**（CodePay）: `id, mch_id, key, content, status, payimg, min_price, max_price, created_at, updated_at`
- **`user-vips`**（UserVIP）: `id, vipname, viptype, recharge, flow, realperson, electron, joker, sport, fish, lottery, e_sport, status, exp, is_default, created_at, updated_at, vrberfee, ldfee, vippic`
- **`agent-settlements`**（AgentSettlements）: `id, name, type, realperson, electron, joker, sport, fish, lottery, e_sport, member_fs, state, created_at, updated_at`
- **`articles`**（Articles）: `id, name, enname, cateid, content, encontent, created_at, updated_at, stor`
- **`article-cates`**（Articlescate）: `id, name, Created_at, Updated_at`
- **`apis`**（Apis）: `id, api_code, api_name, api_money, game_type, plat_type, state, app_state, created_at, updated_at, order_by, app_icon`
- **`game-lists-app`**（GameListsApp）: `id, platform_name, name, name_en, keywords, game_code, game_icon, game_title_img, category_id, order_by, is_hot, app_state, created_at, updated_at, app_img, app_icon`

---

## 七、全部接口 请求/响应速查（逐一）

> 响应均为信封 `{code,msg,data}`，下表只列 **`data`** 形态（据 handler 代码）。`null`=无数据；`实体`见 §四/§六 Schema；`实体[]`=数组；`{list,total}`=分页。

### 7.1 认证/账号

| 接口 | 请求 body/参数 | 响应 data |
|---|---|---|
| POST /api/register | `{username,password,realname,phone?}` | `{token,user_id}` |
| POST /api/login · /api/login_pc | `{username,password}` | `{token,user_id,username}` |
| GET /api/me · POST /api/user · /api/userblance | - | `Users` 实体 |
| POST /api/balance | - | `{balance,mbalance}` |
| GET /api/autogetusermoney | - | `{balance}` |
| POST /api/logoff | - | `null` |
| POST /api/editPassword | `{password,paypassword}` | `null` |
| POST /api/editPayPassword | `{password,paypassword}` | `null` |
| POST /api/updateuserinfo | `{birthday,mobile,email}` | `null` |
| POST /api/uptransferstatus | `{transferstatus}` | `null` |
| POST /api/uploadimg | multipart `file` | `{path}` |

### 7.2 资金

| 接口 | 请求 | 响应 data |
|---|---|---|
| POST /api/bindcard | `{bank,bank_no,bank_owner,bank_address,pay_pass}` | `null` |
| POST /api/delcard | `{id}` | `null` |
| POST /api/editCard/:id | `{bank?,bank_no?,bank_owner?,bank_address?}` | `null` |
| POST /api/getcard | `{type}` | `UserCards[]` |
| POST /api/recharge | `{amount,paytype,catepay?}` | `{out_trade_no}` |
| ANY /api/getPayRange | `type` | `{min_price,max_price}` |
| POST /api/payinfo | `{deposit_no}` | `{info:Recharge, cardlist:[…], paytype}` |
| POST /api/pay/cgpay_create | `{out_trade_no}` | `{gateway:网关JSON(含payUrl)}` |
| POST /api/withdraw | `{amount,bank,password}` | `null` |
| POST /api/getBetAmount | - | `{bet_amount}` |
| POST /api/transfer | `{sourcetype,targettype,amount}` | `{balance}` |
| POST /api/transall | - | `{msg}` |
| POST /api/getrechargerecord | `{page?,size?}` | 分页对象(`data:Recharge[]`) |
| POST /api/getwithdrawrecord | `{page?,size?}` | 分页对象(`data:Withdraws[]`) |
| POST /api/gettransrecord | `{date?,page?,pagesize?}` | 分页对象(`data:TransferLogs[]`) |
| POST /api/userapimoney/:api_code | - | `{balance}` |
| ANY /api/credit | `api_code` | `{money}` |

### 7.3 游戏

| 接口 | 请求 | 响应 data |
|---|---|---|
| GET /api/all/plat | - | `Apis[]` |
| POST /api/gamelist · GET /api/game/list | `{category_id?,is_hot?,app?}` | `游戏行[]` |
| POST /api/gamelistBycode | `{platform_name}` | `GameLists[]` |
| POST /api/getdogame | - | `{code:name,…}` |
| POST /api/gamelogin | `{api_code,game_type,is_mobile,game_code}` | `{url}` |
| POST /api/getGameUrl | `{plat_name,game_type,game_code,is_mobile_url}` | `{url}` |
| POST /api/refreshusermoney | - | `{balance,gameblance,list:[{name,platname,balance}]}` |
| POST /api/app/getMoney | - | `{balance,gameblance}` |
| POST /api/betrecord | `{date?,api_type?,page?,pagesize?}` | 分页对象(`data:GameRecords[]`) |
| POST /api/balancelist · /api/balancelist2 | - | `[{balance,name,platname}]` |

### 7.4 返水

| 接口 | 请求 | 响应 data |
|---|---|---|
| POST /api/getfanshui | `{api_type?,type?,page?,pagesize?}` | `{list:分页对象(data:TransferLogs[]),jisuan,nojisuan}` |
| POST /api/dofanshui | - | `null` |

### 7.5 营销/内容

| 接口 | 请求 | 响应 data |
|---|---|---|
| POST /api/article | `type` | `Articles` |
| ANY /api/homenotice | - | `string[]` |
| POST /api/homecontent | - | `Articles[]` |
| POST /api/homenoticelist | `page,limit` | 分页对象(`data:Articles[]`) |
| POST /api/homenoticedeatil | `id` | `Articles` |
| POST /api/systemstatus | - | `{content,isclose}` |
| POST /api/uservip | - | `UserVIP[]` |
| POST /api/noticelist · /api/message · /api/showmessage | `page,limit` | 分页对象(`data:Messages[]`) |
| POST /api/activitytype | - | `ActivityTypes[]` |
| POST /api/activitylist | `type?,page?,pagesize?` | 分页对象(`data:Activities[]`) |
| POST /api/activitydeatil | `id` | `Activities` |
| POST /api/doactivity · /api/doactivityapply | `{activityid}` | `null` |
| POST /api/activityapplylog | `page,limit` | 分页对象(`data:[{id,activity_id,state,activity_name,created_at}]`) |
| GET /api/userredpacket | - | `{sendnums,acquirednum,redPacketStatus,rules,max_times}` |
| POST /api/douserredpacket | - | `{redpacketmoney,sendnums,acquirednum}` |
| POST /api/getredpacket | `{id}` | `null` |
| POST /api/redpacket | `page,pagesize` | 分页对象(`data:Userredpacket[]`) |
| POST /api/applyagentdo | `{apply_info,mobile}` | `null` |
| POST /api/suggestion | `{type,content,img?}` | `null` |
| POST /api/suggestionlist | `page,pagesize` | 分页对象(`data:Suggestions[]`) |
| POST /api/mail | `page,pagesize` | 分页对象(`data:[{id,message_id,type,title,content,created_at}]`) |
| GET /api/mail_detail/:id | - | `Messages` |

### 7.6 站点/展示

| 接口 | 请求 | 响应 data |
|---|---|---|
| POST /api/app | - | `{ios_download_url,ios_download_qrcode,h5_url,title,redpacket_switch,site_state,fanshui,index_modal,repair_tips,webcontent,site_logo}` |
| POST /api/banklist · /api/systembankcardinfo | - | `Banks[]` |
| POST /api/bannerList | `type?` | `Banners[]` |
| ANY /api/getpaybank | - | `PaySetting[]` |
| GET /api/get_pay_way | - | `{wechat,usdt,alipay,card}` |
| GET/POST /api/getAppUrl · ANY /api/getApiUrl | - | `{url}` |
| POST /api/getservicerurl | - | `{url,domain}` |
| GET /api/getAgentLoginUrl · /api/getVisitUrl | - | `{url}` |

### 7.7 代理自助后台（响应 data）

| 接口 | 请求 | 响应 data |
|---|---|---|
| POST /api/agent/today | - | `{child_member_count,child_agent_count,directly_member_count,directly_agent_count,add_member_count,all_recharge,all_withdraw,all_bet,all_valid_bet,win_loss}` |
| POST /api/agent/commission | `{start?,end?}` | `{username,realname,isagent,rechage_times,withdraw_times,all_recharge,all_withdraw,all_valid_bet,all_win_loss,all_fanshui,all_redpacket,usersum,agentsum,yongjinsum,waityongjinsum}` |
| POST /api/agent/profit | `{start,end,page,size}` | 分页对象(`data:[{id,username,rechage_times,withdraw_times,all_recharge,all_withdraw,all_valid_bet,all_win_loss,all_fanshui,all_redpacket}]`) |
| POST /api/agent/subordinate | `{start,end,page,size}` | 分页对象(行含 `waityongjinsum`) |
| POST /api/agent/memberlist | `{username?,page,size}` | 分页对象(`data:[{id,username,realname,isagent,balance,vip,parent,is_direct}]`) |
| POST /api/agent/bet-log | `{username?,start,end,page,size}` | 分页对象(`data:GameRecords[]`) |
| POST /api/agent/recharge-log | 同上 | 分页对象(`data:Recharge[]`) |
| POST /api/agent/withdraw-log | 同上 | 分页对象(`data:Withdraws[]`) |
| POST /api/agent/transfer-log | 同上 | 分页对象(`data:TransferLogs[]`) |
| POST /api/agent/rebate | 同上 | 分页对象(`data:TransferLogs[]` type=6) |
| POST /api/agent/add-member | `{username,password,realname}` | `null` |
| POST /api/agent/recharge | `{user_id,amount}` | `null` |
| POST /api/agent/changefanshui | `{uid,fanshui}` | `null` |

### 7.8 服务器间回调（返纯文本，非信封）

| 接口 | 请求(表单/JSON) | 返回 |
|---|---|---|
| POST /api/game/callback | `{handle, …注单字段}` | 信封 `null` |
| ANY /api/pay/cgpay_notify | 网关字段 + `Sign` | `success`/`sign error`/`order error` |
| ANY /api/pay/jc_notify | 同上 | 同上 |
| ANY /api/notify | `{merchant_id,order_no,out_trade_no,param,pay_time,price,sign}` | `success`/`hash error`/`order error` |
| ANY /api/fourwaynotify | `{state,merchantNum,orderNo,amount,sign}` | `success`/`sign error`/`order error` |
| ANY /api/zgp-withdraw-callback | `{order_no,total_fee,user_name,state,sign,…}` | `success`/`sign error`/`order error` |

### 7.9 后台管理（响应 data）

| 接口 | 请求 | 响应 data |
|---|---|---|
| GET /admin/captcha | - | `{captcha_id,captcha_img}` |
| POST /admin/login | `{username,password,captcha_id?,captcha?}` | `{token,admin}` |
| GET /admin/me | - | `{admin,roles,permissions}` |
| GET /admin/dashboard | - | `{today_recharge,today_withdraw,month_recharge,month_withdraw,user_total,today_new_user,today_bet}` |
| GET /admin/report/finance | `?start&end` | `{recharge_amount,recharge_count,withdraw_amount,withdraw_count}` |
| GET /admin/report/bet | `?start&end` | `[{platform_type,bet_amount,valid_amount,win_loss,count}]` |
| GET /admin/report/agent-commission | `?page&size` | `{list:[{id,username,child_count,bet_sum,valid_bet_sum,win_loss,child_money}],total}` |
| GET /admin/report/bet-sum | `?page&size` | `{list:[{id,username,plat_bet:{code:金额}}],total,platforms}` |
| GET /admin/report/fanshui-log | `?username&start&end&page&size` | `{list:[{id,username,platform_type,state,money,created_at,betid}],total}` |
| GET /admin/recharges | `?state&page&size` | `{list:Recharge[],total}` |
| POST /admin/recharges/:id/pass | - | `null`（审核通过）|
| POST /admin/recharges/:id/refuse | - | `null`（审核拒绝）|
| GET /admin/withdraws | `?state&page&size` | `{list:Withdraws[],total}` |
| POST /admin/withdraws/:id/pass | - | `null`（通过）|
| POST /admin/withdraws/:id/refuse | - | `null`（拒绝退款）|
| GET /admin/users | `?keyword&page&size` | `{list:Users[],total}` |
| GET /admin/users/:id | - | `Users` |
| POST /admin/users/:id/balance | `{delta,memo}` | `null` |
| POST /admin/users/:id/black | `{black}` | `null` |
| GET /admin/agent-applies | `?state&page&size` | `{list:AgentApply[],total}` |
| POST /admin/agent-applies/:id/audit | `{pass}` | `null` |
| POST /admin/agents/:id/settle | - | `{settled}` |
| GET /admin/admins | - | `SysAdmin[]` |
| POST /admin/admins | `{username,password,name,role_ids}` | `null` |
| GET /admin/roles | - | `SysRole[]` |
| POST /admin/roles | `{name,slug,perm_ids}` | `null` |
| GET /admin/permissions | - | `SysPermission[]` |
| GET /admin/system-configs | - | `SystemConfig[]` |
| POST /admin/system-configs | `{key:value,…}` | `null` |

### 7.10 后台通用 CRUD（24 实体，`<e>` 见 §六）

| 接口 | 请求 | 响应 data |
|---|---|---|
| GET /admin/`<e>` | `?page&size&state&status` | `{list:实体[],total}` |
| GET /admin/`<e>`/:id | - | `实体` |
| POST /admin/`<e>` | 实体字段(必填校验) | `实体`(创建后) |
| PUT /admin/`<e>`/:id | 部分字段 | `null` |
| DELETE /admin/`<e>`/:id | - | `null` |
