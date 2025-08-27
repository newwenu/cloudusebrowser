// clouduser Workers 浏览器代理服务
// 部署到 clouduser Workers 的浏览器功能

// 添加Workers日志包装器
const logger = {
  log: (...args) => {
    console.log('[WORKERS]', new Date().toISOString(), ...args);
  },
  error: (...args) => {
    console.error('[WORKERS ERROR]', new Date().toISOString(), ...args);
  },
  info: (...args) => {
    console.info('[WORKERS INFO]', new Date().toISOString(), ...args);
  }
};


// addEventListener('fetch', event => {
//   event.respondWith(handleRequest(event.request))
// });
addEventListener('fetch', event => {
  logger.log('收到请求:', event.request.url);
  event.respondWith(handleRequest(event.request));
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // 如果是根路径或浏览器界面，返回浏览器界面
  if (url.pathname === '/' || url.pathname === '/browser' || url.pathname === '/welcome') {
    return new Response(getBrowserHTML(), {
      headers: { 'Content-Type': 'text/html;charset=UTF-8' }
    })
  }
  
  // 如果是代理请求
  if (url.pathname.startsWith('/proxy/')) {
    return handleProxyRequest(request)
  }
  
  // 如果是API请求
  if (url.pathname.startsWith('/api/')) {
    return handleAPIRequest(request)
  }
  
  // 静态资源
  if (url.pathname.startsWith('/static/')) {
    return handleStaticRequest(request)
  }
  
  return new Response('Not Found', { status: 404 })
}

async function handleProxyRequest(request) {
  const url = new URL(request.url)
  const targetUrl = decodeURIComponent(url.pathname.replace('/proxy/', ''))
  
  if (!targetUrl.startsWith('http')) {
    return new Response('Invalid URL', { status: 400 })
  }
  
  try {
    const proxyResponse = await fetch(targetUrl, {
      method: request.method,
      headers: {
        'User-Agent': 'clouduser-Browser/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      redirect: 'follow'
    })
    
    const contentType = proxyResponse.headers.get('content-type') || ''
    
    if (contentType.includes('text/html')) {
      let html = await proxyResponse.text()
      
      // 修改HTML中的链接，使其通过代理访问
      html = html.replace(/href="(http[s]?:\/\/[^"]+)"/g, (match, url) => {
        return `href="/proxy/${encodeURIComponent(url)}"`
      })
      
      html = html.replace(/src="(http[s]?:\/\/[^"]+)"/g, (match, url) => {
        return `src="/proxy/${encodeURIComponent(url)}"`
      })
      
      html = html.replace(/action="(http[s]?:\/\/[^"]+)"/g, (match, url) => {
        return `action="/proxy/${encodeURIComponent(url)}"`
      })
      
      return new Response(html, {
        status: proxyResponse.status,
        statusText: proxyResponse.statusText,
        headers: {
          'Content-Type': 'text/html;charset=UTF-8',
          'Access-Control-Allow-Origin': '*'
        }
      })
    } else {
      // 非HTML内容直接返回
      return new Response(proxyResponse.body, {
        status: proxyResponse.status,
        statusText: proxyResponse.statusText,
        headers: {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*'
        }
      })
    }
  } catch (error) {
    return new Response(`代理错误: ${error.message}`, { 
      status: 500,
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' }
    })
  }
}

