@echo off
title Cloudflare Workers浏览器 - 测试部署工具
chcp 65001 > nul

echo ======================================
echo   Cloudflare Workers浏览器测试工具
echo ======================================
echo.

REM 检查Node.js是否安装
node --version > nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js未安装，请先安装Node.js
    echo 📥 下载地址: https://nodejs.org/
    pause
    exit /b
)

REM 检查Wrangler是否安装
wrangler --version > nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 正在安装Wrangler CLI...
    npm install -g wrangler
)

echo ✅ 环境检查完成
echo.

:menu
cls
echo ======================================
echo   请选择操作:
echo ======================================
echo 1. 本地开发服务器 (localhost:8787)
echo 2. 预览部署 (临时域名)
echo 3. 正式部署到Cloudflare
echo 4. 检查部署状态
echo 5. 查看日志
echo 6. 配置自定义域名
echo 7. 退出
echo.
set /p choice="请选择 (1-7): "

goto option%choice%

:option1
echo 🚀 启动本地开发服务器...
wrangler dev
pause
goto menu

:option2
echo 🔍 创建预览部署...
wrangler deploy --env staging
if %errorlevel% neq 0 (
    echo ❌ 预览部署失败，请检查配置
) else (
    echo ✅ 预览部署成功！
)
pause
goto menu

:option3
echo 🌐 部署到生产环境...
echo ⚠️  这将部署到生产环境，是否继续？(Y/N)
set /p confirm=
if /i "%confirm%"=="Y" (
    wrangler deploy --env production
    if %errorlevel% neq 0 (
        echo ❌ 生产部署失败
    ) else (
        echo ✅ 生产部署成功！
    )
)
pause
goto menu

:option4
echo 📊 检查部署状态...
wrangler tail
pause
goto menu

:option5
echo 📝 查看实时日志...
wrangler tail --format pretty
pause
goto menu

:option6
echo 🔧 自定义域名配置...
echo 1. 请先在Cloudflare控制台添加您的域名
echo 2. 编辑 wrangler.toml 文件，取消域名配置的注释
echo 3. 修改为您的实际域名
echo.
echo 📋 需要修改的文件: wrangler.toml
echo 📝 需要取消注释的行:
echo    [[env.production.routes]]
echo    pattern = "browser.yourdomain.com/*"
echo    custom_domain = true
echo.
pause
goto menu

:option7
echo 👋 感谢使用！
timeout /t 2 > nul
exit /b