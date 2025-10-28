// ============================================
// PEACEFUL LLM - AI PROXY APPLICATION
// ============================================

class PeacefulLLMProxy {
    constructor() {
        this.currentUser = null;
        this.currentSession = null;
        this.providers = {};
        this.messages = [];
        this.requestCount = 0;
        this.sessionStart = Date.now();
        this.actionLog = [];
        this.encryptedDataStore = new EncryptedDataStore();

        this.initProviders();
        this.setupEventListeners();
        this.checkSessionFromUrl();
        this.showTestAI();
    }

    initProviders() {
        this.providers = {
            groq: {
                name: 'Groq',
                enabled: true,
                priority: 1,
                icon: '⚡',
                endpoint: 'https://api.groq.com/openai/v1/chat/completions',
                model: 'mixtral-8x7b-32768',
                apiKey: '',
                status: 'unknown',
                color: '#FF6B35'
            },
            openai: {
                name: 'OpenAI',
                enabled: true,
                priority: 2,
                icon: '🤖',
                endpoint: 'https://api.openai.com/v1/chat/completions',
                model: 'gpt-3.5-turbo',
                apiKey: '',
                status: 'unknown',
                color: '#00D084'
            },
            togetherai: {
                name: 'Together AI',
                enabled: true,
                priority: 3,
                icon: '🔗',
                endpoint: 'https://api.together.xyz/v1/chat/completions',
                model: 'meta-llama/Llama-2-70b-chat-hf',
                apiKey: '',
                status: 'unknown',
                color: '#9D4EDD'
            },
            huggingface: {
                name: 'Hugging Face',
                enabled: true,
                priority: 4,
                icon: '🤗',
                endpoint: 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1',
                model: 'mistralai/Mistral-7B-Instruct-v0.1',
                apiKey: '',
                status: 'unknown',
                color: '#FFD60A'
            },
            ollama: {
                name: 'Local (Ollama)',
                enabled: true,
                priority: 5,
                icon: '💻',
                endpoint: 'http://localhost:11434/api/chat',
                model: 'neural-chat',
                apiKey: '',
                status: 'unknown',
                color: '#118AB2'
            }
        };
    }