async function handleAPIRequest(request) {
  const url = new URL(request.url)
  
  if (url.pathname === '/api/status') {
    return new Response(JSON.stringify({
      status: 'online',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  if (url.pathname === '/api/health') {
    return new Response(JSON.stringify({
      healthy: true,
      uptime: Date.now()
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  return new Response('API Not Found', { status: 404 })
}

async function handleStaticRequest(request) {
  const url = new URL(request.url)
  const filePath = url.pathname.replace('/static/', '')
  
  const staticFiles = {
    'style.css': {
      content: getCSS(),
      type: 'text/css'
    },
    'script.js': {
      content: getJS(),
      type: 'application/javascript'
    },
    'favicon.ico': {
      content: getFavicon(),
      type: 'image/x-icon'
    }
  }
  
  const file = staticFiles[filePath]
  if (file) {
    return new Response(file.content, {
      headers: { 
        'Content-Type': file.type,
        'Cache-Control': 'public, max-age=3600'
      }
    })
  }
  
  return new Response('File Not Found', { status: 404 })
}

function getBrowserHTML() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>clouduser 浏览器</title>
    <style>${getCSS()}</style>
    <link rel="icon" href="/static/favicon.ico">
</head>
<body>
    <div class="browser-container">
        <header class="header">
            <h1>clouduser 浏览器</h1>
            <div class="toolbar">
                <button class="nav-btn back-btn" id="backBtn" title="后退">←</button>
                <button class="nav-btn forward-btn" id="forwardBtn" title="前进">→</button>
                <button class="nav-btn refresh-btn" id="refreshBtn" title="刷新">↻</button>
                <button class="nav-btn home-btn" id="homeBtn" title="主页">🏠</button>
                <div class="url-container">
                    <input type="text" id="urlBar" placeholder="输入网址..." />
                    <button class="go-btn" id="goBtn">前往</button>

                </div>
                <button class="nav-btn settings-btn" id="settingsBtn" title="设置">⚙️</button>
            </div>
        </header>
        
        <main class="main-content">
            <div id="welcomeScreen" class="welcome-screen">
                <div class="welcome-content">
                    <h2>欢迎使用 clouduser 浏览器</h2>
                    <p>基于 clouduser Workers 的轻量级浏览器</p>
                    <div class="quick-links">
                        <button class="quick-link-btn" data-url="https://www.baidu.com">百度</button>
                        <button class="quick-link-btn" data-url="https://www.google.com">Google</button>
                        <button class="quick-link-btn" data-url="https://github.com">GitHub</button>
                        <button class="quick-link-btn" data-url="https://www.bing.com">Bing</button>
                    </div>
                </div>
            </div>
            
            <div id="loading" class="loading" style="display: none;">
                <div class="spinner"></div>
                <p>正在加载页面...</p>
            </div>
            
            <div id="error" class="error" style="display: none;">
                <h3>加载失败</h3>
                <p id="errorMessage">无法加载页面</p>
                <button onclick="window.browser.refresh()">重试</button>
            </div>
            
            <iframe id="browserFrame" style="display: none;"></iframe>
        </main>
        
        <footer class="footer">
            <div class="status-bar">
                <span id="statusText">准备就绪</span>
                <span id="urlDisplay"></span>
            </div>
        </footer>
        
        <div id="settingsPanel" class="settings-panel" style="display: none;">
            <div class="settings-content">
                <h3>设置</h3>
                <label>
                    <input type="checkbox" id="darkMode" />
                    深色模式
                </label>
                <label>
                    <input type="checkbox" id="mobileMode" />
                    移动模式
                </label>
                <button id="closeSettings">关闭</button>
            </div>
        </div>
    </div>
    
    <script>${getJS()}</script>
</body>
</html>`
}

function getCSS() {
  return `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
    background: #f5f5f5;
    height: 100vh;
    overflow: hidden;
}

.browser-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

.header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 15px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.header h1 {
    font-size: 20px;
    margin-bottom: 10px;
    text-align: center;
}

.toolbar {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
}

.nav-btn {
    background: rgba(255,255,255,0.2);
    border: none;
    color: white;
    padding: 8px 12px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    transition: transform 0.3s;
}

.nav-btn:hover {
    background: rgba(255,255,255,0.3);
}

.url-container {
    flex: 1;
    display: flex;
    min-width: 300px;
}

#urlBar {
    flex: 1;
    padding: 8px 12px;
    border: none;
    border-radius: 5px 0 0 5px;
    font-size: 14px;
    outline: none;
}

.go-btn {
    background: #4CAF50;
    color: white;
    border: none;
    padding: 8px 20px;
    border-radius: 0 5px 5px 0;
    cursor: pointer;
    font-size: 14px;
}

.main-content {
    flex: 1;
    position: relative;
    background: white;
    margin: 10px;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    overflow: hidden;
}

#browserFrame {
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 10px;
}

.loading, .error {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    background: white;
    padding: 40px;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.welcome-screen {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
}

.welcome-content {
    text-align: center;
    background: rgba(255,255,255,0.1);
    padding: 60px;
    border-radius: 20px;
    backdrop-filter: blur(10px);
    max-width: 500px;
}

.welcome-content h2 {
    font-size: 28px;
    margin-bottom: 20px;
}

.welcome-content p {
    font-size: 18px;
    margin-bottom: 30px;
    opacity: 0.9;
}

.quick-links {
    display: flex;
    gap: 15px;
    justify-content: center;
    flex-wrap: wrap;
}

.quick-links button {
    background: rgba(255,255,255,0.2);
    color: white;
    border: 1px solid rgba(255,255,255,0.3);
    padding: 12px 24px;
    border-radius: 25px;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.3s;
}

.quick-links button:hover {
    background: rgba(255,255,255,0.3);
    transform: translateY(-2px);
}

.spinner {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #667eea;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.error h3 {
    color: #e74c3c;
    margin-bottom: 10px;
}

.error button {
    background: #3498db;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    margin-top: 15px;
}

.footer {
    background: white;
    padding: 10px 20px;
    border-top: 1px solid #eee;
}

.status-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: #666;
}

.settings-panel {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    z-index: 1000;
}

.settings-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}

.settings-content h3 {
    margin-bottom: 20px;
}

.settings-content label {
    display: block;
    margin-bottom: 10px;
    cursor: pointer;
}

.settings-content input[type="checkbox"] {
    margin-right: 10px;
}

@media (max-width: 768px) {
    .toolbar {
        flex-direction: column;
        align-items: stretch;
    }
    
    .url-container {
        min-width: auto;
    }
    
    .header h1 {
        font-size: 18px;
    }
    
    .welcome-content {
        padding: 40px 20px;
        margin: 20px;
    }
    
    .quick-links {
        flex-direction: column;
    }
}

body.dark-mode {
    background: #1a1a1a;
    color: #fff;
}

body.dark-mode .main-content,
body.dark-mode .footer {
    background: #2d2d2d;
    color: #fff;
}

body.dark-mode #urlBar {
    background: #3d3d3d;
    color: #fff;
    border: 1px solid #555;
}

body.dark-mode .welcome-screen {
    background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
}

body.dark-mode .welcome-content {
    background: rgba(255,255,255,0.05);
}

body.dark-mode .quick-links button {
    background: rgba(255,255,255,0.1);
    border-color: rgba(255,255,255,0.2);
}

body.dark-mode .quick-links button:hover {
    background: rgba(255,255,255,0.2);
}`
}

function getJS() {
  return `class ClouduserBrowser {
    constructor() {
        this.currentUrl = '';
        this.history = [];
        this.bookmarks = [];
        this.settings = {
            darkMode: false,
            mobileMode: false
        };
        this.init();
    }

    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.applySettings();
        this.showWelcome();
    }

    setupEventListeners() {
        // 确保DOM完全加载后再绑定事件
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.bindEvents();
            });
        } else {
            this.bindEvents();
        }

        // 绑定键盘事件
        document.addEventListener('keydown', (e) => {
            const urlBar = document.getElementById('urlBar');
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'r': e.preventDefault(); this.refresh(); break;
                    case 'l': e.preventDefault(); urlBar.select(); break;
                }
            }
            if (e.key === 'F5') {
                e.preventDefault();
                this.refresh();
            }
        });
    }

    bindEvents() {
        const urlBar = document.getElementById('urlBar');
        const goBtn = document.getElementById('goBtn');
        const backBtn = document.getElementById('backBtn');
        const forwardBtn = document.getElementById('forwardBtn');
        const refreshBtn = document.getElementById('refreshBtn');
        const settingsBtn = document.getElementById('settingsBtn');
        const homeBtn = document.getElementById('homeBtn');
        const closeSettings = document.getElementById('closeSettings');
        const darkModeToggle = document.getElementById('darkMode');
        const mobileModeToggle = document.getElementById('mobileMode');

        console.log('开始绑定事件监听器...');
        console.log('找到的元素:', { urlBar, goBtn, backBtn, forwardBtn, refreshBtn, settingsBtn, homeBtn });

        if (urlBar) {
            urlBar.addEventListener('keypress', (e) => {
                console.log('URL栏按键:', e.key);
                if (e.key === 'Enter') {
                    console.log('按下Enter键，导航到:', urlBar.value);
                    this.navigate(urlBar.value);
                }
            });
        } else {
            console.error('未找到URL栏元素');
        }

        if (goBtn) {
            goBtn.addEventListener('click', () => {
                const urlBar = document.getElementById('urlBar');
                console.log("点击前往按钮，URL:", urlBar ? urlBar.value : '未找到URL栏');
                if (urlBar && urlBar.value.trim()) {
                    this.navigate(urlBar.value);
                }
            });
        } else {
            console.error('未找到前往按钮');
        }

        if (backBtn) backBtn.addEventListener('click', () => {
            console.log('点击后退按钮');
            this.goBack();
        });
        if (forwardBtn) forwardBtn.addEventListener('click', () => {
            console.log('点击前进按钮');
            this.goForward();
        });
        if (refreshBtn) refreshBtn.addEventListener('click', () => {
            console.log('点击刷新按钮');
            this.refresh();
        });
        if (settingsBtn) settingsBtn.addEventListener('click', () => {
            console.log('点击设置按钮');
            this.toggleSettings();
        });
        if (homeBtn) homeBtn.addEventListener('click', () => {
            console.log('点击主页按钮');
            this.showWelcome();
        });
        if (closeSettings) closeSettings.addEventListener('click', () => {
            console.log('点击关闭设置');
            this.toggleSettings();
        });
        if (darkModeToggle) darkModeToggle.addEventListener('change', () => {
            console.log('切换深色模式');
            this.toggleDarkMode();
        });
        if (mobileModeToggle) mobileModeToggle.addEventListener('change', () => {
            console.log('切换移动模式');
            this.toggleMobileMode();
        });

        // 绑定欢迎页面快速链接按钮
        const quickLinkBtns = document.querySelectorAll('.quick-link-btn');
        console.log('找到的快速链接按钮数量:', quickLinkBtns.length);
        quickLinkBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const url = e.target.getAttribute('data-url');
                console.log('点击快速链接:', url);
                if (url) {
                    this.navigate(url);
                }
            });
        });
    }

    showWelcome() {
        const welcomeScreen = document.getElementById('welcomeScreen');
        const browserFrame = document.getElementById('browserFrame');
        const loading = document.getElementById('loading');
        const error = document.getElementById('error');
        
        if (welcomeScreen) {
            welcomeScreen.style.display = 'flex';
        }
        if (browserFrame) browserFrame.style.display = 'none';
        if (loading) loading.style.display = 'none';
        if (error) error.style.display = 'none';
        
        document.getElementById('urlBar').value = '';
    }

    hideWelcome() {
        const welcomeScreen = document.getElementById('welcomeScreen');
        if (welcomeScreen) {
            welcomeScreen.style.display = 'none';
        }
    }

    navigate(url) {
        if (!url.trim()) return;
        
        const fullUrl = this.normalizeUrl(url);
        if (!this.isValidUrl(fullUrl)) {
            this.showError('无效的网址');
            return;
        }
        
        this.hideWelcome();
        this.showLoading();
        this.currentUrl = fullUrl;
        document.getElementById('urlBar').value = fullUrl;
        
        const frame = document.getElementById('browserFrame');
        frame.src = '/proxy/' + encodeURIComponent(fullUrl);
        
        this.addToHistory(fullUrl);
    }

    normalizeUrl(url) {
        if (!url.match(/^https?:\\/\\/\\//)) {
            url = 'https://' + url;
        }
        return url;
    }

    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    showLoading() {
        const loading = document.getElementById('loading');
        const frame = document.getElementById('browserFrame');
        const error = document.getElementById('error');
        
        if (loading) loading.style.display = 'block';
        if (frame) frame.style.display = 'none';
        if (error) error.style.display = 'none';
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        const frame = document.getElementById('browserFrame');
        
        if (loading) loading.style.display = 'none';
        if (frame) frame.style.display = 'block';
    }

    showError(message) {
        const error = document.getElementById('error');
        const loading = document.getElementById('loading');
        const frame = document.getElementById('browserFrame');
        
        if (error) {
            error.querySelector('h3').textContent = '加载失败';
            error.querySelector('p').textContent = message || '无法加载页面';
            error.style.display = 'block';
        }
        if (loading) loading.style.display = 'none';
        if (frame) frame.style.display = 'none';
    }

    goBack() {
        if (this.history.length > 1) {
            this.history.pop();
            const prevUrl = this.history[this.history.length - 1];
            this.navigate(prevUrl);
        }
    }

    goForward() {
        // 简化实现：重新加载当前URL
        this.refresh();
    }

    refresh() {
        if (this.currentUrl) {
            this.navigate(this.currentUrl);
        }
    }

    addToHistory(url) {
        if (this.history[this.history.length - 1] !== url) {
            this.history.push(url);
        }
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('browserSettings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.error('无法加载设置:', e);
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('browserSettings', JSON.stringify(this.settings));
        } catch (e) {
            console.error('无法保存设置:', e);
        }
    }

    applySettings() {
        document.getElementById('darkMode').checked = this.settings.darkMode;
        document.getElementById('mobileMode').checked = this.settings.mobileMode;
        
        if (this.settings.darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }

    toggleDarkMode() {
        this.settings.darkMode = !this.settings.darkMode;
        this.applySettings();
        this.saveSettings();
    }

    toggleMobileMode() {
        this.settings.mobileMode = !this.settings.mobileMode;
        this.saveSettings();
        // 这里可以添加移动模式的具体实现
    }

    toggleSettings() {
        const panel = document.getElementById('settingsPanel');
        panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
    }

    handleFrameLoad() {
        this.hideLoading();
    }

    handleFrameError() {
        this.showError('无法加载页面，请检查网址是否正确');
    }
}

function handleWelcomeClick(url) {
    if (window.browser) {
        window.browser.navigate(url);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM加载完成，初始化浏览器...');
    window.browser = new ClouduserBrowser();
    
    // 延迟绑定iframe事件，确保iframe已加载
    setTimeout(() => {
        const frame = document.getElementById('browserFrame');
        if (frame) {
            console.log('找到iframe元素，绑定加载事件');
            frame.addEventListener('load', () => {
                console.log('iframe加载完成');
                window.browser.handleFrameLoad();
            });
            frame.addEventListener('error', () => {
                console.error('iframe加载错误');
                window.browser.handleFrameError();
            });
        } else {
            console.error('未找到iframe元素');
        }
    }, 100);
    
    console.log('🌐 Cloudflare Browser 已启动');
    console.log('💡 提示: 输入网址开始浏览，使用快捷键提高效率');
});

`;
}
function getFavicon() {
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSIjNjY3ZWVhIi8+Cjx0ZXh0IHg9IjgiIHk9IjgiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9IjAuMyI+XDwvL3RleHQ+Cjwvc3ZnPgo=';
};