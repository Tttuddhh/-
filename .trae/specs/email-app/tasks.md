# 邮箱应用开发任务

## 架构概述
- **前端**: React + Vite + React Router（自定义设计系统，不使用 UI 框架）
- **后端**: Node.js + Express + better-sqlite3
- **邮件协议**: IMAP (node-imap) + SMTP (nodemailer)
- **项目结构**: `/workspace/email-app/frontend/` 和 `/workspace/email-app/backend/`

---

- [x] Task 1: 项目初始化与后端基础架构
  - [x] 初始化前端 (Vite + React) 和后端 (Express) 项目结构
  - [x] 配置 SQLite 数据库，创建 users / email_accounts / emails 表
  - [x] 实现用户注册/登录 API（bcrypt 密码哈希 + JWT token）
  - [x] 添加认证中间件

- [x] Task 2: 邮箱账号管理 API
  - [x] 实现添加 IMAP/SMTP 邮箱账号的 API
  - [x] 实现获取/删除账号列表的 API
  - [x] 实现 IMAP 连接验证与邮件同步 API
  - [x] 实现切换当前活跃账号的 API

- [x] Task 3: 邮件收发核心 API
  - [x] 实现获取收件箱邮件列表 API（分页）
  - [x] 实现获取单封邮件详情 API
  - [x] 实现标记已读/未读 API
  - [x] 实现发送邮件 API (SMTP)
  - [x] 实现回复/转发邮件 API
  - [x] 实现删除/移入废纸篓 API
  - [x] 实现邮件搜索 API

- [x] Task 4: 前端设计系统与基础组件
  - [x] 建立全局 CSS 变量（Studio No.5 配色体系）
  - [x] 引入 Lexend + Fraunces 字体
  - [x] 构建 Button / Input / Card / Avatar / Badge 等通用组件
  - [x] 构建 AppShell 布局（侧边栏 + 主内容区 + 详情区三栏布局）

- [x] Task 5: 前端登录注册页面
  - [x] 实现登录页面（带精致排版和微交互动效）
  - [x] 实现注册页面
  - [x] 实现 JWT 前端存储与路由守卫

- [x] Task 6: 前端侧边栏与账号切换
  - [x] 实现侧边栏账号列表（头像、名称、未读数）
  - [x] 实现文件夹导航（收件箱、已发送、草稿箱、废纸篓）
  - [x] 实现账号切换交互
  - [x] 实现「添加账号」入口与表单

- [x] Task 7: 前端邮件列表页
  - [x] 实现邮件列表展示（发件人、主题、摘要、时间）
  - [x] 实现已读/未读视觉区分
  - [x] 实现分页/无限滚动加载
  - [x] 实现搜索栏

- [x] Task 8: 前端邮件详情页
  - [x] 实现邮件详情展示（发件人、收件人、主题、时间、正文）
  - [x] 实现回复/转发/删除操作按钮
  - [x] 实现邮件正文 HTML 安全渲染

- [x] Task 9: 前端写邮件编辑器
  - [x] 实现写邮件弹窗/页面（收件人、抄送、主题、正文）
  - [x] 实现发送按钮（含发送中状态）
  - [x] 实现草稿自动保存
  - [x] 实现回复时自动填充 Re:/Fwd: 主题

- [x] Task 10: 整体打磨与验证
  - [x] 全局微交互动效（hover、过渡、加载态）
  - [x] 响应式适配验证（桌面端优先）
  - [x] 前端连接后端 API 联调
  - [x] 端到端流程验证

# Task Dependencies
- Task 2 依赖 Task 1（需要认证中间件和数据库就绪）
- Task 3 依赖 Task 2（需要账号管理 API）
- Task 5-9（前端任务）依赖 Task 4（需要设计系统组件）
- Task 7 依赖 Task 3（需要后端邮件 API）
- Task 8 依赖 Task 3（需要后端邮件详情 API）
- Task 9 依赖 Task 3（需要后端发送 API）
- Task 10 依赖 Task 1-9 全部完成

# 可并行执行
- Task 1 和 Task 4 可并行启动
- Task 5、Task 6、Task 7、Task 8、Task 9 可在 Task 4 完成后并行开发