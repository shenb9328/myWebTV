# MyWebTV (MoonTV 局域网私有影院)

一个专为家庭局域网与私有云打造的现代化 Web 影视聚合平台。支持纯源码直接部署运行（Node.js / pnpm），亦支持 Docker 一键部署。完美适配电视、iPad、手机（PWA 独立运行）与 PC。

---

## 🌟 核心特性与深度优化

- ⚡ **双模部署支持**：
  - **原生部署（无需 Docker）**：只需 Node.js 18+ 与 Redis，即可通过 `pnpm install && pnpm build && pnpm start` 直接跑在裸机/VPS/NAS 上。
  - **Docker 部署**：包含预调优的 `docker-compose.yml`，一键拉起。
- 🎬 **本地私有影库秒播**：直连本地 MacCMS V10 VOD API，局域网搜索、选集与播放 0.2 秒级极速响应。
- 📱 **完整 PWA 深度适配**：
  - 支持 **iPhone / iPad / Android / 桌面端**「添加到主屏幕」作为独立 App（Standalone）运行。
  - 全面屏沉浸式无边框浏览（支持黑色半透明状态栏与安全区适配）。
  - 彻底解决 Service Worker / Workbox 认证拦截与断网离线闪烁问题。
- 🎯 **与 TVBox 一致的层级化分类筛选**：
  - 侧边栏及移动底栏去除了多余的“自定义”入口，结构纯粹清爽。
  - 年代筛选细化，支持 **2026、2025、2024...** 及多维度排序（热门/最新/高分）。
- 📺 **CCTV-6 往期电影点播台集成**：
  - 一级导航栏新增 `CCTV6` 分类（桌面端位于“搜索”与“电影”之间，移动端位于“首页”与“电影”之间）。
  - 穿透反代直连时移点播服务（跨零点无缝自动回放），支持 iPad、手机与电视大屏点播。
  - 附带 `scripts/patch_moontv.sh` 热注入补丁，支持对已运行的 Docker MoonTV 实例秒级无缝升级。
- 🚀 **极低资源消耗**：内存占用仅 40M~60M，即便是 1GB 内存的小型 VPS 搭配 Swap 也能长期稳定运行。

---

## 🛠️ 环境要求

- **Node.js**：`18.17.0` 或更高版本（推荐 Node 20 LTS）
- **包管理器**：`pnpm`（推荐）或 `npm`
- **Redis 服务**：本地或云端 Redis 实例（用于影视源配置及用户鉴权持久化）

---

## 🚀 方式一：源码直接部署（无需 Docker）

### 1. 克隆代码

```bash
git clone git@github.com:shenb9328/mywebtv.git
cd mywebtv
```

### 2. 安装依赖

```bash
# 全局安装 pnpm（如尚未安装）
npm install -g pnpm

# 安装项目依赖
pnpm install
```

### 3. 配置环境变量

在项目根目录下创建 `.env.local` 文件：

```ini
# 存储模式
NEXT_PUBLIC_STORAGE_TYPE=redis

# Redis 连接地址
REDIS_URL=redis://localhost:6379

# 管理员账密
USERNAME=admin
PASSWORD=admin123456

# 网站名称
NEXT_PUBLIC_SITE_NAME=MoonTV 局域网影院

# 运行端口与主机
PORT=3008
HOSTNAME=0.0.0.0
```

### 4. 编译与启动

```bash
# 1. 编译生产代码（构建时会自动生成标准 PWA Manifest）
pnpm build

# 2. 启动服务
pnpm start
```

访问地址：`http://<服务器IP>:3008`

> 💡 **后台守护运行推荐使用 PM2**：
> ```bash
> npm install -g pm2
> pm2 start npm --name "mywebtv" -- run start
> pm2 save
> pm2 startup
> ```

---

## 🐳 方式二：Docker 一键部署

若你在具备 Docker 的宿主机或 NAS 上：

```bash
cd mywebtv
chmod +x deploy.sh patch_moontv.sh
./deploy.sh
```

---

## 📲 iPad / 移动端 PWA 安装体验

1. 使用 iPad 或 iPhone 上的 Safari 浏览器打开 `http://<服务器IP>:3008`。
2. 点击顶栏/底栏的 **「分享」** 按钮，选择 **「添加到主屏幕」**。
3. 返回桌面点击图标，即可享受**无 Safari 地址栏、纯净沉浸式全屏**的独立 App 观影体验。

---

## 📁 目录架构说明

```text
.
├── src/
│   ├── app/                 # Next.js App Router 路由页面及 API
│   ├── components/          # 播放器、分类筛选器、虚拟滚动网格、侧边栏
│   ├── lib/                 # 豆瓣客户端、影视源解析引擎、鉴权系统
│   └── middleware.ts        # 全局鉴权与 PWA 静态资源放行中间件
├── public/                  # PWA Manifest、全尺寸高清图标、Service Worker
├── scripts/                 # 构建与 Manifest 自动生成脚本
├── docker-compose.yml       # Docker 编排配置
├── deploy.sh                # 容器化快速部署脚本
├── moontv-admin-config.json # 调优后的影视源与系统配置备份
├── package.json             # 依赖管理
└── next.config.js           # Next.js 生产优化配置
```

---

## 📄 开源许可

本项目基于开源项目进行定制优化。
