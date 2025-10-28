# Peaceful LLM - API Reference

Complete API documentation for developers integrating with Peaceful LLM.

## Overview

Peaceful LLM provides a unified interface to multiple AI providers. All communication is client-side encrypted and requires a valid session.

## Authentication

### Session Generation

```javascript
// User enters email
// System generates:
{
  "email": "user@example.com",
  "sessionToken": "abc123def456...", // 32 characters
  "apiCode": "XYZ789ABC123...",       // 16 characters
  "expiresAt": "2025-12-31T23:59:59Z",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Session Link

```
https://yourdomain.com/index.html?session=abc123def456...&email=user@example.com
```

## Core Classes

### PeacefulLLMProxy

Main application class handling all AI interactions.

#### Constructor

```javascript
const app = new PeacefulLLMProxy();
```

#### Properties

```javascript
app.currentUser              // Current user email
app.currentSession          // Session data object
app.providers               // All AI providers
app.messages                // Message history
app.requestCount            // Total requests
app.actionLog               // Timestamped actions
```

#### Methods

##### initProviders()

Initialize all AI providers.

```javascript
app.initProviders();
// Returns provider configuration object
```

##### generateSessionLink(email)

Generate a new session link.

```javascript
const sessionData = await app.generateSessionLink('user@example.com');
// Returns session object with token and API code
```

##### activateSession(email, sessionToken)

Activate an existing session.

```javascript
await app.activateSession('user@example.com', 'session_token_here');
// Sets app.currentUser and app.currentSession
```

##### sendPrompt()

Process user input and get AI response.

```javascript
// Sends prompt from #promptInput textarea
// Gets response from configured AI providers
await app.sendPrompt();
```

##### getAIResponse(prompt, temperature, maxTokens)

Get response from AI, with automatic fallback.

```javascript
const response = await app.getAIResponse(
  "What is AI?",
  0.7,           // temperature
  2000           // maxTokens
);
// Returns: { text: "response...", provider: "Groq" }
```

##### queryProvider(providerKey, prompt, temperature, maxTokens)

Query a specific provider.

```javascript
const response = await app.queryProvider(
  'groq',        // Provider key
  "Hello",
  0.7,
  2000
);
// Returns raw response text
```

##### testAllProviders()

Test all enabled providers.

```javascript
await app.testAllProviders();
// Updates provider.status for each provider
```

##### savePriorities()

Save provider priority settings.

```javascript
app.savePriorities();
// Stores in encrypted user data
```

##### logout()

Logout current user and return to auth screen.

```javascript
app.logout();
// Clears session, returns to login
```

### EncryptedDataStore

Client-side data encryption and storage.

#### Constructor

```javascript
const store = new EncryptedDataStore();
```

#### Methods

##### saveUserData(email, data)

Save encrypted user data.

```javascript
await store.saveUserData('user@example.com', {
  email: 'user@example.com',
  sessionToken: '...',
  settings: { temperature: 0.7 }
});
// Stores in localStorage and attempts GitHub Gist backup
```

##### getUserData(email, sessionToken)

Retrieve and decrypt user data.

```javascript
const userData = await store.getUserData(
  'user@example.com',
  'session_token'
);
// Returns decrypted data or null if not found/invalid token
```

##### encrypt(data, key)

Encrypt data using email-derived key.

```javascript
const encrypted = store.encrypt(
  JSON.stringify(data),
  'user@example.com'
);
// Returns base64-encoded encrypted data
```

##### decrypt(encrypted, key)

Decrypt previously encrypted data.

```javascript
const decrypted = store.decrypt(encrypted, 'user@example.com');
// Returns original string
```

## Provider API Specifications

### Groq

**Endpoint**: https://api.groq.com/openai/v1/chat/completions

**Model**: mixtral-8x7b-32768

**Request Format**:
```json
{
  "model": "mixtral-8x7b-32768",
  "messages": [
    { "role": "user", "content": "Your prompt" }
  ],
  "temperature": 0.7,
  "max_tokens": 2000
}
```

**Response Format**:
```json
{
  "choices": [
    {
      "message": {
        "content": "Response text"
      }
    }
  ]
}
```

**API Key**: Get from https://console.groq.com

### OpenAI

**Endpoint**: https://api.openai.com/v1/chat/completions

**Model**: gpt-3.5-turbo

**Request Format**:
```json
{
  "model": "gpt-3.5-turbo",
  "messages": [
    { "role": "user", "content": "Your prompt" }
  ],
  "temperature": 0.7,
  "max_tokens": 2000
}
```

**Response Format**: Same as Groq

**API Key**: Get from https://platform.openai.com

### Together AI

**Endpoint**: https://api.together.xyz/v1/chat/completions

**Model**: meta-llama/Llama-2-70b-chat-hf

**Request Format**:
```json
{
  "model": "meta-llama/Llama-2-70b-chat-hf",
  "messages": [
    { "role": "user", "content": "Your prompt" }
  ],
  "temperature": 0.7,
  "max_tokens": 2000
}
```

**Response Format**: Same as Groq

**API Key**: Get from https://www.together.ai

### Hugging Face

**Endpoint**: https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1

**Model**: mistralai/Mistral-7B-Instruct-v0.1

**Request Format**:
```json
{
  "inputs": "Your prompt"
}
```

**Response Format**:
```json
[
  {
    "generated_text": "Response text"
  }
]
```

**API Key**: Get from https://huggingface.co/settings/tokens

### Local Ollama

**Endpoint**: http://localhost:11434/api/chat

**Model**: neural-chat

**Request Format**:
```json
{
  "model": "neural-chat",
  "messages": [
    { "role": "user", "content": "Your prompt" }
  ],
  "temperature": 0.7
}
```

**Response Format**:
```json
{
  "message": {
    "content": "Response text"
  }
}
```

**Setup**: https://ollama.ai

## Configuration

### Provider Configuration Object

```javascript
{
  "groq": {
    "name": "Groq",
    "enabled": true,
    "priority": 1,
    "icon": "⚡",
    "endpoint": "https://api.groq.com/...",
    "model": "mixtral-8x7b-32768",
    "apiKey": "",
    "status": "active",    // 'active', 'error', 'unknown'
    "color": "#FF6B35"
  }
}
```

### Session Settings Object

```javascript
{
  "temperature": 0.7,      // 0-2.0
  "maxTokens": 2000,       // 100-4000
  "aiPriorities": {
    "groq": 1,
    "openai": 2,
    "togetherai": 3,
    "huggingface": 4,
    "ollama": 5
  },
  "groqApiKey": "",
  "openaiApiKey": "",
  "togetherapiKey": "",
  "huggingfaceToken": ""
}
```

## Message Format

### User Message

```javascript
{
  "type": "user",
  "content": "Your question",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### AI Message

```javascript
{
  "type": "ai",
  "content": "AI response",
  "provider": "Groq",
  "timestamp": "2024-01-01T12:00:00Z",
  "responseTime": 324  // milliseconds
}
```

### System Message

```javascript
{
  "type": "system",
  "content": "System notification",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Error Message

```javascript
{
  "type": "error",
  "content": "Error description",
  "provider": "OpenAI",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## Action Logging

All user actions are logged with timestamps.

### Log Entry Format

```javascript
{
  "type": "action",     // 'action', 'error', 'system'
  "message": "Description",
  "timestamp": "2024-01-01T12:00:00Z",
  "user": "user@example.com",
  "metadata": {
    "provider": "Groq",
    "responseTime": 324,
    "tokens": 150
  }
}
```

### Logging Methods

```javascript
// Log action
app.log('action', 'User sent prompt', app.currentUser);

// Log error
app.log('error', 'API request failed', app.currentUser);

// Log system event
app.log('system', 'Provider switched to OpenAI', app.currentUser);
```

## Encryption Details

### Encryption Algorithm

**Current**: XOR-based (Demo Level)
```javascript
encrypt(data, key) {
  const keyHash = this.hashString(key);
  return btoa(String.fromCharCode(...data.split('').map((c, i) => 
    c.charCodeAt(0) ^ keyHash.charCodeAt(i % keyHash.length)
  )));
}
```

**Recommended for Production**: AES-256 using:
- TweetNaCl.js
- libsodium.js
- crypto-js

### Key Derivation

Email → Hash → Encryption Key

```javascript
hashString(str) {
  let hash = '';
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash += String.fromCharCode(((char * 31 + i) % 256));
  }
  return hash;
}
```

## Error Handling

### Common Errors

```javascript
// Missing API Key
Error: "Groq requires API key"

// Invalid Session
Error: "Session not found or expired"

// Provider Timeout
Error: "Request timeout"

// Network Error
Error: "Network request failed"

// All Providers Failed
Error: "No providers available"
```

### Error Recovery

The application automatically:
1. Catches provider errors
2. Logs the error
3. Tries next provider in priority order
4. Displays user-friendly error message
5. Suggests retry or manual provider selection

## Rate Limiting

No built-in rate limiting in demo. Recommendations for production:

```javascript
class RateLimiter {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }
  
  isAllowed() {
    const now = Date.now();
    this.requests = this.requests.filter(t => now - t < this.windowMs);
    
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }
}
```

## Security Recommendations

### 1. API Key Management
- Never hardcode API keys
- Store in environment variables
- Use separate keys per environment
- Rotate keys regularly

### 2. HTTPS Only
- Enforce HTTPS in production
- Use HSTS headers
- Disable HTTP fallback

### 3. Content Security Policy

```html
<meta http-equiv="Content-Security-Policy" 
  content="default-src 'self' https: data: 'unsafe-inline'; 
    frame-ancestors 'self'; script-src 'self' https://cdn.tailwindcss.com">
```

### 4. CORS Headers

```javascript
// Server-side (if using a backend proxy)
Access-Control-Allow-Origin: https://yourdomain.com
Access-Control-Allow-Methods: POST, GET
Access-Control-Allow-Headers: Content-Type, Authorization
```

## Examples

### Example 1: Basic Query

```javascript
// Get response from best available provider
const response = await app.getAIResponse(
  "What is the meaning of life?",
  0.7,      // temperature
  1500      // max tokens
);

console.log(`${response.provider}: ${response.text}`);
```

### Example 2: Specific Provider Query

```javascript
// Use only Groq
try {
  const response = await app.queryProvider(
    'groq',
    "Hello, world!",
    0.5,
    1000
  );
  console.log(response);
} catch (error) {
  console.error('Groq failed:', error);
}
```

### Example 3: Session Management

```javascript
// Generate session link
const session = await app.generateSessionLink('user@example.com');
console.log('Share this link:', session.sessionToken);

// Later: activate session
await app.activateSession('user@example.com', session.sessionToken);
console.log('Logged in as:', app.currentUser);
```

### Example 4: Provider Testing

```javascript
// Test all providers
await app.testAllProviders();

// Check which ones are working
Object.entries(app.providers).forEach(([key, provider]) => {
  console.log(`${provider.name}: ${provider.status}`);
});
```

## Integration Guide

### Embed in Your App

```html
<!-- In your HTML -->
<iframe src="https://peaceful-llm.your-domain.com" 
  width="800" height="600"></iframe>

<!-- Or use as API -->
<script src="path/to/app.js"></script>
<script>
  const proxy = new PeacefulLLMProxy();
  // Use proxy.getAIResponse() for queries
</script>
```

### REST API Proxy (Optional Backend)

```javascript
// backend/server.js
app.post('/api/chat', async (req, res) => {
  const { prompt, provider } = req.body;
  const response = await queryProvider(provider, prompt);
  res.json({ response });
});
```

---

**For more information, see README.md and DEPLOYMENT.md**