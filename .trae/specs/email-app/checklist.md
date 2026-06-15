# 邮箱应用验证清单

## 后端 API
- [x] POST /api/auth/register - 用户注册成功返回 JWT
- [x] POST /api/auth/login - 用户登录成功返回 JWT
- [x] GET /api/accounts - 获取当前用户的所有邮箱账号
- [x] POST /api/accounts - 添加新的 IMAP/SMTP 邮箱账号
- [x] DELETE /api/accounts/:id - 删除邮箱账号
- [x] PUT /api/accounts/:id/active - 切换活跃账号
- [x] GET /api/emails?folder=inbox&page=1 - 获取邮件列表（分页）
- [x] GET /api/emails/:id - 获取单封邮件详情
- [x] PUT /api/emails/:id/read - 标记已读/未读
- [x] POST /api/emails/send - 发送邮件
- [x] POST /api/emails/:id/reply - 回复邮件
- [x] POST /api/emails/:id/forward - 转发邮件
- [x] DELETE /api/emails/:id - 删除邮件（移入废纸篓）
- [x] GET /api/emails/search?q=keyword - 搜索邮件
- [x] 所有 API（除 auth 外）需要有效 JWT 认证

## 前端功能
- [x] 登录页面：邮箱和密码表单，登录后跳转到主页
- [x] 注册页面：邮箱和密码表单，注册后跳转到主页
- [x] 侧边栏显示已添加的邮箱账号列表
- [x] 侧边栏显示文件夹：收件箱、已发送、草稿箱、废纸篓
- [x] 点击账号可切换当前活跃邮箱
- [x] 可添加新的第三方邮箱账号
- [x] 邮件列表展示发件人、主题、摘要、时间
- [x] 已读/未读邮件视觉区分（未读加粗+珊瑚红标记）
- [x] 点击邮件展示完整详情
- [x] 邮件详情展示发件人、收件人、主题、时间、正文
- [x] 写邮件功能：收件人、主题、正文，支持发送
- [x] 回复邮件：自动填充 Re: 主题和原发件人
- [x] 转发邮件：自动填充 Fwd: 主题和原文
- [x] 删除邮件：移入废纸篓
- [x] 搜索邮件：输入关键词过滤邮件列表

## 设计系统验证
- [x] 所有 CSS 变量正确定义并使用（Studio No.5 配色）
- [x] Lexend 字体正确加载并应用于 UI 正文
- [x] Fraunces 字体正确加载并应用于标题/品牌元素
- [x] 侧边栏使用深墨蓝底色 `#191c24`
- [x] 页面底色使用暖纸色 `#f5f2eb`
- [x] 邮件卡片使用白色背景配合暖灰边框
- [x] 主题蓝 `#4a5f7a` 用于主按钮和链接
- [x] 暖铜金 `#b8974e` 用于强调装饰
- [x] 珊瑚红 `#e67e6a` 用于未读标记和危险操作
- [x] 无 emoji 作为图标（使用 SVG 图标）
- [x] 组件间距和排版统一协调
- [x] hover 状态有平滑过渡动效 (150-300ms)

## 交互与体验
- [x] 点击交互元素有 cursor-pointer
- [x] 异步操作有 loading 状态反馈
- [x] 错误状态有友好提示
- [x] 表单输入有清晰的 label 和 focus 状态
- [x] 侧边栏与主内容区比例协调