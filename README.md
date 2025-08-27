# Cloudflare Workers 浏览器

## 项目介绍

这是一个基于Cloudflare Workers的云端浏览器，通过代理方式访问网页内容，无需安装任何软件即可使用。

## 功能特性

- 🌐 基于Cloudflare Workers的全球CDN
- 🎯 支持网站访问
- 🎨 现代化界面设计

## 部署步骤

## 手动部署

如果您希望手动部署项目，可以按照以下步骤操作：

### 1. 准备工作

- 注册Cloudflare账号：<https://dash.cloudflare.com/sign-up>

### 2. 创建Cloudflare Workers脚本

登录到Cloudflare仪表板，导航到Workers部分，随便创建一个Worker，然后点击编辑代码。

### 3. 复制代码

将 `cloudusebrowser.js` 文件的内容复制到Worker编辑器中。

## 自动部署（也许太复杂不建议）

如果您希望自动部署项目，可以按照以下步骤操作：

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

### 3. 配置项目

如有需要，更新 `wrangler.toml` 配置：

```toml
name = "cloudusebrowser"
main = "cloudusebrowser.js"  
compatibility_date = "" # 更新此行
compatibility_flags = ["nodejs_compat"]

# ... 其他配置保持不变
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

## 项目结构

```text
cloudflare-browser/
├── cloudusebrowser.js    # 主Workers脚本
├── wrangler.toml               # Cloudflare配置
├── package-cloudflare.json     # 依赖配置
├── README.md            # 项目说明
└── LICENSE            # 项目许可证
```

## 注意事项

### 安全限制

- 某些网站可能阻止代理访问
- 不支持JavaScript重定向的复杂网站
- 部分HTTPS网站可能有证书问题

## 许可证

本项目采用 GNU General Public License v3.0 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 技术支持

- Cloudflare Workers文档：<https://developers.cloudflare.com/workers/>
- Wrangler CLI文档：<https://developers.cloudflare.com/workers/wrangler/>

## Pull Request 说明

我们欢迎社区贡献！如果您希望为项目贡献代码，请遵循以下步骤：

### 提交 Pull Request

1. Fork 本项目到您的 GitHub 账户
2. 创建一个新的分支进行开发
3. 提交您的更改并推送分支到您的 Fork
4. 在原项目中创建 Pull Request

### 代码贡献指南

- 请确保您的代码符合项目的编码规范
- 提供清晰的提交信息，说明您的更改内容
- 测试您的更改，确保不会引入新的问题

### 问题反馈

如果您在使用过程中遇到问题或有建议，请通过 `[Issues]` 反馈。(不一定能得到回复)

## 贡献者

## 致谢

- 感谢 Cloudflare 提供的强大平台
- 感谢所有贡献者的努力

## 联系我们

## 项目状态

- 开发中
