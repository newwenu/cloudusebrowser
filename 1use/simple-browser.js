const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let viewWindow;

function createWindow() {
  // 创建主窗口
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, 'icon.png'),
    show: false
  });

  // 创建浏览器界面
  const browserHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>简单浏览器</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
        }
        
        .browser-container {
            display: flex;
            flex-direction: column;
            height: 100vh;
        }
        
        .toolbar {
            background: #2c3e50;
            padding: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .nav-button {
            background: #3498db;
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.3s;
        }
        
        .nav-button:hover {
            background: #2980b9;
        }
        
        .nav-button:disabled {
            background: #7f8c8d;
            cursor: not-allowed;
        }
        
        .url-bar {
            flex: 1;
            padding: 8px 12px;
            border: 1px solid #bdc3c7;
            border-radius: 4px;
            font-size: 14px;
            outline: none;
        }
        
        .url-bar:focus {
            border-color: #3498db;
        }
        
        .webview-container {
            flex: 1;
            position: relative;
            background: white;
        }
        
        #webview {
            width: 100%;
            height: 100%;
            border: none;
        }
        
        .loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 18px;
            color: #7f8c8d;
        }
        
        .status-bar {
            background: #ecf0f1;
            padding: 5px 10px;
            font-size: 12px;
            color: #7f8c8d;
            border-top: 1px solid #bdc3c7;
        }
    </style>
</head>
<body>
    <div class="browser-container">
        <div class="toolbar">
            <button class="nav-button" id="backBtn" onclick="goBack()">← 后退</button>
            <button class="nav-button" id="forwardBtn" onclick="goForward()">→ 前进</button>
            <button class="nav-button" onclick="refreshPage()">↻ 刷新</button>
            <button class="nav-button" onclick="goHome()">🏠 主页</button>
            <input type="text" class="url-bar" id="urlBar" placeholder="输入网址..." 
                   onkeypress="handleUrlKeyPress(event)">
            <button class="nav-button" onclick="navigateToUrl()">前往</button>
        </div>
        
        <div class="webview-container">
            <webview id="webview" src="https://www.baidu.com" 
                     nodeintegration="false"
                     webpreferences="contextIsolation=yes"></webview>
            <div class="loading" id="loading">加载中...</div>
        </div>
        
        <div class="status-bar" id="statusBar">
            准备就绪
        </div>
    </div>

    <script>
        const webview = document.getElementById('webview');
        const urlBar = document.getElementById('urlBar');
        const backBtn = document.getElementById('backBtn');
        const forwardBtn = document.getElementById('forwardBtn');
        const loading = document.getElementById('loading');
        const statusBar = document.getElementById('statusBar');

        // 初始化
        webview.addEventListener('dom-ready', () => {
            loading.style.display = 'none';
            updateNavButtons();
            urlBar.value = webview.getURL();
            statusBar.textContent = '页面加载完成';
        });

        webview.addEventListener('did-start-loading', () => {
            loading.style.display = 'block';
            statusBar.textContent = '正在加载...';
        });

        webview.addEventListener('did-stop-loading', () => {
            loading.style.display = 'none';
            updateNavButtons();
            urlBar.value = webview.getURL();
            statusBar.textContent = '加载完成';
        });

        webview.addEventListener('did-fail-load', (event) => {
            loading.style.display = 'none';
            statusBar.textContent = '加载失败: ' + event.errorDescription;
        });

        webview.addEventListener('new-window', (event) => {
            event.preventDefault();
            webview.src = event.url;
        });

        // 导航功能
        function goBack() {
            if (webview.canGoBack()) {
                webview.goBack();
            }
        }

        function goForward() {
            if (webview.canGoForward()) {
                webview.goForward();
            }
        }

        function refreshPage() {
            webview.reload();
        }

        function goHome() {
            webview.src = 'https://www.baidu.com';
        }

        function navigateToUrl() {
            let url = urlBar.value.trim();
            if (url) {
                if (!url.startsWith('http://') && !url.startsWith('https://')) {
                    url = 'https://' + url;
                }
                webview.src = url;
            }
        }

        function handleUrlKeyPress(event) {
            if (event.key === 'Enter') {
                navigateToUrl();
            }
        }

        function updateNavButtons() {
            backBtn.disabled = !webview.canGoBack();
            forwardBtn.disabled = !webview.canGoForward();
        }

        // 右键菜单
        window.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const { remote } = require('electron');
            const { Menu, MenuItem } = remote;
            
            const menu = new Menu();
            menu.append(new MenuItem({
                label: '返回',
                click: () => goBack(),
                enabled: webview.canGoBack()
            }));
            menu.append(new MenuItem({
                label: '前进',
                click: () => goForward(),
                enabled: webview.canGoForward()
            }));
            menu.append(new MenuItem({ type: 'separator' }));
            menu.append(new MenuItem({
                label: '刷新',
                click: () => refreshPage()
            }));
            menu.popup();
        });
    </script>
</body>
</html>
  `;

  // 将HTML保存到文件
  fs.writeFileSync(path.join(__dirname, 'browser.html'), browserHTML);

  // 加载浏览器界面
  mainWindow.loadFile('browser.html');

  // 窗口准备好后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // 窗口关闭事件
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 创建菜单
  createMenu();
}

function createMenu() {
  const template = [
    {
      label: '文件',
      submenu: [
        {
          label: '新建窗口',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            createWindow();
          }
        },
        {
          label: '退出',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: '查看',
      submenu: [
        { role: 'reload' },
        { role: 'forcereload' },
        { role: 'toggledevtools' },
        { type: 'separator' },
        { role: 'resetzoom' },
        { role: 'zoomin' },
        { role: 'zoomout' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: '导航',
      submenu: [
        {
          label: '后退',
          accelerator: 'Alt+Left',
          click: () => {
            if (mainWindow && mainWindow.webContents) {
              mainWindow.webContents.send('navigate-back');
            }
          }
        },
        {
          label: '前进',
          accelerator: 'Alt+Right',
          click: () => {
            if (mainWindow && mainWindow.webContents) {
              mainWindow.webContents.send('navigate-forward');
            }
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// 应用事件
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC通信
ipcMain.handle('get-version', () => {
  return app.getVersion();
});

ipcMain.handle('open-external', (event, url) => {
  shell.openExternal(url);
});