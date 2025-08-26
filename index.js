// Cloudflare Workers 浏览器代理服务
// 部署到 Cloudflare Workers 的浏览器功能

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // 如果是根路径，返回浏览器界面
  if (url.pathname === '/' || url.pathname === '/browser') {
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
        'User-Agent': 'Cloudflare-Browser/1.0',
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
  return '<!DOCTYPE html>\
<html lang="zh-CN">\
<head>\
    <meta charset="UTF-8">\
    <meta name="viewport" content="width=device-width, initial-scale=1.0">\
    <title>Cloudflare 浏览器</title>\
    <link rel="stylesheet" href="/static/style.css">\
    <link rel="icon" href="/static/favicon.ico">\
</head>\
<body>\
    <div class="browser-container">\
        <header class="header">\
            <h1>Cloudflare 浏览器</h1>\
            <div class="toolbar">\
                <button class="nav-btn" onclick="goBack()" title="后退">←</button>\
                <button class="nav-btn" onclick="goForward()" title="前进">→</button>\
                <button class="nav-btn" onclick="refreshPage()" title="刷新">↻</button>\
                <button class="nav-btn" onclick="goHome()" title="主页">🏠</button>\
                \
                <div class="url-container">\
                    <input type="url" id="urlBar" placeholder="输入网址..." \
                           onkeypress="handleUrlKeyPress(event)">\
                    <button class="go-btn" onclick="navigateToUrl()">前往</button>\
                </div>\
                \
                <button class="nav-btn" onclick="toggleSettings()" title="设置">⚙️</button>\
            </div>\
        </header>\
        \
        <main class="main-content">\
            <iframe id="browserFrame" \
                    src="/welcome"\
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups">\
            </iframe>\
            \
            <div class="loading" id="loading">\
                <div class="spinner"></div>\
                <p>正在加载...</p>\
            </div>\
            \
            <div class="error" id="error" style="display: none;">\
                <h3>加载失败</h3>\
                <p id="errorMessage"></p>\
                <button onclick="retryLoad()">重试</button>\
            </div>\
        </main>\
        \
        <footer class="footer">\
            <div class="status-bar">\
                <span id="statusText">准备就绪</span>\
                <span id="urlDisplay"></span>\
            </div>\
        </footer>\
    </div>\
    \
    <!-- 设置面板 -->\
    <div class="settings-panel" id="settingsPanel">\
        <div class="settings-content">\
            <h3>设置</h3>\
            <label>\
                <input type="checkbox" id="darkMode"> 深色模式\
            </label>\
            <label>\
                <input type="checkbox" id="mobileMode"> 移动模式\
            </label>\
            <button onclick="closeSettings()">关闭</button>\
        </div>\
    </div>\
    \
    <script src="/static/script.js"></script>\
</body>\
</html>'
}

