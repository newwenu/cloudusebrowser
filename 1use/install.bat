@echo off
echo 正在安装简单浏览器...
echo.

:: 检查是否安装了Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误：未检测到Node.js
    echo 请先安装Node.js：https://nodejs.org/
    pause
    exit /b 1
)

echo 正在安装依赖...
npm install

if %errorlevel% neq 0 (
    echo 安装失败！
    pause
    exit /b 1
)

echo.
echo 安装完成！
echo 运行以下命令启动浏览器：
echo npm start
echo.
pause