#!/usr/bin/env node
/**
 * Cloudflare Workers浏览器部署验证脚本
 * 用于验证部署是否成功并测试各项功能
 */

const https = require('https');
const http = require('http');
const url = require('url');

class DeploymentValidator {
    constructor(deployUrl) {
        this.deployUrl = deployUrl;
        this.results = {
            success: true,
            tests: [],
            errors: []
        };
    }

    async validate() {
        console.log('🚀 开始验证Cloudflare Workers浏览器部署...\n');
        
        await this.testConnectivity();
        await this.testBasicFunctionality();
        await this.testProxyEndpoint();
        await this.testResponseHeaders();
        await this.testContentType();
        
        this.printResults();
        return this.results;
    }

    async testConnectivity() {
        try {
            console.log('📡 测试连接性...');
            const response = await this.httpRequest(this.deployUrl);
            
            if (response.statusCode === 200) {
                this.addTest('连接性测试', true, '成功连接到Workers');
            } else {
                this.addTest('连接性测试', false, `HTTP状态码: ${response.statusCode}`);
            }
        } catch (error) {
            this.addTest('连接性测试', false, error.message);
        }
    }

    async testBasicFunctionality() {
        try {
            console.log('🔧 测试基本功能...');
            const response = await this.httpRequest(this.deployUrl);
            const body = response.body;
            
            const checks = [
                { name: 'HTML结构', check: body.includes('<!DOCTYPE html>') },
                { name: '地址栏', check: body.includes('urlBar') },
                { name: '浏览器框架', check: body.includes('browserFrame') },
                { name: '导航按钮', check: body.includes('nav-button') },
                { name: '设置面板', check: body.includes('settingsPanel') }
            ];
            
            checks.forEach(({ name, check }) => {
                this.addTest(name, check, check ? '功能正常' : '功能缺失');
            });
        } catch (error) {
            this.addTest('基本功能测试', false, error.message);
        }
    }

    async testProxyEndpoint() {
        try {
            console.log('🌐 测试代理端点...');
            const testUrl = encodeURIComponent('https://httpbin.org/get');
            const proxyUrl = `${this.deployUrl}/proxy/${testUrl}`;
            
            const response = await this.httpRequest(proxyUrl);
            
            if (response.statusCode === 200) {
                const body = response.body;
                const hasResponseData = body.includes('"url"') || body.includes('httpbin');
                this.addTest('代理端点', true, hasResponseData ? '代理功能正常' : '代理响应异常');
            } else {
                this.addTest('代理端点', false, `HTTP状态码: ${response.statusCode}`);
            }
        } catch (error) {
            this.addTest('代理端点', false, `代理功能异常: ${error.message}`);
        }
    }

    async testResponseHeaders() {
        try {
            console.log('🔒 测试响应头...');
            const response = await this.httpRequest(this.deployUrl);
            const headers = response.headers;
            
            const securityHeaders = [
                'content-security-policy',
                'x-content-type-options',
                'x-frame-options',
                'strict-transport-security'
            ];
            
            securityHeaders.forEach(header => {
                const hasHeader = headers[header] !== undefined;
                this.addTest(`安全头: ${header}`, hasHeader, 
                    hasHeader ? `已设置: ${headers[header]}` : '未设置');
            });
        } catch (error) {
            this.addTest('响应头测试', false, error.message);
        }
    }

    async testContentType() {
        try {
            console.log('📄 测试内容类型...');
            const response = await this.httpRequest(this.deployUrl);
            const contentType = response.headers['content-type'];
            
            const isHtml = contentType && contentType.includes('text/html');
            this.addTest('内容类型', isHtml, 
                isHtml ? `正确: ${contentType}` : `异常: ${contentType || '未设置'}`);
        } catch (error) {
            this.addTest('内容类型测试', false, error.message);
        }
    }

    httpRequest(targetUrl) {
        return new Promise((resolve, reject) => {
            const parsedUrl = url.parse(targetUrl);
            const client = parsedUrl.protocol === 'https:' ? https : http;
            
            const options = {
                hostname: parsedUrl.hostname,
                port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
                path: parsedUrl.path,
                method: 'GET',
                headers: {
                    'User-Agent': 'Cloudflare-Workers-Browser-Validator/1.0'
                },
                timeout: 10000
            };

            const req = client.request(options, (res) => {
                let body = '';
                res.on('data', (chunk) => {
                    body += chunk;
                });
                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: body
                    });
                });
            });

            req.on('error', reject);
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('请求超时'));
            });

            req.end();
        });
    }

    addTest(name, success, message) {
        this.results.tests.push({ name, success, message });
        if (!success) {
            this.results.success = false;
            this.results.errors.push({ name, message });
        }
    }

    printResults() {
        console.log('\n📊 验证结果:');
        console.log('=' .repeat(50));
        
        this.results.tests.forEach(test => {
            const status = test.success ? '✅' : '❌';
            console.log(`${status} ${test.name}: ${test.message}`);
        });
        
        console.log('=' .repeat(50));
        
        if (this.results.success) {
            console.log('🎉 所有测试通过！部署成功！');
        } else {
            console.log('⚠️  发现一些问题，请检查上述错误');
            
            if (this.results.errors.length > 0) {
                console.log('\n❌ 错误详情:');
                this.results.errors.forEach(error => {
                    console.log(`   - ${error.name}: ${error.message}`);
                });
            }
        }
    }
}

// CLI使用
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('用法: node validate-deployment.js <部署URL>');
        console.log('示例: node validate-deployment.js https://my-browser.workers.dev');
        process.exit(1);
    }
    
    const deployUrl = args[0];
    const validator = new DeploymentValidator(deployUrl);
    
    validator.validate()
        .then(results => {
            process.exit(results.success ? 0 : 1);
        })
        .catch(error => {
            console.error('验证失败:', error);
            process.exit(1);
        });
}

module.exports = DeploymentValidator;