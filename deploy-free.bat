@echo off
echo Cloudflare Workers 免费计划部署脚本
echo ======================================
echo.

echo [步骤 1] 检查环境...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ? 请先安装Node.js: https://nodejs.org/
    pause
    exit /b 1
)

echo [步骤 2] 配置项目文件...
copy package-cloudflare.json package.json >nul
copy cloudflare-browser.js index.js >nul

echo [步骤 3] 安装依赖...
npm install --silent

echo [步骤 4] 登录Cloudflare...
echo 如果未登录，浏览器将自动打开Cloudflare登录页面...
wrangler login

echo [步骤 5] 部署到Cloudflare...
echo 正在部署到免费计划...
wrangler deploy --env="" --name cloudflare-browser


echo.
echo ? 部署完成！
echo.
echo 您的云端浏览器已部署成功！
echo 访问地址将显示在上面的输出中
echo.
echo ? 提示：
echo - 免费计划有一些限制，但基本功能完全可用
echo - 如需自定义域名，请在Cloudflare控制台中配置
echo - 使用 'wrangler tail' 查看实时日志
pause