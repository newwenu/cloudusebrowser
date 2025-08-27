# Cloudflare Workers 浏览器部署指南

## 项目介绍

这是一个基于Cloudflare Workers的云端浏览器，通过代理方式访问网页内容，无需安装任何软件即可使用。

## 功能特性

- 🌐 基于Cloudflare Workers的全球CDN
- 🔒 安全的代理访问
- 📱 响应式设计，支持移动设备
- ⚡ 快速加载和缓存
- 🎯 支持任意网站访问
- 🎨 现代化界面设计

## 部署步骤

### 1. 准备工作

- 注册Cloudflare账号：<https://dash.cloudflare.com/sign-up>

- 安装Wrangler CLI：

```bash
npm install -g wrangler
```

### 2. 登录Cloudflare

```bash
wrangler login
```

### 3. 创建Workers项目

```bash
# 复制配置文件
cp package-cloudflare.json package.json
cp cloudflare-browser.js index.js

# 安装依赖
npm install
```

### 4. 本地测试

```bash
wrangler dev
```

访问 <http://127.0.0.1:8787> 测试浏览器功能

### 5. 部署到云端

```bash
wrangler deploy
```

### 6. 自定义域名（可选）

1. 在Cloudflare Dashboard中添加自定义域名

2. 修改 `wrangler.toml` 中的routes配置：

```toml
routes = [
  { pattern = "browser.yourdomain.com/*", zone_name = "yourdomain.com" }
]
```

3. 重新部署：

```bash
wrangler deploy
```

## 使用方法

### 基本使用

1. 访问部署后的URL（如：<https://your-worker.your-subdomain.workers.dev）>
2. 在地址栏输入要访问的网址
3. 点击"前往"或使用回车键加载页面

### 快捷键

- `Ctrl+L`：聚焦地址栏
- `Ctrl+R`：刷新页面
- `Alt+←`：后退
- `Alt+→`：前进
- `Enter`：在地址栏按回车访问网页

### 设置选项

- 深色模式：切换界面主题
- 移动模式：模拟移动设备浏览

## 注意事项

### 1. 安全限制

- 某些网站可能阻止代理访问
- 不支持JavaScript重定向的复杂网站
- 部分HTTPS网站可能有证书问题

### 2. 性能优化

- Cloudflare Workers有每日请求限制（免费版10万次/天）
- 大文件下载可能受限
- 建议启用Cloudflare缓存提高性能

### 3. 法律合规

- 请遵守当地法律法规
- 不要用于访问违法内容
- 尊重网站robots.txt规则

## 故障排除

### 常见问题

1. **部署失败**：检查wrangler配置是否正确
2. **网站无法访问**：确认目标网站是否允许代理
3. **样式错乱**：某些网站可能有防代理措施

### 调试方法

```bash
# 查看实时日志
wrangler tail

# 本地调试
wrangler dev --log-level debug
```

## 项目结构

```textplain
cloudflare-browser/
├── cloudflare-browser.js    # 主Workers脚本
├── wrangler.toml            # Cloudflare配置
├── package-cloudflare.json  # 依赖配置
└── CLOUDFLARE_DEPLOY.md     # 部署指南
```

## 更新和维护

1. 修改代码后重新部署：

```bash
wrangler deploy
```

2. 监控使用情况：

```bash
wrangler tail
```

## 技术支持

- Cloudflare Workers文档：<https://developers.cloudflare.com/workers/>
- Wrangler CLI文档：<https://developers.cloudflare.com/workers/wrangler/>
- 项目Issues：在GitHub上提交问题

## 免费额度

- 每日请求：100,000次
- CPU时间：30秒/请求
- 内存：128MB
- 网络：100GB/月

## 高级配置

如需更高级的功能（如用户认证、访问日志、缓存策略等），可以扩展Workers脚本。
