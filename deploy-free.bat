@echo off
echo Cloudflare Workers ��Ѽƻ�����ű�
echo ======================================
echo.

echo [���� 1] ��黷��...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ? ���Ȱ�װNode.js: https://nodejs.org/
    pause
    exit /b 1
)

echo [���� 2] ������Ŀ�ļ�...
copy package-cloudflare.json package.json >nul
copy cloudflare-browser.js index.js >nul

echo [���� 3] ��װ����...
npm install --silent

echo [���� 4] ��¼Cloudflare...
echo ���δ��¼����������Զ���Cloudflare��¼ҳ��...
wrangler login

echo [���� 5] ����Cloudflare...
echo ���ڲ�����Ѽƻ�...
wrangler deploy --env="" --name cloudflare-browser


echo.
echo ? ������ɣ�
echo.
echo �����ƶ�������Ѳ���ɹ���
echo ���ʵ�ַ����ʾ������������
echo.
echo ? ��ʾ��
echo - ��Ѽƻ���һЩ���ƣ�������������ȫ����
echo - �����Զ�������������Cloudflare����̨������
echo - ʹ�� 'wrangler tail' �鿴ʵʱ��־
pause