function getCSS() {
  return '* {\
    margin: 0;\
    padding: 0;\
    box-sizing: border-box;\
}\
\
body {\
    font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Arial, sans-serif;\
    background: #f5f5f5;\
    height: 100vh;\
    overflow: hidden;\
}\
\
.browser-container {\
    display: flex;\
    flex-direction: column;\
    height: 100vh;\
}\
\
.header {\
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\
    color: white;\
    padding: 15px;\
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);\
}\
\
.header h1 {\
    font-size: 20px;\
    margin-bottom: 10px;\
    text-align: center;\
}\
\
.toolbar {\
    display: flex;\
    align-items: center;\
    gap: 10px;\
    flex-wrap: wrap;\
}\
\
.nav-btn {\
    background: rgba(255,255,255,0.2);\
    border: none;\
    color: white;\
    padding: 8px 12px;\
    border-radius: 5px;\
    cursor: pointer;\
    font-size: 16px;\
    transition: background 0.3s;\
}\
\
.nav-btn:hover {\
    background: rgba(255,255,255,0.3);\
}\
\
.url-container {\
    flex: 1;\
    display: flex;\
    min-width: 300px;\
}\
\
#urlBar {\
    flex: 1;\
    padding: 8px 12px;\
    border: none;\
    border-radius: 5px 0 0 5px;\
    font-size: 14px;\
    outline: none;\
}\
\
.go-btn {\
    background: #4CAF50;\
    color: white;\
    border: none;\
    padding: 8px 20px;\
    border-radius: 0 5px 5px 0;\
    cursor: pointer;\
    font-size: 14px;\
}\
\
.main-content {\
    flex: 1;\
    position: relative;\
    background: white;\
    margin: 10px;\
    border-radius: 10px;\
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);\
    overflow: hidden;\
}\
\
#browserFrame {\
    width: 100%;\
    height: 100%;\
    border: none;\
    border-radius: 10px;\
}\
\
.loading, .error {\
    position: absolute;\
    top: 50%;\
    left: 50%;\
    transform: translate(-50%, -50%);\
    text-align: center;\
    background: white;\
    padding: 40px;\
    border-radius: 10px;\
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);\
}\
\
.spinner {\
    border: 4px solid #f3f3f3;\
    border-top: 4px solid #667eea;\
    border-radius: 50%;\
    width: 40px;\
    height: 40px;\
    animation: spin 1s linear infinite;\
    margin: 0 auto 20px;\
}\
\
@keyframes spin {\
    0% { transform: rotate(0deg); }\
    100% { transform: rotate(360deg); }\
}\
\
.error h3 {\
    color: #e74c3c;\
    margin-bottom: 10px;\
}\
\
.error button {\
    background: #3498db;\
    color: white;\
    border: none;\
    padding: 10px 20px;\
    border-radius: 5px;\
    cursor: pointer;\
    margin-top: 15px;\
}\
\
.footer {\
    background: white;\
    padding: 10px 20px;\
    border-top: 1px solid #eee;\
}\
\
.status-bar {\
    display: flex;\
    justify-content: space-between;\
    align-items: center;\
    font-size: 12px;\
    color: #666;\
}\
\
.settings-panel {\
    display: none;\
    position: fixed;\
    top: 0;\
    left: 0;\
    width: 100%;\
    height: 100%;\
    background: rgba(0,0,0,0.5);\
    z-index: 1000;\
}\
\
.settings-content {\
    position: absolute;\
    top: 50%;\
    left: 50%;\
    transform: translate(-50%, -50%);\
    background: white;\
    padding: 30px;\
    border-radius: 10px;\
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);\
}\
\
.settings-content h3 {\
    margin-bottom: 20px;\
}\
\
.settings-content label {\
    display: block;\
    margin-bottom: 10px;\
    cursor: pointer;\
}\
\
.settings-content input[type="checkbox"] {\
    margin-right: 10px;\
}\
\
@media (max-width: 768px) {\
    .toolbar {\
        flex-direction: column;\
        align-items: stretch;\
    }\
    \
    .url-container {\
        min-width: auto;\
    }\
    \
    .header h1 {\
        font-size: 18px;\
    }\
}\
\
body.dark-mode {\
    background: #1a1a1a;\
    color: #fff;\
}\
\
body.dark-mode .main-content,\
body.dark-mode .footer {\
    background: #2d2d2d;\
    color: #fff;\
}\
\
body.dark-mode #urlBar {\
    background: #3d3d3d;\
    color: #fff;\
    border: 1px solid #555;\
}'
}