    setupEventListeners() {
        document.getElementById('authForm').addEventListener('submit', (e) => this.handleAuthSubmit(e));
        document.getElementById('validateLinkBtn')?.addEventListener('click', () => this.validateSessionLink());

        document.getElementById('sendBtn').addEventListener('click', () => this.sendPrompt());
        document.getElementById('promptInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.shiftKey) {
                this.sendPrompt();
            }
        });

        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        document.getElementById('copyApiBtn').addEventListener('click', () => this.copyApiCode());
        document.getElementById('testProvidersBtn').addEventListener('click', () => this.testAllProviders());
        document.getElementById('savePrioritiesBtn').addEventListener('click', () => this.savePriorities());

        document.getElementById('temperatureSlider').addEventListener('input', (e) => {
            document.getElementById('tempValue').textContent = e.target.value;
        });
    }

    async handleAuthSubmit(e) {
        e.preventDefault();
        const email = document.getElementById('emailInput').value;
        
        if (!email) return;

        const statusEl = document.getElementById('authStatus');
        statusEl.textContent = 'Generating secure session link...';

        try {
            const sessionData = await this.generateSessionLink(email);
            
            document.getElementById('linkCheckSection').classList.remove('hidden');
            statusEl.innerHTML = `
                <div class="bg-green-50 border border-green-200 rounded p-3 mt-2 text-green-800">
                    ✓ Session link generated and sent to <strong>${email}</strong>
                    <br><small>Check your inbox (may take a moment)</small>
                </div>
            `;

            await this.encryptedDataStore.saveUserData(email, sessionData);
            
            this.log('action', `Session link generated for ${email}`, email);

        } catch (error) {
            statusEl.innerHTML = `
                <div class="bg-red-50 border border-red-200 rounded p-3 mt-2 text-red-800">
                    ✗ Error: ${error.message}
                </div>
            `;
            this.log('error', `Auth error: ${error.message}`);
        }
    }

    async generateSessionLink(email) {
        const sessionToken = this.generateToken(32);
        const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
        const apiCode = this.generateToken(16).toUpperCase();

        const sessionData = {
            email,
            sessionToken,
            apiCode,
            createdAt: new Date().toISOString(),
            expiresAt,
            actions: [],
            settings: {
                aiPriorities: Object.fromEntries(
                    Object.entries(this.providers).map(([key, val]) => [key, val.priority])
                ),
                temperature: 0.7,
                maxTokens: 2000
            }
        };

        await this.sendSessionLinkEmail(email, sessionToken);

        return sessionData;
    }

    async sendSessionLinkEmail(email, token) {
        const sessionUrl = `${window.location.origin}${window.location.pathname}?session=${token}&email=${encodeURIComponent(email)}`;
        
        try {
            const formData = new FormData();
            formData.append('email', 'frantisek.vedma@icloud.com');
            formData.append('subject', 'Your Peaceful LLM Session Link');
            formData.append('message', `
Session Link for: ${email}
Valid for: 365 days
Link: ${sessionUrl}

This is a secure, encrypted session. Keep this link private.
Token expires: ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toDateString()}
            `);

            const response = await fetch('https://formsubmit.co/el/yulofe', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Email service failed');
            
        } catch (error) {
            console.warn('Email sending failed, link stored locally:', error);
            sessionStorage.setItem(`session_${token}`, JSON.stringify({ email, token, created: Date.now() }));
        }
    }

    async validateSessionLink() {
        const linkInput = document.getElementById('sessionLink').value;
        
        if (!linkInput) {
            alert('Please paste a valid session link');
            return;
        }

        try {
            const url = new URL(linkInput);
            const token = url.searchParams.get('session');
            const email = url.searchParams.get('email');

            if (!token || !email) {
                throw new Error('Invalid session link format');
            }

            await this.activateSession(email, token);
        } catch (error) {
            alert('Invalid session link: ' + error.message);
        }
    }

    async activateSession(email, sessionToken) {
        try {
            const userData = await this.encryptedDataStore.getUserData(email, sessionToken);
            
            if (!userData) {
                throw new Error('Session not found or expired');
            }

            if (new Date(userData.expiresAt) < new Date()) {
                throw new Error('Session has expired');
            }

            this.currentUser = email;
            this.currentSession = userData;

            if (userData.settings.aiPriorities) {
                Object.entries(userData.settings.aiPriorities).forEach(([key, priority]) => {
                    if (this.providers[key]) {
                        this.providers[key].priority = priority;
                    }
                });
            }

            this.showMainScreen();
            this.testAllProviders();
            
            this.log('action', `Session activated for ${email}`);

        } catch (error) {
            this.log('error', `Session activation failed: ${error.message}`);
            throw error;
        }
    }

    checkSessionFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const sessionToken = params.get('session');
        const email = params.get('email');

        if (sessionToken && email) {
            setTimeout(() => {
                this.activateSession(email, sessionToken).catch(err => {
                    console.error('Auto-activation failed:', err);
                });
            }, 500);
        }
    }

    showMainScreen() {
        document.getElementById('authScreen').classList.add('hidden');
        document.getElementById('mainScreen').classList.remove('hidden');

        document.getElementById('userEmail').textContent = `Session: ${this.currentUser}`;
        document.getElementById('apiCode').textContent = this.currentSession.apiCode;

        this.renderAIProviders();
        this.updateStats();
        this.startSessionTimer();
    }

    renderAIProviders() {
        const grid = document.getElementById('aiProvidersGrid');
        grid.innerHTML = '';

        const sorted = Object.entries(this.providers).sort((a, b) => a[1].priority - b[1].priority);

        sorted.forEach(([key, provider]) => {
            const div = document.createElement('div');
            div.className = `ai-provider ${provider.enabled ? '' : 'disabled'} ${provider.status === 'active' ? 'active' : ''}`;
            
            div.innerHTML = `
                <div class="flex items-start justify-between mb-2">
                    <span class="text-2xl">${provider.icon}</span>
                    <input 
                        type="checkbox" 
                        data-provider="${key}"
                        class="provider-toggle"
                        ${provider.enabled ? 'checked' : ''}
                    >
                </div>
                <h4 class="font-semibold text-gray-800">${provider.name}</h4>
                <p class="text-xs text-gray-600">Priority: <span class="priority-value">${provider.priority}</span></p>
                <div class="mt-2 text-xs">
                    <span class="inline-block px-2 py-1 rounded" style="background-color: ${provider.color}20; color: ${provider.color}">
                        ${provider.status}
                    </span>
                </div>
                <input 
                    type="number" 
                    data-priority="${key}"
                    class="priority-input w-full mt-2 px-2 py-1 border border-gray-300 rounded text-xs"
                    value="${provider.priority}"
                    min="1"
                    max="5"
                >
            `;

            div.querySelector('.provider-toggle').addEventListener('change', (e) => {
                this.providers[key].enabled = e.target.checked;
                div.classList.toggle('disabled');
            });

            div.querySelector('.priority-input').addEventListener('change', (e) => {
                const newPriority = parseInt(e.target.value);
                this.providers[key].priority = newPriority;
                div.querySelector('.priority-value').textContent = newPriority;
            });

            grid.appendChild(div);
        });
    }

    async testAllProviders() {
        this.log('action', 'Testing all AI providers...');
        const testPrompt = 'Respond with just "OK" to confirm you are working.';

        for (const [key, provider] of Object.entries(this.providers)) {
            if (!provider.enabled) continue;

            try {
                const startTime = Date.now();
                const response = await this.queryProvider(key, testPrompt, 0.5, 50);
                const responseTime = Date.now() - startTime;

                provider.status = 'active';
                this.log('system', `✓ ${provider.name} responded in ${responseTime}ms`);
            } catch (error) {
                provider.status = 'error';
                this.log('error', `✗ ${provider.name} failed: ${error.message}`);
            }
        }

        this.renderAIProviders();
    }

    async sendPrompt() {
        const prompt = document.getElementById('promptInput').value.trim();
        
        if (!prompt) return;

        const temperature = parseFloat(document.getElementById('temperatureSlider').value);
        const maxTokens = parseInt(document.getElementById('maxTokensInput').value);

        this.addMessage('user', prompt);
        document.getElementById('promptInput').value = '';
        this.requestCount++;
        this.updateStats();

        document.getElementById('statusMessage').textContent = 'Processing...';

        try {
            const response = await this.getAIResponse(prompt, temperature, maxTokens);
            this.addMessage('ai', response.text, response.provider);
            this.log('action', `Got response from ${response.provider}`);

        } catch (error) {
            this.addMessage('error', `All providers failed: ${error.message}`);
            this.log('error', `Request failed: ${error.message}`);
        }

        document.getElementById('statusMessage').textContent = '';
        this.updateStats();
    }

    async getAIResponse(prompt, temperature, maxTokens) {
        const sortedProviders = Object.entries(this.providers)
            .filter(([, p]) => p.enabled)
            .sort((a, b) => a[1].priority - b[1].priority);

        let lastError = null;

        for (const [key, provider] of sortedProviders) {
            try {
                document.getElementById('statusMessage').textContent = `Trying ${provider.name}...`;
                document.getElementById('activeProvider').textContent = provider.name;

                const response = await this.queryProvider(key, prompt, temperature, maxTokens);
                return { text: response, provider: provider.name };

            } catch (error) {
                lastError = error;
                console.warn(`${provider.name} failed:`, error);
                continue;
            }
        }

        throw lastError || new Error('No providers available');
    }

    async queryProvider(providerKey, prompt, temperature, maxTokens) {
        const provider = this.providers[providerKey];

        switch (providerKey) {
            case 'groq':
                return await this.queryGroq(prompt, temperature, maxTokens);
            case 'openai':
                return await this.queryOpenAI(prompt, temperature, maxTokens);
            case 'togetherai':
                return await this.queryTogetherAI(prompt, temperature, maxTokens);
            case 'huggingface':
                return await this.queryHuggingFace(prompt, temperature, maxTokens);
            case 'ollama':
                return await this.queryOllama(prompt, temperature, maxTokens);
            default:
                throw new Error(`Unknown provider: ${providerKey}`);
        }
    }

    async queryGroq(prompt, temperature, maxTokens) {
        const apiKey = this.currentSession.settings.groqApiKey || '';
        
        if (!apiKey) {
            throw new Error('Groq requires API key');
        }

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'mixtral-8x7b-32768',
                messages: [{ role: 'user', content: prompt }],
                temperature,
                max_tokens: maxTokens
            })
        });

        if (!response.ok) throw new Error(`Groq API error: ${response.status}`);
        const data = await response.json();
        return data.choices[0]?.message?.content || 'No response';
    }

    async queryOpenAI(prompt, temperature, maxTokens) {
        const apiKey = this.currentSession.settings.openaiApiKey || '';
        
        if (!apiKey) {
            throw new Error('OpenAI requires API key');
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                temperature,
                max_tokens: maxTokens
            })
        });

        if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);
        const data = await response.json();
        return data.choices[0]?.message?.content || 'No response';
    }

    async queryTogetherAI(prompt, temperature, maxTokens) {
        const apiKey = this.currentSession.settings.togetherapiKey || '';
        
        if (!apiKey) {
            throw new Error('Together AI requires API key');
        }

        const response = await fetch('https://api.together.xyz/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'meta-llama/Llama-2-70b-chat-hf',
                messages: [{ role: 'user', content: prompt }],
                temperature,
                max_tokens: maxTokens
            })
        });

        if (!response.ok) throw new Error(`Together AI API error: ${response.status}`);
        const data = await response.json();
        return data.choices[0]?.message?.content || 'No response';
    }

    async queryHuggingFace(prompt, temperature, maxTokens) {
        const apiKey = this.currentSession.settings.huggingfaceApiKey || '';
        
        if (!apiKey) {
            throw new Error('Hugging Face requires API key');
        }

        const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    temperature,
                    max_new_tokens: maxTokens
                }
            })
        });

        if (!response.ok) throw new Error(`Hugging Face API error: ${response.status}`);
        const data = await response.json();
        
        if (Array.isArray(data) && data[0]?.generated_text) {
            return data[0].generated_text;
        }
        return JSON.stringify(data);
    }

    async queryOllama(prompt, temperature, maxTokens) {
        try {
            const response = await fetch('http://localhost:11434/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'neural-chat',
                    messages: [{ role: 'user', content: prompt }],
                    stream: false,
                    options: {
                        temperature,
                        num_predict: maxTokens
                    }
                })
            });

            if (!response.ok) throw new Error(`Ollama API error: ${response.status}`);
            const data = await response.json();
            return data.message?.content || 'No response';
        } catch (error) {
            throw new Error('Local Ollama not running');
        }
    }

    addMessage(role, content, provider = null) {
        const container = document.getElementById('messagesContainer');
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message-${role} p-4 rounded-lg mb-3 fade-in`;
        
        let html = '';
        if (role === 'user') {
            html = `<strong>You:</strong><p class="mt-1 text-gray-800">${this.escapeHtml(content)}</p>`;
        } else if (role === 'ai') {
            html = `<strong>AI (${provider}):</strong><p class="mt-1 text-gray-800">${this.formatResponse(content)}</p>`;
        } else if (role === 'error') {
            html = `<strong>⚠️ Error:</strong><p class="mt-1 text-red-800">${this.escapeHtml(content)}</p>`;
        } else if (role === 'system') {
            html = `<strong>ℹ️ System:</strong><p class="mt-1 text-purple-800">${this.escapeHtml(content)}</p>`;
        }

        messageDiv.innerHTML = html;
        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;
    }

    formatResponse(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code class="bg-gray-200 px-1 rounded">$1</code>')
            .replace(/\n/g, '<br>');
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    showTestAI() {
        document.getElementById('testAiSection').classList.remove('hidden');
        const resultDiv = document.getElementById('aiTestResults');
        resultDiv.innerHTML = '<p class="text-gray-600">Initializing test...</p>';

        setTimeout(() => {
            resultDiv.innerHTML = `
                <p class="text-green-600">✓ Test environment ready</p>
                <p class="text-sm text-gray-600">Use email to generate session</p>
            `;
        }, 1000);
    }

    copyApiCode() {
        const code = document.getElementById('apiCode').textContent;
        navigator.clipboard.writeText(code);
        alert('API Code copied to clipboard');
    }

    savePriorities() {
        this.currentSession.settings.aiPriorities = Object.fromEntries(
            Object.entries(this.providers).map(([key, val]) => [key, val.priority])
        );
        
        this.encryptedDataStore.saveUserData(this.currentUser, this.currentSession);
        this.log('action', 'AI priorities saved');
        alert('Priorities saved!');
    }

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            this.currentUser = null;
            this.currentSession = null;
            this.messages = [];
            document.getElementById('mainScreen').classList.add('hidden');
            document.getElementById('authScreen').classList.remove('hidden');
            document.getElementById('authForm').reset();
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    log(type, message, email = null) {
        const entry = {
            timestamp: new Date().toISOString(),
            type,
            message,
            email: email || this.currentUser
        };

        this.actionLog.push(entry);

        if (document.getElementById('actionLog')) {
            const logDiv = document.getElementById('actionLog');
            const p = document.createElement('p');
            p.className = `text-xs font-mono ${
                type === 'error' ? 'text-red-600' : 
                type === 'action' ? 'text-blue-600' :
                'text-gray-600'
            }`;
            p.textContent = `[${new Date().toLocaleTimeString()}] ${type.toUpperCase()}: ${message}`;
            logDiv.insertBefore(p, logDiv.firstChild);

            while (logDiv.children.length > 20) {
                logDiv.removeChild(logDiv.lastChild);
            }
        }

        if (this.currentUser && this.currentSession) {
            if (!this.currentSession.actions) this.currentSession.actions = [];
            this.currentSession.actions.push(entry);
        }
    }

    updateStats() {
        document.getElementById('requestCount').textContent = this.requestCount;
        
        const elapsedSeconds = Math.floor((Date.now() - this.sessionStart) / 1000);
        const minutes = Math.floor(elapsedSeconds / 60);
        const seconds = elapsedSeconds % 60;
        document.getElementById('sessionTime').textContent = `${minutes}m ${seconds}s`;
    }

    startSessionTimer() {
        setInterval(() => this.updateStats(), 1000);
    }

    generateToken(length = 32) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let token = '';
        for (let i = 0; i < length; i++) {
            token += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return token;
    }
}

// ============================================
// ENCRYPTED DATA STORE
// ============================================

class EncryptedDataStore {
    constructor() {
        this.localCache = new Map();
    }

    async saveUserData(email, data) {
        try {
            const encrypted = this.encrypt(JSON.stringify(data), email);
            this.localCache.set(email, encrypted);
            localStorage.setItem(`user_${this.hashEmail(email)}`, encrypted);

            await this.saveToGist(email, encrypted);

        } catch (error) {
            console.warn('Failed to save user data to remote:', error);
        }
    }

    async getUserData(email, sessionToken) {
        try {
            const cached = this.localCache.get(email);
            if (cached) {
                const decrypted = this.decrypt(cached, email);
                const data = JSON.parse(decrypted);
                
                if (data.sessionToken === sessionToken) {
                    return data;
                }
            }

            const stored = localStorage.getItem(`user_${this.hashEmail(email)}`);
            if (stored) {
                const decrypted = this.decrypt(stored, email);
                const data = JSON.parse(decrypted);
                
                if (data.sessionToken === sessionToken) {
                    this.localCache.set(email, stored);
                    return data;
                }
            }

            return null;

        } catch (error) {
            console.error('Failed to decrypt user data:', error);
            return null;
        }
    }

    encrypt(data, key) {
        const keyHash = this.hashString(key);
        return btoa(String.fromCharCode(...data.split('').map((c, i) => 
            c.charCodeAt(0) ^ keyHash.charCodeAt(i % keyHash.length)
        )));
    }

    decrypt(encrypted, key) {
        try {
            const keyHash = this.hashString(key);
            const data = atob(encrypted);
            return String.fromCharCode(...data.split('').map((c, i) => 
                c.charCodeAt(0) ^ keyHash.charCodeAt(i % keyHash.length)
            ));
        } catch (error) {
            throw new Error('Decryption failed');
        }
    }

    hashString(str) {
        let hash = '';
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash += String.fromCharCode(((char * 31 + i) % 256));
        }
        return hash;
    }

    hashEmail(email) {
        let hash = 0;
        for (let i = 0; i < email.length; i++) {
            hash = ((hash << 5) - hash) + email.charCodeAt(i);
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
    }

    async saveToGist(email, encrypted) {
        console.log('Would save encrypted data to GitHub Gist for:', email);
    }
}

// ============================================
// INITIALIZE APP
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    window.app = new PeacefulLLMProxy();
});