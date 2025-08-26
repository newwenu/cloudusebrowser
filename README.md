# Cloudflare Workers 云端浏览器

🌐 **基于Cloudflare Workers的现代化云端浏览器**

![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?style=for-the-badge&logo=cloudflare)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=for-the-badge&logo=javascript)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## ✨ 功能特性

- 🚀 **基于Cloudflare Workers** - 全球CDN加速，毫秒级响应
- 🔒 **安全代理访问** - 通过代理方式安全访问任意网站
- 📱 **响应式设计** - 完美支持桌面、平板、手机
- 🎨 **现代化界面** - 美观易用的浏览器界面
- 🧭 **完整导航功能** - 前进、后退、刷新、主页
- 🔖 **书签管理** - 本地存储书签，快速访问
- 📜 **历史记录** - 完整的浏览历史记录
- ⚙️ **个性化设置** - 深色模式、移动模式切换
- ⌨️ **快捷键支持** - 类似传统浏览器的快捷键
- 🎯 **智能搜索** - 地址栏直接搜索
- 📊 **性能监控** - 实时加载进度显示

## 🚀 快速开始

### 方法1：一键部署（推荐）

双击运行 `deploy-cloudflare.bat` 或 `test-cloudflare.bat` 按提示操作

### 方法2：手动部署

```bash
# 1. 安装Wrangler CLI
npm install -g wrangler

# 2. 登录Cloudflare
wrangler login

# 3. 部署到Cloudflare Workers
wrangler deploy

# 4. 启动本地开发服务器（可选）
wrangler dev
```

### 方法3：使用现有文件

1. 复制 `cloudflare-browser.js` 和 `wrangler.toml` 到您的项目
2. 运行 `wrangler deploy`

## 📁 项目结构

```
cloudflare-browser/
├── cloudflare-browser.js      # 主Workers脚本
├── wrangler.toml              # Cloudflare配置文件
├── package-cloudflare.json    # 依赖配置
├── deploy-cloudflare.bat      # 一键部署脚本
├── test-cloudflare.bat        # 测试部署脚本
├── CLOUDFLARE_DEPLOY.md       # 部署指南
└── README.md                  # 项目说明
```

## 🌐 使用方法

部署后访问您的Workers URL，例如：
```
https://your-browser.your-subdomain.workers.dev
```

### 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl/Cmd + L` | 聚焦地址栏 |
| `Ctrl/Cmd + R` | 刷新页面 |
| `Alt + ←` | 后退 |
| `Alt + →` | 前进 |

### 设置选项

- **深色模式**：切换明暗主题
- **移动模式**：模拟移动设备浏览
- **书签管理**：添加和管理常用网站
- **历史记录**：查看浏览历史

## 🔧 高级配置

### 自定义域名

1. 在 `wrangler.toml` 中取消域名配置的注释
2. 修改为您的实际域名
3. 在Cloudflare控制台添加域名DNS记录

```toml
[[env.production.routes]]
pattern = "browser.yourdomain.com/*"
custom_domain = true
```

### 环境变量

在 `wrangler.toml` 中配置：

```toml
[vars]
DEFAULT_HOMEPAGE = "https://www.google.com"
ALLOWED_ORIGINS = "*"
```

### KV存储（可选）

用于存储用户设置和书签：

```toml
[[kv_namespaces]]
binding = "BROWSER_DATA"
id = "your-kv-namespace-id"
```

## 🧪 开发指南

### 本地开发

```bash
# 启动开发服务器
npm run dev

# 或直接使用wrangler
wrangler dev
```

访问 http://localhost:8787 查看效果

### 测试部署

```bash
# 预览部署（临时域名）
wrangler deploy --env staging

# 查看日志
wrangler tail --format pretty
```

## 📊 性能优化

- ✅ **全球CDN** - 基于Cloudflare全球网络
- ✅ **缓存策略** - 智能缓存静态资源
- ✅ **压缩传输** - Gzip/Brotli压缩
- ✅ **图片优化** - 自动WebP格式转换
- ✅ **HTTP/3支持** - 最新网络协议

## 🔒 安全特性

- ✅ **HTTPS强制** - 免费SSL证书
- ✅ **CSP策略** - 内容安全策略
- ✅ **XSS防护** - 跨站脚本攻击防护
- ✅ **CORS配置** - 跨域资源共享
- ✅ **内容过滤** - 可选的内容过滤

## 📱 浏览器兼容性

| 浏览器 | 支持状态 |
|--------|----------|
| Chrome | ✅ 完全支持 |
| Firefox | ✅ 完全支持 |
| Safari | ✅ 完全支持 |
| Edge | ✅ 完全支持 |
| 移动端浏览器 | ✅ 完全支持 |

## 🐛 常见问题

### Q: 部署失败怎么办？
A: 检查以下几点：
- 确认已安装Wrangler CLI
- 确认已登录Cloudflare账号
- 检查 `wrangler.toml` 配置是否正确

### Q: 某些网站无法访问？
A: 由于CORS限制，某些网站可能无法通过代理访问。这是浏览器的安全机制。

### Q: 如何自定义首页？
A: 修改 `wrangler.toml` 中的 `DEFAULT_HOMEPAGE` 变量。

### Q: 如何添加更多功能？
A: 查看 `cloudflare-browser.js` 文件，所有功能都支持扩展。

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙋‍♂️ 支持

- 📧 邮箱：support@example.com
- 💬 讨论区：[GitHub Discussions](https://github.com/your-repo/discussions)
- 🐛 问题报告：[GitHub Issues](https://github.com/your-repo/issues)

---

<div align="center">
  <p>⭐ 如果这个项目对您有帮助，请给我们一个星标！</p>
  <p><strong>Made with ❤️ for Cloudflare Workers</strong></p>
</div>