function getJS() {
  return 'let currentUrl = \'\';\
let history = [];\
let historyIndex = -1;\
\
function showLoading() {\
    document.getElementById(\'loading\').style.display = \'block\';\
    document.getElementById(\'error\').style.display = \'none\';\
    document.getElementById(\'browserFrame\').style.display = \'none\';\
}\
\
function hideLoading() {\
    document.getElementById(\'loading\').style.display = \'none\';\
    document.getElementById(\'browserFrame\').style.display = \'block\';\
}\
\
function showError(message) {\
    document.getElementById(\'loading\').style.display = \'none\';\
    document.getElementById(\'error\').style.display = \'block\';\
    document.getElementById(\'errorMessage\').textContent = message;\
}\
\
function navigateToUrl() {\
    const urlBar = document.getElementById(\'urlBar\');\
    let url = urlBar.value.trim();\
    \
    if (!url) return;\
    \
    if (!url.startsWith(\'http://\') && !url.startsWith(\'https://\')) {\
        url = \'https://\' + url;\
    }\
    \
    loadUrl(url);\
}\
\
function loadUrl(url) {\
    showLoading();\
    currentUrl = url;\
    \
    // 更新地址栏\
    document.getElementById(\'urlBar\').value = url;\
    document.getElementById(\'urlDisplay\').textContent = url;\
    document.getElementById(\'statusText\').textContent = \'正在加载...\';\
    \
    // 通过代理加载URL\
    const proxyUrl = \'/proxy/\' + encodeURIComponent(url);\
    const frame = document.getElementById(\'browserFrame\');\
    \
    frame.onload = () => {\
        hideLoading();\
        document.getElementById(\'statusText\').textContent = \'加载完成\';\
        \
        // 添加到历史记录\
        if (history[historyIndex] !== url) {\
            history = history.slice(0, historyIndex + 1);\
            history.push(url);\
            historyIndex = history.length - 1;\
        }\
    };\
    \
    frame.onerror = () => {\
        showError(\'无法加载页面，请检查网址是否正确\');\
        document.getElementById(\'statusText\').textContent = \'加载失败\';\
    };\
    \
    frame.src = proxyUrl;\
}\
\
function goBack() {\
    if (historyIndex > 0) {\
        historyIndex--;\
        loadUrl(history[historyIndex]);\
    }\
}\
\
function goForward() {\
    if (historyIndex < history.length - 1) {\
        historyIndex++;\
        loadUrl(history[historyIndex]);\
    }\
}\
\
function refreshPage() {\
    if (currentUrl) {\
        loadUrl(currentUrl);\
    }\
}\
\
function goHome() {\
    loadUrl(\'https://www.baidu.com\');\
}\
\
function retryLoad() {\
    if (currentUrl) {\
        loadUrl(currentUrl);\
    }\
}\
\
function handleUrlKeyPress(event) {\
    if (event.key === \'Enter\') {\
        navigateToUrl();\
    }\
}\
\
function toggleSettings() {\
    const panel = document.getElementById(\'settingsPanel\');\
    panel.style.display = panel.style.display === \'block\' ? \'none\' : \'block\';\
}\
\
function closeSettings() {\
    document.getElementById(\'settingsPanel\').style.display = \'none\';\
}\
\
// 设置功能\
document.getElementById(\'darkMode\').addEventListener(\'change\', function(e) {\
    document.body.classList.toggle(\'dark-mode\', e.target.checked);\
    saveSettings();\
});\
\
document.getElementById(\'mobileMode\').addEventListener(\'change\', function(e) {\
    const frame = document.getElementById(\'browserFrame\');\
    if (e.target.checked) {\
        frame.style.maxWidth = \'375px\';\
        frame.style.margin = \'0 auto\';\
    } else {\
        frame.style.maxWidth = \'none\';\
        frame.style.margin = \'0\';\
    }\
    saveSettings();\
});\
\
// 点击设置面板外部关闭\
document.getElementById(\'settingsPanel\').addEventListener(\'click\', function(e) {\
    if (e.target === this) {\
        closeSettings();\
    }\
});\
\
// 本地存储功能\
function saveSettings() {\
    const settings = {\
        darkMode: document.getElementById(\'darkMode\').checked,\
        mobileMode: document.getElementById(\'mobileMode\').checked\
    };\
    localStorage.setItem(\'browserSettings\', JSON.stringify(settings));\
}\
\
function loadSettings() {\
    const settings = JSON.parse(localStorage.getItem(\'browserSettings\') || \'{}\');\
    if (settings.darkMode !== undefined) {\
        document.getElementById(\'darkMode\').checked = settings.darkMode;\
        document.body.classList.toggle(\'dark-mode\', settings.darkMode);\
    }\
    if (settings.mobileMode !== undefined) {\
        document.getElementById(\'mobileMode\').checked = settings.mobileMode;\
        const frame = document.getElementById(\'browserFrame\');\
        if (settings.mobileMode) {\
            frame.style.maxWidth = \'375px\';\
            frame.style.margin = \'0 auto\';\
        }\
    }\
}\
\
// 初始化欢迎页面\
window.addEventListener(\'load\', function() {\
    loadSettings();\
    \
    // 加载欢迎页面\
    const welcomePage = `\
        <!DOCTYPE html>\
        <html>\
        <head>\
            <meta charset=\"UTF-8\">\
            <title>欢迎使用 Cloudflare 浏览器</title>\
            <style>\
                body { \
                    font-family: Arial, sans-serif; \
                    display: flex; \
                    justify-content: center; \
                    align-items: center; \
                    height: 100vh; \
                    margin: 0; \
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); \
                    color: white; \
                }\
                .welcome { \
                    text-align: center; \
                    padding: 40px; \
                    background: rgba(255,255,255,0.1); \
                    border-radius: 20px; \
                    backdrop-filter: blur(10px); \
                }\
                h1 { margin-bottom: 20px; }\
                .features { \
                    list-style: none; \
                    padding: 0; \
                }\
                .features li { \
                    margin: 10px 0; \
                    font-size: 16px; \
                }\
                .tip {\
                    margin-top: 30px;\
                    font-size: 14px;\
                    opacity: 0.8;\
                }\
            </style>\
        </head>\
        <body>\
            <div class=\"welcome\">\
                <h1>欢迎使用 Cloudflare 浏览器</h1>\
                <ul class=\"features\">\
                    <li>✅ 基于 Cloudflare Workers</li>\
                    <li>🌐 支持任意网站访问</li>\
                    <li>📱 响应式设计</li>\
                    <li>⚡ 快速加载</li>\
                    <li>🔒 安全代理</li>\
                </ul>\
                <p class=\"tip\">在上方地址栏输入网址开始浏览</p>\
            </div>\
        </body>\
        </html>\
    `;\
    \
    const blob = new Blob([welcomePage], { type: \'text/html\' });\
    const frame = document.getElementById(\'browserFrame\');\
    frame.src = URL.createObjectURL(blob);\
});\
\
// 键盘快捷键\
document.addEventListener(\'keydown\', function(e) {\
    if (e.ctrlKey || e.metaKey) {\
        switch(e.key) {\
            case \'l\':\
                e.preventDefault();\
                document.getElementById(\'urlBar\').focus();\
                document.getElementById(\'urlBar\').select();\
                break;\
            case \'r\':\
                e.preventDefault();\
                refreshPage();\
                break;\
        }\
    }\
    \
    if (e.altKey) {\
        switch(e.key) {\
            case \'ArrowLeft\':\
                e.preventDefault();\
                goBack();\
                break;\
            case \'ArrowRight\':\
                e.preventDefault();\
                goForward();\
                break;\
        }\
    }\
});\
\
// 实用工具函数\
function isValidUrl(string) {\
    try {\
        new URL(string);\
        return true;\
    } catch (_) {\
        return false;\
    }\
}\
\
function normalizeUrl(url) {\
    if (!url.startsWith(\'http://\') && !url.startsWith(\'https://\')) {\
        return \'https://\' + url;\
    }\
    return url;\
}\
\
// 获取网站favicon\
function getFavicon(url) {\
    try {\
        const urlObj = new URL(url);\
        return \'https://www.google.com/s2/favicons?domain=\' + urlObj.hostname + \'&sz=32\';\
    } catch (e) {\
        return \'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSIjNjY3ZWVhIi8+Cjx0ZXh0IHg9IjgiIHk9IjgiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9IjAuMyI+XDwvL3RleHQ+Cjwvc3ZnPgo=\';\
    }\
}'
}

function getFavicon() {
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjNjY3ZWVhIi8+Cjx0ZXh0IHg9IjE2IiB5PSIxNiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9IjAuMyI+QzwvdGV4dD4KPC9zdmc+Cg==';
}