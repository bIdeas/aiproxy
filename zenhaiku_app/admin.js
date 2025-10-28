class AdminConsole {
    constructor() {
        this.adminToken = null;
        this.tokenHistory = [];
        this.settings = this.loadSettings();
        this.initEventListeners();
        this.loadTokenHistory();
        this.displayTokenHistory();
    }

    initEventListeners() {
        document.getElementById('tokenForm').addEventListener('submit', (e) => this.generateToken(e));
        document.getElementById('generateNewBtn').addEventListener('click', () => this.resetForm());
        document.getElementById('saveSettingsBtn').addEventListener('click', () => this.saveSettings());
        document.getElementById('copyTokenBtn').addEventListener('click', () => this.copyToken());
    }

    generateToken(e) {
        e.preventDefault();
        
        const targetEmail = document.getElementById('targetEmail').value;
        const phoneNumber = document.getElementById('phoneNumber').value;
        const validityMinutes = parseInt(document.getElementById('tokenValidity').value);

        // Generate 8-character token
        const token = this.generateRandomToken(8);
        const timestamp = new Date();
        const expiryTime = new Date(timestamp.getTime() + validityMinutes * 60000);

        // Store token info
        const tokenRecord = {
            token,
            email: targetEmail,
            phone: phoneNumber,
            generated: timestamp.toISOString(),
            expires: expiryTime.toISOString(),
            validity: validityMinutes,
            used: false
        };

        this.tokenHistory.push(tokenRecord);
        this.saveTokenHistory();

        // Display token
        document.getElementById('tokenDisplay').classList.remove('hidden');
        document.getElementById('tokenForm').classList.add('hidden');
        document.getElementById('generatedToken').textContent = token;
        document.getElementById('tokenExpiry').textContent = `Valid for ${validityMinutes} minutes (until ${expiryTime.toLocaleTimeString()})`;
        document.getElementById('sentEmail').textContent = targetEmail;
        document.getElementById('sentPhone').textContent = phoneNumber;

        // Simulate sending
        this.simulateSending(targetEmail, phoneNumber, token, validityMinutes);
    }

    simulateSending(email, phone, token, minutes) {
        const statusDiv = document.getElementById('deliveryStatus');
        statusDiv.innerHTML = '';

        // Email simulation
        const emailStatus = document.createElement('div');
        emailStatus.className = 'bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between';
        emailStatus.innerHTML = `
            <div class="flex items-center gap-2">
                <span class="text-lg">📧</span>
                <div>
                    <p class="font-semibold text-green-900">Email Sent</p>
                    <p class="text-xs text-green-700">Token sent to ${email}</p>
                </div>
            </div>
            <span class="text-green-600">✓</span>
        `;
        statusDiv.appendChild(emailStatus);

        // SMS simulation
        const smsStatus = document.createElement('div');
        smsStatus.className = 'bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between';
        smsStatus.innerHTML = `
            <div class="flex items-center gap-2">
                <span class="text-lg">📱</span>
                <div>
                    <p class="font-semibold text-green-900">SMS Sent</p>
                    <p class="text-xs text-green-700">Token sent to ${phone}</p>
                </div>
            </div>
            <span class="text-green-600">✓</span>
        `;
        statusDiv.appendChild(smsStatus);

        // In production, integrate with:
        // - Email: SendGrid, AWS SES, or FormSubmit.co
        // - SMS: Twilio, AWS SNS, or similar service
    }

    generateRandomToken(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    copyToken() {
        const token = document.getElementById('generatedToken').textContent;
        navigator.clipboard.writeText(token).then(() => {
            const btn = document.getElementById('copyTokenBtn');
            const originalText = btn.textContent;
            btn.textContent = '✓ Copied!';
            setTimeout(() => {
                btn.textContent = originalText;
            }, 2000);
        });
    }

    resetForm() {
        document.getElementById('tokenForm').classList.remove('hidden');
        document.getElementById('tokenDisplay').classList.add('hidden');
        document.getElementById('tokenForm').reset();
        document.getElementById('tokenValidity').value = '110';
    }

    saveSettings() {
        this.settings = {
            defaultDuration: parseInt(document.getElementById('defaultDuration').value),
            adminEmail: document.getElementById('adminEmail').value,
            lastUpdated: new Date().toISOString()
        };

        localStorage.setItem('peacefulLLM_adminSettings', JSON.stringify(this.settings));
        
        const btn = document.getElementById('saveSettingsBtn');
        const originalText = btn.textContent;
        btn.textContent = '✓ Settings Saved!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    }

    loadSettings() {
        const saved = localStorage.getItem('peacefulLLM_adminSettings');
        return saved ? JSON.parse(saved) : {
            defaultDuration: 365,
            adminEmail: 'frantisek.vedma@icloud.com'
        };
    }

    saveTokenHistory() {
        // Keep only last 100 tokens
        const history = this.tokenHistory.slice(-100);
        localStorage.setItem('peacefulLLM_tokenHistory', JSON.stringify(history));
    }

    loadTokenHistory() {
        const saved = localStorage.getItem('peacefulLLM_tokenHistory');
        this.tokenHistory = saved ? JSON.parse(saved) : [];
    }

    displayTokenHistory() {
        const historyDiv = document.getElementById('tokenHistory');
        
        if (this.tokenHistory.length === 0) {
            historyDiv.innerHTML = '<p class="text-sm text-gray-500">No tokens generated yet</p>';
            return;
        }

        const recentTokens = this.tokenHistory.slice(-10).reverse();
        historyDiv.innerHTML = recentTokens.map((record) => {
            const generated = new Date(record.generated);
            const expires = new Date(record.expires);
            const isExpired = new Date() > expires;
            
            return `
                <div class="bg-white rounded-lg p-3 border-l-4 ${isExpired ? 'border-red-400' : 'border-green-400'}">
                    <div class="flex items-center justify-between mb-1">
                        <span class="font-mono font-bold text-sm ${isExpired ? 'text-red-600' : 'text-green-600'}">${record.token}</span>
                        <span class="text-xs ${isExpired ? 'text-red-600' : 'text-gray-600'}">${isExpired ? 'EXPIRED' : 'ACTIVE'}</span>
                    </div>
                    <p class="text-xs text-gray-600">${record.email} • ${generated.toLocaleTimeString()}</p>
                </div>
            `;
        }).join('');
    }
}

// Initialize admin console when page loads
document.addEventListener('DOMContentLoaded', () => {
    new AdminConsole();
});