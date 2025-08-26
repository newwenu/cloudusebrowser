@echo off
echo Cloudflare Workers 部署脚本
echo =================================
echo.

:: 检查Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 未检测到Node.js
    echo 请先安装Node.js: https://nodejs.org/
    pause
    exit /b 1
)

:: 检查Wrangler
wrangler --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 正在安装Wrangler...
    npm install -g wrangler
)

echo.
echo 1. 配置Cloudflare项目...

:: 备份原始文件
copy package-cloudflare.json package.json >nul
copy cloudflare-browser.js index.js >nul

echo 2. 安装依赖...
npm install

echo 3. 登录Cloudflare...
wrangler login

echo 4. 本地测试...
echo 正在启动本地测试服务器...
echo 请访问 http://localhost:8787 进行测试
echo 按 Ctrl+C 停止测试服务器...
echo.
wrangler dev --env=""

echo.
echo 5. 部署到生产环境...
echo 正在部署到Cloudflare Workers...
wrangler deploy --env=""

echo.
echo 部署完成！
echo 请查看 wrangler.toml 配置的URL进行访问
echo.
pause