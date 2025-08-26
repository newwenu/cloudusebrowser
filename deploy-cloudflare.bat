@echo off
echo Cloudflare Workers ����ű�
echo =================================
echo.

:: ���Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo δ��⵽Node.js
    echo ���Ȱ�װNode.js: https://nodejs.org/
    pause
    exit /b 1
)

:: ���Wrangler
wrangler --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ���ڰ�װWrangler...
    npm install -g wrangler
)

echo.
echo 1. ����Cloudflare��Ŀ...

:: ����ԭʼ�ļ�
copy package-cloudflare.json package.json >nul
copy cloudflare-browser.js index.js >nul

echo 2. ��װ����...
npm install

echo 3. ��¼Cloudflare...
wrangler login

echo 4. ���ز���...
echo �����������ز��Է�����...
echo ����� http://localhost:8787 ���в���
echo �� Ctrl+C ֹͣ���Է�����...
echo.
wrangler dev --env=""

echo.
echo 5. ������������...
echo ���ڲ���Cloudflare Workers...
wrangler deploy --env=""

echo.
echo ������ɣ�
echo ��鿴 wrangler.toml ���õ�URL���з���
echo.
pause